// @ts-nocheck
/* Reto 2.2 · Funciones (diseño final: Reto22.dc.html). Generado a partir del prototipo:
   la lógica es la del diseño; el contenido vive en retos/data/2.2.json. */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Feedback } from '../../shared/feedback';
import { Hud } from '../../shared/hud';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/2.2.json';
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
const NODES = RD.NODES;
const ROWS = RD.ROWS;
const F = RD.F;
const ORDER = RD.ORDER;
const GOV = RD.GOV;
/* Pista sin revelar: depende de dónde la puso */
const hintFor = (i, k) => (GOV.indexOf(k) >= 0) !== (GOV.indexOf(F[i][1]) >= 0) ? (GOV.indexOf(k) >= 0 ? '¿Es una decisión de gobierno o una tarea de operación?' : '¿Es una tarea de operación o de gobierno y control?') : '¿Qué cargo tiene esa tarea en su día a día?';
@Component({
  selector: 'app-reto-22',
  imports: [RouterLink, Hud, Personaje, Feedback],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 2 · RETO 2.2'" [title]="titulo" [granos]="v().score + ' / ' + max" [salida]="salida()">
    <div centro [attr.aria-label]="(v().attText)" style="display: flex; align-items: center; gap: 8px">@for (p of v().atts; track $index) {<span [style]="'width: 72px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}<span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().attText }}</span></div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1240px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
    
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
      <app-personaje who="teo" [size]="88" />
      <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; border-style: none"><span class="px" style="font-size: 10px; color: #AC0B32">SITUACIÓN · CADA QUIEN SU TAREA</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().consigna }}</span></div>
      <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; border: none; background: #ffd3c9; cursor: pointer; display: flex; align-items: center; justify-content: center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg></button>
    </div>

    <section aria-label="Tarjetas de función" (click)="v().trayClick?.($event)" (dragover)="v().allowDrop?.($event)" (drop)="v().dropTray?.($event)" style="min-height: 120px; padding: 12px; border-radius: 8px; border: 5px solid #FF836C; display: flex; flex-wrap: wrap; gap: 10px; align-content: flex-start">
      <span class="px" style="width: 100%; font-size: 10px; color: #FF836C">{{ v().trayLabel }}</span>
      @for (c of v().tray; track $index) {
        <button type="button" class="card" draggable="true" (dragstart)="c.drag?.($event)" (click)="c.pick?.($event)" [attr.aria-pressed]="(c.pressed)" [attr.aria-label]="(c.aria)" [style]="'width: calc(20% - 8px); min-height: 92px; box-sizing: border-box; text-align: center; justify-content: center; align-items: center; padding: 10px; border-radius: 8px; border: 3px ' + (c.line) + ' ' + (c.bd) + '; background: #FFFFFF; color: #231417; cursor: grab; box-shadow: ' + (c.sh) + '; display: flex; flex-direction: column; gap: 6px'">
          <span style="font-size: 13px; font-weight: 700; line-height: 1.3">{{ c.text }}</span>
          @if (c.review) {<span style="font-size: 12px; font-weight: 700; color: #8A1428">↺ {{ c.hint }}</span>}
        </button>
      }
    </section>

    <section aria-label="Organigrama de CACAO Raíz" style="display: flex; flex-direction: column; gap: 12px">
      @for (row of v().rows; track $index) {
        <div class="gd" [style]="'display: grid; grid-template-columns: repeat(' + (row.cols) + ', minmax(0, 1fr)); gap: 12px; max-width: ' + (row.maxW) + '; width: 100%; margin: 0 auto'">
          @for (z of row.nodes; track $index) {
            <div role="button" tabindex="0" [attr.aria-label]="(z.aria)" [class]="(z.cls)" (click)="z.drop?.($event)" (keydown)="z.key?.($event)" (dragover)="v().allowDrop?.($event)" (drop)="z.dropEv?.($event)" [style]="'min-height: 74px; box-sizing: border-box; border-radius: 8px; border: 5px solid #FF836C; background: ' + (z.bg) + '; color: #FBF5EC; padding: 10px; display: flex; flex-direction: column; gap: 6px; cursor: pointer'">
              <div style="display: flex; align-items: center; gap: 8px"><span style="width: 30px; height: 30px; flex-shrink: 0; border-radius: 6px; background: #FF836C; display: flex; align-items: center; justify-content: center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A0609" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21v-1a8 8 0 0 1 16 0v1"></path></svg></span><strong style="font-size: 15px; line-height: 1.2">{{ z.name }}</strong><span class="px" style="margin-left: auto; font-size: 10px; color: #FFD3C9">{{ z.count }}</span></div>
              @for (it of z.items; track $index) {
                <button type="button" (click)="it.pick?.($event)" [attr.draggable]="(it.draggable)" (dragstart)="it.drag?.($event)" [attr.aria-label]="(it.aria)" [style]="'text-align: left; padding: 6px 8px; border-radius: 6px; border: 2px solid ' + (it.bd) + '; background: ' + (it.bg) + '; color: #231417; font-size: 12px; font-weight: 600; line-height: 1.3; cursor: ' + (it.cursor)"><span [style]="'font-weight: 800; color: ' + (it.mc)">{{ it.mark }}</span>{{ it.text }}</button>
              }
            </div>
          }
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
export class Reto22 extends DcReto {
  readonly ejercicioId = RD.id;
  readonly titulo = RD.title;
  readonly max = RD.max;
  protected override autoRegistro = true;

  constructor() { super(); SAY = (t) => this.speak(t); this.dragI = null; this.state = { place: {}, sel: null, locked: {}, review: {}, reveal: {}, att: 1, done: false, fb: null, first: null };  this.restaurar(); }
  put(i, k) { const { place, locked, done, review } = this.state; if (i == null || locked[i] || done) return; const r = { ...review }; delete r[i]; this.setState({ place: { ...place, [i]: k }, sel: null, review: r }); }
  unplace(i) { const { place, locked, done } = this.state; if (i == null || locked[i] || done || place[i] == null) return; const p = { ...place }; delete p[i]; this.setState({ place: p, sel: null }); }
  check() {
    const { place, locked, att } = this.state;
    const nl = { ...locked }, wrong = [];
    F.forEach((f, i) => { if (locked[i]) return; if (place[i] === f[1]) nl[i] = true; else wrong.push(i); });
    const right = Object.keys(nl).length;
    if (!wrong.length) { this.setState({ locked: nl, done: true, sel: null, first: att === 1 ? right : this.state.first, fb: { ok: true, t: '¡Cada función en su lugar!', x: 'Lo funcional ya está claro.' } }); SAY('¡Muy bien!'); return; }
    if (att === 1) {
      const p = { ...place }, rv = {}; wrong.forEach((i) => { rv[i] = hintFor(i, place[i]); delete p[i]; });
      this.setState({ locked: nl, place: p, review: rv, att: 2, sel: null, first: right, fb: { ok: false, t: wrong.length + (wrong.length === 1 ? ' tarjeta volvió' : ' tarjetas volvieron') + ' con una pista.', x: 'Intento 2 de 2.' } });
    } else {
      const p = { ...place }, rv = {}; wrong.forEach((i) => { p[i] = F[i][1]; rv[i] = true; });
      this.setState({ locked: nl, place: p, reveal: rv, review: {}, done: true, sel: null, fb: { ok: false, t: 'Así se reparten las funciones.', x: 'Las marcadas con → muestran a quién le tocaba.' } });
    }
  }
  renderVals() {
    const { place, sel, locked, review, reveal, att, done, fb, first } = this.state;
    const right = Object.keys(locked).length, placedN = Object.keys(place).length, ready = placedN === F.length;
    const allowDrop = (e) => { if (e && e.preventDefault) e.preventDefault(); };
    const node = (k) => {
      const items = F.map((f, i) => ({ f, i })).filter((x) => place[x.i] === k), on = sel != null && !done;
      const drop = () => { if (sel != null) this.put(sel, k); };
      return { name: NODES[k], count: items.length ? String(items.length) : '', cls: on ? 'zpulse' : '', line: 'solid', bg: on ? '#3A1019' : '#2A0B12',
        aria: NODES[k] + ', ' + items.length + ' funciones.' + (on ? ' Toca para asignar aquí la función seleccionada.' : ''), drop, key: keyAct(drop),
        dropEv: (e) => { allowDrop(e); const i = this.dragI != null ? this.dragI : sel; this.dragI = null; this.put(i, k); },
        items: items.map(({ f, i }) => { const lk = !!locked[i], rv = !!reveal[i], s = sel === i, free = !lk && !rv && !done;
          return { text: f[0], mark: lk ? '✓ ' : rv ? '→ ' : '', mc: lk ? '#2C5E31' : '#8A1428', bg: lk ? '#EAF4E6' : rv ? '#FFF0EC' : '#FFFFFF', bd: lk ? '#3F7E44' : rv ? '#AC0B32' : s ? '#FF836C' : '#FFFFFF',
            cursor: free ? 'grab' : 'default', draggable: free ? 'true' : 'false', aria: f[0] + (lk ? ' (correcta)' : rv ? ' (iba aquí)' : ''),
            drag: (e) => { if (!free) return; this.dragI = i; try { e.dataTransfer.setData('text/plain', String(i)); } catch (x) {} },
            pick: (e) => { stop(e); if (free) this.setState({ sel: s ? null : i }); } }; }) };
    };
    return {
      consigna: CONSIGNA, listen: () => SAY(CONSIGNA), ...attVals(att, done), score: right * 4, scoreAria: right * 4 + ' granos de 40', allowDrop,
      trayLabel: ready ? 'TODAS LAS FUNCIONES ESTÁN ASIGNADAS' : 'FUNCIONES · ARRASTRA O TOCA UNA',
      trayClick: () => { if (sel != null && place[sel] != null) this.unplace(sel); },
      dropTray: (e) => { allowDrop(e); const i = this.dragI != null ? this.dragI : sel; this.dragI = null; this.unplace(i); },
      tray: ORDER.filter((i) => place[i] == null).map((i) => { const s = sel === i, rv = review[i] != null;
        return { text: F[i][0], review: rv, hint: rv ? review[i] : '', pressed: s ? 'true' : 'false', aria: F[i][0] + (s ? ' (seleccionada)' : ''), bd: s || rv ? '#FF836C' : '#FFFFFF', line: rv && !s ? 'dashed' : 'solid', sh: s ? '0 8px 18px rgba(0,0,0,0.4)' : 'none',
          drag: (e) => { this.dragI = i; try { e.dataTransfer.setData('text/plain', String(i)); } catch (x) {} }, pick: (e) => { stop(e); if (!done) this.setState({ sel: s ? null : i }); } }; }),
      rows: ROWS.map(([ks, maxW]) => ({ cols: ks.length, maxW, nodes: ks.map(node) })),
      ...fbVals(fb), badge: done && first === 10,
      canCheck: !done, ...btn(ready), checkLabel: 'Comprobar (' + placedN + '/10)', check: () => { if (ready) this.check(); },
      canClear: !done && Object.keys(place).some((i) => !locked[i]), clearAll: () => { const p = {}; Object.keys(place).forEach((i) => { if (locked[i]) p[i] = place[i]; }); this.setState({ place: p, sel: null }); },
      done, nextHref: '/reto/2.3', nextLabel: 'RETO 2.3'
    };
  }
}
