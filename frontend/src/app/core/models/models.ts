/** Tipos compartidos del aplicativo GADMI-Sost-Empresarial (prototipo). */

export type ModuleId = 1 | 2 | 3 | 4;

export interface ExerciseMeta {
  /** Identificador estable (se guarda en Firestore como `ejercicioId`). */
  id: string;
  module: ModuleId;
  /** Código del documento base: 1.1, 1.3, 2.1… */
  code: string;
  title: string;
  /** Ruta relativa dentro del módulo. */
  route: string;
  /** Puntos de efecto (PE) máximos según el documento. */
  maxPoints: number;
  fundamento: string;
  interaccion: string;
  consigna: string;
}

export interface OmittedExercise {
  code: string;
  title: string;
  points: number;
  reason: string;
}

export interface ModuleMeta {
  id: ModuleId;
  phase: string;
  /** Año de la temporada (cada módulo es un año: 2027 a 2030). */
  year: number;
  title: string;
  /** Encargo de la junta (escena corta de introducción). */
  intro: { character: string; text: string; scene: string; goal: string };
  objective: string;
  exercises: ExerciseMeta[];
  omitted: OmittedExercise[];
  reflections: string[];
  closingMessage: string;
}

export interface FeedbackItem {
  label: string;
  ok: boolean;
  /** Pista que se muestra tras el primer intento (no revela la respuesta). */
  hint?: string;
  /** Explicación completa que se muestra al cerrar el ejercicio. */
  explanation?: string;
}

export interface EvalResult {
  points: number;
  max: number;
  items: FeedbackItem[];
  summary?: string;
  /** Banderas que alimentan insignias (p. ej. detección de greenwashing). */
  flags?: Record<string, boolean>;
}

export interface Attempt {
  number: number;
  points: number;
  max: number;
  /** Nota en escala 1–5. */
  grade: number;
  answers: unknown;
  items: FeedbackItem[];
  summary?: string;
  flags?: Record<string, boolean>;
  date: string;
}

export interface Preferences {
  subtitulos: boolean;
  voz: boolean;
  textoGrande: boolean;
  altoContraste: boolean;
  menosMovimiento: boolean;
}

export interface Student {
  id?: number;
  nombre: string;
  codigo: string;
  correo: string;
  grupo: string;
  /** Fecha ISO de aceptación del aviso de privacidad (pantalla «Primera vez»). */
  aceptaPrivacidad: string | null;
  /** Fecha ISO en que firmó la carta de la junta. */
  cartaFirmada?: string | null;
  /** Fecha ISO en que vio (o saltó) el recorrido guiado de la Ruta. */
  tourVisto?: string | null;
  preferencias?: Preferences | null;
}

export interface Teacher {
  id: number;
  nombre: string;
  correo: string;
}

export type Session =
  | { rol: 'estudiante'; token: string | null; estudiante: Student; offline?: boolean }
  | { rol: 'docente'; token: string; docente: Teacher };

export interface AppState {
  /** Código del estudiante dueño de este progreso local. */
  owner: string | null;
  attempts: Record<string, Attempt[]>;
  reflections: Record<number, string[]>;
  /** Módulos cuya temporada ya se simuló (cierre visto). */
  seasons: number[];
}
