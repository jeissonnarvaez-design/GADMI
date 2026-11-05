import { Component, computed, inject, signal } from '@angular/core';
import { FeedbackItem } from '../../core/models/models';
import { ProgressService } from '../../core/services/progress.service';
import { ExerciseFrame } from '../../shared/exercise-frame';
import { MediaPlaceholder } from '../../shared/media-placeholder';
import { OrgTree } from './org-tree';
import { LineType, OrgAnswers, PORTFOLIO, PTS_RULE, RULES, emptyOrg, evaluateRules } from './organigrama.data';

const ID = 'm2-organigrama';

@Component({
  selector: 'app-organigrama',
  imports: [ExerciseFrame, OrgTree, MediaPlaceholder],
  template: `
    <app-exercise-frame [exerciseId]="id" [evaluate]="evaluate" [ready]="ready()" readyHint="Incluye al menos la gerencia general.">
      <p class="card small">
        <strong>Nota conceptual:</strong> lo <em>estructural</em> es la forma (niveles jerárquicos y áreas); lo <em>posicional</em> es el lugar
        de cada cargo en la jerarquía; lo <em>funcional</em> es lo que cada cargo hace. Los ejercicios 2.1 y 2.2 recorren esos tres planos.
      </p>
      <div class="grid grid-2">
        <section class="card">
          <h2>Portafolio de cajas</h2>
          <p class="small muted">Para cada caja: inclúyela, indica a quién reporta y el tipo de línea. (En la versión final las cajas se arrastran sobre el lienzo; este formulario es la alternativa accesible por teclado.)</p>
          <table class="table">
            <thead><tr><th>Caja</th><th>Reporta a</th><th>Línea</th></tr></thead>
            <tbody>
              @for (b of portfolio; track b.id) {
                <tr>
                  <td>
                    <label class="check">
                      <input type="checkbox" [checked]="org()[b.id].included" [disabled]="locked()" (change)="set(b.id, 'included', $any($event.target).checked)" />
                      {{ b.label }}
                    </label>
                  </td>
                  <td>
                    <label class="sr-only" [for]="'par-' + b.id">{{ b.label }} reporta a</label>
                    <select [id]="'par-' + b.id" [disabled]="locked() || !org()[b.id].included" (change)="set(b.id, 'parent', $any($event.target).value)">
                      <option value="" [selected]="!org()[b.id].parent">— Cima —</option>
                      @for (o of included(); track o.id) {
                        @if (o.id !== b.id) {
                          <option [value]="o.id" [selected]="org()[b.id].parent === o.id">{{ o.label }}</option>
                        }
                      }
                    </select>
                  </td>
                  <td>
                    <label class="sr-only" [for]="'lin-' + b.id">Tipo de línea de {{ b.label }}</label>
                    <select [id]="'lin-' + b.id" [disabled]="locked() || !org()[b.id].included" (change)="set(b.id, 'line', $any($event.target).value)">
                      <option value="mando" [selected]="org()[b.id].line === 'mando'">Mando (continua)</option>
                      <option value="asesoria" [selected]="org()[b.id].line === 'asesoria'">Asesoría (punteada)</option>
                    </select>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </section>

        <section class="card">
          <h2>Lienzo del organigrama</h2>
          <app-media-placeholder kind="imagen" [compact]="true" title="Fondo artístico del lienzo" description="Lienzo con imagen y colores de la paleta de la trayectoria detrás del organigrama." tool="Figma / Illustrator" />
          <app-org-tree [org]="org()" />
          @if (locked()) {
            <h3>Reglas validadas</h3>
            <ul class="small">
              @for (r of rules; track r.n; let i = $index) {
                <li [class.li-ok]="ruleResults()[i]" [class.li-bad]="!ruleResults()[i]">{{ ruleResults()[i] ? '✔' : '✘' }} {{ r.text }}</li>
              }
            </ul>
          }
        </section>
      </div>
    </app-exercise-frame>
  `,
  styles: `.li-ok { color: var(--ok); } .li-bad { color: var(--bordo); } td select { min-width: 9rem; }`,
})
export class OrganigramaExercise {
  readonly id = ID;
  private progress = inject(ProgressService);
  readonly portfolio = PORTFOLIO;
  readonly rules = RULES;

  org = signal<OrgAnswers>(this.progress.lastAnswers<OrgAnswers>(ID) ?? emptyOrg());
  locked = computed(() => this.progress.isLocked(ID));
  included = computed(() => PORTFOLIO.filter((b) => this.org()[b.id].included));
  ready = computed(() => this.org()['gerente'].included);
  ruleResults = computed(() => evaluateRules(this.org()));

  set(id: string, key: 'included' | 'parent' | 'line', value: boolean | string) {
    this.org.update((o) => {
      const next = { ...o, [id]: { ...o[id], [key]: value } };
      if (key === 'included' && !value) {
        next[id] = { included: false, parent: '', line: 'mando' as LineType };
        for (const k of Object.keys(next)) if (next[k].parent === id) next[k] = { ...next[k], parent: '' };
      }
      return next;
    });
  }

  evaluate = () => {
    const results = evaluateRules(this.org());
    const items: FeedbackItem[] = RULES.map((r, i) => ({
      label: `Regla ${r.n}`,
      ok: results[i],
      hint: r.message,
      explanation: `${r.text} ${results[i] ? '' : r.message}`.trim(),
    }));
    const ok = results.filter(Boolean).length;
    return {
      result: {
        points: ok * PTS_RULE,
        max: 70,
        items,
        summary: ok === 7 ? 'Estructura clara, sin niveles de sobra y con responsable de la sostenibilidad.' : `Tu organigrama cumple ${ok} de 7 reglas.`,
      },
      answers: this.org(),
    };
  };
}
