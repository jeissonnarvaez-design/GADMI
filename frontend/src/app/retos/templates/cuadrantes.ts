import { Component, computed, input, signal } from '@angular/core';
import { FeedbackItem } from '../../core/models/models';
import { Escuchar } from '../../shared/escuchar';
import { Granos } from '../../shared/grano';
import { GameHeader } from '../../shared/game-header';
import { Personaje } from '../../shared/personaje';
import { RetoBase } from '../reto-base';
import { RetoEnd } from '../reto-end';
import type { CuadrantesReto, QQuadrant } from '../reto.types';

interface Answers { quadrants: Record<string, string>; strategy: string }

/** Plantilla 3 · ubicar en cuadrantes (diseño Reto13). */
@Component({
  selector: 'app-reto-cuadrantes',
  imports: [GameHeader, Granos, Personaje, RetoEnd, Escuchar],
  templateUrl: './cuadrantes.html',
  styles: `
    @keyframes pop{0%{opacity:0;transform:scale(.7)}70%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
    @keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
    .pop{animation:pop .4s cubic-bezier(.2,.7,.2,1) both}
    .up{animation:up .4s cubic-bezier(.2,.7,.2,1) both}
    a:focus-visible,button:focus-visible{outline:3px solid #FF836C;outline-offset:3px}
    @media (prefers-reduced-motion: reduce){.pop,.up{animation:none}}
  `,
})
export class RetoCuadrantes extends RetoBase<CuadrantesReto> {
  data = input.required<CuadrantesReto>();

  queue = signal<number[]>([]);
  i = signal(0);
  placed = signal<Record<string, string>>({});
  order = signal<string[]>([]);
  fb = signal<{ ok: boolean; msg: string } | null>(null);
  strat = signal<string>('');
  stratChosen = signal(false);
  phase = signal<'cards' | 'strategy' | 'end'>('cards');

  ngOnInit() {
    const prev = this.progress.lastAnswers<Answers>(this.data().id);
    if (prev) {
      this.placed.set(prev.quadrants ?? {});
      this.order.set(this.data().cards.map((c) => c.id).filter((id) => prev.quadrants?.[id]));
      this.strat.set(prev.strategy ?? '');
      this.stratChosen.set(!!prev.strategy);
      this.phase.set('end');
    } else this.queue.set(this.data().cards.map((_, k) => k));
  }

  cur = computed(() => this.data().cards[this.queue()[Math.min(this.i(), this.queue().length - 1)]]);
  num = computed(() => this.data().cards.indexOf(this.cur()) + 1);
  okCard = (id: string) => this.placed()[id] === this.data().cards.find((c) => c.id === id)!.answer;
  right = computed(() => this.data().cards.filter((c) => this.okCard(c.id)).length);
  stratOk = computed(() => !!this.data().strategy.options.find((o) => o.id === this.strat())?.correct);
  score = computed(() => this.right() * this.data().cardPoints + (this.stratChosen() && this.stratOk() ? this.data().strategy.points : 0));
  wrongCards = computed(() => this.data().cards.map((c, k) => ({ c, k })).filter((x) => !this.okCard(x.c.id)).map((x) => x.k));
  canRetry = computed(() => !this.locked() && this.score() < this.data().max);
  stepLabel = computed(() => (this.phase() === 'cards' ? 'PARTE A' : 'PARTE B'));
  /** Rótulo «PASO n/N»: paso 1 = tarjetas, paso 2 = estrategia. */
  paso = computed(() => (this.phase() === 'cards' ? '1/2' : '2/2'));
  teoSays = computed(() => (this.phase() === 'cards' ? this.data().prompt : this.data().strategy.prompt));

  board = computed(() =>
    this.data().quadrants.map((q) => ({
      q,
      items: this.order().filter((id) => this.placed()[id] === q.id).map((id) => {
        const c = this.data().cards.find((x) => x.id === id)!;
        return { t: (this.okCard(id) ? '' : '↺ ') + c.text, ok: this.okCard(id) };
      }),
    })),
  );

  quadLabel(id: string) {
    return this.data().quadrants.find((q) => q.id === id)!;
  }

  pick(q: QQuadrant) {
    const c = this.cur();
    const ok = c.answer === q.id;
    const real = this.quadLabel(c.answer);
    let msg: string;
    if (ok) msg = '✓ Bien: ' + q.hint;
    else if (c.trap && c.trap.pick === q.id) msg = '↺ ' + c.trap.text;
    else if (this.attemptNo() === 1) msg = '↺ Pista: ¿la empresa lo controla? ¿Le ayuda o le juega en contra?';
    else msg = '↺ Era ' + real.label.toLowerCase() + ': ' + real.hint;
    this.placed.update((p) => ({ ...p, [c.id]: q.id }));
    this.order.update((o) => [...o.filter((x) => x !== c.id), c.id]);
    this.fb.set({ ok, msg });
    if (this.i() + 1 < this.queue().length) this.i.update((v) => v + 1);
    else {
      this.i.set(this.queue().length);
      if (this.attemptNo() > 1 && this.stratChosen() && this.stratOk()) this.finish();
      else {
        this.stratChosen.set(false);
        this.phase.set('strategy');
      }
    }
  }

  pickStrategy(id: string) {
    if (this.stratChosen()) return;
    this.strat.set(id);
    this.stratChosen.set(true);
  }

  stratText = computed(() => {
    const o = this.data().strategy.options.find((x) => x.id === this.strat());
    if (!o) return '';
    if (o.correct || this.attemptNo() > 1) return o.feedback + (o.correct ? '' : ' La correcta: ' + this.data().strategy.options.find((x) => x.correct)!.text);
    return o.feedback + ' ' + this.data().strategy.hint;
  });

  finish() {
    const items: FeedbackItem[] = this.data().cards.map((c) => ({
      label: c.text,
      ok: this.okCard(c.id),
      hint: c.trap?.text ?? '¿Interno o externo? ¿Ayuda o perjudica?',
      explanation: this.quadLabel(c.answer).label + '. ' + this.quadLabel(c.answer).hint,
    }));
    items.push({ label: 'Estrategia FO', ok: this.stratOk(), hint: this.data().strategy.hint, explanation: this.data().strategy.options.find((x) => x.correct)!.text });
    this.save(this.score(), items, { quadrants: this.placed(), strategy: this.strat() } satisfies Answers, `${this.right()} de ${this.data().cards.length} tarjetas en su cuadrante.`);
    this.phase.set('end');
  }

  retry() {
    this.queue.set(this.wrongCards());
    this.i.set(0);
    this.fb.set(null);
    if (!this.stratOk()) this.stratChosen.set(false);
    this.phase.set(this.wrongCards().length ? 'cards' : 'strategy');
  }

  stratBg(id: string, correct: boolean) {
    return this.strat() === id && this.stratChosen() ? (correct ? '#EAF4E6' : '#FFF0EC') : '#FBF5EC';
  }
  stratBd(id: string, correct: boolean) {
    return this.strat() === id && this.stratChosen() ? (correct ? '#3F7E44' : '#AC0B32') : '#FBF5EC';
  }
}
