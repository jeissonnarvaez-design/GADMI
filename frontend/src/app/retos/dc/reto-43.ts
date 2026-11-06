// @ts-nocheck
/* Reto 4.3 · Plan de acción (diseño final: Reto43.dc.html). Generado a partir del prototipo:
   la lógica es la del diseño; el contenido vive en retos/data/4.3.json. */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Feedback } from '../../shared/feedback';
import { Hud } from '../../shared/hud';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/4.3.json';
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
const ROWS = RD.ROWS;
const WHAT = RD.WHAT;
const RESP = RD.RESP;
const PLAZO = RD.PLAZO;
const IND = RD.IND;
const REC = RD.REC;
/* Coherencia de los desplegables (criterio del documento: «el responsable de la accidentalidad es talento humano o el comité de seguridad, no comercial»).
   Combinaciones aceptadas: propuesta del equipo para validar. */
const OK = RD.OK;
const FIELDS = RD.FIELDS;
@Component({
  selector: 'app-reto-43',
  imports: [RouterLink, Hud, Personaje, Feedback],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 4 · RETO 4.3'" [title]="titulo" [granos]="v().score + ' / ' + max" [salida]="salida()">
    <div centro [attr.aria-label]="(v().attText)" style="display: flex; align-items: center; gap: 8px">@for (p of v().atts; track $index) {<span [style]="'width: 72px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}<span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().attText }}</span></div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1240px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
    
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
      <app-personaje who="chispa" [size]="88" />
      <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; border-style: none"><span class="px" style="font-size: 10px; color: #AC0B32">SITUACIÓN · DEL DIAGNÓSTICO A LA ACCIÓN</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().consigna }}</span></div>
      <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; border: none; background: #ffd3c9; cursor: pointer; display: flex; align-items: center; justify-content: center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg></button>
    </div>

    <div role="img" aria-label="Ciclo PHVA: estás en Actuar" style="display: flex; align-items: center; justify-content: center; gap: 8px">
      @for (p of v().phva; track $index) {<span class="px" [style]="'padding: 8px 16px; border-radius: 999px; background: ' + (p.bg) + '; color: ' + (p.fg) + '; border: 2px solid ' + (p.bd) + '; font-size: 11px'">{{ p.t }}</span><span aria-hidden="true" style="color: #FFD3C9; font-weight: 800">{{ p.arrow }}</span>}
      <span style="font-size: 13px; font-weight: 700; color: #FFD3C9">El plan reinicia el ciclo.</span>
    </div>
    <section aria-label="Plan de acción" style="display: flex; flex-direction: column; gap: 12px">
      @for (r of v().rows; track $index) {
        <div class="gd" [style]="'background: #FFFFFF; border-radius: 12px; padding: 18px 20px; box-shadow: 0 14px 30px rgba(0,0,0,0.3); border: 3px solid ' + (r.bd) + '; display: grid; grid-template-columns: 220px repeat(4, minmax(0, 1fr)); gap: 12px; align-items: start'">
          <div style="display: flex; flex-direction: column; gap: 4px"><span class="px" style="font-size: 10px; color: #AC0B32">CUELLO DE BOTELLA</span><strong style="font-size: 16px; color: #231417">{{ r.t }}</strong><span style="font-size: 12px; font-weight: 600; line-height: 1.35; color: #5C4A4D">Qué se hará (4.2): {{ r.what }}</span><span class="px" style="font-size: 10px; color: #6E5458">{{ r.pts }}</span></div>
          @for (s of r.sels; track $index) {
            <label style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; font-weight: 800; color: #6E5458">{{ s.label }}
              <select (change)="s.set?.($event)" [attr.aria-label]="(s.aria)" [style]="'min-height: 44px; border-radius: 8px; border: 2px solid ' + (s.bd) + '; padding: 0 8px; font-size: 13px; font-weight: 600; background: #FFFFFF; color: #231417'">
                @for (o of s.opts; track $index) {<option [value]="(o.v)" [selected]="((o.sel)) === true || ((o.sel)) === 'true'">{{ o.t }}</option>}
              </select>
              @if (s.showFb) {<span [style]="'font-weight: 800; color: ' + (s.fbc)">{{ s.fb }}</span>}
            </label>
          }
          <label style="grid-column: 2 / -1; display: flex; flex-direction: column; gap: 4px; font-size: 12px; font-weight: 800; color: #6E5458">¿Cómo sabrás que funcionó?
            <input type="text" maxlength="120" [value]="(r.how)" (input)="r.setHow?.($event)" placeholder="Escribe una frase…" [style]="'min-height: 44px; border-radius: 8px; border: 2px solid ' + (r.howBd) + '; padding: 0 12px; font-size: 14px; background: #FFFFFF; color: #231417'">
          </label>
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
export class Reto43 extends DcReto {
  readonly ejercicioId = RD.id;
  readonly titulo = RD.title;
  readonly max = RD.max;
  protected override autoRegistro = true;

  constructor() { super(); SAY = (t) => this.speak(t); this.state = { v: ROWS.map((_, r) => ({ what: r, resp: -1, plazo: -1, ind: -1, rec: -1, how: '' })), att: 1, res: null, best: 0, first: null, done: false, fb: null };  this.restaurar(); }
  evalNow() { const { v } = this.state; const per = v.map((x, r) => { const o = {}; ['resp', 'plazo', 'ind', 'rec'].forEach((f) => { o[f] = OK[r][f].indexOf(x[f]) >= 0; }); o.how = x.how.trim().length >= 10; return o; });
    return { per, pts: per.reduce((s, o) => s + Object.keys(o).filter((k) => o[k]).length * 4, 0) }; }
  check() {
    const { att, best } = this.state; const r = this.evalNow(); const nb = Math.max(best, r.pts);
    if (r.pts === 60 || att === 2) { this.setState({ res: r, best: nb, done: true, first: att === 1 ? r.pts : this.state.first, fb: r.pts === 60 ? { ok: true, t: '¡Plan coherente!', x: 'El ciclo vuelve a empezar con mejoras.' } : { ok: false, t: 'Ganaste ' + r.pts + ' de 60 granos.', x: 'Los campos en verde muestran lo coherente.' } }); return; }
    this.setState({ res: r, best: nb, att: 2, first: r.pts, fb: { ok: false, t: 'Ganaste ' + r.pts + ' de 60 granos.', x: 'Hay campos poco coherentes. Intento 2 de 2.' } });
  }
  renderVals() {
    const { v, att, res, best, first, done, fb } = this.state;
    const ready = v.every((x) => FIELDS.slice(1).every(([f]) => x[f] >= 0) && x.how.trim().length > 0);
    const set = (r, patch) => { if (done) return; const nv = v.map((x, k) => (k === r ? { ...x, ...patch } : x)); this.setState({ v: nv, res: null }); };
    return {
      consigna: CONSIGNA, listen: () => SAY(CONSIGNA), ...attVals(att, done), score: best, scoreAria: best + ' granos de 60',
      phva: ['PLANEAR', 'HACER', 'VERIFICAR', 'ACTUAR'].map((t, k) => ({ t, arrow: k < 3 ? '→' : '↺', bg: k === 3 ? '#FF836C' : '#2A0B12', fg: k === 3 ? '#1A0609' : '#FFD3C9', bd: k === 3 ? '#FF836C' : 'rgba(255,131,108,0.4)' })),
      rows: ROWS.map((t, r) => { const x = v[r], p = res ? res.per[r] : null, n = p ? Object.keys(p).filter((k) => p[k]).length : 0;
        return { t, pts: p ? n * 4 + ' / 20 GRANOS' : '20 GRANOS', bd: p ? (n === 5 ? '#3F7E44' : '#AC0B32') : '#FFFFFF', how: x.how, howBd: p ? (p.how ? '#3F7E44' : '#AC0B32') : '#EFE6E6', setHow: (e) => set(r, { how: e.target.value }),
          what: WHAT[r], sels: FIELDS.slice(1).map(([f, label, list]) => ({ label, aria: label + ' · ' + t, bd: p ? (p[f] ? '#3F7E44' : '#AC0B32') : '#EFE6E6', showFb: !!p && !p[f], fb: done ? '→ ' + list[OK[r][f][0]] : '↺ Poco coherente', fbc: '#8A1428',
            opts: [{ v: '-1', t: 'Elige…', sel: x[f] < 0 }].concat(list.map((o, k) => ({ v: String(k), t: o, sel: x[f] === k }))), set: (e) => set(r, { [f]: parseInt(e.target.value, 10) }) })) }; }),
      ...fbVals(fb), badge: done && first === 60,
      canCheck: !done, ...btn(ready), checkLabel: 'Comprobar plan', check: () => { if (ready) this.check(); },
      canClear: false, clearAll: () => {},
      done, nextHref: '/reto/4.4', nextLabel: 'RETO 4.4'
    };
  }
}
