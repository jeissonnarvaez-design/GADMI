import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { MAX_ATTEMPTS, SEQUENTIAL_MODULES, STORAGE_KEY } from '../config';
import { ALL_EXERCISES, MODULES } from '../data/modules';
import { AppState, Attempt, EvalResult, ExerciseMeta } from '../models/models';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { computeBadges } from './badges';
import { levelFor, moduleTier, toGrade } from './grading';

const EMPTY: AppState = { owner: null, attempts: {}, reflections: {}, seasons: [] };

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

/**
 * Recorrido del estudiante: intentos, mejor puntaje, bitácoras y temporadas.
 * Reglas del documento: dos intentos, cuenta el mejor, los puntos nunca bajan.
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private state = signal<AppState>(load());

  readonly student = this.auth.student;
  readonly apiOnline = this.api.online;

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
      } catch {
        /* sin almacenamiento: se continúa en memoria */
      }
    });
    // Si cambia el estudiante, el progreso local se reinicia y se trae el del servidor.
    // Solo depende del código y del token (no del estado), para no entrar en bucle.
    const codigo = computed(() => this.auth.student()?.codigo ?? null);
    effect(() => {
      const c = codigo();
      const token = this.auth.token();
      if (!c) return;
      untracked(() => {
        if (this.state().owner !== c) this.state.set({ ...EMPTY, owner: c });
        if (token) this.syncFromServer();
      });
    });
    this.api.health().subscribe();
  }

  private online() {
    return !!this.auth.token() && !this.auth.offline();
  }

  syncFromServer() {
    this.api.getProgress().subscribe((p) => {
      if (!p) return;
      const serverCount = Object.values(p.attempts).flat().length;
      const localCount = Object.values(this.state().attempts).flat().length;
      if (serverCount >= localCount) {
        this.state.update((s) => ({ ...s, attempts: p.attempts, reflections: { ...s.reflections, ...p.reflections } }));
      }
      // La temporada se abre al guardar la bitácora: si ya está en el servidor, ese año quedó cerrado
      // (así la Ruta muestra el año correcto en cualquier equipo).
      const closed = this.moduleStats().filter((st) => st.done && this.isReflectionComplete(st.module.id)).map((st) => st.module.id);
      if (closed.some((m) => !this.seasonDone(m))) this.state.update((s) => ({ ...s, seasons: [...new Set([...s.seasons, ...closed])] }));
    });
  }

  clearLocal() {
    this.state.set(EMPTY);
  }

  // ---------- Intentos
  attempts(exerciseId: string): Attempt[] {
    return this.state().attempts[exerciseId] ?? [];
  }

  best(exerciseId: string): Attempt | undefined {
    return this.attempts(exerciseId).reduce<Attempt | undefined>((b, a) => (!b || a.points > b.points ? a : b), undefined);
  }

  lastAnswers<T>(exerciseId: string): T | undefined {
    return this.attempts(exerciseId).at(-1)?.answers as T | undefined;
  }

  isCompleted(exerciseId: string): boolean {
    return this.attempts(exerciseId).length > 0;
  }

  /** Bloqueado tras dos intentos o con puntaje completo. */
  isLocked(exerciseId: string): boolean {
    const best = this.best(exerciseId);
    return this.attempts(exerciseId).length >= MAX_ATTEMPTS || (!!best && best.points >= best.max);
  }

  submit(ex: ExerciseMeta, result: EvalResult, answers: unknown): Attempt | undefined {
    if (this.isLocked(ex.id)) return undefined;
    const points = Math.max(0, Math.min(result.points, result.max));
    const attempt: Attempt = {
      number: this.attempts(ex.id).length + 1,
      points,
      max: result.max,
      grade: toGrade(points, result.max),
      answers: structuredClone(answers),
      items: result.items,
      summary: result.summary,
      flags: result.flags,
      date: new Date().toISOString(),
    };
    this.state.update((s) => ({ ...s, attempts: { ...s.attempts, [ex.id]: [...(s.attempts[ex.id] ?? []), attempt] } }));
    if (this.online()) {
      this.api.saveAttempt(ex.id, ex.module, attempt).subscribe();
      this.api.saveBadges(this.earnedBadgeIds()).subscribe();
    }
    return attempt;
  }

  /** Solo para probar el prototipo: borra los intentos de un reto (localmente). */
  resetExercise(exerciseId: string) {
    this.state.update((s) => {
      const attempts = { ...s.attempts };
      delete attempts[exerciseId];
      return { ...s, attempts };
    });
  }

  // ---------- Bitácoras
  reflection(moduleId: number): string[] {
    return this.state().reflections[moduleId] ?? ['', '', ''];
  }

  saveReflection(moduleId: number, answers: string[]) {
    this.state.update((s) => ({ ...s, reflections: { ...s.reflections, [moduleId]: answers } }));
    if (this.online()) this.api.saveReflection(moduleId, answers).subscribe();
  }

  isReflectionComplete(moduleId: number): boolean {
    return this.reflection(moduleId).every((r) => r.trim().length >= 10);
  }

  // ---------- Temporadas
  seasonDone(moduleId: number): boolean {
    return this.state().seasons.includes(moduleId);
  }

  markSeason(moduleId: number) {
    this.state.update((s) => (s.seasons.includes(moduleId) ? s : { ...s, seasons: [...s.seasons, moduleId] }));
  }

  // ---------- Agregados
  readonly moduleStats = computed(() => {
    this.state();
    return MODULES.map((m) => {
      const max = m.exercises.reduce((sum, e) => sum + e.maxPoints, 0);
      const points = m.exercises.reduce((sum, e) => sum + (this.best(e.id)?.points ?? 0), 0);
      const completed = m.exercises.filter((e) => this.isCompleted(e.id)).length;
      return {
        module: m,
        points,
        max,
        grade: toGrade(points, max),
        completed,
        total: m.exercises.length,
        tier: moduleTier(points, max),
        done: completed === m.exercises.length,
        firstTry: m.exercises.every((e) => this.attempts(e.id).length === 1),
      };
    });
  });

  readonly overall = computed(() => {
    const stats = this.moduleStats();
    const points = stats.reduce((s, m) => s + m.points, 0);
    const max = stats.reduce((s, m) => s + m.max, 0);
    const grade = toGrade(points, max);
    const completed = stats.reduce((s, m) => s + m.completed, 0);
    return { points, max, grade, level: levelFor(grade), completed, total: ALL_EXERCISES.length };
  });

  moduleStat(moduleId: number) {
    return this.moduleStats().find((s) => s.module.id === moduleId)!;
  }

  /** Un módulo se abre cuando se terminan los retos del anterior (si el orden es obligatorio). */
  isModuleOpen(moduleId: number): boolean {
    if (!SEQUENTIAL_MODULES || moduleId <= 1) return true;
    return this.moduleStat(moduleId - 1).done;
  }

  /** Módulo en curso (para «Continuar donde quedaste»). */
  readonly currentModule = computed(() => this.moduleStats().find((s) => !s.done || !this.seasonDone(s.module.id))?.module ?? MODULES[3]);

  readonly allDone = computed(() => this.moduleStats().every((s) => s.done));

  ratio(exerciseId: string): number {
    const b = this.best(exerciseId);
    return b ? b.points / b.max : 0;
  }

  flag(exerciseId: string, name: string): boolean {
    return !!this.best(exerciseId)?.flags?.[name];
  }

  readonly badges = computed(() => computeBadges(this));

  earnedBadgeIds(): string[] {
    return computeBadges(this)
      .filter((b) => b.earned)
      .map((b) => b.id);
  }
}
