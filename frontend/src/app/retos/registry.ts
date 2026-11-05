import type { RetoData } from './reto.types';
import r11 from './data/1.1.json';
import r12 from './data/1.2.json';
import r13 from './data/1.3.json';
import r14 from './data/1.4.json';
import r22 from './data/2.2.json';
import r31 from './data/3.1.json';
import r32 from './data/3.2.json';
import r33 from './data/3.3.json';
import r41 from './data/4.1.json';

/** Retos cuyo contenido vive en JSON y se juegan con una plantilla. */
export const RETOS_JSON: Record<string, RetoData> = {
  '1.1': r11 as unknown as RetoData,
  '1.2': r12 as unknown as RetoData,
  '1.3': r13 as unknown as RetoData,
  '1.4': r14 as unknown as RetoData,
  '2.2': r22 as unknown as RetoData,
  '3.1': r31 as unknown as RetoData,
  '3.2': r32 as unknown as RetoData,
  '3.3': r33 as unknown as RetoData,
  '4.1': r41 as unknown as RetoData,
};
