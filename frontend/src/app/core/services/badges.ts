import type { ProgressService } from './progress.service';
import { ALL_EXERCISES } from '../data/modules';

export interface Badge {
  id: string;
  name: string;
  criterion: string;
  earned: boolean;
  /** true si la insignia depende de ejercicios no incluidos en el prototipo. */
  unavailable?: boolean;
  /** Avance hacia la insignia (p. ej. 1 de 4 bitácoras). */
  progress?: [number, number];
}

/**
 * Insignias del documento, adaptadas a los ejercicios del prototipo.
 * Las insignias reconocen, los puntos califican: no suman a la nota.
 */
export function computeBadges(p: ProgressService): Badge[] {
  const stats = p.moduleStats();
  const pct = (m: number) => {
    const s = stats[m - 1];
    return s.max ? s.points / s.max : 0;
  };
  const anyImproved = ALL_EXERCISES.some((e) => {
    const list = p.attempts(e.id);
    return list.length >= 2 && list[1].points - list[0].points >= 20;
  });

  return [
    { id: 'brujula-clara', name: 'Brújula clara', criterion: 'Módulo 1 con 200 granos o más (80 %).', earned: pct(1) >= 0.8 },
    { id: 'arquitectura-verde', name: 'Arquitectura verde', criterion: 'Módulo 2 con 80 % o más de sus granos.', earned: pct(2) >= 0.8 },
    { id: 'liderazgo-proposito', name: 'Liderazgo con propósito', criterion: 'Módulo 3 con 80 % o más de sus granos.', earned: pct(3) >= 0.8 },
    { id: 'mirada-esg', name: 'Mirada ESG', criterion: 'Módulo 4 con 80 % o más de sus granos.', earned: pct(4) >= 0.8 },
    {
      id: 'detector-greenwashing',
      name: 'Detector/a de greenwashing',
      criterion:
        'Detecta el greenwashing del recorrido: etiqueta sin datos (1.2), campaña «Somos verdes» (2.5), ronda de greenwashing (3.1) y no declarar cumplir sin pruebas (3.2).',
      earned:
        p.flag('m1-valores', 'greenwashing') &&
        p.flag('m2-presupuesto-verde', 'noCampana') &&
        p.flag('m3-dilemas', 'rondaGreenwashing') &&
        p.flag('m3-crisis', 'sinGreenwashing'),
      progress: [
        [p.flag('m1-valores', 'greenwashing'), p.flag('m2-presupuesto-verde', 'noCampana'), p.flag('m3-dilemas', 'rondaGreenwashing'), p.flag('m3-crisis', 'sinGreenwashing')].filter(Boolean).length,
        4,
      ],
    },
    {
      id: 'presupuesto-equilibrio',
      name: 'Presupuesto en equilibrio',
      criterion: 'Cumple el tope en 2.3 y todas las metas en 2.5. (El ejercicio 2.3 no está en el prototipo.)',
      earned: false,
      unavailable: true,
    },
    {
      id: 'a-la-primera',
      name: 'A la primera',
      criterion: 'Obtiene 80 % o más de un módulo sin usar segundos intentos.',
      earned: stats.some((s) => s.done && s.firstTry && s.points / s.max >= 0.8),
    },
    {
      id: 'mejora-continua',
      name: 'Mejora continua',
      criterion: 'Sube 20 granos o más en un ejercicio al reintentarlo.',
      earned: anyImproved,
    },
    {
      id: 'hilo-conductor',
      name: 'Hilo conductor',
      criterion: 'Los cuatro objetivos del módulo 1 tienen indicador correcto (1.4) y el plan de acción (4.3) queda aprobado.',
      earned: p.flag('m1-metas', 'todosConIndicador') && (p.best('m4-plan-accion')?.grade ?? 0) >= 3,
    },
    {
      id: 'voz-propia',
      name: 'Voz propia',
      criterion: 'Completa las cuatro bitácoras reflexivas.',
      earned: [1, 2, 3, 4].every((m) => p.isReflectionComplete(m)),
      progress: [[1, 2, 3, 4].filter((m) => p.isReflectionComplete(m)).length, 4],
    },
    {
      id: 'recorrido-completo',
      name: 'Recorrido completo',
      criterion: 'Termina los cuatro módulos.',
      earned: stats.every((s) => s.done),
      progress: [stats.filter((s) => s.done).length, 4],
    },
  ];
}
