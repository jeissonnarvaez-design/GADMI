// @ts-nocheck
/* Reto 2.3 · Presupuesto de talento humano (diseño final: Reto23.dc.html). Generado a partir del prototipo:
   la lógica es la del diseño; el contenido vive en retos/data/2.3.json. */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Feedback } from '../../shared/feedback';
import { Hud } from '../../shared/hud';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/2.3.json';
import { DcReto } from './dc-reto';

const RD: any = DATA;
/** Voz de Teo (se conecta en el constructor). */
let SAY: (t: string) => void = () => {};
const keyAct = (fn) => (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };
const stop = (e) => { if (e && e.stopPropagation) e.stopPropagation(); };
const fmt = (n) => String(Math.round(n * 10) / 10).replace('.', ',');
const fbVals = (fb) => ({ fbShow: !!fb, fbTitle: fb ? fb.t : '', fbText: fb ? fb.x : '', fbBg: fb && fb.ok ? '#EAF4E6' : '#FFF0EC', fbColor: fb && fb.ok ? '#2C5E31' : '#8A1428' });
const attVals = (att, done) => ({ atts: [att === 1 && !done ? '#FF836C' : '#FFD3C9', att === 2 && !done ? '#FF836C' : done && att === 2 ? '#FFD3C9' : '#4A2A2F'], attText: done ? 'RETO TERMINADO' : 'INTENTO ' + att + ' DE 2' });
const btn = (ok) => ({ checkDis: ok ? 'false' : 'true', checkBg: ok ? '#AC0B32' : '#4A2A2F', checkFg: ok ? '#FFFFFF' : '#C9B8A6', checkCursor: ok ? 'pointer' : 'not-allowed' });

const CONSIGNA = RD.CONSIGNA;
const CAR = RD.CAR;
const TOPE = RD.TOPE, FACTOR = RD.FACTOR, PAD = RD.PAD;
const JUST = RD.JUST;
const mid = (c) => (c[1] + c[2]) / 2;
@Component({
  selector: 'app-reto-23',
  imports: [RouterLink, Hud, Personaje, Feedback],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 2 · RETO 2.3'" [title]="titulo" [granos]="v().score + ' / ' + max" [salida]="salida()">
    <div centro [attr.aria-label]="(v().attText)" style="display: flex; align-items: center; gap: 8px">@for (p of v().atts; track $index) {<span [style]="'width: 72px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}<span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().attText }}</span></div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1240px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
    
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
      <app-personaje who="nibi" [size]="88" />
      <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; border-style: none"><span class="px" style="font-size: 10px; color: #AC0B32">SITUACIÓN · NÓMINA DEL AÑO</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().consigna }}</span></div>
      <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; border: none; background: #ffd3c9; cursor: pointer; display: flex; align-items: center; justify-content: center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg></button>
    </div>

    <div class="g2" style="display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 20px; align-items: start">
      <section aria-label="Salarios de los cargos clave" style="background: #FFFFFF; border-radius: 12px; padding: 18px 22px; box-shadow: 0 14px 30px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 14px">
        <span class="px" style="font-size: 10px; color: #AC0B32">SALARIO MENSUAL · COP MILLONES</span>
        @for (c of v().cargos; track $index) {
          <div class="gd" [style]="'display: grid; grid-template-columns: 210px minmax(0, 1fr) 70px; align-items: center; gap: 14px; padding: 8px 10px; border-radius: 8px; background: ' + (c.rowBg)">
            <div style="display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">{{ c.name }}</strong><span style="font-size: 12px; font-weight: 700; color: #6E5458">Rango salarial: {{ c.band }} M/mes</span>@if (c.showFb) {<span [style]="'font-size: 12px; font-weight: 800; color: ' + (c.fbc)">{{ c.fb }}</span>}</div>
            <div style="position: relative; padding-top: 4px"><span aria-hidden="true" [style]="'position: absolute; top: 9px; left: ' + (c.bandL) + '; width: ' + (c.bandW) + '; height: 10px; border-radius: 999px; background: rgba(63,126,68,0.35); pointer-events: none'"></span><input type="range" [attr.min]="(c.min)" [attr.max]="(c.max)" step="0.5" [value]="(c.v)" (input)="c.set?.($event)" [attr.aria-label]="(c.aria)" style="width: 100%; accent-color: #AC0B32"></div>
            <span style="font-size: 22px; font-weight: 800; text-align: right; color: #231417">{{ c.vt }}</span>
          </div>
        }
      </section>
      <aside aria-label="Resumen de la nómina" style="display: flex; flex-direction: column; gap: 14px">
        <section style="background: #FFFFFF; border-radius: 12px; padding: 18px 20px; box-shadow: 0 14px 30px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 10px">
          <span class="px" style="font-size: 10px; color: #AC0B32">SUMA MENSUAL FRENTE AL TOPE</span>
          <div style="display: flex; align-items: baseline; gap: 8px"><span [style]="'font-size: 44px; font-weight: 800; line-height: 1; color: ' + (v().sumC)">{{ v().sumT }}</span><span style="font-size: 18px; font-weight: 800; color: #5C4A4D">/ 46 M</span></div>
          <span aria-hidden="true" style="display: block; height: 12px; border-radius: 999px; background: #F1E8E4; overflow: hidden"><span [style]="'display: block; height: 100%; width: ' + (v().sumW) + '; background: ' + (v().sumC)"></span></span>
          <span style="font-size: 14px; font-weight: 700; color: #5C4A4D">Costo anual con prestaciones (× 1,52): <strong style="color: #231417">{{ v().annual }} M</strong></span>
        </section>
        <section role="radiogroup" aria-label="Justificación" style="background: #FFFFFF; border-radius: 12px; padding: 18px 20px; box-shadow: 0 14px 30px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 8px">
          <span class="px" style="font-size: 10px; color: #AC0B32">¿POR QUÉ REPARTISTE ASÍ?</span>
          @for (j of v().just; track $index) {
            <div role="radio" tabindex="0" [attr.aria-checked]="(j.on)" (click)="j.pick?.($event)" (keydown)="j.key?.($event)" [style]="'padding: 10px 12px; border-radius: 8px; border: 2px solid ' + (j.bd) + '; background: ' + (j.bg) + '; cursor: pointer; display: flex; align-items: flex-start; gap: 10px'">
              <span aria-hidden="true" [style]="'width: 18px; height: 18px; margin-top: 1px; flex-shrink: 0; box-sizing: border-box; border-radius: 999px; border: 3px solid ' + (j.rbd) + '; background: ' + (j.rbg)"></span>
              <span style="font-size: 14px; font-weight: 600; line-height: 1.35; color: #231417">{{ j.t }}</span>
            </div>
          }
          @if (v().justFbShow) {<span [style]="'font-size: 13px; font-weight: 800; color: ' + (v().justFbC)">{{ v().justFb }}</span>}
        </section>
      </aside>
    </div>
    <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap; min-height: 52px">
      @if (v().fbShow) {
        <app-feedback class="pop" [ok]="v().fbColor === '#2C5E31'" [titulo]="v().fbTitle" [texto]="v().fbText" />
      }
      @if (v().badge) {<span class="pop px" style="padding: 8px 12px; border-radius: 999px; background: #FCC30B; color: #3A2A00; font-size: 11px">★ INSIGNIA · A LA PRIMERA</span>}
      <span style="flex: 1"></span>
      @if (v().canClear) {<button type="button" (click)="v().clearAll?.($event)" aria-label="Limpiar" style="height: 44px; padding: 0 16px; border: 2px solid rgba(255,131,108,0.55); border-radius: 6px; background: transparent; color: #FFD3C9; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; cursor: pointer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD3C9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"></path></svg>Limpiar</button>}
      @if (v().canCheck) {<button type="button" class="gbtn" (click)="v().check?.($event)" [attr.aria-disabled]="(v().checkDis)" [style]="'min-height: 52px; padding: 0 24px; border: none; background: ' + (v().checkBg) + '; color: ' + (v().checkFg) + '; font-weight: 800; font-size: 16px; cursor: ' + (v().checkCursor)">{{ v().checkLabel }}</button>}
      @if (v().done) {<a class="gbtn glow pop" [routerLink]="after().link" style="display: inline-flex; align-items: center; min-height: 52px; padding: 0 24px; background: #FF836C; color: #1A0609; text-decoration: none"><span class="px" style="font-size: 11px">▶ {{ after().label }}</span></a>}
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
export class Reto23 extends DcReto {
  readonly ejercicioId = RD.id;
  readonly titulo = RD.title;
  readonly max = RD.max;
  protected override autoRegistro = true;

  constructor() { super(); SAY = (t) => this.speak(t); this.state = { v: CAR.map(mid), j: null, att: 1, res: null, best: 0, first: null, done: false, fb: null };  this.restaurar(); }
  evalNow() {
    const { v, j } = this.state;
    const inBand = v.map((x, i) => x >= CAR[i][1] && x <= CAR[i][2]);
    const sum = v.reduce((a, b) => a + b, 0);
    const r = { inBand, allBand: inBand.every(Boolean), sumOk: sum <= TOPE, justOk: j != null && JUST[j][1] };
    r.pts = (r.allBand ? 18 : 0) + (r.sumOk ? 12 : 0) + (r.justOk ? 10 : 0);
    return r;
  }
  /* Dos intentos; cuenta el mejor */
  check() {
    const { att, best } = this.state; const r = this.evalNow(); const nb = Math.max(best, r.pts);
    if (r.pts === 40 || att === 2) { this.setState({ res: r, best: nb, done: true, first: att === 1 ? r.pts : this.state.first, fb: r.pts === 40 ? { ok: true, t: '¡Nómina equilibrada!', x: 'Priorizaste sin pasarte del tope.' } : { ok: false, t: 'Así queda tu nómina.', x: 'Revisa los rangos, el tope y la justificación.' } }); return; }
    const miss = []; if (!r.allBand) miss.push('hay salarios fuera de su rango'); if (!r.sumOk) miss.push('la suma pasa el tope'); if (!r.justOk) miss.push('revisa tu justificación');
    this.setState({ res: r, best: nb, att: 2, first: r.pts, fb: { ok: false, t: 'Casi: ' + miss.join(', ') + '.', x: 'Intento 2 de 2.' } });
  }
  renderVals() {
    const { v, j, att, res, best, first, done, fb } = this.state;
    const set = (patch) => { if (!done) this.setState({ ...patch, res: null }); };
    const sum = v.reduce((a, b) => a + b, 0), over = sum > TOPE;
    return {
      consigna: CONSIGNA, listen: () => SAY(CONSIGNA), ...attVals(att, done), score: best, scoreAria: best + ' granos de 40',
      cargos: CAR.map(([name, lo, hi], i) => {
        const min = lo - PAD, max = hi + PAD, x = v[i], ok = x >= lo && x <= hi, show = !!res;
        return { name, band: lo + ' a ' + hi, min, max, v: x, vt: fmt(x), aria: name + ': ' + fmt(x) + ' millones',
          bandL: ((lo - min) / (max - min) * 100) + '%', bandW: ((hi - lo) / (max - min) * 100) + '%',
          rowBg: show && !ok ? '#FFF0EC' : '#FFFFFF', showFb: show, fb: ok ? '✓ Dentro de su rango' : '↺ Fuera de su rango salarial', fbc: ok ? '#2C5E31' : '#8A1428',
          set: (e) => { const nv = v.slice(); nv[i] = parseFloat(e.target.value); set({ v: nv }); } };
      }),
      sumT: fmt(sum), sumC: over ? '#AC0B32' : '#2C5E31', sumW: Math.min(100, sum / TOPE * 100) + '%', annual: fmt(sum * 12 * FACTOR),
      just: JUST.map(([t], k) => { const on = j === k; const pick = () => set({ j: k }); return { t, on: on ? 'true' : 'false', bd: on ? '#AC0B32' : '#EFE6E6', bg: on ? '#FFF0EC' : '#FFFFFF', rbd: on ? '#AC0B32' : '#B5A9A6', rbg: on ? '#AC0B32' : '#FFFFFF', pick, key: keyAct(pick) }; }),
      justFbShow: !!res && j != null, justFb: res && j != null ? (JUST[j][1] ? '✓ Coherente con el diagnóstico.' : done ? '↺ ' + JUST[j][2] + ' Las coherentes son la primera y la segunda.' : '↺ Revisa: ¿se apoya en el diagnóstico de la empresa?') : '', justFbC: res && j != null && JUST[j][1] ? '#2C5E31' : '#8A1428',
      ...fbVals(fb), badge: done && first === 40,
      canCheck: !done, ...btn(j != null), checkLabel: 'Comprobar', check: () => { if (j != null) this.check(); },
      canClear: !done, clearAll: () => set({ v: CAR.map(mid), j: null }),
      done, nextHref: '/reto/2.5', nextLabel: 'RETO 2.5'
    };
  }
}
