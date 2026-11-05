import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeedbackItem } from '../../core/models/models';
import { Escuchar } from '../../shared/escuchar';
import { Granos } from '../../shared/grano';
import { GameHeader } from '../../shared/game-header';
import { Personaje } from '../../shared/personaje';
import { RetoBase } from '../reto-base';
import type { MObjective, MetasReto } from '../reto.types';

interface Row { indicator: string; meta: number; horizon: string }
type Answers = Record<string, Row>;

/** Plantilla 4 · deslizadores: indicador, meta y plazo (diseño Reto14). */
@Component({
  selector: 'app-reto-metas',
  imports: [GameHeader, Granos, Personaje, RouterLink, Escuchar],
  templateUrl: './metas.html',
  styles: `
    @keyframes pop{0%{opacity:0;transform:scale(.7)}70%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
    .pop{animation:pop .4s cubic-bezier(.2,.7,.2,1) both}
    a:focus-visible,button:focus-visible,select:focus-visible,input:focus-visible{outline:3px solid #FF836C;outline-offset:3px}
    @media (prefers-reduced-motion: reduce){.pop{animation:none}}
  `,
})
export class RetoMetas extends RetoBase<MetasReto> {
  data = input.required<MetasReto>();
  v = signal<Answers>({});
  checked = signal(false);
  /** Rótulo «PASO n/N» (este reto es de un solo paso). */
  readonly paso = () => '1/1';

  ngOnInit() {
    const prev = this.progress.lastAnswers<Answers>(this.data().id);
    this.v.set(prev ?? Object.fromEntries(this.data().objectives.map((o) => [o.id, { indicator: '', meta: 0, horizon: '' }])));
    this.checked.set(!!prev);
  }

  pts(o: MObjective, x: Row) {
    const P = this.data().points;
    const ind = x.indicator === o.indicator ? P.indicator : 0;
    const inRange = x.meta >= o.lo && x.meta <= o.hi;
    const meta = ind ? (inRange ? P.meta : x.meta > 0 ? P.meta / 2 : 0) : 0;
    const hz = o.horizons.includes(x.horizon) ? P.horizon : 0;
    return { ind, meta, hz, inRange, total: ind + meta + hz };
  }

  score = computed(() => (this.checked() ? Math.round(this.data().objectives.reduce((s, o) => s + this.pts(o, this.v()[o.id]).total, 0)) : 0));
  /** Se puede revisar si aún quedan intentos y hay cambios por revisar. */
  canCheck = computed(() => !this.checked() && !this.locked());

  set(id: string, patch: Partial<Row>) {
    if (this.locked() && this.checked()) return;
    this.v.update((all) => ({ ...all, [id]: { ...all[id], ...patch } }));
    this.checked.set(false);
  }

  fb(o: MObjective) {
    const x = this.v()[o.id];
    const p = this.pts(o, x);
    if (!p.ind) return '↺ Ese indicador no mide este objetivo.';
    if (!p.inRange) return x.meta < o.lo ? '↺ Meta poco ambiciosa.' : '↺ Meta difícil de alcanzar con los recursos actuales.';
    if (!p.hz) return '↺ Revisa el plazo.';
    return '✓ Medible, realista y con plazo.';
  }

  check() {
    const items: FeedbackItem[] = this.data().objectives.map((o) => {
      const p = this.pts(o, this.v()[o.id]);
      return { label: o.name, ok: p.total === this.data().points.indicator + this.data().points.meta + this.data().points.horizon, hint: this.fb(o), explanation: `Indicador: ${this.data().catalog.find((c) => c.id === o.indicator)!.text}; meta entre ${o.lo} y ${o.hi}; plazo ${o.horizons.join(' o ')}.` };
    });
    const allInd = this.data().objectives.every((o) => this.v()[o.id].indicator === o.indicator);
    this.checked.set(true);
    this.save(this.score(), items, this.v(), `${this.data().objectives.filter((o) => this.v()[o.id].indicator === o.indicator).length} de 4 objetivos con su indicador.`, { todosConIndicador: allInd });
  }
}
