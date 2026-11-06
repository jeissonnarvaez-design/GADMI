// @ts-nocheck
/* Reto 2.4 · Grupos de interés (diseño final: Reto24.dc.html). Generado a partir del prototipo:
   la lógica es la del diseño; el contenido vive en retos/data/2.4.json. */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Feedback } from '../../shared/feedback';
import { Hud } from '../../shared/hud';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/2.4.json';
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

/* PROPUESTA DEL EQUIPO (el documento de la profesora solo nombra el reto, 50 granos y el «proveedor C» de greenwashing) */
const CONSIGNA = RD.CONSIGNA;
const Q = RD.Q;
const G = RD.G;
const ORD = RD.ORD;
const SUP = RD.SUP;
const HINT = RD.HINT;
@Component({
  selector: 'app-reto-24',
  imports: [RouterLink, Hud, Personaje, Feedback],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 2 · RETO 2.4'" [title]="titulo" [granos]="v().score + ' / ' + max" [salida]="salida()">
    <div centro [attr.aria-label]="(v().attText)" style="display: flex; align-items: center; gap: 8px">@for (p of v().atts; track $index) {<span [style]="'width: 72px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}<span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().attText }}</span></div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1240px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
    
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
      <app-personaje who="teo" [size]="88" />
      <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; border-style: none"><span class="px" style="font-size: 10px; color: #AC0B32">SITUACIÓN · ¿A QUIÉN ESCUCHAR PRIMERO?</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().consigna }}</span></div>
      <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; border: none; background: #ffd3c9; cursor: pointer; display: flex; align-items: center; justify-content: center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg></button>
    </div>

    <span class="px" style="font-size: 11px; color: #FFD3C9">{{ v().partText }}</span>
    @if (v().pA) {
      <div style="display: flex; flex-direction: column; gap: 14px">
        <section aria-label="Grupos de interés por ubicar" (click)="v().trayClick?.($event)" (dragover)="v().allowDrop?.($event)" (drop)="v().dropTray?.($event)" style="min-height: 84px; padding: 12px; border-radius: 8px; border: 5px solid #FF836C; display: flex; flex-wrap: wrap; gap: 10px; align-content: flex-start">
          @for (c of v().tray; track $index) {
            <button type="button" class="card" draggable="true" (dragstart)="c.drag?.($event)" (click)="c.pick?.($event)" [attr.aria-pressed]="(c.pressed)" [attr.aria-label]="(c.aria)" [style]="'width: calc(33.333% - 7px); min-height: 60px; box-sizing: border-box; text-align: center; justify-content: center; align-items: center; padding: 8px 12px; border-radius: 8px; border: 3px ' + (c.line) + ' ' + (c.bd) + '; background: #FFFFFF; color: #231417; cursor: grab; box-shadow: ' + (c.sh) + '; display: flex; flex-direction: column; gap: 4px'"><span style="font-size: 14px; font-weight: 700; line-height: 1.3">{{ c.text }}</span>@if (c.review) {<span style="font-size: 12px; font-weight: 700; color: #8A1428">↺ {{ c.hint }}</span>}</button>
          }
        </section>
        <div class="g2" role="group" aria-label="Matriz de poder e interés" style="display: grid; grid-template-columns: 30px minmax(0, 1fr) minmax(0, 1fr); grid-template-rows: auto auto auto; gap: 10px">
          <span></span><span class="px" style="text-align: center; font-size: 10px; color: #FFD3C9">INTERÉS BAJO</span><span class="px" style="text-align: center; font-size: 10px; color: #FFD3C9">INTERÉS ALTO</span>
          @for (row of v().rows; track $index) {
            <span class="px" style="writing-mode: vertical-rl; transform: rotate(180deg); text-align: center; font-size: 10px; color: #FFD3C9">{{ row.label }}</span>
            @for (z of row.q; track $index) {
              <div role="button" tabindex="0" [attr.aria-label]="(z.aria)" [class]="(z.cls)" (click)="z.drop?.($event)" (keydown)="z.key?.($event)" (dragover)="v().allowDrop?.($event)" (drop)="z.dropEv?.($event)" [style]="'min-height: 150px; box-sizing: border-box; border-radius: 8px; border: 5px solid #FF836C; background: ' + (z.bg) + '; color: #FBF5EC; padding: 12px; display: flex; flex-direction: column; gap: 8px; cursor: pointer'">
                <div style="display: flex; align-items: center; gap: 10px"><span style="width: 36px; height: 36px; flex-shrink: 0; border-radius: 6px; background: #FF836C; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A0609" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="(z.icon)"></path></svg></span><div style="display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 16px">{{ z.name }}</strong><span style="font-size: 12px; color: #C9B8A6">{{ z.desc }}</span></div><span class="px" style="margin-left: auto; font-size: 10px; color: #FFD3C9">{{ z.count }}</span></div>
                @for (it of z.items; track $index) {<button type="button" (click)="it.pick?.($event)" [attr.aria-label]="(it.aria)" [style]="'text-align: left; padding: 7px 9px; border-radius: 6px; border: 2px solid ' + (it.bd) + '; background: ' + (it.bg) + '; color: #231417; font-size: 13px; font-weight: 600; line-height: 1.3; cursor: ' + (it.cursor)"><span [style]="'font-weight: 800; color: ' + (it.mc)">{{ it.mark }}</span>{{ it.text }}@if (it.showWhy) {<span [style]="'display: block; margin-top: 3px; font-size: 12px; font-weight: 700; color: ' + (it.mc)">{{ it.why }}</span>}</button>}
              </div>
            }
          }
        </div>
      </div>
    }
    @if (v().pB) {
      <section class="g2" aria-label="Proveedores de cacao" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px">
        @for (s of v().sup; track $index) {
          <div [style]="'background: #FFFFFF; border-radius: 10px; border: 3px solid ' + (s.bd) + '; overflow: hidden; display: flex; flex-direction: column'">
            <div style="padding: 16px; display: flex; flex-direction: column; gap: 10px; flex: 1">
              <div style="display: flex; align-items: center; gap: 10px"><span class="px" style="width: 32px; height: 32px; border-radius: 6px; background: #FF836C; color: #1A0609; font-size: 13px; display: flex; align-items: center; justify-content: center">{{ s.k }}</span><strong style="font-size: 17px; color: #231417">{{ s.name }}</strong></div>
              <span style="font-size: 15px; font-weight: 600; line-height: 1.4; color: #231417">{{ s.t }}</span>
              <div class="g2" style="margin-top: auto; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
                @for (o of s.opts; track $index) {<button type="button" (click)="o.pick?.($event)" [attr.aria-pressed]="(o.on)" [style]="'min-height: 42px; border-radius: 8px; border: 2px solid ' + (o.bd) + '; background: ' + (o.bg) + '; color: ' + (o.fg) + '; font-size: 14px; font-weight: 800; cursor: ' + (o.cur)">{{ o.t }}</button>}
              </div>
            </div>
            @if (s.showFb) {<div class="up" [style]="'padding: 10px 14px; background: ' + (s.fbBg) + '; font-size: 13px; font-weight: 700; line-height: 1.35; color: ' + (s.fbc)">{{ s.fb }}</div>}
          </div>
        }
      </section>
      @if (v().gw) {<div class="pop gpanel" role="status" style="display: flex; align-items: center; gap: 12px; background: #EAF4E6; padding: 10px 16px; margin-top: 4px"><span class="px" style="padding: 4px 8px; border-radius: 999px; background: #3F7E44; color: #FFFFFF; font-size: 10px">★ GREENWASHING DETECTADO</span><span style="font-size: 16px; font-weight: 800; color: #2C5E31">Una frase bonita sin datos no es sostenibilidad. Lo detectaste.</span></div>}
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
export class Reto24 extends DcReto {
  readonly ejercicioId = RD.id;
  readonly titulo = RD.title;
  readonly max = RD.max;
  protected override autoRegistro = true;

  constructor() { super(); SAY = (t) => this.speak(t); this.dragI = null; this.state = { part: 'A', place: {}, sel: null, locked: {}, review: {}, reveal: {}, dec: {}, att: 1, res: null, ptsA: 0, ptsB: 0, firstAll: true, aDone: false, done: false, fb: null };  this.restaurar(); }
  put(i, k) { const { place, locked, aDone, review } = this.state; if (i == null || locked[i] || aDone) return; const r = { ...review }; delete r[i]; this.setState({ place: { ...place, [i]: k }, sel: null, review: r }); }
  unplace(i) { const { place, locked, aDone } = this.state; if (i == null || locked[i] || aDone || place[i] == null) return; const p = { ...place }; delete p[i]; this.setState({ place: p, sel: null }); }
  checkA() {
    const { place, locked, att, firstAll } = this.state; const nl = { ...locked }, wrong = [];
    G.forEach((g, i) => { if (locked[i]) return; if (place[i] === g[1]) nl[i] = true; else wrong.push(i); });
    const pts = Object.keys(nl).length * 5;
    if (!wrong.length) { this.setState({ locked: nl, ptsA: pts, aDone: true, firstAll: firstAll && att === 1, sel: null, fb: { ok: true, t: '¡Mapa claro!', x: 'Ya sabes a quién escuchar primero.' } }); return; }
    if (att === 1) { const p = { ...place }, rv = {}; wrong.forEach((i) => { rv[i] = true; delete p[i]; }); this.setState({ locked: nl, place: p, review: rv, ptsA: pts, att: 2, firstAll: false, sel: null, fb: { ok: false, t: wrong.length + (wrong.length === 1 ? ' grupo volvió' : ' grupos volvieron') + ' con una pista.', x: 'Intento 2 de 2.' } }); return; }
    const p = { ...place }, rv = {}; wrong.forEach((i) => { p[i] = G[i][1]; rv[i] = true; });
    this.setState({ locked: nl, place: p, reveal: rv, review: {}, ptsA: pts, aDone: true, sel: null, fb: { ok: false, t: 'Así queda el mapa.', x: 'Las marcadas con → muestran su lugar y por qué.' } });
  }
  checkB() {
    const { dec, att, ptsB, firstAll } = this.state; const per = SUP.map((s, i) => dec[i] === s[3]);
    const pts = (per[0] ? 5 : 0) + (per[1] ? 5 : 0) + (per[2] ? 10 : 0);
    if (pts === 20 || att === 2) { this.setState({ res: { per }, ptsB: Math.max(ptsB, pts), done: true, firstAll: firstAll && att === 1 && pts === 20, fb: pts === 20 ? { ok: true, t: '¡Cadena de valor verde!', x: 'Proveedores que pueden demostrar lo que dicen.' } : { ok: false, t: 'Así se eligen los proveedores.', x: 'Ganaste ' + pts + ' de 20 granos.' } }); return; }
    this.setState({ res: { per }, ptsB: pts, att: 2, firstAll: false, fb: { ok: false, t: 'Ganaste ' + pts + ' de 20 granos.', x: 'Revisa las decisiones en rojo. Intento 2 de 2.' } });
  }
  renderVals() {
    const { part, place, sel, locked, review, reveal, dec, att, res, ptsA, ptsB, firstAll, aDone, done, fb } = this.state;
    const pA = part === 'A', pB = part === 'B', total = ptsA + ptsB, placedN = Object.keys(place).length;
    const allowDrop = (e) => { if (e && e.preventDefault) e.preventDefault(); };
    const zone = (k) => { const [name, desc, icon] = Q[k]; const items = G.map((g, i) => ({ g, i })).filter((x) => place[x.i] === k); const on = sel != null && !aDone; const drop = () => { if (sel != null) this.put(sel, k); };
      return { name, desc, icon, count: items.length ? String(items.length) : '', cls: on ? 'zpulse' : '', line: 'solid', bg: on ? '#3A1019' : '#2A0B12', aria: name + ', ' + items.length + ' grupos.', drop, key: keyAct(drop),
        dropEv: (e) => { allowDrop(e); const i = this.dragI != null ? this.dragI : sel; this.dragI = null; this.put(i, k); },
        items: items.map(({ g, i }) => { const lk = !!locked[i], rv = !!reveal[i], s = sel === i, free = !lk && !rv && !aDone;
          return { text: g[0], why: g[2], showWhy: aDone, mark: lk ? '✓ ' : rv ? '→ ' : '', mc: lk ? '#2C5E31' : '#8A1428', bg: lk ? '#EAF4E6' : rv ? '#FFF0EC' : '#FFFFFF', bd: lk ? '#3F7E44' : rv ? '#AC0B32' : s ? '#FF836C' : '#FFFFFF', cursor: free ? 'pointer' : 'default', aria: g[0],
            pick: (e) => { stop(e); if (free) this.setState({ sel: s ? null : i }); } }; }) }; };
    return {
      consigna: CONSIGNA, listen: () => SAY(CONSIGNA),
      atts: [pA && !aDone ? '#FF836C' : '#FFD3C9', pB && !done ? '#FF836C' : done ? '#FFD3C9' : '#4A2A2F'], attText: done ? 'RETO TERMINADO' : 'PARTE ' + part + ' · INTENTO ' + att + ' DE 2',
      score: total, scoreAria: total + ' granos de 50', pA, pB,
      partText: pA ? 'PARTE A · UBICA CADA GRUPO DE INTERÉS EN LA MATRIZ' : 'PARTE B · ¿CON QUÉ PROVEEDORES TRABAJAS?',
      allowDrop,
      trayClick: () => { if (sel != null && place[sel] != null) this.unplace(sel); },
      dropTray: (e) => { allowDrop(e); const i = this.dragI != null ? this.dragI : sel; this.dragI = null; this.unplace(i); },
      tray: ORD.filter((i) => place[i] == null).map((i) => { const s = sel === i, rv = !!review[i];
        return { text: G[i][0], review: rv, hint: HINT, pressed: s ? 'true' : 'false', aria: G[i][0], bd: s || rv ? '#FF836C' : '#FFFFFF', line: rv && !s ? 'dashed' : 'solid', sh: s ? '0 8px 18px rgba(0,0,0,0.4)' : 'none',
          drag: (e) => { this.dragI = i; try { e.dataTransfer.setData('text/plain', String(i)); } catch (x) {} }, pick: (e) => { stop(e); if (!aDone) this.setState({ sel: s ? null : i }); } }; }),
      rows: [{ label: 'MUCHO PODER', q: [zone('satis'), zone('cerca')] }, { label: 'POCO PODER', q: [zone('moni'), zone('info')] }],
      sup: SUP.map(([k, name, t, key, okMsg], i) => { const d = dec[i], show = !!res, ok = res && res.per[i];
        return { k, name, t, bd: show ? (ok ? '#3F7E44' : '#AC0B32') : '#FFFFFF', showFb: show, fb: ok ? okMsg : done ? (key === 'ok' ? '→ Se podía aprobar: demuestra el origen.' : '→ Había que rechazarlo: sello propio sin pruebas.') : '↺ ¿Puede demostrar lo que dice?', fbBg: ok ? '#EAF4E6' : '#FFF0EC', fbc: ok ? '#2C5E31' : '#8A1428',
          opts: [['ok', '✔ Aprobar', '#4E9A4A', '#EAF6E7', '#A9D8A4', '#2C5E31'], ['no', '✖ Rechazar', '#D2504A', '#FDECEC', '#F2B2B2', '#8A1F1F']].map(([v, tt, strong, soft, sb, sf]) => { const on = d === v;
            return { t: tt, on: on ? 'true' : 'false', bg: on ? strong : soft, bd: on ? strong : sb, fg: on ? '#FFFFFF' : sf, cur: done ? 'default' : 'pointer', pick: () => { if (!done) this.setState({ dec: { ...dec, [i]: v }, res: null }); } }; }) }; }),
      gw: done && dec[2] === 'no',
      ...fbVals(fb), badge: done && firstAll,
      canRound: aDone && pA, roundLabel: 'PARTE B', nextRound: () => this.setState({ part: 'B', att: 1, fb: null }),
      canCheck: pA ? !aDone : !done, ...btn(pA ? placedN === G.length : Object.keys(dec).length === 3), checkLabel: pA ? 'Comprobar (' + placedN + '/6)' : 'Comprobar',
      check: () => { if (pA ? placedN === G.length : Object.keys(dec).length === 3) (pA ? this.checkA() : this.checkB()); },
      canClear: pA && !aDone && Object.keys(place).some((i) => !locked[i]), clearAll: () => { const p = {}; Object.keys(place).forEach((i) => { if (locked[i]) p[i] = place[i]; }); this.setState({ place: p, sel: null }); },
      done, nextHref: '/reto/2.5', nextLabel: 'RETO 2.5'
    };
  }
}
