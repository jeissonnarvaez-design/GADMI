/** Esquemas de los JSON de retos (una plantilla, muchos retos). */
import type { Who } from '../shared/personaje';

export interface FlagRule {
  part?: string;
  items?: string[];
  scenario?: string;
  not?: string;
}

interface Base {
  id: string;
  code: string;
  title: string;
  max: number;
  who?: Who;
  endTitles?: { perfect: string; first: string; second: string };
  flags?: Record<string, FlagRule>;
}

// ---- Plantilla 1 · clasificar tarjeta por tarjeta (1.1, 2.2, 3.1)
export interface TZone { id: string; label: string; sub?: string; icon: string; plain?: boolean }
export interface TCard { id: string; text: string; answer: string; accept?: string[]; points: number; explanation: string; hint?: string; group?: string }
export interface TRound { prompt?: string; zones: TZone[]; zoneHints?: Record<string, string>; defaultHint?: string; cards: TCard[] }
export interface TarjetasReto extends Base { template: 'tarjetas'; prompt: string; listen: string; compact?: boolean; rounds: TRound[] }

// ---- Plantilla 2 · clasificar por partes (1.2, 3.3, 4.1)
export interface POption { id: string; label: string; aria?: string }
export interface PItem { id: string; text: string; answer: string | null; accept?: string[]; points: number; icon?: string; explanation?: string; options?: POption[] }
export interface PChoicePart {
  key: string; type: 'choice'; layout: 'cards' | 'rows'; optionStyle?: 'circle' | 'stack';
  prompt: string; hint: string; options?: POption[]; optionFeedback?: Record<string, string>;
  brillo?: { item: string; answer: string; text: string };
  fromPart?: { part: string; answer: string };
  items: PItem[];
}
export interface PTextPart { key: string; type: 'text'; prompt: string; label: string; placeholder: string; help: string; points: number; minLength: number }
export type PPart = PChoicePart | PTextPart;
export interface PartesReto extends Base { template: 'partes'; parts: PPart[] }

// ---- Plantilla 3 · ubicar en cuadrantes (1.3)
export interface QQuadrant { id: string; label: string; bg: string; board: string; scope: string; hint: string }
export interface QCard { id: string; text: string; answer: string; ods: number; trap?: { pick: string; text: string } }
export interface CuadrantesReto extends Base {
  template: 'cuadrantes'; prompt: string; quadrants: QQuadrant[]; cardPoints: number; cards: QCard[];
  strategy: { prompt: string; points: number; hint: string; options: { id: string; text: string; correct: boolean; feedback: string }[] };
}

// ---- Plantilla 4 · deslizadores (1.4)
export interface MObjective { id: string; name: string; dim: string; dimBg: string; goal: string; indicator: string; max: number; step: number; unit: string; lo: number; hi: number; horizons: string[] }
export interface MetasReto extends Base {
  template: 'metas'; prompt: string; catalog: { id: string; text: string }[]; horizons: string[];
  points: { indicator: number; meta: number; horizon: number }; objectives: MObjective[];
}

// ---- Escenario · cartas de crisis (3.2)
export interface COption { label: string; delta: number[]; points: number; title: string; text: string; brillo?: boolean }
export interface CScenario { id: string; who: Who; whoName: string; text: string; options: COption[] }
export interface CartasReto extends Base { template: 'cartas'; meters: { label: string; color: string }[]; start: number[]; scenarios: CScenario[] }

export type RetoData = TarjetasReto | PartesReto | CuadrantesReto | MetasReto | CartasReto;
