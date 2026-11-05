// Misma escala que el frontend: 1 (mínimo) · 3 (aprobatorio) · 5 (máximo).
export function toGrade(points, max) {
  if (!max) return 1;
  const r = Math.min(Math.max(points / max, 0), 1);
  return Math.round((1 + 4 * r) * 10) / 10;
}
