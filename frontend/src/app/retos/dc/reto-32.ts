// @ts-nocheck
/* Reto 3.2 · Liderar en crisis (diseño final: Reto32.dc.html). Generado a partir del prototipo:
   la lógica es la del diseño; el contenido vive en retos/data/3.2.json. */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Feedback } from '../../shared/feedback';
import { Hud } from '../../shared/hud';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/3.2.json';
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

const M = RD.M;
/* Escenarios y valoraciones: documento de la profesora. Efectos en los medidores: valores del prototipo */
const S = RD.S;
const clamp = (v) => Math.max(0, Math.min(100, v));
const sign = (d) => (d > 0 ? '+' + d : d < 0 ? '−' + Math.abs(d) : '0');
@Component({
  selector: 'app-reto-32',
  imports: [RouterLink, Hud, Personaje, Feedback],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 3 · RETO 3.2'" [title]="titulo" [granos]="v().score + ' / ' + max" [salida]="salida()">
    <div centro [attr.aria-label]="(v().attText)" style="display: flex; align-items: center; gap: 8px">@for (p of v().atts; track $index) {<span [style]="'width: 72px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}<span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().attText }}</span></div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1240px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
    
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
      <app-personaje who="nibi" [size]="88" />
      <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; border-style: none"><span class="px" style="font-size: 10px; color: #AC0B32">SITUACIÓN · ESCENARIO DE CRISIS</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().consigna }}</span></div>
      <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; border: none; background: #ffd3c9; cursor: pointer; display: flex; align-items: center; justify-content: center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg></button>
    </div>

    <section class="g2" aria-label="Medidores de la empresa" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px">
      @for (m of v().meters; track $index) {
        <div style="background: #2A0B12; border: 2px solid rgba(255,131,108,0.55); border-radius: 8px; padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; color: #FBF5EC">
          <div style="display: flex; align-items: center; gap: 10px"><span [style]="'width: 10px; height: 10px; border-radius: 2px; background: ' + (m.c)"></span><strong style="flex: 1; font-size: 15px">{{ m.label }}</strong><span class="px" style="font-size: 10px; color: #FFD3C9">{{ m.v }} %</span>@if (m.showD) {<span class="pop px" [style]="'padding: 4px 6px; border-radius: 4px; background: ' + (m.dBg) + '; color: #FFFFFF; font-size: 10px'">{{ m.d }}</span>}</div>
          <div style="height: 12px; border-radius: 999px; background: #1A0609; overflow: hidden"><div [style]="'height: 12px; border-radius: 999px; background: ' + (m.c) + '; width: ' + (m.w) + '; transition: width .7s'"></div></div>
        </div>
      }
    </section>
    <span class="px" style="font-size: 11px; color: #FFD3C9">TU DECISIÓN · ELIGE UNA</span>
    <section class="g4" role="radiogroup" aria-label="Decisiones" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px">
      @for (o of v().opts; track $index) {
        <div role="radio" tabindex="0" [attr.aria-checked]="(o.checked)" [attr.aria-label]="(o.aria)" class="card" (click)="o.pick?.($event)" (keydown)="o.key?.($event)" [style]="'min-height: 190px; box-sizing: border-box; padding: 16px; border-radius: 10px; border: 3px solid ' + (o.bd) + '; background: #FFFFFF; opacity: ' + (o.op) + '; cursor: ' + (o.cur) + '; display: flex; flex-direction: column; gap: 12px'">
          <div style="display: flex; align-items: center; gap: 10px"><span class="px" style="width: 32px; height: 32px; border-radius: 6px; background: #FF836C; color: #1A0609; font-size: 13px; display: flex; align-items: center; justify-content: center">{{ o.k }}</span><span class="px" style="font-size: 10px; color: #AC0B32">{{ o.state }}</span><span aria-hidden="true" [style]="'margin-left: auto; width: 22px; height: 22px; box-sizing: border-box; border-radius: 999px; border: 3px solid ' + (o.rbd) + '; background: ' + (o.rbg)"></span></div>
          <span style="font-size: 15px; font-weight: 700; line-height: 1.35; color: #231417">{{ o.label }}</span>
        </div>
      }
    </section>
    @if (v().result) {
      <section class="up gpanel" aria-live="polite" style="background: #8A1428; padding: 20px; display: flex; flex-direction: column; gap: 14px">
        <span class="px" style="font-size: 10px; color: #FFD3C9">CONSECUENCIA EN TU EMPRESA</span>
        <div class="g2" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px">
          <div style="background: #FFFFFF; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 10px"><span class="px" style="font-size: 10px; color: #AC0B32">TU DECISIÓN</span><span [style]="'font-size: 17px; font-weight: 800; line-height: 1.3; color: ' + (v().rC)">{{ v().rTitle }}</span><span class="px" style="font-size: 10px; color: #8A1428">+{{ v().rPts }} GRANOS</span></div>
          <div style="background: #FFFFFF; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 10px"><span class="px" style="font-size: 10px; color: #AC0B32">QUÉ PASÓ</span><span style="font-size: 15px; font-weight: 700; line-height: 1.4">{{ v().rText }}</span></div>
          <div style="background: #FFFFFF; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 8px"><span class="px" style="font-size: 10px; color: #AC0B32">TU EMPRESA</span>@for (d of v().deltas; track $index) {<div style="display: flex; align-items: center; gap: 8px; font-size: 14px"><span [style]="'width: 10px; height: 10px; border-radius: 2px; background: ' + (d.c)"></span><strong style="flex: 1">{{ d.label }}</strong><span [style]="'font-weight: 800; color: ' + (d.tc)">{{ d.v }}</span></div>}</div>
        </div>
      </section>
    }
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
export class Reto32 extends DcReto {
  readonly ejercicioId = RD.id;
  readonly titulo = RD.title;
  readonly max = RD.max;
  protected override autoRegistro = true;

  constructor() { super(); SAY = (t) => this.speak(t); this.state = { ...this.fresh(), att: 1, best: 0, firstScore: null };  this.restaurar(); }
  fresh() { return { sc: 0, vals: [50, 50, 50], sel: null, chosen: null, pts: 0, done: false, fb: null }; }
  confirm() { const { sc, vals, sel, pts, chosen } = this.state; if (sel == null || chosen != null) return; const o = S[sc].o[sel]; this.setState({ chosen: sel, pts: pts + o[2], vals: vals.map((v, j) => clamp(v + o[1][j])) }); }
  renderVals() {
    const { sc, vals, sel, chosen, pts, done, fb, att, best, firstScore } = this.state;
    const s = S[sc], ch = chosen != null ? s.o[chosen] : null, total = Math.max(best, pts);
    const situ = done ? 'Superaste las tres crisis.' : s.t;
    return {
      consigna: situ, listen: () => SAY(situ),
      atts: [0, 1, 2].map((k) => (k < sc || done ? '#FFD3C9' : k === sc ? '#FF836C' : '#4A2A2F')), attText: done ? 'RETO TERMINADO · INTENTO ' + att + ' DE 2' : 'CRISIS ' + (sc + 1) + ' DE 3 · INTENTO ' + att + ' DE 2',
      score: total, scoreAria: total + ' granos de 90',
      meters: M.map(([label, c], i) => { const d = ch ? ch[1][i] : 0; return { label, c, v: vals[i], w: vals[i] + '%', showD: !!ch && d !== 0, d: sign(d), dBg: d > 0 ? '#3F7E44' : '#AC0B32' }; }),
      opts: s.o.map((o, i) => {
        const on = sel === i, isCh = chosen === i, closed = chosen != null || done; const good = o[2] >= 18;
        const pick = () => { if (!closed) this.setState({ sel: on ? null : i }); };
        return { k: 'ABCD'[i], label: o[0], checked: on ? 'true' : 'false', aria: 'Opción ' + 'ABCD'[i] + ': ' + o[0],
          bd: isCh ? (good ? '#3F7E44' : '#AC0B32') : on ? '#FF836C' : '#FFFFFF', op: closed && !isCh ? '0.55' : '1', cur: closed ? 'default' : 'pointer',
          state: isCh ? 'TU DECISIÓN' : on ? 'ELEGIDA' : '', rbd: on || isCh ? '#FF836C' : '#B5A9A6', rbg: on || isCh ? '#FF836C' : '#FFFFFF', pick, key: keyAct(pick) };
      }),
      result: !!ch && !done, rTitle: ch ? ch[3] : '', rText: ch ? ch[4] : '', rPts: ch ? ch[2] : 0, rC: ch && ch[2] >= 18 ? '#2C5E31' : '#8A1428',
      deltas: M.map(([label, c], i) => { const d = ch ? ch[1][i] : 0; return { label, c, v: sign(d), tc: d > 0 ? '#2C5E31' : d < 0 ? '#AC0B32' : '#5C4A4D' }; }),
      ...fbVals(fb), badge: done && firstScore === 90,
      canRound: (!!ch && !done) || (done && att === 1 && pts < 90), roundLabel: done ? 'INTENTAR DE NUEVO (2 DE 2)' : sc < 2 ? 'SIGUIENTE CRISIS' : 'VER RESULTADO',
      nextRound: () => {
        if (done) { this.setState({ ...this.fresh(), att: 2 }); return; }
        if (sc < 2) { this.setState({ sc: sc + 1, sel: null, chosen: null }); return; }
        const nb = Math.max(best, pts);
        this.setState({ done: true, best: nb, firstScore: att === 1 ? pts : firstScore, fb: { ok: pts >= 60, t: 'Ganaste ' + pts + ' de 90 granos.', x: att === 1 && pts < 90 ? 'Tienes un segundo intento y se guarda el mejor puntaje.' : 'Se guarda tu mejor puntaje: ' + nb + ' granos.' } });
      },
      canCheck: chosen == null && !done, ...btn(sel != null), checkLabel: 'Confirmar decisión', check: () => this.confirm(),
      canClear: false, clearAll: () => {},
      done, nextHref: '/reto/3.3', nextLabel: 'RETO 3.3'
    };
  }
}
