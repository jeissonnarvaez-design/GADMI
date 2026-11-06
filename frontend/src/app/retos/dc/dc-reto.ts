import { computed, effect, inject, signal, untracked } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { afterExercise, getExercise } from '../../core/data/modules';
import { EvalResult, FeedbackItem } from '../../core/models/models';
import { ProgressService } from '../../core/services/progress.service';
import { SpeechService } from '../../core/services/speech.service';

/* eslint-disable @typescript-eslint/no-explicit-any */

const PASO_KEY = 'gadmi-sost-empresarial:paso:';

/**
 * Base de los retos rediseñados (plantillas de los .dc.html):
 * - `state` / `setState` / `renderVals()` igual que en el prototipo; la plantilla lee `v()`.
 * - Guardado por paso: `guardarPaso(n)` guarda el estado al terminar cada paso; al volver
 *   se retoma desde ahí. Los granos cuentan al terminar el reto (`registrar`).
 * - Si el reto ya se jugó, se muestra el cierre con el resultado guardado.
 */
export abstract class DcReto<S extends Record<string, any> = Record<string, any>> {
  protected progress = inject(ProgressService);
  protected voice = inject(SpeechService);
  private auth = inject(AuthService);
  abstract readonly ejercicioId: string;
  /**
   * Retos generados del diseño final (2.1–4.4): al terminar (`v().done`) se registran solos
   * con `v().score` y la insignia `v().badge`; mientras se juega, el avance se guarda por paso.
   */
  protected autoRegistro = false;
  private inicial: string | null = null;

  constructor() {
    effect(() => {
      const vals = this.v();
      if (!this.autoRegistro) return;
      untracked(() => this.autoTick(vals));
    });
  }

  private autoTick(vals: any) {
    const actual = JSON.stringify(this.state);
    if (this.inicial === null) {
      this.inicial = actual;
      return;
    }
    if (vals?.done) {
      const pts = Math.max(0, Math.round(Number(vals.score) || 0));
      const antes = this.progress.best(this.ejercicioId)?.points;
      // Se registra al terminar; si el reto permite reintentar y mejora, cuenta el mejor.
      if (antes == null || pts > antes) {
        const max = this.meta().maxPoints;
        this.registrar(pts, [], {}, `Ganaste ${pts} de ${max} granos.`, { aLaPrimera: !!vals.badge, segundoIntento: (this.state as any).att === 2 }, true);
      }
      return;
    }
    if (actual !== this.inicial && !this.yaRegistrado()) this.guardarPaso(this.pasoActual());
  }

  /** Paso en curso: parte (A, B, C…), ronda o escenario; 1 si el reto es de un solo paso. */
  protected pasoActual(): number {
    const st = this.state as any;
    if (typeof st.part === 'string' && /^[A-Z]$/.test(st.part)) return st.part.charCodeAt(0) - 64;
    for (const k of ['round', 'sc', 'step', 'paso']) if (typeof st[k] === 'number') return st[k] + 1;
    return 1;
  }

  private _s = signal<S>({} as S);
  get state(): S {
    return this._s();
  }
  set state(v: S) {
    this._s.set(v);
  }
  setState(p: Partial<S>) {
    this._s.update((s) => ({ ...s, ...p }));
  }
  abstract renderVals(): any;
  /** Valores para la plantilla (equivale a renderVals del prototipo). */
  v = computed<any>(() => {
    this._s();
    return this.renderVals();
  });

  meta = computed(() => getExercise(this.ejercicioId));
  after = computed(() => afterExercise(this.ejercicioId));
  /** Paso guardado (para el aviso del mini mapa). 0 = ninguno. */
  pasoGuardado = signal(0);

  private key() {
    return PASO_KEY + (this.auth.student()?.codigo ?? 'local') + ':' + this.ejercicioId;
  }

  /** Restaura: si ya terminó, el estado final guardado; si no, el último paso guardado. */
  protected restaurar(): boolean {
    const intento = this.progress.attempts(this.ejercicioId).at(-1);
    const fin = (intento?.answers as any)?.estado;
    if (fin) {
      this.state = { ...this.state, ...fin };
      return true;
    }
    try {
      const raw = localStorage.getItem(this.key());
      if (raw) {
        const { paso, estado } = JSON.parse(raw);
        this.state = { ...this.state, ...estado };
        this.pasoGuardado.set(paso ?? 0);
        return true;
      }
    } catch {
      /* sin almacenamiento local */
    }
    return false;
  }

  /** Guarda el avance al terminar el paso n. */
  protected guardarPaso(paso: number) {
    this.pasoGuardado.set(paso);
    try {
      localStorage.setItem(this.key(), JSON.stringify({ paso, estado: this.state }));
    } catch {
      /* sin almacenamiento local */
    }
  }

  /** Mensaje del mini mapa si hay avance sin terminar. */
  salida = computed(() => {
    this._s();
    if (this.yaRegistrado()) return null;
    const n = this.pasoGuardado();
    return n > 0 ? `Tu avance hasta el paso ${n} está guardado. ¿Volver al mapa?` : null;
  });

  yaRegistrado = computed(() => (this.progress.moduleStats(), this.progress.attempts(this.ejercicioId).length > 0));

  /** Registra el resultado del reto (una sola vez): los granos cuentan al terminar. */
  protected registrar(points: number, items: FeedbackItem[], answers: Record<string, unknown>, summary: string, flags: Record<string, boolean> = {}, mejora = false) {
    if (this.yaRegistrado() && !mejora) return;
    const meta = this.meta();
    const result: EvalResult = { points: Math.max(0, points), max: meta.maxPoints, items, summary, flags };
    this.progress.submit(meta, result, { ...answers, estado: this.state });
    try {
      localStorage.removeItem(this.key());
    } catch {
      /* sin almacenamiento local */
    }
    this.pasoGuardado.set(0);
  }

  speak(text: string) {
    this.voice.speak(text, 'teo');
  }
}
