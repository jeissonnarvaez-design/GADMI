// @ts-nocheck
/* Reto 4.1 · Tablero ESG (diseño final: Reto41.dc.html). Generado a partir del prototipo:
   la lógica es la del diseño; el contenido vive en retos/data/4.1.json. */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Feedback } from '../../shared/feedback';
import { Hud } from '../../shared/hud';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/4.1.json';
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
const I = RD.I;
const ORD = RD.ORD;
const COLS = RD.COLS;
const SUS = RD.SUS;
@Component({
  selector: 'app-reto-41',
  imports: [RouterLink, Hud, Personaje, Feedback],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 4 · RETO 4.1'" [title]="titulo" [granos]="v().score + ' / ' + max" [salida]="salida()">
    <div centro [attr.aria-label]="(v().attText)" style="display: flex; align-items: center; gap: 8px">@for (p of v().atts; track $index) {<span [style]="'width: 72px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}<span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().attText }}</span></div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1240px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
    
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
      <app-personaje who="chispa" [size]="88" />
      <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; border-style: none"><span class="px" style="font-size: 10px; color: #AC0B32">SITUACIÓN · ¿QUÉ MEDIMOS?</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().consigna }}</span></div>
      <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; border: none; background: #ffd3c9; cursor: pointer; display: flex; align-items: center; justify-content: center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg></button>
    </div>

    <span class="px" style="font-size: 11px; color: #FFD3C9">{{ v().partText }}</span>
    @if (v().pA) {
      <section class="g4" aria-label="Indicadores" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px">
        @for (c of v().cat; track $index) {
          <button type="button" class="card" (click)="c.toggle?.($event)" [attr.aria-pressed]="(c.on)" [style]="'text-align: left; min-height: 92px; box-sizing: border-box; padding: 12px 14px; border-radius: 10px; border: 3px solid ' + (c.bd) + '; background: #FFFFFF; color: #231417; cursor: ' + (c.cur) + '; display: flex; flex-direction: column; gap: 6px'">
            <div style="display: flex; align-items: flex-start; gap: 8px"><strong style="flex: 1; font-size: 14px; line-height: 1.3">{{ c.t }}</strong><span aria-hidden="true" [style]="'width: 22px; height: 22px; flex-shrink: 0; box-sizing: border-box; border-radius: 6px; border: 2px solid ' + (c.cbd) + '; background: ' + (c.cbg) + '; color: #FFFFFF; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center'">{{ c.mark }}</span></div>
            @if (c.showFb) {<span [style]="'font-size: 12px; font-weight: 800; color: ' + (c.fbc)">{{ c.fb }}</span>}
          </button>
        }
      </section>
    }
    @if (v().pB) {
      <div style="display: flex; flex-direction: column; gap: 14px">
        <section aria-label="Indicadores por ubicar" (click)="v().trayClick?.($event)" (dragover)="v().allowDrop?.($event)" (drop)="v().dropTray?.($event)" style="min-height: 70px; padding: 12px; border-radius: 8px; border: 5px solid #FF836C; display: flex; flex-wrap: wrap; gap: 10px; align-content: flex-start">
          @for (c of v().tray; track $index) {<button type="button" class="card" draggable="true" (dragstart)="c.drag?.($event)" (click)="c.pick?.($event)" [attr.aria-pressed]="(c.pressed)" [style]="'width: calc(20% - 8px); min-height: 64px; box-sizing: border-box; text-align: center; padding: 8px 10px; border-radius: 8px; border: 3px ' + (c.line) + ' ' + (c.bd) + '; background: #FFFFFF; color: #231417; font-size: 13px; font-weight: 700; line-height: 1.3; cursor: grab; box-shadow: ' + (c.sh) + '; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px'">{{ c.text }}@if (c.review) {<span style="font-size: 11px; color: #8A1428">↺ ¿Qué dimensión cuida?</span>}</button>}
        </section>
        <div class="g4" role="group" aria-label="Tablero ESG" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px">
          @for (z of v().cols; track $index) {
            <div role="button" tabindex="0" [attr.aria-label]="(z.aria)" [class]="(z.cls)" (click)="z.drop?.($event)" (keydown)="z.key?.($event)" (dragover)="v().allowDrop?.($event)" (drop)="z.dropEv?.($event)" [style]="'min-height: 260px; box-sizing: border-box; border-radius: 8px; border: 5px solid #FF836C; background: ' + (z.bg) + '; color: #FBF5EC; padding: 12px; display: flex; flex-direction: column; gap: 8px; cursor: pointer'">
              <div style="display: flex; align-items: center; gap: 10px"><span style="width: 36px; height: 36px; flex-shrink: 0; border-radius: 6px; background: #FF836C; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A0609" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="(z.icon)"></path></svg></span><strong style="font-size: 16px">{{ z.name }}</strong><span class="px" style="margin-left: auto; font-size: 10px; color: #FFD3C9">{{ z.count }}</span></div>
              @for (it of z.items; track $index) {<button type="button" (click)="it.pick?.($event)" [style]="'text-align: left; padding: 7px 9px; border-radius: 6px; border: 2px solid ' + (it.bd) + '; background: ' + (it.bg) + '; color: #231417; font-size: 13px; font-weight: 600; line-height: 1.3; cursor: ' + (it.cursor)"><span [style]="'font-weight: 800; color: ' + (it.mc)">{{ it.mark }}</span>{{ it.text }}@if (it.showGri) {<span style="display: block; margin-top: 3px; font-size: 11px; font-weight: 800; color: #6E5458">{{ it.gri }}</span>}</button>}
            </div>
          }
        </div>
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
export class Reto41 extends DcReto {
  readonly ejercicioId = RD.id;
  readonly titulo = RD.title;
  readonly max = RD.max;
  protected override autoRegistro = true;

  constructor() { super(); SAY = (t) => this.speak(t); this.dragI = null; this.state = { part: 'A', mk: {}, att: 1, resA: null, aDone: false, place: {}, sel: null, locked: {}, review: {}, reveal: {}, ptsA: 0, ptsB: 0, firstAll: true, done: false, fb: null };  this.restaurar(); }
  checkA() {
    const { mk, att, firstAll } = this.state; const ok = I.map((x, i) => !!mk[i] === !!x[1]); const n = ok.filter(Boolean).length, pts = n * 2.5;
    if (n === 12 || att === 2) { this.setState({ resA: ok, aDone: true, ptsA: Math.max(this.state.ptsA, pts), firstAll: firstAll && att === 1 && n === 12, fb: n === 12 ? { ok: true, t: '¡Bien filtrado!', x: 'Ahora arma el tablero.' } : { ok: false, t: n + ' de 12 bien clasificados.', x: 'Los de redes e impresoras no son de sostenibilidad.' } }); return; }
    this.setState({ resA: ok, att: 2, ptsA: pts, firstAll: false, fb: { ok: false, t: n + ' de 12 bien clasificados.', x: 'Revisa los marcados. Intento 2 de 2.' } });
  }
  put(i, k) { const { place, locked, done, review } = this.state; if (i == null || locked[i] || done) return; const r = { ...review }; delete r[i]; this.setState({ place: { ...place, [i]: k }, sel: null, review: r }); }
  unplace(i) { const { place, locked, done } = this.state; if (i == null || locked[i] || done || place[i] == null) return; const p = { ...place }; delete p[i]; this.setState({ place: p, sel: null }); }
  checkB() {
    const { place, locked, att, firstAll } = this.state; const nl = { ...locked }, wrong = [];
    SUS.forEach((i) => { if (locked[i]) return; if (place[i] === I[i][1]) nl[i] = true; else wrong.push(i); });
    const pts = Object.keys(nl).length * 4;
    if (!wrong.length) { this.setState({ locked: nl, ptsB: pts, done: true, firstAll: firstAll && att === 1, fb: { ok: true, t: '¡Tablero ESG listo!', x: 'Cada indicador en su dimensión, con su referencia GRI.' } }); return; }
    if (att === 1) { const p = { ...place }, rv = {}; wrong.forEach((i) => { rv[i] = true; delete p[i]; }); this.setState({ locked: nl, place: p, review: rv, ptsB: pts, att: 2, firstAll: false, fb: { ok: false, t: wrong.length + (wrong.length === 1 ? ' indicador volvió' : ' indicadores volvieron') + ' con una pista.', x: 'Intento 2 de 2.' } }); return; }
    const p = { ...place }, rv = {}; wrong.forEach((i) => { p[i] = I[i][1]; rv[i] = true; });
    this.setState({ locked: nl, place: p, reveal: rv, review: {}, ptsB: pts, done: true, fb: { ok: false, t: 'Así queda el tablero.', x: 'Las marcadas con → muestran su dimensión.' } });
  }
  renderVals() {
    const { part, mk, att, resA, aDone, place, sel, locked, review, reveal, ptsA, ptsB, firstAll, done, fb } = this.state;
    const pA = part === 'A', pB = part === 'B', total = Math.round(ptsA + ptsB), placedN = SUS.filter((i) => place[i]).length;
    const allowDrop = (e) => { if (e && e.preventDefault) e.preventDefault(); };
    const col = (k) => { const items = SUS.filter((i) => place[i] === k), on = sel != null && !done; const drop = () => { if (sel != null) this.put(sel, k); };
      return { name: COLS[k][0], icon: COLS[k][1], count: items.length ? String(items.length) : '', cls: on ? 'zpulse' : '', line: 'solid', bg: on ? '#3A1019' : '#2A0B12', aria: 'Columna ' + COLS[k][0], drop, key: keyAct(drop),
        dropEv: (e) => { allowDrop(e); const i = this.dragI != null ? this.dragI : sel; this.dragI = null; this.put(i, k); },
        items: items.map((i) => { const lk = !!locked[i], rv = !!reveal[i], s = sel === i, free = !lk && !rv && !done;
          return { text: I[i][0], gri: I[i][2], showGri: lk || rv, mark: lk ? '✓ ' : rv ? '→ ' : '', mc: lk ? '#2C5E31' : '#8A1428', bg: lk ? '#EAF4E6' : rv ? '#FFF0EC' : '#FFFFFF', bd: lk ? '#3F7E44' : rv ? '#AC0B32' : s ? '#FF836C' : '#FFFFFF', cursor: free ? 'pointer' : 'default',
            pick: (e) => { stop(e); if (free) this.setState({ sel: s ? null : i }); } }; }) }; };
    return {
      consigna: CONSIGNA, listen: () => SAY(CONSIGNA),
      atts: [pA && !aDone ? '#FF836C' : '#FFD3C9', pB && !done ? '#FF836C' : done ? '#FFD3C9' : '#4A2A2F'], attText: done ? 'RETO TERMINADO' : 'PARTE ' + part + ' · INTENTO ' + att + ' DE 2',
      score: total, scoreAria: total + ' granos de 70', pA, pB,
      partText: pA ? 'PARTE A · MARCA LOS QUE SON DE SOSTENIBILIDAD' : 'PARTE B · UBÍCALOS EN EL TABLERO ESG',
      cat: ORD.map((i) => { const on = !!mk[i], show = !!resA, ok = resA && resA[i];
        return { t: I[i][0], on: on ? 'true' : 'false', bd: show ? (ok ? '#3F7E44' : '#AC0B32') : on ? '#AC0B32' : '#FFFFFF', cbd: on ? '#AC0B32' : '#B5A9A6', cbg: on ? '#AC0B32' : '#FFFFFF', mark: on ? '✓' : '', cur: aDone ? 'default' : 'pointer',
          showFb: show, fb: ok ? '✓' : aDone ? (I[i][1] ? '→ Sí es de sostenibilidad' : '→ No es de sostenibilidad') : '↺ Revisa este', fbc: ok ? '#2C5E31' : '#8A1428',
          toggle: () => { if (!aDone) this.setState({ mk: { ...mk, [i]: !on }, resA: null }); } }; }),
      allowDrop,
      trayClick: () => { if (sel != null && place[sel] != null) this.unplace(sel); },
      dropTray: (e) => { allowDrop(e); const i = this.dragI != null ? this.dragI : sel; this.dragI = null; this.unplace(i); },
      tray: SUS.filter((i) => place[i] == null).map((i) => { const s = sel === i, rv = !!review[i];
        return { text: I[i][0], review: rv, pressed: s ? 'true' : 'false', bd: s || rv ? '#FF836C' : '#FFFFFF', line: rv && !s ? 'dashed' : 'solid', sh: s ? '0 8px 18px rgba(0,0,0,0.4)' : 'none',
          drag: (e) => { this.dragI = i; try { e.dataTransfer.setData('text/plain', String(i)); } catch (x) {} }, pick: (e) => { stop(e); if (!done) this.setState({ sel: s ? null : i }); } }; }),
      cols: ['eco', 'soc', 'amb', 'gob'].map(col),
      ...fbVals(fb), badge: done && firstAll,
      canRound: aDone && pA, roundLabel: 'PARTE B', nextRound: () => this.setState({ part: 'B', att: 1, fb: null }),
      canCheck: pA ? !aDone : !done, ...btn(pA ? true : placedN === SUS.length), checkLabel: pA ? 'Comprobar' : 'Comprobar (' + placedN + '/10)',
      check: () => { if (pA) this.checkA(); else if (placedN === SUS.length) this.checkB(); },
      canClear: pB && !done && SUS.some((i) => place[i] && !locked[i]), clearAll: () => { const p = {}; Object.keys(place).forEach((i) => { if (locked[i]) p[i] = place[i]; }); this.setState({ place: p, sel: null }); },
      done, nextHref: '/reto/4.2', nextLabel: 'RETO 4.2'
    };
  }
}
