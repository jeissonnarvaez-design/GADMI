import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import { PREFS_KEY } from '../config';
import { Preferences } from '../models/models';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export const DEFAULT_PREFS: Preferences = { subtitulos: true, voz: false, textoGrande: false, altoContraste: false, menosMovimiento: false };

/**
 * Preferencias de accesibilidad globales: se aplican a toda la app
 * y se guardan por usuario (estudiante) en la base de datos.
 */
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private doc = inject(DOCUMENT);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  readonly prefs = signal<Preferences>(this.load());
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const p = this.prefs();
      const root = this.doc.documentElement;
      root.classList.toggle('texto-grande', p.textoGrande);
      root.classList.toggle('alto-contraste', p.altoContraste);
      root.classList.toggle('menos-movimiento', p.menosMovimiento);
      root.classList.toggle('sin-voz', !p.voz);
      root.classList.toggle('sin-subtitulos', !p.subtitulos);
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(p));
      } catch {
        /* sin almacenamiento */
      }
      untracked(() => this.persist(p));
    });
  }

  set<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    this.prefs.update((p) => ({ ...p, [key]: value }));
  }

  toggle(key: keyof Preferences) {
    this.prefs.update((p) => ({ ...p, [key]: !p[key] }));
  }

  replace(p: Preferences | null | undefined) {
    if (p) this.prefs.set({ ...DEFAULT_PREFS, ...p });
  }

  /** Guarda en MySQL (con una pequeña espera para agrupar cambios). */
  private persist(p: Preferences) {
    if (!this.auth.student() || !this.auth.token()) return;
    if (this.saveTimer) clearTimeout(this.saveTimer);
    const owner = this.auth.student()!.correo;
    this.saveTimer = setTimeout(() => {
      // La sesión pudo cambiar (p. ej. salió e ingresó un docente) mientras esperábamos.
      if (this.auth.student()?.correo !== owner || !this.auth.token()) return;
      this.auth.updateStudent({ preferencias: p });
      this.api.saveOnboarding({ preferencias: p }).subscribe();
    }, 600);
  }

  private load(): Preferences {
    try {
      const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS, menosMovimiento: reduce };
    } catch {
      return DEFAULT_PREFS;
    }
  }
}
