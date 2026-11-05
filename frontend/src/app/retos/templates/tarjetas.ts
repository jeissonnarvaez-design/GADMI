import { Component, computed, input, signal } from '@angular/core';
import { FeedbackItem } from '../../core/models/models';
import { Escuchar } from '../../shared/escuchar';
import { Granos } from '../../shared/grano';
import { GameHeader } from '../../shared/game-header';
import { Personaje } from '../../shared/personaje';
import { RetoBase } from '../reto-base';
import { RetoEnd } from '../reto-end';
import type { TCard, TRound, TarjetasReto } from '../reto.types';

interface Flat { card: TCard; round: TRound }
interface Answers { ok: Record<string, boolean>; picks: Record<string, string> }

/** Plantilla 1 · clasificar tarjeta por tarjeta (diseño Ejercicio11). */
@Component({
  selector: 'app-reto-tarjetas',
  imports: [GameHeader, Granos, Personaje, RetoEnd, Escuchar],
  templateUrl: './tarjetas.html',
  styles: `
    @keyframes cardIn{from{opacity:0;transform:translateY(30px) rotate(-3deg)}to{opacity:1;transform:none}}
    @keyframes pop{0%{opacity:0;transform:scale(.6)}70%{transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
    @keyframes float{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-40px)}}
    .cardIn{animation:cardIn .5s cubic-bezier(.2,.7,.2,1) both}
    .pop{animation:pop .45s cubic-bezier(.2,.7,.2,1) both}
    .float{animation:float 1.2s ease-out .3s both}
    .zone{transition:transform .15s}.zone:hover{transform:translateY(-3px)}
    a:focus-visible,button:focus-visible{outline:3px solid #231417;outline-offset:3px}
    @media (prefers-reduced-motion: reduce){.cardIn,.pop,.float{animation:none}.zone{transition:none}}
  `,
})
export class RetoTarjetas extends RetoBase<TarjetasReto> {
  data = input.required<TarjetasReto>();

  flat = computed<Flat[]>(() => this.data().rounds.flatMap((round) => round.cards.map((card) => ({ card, round }))));
  queue = signal<number[]>([]);
  pos = signal(0);
  phase = signal<'play' | 'fb' | 'end'>('play');
  ok = signal<Record<string, boolean>>({});
  picks = signal<Record<string, string>>({});
  lastOk = signal(false);

  ngOnInit() {
    const prev = this.progress.lastAnswers<Answers>(this.data().id);
    if (prev) {
      this.ok.set(prev.ok ?? {});
      this.picks.set(prev.picks ?? {});
      this.phase.set('end');
    } else {
      this.queue.set(this.flat().map((_, i) => i));
    }
  }

  cur = computed(() => this.flat()[this.queue()[this.pos()]]);
  /** Rótulo «PASO n/N»: cada ronda de tarjetas es un paso. */
  paso = computed(() => {
    const rounds = this.data().rounds;
    const n = this.phase() === 'end' || !this.cur() ? rounds.length : rounds.indexOf(this.cur()!.round) + 1;
    return n + '/' + rounds.length;
  });
  right = computed(() => Object.keys(this.ok()).length);
  score = computed(() => this.flat().filter((f) => this.ok()[f.card.id]).reduce((s, f) => s + f.card.points, 0));
  wrong = computed(() => this.flat().map((f, i) => ({ f, i })).filter((x) => !this.ok()[x.f.card.id]).map((x) => x.i));
  dots = computed(() => this.queue().map((_, i) => (i < this.pos() ? '#8A1428' : i === this.pos() ? '#FF836C' : '#E2D6C8')));
  prompt = computed(() => this.cur()?.round.prompt ?? this.data().prompt);
  canRetry = computed(() => !this.locked() && this.wrong().length > 0);
  zoneCols = computed(() => (this.data().compact ? 'repeat(auto-fill, minmax(170px, 1fr))' : 'repeat(4, minmax(0, 1fr))'));

  fbTitle = computed(() => {
    const c = this.cur();
    if (!c) return '';
    if (this.lastOk()) return '¡Bien visto!';
    return this.attemptNo() === 1 ? 'Mmm, ahí no.' : 'Va en «' + this.label(c.round, c.card.answer) + '».';
  });
  fbText = computed(() => {
    const c = this.cur();
    if (!c) return '';
    if (this.lastOk() || this.attemptNo() > 1) return c.card.explanation;
    return 'Pista: ' + (c.card.hint ?? c.round.zoneHints?.[c.card.answer] ?? c.round.defaultHint ?? '¿Dónde encaja mejor?');
  });

  label(round: TRound, id: string) {
    return round.zones.find((z) => z.id === id)?.label ?? id;
  }

  pick(zoneId: string) {
    const c = this.cur();
    const hit = c.card.accept ? c.card.accept.includes(zoneId) : c.card.answer === zoneId;
    this.picks.update((p) => ({ ...p, [c.card.id]: zoneId }));
    if (hit) {
      this.ok.update((o) => ({ ...o, [c.card.id]: true }));
      this.speak('¡Bien visto!');
    }
    this.lastOk.set(hit);
    this.phase.set('fb');
  }

  next() {
    if (this.pos() + 1 < this.queue().length) {
      this.pos.update((p) => p + 1);
      this.phase.set('play');
    } else this.finish();
  }

  private finish() {
    const items: FeedbackItem[] = this.flat().map(({ card, round }) => ({
      label: card.text,
      ok: !!this.ok()[card.id],
      hint: card.hint ?? round.zoneHints?.[card.answer] ?? round.defaultHint,
      explanation: this.label(round, card.answer) + '. ' + card.explanation,
    }));
    const flags = this.flagsFrom(this.ok());
    this.save(this.score(), items, { ok: this.ok(), picks: this.picks() } satisfies Answers, `${this.right()} de ${this.flat().length} en su lugar.`, flags);
    this.phase.set('end');
  }

  retry() {
    this.queue.set(this.wrong());
    this.pos.set(0);
    this.phase.set('play');
  }

  listen() {
    this.speak(this.data().listen);
  }
}
