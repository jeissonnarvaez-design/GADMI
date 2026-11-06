// @ts-nocheck
/* Reto 3.4 · Tablero de clima (diseño final: Reto34.dc.html). Generado a partir del prototipo:
   la lógica es la del diseño; el contenido vive en retos/data/3.4.json. */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Feedback } from '../../shared/feedback';
import { Hud } from '../../shared/hud';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/3.4.json';
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
/* Catálogo, pertinencia y umbrales de referencia: documento de la profesora */
const CAT = RD.CAT;
const ORDER = RD.ORDER;
/* Valores del tablero tras 3.2 (demostración) */
/* Valores del tablero: parten de los de referencia y se ajustan con las decisiones del 3.2
   (Clima → índice de clima; Productividad → % de la meta de productividad). */
let NOW = { ...RD.NOW };
const desde32 = (est) => {
  const n = { ...RD.NOW };
  const vals = est && Array.isArray(est.vals) ? est.vals : null;
  if (vals) {
    n.clima = Math.max(40, Math.min(100, Math.round(vals[0])));
    n.prod = Math.max(50, Math.min(150, Math.round(50 + vals[1])));
  }
  return n;
};
/* BORRADOR: lecturas redactadas para el prototipo (el documento no las trae). Validar con la profesora. */
const READ = RD.READ;
const within = (v, ref) => Math.abs(v - ref) <= Math.abs(ref) * 0.2 + 0.0001;
@Component({
  selector: 'app-reto-34',
  imports: [RouterLink, Hud, Personaje, Feedback],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 3 · RETO 3.4'" [title]="titulo" [granos]="v().score + ' / ' + max" [salida]="salida()">
    <div centro [attr.aria-label]="(v().attText)" style="display: flex; align-items: center; gap: 8px">@for (p of v().atts; track $index) {<span [style]="'width: 72px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}<span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().attText }}</span></div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1240px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
    
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
      <app-personaje who="nibi" [size]="88" />
      <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; border-style: none"><span class="px" style="font-size: 10px; color: #AC0B32">SITUACIÓN · ¿CÓMO VA EL EQUIPO?</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().consigna }}</span></div>
      <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; border: none; background: #ffd3c9; cursor: pointer; display: flex; align-items: center; justify-content: center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg></button>
    </div>

    <span class="px" style="font-size: 11px; color: #FFD3C9">{{ v().partText }}</span>
    @if (v().pA) {
      <section class="g4" aria-label="Catálogo de indicadores" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px">
        @for (c of v().cat; track $index) {
          <button type="button" class="card" (click)="c.toggle?.($event)" [attr.aria-pressed]="(c.on)" [style]="'text-align: left; min-height: 96px; box-sizing: border-box; padding: 14px; border-radius: 10px; border: 3px solid ' + (c.bd) + '; background: ' + (c.bg) + '; color: #231417; cursor: ' + (c.cur) + '; display: flex; flex-direction: column; gap: 8px'">
            <div style="display: flex; align-items: flex-start; gap: 8px"><strong style="flex: 1; font-size: 15px; line-height: 1.3">{{ c.t }}</strong><span aria-hidden="true" [style]="'width: 22px; height: 22px; flex-shrink: 0; box-sizing: border-box; border-radius: 6px; border: 2px solid ' + (c.cbd) + '; background: ' + (c.cbg) + '; color: #FFFFFF; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center'">{{ c.mark }}</span></div>
            @if (c.showFb) {<span [style]="'font-size: 12px; font-weight: 800; color: ' + (c.fbc)">{{ c.fb }}</span>}
          </button>
        }
      </section>
    }
    @if (v().pB) {
      <section aria-label="Umbrales del semáforo" style="background: #FFFFFF; border-radius: 12px; padding: 18px 22px; box-shadow: 0 14px 30px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 12px">
        <span class="px" style="font-size: 10px; color: #AC0B32">¿DESDE QUÉ VALOR EL INDICADOR ESTÁ EN VERDE?</span>
        @for (t of v().th; track $index) {
          <div class="gd" [style]="'display: grid; grid-template-columns: 260px minmax(0, 1fr) 110px; align-items: center; gap: 14px; padding: 8px 10px; border-radius: 8px; background: ' + (t.rowBg)">
            <div style="display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">{{ t.name }}</strong><span style="font-size: 12px; font-weight: 700; color: #6E5458">{{ t.rule }}</span>@if (t.showFb) {<span [style]="'font-size: 12px; font-weight: 800; color: ' + (t.fbc)">{{ t.fb }}</span>}</div>
            <input type="range" [attr.min]="(t.min)" [attr.max]="(t.max)" [attr.step]="(t.step)" [value]="(t.v)" (input)="t.set?.($event)" [attr.aria-label]="(t.aria)" style="width: 100%; accent-color: #3F7E44">
            <span style="font-size: 20px; font-weight: 800; text-align: right">{{ t.vt }}</span>
          </div>
        }
      </section>
    }
    @if (v().pC) {
      <div class="g2" style="display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 20px; align-items: start">
        <section class="g2" aria-label="Tu tablero de clima" style="background: #2A0B12; border: 2px solid rgba(255,131,108,0.55); border-radius: 12px; padding: 16px 18px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; color: #FBF5EC">
          <span class="px" style="grid-column: 1 / -1; font-size: 10px; color: #FFD3C9">TU TABLERO · DESPUÉS DE LAS CRISIS (3.2)</span>
          @for (d of v().dash; track $index) {
            <div style="background: #1A0609; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 6px"><div style="display: flex; align-items: center; gap: 8px"><span aria-hidden="true" [style]="'width: 14px; height: 14px; border-radius: 999px; background: ' + (d.c)"></span><strong style="font-size: 14px">{{ d.name }}</strong></div><span style="font-size: 26px; font-weight: 800">{{ d.val }}</span><span style="font-size: 12px; font-weight: 700; color: #C9B8A6">{{ d.lbl }} · meta {{ d.goal }}</span></div>
          }
        </section>
        <section role="radiogroup" aria-label="Lectura del tablero" style="background: #FFFFFF; border-radius: 12px; padding: 18px 20px; box-shadow: 0 14px 30px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 8px">
          <span class="px" style="font-size: 10px; color: #AC0B32">¿QUÉ TE DICE EL TABLERO?</span>
          @for (o of v().reads; track $index) {<div role="radio" tabindex="0" [attr.aria-checked]="(o.on)" (click)="o.pick?.($event)" (keydown)="o.key?.($event)" [style]="'padding: 10px 12px; border-radius: 8px; border: 2px solid ' + (o.bd) + '; background: ' + (o.bg) + '; font-size: 14px; font-weight: 600; line-height: 1.35; color: #231417; cursor: ' + (o.cur)">{{ o.t }}</div>}
        </section>
      </div>
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
export class Reto34 extends DcReto {
  readonly ejercicioId = RD.id;
  readonly titulo = RD.title;
  readonly max = RD.max;
  protected override autoRegistro = true;

  constructor() { super(); SAY = (t) => this.speak(t); NOW = desde32(this.progress.attempts('m3-crisis').at(-1)?.answers?.estado); this.state = { part: 'A', sel: {}, thr: {}, read: null, att: 1, res: null, ptsA: 0, ptsB: 0, ptsC: 0, firstAll: true, done: false, fb: null };  this.restaurar(); }
  chosen() { return CAT.map((c, i) => i).filter((i) => this.state.sel[i]); }
  check() {
    const { part, att, firstAll, thr, read } = this.state;
    if (part === 'A') {
      const ch = this.chosen(), good = ch.filter((i) => CAT[i][2]).length, pts = good * 8;
      if (pts === 32 || att === 2) { this.setState({ res: { a: true }, ptsA: Math.max(this.state.ptsA, pts), firstAll: firstAll && att === 1 && pts === 32, fb: pts === 32 ? { ok: true, t: 'Indicadores pertinentes.', x: 'Ahora define sus umbrales.' } : { ok: false, t: good + ' de 4 son pertinentes.', x: 'Los que no miden clima ni liderazgo quedan fuera.' } }); return; }
      this.setState({ res: { a: false }, ptsA: pts, att: 2, firstAll: false, fb: { ok: false, t: good + ' de 4 son pertinentes.', x: 'Hay indicadores que no miden clima ni liderazgo. Intento 2 de 2.' } }); return;
    }
    if (part === 'B') {
      const ch = this.chosen().filter((i) => CAT[i][2]); const okN = ch.filter((i) => within(thr[i] != null ? thr[i] : this.def(i), CAT[i][3])).length, pts = okN * 3;
      if (okN === ch.length || att === 2) { this.setState({ res: { b: true }, ptsB: Math.max(this.state.ptsB, pts), firstAll: firstAll && att === 1 && okN === ch.length, fb: { ok: okN === ch.length, t: okN + ' de ' + ch.length + ' umbrales son razonables.', x: 'Ahora mira cómo queda tu tablero.' } }); return; }
      this.setState({ res: { b: false }, ptsB: pts, att: 2, firstAll: false, fb: { ok: false, t: okN + ' de ' + ch.length + ' umbrales son razonables.', x: 'Revisa los marcados en rojo. Intento 2 de 2.' } }); return;
    }
    const ok = READ[read][1], pts = ok ? 6 : 0;
    if (ok || att === 2) { this.setState({ res: { c: true }, ptsC: Math.max(this.state.ptsC, pts), done: true, firstAll: firstAll && att === 1 && ok, fb: ok ? { ok: true, t: '¡Buena lectura!', x: 'El tablero sirve para decidir.' } : { ok: false, t: 'La lectura esperada es la primera.', x: 'La rotación sigue por encima de la meta.' } }); return; }
    this.setState({ res: { c: false }, att: 2, firstAll: false, fb: { ok: false, t: 'Revisa tu lectura.', x: '¿Qué indicador está lejos de su meta? Intento 2 de 2.' } });
  }
  def(i) { const c = CAT[i]; return Math.round(((c[6] + c[7]) / 2) / c[8]) * c[8]; }
  renderVals() {
    const { part, sel, thr, read, att, res, ptsA, ptsB, ptsC, firstAll, done, fb } = this.state;
    const pA = part === 'A', pB = part === 'B', pC = part === 'C', ch = this.chosen(), total = ptsA + ptsB + ptsC;
    const stepDone = res && (res.a === true || res.b === true);
    const chosenOk = ch.filter((i) => CAT[i][2]);
    const goodTh = (i) => thr[i] != null ? thr[i] : this.def(i);
    const status = (i) => { const c = CAT[i], v = NOW[c[0]], t = goodTh(i); const okv = c[4] === 'min' ? v >= t : v <= t; const near = c[4] === 'min' ? v >= t * 0.9 : v <= t * 1.1; return okv ? ['#56C02B', 'EN VERDE'] : near ? ['#FCC30B', 'EN AMARILLO'] : ['#FF5A4E', 'EN ROJO']; };
    return {
      consigna: CONSIGNA, listen: () => SAY(CONSIGNA),
      atts: ['A', 'B', 'C'].map((k) => (k === part && !done ? '#FF836C' : (part > k || done) ? '#FFD3C9' : '#4A2A2F')), attText: done ? 'RETO TERMINADO' : 'PARTE ' + part + ' · INTENTO ' + att + ' DE 2',
      score: total, scoreAria: total + ' granos de 50',
      partText: pA ? 'PARTE A · ELIGE 4 INDICADORES DEL CATÁLOGO (' + ch.length + '/4)' : pB ? 'PARTE B · FIJA LOS UMBRALES DEL SEMÁFORO' : 'PARTE C · LEE TU TABLERO',
      pA, pB, pC,
      cat: ORDER.map((i) => { const c = CAT[i], on = !!sel[i]; const show = pA && !!res && on;
        return { t: c[1], on: on ? 'true' : 'false', bd: on ? '#AC0B32' : '#FFFFFF', bg: '#FFFFFF', cbd: on ? '#AC0B32' : '#B5A9A6', cbg: on ? '#AC0B32' : '#FFFFFF', mark: on ? '✓' : '', cur: stepDone ? 'default' : 'pointer',
          showFb: show, fb: c[2] ? '✓ Pertinente' : res && res.a === true ? '✖ No mide clima ni liderazgo' : '↺ ¿Mide clima o liderazgo?', fbc: c[2] ? '#2C5E31' : '#8A1428',
          toggle: () => { if (stepDone) return; const n = { ...sel }; if (on) delete n[i]; else if (ch.length < 4) n[i] = true; this.setState({ sel: n, res: null }); } }; }),
      th: chosenOk.map((i) => { const c = CAT[i], v = goodTh(i), ok = within(v, c[3]), show = pB && !!res;
        return { name: c[1], rule: c[4] === 'min' ? 'Está en verde si llega a este valor o más' : 'Está en verde si baja a este valor o menos', min: c[6], max: c[7], step: c[8], v, vt: fmt(v) + (c[5] === '%' || c[5].indexOf('%') === 0 ? ' %' : c[5] === 'h' ? ' h' : ''),
          aria: c[1] + ': umbral ' + fmt(v), rowBg: show && !ok ? '#FFF0EC' : '#FFFFFF', showFb: show, fb: ok ? '✓ Umbral razonable' : res && res.b === true ? '→ Lo recomendable: ' + c[3] + ' ' + c[5] + (c[4] === 'min' ? ' o más' : ' o menos') : '↺ Revisa: ¿es exigente y realista?', fbc: ok ? '#2C5E31' : '#8A1428',
          set: (e) => { if (!stepDone) this.setState({ thr: { ...thr, [i]: parseFloat(e.target.value) }, res: null }); } }; }),
      dash: chosenOk.map((i) => { const c = CAT[i], [col, lbl] = status(i); const v = NOW[c[0]]; return { name: c[1], val: fmt(v) + (c[5].indexOf('%') === 0 ? ' %' : c[5] === 'h' ? ' h' : ''), c: col, lbl, goal: (c[4] === 'min' ? '≥ ' : '≤ ') + fmt(goodTh(i)) }; }),
      reads: READ.map(([t, ok], k) => { const on = read === k, sol = done && ok; const pick = () => { if (!done) this.setState({ read: k, res: null }); };
        return { t, on: on ? 'true' : 'false', bd: sol ? '#3F7E44' : on ? '#AC0B32' : '#EFE6E6', bg: sol ? '#EAF4E6' : on ? '#FFF0EC' : '#FFFFFF', cur: done ? 'default' : 'pointer', pick, key: keyAct(pick) }; }),
      ...fbVals(fb), badge: done && firstAll,
      canRound: !!stepDone && !done, roundLabel: pA ? 'PARTE B' : 'PARTE C',
      nextRound: () => this.setState({ part: pA ? 'B' : 'C', att: 1, res: null, fb: null }),
      canCheck: !stepDone && !done, ...btn(pA ? ch.length === 4 : pB ? true : read != null), checkLabel: pA ? 'Comprobar (' + ch.length + '/4)' : 'Comprobar',
      check: () => { if (pA ? ch.length === 4 : pB ? true : read != null) this.check(); },
      canClear: false, clearAll: () => {},
      done, nextHref: '/bitacora/3', nextLabel: 'CERRAR MÓDULO'
    };
  }
}
