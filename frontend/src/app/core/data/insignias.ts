/** Cómo se gana cada insignia (texto corto del diseño) e ícono SVG (path de 24 × 24). */
export const STAR = 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z';
export const INSIGNIA_UI: Record<string, [string, string]> = {
  'brujula-clara': ['Módulo 1 con 200 o más granos.', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z'],
  'arquitectura-verde': ['Módulo 2 con el 80 % o más de sus granos.', 'M3 21V11l5-3v3l5-3v3l5-3v13zM3 21h18'],
  'liderazgo-proposito': ['Módulo 3 con el 80 % o más de sus granos.', STAR],
  'mirada-esg': ['Módulo 4 con el 80 % o más de sus granos.', 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z'],
  'detector-greenwashing': ['Detecta los casos de greenwashing.', 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5'],
  'presupuesto-equilibrio': ['Cumple el tope en 2.3 y las metas en 2.5.', 'M12 3v18M5 7h14M5 7l-3 7h6zM19 7l-3 7h6z'],
  'a-la-primera': ['80 % de un módulo sin segundos intentos.', 'M13 2L4 14h7l-1 8 9-12h-7z'],
  'mejora-continua': ['Sube 20 granos al reintentar un reto.', 'M4 17l6-6 4 4 6-8M14 7h6v6'],
  'hilo-conductor': ['Tus 4 objetivos llegan hasta el final.', 'M4 12c4-8 12 8 16 0'],
  'voz-propia': ['Completa las 4 bitácoras.', 'M4 5h16v11H8l-4 4z'],
  'recorrido-completo': ['Termina los 4 módulos.', STAR],
};
