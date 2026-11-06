// @ts-nocheck
/* Reto 4.2 · Cuellos de botella (diseño final: Reto42.dc.html). Generado a partir del prototipo:
   la lógica es la del diseño; el contenido vive en retos/data/4.2.json. */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Feedback } from '../../shared/feedback';
import { Hud } from '../../shared/hud';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/4.2.json';
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
const T = RD.T;
const ST = RD.ST;
/* Estrategia correcta: documento de la profesora. Distractores: BORRADOR según su nota (medidas que no atacan la causa). Validar. */
const S = RD.S;
@Component({
  selector: 'app-reto-42',
  imports: [RouterLink, Hud, Personaje, Feedback],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 4 · RETO 4.2'" [title]="titulo" [granos]="v().score + ' / ' + max" [salida]="salida()">
    <div centro [attr.aria-label]="(v().attText)" style="display: flex; align-items: center; gap: 8px">@for (p of v().atts; track $index) {<span [style]="'width: 72px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}<span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().attText }}</span></div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1240px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
    
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
      <app-personaje who="teo" [size]="88" />
      <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; border-style: none"><span class="px" style="font-size: 10px; color: #AC0B32">SITUACIÓN · REPORTE DE SOSTENIBILIDAD 2027</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().consigna }}</span></div>
      <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; border: none; background: #ffd3c9; cursor: pointer; display: flex; align-items: center; justify-content: center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg></button>
    </div>

    <span class="px" style="font-size: 11px; color: #FFD3C9">{{ v().partText }}</span>
    @if (v().pA) {
      <section aria-label="Reporte de sostenibilidad 2027" style="background: #FFFFFF; border-radius: 12px; padding: 18px 20px; box-shadow: 0 14px 30px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 6px">
        <div class="g4" style="display: grid; grid-template-columns: 40px minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr) 110px; gap: 12px; padding: 0 10px 6px; font-size: 12px; font-weight: 800; color: #6E5458"><span></span><span>Tema</span><span>Resultado 2027</span><span>Meta</span><span>Estado</span></div>
        @for (r of v().rows; track $index) {
          <button type="button" (click)="r.toggle?.($event)" [attr.aria-pressed]="(r.on)" [style]="'display: grid; grid-template-columns: 40px minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr) 110px; gap: 12px; align-items: center; text-align: left; padding: 10px; border-radius: 8px; border: 2px solid ' + (r.bd) + '; background: ' + (r.bg) + '; color: #231417; font-size: 14px; cursor: ' + (r.cur)">
            <span aria-hidden="true" [style]="'width: 22px; height: 22px; box-sizing: border-box; border-radius: 6px; border: 2px solid ' + (r.cbd) + '; background: ' + (r.cbg) + '; color: #FFFFFF; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center'">{{ r.mark }}</span>
            <strong style="font-size: 15px">{{ r.t }}</strong><span style="font-weight: 700">{{ r.res }}</span><span style="font-weight: 600; color: #5C4A4D">{{ r.goal }}</span>
            <span style="display: inline-flex; align-items: center; gap: 6px; font-weight: 800"><span [style]="'width: 14px; height: 14px; border-radius: 999px; background: ' + (r.dot)"></span>{{ r.st }}</span>
          </button>
        }
      </section>
    }
    @if (v().pB) {
      <section class="g2" aria-label="Estrategias" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px">
        @for (s of v().strat; track $index) {
          <div role="radiogroup" [attr.aria-label]="(s.t)" [style]="'background: #FFFFFF; border-radius: 12px; padding: 18px 20px; box-shadow: 0 14px 30px rgba(0,0,0,0.3); border: 3px solid ' + (s.bd) + '; display: flex; flex-direction: column; gap: 8px'">
            <span class="px" style="font-size: 10px; color: #AC0B32">CUELLO DE BOTELLA</span><strong style="font-size: 17px; color: #231417">{{ s.t }}</strong>
            @for (o of s.opts; track $index) {<div role="radio" tabindex="0" [attr.aria-checked]="(o.on)" (click)="o.pick?.($event)" (keydown)="o.key?.($event)" [style]="'padding: 10px 12px; border-radius: 8px; border: 2px solid ' + (o.bd) + '; background: ' + (o.bg) + '; font-size: 14px; font-weight: 600; line-height: 1.35; color: #231417; cursor: ' + (o.cur)">{{ o.t }}</div>}
            @if (s.showFb) {<span [style]="'font-size: 13px; font-weight: 800; color: ' + (s.fbc)">{{ s.fb }}</span>}
          </div>
        }
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
export class Reto42 extends DcReto {
  readonly ejercicioId = RD.id;
  readonly titulo = RD.title;
  readonly max = RD.max;
  protected override autoRegistro = true;

  constructor() { super(); SAY = (t) => this.speak(t); this.state = { part: 'A', mk: {}, att: 1, resA: null, aDone: false, pick: {}, resB: null, ptsA: 0, ptsB: 0, firstAll: true, done: false, fb: null };  this.restaurar(); }
  checkA() {
    const { mk, att, firstAll } = this.state; const n = Object.keys(mk).filter((i) => mk[i] && T[i][3] === 'r').length, pts = n * 10;
    if (n === 3 || att === 2) { this.setState({ resA: true, aDone: true, ptsA: Math.max(this.state.ptsA, pts), firstAll: firstAll && att === 1 && n === 3, fb: n === 3 ? { ok: true, t: '¡Diagnóstico certero!', x: 'Ahora, una estrategia para cada uno.' } : { ok: false, t: n + ' de 3 cuellos de botella.', x: 'Son los tres temas en rojo.' } }); return; }
    this.setState({ resA: false, att: 2, ptsA: pts, firstAll: false, fb: { ok: false, t: 'Encontraste ' + n + ' de 3 cuellos de botella.', x: '¿Cuáles están más lejos de su meta? Intento 2 de 2.' } });
  }
  checkB() {
    const { pick, att, firstAll } = this.state; const ok = S.map((s, i) => pick[i] === 0); const n = ok.filter(Boolean).length, pts = n * 10;
    if (n === 3 || att === 2) { this.setState({ resB: ok, ptsB: Math.max(this.state.ptsB, pts), done: true, firstAll: firstAll && att === 1 && n === 3, fb: n === 3 ? { ok: true, t: '¡Estrategias que atacan la causa!', x: 'Listas para el plan de acción.' } : { ok: false, t: n + ' de 3 estrategias.', x: 'En verde, la que ataca la causa.' } }); return; }
    this.setState({ resB: ok, att: 2, ptsB: pts, firstAll: false, fb: { ok: false, t: n + ' de 3 estrategias atacan la causa.', x: 'Revisa las marcadas en rojo. Intento 2 de 2.' } });
  }
  renderVals() {
    const { part, mk, att, resA, aDone, pick, resB, ptsA, ptsB, firstAll, done, fb } = this.state;
    const pA = part === 'A', pB = part === 'B', total = ptsA + ptsB, nMk = Object.keys(mk).filter((i) => mk[i]).length;
    return {
      consigna: CONSIGNA, listen: () => SAY(CONSIGNA),
      atts: [pA && !aDone ? '#FF836C' : '#FFD3C9', pB && !done ? '#FF836C' : done ? '#FFD3C9' : '#4A2A2F'], attText: done ? 'RETO TERMINADO' : 'PARTE ' + part + ' · INTENTO ' + att + ' DE 2',
      score: total, scoreAria: total + ' granos de 60', pA, pB,
      partText: pA ? 'PARTE A · MARCA 3 CUELLOS DE BOTELLA (' + nMk + '/3)' : 'PARTE B · UNA ESTRATEGIA PARA CADA UNO',
      rows: T.map(([t, res, goal, s], i) => { const on = !!mk[i], show = resA != null && on, ok = s === 'r', sol = aDone && ok;
        return { t, res, goal, dot: ST[s][0], st: ST[s][1], on: on ? 'true' : 'false', cbd: on ? '#AC0B32' : '#B5A9A6', cbg: on ? '#AC0B32' : '#FFFFFF', mark: on ? '✓' : '', cur: aDone ? 'default' : 'pointer',
          bd: sol ? '#3F7E44' : show && !ok ? '#AC0B32' : on ? '#AC0B32' : '#EFE6E6', bg: sol ? '#EAF4E6' : on ? '#FFF0EC' : '#FFFFFF',
          toggle: () => { if (aDone) return; const n = { ...mk }; if (on) delete n[i]; else if (nMk < 3) n[i] = true; this.setState({ mk: n, resA: null }); } }; }),
      strat: S.map(([t, opts, ord], i) => { const show = !!resB, ok = resB && resB[i];
        return { t, bd: show ? (ok ? '#3F7E44' : '#AC0B32') : '#FFFFFF', showFb: show, fb: ok ? '✓ Ataca la causa.' : done ? '→ En verde, la que ataca la causa.' : '↺ ¿Ataca la causa o solo el síntoma?', fbc: ok ? '#2C5E31' : '#8A1428',
          opts: ord.map((k) => { const on = pick[i] === k, sol = done && k === 0; const p = () => { if (!done) this.setState({ pick: { ...pick, [i]: k }, resB: null }); };
            return { t: opts[k], on: on ? 'true' : 'false', bd: sol ? '#3F7E44' : on ? '#AC0B32' : '#EFE6E6', bg: sol ? '#EAF4E6' : on ? '#FFF0EC' : '#FFFFFF', cur: done ? 'default' : 'pointer', pick: p, key: keyAct(p) }; }) }; }),
      ...fbVals(fb), badge: done && firstAll,
      canRound: aDone && pA, roundLabel: 'PARTE B', nextRound: () => this.setState({ part: 'B', att: 1, fb: null }),
      canCheck: pA ? !aDone : !done, ...btn(pA ? nMk === 3 : Object.keys(pick).length === 3), checkLabel: pA ? 'Comprobar (' + nMk + '/3)' : 'Comprobar',
      check: () => { if (pA ? nMk === 3 : Object.keys(pick).length === 3) (pA ? this.checkA() : this.checkB()); },
      canClear: false, clearAll: () => {},
      done, nextHref: '/reto/4.3', nextLabel: 'RETO 4.3'
    };
  }
}
