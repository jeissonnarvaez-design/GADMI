import { Component, computed, input, signal } from '@angular/core';
import { FeedbackItem } from '../../core/models/models';
import { Escuchar } from '../../shared/escuchar';
import { Granos } from '../../shared/grano';
import { GameHeader } from '../../shared/game-header';
import { Personaje } from '../../shared/personaje';
import { RetoBase } from '../reto-base';
import { RetoEnd } from '../reto-end';
import type { CartasReto } from '../reto.types';

/** Escenario · cartas de crisis que mueven medidores (diseño Cartas, reto 3.2). */
@Component({
  selector: 'app-reto-cartas',
  imports: [GameHeader, Granos, Personaje, RetoEnd, Escuchar],
  templateUrl: './cartas.html',
  styles: `
    @keyframes deal{from{opacity:0;transform:translateY(-30px) rotate(4deg)}to{opacity:1;transform:none}}
    @keyframes pop{0%{opacity:0;transform:scale(.6)}70%{transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
    .deal{animation:deal .5s cubic-bezier(.2,.7,.2,1) both}
    .pop{animation:pop .45s cubic-bezier(.2,.7,.2,1) both}
    .opt{transition:transform .15s, box-shadow .15s}.opt:hover,.opt:focus-visible{transform:translateY(-6px) rotate(-1deg);box-shadow:0 16px 30px rgba(0,0,0,.35)}
    .bar{transition:width .9s cubic-bezier(.2,.7,.2,1)}
    a:focus-visible,button:focus-visible{outline:3px solid #FBF5EC;outline-offset:3px;box-shadow:0 0 0 6px #231417;}
    @media (prefers-reduced-motion: reduce){.deal,.pop{animation:none}.opt,.bar{transition:none}}
  `,
})
export class RetoCartas extends RetoBase<CartasReto> {
  data = input.required<CartasReto>();
  sc = signal(0);
  vals = signal<number[]>([]);
  peek = signal<number | null>(null);
  chosen = signal<number | null>(null);
  answers = signal<Record<string, string>>({});
  ended = signal(false);

  ngOnInit() {
    this.vals.set([...this.data().start]);
    const prev = this.progress.lastAnswers<Record<string, string>>(this.data().id);
    if (prev) {
      this.answers.set(prev);
      this.vals.set(this.replay(prev));
      this.ended.set(true);
    }
  }

  private replay(a: Record<string, string>) {
    const v = [...this.data().start];
    for (const s of this.data().scenarios) {
      const o = s.options[Number(a[s.id]) - 1];
      if (o) o.delta.forEach((d, j) => (v[j] = clamp(v[j] + d)));
    }
    return v;
  }

  s = computed(() => this.data().scenarios[Math.min(this.sc(), this.data().scenarios.length - 1)]);
  /** Rótulo «PASO n/N»: cada escenario es un paso. */
  paso = computed(() => Math.min(this.sc() + 1, this.data().scenarios.length) + '/' + this.data().scenarios.length);
  pts = computed(() => this.data().scenarios.reduce((sum, s) => sum + (s.options[Number(this.answers()[s.id]) - 1]?.points ?? 0), 0));
  ch = computed(() => (this.chosen() !== null ? this.s().options[this.chosen()!] : null));
  meters = computed(() => {
    const delta = this.ch()?.delta ?? (this.peek() !== null ? this.s().options[this.peek()!].delta : null);
    return this.data().meters.map((m, i) => {
      const d = delta ? delta[i] : 0;
      return { ...m, w: this.vals()[i] + '%', arrow: d > 0 ? '▲' : d < 0 ? '▼' : '', arrowColor: d > 0 ? '#56C02B' : '#FBF5EC', arrowLabel: d > 0 ? 'sube' : d < 0 ? 'baja' : '' };
    });
  });
  canRetry = computed(() => !this.locked() && this.pts() < this.data().max);
  endTitleText = computed(() => (this.pts() >= 75 ? 'Liderazgo con propósito' : this.pts() >= 45 ? 'Vas por buen camino' : 'Hay que volver a intentarlo'));

  pick(i: number) {
    const o = this.s().options[i];
    this.chosen.set(i);
    this.peek.set(null);
    this.answers.update((a) => ({ ...a, [this.s().id]: String(i + 1) }));
    this.vals.update((v) => v.map((x, j) => clamp(x + o.delta[j])));
  }

  next() {
    if (this.sc() < this.data().scenarios.length - 1) {
      this.sc.update((v) => v + 1);
      this.chosen.set(null);
    } else this.finish();
  }

  private finish() {
    const a = this.answers();
    const items: FeedbackItem[] = this.data().scenarios.map((s) => {
      const o = s.options[Number(a[s.id]) - 1];
      const bestO = s.options.reduce((b, x) => (x.points > b.points ? x : b));
      return { label: `Crisis ${s.id}`, ok: o.points === bestO.points, hint: '¿Tu decisión ataca la causa y deja capacidad instalada?', explanation: `${o.title}. Óptima: ${bestO.label}.` };
    });
    const rule = this.data().flags?.['sinGreenwashing'];
    const flags: Record<string, boolean> = rule?.scenario ? { sinGreenwashing: a[rule.scenario] !== rule.not } : {};
    this.save(this.pts(), items, a, `${this.pts()} de ${this.data().max} granos en las crisis.`, flags);
    this.ended.set(true);
  }

  retry() {
    this.sc.set(0);
    this.vals.set([...this.data().start]);
    this.answers.set({});
    this.chosen.set(null);
    this.ended.set(false);
  }
}

const clamp = (v: number) => Math.max(0, Math.min(100, v));
