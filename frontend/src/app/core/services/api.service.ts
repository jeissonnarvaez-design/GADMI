import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { API_URL } from '../config';
import { Attempt, Preferences, Student, Teacher } from '../models/models';

export interface ServerProgress {
  attempts: Record<string, Attempt[]>;
  reflections: Record<number, string[]>;
}

export interface CourseRow {
  id: number;
  nombre: string;
  codigo: string;
  correo: string;
  grupo: string;
  modulos: { moduloId: number; puntos: number; max: number; completados: number; ejercicios: number; nota: number | null }[];
  puntos: number;
  puntosMax: number;
  nota: number | null;
  bitacoras: number;
  bitacoraEstado: 'Pendiente' | 'Revisar' | 'Revisada';
  certificado: { codigo: string; estado: 'valido' | 'anulado' } | null;
}

export interface CourseSummary {
  estudiantes: number;
  activos: number;
  promedio: number;
  certificados: number;
  bitacorasPorRevisar: number;
  dificiles: { codigo: string; titulo: string; pct: number }[];
}

/** Certificado del estudiante (se emite una sola vez, al completar el módulo 4). */
export interface Certificate {
  codigo: string;
  periodo: string;
  grupo: string;
  fechaEmision: string;
  puntaje: number;
  max: number;
  nota: number;
  nivel: string;
  estado: 'valido' | 'anulado';
}

/** Lo que muestra la verificación pública: nunca documento ni correo. */
export interface PublicCertificate {
  codigo: string;
  estudiante: string;
  periodo: string;
  grupo: string;
  nivel: string;
  puntos: number;
  max: number;
  fecha: string;
  estado: 'valido' | 'anulado';
  fechaAnulacion: string | null;
}

/** Mensaje de la junta («!» de la Ruta). */
export interface BoardMessage {
  id: string;
  anio: number;
  titulo: string;
  texto: string;
}

export interface BitacoraRow {
  estudianteId?: number;
  nombre?: string;
  codigo?: string;
  grupo?: string;
  moduloId: number;
  respuestas: string[];
  calificacion: number | null;
  comentario: string | null;
  revisada?: boolean;
}

export interface StudentDetail {
  estudiante: Student;
  progreso: ServerProgress;
  decisiones: { ejercicioId: string; opcion: unknown; fecha: string }[];
  bitacoras: BitacoraRow[];
}

/** Código de certificado escrito por una persona → mayúsculas y sin espacios. */
export const normalizarCodigo = (c: string) => String(c ?? '').toUpperCase().replace(/\s+/g, '');

/** Mensaje legible de un error HTTP. `status 0` = API no disponible. */
export function apiError(e: unknown): { offline: boolean; message: string } {
  if (e instanceof HttpErrorResponse) {
    if (e.status === 0) return { offline: true, message: 'No hay conexión con el servidor (API).' };
    return { offline: false, message: e.error?.error ?? `Error ${e.status}` };
  }
  return { offline: false, message: 'Error inesperado.' };
}

/**
 * Cliente HTTP del backend. El token de sesión lo agrega `authInterceptor`.
 * Las escrituras del estudiante son «silenciosas»: si fallan, el progreso
 * sigue en localStorage y `online` pasa a false para avisar en pantalla.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  readonly online = signal<boolean | null>(null);

  private quiet<T>(obs: Observable<T>): Observable<T | null> {
    return obs.pipe(
      tap(() => this.online.set(true)),
      catchError(() => {
        this.online.set(false);
        return of(null);
      }),
    );
  }

  private loud<T>(obs: Observable<T>): Observable<T> {
    return obs.pipe(
      tap(() => this.online.set(true)),
      catchError((e) => {
        if (e instanceof HttpErrorResponse && e.status === 0) this.online.set(false);
        return throwError(() => e);
      }),
    );
  }

  health() {
    return this.quiet(this.http.get<{ ok: boolean }>(`${API_URL}/health`));
  }

  // ---------- Ingreso
  loginDocente(correo: string, password: string) {
    return this.loud(this.http.post<{ token: string; docente: Teacher }>(`${API_URL}/auth/docente/login`, { correo, password }));
  }
  loginEstudiante(correo: string, password: string) {
    return this.loud(this.http.post<{ token: string; estudiante: Student }>(`${API_URL}/auth/estudiante/login`, { correo, password }));
  }

  // ---------- Estudiante
  saveOnboarding(data: { aceptaPrivacidad?: string; avisoVersion?: string; preferencias?: Preferences; cartaFirmada?: string; tourVisto?: string }) {
    return this.quiet(this.http.put(`${API_URL}/estudiante/onboarding`, data));
  }
  /** Dictado: audio grabado (base64) → texto con Gemini en el servidor. */
  transcribir(audio: string, tipo: string) {
    return this.loud(this.http.post<{ texto: string }>(`${API_URL}/voz/transcribir`, { audio, tipo }));
  }
  /** PROVISIONAL: borra todo el avance del estudiante en el servidor. */
  resetProgress() {
    return this.loud(this.http.delete<{ ok: boolean }>(`${API_URL}/estudiante/progreso`));
  }
  getProgress() {
    return this.quiet(this.http.get<ServerProgress>(`${API_URL}/estudiante/progreso`));
  }
  saveAttempt(exerciseId: string, moduleId: number, attempt: Attempt) {
    return this.quiet(
      this.http.post(`${API_URL}/estudiante/intentos`, {
        ejercicioId: exerciseId,
        moduloId: moduleId,
        numeroIntento: attempt.number,
        respuestas: attempt.answers,
        retroalimentacion: { items: attempt.items, summary: attempt.summary, flags: attempt.flags ?? {} },
        puntaje: attempt.points,
        puntajeMax: attempt.max,
      }),
    );
  }
  saveReflection(moduleId: number, answers: string[]) {
    return this.quiet(this.http.put(`${API_URL}/estudiante/bitacoras`, { moduloId: moduleId, respuestas: answers }));
  }
  saveBadges(badges: string[]) {
    return this.quiet(this.http.put(`${API_URL}/estudiante/insignias`, { insignias: badges }));
  }

  cambiarNombre(nombre: string) {
    return this.loud(this.http.put<{ ok: boolean; nombre: string }>(`${API_URL}/estudiante/nombre`, { nombre }));
  }
  mensajes() {
    return this.quiet(this.http.get<BoardMessage[]>(`${API_URL}/estudiante/mensajes`));
  }

  certificado() {
    return this.loud(this.http.post<Certificate>(`${API_URL}/estudiante/certificado`, {}));
  }
  verificar(codigo: string) {
    return this.loud(this.http.get<PublicCertificate>(`${API_URL}/certificados/${encodeURIComponent(normalizarCodigo(codigo))}`));
  }
  anularCertificado(codigo: string) {
    return this.loud(this.http.patch<{ ok: boolean }>(`${API_URL}/certificados/${encodeURIComponent(normalizarCodigo(codigo))}`, { estado: 'anulado' }));
  }

  // ---------- Docente
  resumen(grupo?: string) {
    return this.loud(this.http.get<CourseSummary>(`${API_URL}/docente/resumen`, { params: grupo ? { grupo } : {} }));
  }
  grupos() {
    return this.loud(this.http.get<{ grupo: string; periodo: string; estudiantes: number }[]>(`${API_URL}/docente/grupos`));
  }
  curso(grupo?: string) {
    return this.loud(this.http.get<CourseRow[]>(`${API_URL}/docente/estudiantes`, { params: grupo ? { grupo } : {} }));
  }
  detalleEstudiante(id: number) {
    return this.loud(this.http.get<StudentDetail>(`${API_URL}/docente/estudiantes/${id}`));
  }
  bitacoras(filters: { grupo?: string; modulo?: number }) {
    const params: Record<string, string> = {};
    if (filters.grupo) params['grupo'] = filters.grupo;
    if (filters.modulo) params['modulo'] = String(filters.modulo);
    return this.loud(this.http.get<BitacoraRow[]>(`${API_URL}/docente/bitacoras`, { params }));
  }
  calificarBitacora(estudianteId: number, moduloId: number, calificacion: number | null, comentario: string) {
    return this.loud(this.http.put(`${API_URL}/docente/bitacoras/${estudianteId}/${moduloId}`, { calificacion, comentario }));
  }
  exportCsv(grupo?: string) {
    return this.loud(this.http.get(`${API_URL}/docente/export.csv`, { params: grupo ? { grupo } : {}, responseType: 'blob' }));
  }
}
