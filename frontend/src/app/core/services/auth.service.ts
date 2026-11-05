import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { SESSION_KEY } from '../config';
import { Session, Student } from '../models/models';

function load(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Sesión activa: docente o estudiante (dos ingresos separados). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = signal<Session | null>(load());
  readonly rol = computed(() => this.session()?.rol ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly student = computed(() => {
    const s = this.session();
    return s?.rol === 'estudiante' ? s.estudiante : null;
  });
  readonly teacher = computed(() => {
    const s = this.session();
    return s?.rol === 'docente' ? s.docente : null;
  });
  readonly offline = computed(() => {
    const s = this.session();
    return s?.rol === 'estudiante' && !!s.offline;
  });

  constructor() {
    effect(() => {
      const s = this.session();
      try {
        if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
        else localStorage.removeItem(SESSION_KEY);
      } catch {
        /* sin almacenamiento */
      }
    });
  }

  set(s: Session) {
    this.session.set(s);
  }

  updateStudent(patch: Partial<Student>) {
    this.session.update((s) => (s?.rol === 'estudiante' ? { ...s, estudiante: { ...s.estudiante, ...patch } } : s));
  }

  logout() {
    this.session.set(null);
  }
}
