import { computed, inject } from '@angular/core';
import { afterExercise, getExercise } from '../core/data/modules';
import { EvalResult, FeedbackItem } from '../core/models/models';
import { ProgressService } from '../core/services/progress.service';
import { SpeechService } from '../core/services/speech.service';
import type { FlagRule, RetoData } from './reto.types';

/** Lógica común de las plantillas: intentos, guardado y navegación. */
export abstract class RetoBase<D extends RetoData> {
  protected progress = inject(ProgressService);
  protected voice = inject(SpeechService);
  abstract data: () => D;

  meta = computed(() => getExercise(this.data().id));
  attempts = computed(() => (this.progress.moduleStats(), this.progress.attempts(this.data().id)));
  best = computed(() => (this.attempts(), this.progress.best(this.data().id)));
  locked = computed(() => (this.attempts(), this.progress.isLocked(this.data().id)));
  /** Número del intento en juego (1 o 2). */
  attemptNo = computed(() => Math.min(this.attempts().length + 1, 2));
  after = computed(() => afterExercise(this.data().id));

  endTitle(points: number, attemptNumber: number) {
    const t = this.data().endTitles ?? { perfect: '¡Excelente!', first: 'Buen comienzo.', second: 'Misión cumplida.' };
    return points >= this.data().max ? t.perfect : attemptNumber <= 1 ? t.first : t.second;
  }

  /** Evalúa banderas declaradas en el JSON: los ítems listados están correctos. */
  flagsFrom(correct: Record<string, boolean>): Record<string, boolean> {
    const out: Record<string, boolean> = {};
    for (const [name, rule] of Object.entries(this.data().flags ?? {}) as [string, FlagRule][]) {
      if (rule.items) out[name] = rule.items.every((i) => correct[(rule.part ? rule.part + ':' : '') + i]);
    }
    return out;
  }

  save(points: number, items: FeedbackItem[], answers: unknown, summary: string, flags: Record<string, boolean> = {}) {
    const result: EvalResult = { points, max: this.data().max, items, summary, flags };
    return this.progress.submit(this.meta(), result, answers);
  }

  speak(text: string) {
    this.voice.speak(text);
  }
}
