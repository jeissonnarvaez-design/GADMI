// @ts-nocheck
/* Reto 2.5 · Presupuesto verde (diseño final: Reto25.dc.html). Generado a partir del prototipo:
   la lógica es la del diseño; el contenido vive en retos/data/2.5.json. */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Feedback } from '../../shared/feedback';
import { Hud } from '../../shared/hud';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/2.5.json';
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
const INV = RD.INV;
const TOPE = RD.TOPE, META = RD.META;
const GW = RD.GW;
const SOL = RD.SOL;
@Component({
  selector: 'app-reto-25',
  imports: [RouterLink, Hud, Personaje, Feedback],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 2 · RETO 2.5'" [title]="titulo" [granos]="v().score + ' / ' + max" [salida]="salida()">
    <div centro [attr.aria-label]="(v().attText)" style="display: flex; align-items: center; gap: 8px">@for (p of v().atts; track $index) {<span [style]="'width: 72px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}<span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().attText }}</span></div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1240px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
    
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
      <app-personaje who="chispa" [size]="88" />
      <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; border-style: none"><span class="px" style="font-size: 10px; color: #AC0B32">SITUACIÓN · LA JUNTA APRUEBA FONDOS</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().consigna }}</span></div>
      <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; border: none; background: #ffd3c9; cursor: pointer; display: flex; align-items: center; justify-content: center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg></button>
    </div>

    <div class="g2" style="display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 20px; align-items: stretch">
      <section class="g2" aria-label="Inversiones" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px">
        @for (c of v().inv; track $index) {
          <button type="button" class="card" (click)="c.toggle?.($event)" [attr.aria-pressed]="(c.on)" [attr.aria-label]="(c.aria)" [style]="'text-align: left; min-height: 150px; box-sizing: border-box; padding: 14px 16px; border-radius: 10px; border: 3px solid ' + (c.bd) + '; background: ' + (c.bg) + '; color: #231417; cursor: ' + (c.cur) + '; display: flex; flex-direction: column; gap: 10px'">
            <div style="display: flex; align-items: center; gap: 10px"><span class="px" style="width: 30px; height: 30px; flex-shrink: 0; border-radius: 6px; background: #FF836C; color: #1A0609; font-size: 13px; display: flex; align-items: center; justify-content: center">{{ c.k }}</span><strong style="font-size: 15px; line-height: 1.25">{{ c.t }}</strong><span aria-hidden="true" [style]="'margin-left: auto; width: 24px; height: 24px; flex-shrink: 0; box-sizing: border-box; border-radius: 6px; border: 2px solid ' + (c.cbd) + '; background: ' + (c.cbg) + '; color: #FFFFFF; font-size: 14px; font-weight: 800; display: flex; align-items: center; justify-content: center'">{{ c.mark }}</span></div>
            <div class="g2" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: auto">
              <span style="display: flex; flex-direction: column; font-size: 11px; font-weight: 700; color: #6E5458">Costo<strong style="font-size: 16px; color: #231417">{{ c.cost }} M</strong></span>
              <span style="display: flex; flex-direction: column; font-size: 11px; font-weight: 700; color: #6E5458">CO₂ evitado<strong style="font-size: 16px; color: #231417">{{ c.co2 }} t/año</strong></span>
              <span style="display: flex; flex-direction: column; font-size: 11px; font-weight: 700; color: #6E5458">Ahorro<strong style="font-size: 16px; color: #231417">{{ c.save }} M/año</strong></span>
            </div>
            <span style="font-size: 12px; font-weight: 700; color: #6E5458">Beneficio social: <strong style="color: #231417">{{ c.social }}</strong></span>
          </button>
        }
      </section>
      <aside aria-label="Medidores del presupuesto" style="background: #FFFFFF; border-radius: 12px; padding: 18px 20px; box-shadow: 0 14px 30px rgba(0,0,0,0.3); display: flex; flex-direction: column; justify-content: center; gap: 24px">
        <span class="px" style="font-size: 10px; color: #AC0B32">TU PRESUPUESTO EN TIEMPO REAL</span>
        @for (m of v().meters; track $index) {
          <div style="display: flex; flex-direction: column; gap: 6px">
            <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px"><strong style="font-size: 18px">{{ m.label }}</strong><span [style]="'font-size: 28px; font-weight: 800; color: ' + (m.c)">{{ m.val }}</span></div>
            <span aria-hidden="true" style="position: relative; display: block; height: 16px; border-radius: 999px; background: #F1E8E4; overflow: hidden"><span [style]="'display: block; height: 100%; width: ' + (m.w) + '; background: ' + (m.c)"></span></span>
            <span style="font-size: 14px; font-weight: 700; color: #6E5458">{{ m.note }}</span>
          </div>
        }
        @if (v().msgShow) {
          <div class="up" style="display: flex; flex-direction: column; gap: 6px; padding: 12px 14px; border-radius: 8px; background: #FFF0EC">
            @for (t of v().msgs; track $index) {<span [style]="'font-size: 13px; font-weight: 700; line-height: 1.35; color: ' + (t.c)">{{ t.t }}</span>}
          </div>
        }
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
export class Reto25 extends DcReto {
  readonly ejercicioId = RD.id;
  readonly titulo = RD.title;
  readonly max = RD.max;
  protected override autoRegistro = true;

  constructor() { super(); SAY = (t) => this.speak(t); this.state = { on: {}, att: 1, res: null, best: 0, first: null, done: false, fb: null };  this.restaurar(); }
  totals(on) { return INV.reduce((t, x, i) => (on[i] ? { cost: t.cost + x[2], co2: t.co2 + x[3], save: t.save + x[4] } : t), { cost: 0, co2: 0, save: 0 }); }
  evalNow() {
    const { on } = this.state; const t = this.totals(on);
    const r = { budget: t.cost <= TOPE, co2: t.co2 >= META, social: !!on[3], noAd: !on[5], save: t.save >= 40 };
    r.pts = (r.budget ? 10 : 0) + (r.co2 ? 15 : 0) + (r.social ? 10 : 0) + (r.noAd ? 10 : 0) + (r.save ? 5 : 0);
    return r;
  }
  /* Dos intentos; cuenta el mejor */
  check() {
    const { att, best } = this.state; const r = this.evalNow(); const nb = Math.max(best, r.pts);
    if (r.pts === 50 || att === 2) { this.setState({ res: r, best: nb, done: true, first: att === 1 ? r.pts : this.state.first, fb: r.pts === 50 ? { ok: true, t: '¡Presupuesto verde aprobado!', x: 'Reduces emisiones, ahorras y ayudas a las familias.' } : { ok: false, t: 'Así queda tu presupuesto.', x: 'Ganaste ' + r.pts + ' de 50 granos.' } }); return; }
    this.setState({ res: r, best: nb, att: 2, first: r.pts, fb: { ok: false, t: 'Ganaste ' + r.pts + ' de 50 granos.', x: 'Lee las pistas y ajusta. Intento 2 de 2.' } });
  }
  renderVals() {
    const { on, att, res, best, first, done, fb } = this.state;
    const t = this.totals(on), anyOn = Object.keys(on).some((k) => on[k]);
    const msgs = [];
    if (res) {
      if (!res.budget) msgs.push(['↺ Te pasaste de los 400 millones aprobados.', '#8A1428']);
      if (!res.co2) msgs.push(['↺ Aún no llegas a 150 t de CO₂ evitadas al año.', '#8A1428']);
      if (!res.social) msgs.push(['↺ Falta una inversión con beneficio social directo.', '#8A1428']);
      if (!res.noAd) msgs.push(['↺ ' + GW, '#8A1428']);
      if (!res.save) msgs.push(['↺ Revisa el ahorro anual de tu combinación.', '#8A1428']);
      if (done && res.pts < 50) msgs.push([SOL, '#231417']);
    }
    return {
      consigna: CONSIGNA, listen: () => SAY(CONSIGNA), ...attVals(att, done), score: best, scoreAria: best + ' granos de 50',
      inv: INV.map(([k, tx, cost, co2, save, social], i) => {
        const o = !!on[i];
        return { k, t: tx, cost, co2, save, social: social || 'No', on: o ? 'true' : 'false', aria: tx + (o ? ' (elegida)' : ''),
          bd: o ? '#AC0B32' : '#FFFFFF', bg: '#FFFFFF', cbd: o ? '#AC0B32' : '#B5A9A6', cbg: o ? '#AC0B32' : '#FFFFFF', mark: o ? '✓' : '', cur: done ? 'default' : 'pointer',
          toggle: () => { if (!done) this.setState({ on: { ...on, [i]: !o }, res: null }); } };
      }),
      meters: [
        { label: 'Dinero usado', val: t.cost + ' / 400 M', w: Math.min(100, t.cost / TOPE * 100) + '%', c: t.cost > TOPE ? '#AC0B32' : '#3F7E44', note: t.cost > TOPE ? 'Te pasaste del presupuesto.' : 'Quedan ' + (TOPE - t.cost) + ' M.' },
        { label: 'CO₂ evitado al año', val: t.co2 + ' t', w: Math.min(100, t.co2 / 200 * 100) + '%', c: t.co2 >= META ? '#3F7E44' : '#FF836C', note: 'Meta sugerida: 150 t.' },
        { label: 'Ahorro anual', val: t.save + ' M', w: Math.min(100, t.save / 60 * 100) + '%', c: '#9A5B2E', note: 'Lo que la empresa deja de gastar cada año.' }
      ],
      msgShow: !!res && msgs.length > 0, msgs: msgs.map(([tt, c]) => ({ t: tt, c })),
      ...fbVals(fb), badge: done && first === 50,
      canCheck: !done, ...btn(anyOn), checkLabel: 'Comprobar', check: () => { if (anyOn) this.check(); },
      canClear: !done && anyOn, clearAll: () => this.setState({ on: {}, res: null }),
      done, nextHref: '/bitacora/2', nextLabel: 'CERRAR MÓDULO'
    };
  }
}
