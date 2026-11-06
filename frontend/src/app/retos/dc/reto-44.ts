// @ts-nocheck
/* Reto 4.4 · Cerrar el círculo (diseño final: Reto44.dc.html). Generado a partir del prototipo:
   la lógica es la del diseño; el contenido vive en retos/data/4.4.json. */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Feedback } from '../../shared/feedback';
import { Hud } from '../../shared/hud';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/4.4.json';
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
/* Decisiones esperadas: documento de la profesora. Resultados: valores del prototipo coherentes con el reporte 2027 (4.2). */
/* Objetivos del Módulo 1: la columna «meta» muestra la que el estudiante fijó en el reto 1.4. */
let O = RD.O;
const FMT14 = { energia: (m) => '−' + m + ' % por tonelada', familias: (m) => m + ' % capacitadas', ventas: (m) => '+' + m + ' % nacional', gobernanza: (m) => m + ' hitos' };
const desde14 = (ans) => RD.O.map((o, i) => {
  const k = ['energia', 'familias', 'ventas', 'gobernanza'][i];
  const m = ans && ans[k] && ans[k].meta != null ? ans[k].meta : null;
  return m == null ? o : [o[0], o[1], o[2], 'Tu meta: ' + FMT14[k](m), ...o.slice(4)];
});
const D = RD.D;
@Component({
  selector: 'app-reto-44',
  imports: [RouterLink, Hud, Personaje, Feedback],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 4 · RETO 4.4'" [title]="titulo" [granos]="v().score + ' / ' + max" [salida]="salida()">
    <div centro [attr.aria-label]="(v().attText)" style="display: flex; align-items: center; gap: 8px">@for (p of v().atts; track $index) {<span [style]="'width: 72px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}<span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().attText }}</span></div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1240px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
    
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
      <app-personaje who="teo" [size]="88" />
      <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; border-style: none"><span class="px" style="font-size: 10px; color: #AC0B32">SITUACIÓN · VUELVES A TUS OBJETIVOS</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().consigna }}</span></div>
      <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; border: none; background: #ffd3c9; cursor: pointer; display: flex; align-items: center; justify-content: center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg></button>
    </div>

    <section class="g2" aria-label="Tus cuatro objetivos" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px">
      @for (o of v().objs; track $index) {
        <div [style]="'background: #FFFFFF; border-radius: 12px; padding: 18px 20px; box-shadow: 0 14px 30px rgba(0,0,0,0.3); border: 3px solid ' + (o.bd) + '; display: flex; flex-direction: column; gap: 10px'">
          <div style="display: flex; align-items: center; gap: 10px"><span aria-hidden="true" [style]="'width: 12px; height: 12px; border-radius: 999px; background: ' + (o.c)"></span><strong style="font-size: 18px; color: #231417">{{ o.name }}</strong><span [style]="'margin-left: auto; padding: 4px 10px; border-radius: 999px; background: ' + (o.stBg) + '; color: ' + (o.stFg) + '; font-size: 12px; font-weight: 800'">{{ o.note }}</span></div>
          <div class="g2" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px">
            <div style="padding: 10px 12px; border-radius: 8px; background: #FFF5F2; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; font-weight: 800; color: #6E5458">Resultado 2027</span><span style="font-size: 26px; font-weight: 800; line-height: 1.1; color: #231417">{{ o.res }}</span></div>
            <div style="padding: 10px 12px; border-radius: 8px; background: #F6F1F0; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; font-weight: 800; color: #6E5458">Meta</span><span style="font-size: 18px; font-weight: 800; line-height: 1.25; color: #231417">{{ o.goal }}</span></div>
          </div>
          <div class="g2" role="radiogroup" [attr.aria-label]="(o.aria)" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
            @for (d of o.opts; track $index) {<button type="button" (click)="d.pick?.($event)" [attr.aria-pressed]="(d.on)" [style]="'min-height: 42px; border-radius: 8px; border: 2px solid ' + (d.bd) + '; background: ' + (d.bg) + '; color: ' + (d.fg) + '; font-size: 14px; font-weight: 800; cursor: ' + (d.cur)">{{ d.t }}</button>}
          </div>
          @if (o.showFb) {<span [style]="'font-size: 13px; font-weight: 800; color: ' + (o.fbc)">{{ o.fb }}</span>}
        </div>
      }
    </section>
    @if (v().done4) {
      <section class="up" aria-label="Informe final" style="background: #FFFFFF; border-radius: 12px; padding: 18px 20px; box-shadow: 0 14px 30px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 18px; flex-wrap: wrap">
        <div style="flex: 1 1 360px; display: flex; flex-direction: column; gap: 6px"><span class="px" style="font-size: 10px; color: #AC0B32">INFORME FINAL · PDF</span><strong style="font-size: 18px; color: #231417">Tu recorrido, tus decisiones y la retroalimentación de cada módulo.</strong><span style="font-size: 13px; font-weight: 600; color: #6E5458">Descárgalo y súbelo a la tarea de Moodle.</span></div>
        <button type="button" class="gbtn" (click)="v().download?.($event)" [style]="'min-height: 52px; padding: 0 24px; border: none; background: ' + (v().dlBg) + '; color: #FFFFFF; font-weight: 800; font-size: 16px; cursor: pointer'">{{ v().dlLabel }}</button>
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
export class Reto44 extends DcReto {
  readonly ejercicioId = RD.id;
  readonly titulo = RD.title;
  readonly max = RD.max;
  protected override autoRegistro = true;

  constructor() { super(); SAY = (t) => this.speak(t); O = desde14(this.progress.attempts('m1-metas').at(-1)?.answers); this.state = { dec: {}, att: 1, res: null, best: 0, first: null, done4: false, dl: false, fb: null };  this.restaurar(); }
  check() {
    const { dec, att, best } = this.state; const ok = O.map((o, i) => o[5].indexOf(dec[i]) >= 0); const n = ok.filter(Boolean).length, pts = n * 10;
    const nb = Math.max(best, pts);
    if (n === 4 || att === 2) { this.setState({ res: ok, best: nb, done4: true, first: att === 1 ? pts : this.state.first, fb: n === 4 ? { ok: true, t: '¡Cerraste el círculo!', x: 'Ahora descarga tu informe.' } : { ok: false, t: n + ' de 4 decisiones.', x: 'Mira la decisión esperada y descarga tu informe.' } }); return; }
    this.setState({ res: ok, best: nb, att: 2, first: pts, fb: { ok: false, t: n + ' de 4 decisiones.', x: 'Compara resultado y meta. Intento 2 de 2.' } });
  }
  /** Informe final en PDF (dibujado con jsPDF, texto real y seleccionable). */
  async informePdf() {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = pdf.internal.pageSize.getWidth(), L = 18, R = W - 18;
    const txt = (t, x, y, size, color, bold = false, opts = {}) => { pdf.setFont('helvetica', bold ? 'bold' : 'normal'); pdf.setFontSize(size); pdf.setTextColor(color); pdf.text(t, x, y, opts); };
    const nombre = this.progress.student()?.nombre ?? 'Estudiante';
    pdf.setFillColor('#8A1428'); pdf.rect(0, 0, W, 34, 'F');
    txt('INFORME FINAL · CACAO RAÍZ S.A.S. · 2030', L, 14, 10, '#FFD3C9', true);
    txt(nombre, L, 25, 18, '#FFFFFF', true);
    txt('GADMI Sost-Empresarial · Universidad Autónoma de Occidente', L, 31, 8.5, '#FFD3C9');
    let y = 46;
    txt('GRANOS POR MÓDULO', L, y, 9, '#8A1428', true); y += 7;
    let tot = 0, max = 0;
    for (const st of this.progress.moduleStats()) {
      tot += st.points; max += st.max;
      txt('Módulo ' + st.module.id + ' · ' + st.module.phase, L, y, 10.5, '#231417');
      txt('Ganaste ' + st.points + ' de ' + st.max + ' granos', R, y, 10.5, '#231417', true, { align: 'right' }); y += 6.5;
    }
    pdf.setDrawColor('#EFE6E6'); pdf.line(L, y - 2, R, y - 2);
    txt('Total: ' + tot + ' de ' + max + ' granos', R, y + 4, 11, '#8A1428', true, { align: 'right' }); y += 16;
    txt('CERRAR EL CÍRCULO · TUS 4 OBJETIVOS DEL MÓDULO 1', L, y, 9, '#8A1428', true); y += 7;
    const { dec } = this.state;
    O.forEach((o, i) => {
      const elegida = (D.find((d) => d[0] === dec[i]) ?? [null, 'Sin decisión'])[1];
      const esperada = o[5].map((k) => (D.find((d) => d[0] === k) ?? [k, k])[1]).join(' o ');
      pdf.setDrawColor('#EFE6E6'); pdf.setLineWidth(0.6); pdf.line(L, y - 4, L, y + 17);
      txt(o[0], L + 4, y, 12, '#231417', true);
      txt('Resultado 2030: ' + o[2] + '   ·   ' + o[3] + '   ·   ' + o[4], L + 4, y + 6, 9.5, '#5C4A4D');
      txt('Tu decisión: ' + elegida + '   ·   Esperada: ' + esperada, L + 4, y + 12, 9.5, o[5].includes(dec[i]) ? '#2C5E31' : '#8A1428', true);
      txt(o[6], L + 4, y + 17, 9, '#5C4A4D');
      y += 26;
    });
    txt('Generado el ' + new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · Licencia CC BY-NC-SA 4.0', L, 285, 8, '#6E5458');
    pdf.setProperties({ title: 'Informe final GADMI Sost-Empresarial · ' + nombre, author: 'GADMI Sost-Empresarial · UAO' });
    pdf.save('informe-final-gadmi.pdf');
  }
  renderVals() {
    const { dec, att, res, best, first, done4, dl, fb } = this.state;
    const total = best + (dl ? 20 : 0), ready = O.every((o, i) => dec[i]);
    return {
      consigna: CONSIGNA, listen: () => SAY(CONSIGNA), ...attVals(att, dl), score: total, scoreAria: total + ' granos de 60',
      objs: O.map(([name, c, r, goal, note, okd, why], i) => { const show = !!res, ok = res && res[i];
        const tone = /Lejos/.test(note) ? ['#FFF0EC', '#8A1428'] : /cumplida/.test(note) ? ['#EAF4E6', '#2C5E31'] : ['#FFF7DC', '#6B5200'];
        return { name, c, res: r, goal, note, stBg: tone[0], stFg: tone[1], aria: 'Decisión para ' + name, bd: show ? (ok ? '#3F7E44' : '#AC0B32') : '#FFFFFF', showFb: show, fb: ok ? '✓ ' + why : done4 ? '→ ' + why : '↺ Compara el resultado con la meta.', fbc: ok ? '#2C5E31' : '#8A1428',
          opts: D.map(([k, t]) => { const on = dec[i] === k; return { t, on: on ? 'true' : 'false', bg: on ? '#8A1428' : '#FFFFFF', fg: on ? '#FFFFFF' : '#231417', bd: on ? '#8A1428' : '#EFE6E6', cur: done4 ? 'default' : 'pointer', pick: () => { if (!done4) this.setState({ dec: { ...dec, [i]: k }, res: null }); } }; }) }; }),
      done4, dlBg: dl ? '#3F7E44' : '#AC0B32', dlLabel: dl ? '✓ Informe descargado' : 'Descargar informe (PDF)',
      download: () => { this.informePdf(); if (!dl) this.setState({ dl: true, fb: { ok: true, t: 'Informe listo.', x: '+20 granos por completar el resultado final.' } }); },
      ...fbVals(fb), badge: dl && first === 40,
      canCheck: !done4, ...btn(ready), checkLabel: 'Comprobar', check: () => { if (ready) this.check(); },
      canClear: false, clearAll: () => {},
      done: dl, nextHref: '/bitacora/4', nextLabel: 'CERRAR MÓDULO'
    };
  }
}
