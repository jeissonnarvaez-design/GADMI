// @ts-nocheck
/* Reto 2.1 · Organigrama (diseño final: Reto21.dc.html). Generado a partir del prototipo:
   la lógica es la del diseño; el contenido vive en retos/data/2.1.json. */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Feedback } from '../../shared/feedback';
import { Hud } from '../../shared/hud';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/2.1.json';
import { DcReto } from './dc-reto';

const RD: any = DATA;
/** Voz de Teo (se conecta en el constructor). */
let SAY: (t: string) => void = () => {};
const CONSIGNA = RD.CONSIGNA;
const P = RD.P;
const ORDER = RD.ORDER; /* orden mezclado del portafolio */
const DISTRACT = RD.DISTRACT;
const AREAS = RD.AREAS;
/* Casillas del lienzo (centro x, centro y) */
const SLOTS = RD.SLOTS;
const RULES = RD.RULES;
const SOLUTION = RD.SOLUTION;
const keyAct = (fn) => (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };
const stop = (e) => { if (e && e.stopPropagation) e.stopPropagation(); };
function evaluate(pl) {
  const at = (k) => Object.keys(pl).find((s) => pl[s] === k);
  const inAreas = (k) => /^a[1-5]$/.test(at(k) || '');
  const top = [pl.s1, pl.s2].sort().join();
  return [
    top === ['as', 'jd'].sort().join() && pl.s3 === 'gg',
    pl.s3 === 'gg' && ['s1', 's2', 's3', 'x', 'l', 'r'].every((s) => pl[s] !== 'vp'),
    pl.x === 'cs' || pl.l === 'cs',
    pl.r === 'rf' && pl.s1 === 'as',
    AREAS.every(inAreas),
    inAreas('ab'),
    DISTRACT.every((k) => !at(k)) && !pl.sub
  ];
}
@Component({
  selector: 'app-reto-21',
  imports: [RouterLink, Hud, Personaje, Feedback],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 2 · RETO 2.1'" [title]="titulo" [granos]="v().score + ' / ' + max" [salida]="salida()">
    <div centro [attr.aria-label]="(v().attText)" style="display: flex; align-items: center; gap: 8px">@for (p of v().atts; track $index) {<span [style]="'width: 72px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}<span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().attText }}</span></div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1240px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
    
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
      <app-personaje who="chispa" [size]="88" />
      <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; border-style: none"><span class="px" style="font-size: 10px; color: #AC0B32">SITUACIÓN · LA EMPRESA CRECE</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().consigna }}</span></div>
      <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; border: none; background: #ffd3c9; cursor: pointer; display: flex; align-items: center; justify-content: center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg></button>
    </div>

    <div class="g2" style="display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 20px; align-items: start">
      
      <section class="portafolio" aria-label="Portafolio de cargos" (click)="v().trayClick?.($event)" (dragover)="v().allowDrop?.($event)" (drop)="v().dropTray?.($event)" style="height: 600px; box-sizing: border-box; padding: 12px; border-radius: 8px; border: 5px solid #FF836C; display: flex; flex-direction: column; gap: 10px">
        <span class="px" style="font-size: 10px; color: #FF836C">{{ v().trayLabel }}</span>
        <div class="trayscroll" style="flex: 1; min-height: 0; overflow-y: auto; scroll-snap-type: y mandatory; display: grid; grid-auto-rows: 56px; gap: 8px; padding-right: 6px">
          @for (c of v().tray; track $index) {
            <button type="button" class="card" draggable="true" (dragstart)="c.drag?.($event)" (click)="c.pick?.($event)" [attr.aria-pressed]="(c.pressed)" [attr.aria-label]="(c.aria)" [style]="'scroll-snap-align: start; height: 56px; box-sizing: border-box; padding: 6px 12px; border-radius: 8px; border: 3px solid ' + (c.bd) + '; background: #FFFFFF; color: #231417; font-size: 14px; font-weight: 700; line-height: 1.2; text-align: center; display: flex; align-items: center; justify-content: center; cursor: grab; box-shadow: ' + (c.sh)">{{ c.text }}</button>
          }
        </div>
      </section>

      
      <section class="lienzo" aria-label="Lienzo del organigrama" style="min-width: 0; background: #FFFFFF; border-radius: 12px; padding: 16px 20px; box-shadow: 0 14px 30px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 8px">
        <div style="display: flex; align-items: center; gap: 18px; font-size: 13px; font-weight: 700; color: #5C4A4D">
          <span class="px" style="font-size: 10px; color: #AC0B32">LIENZO · CACAO RAÍZ S.A.S.</span>
          <span style="display: inline-flex; align-items: center; gap: 6px"><svg width="34" height="6" aria-hidden="true"><path d="M2 3H32" stroke="#231417" stroke-width="3"></path></svg>Línea de mando</span>
          <span style="display: inline-flex; align-items: center; gap: 6px"><svg width="34" height="6" aria-hidden="true"><path d="M2 3H32" stroke="#231417" stroke-width="3" stroke-dasharray="5 4"></path></svg>Asesoría</span>
          <span style="position: relative; margin-left: auto"><button type="button" (click)="v().toggleNote?.($event)" [attr.aria-expanded]="(v().noteAria)" aria-label="Estructural, posicional y funcional" style="height: 30px; padding: 0 12px; border-radius: 999px; border: none; background: #FFE6DD; color: #8A1428; font-size: 13px; font-weight: 800; cursor: pointer">ⓘ Tres planos</button>@if (v().note) {<span class="up" role="tooltip" style="position: absolute; right: 0; top: 38px; z-index: 6; width: 320px; padding: 12px 14px; border-radius: 10px; background: #231417; color: #FBF5EC; font-size: 13px; font-weight: 600; line-height: 1.45; box-shadow: 0 12px 28px rgba(0,0,0,0.35)"><strong style="color: #FFD3C9">Estructural:</strong> la forma (niveles y áreas). <strong style="color: #FFD3C9">Posicional:</strong> el lugar de cada cargo en la jerarquía. <strong style="color: #FFD3C9">Funcional:</strong> lo que cada cargo hace. Los retos 2.1 y 2.2 recorren esos tres planos.</span>}</span>
        </div>
        <div style="position: relative; width: 820px; height: 530px; margin: 0 auto">
          <svg viewBox="0 0 820 530" aria-hidden="true" style="position: absolute; inset: 0; width: 820px; height: 530px">
            <g stroke="#B5A9A6" stroke-width="3" fill="none" stroke-linecap="round">
              <path d="M410 67V108M410 162V203M485 40H585M410 257V320M90 320H730M90 320V353M250 320V353M410 320V353M570 320V353M730 320V353M410 407V453"></path>
              <path d="M485 230H585M335 230H235" stroke-dasharray="7 6"></path>
            </g>
          </svg>
          @for (s of v().slots; track $index) {
            <div role="button" tabindex="0" [attr.aria-label]="(s.aria)" [class]="(s.cls)" (click)="s.drop?.($event)" (keydown)="s.key?.($event)" (dragover)="v().allowDrop?.($event)" (drop)="s.dropEv?.($event)" [style]="'position: absolute; left: ' + (s.left) + 'px; top: ' + (s.top) + 'px; width: 150px; height: 54px; box-sizing: border-box; border-radius: 8px; border: 5px ' + (s.line) + ' ' + (s.bd) + '; background: ' + (s.bg) + '; color: ' + (s.fg) + '; display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px 8px; font-size: 13px; font-weight: 800; line-height: 1.15; cursor: pointer'">{{ s.text }}</div>
          }
        </div>
        
      </section>
    </div>

    
    @if (v().checked) {
      <section class="g2 up" aria-label="Reglas de la estructura" style="background: #FFFFFF; border-radius: 12px; padding: 16px 20px; box-shadow: 0 14px 30px rgba(0,0,0,0.3); display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 22px">
        <span class="px" style="grid-column: 1 / -1; font-size: 10px; color: #AC0B32">{{ v().rulesTitle }}</span>
        @for (r of v().rules; track $index) {
          <div [style]="'display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; border-radius: 8px; background: ' + (r.bg)">
            <span aria-hidden="true" [style]="'width: 24px; height: 24px; flex-shrink: 0; border-radius: 999px; background: ' + (r.dot) + '; color: #FFFFFF; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center'">{{ r.mark }}</span>
            <span style="font-size: 14px; font-weight: 700; line-height: 1.35; color: #231417">{{ r.main }}</span>
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
      @if (v().canClear) {<button type="button" (click)="v().clearAll?.($event)" aria-label="Limpiar el lienzo" style="height: 44px; padding: 0 16px; border: 2px solid rgba(255,131,108,0.55); border-radius: 6px; background: transparent; color: #FFD3C9; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; cursor: pointer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD3C9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"></path></svg>Limpiar</button>}
      @if (v().canCheck) {<button type="button" class="gbtn" (click)="v().check?.($event)" [attr.aria-disabled]="(v().checkDis)" [style]="'min-height: 52px; padding: 0 24px; border: none; background: ' + (v().checkBg) + '; color: ' + (v().checkFg) + '; font-weight: 800; font-size: 16px; cursor: ' + (v().checkCursor)">Comprobar ({{ v().placedN }} cargos)</button>}
      @if (v().done) {<a class="gbtn glow pop" [routerLink]="after().link" style="display: inline-flex; align-items: center; min-height: 52px; padding: 0 24px; background: #FF836C; color: #1A0609; text-decoration: none"><span class="px" style="font-size: 14px">▶ RETO 2.2</span></a>}
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
      .lienzo{overflow-x:auto} .portafolio{height:300px !important}
    }
  `,
})
export class Reto21 extends DcReto {
  readonly ejercicioId = RD.id;
  readonly titulo = RD.title;
  readonly max = RD.max;
  protected override autoRegistro = true;

  constructor() { super(); SAY = (t) => this.speak(t); this.dragK = null; this.state = { note: false, place: {}, sel: null, att: 1, res: null, best: 0, first: null, done: false, fb: null };  this.restaurar(); }
  put(k, slot) {
    const { place, done } = this.state; if (k == null || done) return;
    const p = { ...place }; Object.keys(p).forEach((s) => { if (p[s] === k) delete p[s]; }); p[slot] = k;
    this.setState({ place: p, sel: null });
  }
  unplace(k) {
    const { place, done } = this.state; if (k == null || done) return;
    const p = { ...place }; Object.keys(p).forEach((s) => { if (p[s] === k) delete p[s]; });
    this.setState({ place: p, sel: null });
  }
  /* Dos intentos; cuenta el mejor. 1.º: pistas sin revelar. 2.º: solución completa */
  check() {
    const { place, att, best } = this.state;
    const res = evaluate(place), pts = res.filter(Boolean).length * 10, nb = Math.max(best, pts);
    if (pts === 70 || att === 2) {
      this.setState({ res, best: nb, first: att === 1 ? pts : this.state.first, done: true, sel: null,
        fb: pts === 70 ? { ok: true, t: '¡Estructura clara!', x: 'Gobierno arriba, una gerencia y cinco áreas.' } : { ok: false, t: 'Así queda la estructura.', x: 'Mira la solución en el lienzo y las reglas.' } });
      if (pts === 70) SAY('¡Estructura clara!');
      return;
    }
    const n = res.filter((r) => !r).length;
    this.setState({ res, best: nb, first: pts, att: 2, sel: null, fb: { ok: false, t: n + (n === 1 ? ' regla no se cumple.' : ' reglas no se cumplen.'), x: 'Lee las pistas y ajusta. Intento 2 de 2.' } });
  }
  renderVals() {
    const { place, sel, att, res, best, first, done, fb } = this.state;
    const view = done && res && res.some((r) => !r) ? SOLUTION : place;
    const placedN = Object.keys(place).length;
    const allowDrop = (e) => { if (e && e.preventDefault) e.preventDefault(); };
    const used = (k) => Object.keys(place).some((s) => place[s] === k);
    return {
      consigna: CONSIGNA, listen: () => SAY(CONSIGNA), note: this.state.note, noteAria: this.state.note ? 'true' : 'false', toggleNote: () => this.setState({ note: !this.state.note }),
      atts: [att === 1 && !done ? '#FF836C' : '#FFD3C9', att === 2 && !done ? '#FF836C' : done && att === 2 ? '#FFD3C9' : '#4A2A2F'],
      attText: done ? 'RETO TERMINADO' : 'INTENTO ' + att + ' DE 2',
      score: best, scoreAria: best + ' granos de 70',
      allowDrop,
      trayLabel: 'PORTAFOLIO · ARRASTRA O TOCA UN CARGO',
      trayClick: () => { if (sel != null && used(sel)) this.unplace(sel); },
      dropTray: (e) => { allowDrop(e); const k = this.dragK != null ? this.dragK : sel; this.dragK = null; this.unplace(k); },
      tray: ORDER.filter((k) => !used(k)).map((k) => {
        const s = sel === k;
        return { text: P[k], pressed: s ? 'true' : 'false', aria: P[k] + (s ? ' (seleccionado)' : ''), bd: s ? '#FF836C' : '#FFFFFF', sh: s ? '0 8px 18px rgba(0,0,0,0.4)' : 'none',
          drag: (e) => { this.dragK = k; try { e.dataTransfer.setData('text/plain', k); } catch (x) {} },
          pick: (e) => { stop(e); if (!done) this.setState({ sel: s ? null : k }); } };
      }),
      slots: SLOTS.map(([id, cx, cy]) => {
        const k = view[id], on = sel != null && !done;
        const drop = () => { if (done) return; if (sel != null) { if (place[id]) this.unplace(place[id]); this.put(sel, id); } else if (place[id]) this.setState({ sel: place[id] }); };
        return {
          left: cx - 75, top: cy - 27, text: k ? P[k] : '', cls: on ? 'zpulse' : '',
          line: 'solid', bd: k ? (sel === k ? '#FF836C' : '#8A1428') : on ? '#FF836C' : '#D9CBBB',
          bg: k ? (done ? '#EAF4E6' : '#FFF5F2') : on ? '#FFF5F2' : '#FFFFFF', fg: '#231417',
          aria: (k ? P[k] : 'Casilla vacía') + (on ? '. Toca para ubicar aquí el cargo seleccionado.' : ''),
          drop, key: keyAct(drop),
          dropEv: (e) => { allowDrop(e); const kk = this.dragK != null ? this.dragK : sel; this.dragK = null; if (kk != null && !done) { if (place[id] && place[id] !== kk) this.unplace(place[id]); this.put(kk, id); } }
        };
      }),
      checked: !!res,
      rulesTitle: done ? 'LAS 7 REGLAS DE LA ESTRUCTURA' : 'PISTAS PARA TU SEGUNDO INTENTO',
      rules: RULES.map(([t, msg], i) => {
        const ok = res ? res[i] : false;
        return { t, msg, main: done || ok ? t : msg, mark: ok ? '✓' : '↺', dot: ok ? '#3F7E44' : '#AC0B32', bg: ok ? '#EAF4E6' : '#FFF0EC', mc: ok ? '#2C5E31' : '#8A1428' };
      }),
      fbShow: !!fb, fbTitle: fb ? fb.t : '', fbText: fb ? fb.x : '', fbBg: fb && fb.ok ? '#EAF4E6' : '#FFF0EC', fbColor: fb && fb.ok ? '#2C5E31' : '#8A1428', fbIcon: fb && fb.ok ? '✓' : '↺',
      badge: done && first === 70,
      placedN, canCheck: !done,
      checkDis: placedN ? 'false' : 'true', checkBg: placedN ? '#AC0B32' : '#4A2A2F', checkFg: placedN ? '#FFFFFF' : '#C9B8A6', checkCursor: placedN ? 'pointer' : 'not-allowed',
      check: () => { if (placedN) this.check(); },
      canClear: !done && placedN > 0, clearAll: () => this.setState({ place: {}, sel: null }),
      done
    };
  }
}
