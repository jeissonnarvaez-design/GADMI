import { Component, computed, inject, signal } from '@angular/core';
import { FeedbackItem } from '../../core/models/models';
import { ProgressService } from '../../core/services/progress.service';
import { ExerciseFrame } from '../../shared/exercise-frame';
import { MediaPlaceholder } from '../../shared/media-placeholder';
import { TOPICS } from './reporte.data';

export interface CuellosAnswers {
  marked: string[];
  strategies: Record<string, string>;
}
const ID = 'm4-cuellos-botella';

@Component({
  selector: 'app-cuellos-botella',
  imports: [ExerciseFrame, MediaPlaceholder],
  template: `
    <app-exercise-frame [exerciseId]="id" [evaluate]="evaluate" [ready]="ready()" readyHint="Marca exactamente tres temas y elige una estrategia para cada uno.">
      <section class="card">
        <h2>Reporte de sostenibilidad · cierre 2027 (estructura GRI)</h2>
        <app-media-placeholder kind="pdf" [compact]="true" title="Reporte GRI completo descargable" description="Versión en PDF del reporte de CACAO Raíz S.A.S. con portada, alcance y anexos." tool="jsPDF" />
        <table class="table">
          <caption class="sr-only">Resultados 2027 frente a la meta, con semáforo</caption>
          <thead><tr><th scope="col">Cuello de botella</th><th scope="col">Tema</th><th scope="col">Resultado 2027</th><th scope="col">Meta</th><th scope="col">Estado</th></tr></thead>
          <tbody>
            @for (t of topics; track t.id) {
              <tr [class.is-ok]="locked() && isMarked(t.id) && t.bottleneck" [class.is-bad]="locked() && isMarked(t.id) !== t.bottleneck">
                <td>
                  <label class="sr-only" [for]="'cb-' + t.id">Marcar {{ t.name }} como cuello de botella</label>
                  <input type="checkbox" [id]="'cb-' + t.id" [checked]="isMarked(t.id)" [disabled]="locked() || (!isMarked(t.id) && marked().length >= 3)" (change)="toggle(t.id)" />
                </td>
                <td>{{ t.name }}</td>
                <td>{{ t.result }}</td>
                <td>{{ t.goal }}</td>
                <td><span class="semaforo" [class]="t.light">{{ lightLabel(t.light) }}</span></td>
              </tr>
            }
          </tbody>
        </table>
        <p class="small muted">Seleccionados: {{ marked().length }} de 3.</p>
      </section>

      @for (id of marked(); track id) {
        @let t = topic(id);
        <section class="card">
          <h2>Estrategia para «{{ t.name }}»</h2>
          @for (s of t.strategies; track s.id) {
            <label class="check opt" [class.is-ok]="locked() && s.correct" [class.is-bad]="locked() && !s.correct && strategies()[id] === s.id">
              <input type="radio" [name]="'st-' + id" [checked]="strategies()[id] === s.id" [disabled]="locked()" (change)="setStrategy(id, s.id)" />
              <span>{{ s.text }}</span>
            </label>
          }
        </section>
      }
    </app-exercise-frame>
  `,
  styles: `.opt { border: 1px solid var(--borde); border-radius: 8px; padding: .5rem .7rem; margin-bottom: .5rem; }`,
})
export class CuellosBotellaExercise {
  readonly id = ID;
  private progress = inject(ProgressService);
  readonly topics = TOPICS;
  private saved = this.progress.lastAnswers<CuellosAnswers>(ID);
  marked = signal<string[]>(this.saved?.marked ?? []);
  strategies = signal<Record<string, string>>(this.saved?.strategies ?? {});
  locked = computed(() => this.progress.isLocked(ID));
  ready = computed(() => this.marked().length === 3 && this.marked().every((m) => this.strategies()[m]));

  topic(id: string) {
    return TOPICS.find((t) => t.id === id)!;
  }
  isMarked(id: string) {
    return this.marked().includes(id);
  }
  lightLabel(l: string) {
    return l === 'rojo' ? 'Rojo' : l === 'amarillo' ? 'Amarillo' : 'Verde';
  }
  toggle(id: string) {
    this.marked.update((m) => (m.includes(id) ? m.filter((x) => x !== id) : m.length < 3 ? [...m, id] : m));
  }
  setStrategy(topic: string, s: string) {
    this.strategies.update((x) => ({ ...x, [topic]: s }));
  }

  evaluate = () => {
    const items: FeedbackItem[] = [];
    let points = 0;
    for (const id of this.marked()) {
      const t = this.topic(id);
      if (t.bottleneck) points += 10;
      items.push({
        label: `${t.name} · ¿cuello de botella?`,
        ok: t.bottleneck,
        hint: 'Compara el resultado con la meta: ¿qué tan lejos está?',
        explanation: t.bottleneck ? 'Sí: el resultado está lejos de la meta (rojo).' : `No: ${t.result} frente a ${t.goal} está ${t.light === 'verde' ? 'en verde' : 'cerca de la meta (amarillo)'}.`,
      });
      const st = t.strategies.find((s) => s.id === this.strategies()[id]);
      const good = t.strategies.find((s) => s.correct);
      if (st?.correct) points += 10;
      items.push({
        label: `${t.name} · estrategia`,
        ok: !!st?.correct,
        hint: '¿La estrategia ataca la causa del problema o solo lo comunica?',
        explanation: good ? `Estrategia esperada: ${good.text}` : 'Este tema no es cuello de botella; la estrategia no suma.',
      });
    }
    for (const t of TOPICS.filter((x) => x.bottleneck && !this.isMarked(x.id))) {
      items.push({ label: `${t.name} · no marcado`, ok: false, hint: 'Revisa los temas en rojo.', explanation: `Era cuello de botella (${t.result} frente a ${t.goal}).` });
    }
    return {
      result: { points, max: 60, items, summary: `Identificaste ${this.marked().filter((m) => this.topic(m).bottleneck).length} de 3 cuellos de botella.` },
      answers: { marked: this.marked(), strategies: this.strategies() } satisfies CuellosAnswers,
    };
  };
}
