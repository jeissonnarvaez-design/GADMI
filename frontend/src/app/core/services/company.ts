import type { ProgressService } from './progress.service';

/**
 * Simulación de la empresa (versión simple para el prototipo):
 * los 4 medidores parten del diagnóstico 2026 y suben según los retos.
 * Sin «game over»: si un medidor cae bajo el umbral, la empresa entra en alerta.
 */
export type Dimension = 'ambiental' | 'social' | 'gobernanza' | 'economico';
export type Meters = Record<Dimension, number>;

export const DIMENSION_LABELS: Record<Dimension, string> = {
  ambiental: 'Ambiental',
  social: 'Social',
  gobernanza: 'Gobernanza',
  economico: 'Económico',
};

export const ALERT_THRESHOLD = 40;

/** Diagnóstico 2026: empresa en rojo. */
export const BASELINE: Meters = { ambiental: 30, social: 35, gobernanza: 30, economico: 45 };

/** Cuánto mueve cada reto a cada medidor (con el 100 % de sus puntos). */
const WEIGHTS: Record<string, Partial<Meters>> = {
  'm1-brujula': { gobernanza: 8, economico: 5 },
  'm1-valores': { social: 5, ambiental: 5 },
  'm1-foda': { economico: 8, ambiental: 4 },
  'm1-metas': { ambiental: 3, social: 3, gobernanza: 3, economico: 3 },
  'm2-organigrama': { gobernanza: 10 },
  'm2-funciones': { social: 5, gobernanza: 5 },
  'm2-presupuesto-verde': { ambiental: 20, social: 5, economico: 5 },
  'm3-dilemas': { social: 6, gobernanza: 6, ambiental: 4 },
  'm3-crisis': { social: 10, economico: 6 },
  'm3-comunicacion': { gobernanza: 4, social: 3 },
  'm4-tablero-esg': { gobernanza: 6 },
  'm4-cuellos-botella': { ambiental: 6, social: 4 },
  'm4-plan-accion': { ambiental: 6, social: 4, economico: 6, gobernanza: 4 },
};

/** Medidores al cierre del módulo indicado (0 = diagnóstico 2026). */
export function metersAt(p: ProgressService, upToModule: number): Meters {
  const m = { ...BASELINE };
  for (const [ex, w] of Object.entries(WEIGHTS)) {
    const mod = Number(ex.charAt(1));
    if (mod > upToModule) continue;
    const r = p.ratio(ex);
    for (const [dim, v] of Object.entries(w) as [Dimension, number][]) m[dim] += Math.round(r * v);
  }
  return m;
}

export interface MapLayer {
  label: string;
  on: boolean;
  /** Reto que activa la capa. */
  source: string;
}

export interface MapZone {
  id: string;
  name: string;
  layers: MapLayer[];
}

/** Escena viva por capas: lo que el estudiante decide aparece sobre el mapa. */
export function mapZones(p: ProgressService): MapZone[] {
  const verde = p.greenInvestments();
  const crisis = p.crisisAnswers();
  const foda = p.lastAnswers<{ strategy?: string }>('m1-foda');
  const pass = (id: string) => (p.best(id)?.grade ?? 0) >= 3;
  return [
    {
      id: 'finca',
      name: 'Finca (familias productoras)',
      layers: [
        { label: 'Familias capacitadas con meta medible', on: pass('m1-metas'), source: '1.4' },
        { label: 'Crece el bosque agroforestal', on: verde.includes('d'), source: '2.5' },
        { label: 'Contratos justos con precio mínimo', on: crisis['B'] === '1', source: '3.2' },
      ],
    },
    {
      id: 'planta',
      name: 'Planta (Cali)',
      layers: [
        { label: 'Se va el humo de las tostadoras antiguas', on: verde.includes('a') || verde.includes('b'), source: '2.5' },
        { label: 'Paneles solares', on: verde.includes('a'), source: '2.5' },
        { label: 'Sale el compost de la cascarilla', on: verde.includes('c'), source: '2.5' },
        { label: 'Plan contra la accidentalidad', on: pass('m4-plan-accion'), source: '4.3' },
      ],
    },
    {
      id: 'oficina',
      name: 'Oficina',
      layers: [
        { label: 'Se iza la bandera del rumbo', on: pass('m1-brujula'), source: '1.1' },
        { label: 'Organigrama con responsable de sostenibilidad', on: pass('m2-organigrama'), source: '2.1' },
        { label: 'Tablero ESG con datos', on: pass('m4-tablero-esg'), source: '4.1' },
      ],
    },
    {
      id: 'mercado',
      name: 'Mercado',
      layers: [
        { label: 'Ruta de exportación a Europa', on: foda?.strategy === 'a', source: '1.3' },
        { label: 'Greenwashing detectado', on: p.flag('m1-valores', 'greenwashing'), source: '1.2' },
        { label: 'Trazabilidad demostrada al cliente europeo', on: crisis['C'] === '1', source: '3.2' },
        { label: 'Comunicación honesta con la comunidad', on: pass('m3-comunicacion'), source: '3.3' },
      ],
    },
  ];
}
