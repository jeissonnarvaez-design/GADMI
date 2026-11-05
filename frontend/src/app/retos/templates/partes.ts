import { Component, computed, input, signal } from '@angular/core';
import { FeedbackItem } from '../../core/models/models';
import { Escuchar } from '../../shared/escuchar';
import { Granos } from '../../shared/grano';
import { GameHeader } from '../../shared/game-header';
import { Personaje } from '../../shared/personaje';
import { RetoBase } from '../reto-base';
import { RetoEnd } from '../reto-end';
import type { PChoicePart, PItem, POption, PPart, PartesReto, PTextPart } from '../reto.types';

interface Answers { picks: Record<string, Record<string, string>>; text: Record<string, string> }

/** Plantilla 2 · clasificar por partes (diseño Reto12). */
@Component({
  selector: 'app-reto-partes',
  imports: [GameHeader, Granos, Personaje, RetoEnd, Escuchar],
  templateUrl: './partes.html',
  styles: `
    @keyframes pop{0%{opacity:0;transform:scale(.7)}70%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
    @keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
    .pop{animation:pop .4s cubic-bezier(.2,.7,.2,1) both}
    .up{animation:up .4s cubic-bezier(.2,.7,.2,1) both}
    a{color:#FBF5EC}
    a:focus-visible,button:focus-visible,input:focus-visible{outline:3px solid #FBF5EC;outline-offset:3px;box-shadow:0 0 0 6px #231417;}
    @media (prefers-reduced-motion: reduce){.pop,.up{animation:none}}
  `,
})
export class RetoPartes extends RetoBase<PartesReto> {
  data = input.required<PartesReto>();

  partIdx = signal(0);
  picks = signal<Record<string, Record<string, string>>>({});
  text = signal<Record<string, string>>({});
  checked = signal<Record<string, boolean>>({});
  phase = signal<'play' | 'end'>('play');

  ngOnInit() {
    const prev = this.progress.lastAnswers<Answers>(this.data().id);
    if (prev) {
      this.picks.set(prev.picks ?? {});
      this.text.set(prev.text ?? {});
      this.phase.set('end');
    }
  }

  part = computed<PPart>(() => this.data().parts[this.partIdx()]);
  /** Rótulo «PASO n/N»: cada parte es un paso. */
  paso = computed(() => (this.phase() === 'end' ? this.data().parts.length : this.partIdx() + 1) + '/' + this.data().parts.length);
  choice = computed(() => (this.part().type === 'choice' ? (this.part() as PChoicePart) : null));
  textPart = computed(() => (this.part().type === 'text' ? (this.part() as PTextPart) : null));
  isChecked = computed(() => !!this.checked()[this.part().key]);
  isLast = computed(() => this.partIdx() === this.data().parts.length - 1);
  nextKey = computed(() => this.data().parts[this.partIdx() + 1]?.key ?? '');
  /** En el 2.º intento (o al cerrar) se muestran las respuestas. */
  reveal = computed(() => this.attemptNo() > 1 || this.locked());

  itemsOf(p: PChoicePart): PItem[] {
    if (!p.fromPart) return p.items;
    const src = this.picks()[p.fromPart.part] ?? {};
    return p.items.filter((i) => src[i.id] === p.fromPart!.answer);
  }
  optionsOf(p: PChoicePart, it: PItem): POption[] {
    return it.options ?? p.options ?? [];
  }
  pickOf(p: PPart, it: PItem) {
    return this.picks()[p.key]?.[it.id];
  }
  isRight(p: PPart, it: PItem) {
    const v = this.pickOf(p, it);
    if (v === undefined || it.answer === null) return false;
    return it.accept ? it.accept.includes(v) : v === it.answer;
  }
  placed = computed(() => {
    const p = this.choice();
    return p ? this.itemsOf(p).filter((it) => this.pickOf(p, it) !== undefined).length : 0;
  });
  total = computed(() => {
    const p = this.choice();
    return p ? this.itemsOf(p).length : 0;
  });

  /** Puntos de las partes ya revisadas en este intento (o todas al cerrar). */
  score = computed(() => {
    let s = 0;
    for (const p of this.data().parts) {
      if (this.phase() !== 'end' && !this.checked()[p.key]) continue;
      if (p.type === 'text') s += (this.text()[p.key] ?? '').trim().length >= p.minLength ? p.points : 0;
      else for (const it of this.itemsOf(p)) if (this.isRight(p, it)) s += it.points;
    }
    return s;
  });

  correctMap = computed(() => {
    const m: Record<string, boolean> = {};
    for (const p of this.data().parts) if (p.type === 'choice') for (const it of p.items) m[p.key + ':' + it.id] = this.isRight(p, it);
    return m;
  });
  wrongCount = computed(() => Object.values(this.correctMap()).filter((v) => !v).length);
  brilloOn = computed(() => {
    const p = this.choice();
    return !!p?.brillo && this.isChecked() && this.picks()[p.key]?.[p.brillo.item] === p.brillo.answer;
  });

  fb(p: PChoicePart, it: PItem) {
    const ok = this.isRight(p, it);
    if (ok) return '✓ ' + (p.optionFeedback?.[it.answer ?? ''] ?? it.explanation ?? 'Bien.');
    if (!this.reveal()) return '↺ ' + p.hint;
    const right = this.optionsOf(p, it).find((o) => o.id === it.answer)?.label;
    return '↺ ' + (right ? 'Era «' + right + '». ' : '') + (p.optionFeedback?.[it.answer ?? ''] ?? it.explanation ?? '');
  }

  pick(p: PChoicePart, it: PItem, o: POption) {
    if (this.isChecked() || this.phase() === 'end') return;
    this.picks.update((all) => ({ ...all, [p.key]: { ...(all[p.key] ?? {}), [it.id]: o.id } }));
  }
  setText(v: string) {
    this.text.update((t) => ({ ...t, [this.part().key]: v }));
  }
  check() {
    this.checked.update((c) => ({ ...c, [this.part().key]: true }));
  }
  toNext() {
    this.partIdx.update((i) => i + 1);
  }

  finish() {
    this.checked.update((c) => ({ ...c, [this.part().key]: true }));
    const items: FeedbackItem[] = [];
    for (const p of this.data().parts) {
      if (p.type === 'text') {
        const ok = (this.text()[p.key] ?? '').trim().length >= p.minLength;
        items.push({ label: p.label, ok, hint: p.help, explanation: 'Suma por completarla.' });
      } else {
        for (const it of this.itemsOf(p)) items.push({ label: `Parte ${p.key} · ${it.text}`, ok: this.isRight(p, it), hint: p.hint, explanation: it.explanation ?? '' });
      }
    }
    const points = this.score();
    this.save(points, items, { picks: this.picks(), text: this.text() } satisfies Answers, `${points} de ${this.data().max} granos.`, this.flagsFrom(this.correctMap()));
    this.phase.set('end');
  }

  retry() {
    this.checked.set({});
    this.partIdx.set(0);
    this.phase.set('play');
  }

  canRetry = computed(() => !this.locked() && this.score() < this.data().max);
  optBg(p: PPart, it: PItem, o: POption) {
    const on = this.pickOf(p, it) === o.id;
    if (this.isChecked() && on && (p as PChoicePart).optionStyle === 'circle') return this.isRight(p, it) ? '#3F7E44' : '#AC0B32';
    return on ? '#231417' : '#FFFFFF';
  }
}
