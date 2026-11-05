import { Component, computed, inject, signal } from '@angular/core';
import { FeedbackItem } from '../../core/models/models';
import { ProgressService } from '../../core/services/progress.service';
import { ExerciseFrame } from '../../shared/exercise-frame';
import { Meter } from '../../shared/meter';

/** Contenido del ejercicio 2.5 · Presupuesto verde. */
const INVESTMENTS = [
  { id: 'a', name: 'Sistema solar fotovoltaico en la planta', cost: 180, co2: 60, saving: 45, social: false },
  { id: 'b', name: 'Tostadora eficiente que reemplaza la antigua', cost: 150, co2: 40, saving: 30, social: false },
  { id: 'c', name: 'Compostaje de la cascarilla de cacao', cost: 40, co2: 30, saving: 8, social: false },
  { id: 'd', name: 'Programa agroforestal con las familias productoras', cost: 90, co2: 80, saving: 0, social: true },
  { id: 'e', name: 'Dos vehículos eléctricos de reparto', cost: 220, co2: 30, saving: 20, social: false },
  { id: 'f', name: 'Campaña publicitaria «Somos verdes»', cost: 60, co2: 0, saving: 0, social: false },
];
const BUDGET = 400;
const CO2_TARGET = 150;
const SAVING_TARGET = 40;
const ID = 'm2-presupuesto-verde';

@Component({
  selector: 'app-presupuesto-verde',
  imports: [ExerciseFrame, Meter],
  template: `
    <app-exercise-frame [exerciseId]="id" [evaluate]="evaluate" [ready]="selected().length > 0" readyHint="Activa al menos una inversión.">
      <div class="grid grid-2">
        <section class="card">
          <h2>Inversiones disponibles</h2>
          <ul class="inv">
            @for (i of investments; track i.id) {
              <li>
                <label class="check inv-item" [class.on]="isOn(i.id)">
                  <input type="checkbox" role="switch" [checked]="isOn(i.id)" [disabled]="locked()" (change)="toggle(i.id)" />
                  <span>
                    <strong>{{ i.id }}. {{ i.name }}</strong><br />
                    <span class="small muted">COP {{ i.cost }} M · {{ i.co2 }} t CO₂e/año · ahorro COP {{ i.saving }} M/año · beneficio social: {{ i.social ? 'Sí (120 familias)' : 'No' }}</span>
                  </span>
                </label>
              </li>
            }
          </ul>
        </section>
        <section class="card" aria-live="polite">
          <h2>Medidores en tiempo real</h2>
          <app-meter label="Dinero usado (COP M)" [value]="totals().cost" [max]="budget" [limit]="true" [note]="totals().cost > budget ? 'Superas el presupuesto aprobado por la junta.' : ''" />
          <app-meter label="CO₂ evitado al año (t)" [value]="totals().co2" [max]="250" [target]="co2Target" />
          <app-meter label="Ahorro anual (COP M)" [value]="totals().saving" [max]="100" [target]="savingTarget" />
          <p class="small">Inversión con beneficio social directo: <strong>{{ totals().social ? 'Sí' : 'No' }}</strong></p>
          <p class="small muted">La comunicación llega después, con resultados.</p>
        </section>
      </div>
    </app-exercise-frame>
  `,
  styles: `.inv { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .5rem; } .inv-item { border: 1px solid var(--borde); border-radius: 8px; padding: .5rem .7rem; } .inv-item.on { border-color: var(--teal); background: var(--teal-claro); }`,
})
export class PresupuestoVerdeExercise {
  readonly id = ID;
  private progress = inject(ProgressService);
  readonly investments = INVESTMENTS;
  readonly budget = BUDGET;
  readonly co2Target = CO2_TARGET;
  readonly savingTarget = SAVING_TARGET;

  selected = signal<string[]>(this.progress.lastAnswers<string[]>(ID) ?? []);
  locked = computed(() => this.progress.isLocked(ID));
  totals = computed(() => {
    const sel = INVESTMENTS.filter((i) => this.selected().includes(i.id));
    return {
      cost: sel.reduce((s, i) => s + i.cost, 0),
      co2: sel.reduce((s, i) => s + i.co2, 0),
      saving: sel.reduce((s, i) => s + i.saving, 0),
      social: sel.some((i) => i.social),
    };
  });

  isOn(id: string) {
    return this.selected().includes(id);
  }

  toggle(id: string) {
    this.selected.update((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id].sort()));
  }

  evaluate = () => {
    const t = this.totals();
    const noCampana = !this.selected().includes('f');
    const checks = [
      { ok: t.cost <= BUDGET, pts: 10, label: 'No supera el presupuesto', hint: 'Revisa el dinero usado frente a los COP 400 M aprobados.', exp: `Usaste COP ${t.cost} M de ${BUDGET} M.` },
      { ok: t.co2 >= CO2_TARGET, pts: 15, label: 'Alcanza 150 t de CO₂ evitadas', hint: '¿Qué inversiones evitan más toneladas por cada peso invertido?', exp: `Evitas ${t.co2} t CO₂e/año. Combinaciones válidas: a + c + d (310 M, 170 t, ahorro 53 M) o b + c + d (280 M, 150 t, ahorro 38 M).` },
      { ok: t.social, pts: 10, label: 'Incluye una inversión con beneficio social directo', hint: 'Alguna inversión beneficia directamente a las familias productoras.', exp: 'El programa agroforestal (d) beneficia a las 120 familias y además es la inversión que más CO₂ evita.' },
      { ok: noCampana, pts: 10, label: 'No elige la campaña publicitaria', hint: '¿Alguna inversión comunica sin cambiar nada?', exp: noCampana ? 'Bien: una frase bonita sin datos no es sostenibilidad. Lo detectaste.' : 'Comunicar sin haber cambiado nada es la puerta de entrada al greenwashing; la comunicación llega después, con resultados.' },
      { ok: t.saving >= SAVING_TARGET, pts: 5, label: 'Ahorro anual de COP 40 M o más', hint: 'Algunas inversiones se pagan solas con el ahorro de energía.', exp: `Ahorro anual: COP ${t.saving} M.` },
    ];
    const items: FeedbackItem[] = checks.map((c) => ({ label: c.label, ok: c.ok, hint: c.hint, explanation: c.exp }));
    const points = checks.reduce((s, c) => s + (c.ok ? c.pts : 0), 0);
    return {
      result: {
        points,
        max: 50,
        items,
        summary: points === 50 ? 'Presupuesto verde en equilibrio: impacto ambiental, social y económico con datos.' : `Tu presupuesto obtiene ${points} de 50 PE.`,
        flags: { noCampana, todasLasMetas: points === 50 },
      },
      answers: this.selected(),
    };
  };
}
