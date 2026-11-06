// @ts-nocheck
/* Reto 3.3 · Comunicación (diseño final: Reto33.dc.html). Generado a partir del prototipo:
   la lógica es la del diseño; el contenido vive en retos/data/3.3.json. */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Feedback } from '../../shared/feedback';
import { Hud } from '../../shared/hud';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/3.3.json';
import { DcReto } from './dc-reto';

const RD: any = DATA;
/** Voz de Teo (se conecta en el constructor). */
let SAY: (t: string) => void = () => {};
const keyAct = (fn) => (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };
const stop = (e) => { if (e && e.stopPropagation) e.stopPropagation(); };
const fmt = (n) => String(Math.round(n * 10) / 10).replace('.', ',');
const fbVals = (fb) => ({ fbShow: !!fb, fbTitle: fb ? fb.t : '', fbText: fb ? fb.x : '', fbBg: fb && fb.ok ? '#EAF4E6' : '#FFF0EC', fbColor: fb && fb.ok ? '#2C5E31' : '#8A1428', fbIcon: fb && fb.ok ? '✓' : '↺' });
const attVals = (att, done) => ({ atts: [att === 1 && !done ? '#FF836C' : '#FFD3C9', att === 2 && !done ? '#FF836C' : done && att === 2 ? '#FFD3C9' : '#4A2A2F'], attText: done ? 'RETO TERMINADO' : 'INTENTO ' + att + ' DE 2' });
const btn = (ok) => ({ checkDis: ok ? 'false' : 'true', checkBg: ok ? '#AC0B32' : '#4A2A2F', checkFg: ok ? '#FFFFFF' : '#C9B8A6', checkCursor: ok ? 'pointer' : 'not-allowed' });

const CONSIGNA = RD.CONSIGNA;
/* Mensaje y canal esperados: documento de la profesora (índice 0 antes de mezclar).
   Distractores: BORRADOR redactado según la nota de la profesora (exageran logros u ocultan información). Validar con ella. */
const W = RD.W;
const MO = RD.MO, CO = RD.CO; /* orden mezclado */
@Component({
  selector: 'app-reto-33',
  imports: [RouterLink, Hud, Personaje, Feedback],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 3 · RETO 3.3'" [title]="titulo" [granos]="v().score + ' / ' + max" [salida]="salida()">
    <div centro [attr.aria-label]="(v().attText)" style="display: flex; align-items: center; gap: 8px">@for (p of v().atts; track $index) {<span [style]="'width: 72px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}<span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().attText }}</span></div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1240px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
    
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
      <app-personaje who="chispa" [size]="88" />
      <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; border-style: none"><span class="px" style="font-size: 10px; color: #AC0B32">SITUACIÓN · HAY QUE COMUNICAR</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().consigna }}</span></div>
      <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; border: none; background: #ffd3c9; cursor: pointer; display: flex; align-items: center; justify-content: center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg></button>
    </div>

    <section aria-label="Situaciones" style="display: flex; flex-direction: column; gap: 14px">
      @for (w of v().rows; track $index) {
        <div class="gd" [style]="'background: #FFFFFF; border-radius: 12px; border: 3px solid ' + (w.bd) + '; padding: 16px 18px; display: grid; grid-template-columns: 240px minmax(0, 1.6fr) minmax(0, 1fr); gap: 18px; align-items: start; box-shadow: 0 10px 24px rgba(0,0,0,0.25)'">
          <div style="display: flex; flex-direction: column; gap: 6px"><span class="px" style="font-size: 10px; color: #AC0B32">SITUACIÓN {{ w.n }}</span><strong style="font-size: 16px; line-height: 1.3; color: #231417">{{ w.sit }}</strong>@if (w.showFb) {<span [style]="'font-size: 12px; font-weight: 800; line-height: 1.35; color: ' + (w.fbc)">{{ w.fb }}</span>}</div>
          <div role="radiogroup" aria-label="Mensaje" style="display: flex; flex-direction: column; gap: 6px"><span style="font-size: 12px; font-weight: 800; color: #6E5458">Mensaje</span>
            @for (o of w.msgs; track $index) {<div role="radio" tabindex="0" [attr.aria-checked]="(o.on)" (click)="o.pick?.($event)" (keydown)="o.key?.($event)" [style]="'padding: 8px 10px; border-radius: 8px; border: 2px solid ' + (o.bd) + '; background: ' + (o.bg) + '; font-size: 14px; font-weight: 600; line-height: 1.35; color: #231417; cursor: ' + (o.cur)">{{ o.t }}</div>}
          </div>
          <div role="radiogroup" aria-label="Canal" style="display: flex; flex-direction: column; gap: 6px"><span style="font-size: 12px; font-weight: 800; color: #6E5458">Canal</span>
            @for (o of w.chans; track $index) {<div role="radio" tabindex="0" [attr.aria-checked]="(o.on)" (click)="o.pick?.($event)" (keydown)="o.key?.($event)" [style]="'padding: 8px 10px; border-radius: 8px; border: 2px solid ' + (o.bd) + '; background: ' + (o.bg) + '; font-size: 14px; font-weight: 600; line-height: 1.35; color: #231417; cursor: ' + (o.cur)">{{ o.t }}</div>}
          </div>
        </div>
      }
    </section>
    <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap; min-height: 52px">
      @if (v().fbShow) {
        <app-feedback class="pop" [ok]="v().fbColor === '#2C5E31'" [titulo]="v().fbTitle" [texto]="v().fbText" />
      }
      @if (v().badge) {<span class="pop px" style="padding: 8px 12px; border-radius: 999px; background: #FCC30B; color: #3A2A00; font-size: 11px">★ INSIGNIA · A LA PRIMERA</span>}
      <span style="flex: 1"></span>
      @if (v().canClear) {<button type="button" (click)="v().clearAll?.($event)" aria-label="Limpiar" style="height: 44px; padding: 0 16px; border: 2px solid rgba(255,131,108,0.55); border-radius: 6px; background: transparent; color: #FFD3C9; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; cursor: pointer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD3C9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"></path></svg>Limpiar</button>}
      @if (v().canRound) {<button type="button" class="gbtn glow pop" (click)="v().nextRound?.($event)" style="min-height: 52px; padding: 0 24px; border: none; background: #FF836C; color: #1A0609; cursor: pointer"><span class="px" style="font-size: 14px">▶ {{ v().roundLabel }}</span></button>}
      @if (v().canCheck) {<button type="button" class="gbtn" (click)="v().check?.($event)" [attr.aria-disabled]="(v().checkDis)" [style]="'min-height: 52px; padding: 0 24px; border: none; background: ' + (v().checkBg) + '; color: ' + (v().checkFg) + '; font-weight: 800; font-size: 16px; cursor: ' + (v().checkCursor)">{{ v().checkLabel }}</button>}
      @if (v().done) {<a class="gbtn glow pop" [routerLink]="after().link" style="display: inline-flex; align-items: center; min-height: 52px; padding: 0 24px; background: #FF836C; color: #1A0609; text-decoration: none"><span class="px" style="font-size: 14px">▶ {{ after().label }}</span></a>}
    </div>
  </main>
</div>`,
  styles: `/* devanagari */
/* vietnamese */
/* latin-ext */
/* latin */
/* latin-ext */
/* latin */
/* latin-ext */
/* latin */
    @media (max-width: 760px){
      .g2{grid-template-columns:1fr !important} .g4,.gd{grid-template-columns:repeat(2,minmax(0,1fr)) !important}
      main{padding-left:12px !important;padding-right:12px !important;overflow-wrap:anywhere}
      main [style*="white-space: nowrap"]{white-space:normal !important}
      main [style*="max-width"]{max-width:100% !important}
      .lienzo{overflow-x:auto}
    }
  `,
})
export class Reto33 extends DcReto {
  readonly ejercicioId = RD.id;
  readonly titulo = RD.title;
  readonly max = RD.max;
  protected override autoRegistro = true;

  constructor() { super(); SAY = (t) => this.speak(t); this.state = { m: {}, c: {}, att: 1, res: null, best: 0, first: null, done: false, fb: null };  this.restaurar(); }
  evalNow() { const { m, c } = this.state; const per = W.map((_, i) => ({ msg: m[i] === 0, ch: c[i] === 0 })); return { per, pts: per.reduce((s, p) => s + (p.msg ? 7 : 0) + (p.ch ? 3 : 0), 0) }; }
  check() {
    const { att, best } = this.state; const r = this.evalNow(); const nb = Math.max(best, r.pts);
    if (r.pts === 30 || att === 2) { this.setState({ res: r, best: nb, done: true, first: att === 1 ? r.pts : this.state.first, fb: r.pts === 30 ? { ok: true, t: '¡Comunicas con claridad!', x: 'Mensaje honesto y canal adecuado.' } : { ok: false, t: 'Así se comunica mejor.', x: 'Mira el mensaje y el canal esperados.' } }); return; }
    this.setState({ res: r, best: nb, att: 2, first: r.pts, fb: { ok: false, t: 'Ganaste ' + r.pts + ' de 30 granos.', x: 'Revisa las situaciones en rojo. Intento 2 de 2.' } });
  }
  renderVals() {
    const { m, c, att, res, best, first, done, fb } = this.state;
    const ready = W.every((_, i) => m[i] != null && c[i] != null);
    const opt = (list, order, sel, i, kind) => order.map((k) => { const on = sel[i] === k, sol = done && k === 0;
      const pick = () => { if (!done) this.setState({ [kind]: { ...sel, [i]: k }, res: null }); };
      return { t: list[k], on: on ? 'true' : 'false', bd: sol ? '#3F7E44' : on ? '#AC0B32' : '#EFE6E6', bg: sol ? '#EAF4E6' : on ? '#FFF0EC' : '#FFFFFF', cur: done ? 'default' : 'pointer', pick, key: keyAct(pick) }; });
    return {
      consigna: CONSIGNA, listen: () => SAY(CONSIGNA), ...attVals(att, done), score: best, scoreAria: best + ' granos de 30',
      rows: W.map(([sit, msgs, chans], i) => {
        const p = res ? res.per[i] : null, ok = p && p.msg && p.ch;
        const fb = !p ? '' : ok ? '✓ Mensaje y canal adecuados.' : done ? '→ En verde, lo esperado.' : (!p.msg ? '↺ Revisa el mensaje: ¿exagera o esconde algo? ' : '') + (!p.ch ? '↺ Revisa el canal.' : '');
        return { n: i + 1, sit, msgs: opt(msgs, MO[i], m, i, 'm'), chans: opt(chans, CO[i], c, i, 'c'),
          bd: p ? (ok ? '#3F7E44' : '#AC0B32') : '#FFFFFF', showFb: !!p, fb, fbc: ok ? '#2C5E31' : '#8A1428' };
      }),
      ...fbVals(fb), badge: done && first === 30,
      canCheck: !done, ...btn(ready), checkLabel: 'Comprobar', check: () => { if (ready) this.check(); },
      canClear: !done && (Object.keys(m).length + Object.keys(c).length > 0), clearAll: () => this.setState({ m: {}, c: {}, res: null }),
      done, nextHref: '/reto/3.4', nextLabel: 'RETO 3.4'
    };
  }
}
