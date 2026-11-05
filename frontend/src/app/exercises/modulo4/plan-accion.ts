import { Component, computed, inject, signal } from '@angular/core';
import { FeedbackItem } from '../../core/models/models';
import { ProgressService } from '../../core/services/progress.service';
import { ExerciseFrame } from '../../shared/exercise-frame';
import { OrgAnswers, PORTFOLIO } from '../modulo2/organigrama.data';
import { CuellosAnswers } from './cuellos-botella';
import { BOTTLENECKS } from './reporte.data';

/** Contenido del ejercicio 4.3 · Plan de acción y correctivos (ciclo PHVA). */
const COPASST = { id: 'copasst', label: 'Comité de Seguridad y Salud en el Trabajo (COPASST)' };
const TERMS = [
  { id: '1m', label: '1 mes' },
  { id: '3-6m', label: '3 a 6 meses' },
  { id: '12m', label: '12 meses' },
  { id: '3a', label: 'Más de 3 años' },
];
const TRACKING = [
  { id: 'kwh', label: 'kWh consumidos por tonelada procesada' },
  { id: 'res', label: '% de residuos aprovechados' },
  { id: 'acc', label: 'Accidentes por cada 100 trabajadores' },
  { id: 'redes', label: 'Seguidores en redes sociales' },
  { id: 'ven', label: '% de crecimiento de ventas nacionales' },
];
const RESOURCES = [
  { id: 'tostadora', label: 'Presupuesto verde: tostadora eficiente / sistema solar' },
  { id: 'compost', label: 'Presupuesto verde: compostaje de la cascarilla' },
  { id: 'sst', label: 'Horas del COPASST y presupuesto de SST' },
  { id: 'campana', label: 'Campaña publicitaria «Somos verdes»' },
];
/** Respuestas coherentes por cuello de botella. */
const COHERENT: Record<string, { responsible: string[]; term: string[]; tracking: string; resource: string }> = {
  energia: { responsible: ['produccion'], term: ['3-6m', '12m'], tracking: 'kwh', resource: 'tostadora' },
  residuos: { responsible: ['produccion', 'abastecimiento', 'comite'], term: ['3-6m', '12m'], tracking: 'res', resource: 'compost' },
  accidentalidad: { responsible: ['talento', 'copasst'], term: ['1m', '3-6m'], tracking: 'acc', resource: 'sst' },
};

interface Row {
  action: string;
  responsible: string;
  term: string;
  tracking: string;
  resource: string;
  proof: string;
}
type Answers = Record<string, Row>;
const ID = 'm4-plan-accion';
const PHVA = ['Planear', 'Hacer', 'Verificar', 'Actuar'];

@Component({
  selector: 'app-plan-accion',
  imports: [ExerciseFrame],
  template: `
    <app-exercise-frame [exerciseId]="id" [evaluate]="evaluate" [ready]="ready()" readyHint="Completa todos los campos de las tres filas.">
      <ol class="phva" aria-label="Ciclo PHVA">
        @for (p of phva; track p; let i = $index) {
          <li [class.active]="i === 3" [attr.aria-current]="i === 3 ? 'step' : null">{{ p }}</li>
        }
        <li class="loop" aria-hidden="true">↺</li>
      </ol>
      <p class="small muted center">Estás en <strong>Actuar</strong>: este plan permite reiniciar el ciclo.</p>

      @for (b of bottlenecks; track b.id) {
        @let r = rows()[b.id];
        <section class="card">
          <h2>{{ b.name }} <span class="small muted">({{ b.result }} · meta {{ b.goal }})</span></h2>
          <div class="grid grid-3">
            <div class="field">
              <label [for]="'act-' + b.id">Qué se hará <span class="small muted">(viene de 4.2)</span></label>
              <select [id]="'act-' + b.id" [disabled]="locked()" (change)="set(b.id, 'action', $any($event.target).value)">
                <option value="" [selected]="!r.action">— Elige —</option>
                @for (s of b.strategies; track s.id) { <option [value]="s.id" [selected]="r.action === s.id">{{ s.text }}</option> }
              </select>
            </div>
            <div class="field" [class.is-ok]="locked() && ok(b.id, 'responsible')" [class.is-bad]="locked() && !ok(b.id, 'responsible')">
              <label [for]="'resp-' + b.id">Responsable <span class="small muted">(organigrama 2.1)</span></label>
              <select [id]="'resp-' + b.id" [disabled]="locked()" (change)="set(b.id, 'responsible', $any($event.target).value)">
                <option value="" [selected]="!r.responsible">— Elige —</option>
                @for (a of areas(); track a.id) { <option [value]="a.id" [selected]="r.responsible === a.id">{{ a.label }}</option> }
              </select>
            </div>
            <div class="field" [class.is-ok]="locked() && ok(b.id, 'term')" [class.is-bad]="locked() && !ok(b.id, 'term')">
              <label [for]="'term-' + b.id">Plazo</label>
              <select [id]="'term-' + b.id" [disabled]="locked()" (change)="set(b.id, 'term', $any($event.target).value)">
                <option value="" [selected]="!r.term">— Elige —</option>
                @for (t of terms; track t.id) { <option [value]="t.id" [selected]="r.term === t.id">{{ t.label }}</option> }
              </select>
            </div>
            <div class="field" [class.is-ok]="locked() && ok(b.id, 'tracking')" [class.is-bad]="locked() && !ok(b.id, 'tracking')">
              <label [for]="'trk-' + b.id">Indicador de seguimiento</label>
              <select [id]="'trk-' + b.id" [disabled]="locked()" (change)="set(b.id, 'tracking', $any($event.target).value)">
                <option value="" [selected]="!r.tracking">— Elige —</option>
                @for (t of tracking; track t.id) { <option [value]="t.id" [selected]="r.tracking === t.id">{{ t.label }}</option> }
              </select>
            </div>
            <div class="field" [class.is-ok]="locked() && ok(b.id, 'resource')" [class.is-bad]="locked() && !ok(b.id, 'resource')">
              <label [for]="'res-' + b.id">Recurso</label>
              <select [id]="'res-' + b.id" [disabled]="locked()" (change)="set(b.id, 'resource', $any($event.target).value)">
                <option value="" [selected]="!r.resource">— Elige —</option>
                @for (t of resources; track t.id) { <option [value]="t.id" [selected]="r.resource === t.id">{{ t.label }}</option> }
              </select>
            </div>
            <div class="field" [class.is-ok]="locked() && ok(b.id, 'proof')" [class.is-bad]="locked() && !ok(b.id, 'proof')">
              <label [for]="'proof-' + b.id">¿Cómo sabremos que funcionó?</label>
              <textarea [id]="'proof-' + b.id" [disabled]="locked()" [value]="r.proof" (input)="set(b.id, 'proof', $any($event.target).value)"></textarea>
            </div>
          </div>
        </section>
      }
    </app-exercise-frame>
  `,
  styles: `
    .phva { list-style: none; display: flex; gap: .4rem; justify-content: center; padding: 0; margin: 0 0 .3rem; flex-wrap: wrap; }
    .phva li { padding: .4rem .9rem; border-radius: 999px; background: #ece3d7; font-weight: 600; }
    .phva li.active { background: var(--vino); color: #fff; }
    .phva li.loop { background: none; font-size: 1.3rem; padding: 0 .3rem; }
    .center { text-align: center; }
    .field.is-ok, .field.is-bad { border: 2px solid; border-radius: 8px; padding: .3rem; }
  `,
})
export class PlanAccionExercise {
  readonly id = ID;
  private progress = inject(ProgressService);
  readonly bottlenecks = BOTTLENECKS;
  readonly terms = TERMS;
  readonly tracking = TRACKING;
  readonly resources = RESOURCES;
  readonly phva = PHVA;

  private fromCuellos = this.progress.lastAnswers<CuellosAnswers>('m4-cuellos-botella');
  rows = signal<Answers>(
    this.progress.lastAnswers<Answers>(ID) ??
      Object.fromEntries(
        BOTTLENECKS.map((b) => [b.id, { action: this.fromCuellos?.strategies[b.id] ?? '', responsible: '', term: '', tracking: '', resource: '', proof: '' }]),
      ),
  );
  locked = computed(() => this.progress.isLocked(ID));

  /** Áreas del organigrama diseñado en 2.1 (o todas, si aún no existe) + COPASST. */
  areas = computed(() => {
    const org = this.progress.lastAnswers<OrgAnswers>('m2-organigrama');
    const list = org && PORTFOLIO.some((b) => org[b.id]?.included) ? PORTFOLIO.filter((b) => org[b.id]?.included) : PORTFOLIO.filter((b) => !b.distractor);
    return [...list.map((b) => ({ id: b.id, label: b.label })), COPASST];
  });

  ready = computed(() => BOTTLENECKS.every((b) => {
    const r = this.rows()[b.id];
    return r.action && r.responsible && r.term && r.tracking && r.resource && r.proof.trim();
  }));

  set(id: string, key: keyof Row, v: string) {
    this.rows.update((r) => ({ ...r, [id]: { ...r[id], [key]: v } }));
  }

  ok(id: string, key: 'responsible' | 'term' | 'tracking' | 'resource' | 'proof'): boolean {
    const r = this.rows()[id];
    const c = COHERENT[id];
    switch (key) {
      case 'responsible': return c.responsible.includes(r.responsible);
      case 'term': return c.term.includes(r.term);
      case 'tracking': return r.tracking === c.tracking;
      case 'resource': return r.resource === c.resource;
      case 'proof': return r.proof.trim().length >= 20;
    }
  }

  private label(list: { id: string; label: string }[], ids: string[]) {
    return ids.map((i) => list.find((x) => x.id === i)?.label ?? i).join(' o ');
  }

  evaluate = () => {
    const items: FeedbackItem[] = [];
    let points = 0;
    const allAreas = [...PORTFOLIO.map((b) => ({ id: b.id, label: b.label })), COPASST];
    for (const b of BOTTLENECKS) {
      const c = COHERENT[b.id];
      const fields: { key: 'responsible' | 'term' | 'tracking' | 'resource' | 'proof'; name: string; hint: string; exp: string }[] = [
        { key: 'responsible', name: 'Responsable', hint: '¿Qué área del organigrama tiene autoridad sobre la causa del problema?', exp: `Coherente: ${this.label(allAreas, c.responsible)}.` },
        { key: 'term', name: 'Plazo', hint: '¿El plazo permite ver resultados antes del siguiente reporte?', exp: `Coherente: ${this.label(TERMS, c.term)}.` },
        { key: 'tracking', name: 'Indicador', hint: '¿El indicador es el mismo que mostró el problema en el reporte?', exp: `Coherente: ${this.label(TRACKING, [c.tracking])}.` },
        { key: 'resource', name: 'Recurso', hint: '¿El recurso financia la acción, o solo la comunica?', exp: `Coherente: ${this.label(RESOURCES, [c.resource])}.` },
        { key: 'proof', name: '¿Cómo saber que funcionó?', hint: 'Escribe una frase completa con el dato que esperas ver (mín. 20 caracteres).', exp: 'Suma si está completa: idealmente nombra el indicador y la meta.' },
      ];
      for (const f of fields) {
        const good = this.ok(b.id, f.key);
        if (good) points += 4;
        items.push({ label: `${b.name} · ${f.name}`, ok: good, hint: f.hint, explanation: f.exp });
      }
    }
    return {
      result: { points, max: 60, items, summary: `Tu plan tiene ${points / 4} de 15 campos coherentes. El ciclo PHVA puede reiniciar con mejores datos.` },
      answers: this.rows(),
    };
  };
}
