/**
 * Escala de evaluación del prototipo: 1 a 5.
 *  - 1 es la nota más baja.
 *  - 3 es la nota mínima aprobatoria.
 *  - 5 es la nota máxima.
 * Los puntos de efecto (PE) del documento se conservan y se convierten
 * linealmente: nota = 1 + 4 × (PE obtenidos / PE posibles).
 */
export const MIN_GRADE = 1;
export const PASS_GRADE = 3;
export const MAX_GRADE = 5;

export function toGrade(points: number, max: number): number {
  if (max <= 0) return MIN_GRADE;
  const ratio = Math.min(Math.max(points / max, 0), 1);
  return Math.round((MIN_GRADE + (MAX_GRADE - MIN_GRADE) * ratio) * 10) / 10;
}

export function isPassing(grade: number): boolean {
  return grade >= PASS_GRADE;
}

/**
 * Niveles de credencial del documento (0–499, 500–699, 700–849, 850–1000 PE),
 * llevados proporcionalmente a la escala 1–5.
 */
export interface Level {
  name: string;
  from: number;
  description: string;
}

export const LEVELS: Level[] = [
  { name: 'Explorador/a sostenible', from: 1, description: 'Recorrió la aplicación y conoce el vocabulario básico.' },
  { name: 'Gestor/a en formación', from: 3, description: 'Aplica las fases del proceso administrativo con criterio de sostenibilidad en la mayoría de las decisiones.' },
  { name: 'Gestor/a sostenible', from: 3.8, description: 'Toma decisiones coherentes entre fases y detecta riesgos éticos y ambientales.' },
  { name: 'Líder de impacto', from: 4.4, description: 'Integra las cuatro dimensiones, decide con datos y conecta sus decisiones de principio a fin.' },
];

export function levelFor(grade: number): Level {
  return [...LEVELS].reverse().find((l) => grade >= l.from) ?? LEVELS[0];
}

/** Tramos del medidor de módulo: en camino (<60 %), logrado (60–79 %), destacado (≥80 %). */
export function moduleTier(points: number, max: number): 'en camino' | 'logrado' | 'destacado' {
  const pct = max ? points / max : 0;
  if (pct >= 0.8) return 'destacado';
  if (pct >= 0.6) return 'logrado';
  return 'en camino';
}
