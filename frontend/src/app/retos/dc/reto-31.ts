// @ts-nocheck
/* Reto 3.1 · Dilemas (diseño final: Reto31.dc.html). Generado a partir del prototipo:
   la lógica es la del diseño; el contenido vive en retos/data/3.1.json. */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Feedback } from '../../shared/feedback';
import { Hud } from '../../shared/hud';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/3.1.json';
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
const CH = RD.CH;
/* clave: 'pos' = práctica sostenible · 'e' ético · 'a' ambiental · 'ea' ético y ambiental */
const R = RD.R;
const LAB = RD.LAB;
const LNAME = RD.LNAME;
/* Se acepta cualquier etiqueta que incluya la correcta */
const okLab = (user, key) => user === key || (user === 'ea' && key !== 'pos');
@Component({
  selector: 'app-reto-31',
  imports: [RouterLink, Hud, Personaje, Feedback],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 3 · RETO 3.1'" [title]="titulo" [granos]="v().score + ' / ' + max" [salida]="salida()">
    <div centro [attr.aria-label]="(v().attText)" style="display: flex; align-items: center; gap: 8px">@for (p of v().atts; track $index) {<span [style]="'width: 72px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}<span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().attText }}</span></div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1240px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
    
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
      <app-personaje who="teo" [size]="88" />
      <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; border-style: none"><span class="px" style="font-size: 10px; color: #AC0B32">SITUACIÓN · DILEMAS DEL DÍA A DÍA</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().consigna }}</span></div>
      <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; border: none; background: #ffd3c9; cursor: pointer; display: flex; align-items: center; justify-content: center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg></button>
    </div>

    <span class="px" style="font-size: 11px; color: #FFD3C9">{{ v().topic }} · INTENTO {{ v().attN }} DE 2</span>
    <section class="g2" aria-label="Enunciados" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px">
      @for (c of v().cards; track $index) {
        <div [style]="'background: #FFFFFF; border-radius: 10px; border: 3px solid ' + (c.bd) + '; overflow: hidden; display: flex; flex-direction: column'">
          <div style="padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; flex: 1">
            <div style="display: flex; align-items: flex-start; gap: 10px"><span class="px" style="width: 30px; height: 30px; flex-shrink: 0; border-radius: 6px; background: #FF836C; color: #1A0609; font-size: 13px; display: flex; align-items: center; justify-content: center">{{ c.k }}</span><span style="font-size: 16px; font-weight: 700; line-height: 1.35; color: #231417">{{ c.text }}</span></div>
            <div class="g2" role="radiogroup" aria-label="Clasificación" style="margin-top: auto; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px">
              @for (l of c.ch; track $index) {<button type="button" (click)="l.pick?.($event)" [attr.aria-pressed]="(l.on)" [style]="'min-height: 42px; border-radius: 8px; border: 2px solid ' + (l.bd) + '; background: ' + (l.bg) + '; color: ' + (l.fg) + '; font-size: 13px; font-weight: 800; cursor: ' + (l.cur)">{{ l.t }}</button>}
            </div>
          </div>
          @if (c.showFb) {<div class="up" [style]="'padding: 10px 14px; background: ' + (c.fbBg) + '; font-size: 13px; font-weight: 700; line-height: 1.3; color: ' + (c.fbc)">{{ c.fb }}</div>}
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
export class Reto31 extends DcReto {
  readonly ejercicioId = RD.id;
  readonly titulo = RD.title;
  readonly max = RD.max;
  protected override autoRegistro = true;

  constructor() { super(); SAY = (t) => this.speak(t); this.state = { r: 0, pos: null, lab: {}, att: 1, res: null, best: [0, 0, 0, 0], firstAll: true, roundDone: false, done: false, fb: null };  this.restaurar(); }
  roundScore() {
    const { r, lab } = this.state; const S = R[r][1]; const tp = S.findIndex((x) => x[1] === 'pos');
    const posMarked = S.map((x, i) => i).filter((i) => lab[i] === 'pos');
    const posOk = posMarked.length === 1 && posMarked[0] === tp; let pts = posOk ? 10 : 0; const wrong = {};
    S.forEach((x, i) => {
      if (i === tp) { if (lab[i] !== 'pos') wrong[i] = 'lab'; return; }
      if (lab[i] === 'pos') { wrong[i] = 'pos'; return; }
      if (okLab(lab[i], x[1])) pts += 5; else wrong[i] = 'lab';
    });
    return { pts, wrong };
  }
  check() {
    const { r, att, best, firstAll } = this.state; const res = this.roundScore();
    const nb = best.slice(); nb[r] = Math.max(nb[r], res.pts);
    if (res.pts === 20 || att === 2) { this.setState({ res, best: nb, roundDone: true, firstAll: firstAll && att === 1 && res.pts === 20, fb: res.pts === 20 ? { ok: true, t: '¡Ronda perfecta!', x: 'Ganaste 20 de 20 granos.' } : { ok: false, t: 'Así se resuelve la ronda.', x: 'Ganaste ' + res.pts + ' de 20 granos.' } }); return; }
    this.setState({ res, best: nb, att: 2, firstAll: false, fb: { ok: false, t: 'Ganaste ' + res.pts + ' de 20 granos en esta ronda.', x: 'Revisa las tarjetas marcadas. Intento 2 de 2.' } });
  }
  renderVals() {
    const { r, pos, lab, att, res, best, firstAll, roundDone, done, fb } = this.state;
    const S = R[r][1], tp = S.findIndex((s) => s[1] === 'pos'), closed = roundDone || done;
    const total = best.reduce((a, b) => a + b, 0);
    const ready = S.every((s, i) => !!lab[i]);
    return {
      consigna: CONSIGNA, listen: () => SAY(CONSIGNA),
      atts: [0, 1, 2, 3].map((k) => (k < r || (k === r && done) ? '#FFD3C9' : k === r ? '#FF836C' : '#4A2A2F')), attText: done ? 'RETO TERMINADO' : 'RONDA ' + (r + 1) + ' DE 4',
      score: total, scoreAria: total + ' granos de 80', rn: r + 1, topic: R[r][0], attN: att,
      cards: S.map(([text, key], i) => {
        const showSol = roundDone && res && res.pts < 20, w = res && !roundDone ? res.wrong[i] : null;
        const fbSol = key === 'pos' ? '✓ Es la práctica sostenible.' : '→ Es ' + LNAME[key] + '.';
        return {
          k: 'abc'[i], text,
          ch: CH.map(([k, t, strong, soft, sbd, sfg]) => { const on = lab[i] === k; return { t, on: on ? 'true' : 'false', bg: on ? strong : soft, bd: on ? strong : sbd, fg: on ? '#FFFFFF' : sfg, cur: closed ? 'default' : 'pointer',
            pick: () => { if (!closed) this.setState({ lab: { ...lab, [i]: k }, res: null }); } }; }),
          bd: roundDone ? (key === 'pos' ? '#3F7E44' : '#EFE6E6') : w ? '#AC0B32' : '#FFFFFF',
          showFb: !!w || roundDone, fb: roundDone ? fbSol : w === 'pos' ? '↺ ¿De verdad es sostenible?' : '↺ Revisa cómo la clasificaste.',
          fbBg: roundDone && key === 'pos' ? '#EAF4E6' : '#FFF0EC', fbc: roundDone && key === 'pos' ? '#2C5E31' : '#8A1428'
        };
      }),
      ...fbVals(fb), badge: done && firstAll,
      canRound: roundDone && !done, roundLabel: r < 3 ? 'SIGUIENTE RONDA' : 'VER RESULTADO',
      nextRound: () => (r < 3 ? this.setState({ r: r + 1, lab: {}, att: 1, res: null, roundDone: false, fb: null }) : this.setState({ done: true, fb: { ok: total >= 60, t: 'Ganaste ' + total + ' de 80 granos.', x: 'Detectaste riesgos éticos y ambientales.' } })),
      canCheck: !roundDone && !done, ...btn(ready), checkLabel: 'Comprobar ronda', check: () => { if (ready) this.check(); },
      canClear: !closed && Object.keys(lab).length > 0, clearAll: () => this.setState({ lab: {}, res: null }),
      done, nextHref: '/reto/3.2', nextLabel: 'RETO 3.2'
    };
  }
}
