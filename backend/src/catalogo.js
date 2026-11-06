// Catálogo de módulos y retos (antes tablas «modulo» y «ejercicio» de MySQL).
export const MODULOS = [
  { id: 1, fase: 'Planeación', anio: 2027, titulo: 'Estrategia & Direccionamiento' },
  { id: 2, fase: 'Organización', anio: 2028, titulo: 'Estructura, Procesos & Cadena de Valor Verde' },
  { id: 3, fase: 'Dirección', anio: 2029, titulo: 'Liderazgo organizacional-socioambiental & Toma de decisiones' },
  { id: 4, fase: 'Control (Evaluación)', anio: 2030, titulo: 'Control bajo principios de sostenibilidad & Mejora continua' },
];

/** incluido = false: reto del documento que no está en el prototipo (no cuenta para la nota). */
export const EJERCICIOS = [
  { id: 'm1-brujula', modulo: 1, codigo: '1.1', titulo: 'Brújula estratégica', puntosMax: 60, incluido: true },
  { id: 'm1-valores', modulo: 1, codigo: '1.2', titulo: 'Valores que dejan huella', puntosMax: 50, incluido: true },
  { id: 'm1-foda', modulo: 1, codigo: '1.3', titulo: 'Análisis de entornos (FODA)', puntosMax: 80, incluido: true },
  { id: 'm1-metas', modulo: 1, codigo: '1.4', titulo: 'Metas e indicadores (KPI)', puntosMax: 60, incluido: true },
  { id: 'm2-organigrama', modulo: 2, codigo: '2.1', titulo: 'Organigrama', puntosMax: 70, incluido: true },
  { id: 'm2-funciones', modulo: 2, codigo: '2.2', titulo: 'Funciones', puntosMax: 40, incluido: true },
  { id: 'm2-presupuesto-th', modulo: 2, codigo: '2.3', titulo: 'Presupuesto de talento humano', puntosMax: 40, incluido: true },
  { id: 'm2-stakeholders', modulo: 2, codigo: '2.4', titulo: 'Grupos de interés', puntosMax: 50, incluido: true },
  { id: 'm2-presupuesto-verde', modulo: 2, codigo: '2.5', titulo: 'Presupuesto verde', puntosMax: 50, incluido: true },
  { id: 'm3-dilemas', modulo: 3, codigo: '3.1', titulo: 'Dilemas', puntosMax: 80, incluido: true },
  { id: 'm3-crisis', modulo: 3, codigo: '3.2', titulo: 'Liderar en crisis', puntosMax: 90, incluido: true },
  { id: 'm3-comunicacion', modulo: 3, codigo: '3.3', titulo: 'Comunicación', puntosMax: 30, incluido: true },
  { id: 'm3-tablero-clima', modulo: 3, codigo: '3.4', titulo: 'Tablero de clima', puntosMax: 50, incluido: true },
  { id: 'm4-tablero-esg', modulo: 4, codigo: '4.1', titulo: 'Tablero ESG', puntosMax: 70, incluido: true },
  { id: 'm4-cuellos-botella', modulo: 4, codigo: '4.2', titulo: 'Cuellos de botella', puntosMax: 60, incluido: true },
  { id: 'm4-plan-accion', modulo: 4, codigo: '4.3', titulo: 'Plan de acción', puntosMax: 60, incluido: true },
  { id: 'm4-cerrar-circulo', modulo: 4, codigo: '4.4', titulo: 'Cerrar el círculo', puntosMax: 60, incluido: true },
];

export const INCLUIDOS = EJERCICIOS.filter((e) => e.incluido);
export const ejercicio = (id) => EJERCICIOS.find((e) => e.id === id);
export const maxModulo = (m) => INCLUIDOS.filter((e) => e.modulo === m).reduce((s, e) => s + e.puntosMax, 0);
export const MAX_TOTAL = INCLUIDOS.reduce((s, e) => s + e.puntosMax, 0);
