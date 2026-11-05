import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Hud } from '../../shared/hud';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/1.4.json';
import { DcReto } from './dc-reto';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* Contenido oficial de la profesora (retos/data/1.4.json): no modificar */
const CAT = (DATA.catalogo as unknown as [string, string, string][]).map(([id, t, f]) => [t, f, id]);
/* ind = posición 1..7 en el catálogo (0 = sin elegir) */
const O: any[] = DATA.objetivos.map((o: any) => ({ ...o, mean: (v: number) => o.significado.replace('{familias}', String(Math.round(v * 1.2))) }));
const HZ = DATA.plazos as unknown as [string, string, string, string][];
const SIT = DATA.situacion;
const P = DATA.puntos;
const keyAct = (fn: () => void) => (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };
const fmt = (n: number) => String(n).replace('.', ',');

/** Reto 1.4 · Metas e indicadores (Reto14.dc.html, rediseño): un objetivo a la vez y cierre «Tu sistema de medición». */
@Component({
  selector: 'app-reto-14',
  imports: [Hud, Personaje],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 1 · RETO 1.4'" [title]="titulo" [granos]="(v().score + ' / ' + v().maxScore)" [salida]="salida()">
    <div centro [attr.aria-label]="(v().progText)" style="display: flex; align-items: center; gap: 8px">@for (p of v().steps; track $index) {<span [style]="'width: 64px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}<span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().progText }}</span></div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1200px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
    
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
      <app-personaje who="chispa" [size]="88" />
      <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px"><span class="px" style="font-size: 10px; color: #AC0B32">{{ v().sitLabel }}</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().sitText }}</span></div>
      <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; cursor: pointer; display: flex; align-items: center; justify-content: center; border-style: none; background-color: #ffd3c9"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FBF5EC" stroke-width="2" aria-hidden="true" style="stroke: #231417"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg></button>
    </div>

    
    @if (v().config) {
      <div style="display: flex; flex-direction: column; gap: 14px">
        <nav aria-label="Objetivos" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px">
          @for (t of v().tabs; track $index) {
            <button type="button" (click)="t.go?.($event)" [attr.aria-current]="(t.current)" [attr.aria-label]="(t.aria)" [style]="'height: 56px; box-sizing: border-box; padding: 0 14px; border-radius: 8px; border: 2px solid ' + (t.bd) + '; background: ' + (t.bg) + '; color: #FBF5EC; cursor: pointer; display: flex; align-items: center; gap: 10px; text-align: left'">
              <span [style]="'width: 12px; height: 12px; flex-shrink: 0; border-radius: 3px; background: ' + (t.c)"></span>
              <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0"><strong style="font-size: 15px">{{ t.name }}</strong><span class="px" [style]="'font-size: 10px; color: ' + (t.stC)">{{ t.state }}</span></div>
              @if (t.done) {<span class="pop" aria-hidden="true" style="margin-left: auto; width: 24px; height: 24px; border-radius: 999px; background: #3F7E44; color: #FFFFFF; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center">✓</span>}
            </button>
          }
        </nav>

        <section class="up gpanel" [attr.aria-label]="(v().cardAria)" style="background: #FFFFFF; padding: 28px 30px; display: flex; flex-direction: column; gap: 26px">
          <div style="display: flex; align-items: flex-start; gap: 14px">
            <div style="flex: 1; display: flex; flex-direction: column; gap: 6px">
              <div style="display: flex; align-items: center; gap: 10px"><span class="px" style="font-size: 10px; color: #AC0B32">OBJETIVO {{ v().curN }} DE 4 · {{ v().oName }}</span><span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: #6E5458"><span aria-hidden="true" [style]="'width: 8px; height: 8px; border-radius: 999px; background: ' + (v().oDimBg)"></span>Dimensión {{ v().oDimLow }}</span></div>
              <span style="font-size: 20px; font-weight: 800; line-height: 1.3">{{ v().oGoal }}</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 40px; align-items: start">
            
            <div role="radiogroup" aria-label="Indicador" style="display: flex; flex-direction: column; gap: 2px">
              <span class="px" style="font-size: 10px; color: #8A1428">1 · ¿CÓMO LO MIDES?</span>
              @for (c of v().catalog; track $index) {
                <div role="radio" tabindex="0" [attr.aria-checked]="(c.on)" class="opt" (click)="c.pick?.($event)" (keydown)="c.key?.($event)" [style]="'padding: 10px 12px; border-radius: 8px; border: 2px solid ' + (c.bd) + '; background: ' + (c.bg) + '; cursor: pointer; display: flex; align-items: center; gap: 12px'">
                  <span aria-hidden="true" [style]="'width: 18px; height: 18px; flex-shrink: 0; box-sizing: border-box; border-radius: 999px; border: 3px solid ' + (c.rbd) + '; background: ' + (c.rbg)"></span>
                  <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0"><strong style="font-size: 16px; line-height: 1.3">{{ c.t }}</strong>@if (c.hasF) {<span style="font-size: 13px; color: #6E5458; line-height: 1.35">{{ c.f }}</span>}</div>
                </div>
              }
            </div>

            <div style="display: flex; flex-direction: column; gap: 26px">
            
            <div style="display: flex; flex-direction: column; gap: 12px; padding: 20px 22px; border-radius: 14px; background: #FFF5F2">
              <span class="px" style="font-size: 10px; color: #8A1428">2 · ¿CUÁNTO?</span>
              <div style="display: flex; align-items: baseline; gap: 8px"><span [style]="'font-size: 56px; font-weight: 800; line-height: 1; color: ' + (v().metaC)">{{ v().metaBig }}</span><span style="font-size: 18px; font-weight: 800; color: #5C4A4D">{{ v().metaUnit }}</span></div>
              <span style="font-size: 14px; font-weight: 600; color: #5C4A4D; line-height: 1.35; min-height: 38px">{{ v().metaMeaning }}</span>
              @if (v().isSlider) {
                <div style="position: relative; padding-top: 4px">
                  @if (v().showRange) {<span aria-hidden="true" [style]="'position: absolute; top: 12px; left: ' + (v().rangeL) + '; width: ' + (v().rangeW) + '; height: 12px; border-radius: 999px; background: rgba(63,126,68,0.45); pointer-events: none'"></span>}
                  <input class="meta" type="range" min="0" [attr.max]="(v().oMax)" [attr.step]="(v().oStep)" [value]="(v().oMeta)" (input)="v().setMeta?.($event)" [attr.aria-label]="(v().metaAria)">
                  <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #6E5458"><span>0</span><span>{{ v().midTick }}</span><span>{{ v().oMax }}</span></div>
                </div>
              }
              @if (v().isHitos) {
                <div role="group" aria-label="Hitos que te comprometes a cumplir" style="display: flex; flex-direction: column; gap: 8px">
                  @for (h of v().hitos; track $index) {
                    <button type="button" class="opt" (click)="h.toggle?.($event)" [attr.aria-pressed]="(h.on)" [style]="'min-height: 42px; padding: 0 12px; border-radius: 8px; border: 2px solid ' + (h.bd) + '; background: ' + (h.bg) + '; color: ' + (h.fg) + '; font-size: 14px; font-weight: 700; text-align: left; display: flex; align-items: center; gap: 10px; cursor: pointer'"><span aria-hidden="true" [style]="'width: 20px; height: 20px; flex-shrink: 0; box-sizing: border-box; border-radius: 4px; border: 2px solid ' + (h.cbd) + '; background: ' + (h.cbg) + '; color: #FFFFFF; font-size: 13px; display: flex; align-items: center; justify-content: center'">{{ h.mark }}</span>{{ h.t }}</button>
                  }
                </div>
              }
            </div>

            
            <div role="radiogroup" aria-label="Horizonte temporal" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px">
              <span class="px" style="grid-column: 1 / -1; font-size: 10px; color: #8A1428">3 · ¿PARA CUÁNDO?</span>
              @for (h of v().hz; track $index) {
                <div role="radio" tabindex="0" [attr.aria-checked]="(h.on)" class="opt" (click)="h.pick?.($event)" (keydown)="h.key?.($event)" [style]="'padding: 14px 10px; border-radius: 10px; border: 2px solid ' + (h.bd) + '; background: ' + (h.bg) + '; color: ' + (h.fg) + '; cursor: pointer; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px'">
                  <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" style="flex-shrink: 0"><circle cx="17" cy="17" r="14" fill="none" [attr.stroke]="(h.ic)" stroke-width="3" opacity="0.3"></circle><path [attr.d]="(h.arc)" fill="none" [attr.stroke]="(h.ic)" stroke-width="3" stroke-linecap="round"></path></svg>
                  <div style="display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 15px">{{ h.t }}</strong><span style="font-size: 12px; font-weight: 600; opacity: .85">{{ h.d }}</span></div>
                </div>
              }
            </div>
            </div>
          </div>
        </section>

        <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap; min-height: 52px">
          @if (v().canPrev) {<button type="button" class="gbtn" (click)="v().prev?.($event)" style="min-height: 52px; padding: 0 18px; border: 2px solid #FF836C; background: #2A0B12; color: #FBF5EC; cursor: pointer"><span class="px" style="font-size: 10px">◀ ANTERIOR</span></button>}
          @if (v().curDone) {<span class="pop px" role="status" style="font-size: 10px; color: #8FD18A">✓ CONFIGURACIÓN LISTA</span>}
          <span style="flex: 1"></span>
          @if (v().canNext) {<button type="button" class="gbtn" (click)="v().next?.($event)" [style]="'min-height: 52px; padding: 0 22px; border: none; background: ' + (v().nextBg) + '; color: ' + (v().nextFg) + '; cursor: pointer'"><span class="px" style="font-size: 11px">SIGUIENTE OBJETIVO ▶</span></button>}
          @if (v().isLast) {<button type="button" class="gbtn" (click)="v().check?.($event)" style="min-height: 52px; padding: 0 24px; border: none; background: #AC0B32; color: #FFFFFF; font-weight: 800; font-size: 16px; cursor: pointer">Revisar plan ({{ v().doneN }}/4)</button>}
        </div>
      </div>
    }

    
    @if (v().evalView) {
      <div class="up" style="display: flex; flex-direction: column; gap: 16px">
        <div style="display: flex; align-items: center; gap: 12px"><span class="px" style="font-size: 10px; color: #FF836C">TU SISTEMA DE MEDICIÓN · OBJETIVO → INDICADOR → META → PLAZO</span></div>
        <div class="g4" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px">
          @for (s of v().summary; track $index) {
            <article style="background: #FFFFFF; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 10px">
              <div style="display: flex; align-items: center; justify-content: space-between"><strong style="font-size: 17px">{{ s.name }}</strong><span class="px" [style]="'font-size: 10px; color: ' + (s.ptsC)">{{ s.pts }}/15</span></div>
              <div [style]="'display: flex; flex-direction: column; gap: 4px; padding: 8px 10px; border-radius: 6px; background: ' + (s.iBg)"><span class="px" style="font-size: 10px; color: #6E5458">INDICADOR</span><span style="font-size: 13px; font-weight: 700; line-height: 1.3">{{ s.iMark }} {{ s.ind }}</span></div>
              <div [style]="'display: flex; flex-direction: column; gap: 4px; padding: 8px 10px; border-radius: 6px; background: ' + (s.mBg)"><span class="px" style="font-size: 10px; color: #6E5458">META</span><span style="font-size: 13px; font-weight: 700; line-height: 1.3">{{ s.mMark }} {{ s.meta }}</span></div>
              <div [style]="'display: flex; flex-direction: column; gap: 4px; padding: 8px 10px; border-radius: 6px; background: ' + (s.hBg)"><span class="px" style="font-size: 10px; color: #6E5458">PLAZO</span><span style="font-size: 13px; font-weight: 700; line-height: 1.3">{{ s.hMark }} {{ s.hz }}</span></div>
              <span [style]="'font-size: 13px; font-weight: 700; line-height: 1.35; color: ' + (s.fbC)">{{ s.fb }}</span>
            </article>
          }
        </div>

        <section class="gpanel" aria-label="Consecuencia de tu plan" style="background: #8A1428; padding: 18px; display: flex; flex-direction: column; gap: 14px">
          <span class="px" style="font-size: 10px; color: #FFD3C9">CONSECUENCIA EN TU EMPRESA</span>
          <div class="g2" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px">
            <div style="background: #FFFFFF; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 10px"><span class="px" style="font-size: 10px; color: #AC0B32">QUÉ PASÓ</span><span style="font-size: 15px; font-weight: 700; line-height: 1.4">{{ v().csqWhat }}</span></div>
            <div style="background: #FFFFFF; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 8px"><span class="px" style="font-size: 10px; color: #AC0B32">TU EMPRESA EN 2027</span>
              @for (d of v().csqInd; track $index) {<div style="display: flex; align-items: center; gap: 8px; font-size: 14px"><span [style]="'width: 10px; height: 10px; border-radius: 2px; background: ' + (d.c)"></span><strong style="flex: 1">{{ d.label }}</strong><span [style]="'font-weight: 800; color: ' + (d.tc)">{{ d.v }}</span></div>}
            </div>
            <div style="background: #FFFFFF; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 10px"><span class="px" style="font-size: 10px; color: #3F7E44">LO QUE APRENDISTE</span><span style="font-size: 15px; font-weight: 700; line-height: 1.4">Lo que no se mide no se puede controlar: cada meta necesita indicador y fecha.</span></div>
          </div>
        </section>

        <div style="display: flex; align-items: center; gap: 14px; min-height: 52px">
          @if (v().canAdjust) {<button type="button" class="gbtn" (click)="v().adjust?.($event)" style="min-height: 52px; padding: 0 18px; border: 2px solid #FF836C; background: #2A0B12; color: #FBF5EC; cursor: pointer"><span class="px" style="font-size: 10px">◀ AJUSTAR PLAN</span></button>}
          <span style="flex: 1"></span>
          <button type="button" class="gbtn glow pop" (click)="v().terminar()" style="display: inline-flex; align-items: center; min-height: 52px; padding: 0 24px; background: #FF836C; color: #1A0609; border: none; cursor: pointer"><span class="px" style="font-size: 11px">▶ CERRAR MÓDULO</span></button>
        </div>
      </div>
    }
  </main>
</div>`,
  styles: `a:focus-visible,button:focus-visible,input:focus-visible,[role=radio]:focus-visible{outline:3px solid #FF836C;outline-offset:3px}
button,input{font-family:inherit}
@keyframes pop{0%{opacity:0;transform:scale(.7)}70%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.pop{animation:pop .4s cubic-bezier(.2,.7,.2,1) both}
.up{animation:up .4s cubic-bezier(.2,.7,.2,1) both}
.opt{transition:border-color .12s,background .12s}
.opt:hover{border-color:#FF836C}
input[type=range].meta{-webkit-appearance:none;appearance:none;width:100%;height:28px;background:transparent;margin:0}
input[type=range].meta::-webkit-slider-runnable-track{height:12px;border-radius:999px;background:#E5D8C8;border:2px solid #231417}
input[type=range].meta::-moz-range-track{height:12px;border-radius:999px;background:#E5D8C8;border:2px solid #231417}
input[type=range].meta::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;margin-top:-10px;border-radius:6px;background:#AC0B32;border:3px solid #FFFFFF;box-shadow:3px 3px 0 #231417;cursor:grab}
input[type=range].meta::-moz-range-thumb{width:24px;height:24px;border-radius:6px;background:#AC0B32;border:3px solid #FFFFFF;box-shadow:3px 3px 0 #231417;cursor:grab}
@media (prefers-reduced-motion: reduce){.pop,.up,.glow{animation:none}.gbtn,.opt{transition:none}}
.opt:hover{background:#FFF5F2}
    @media (max-width: 760px){ .g2{grid-template-columns:1fr !important} .g4{grid-template-columns:repeat(2,minmax(0,1fr)) !important} }
  `,
})
export class Reto14 extends DcReto {
  readonly ejercicioId = DATA.id;
  readonly titulo = DATA.title;
  private router = inject(Router);

  constructor() {
    super();
    this.state = { v: O.map(() => ({ ind: 0, meta: 0, hz: null, hit: [false, false, false] })), cur: 0, checked: false, att: 1 };
    this.restaurar();
  }
  /* Puntaje original: indicador 8 · meta 5 (2,5 si está fuera del rango) · plazo 2 */
  pts(o: any, x: any) {
    const ind = x.ind === o.ind ? P.indicador : 0;
    const inRange = x.meta >= o.lo && x.meta <= o.hi;
    const meta = x.ind === o.ind ? (inRange ? P.meta : x.meta > 0 ? P.metaFueraDeRango : 0) : 0;
    const hz = o.hz.indexOf(x.hz) >= 0 ? P.plazo : 0;
    return { ind, meta, hz, inRange, total: ind + meta + hz };
  }
  /** Cerrar módulo: los granos cuentan y se guarda el sistema de medición. */
  terminar() {
    const { v } = this.state;
    if (!this.yaRegistrado()) {
      const score = Math.round(O.reduce((s: number, o: any, i: number) => s + this.pts(o, v[i]).total, 0));
      const answers: Record<string, unknown> = {};
      O.forEach((o: any, i: number) => (answers[o.id] = { indicator: v[i].ind ? CAT[v[i].ind - 1][0] : '', meta: v[i].meta, horizon: v[i].hz }));
      const items = O.map((o: any, i: number) => { const p = this.pts(o, v[i]); return { label: o.name, ok: p.total >= 15, explanation: 'Indicador: ' + CAT[o.ind - 1][1] + ' · meta entre ' + o.lo + ' y ' + o.hi + ' ' + o.unit + ' · plazo ' + o.hz.join(' o ').toLowerCase() + '.' }; });
      this.registrar(score, items, answers, `${score} de 60 granos.`,
        { todosConIndicador: O.every((o: any, i: number) => v[i].ind === o.ind), aLaPrimera: this.state['att'] === 1, segundoIntento: this.state['att'] === 2 });
    }
    this.router.navigateByUrl(this.after().link);
  }
  renderVals() {
    const { v, cur, checked } = this.state;
    const set = (i: number, patch: any) => { const nv = v.map((x: any, k: number) => (k === i ? { ...x, ...patch } : x)); this.setState({ v: nv, checked: false }); };
    const complete = (x: any) => x.ind > 0 && x.meta > 0 && !!x.hz;
    const doneN = v.filter(complete).length;
    const score = checked ? Math.round(O.reduce((s: number, o: any, i: number) => s + this.pts(o, v[i]).total, 0)) : 0;
    const o = O[cur], x = v[cur], last = cur === O.length - 1;
    const isH = !!o.hitos;
    const fbOf = (o: any, x: any, p: any) => (!p.ind ? '↺ Ese indicador no mide este objetivo.' : !p.inRange ? (x.meta < o.lo ? '↺ Meta poco ambiciosa.' : '↺ Meta difícil de alcanzar con los recursos actuales.') : !p.hz ? '↺ Revisa el plazo.' : '✓ Medible, realista y con plazo.');
    return {
      score, maxScore: DATA.max, scoreAria: score + ' granos de 60',
      steps: O.map((_, k) => (k === cur && !checked ? '#FF836C' : complete(v[k]) ? '#8A1428' : '#4A2A2F')),
      progText: checked ? 'PLAN COMPLETO' : 'OBJETIVO ' + (cur + 1) + ' DE 4',
      sitLabel: 'SITUACIÓN · LA JUNTA FIRMA EL PLAN 2027', sitText: SIT, listen: () => this.speak(SIT),
      config: !checked, evalView: checked,
      tabs: O.map((ob, k) => {
        const on = k === cur, dn = complete(v[k]);
        return {
          name: ob.name, c: ob.dimBg, done: dn, current: on ? 'step' : 'false',
          state: on ? 'CONFIGURANDO' : dn ? 'LISTO' : 'PENDIENTE', stC: on ? '#FF836C' : dn ? '#8FD18A' : '#C9B8A6',
          bd: on ? '#FF836C' : 'rgba(255,131,108,0.3)', bg: on ? '#3A1019' : '#2A0B12',
          aria: 'Objetivo ' + (k + 1) + ' de 4, ' + ob.name + (dn ? ', listo' : ', pendiente'),
          go: () => this.setState({ cur: k })
        };
      }),
      curN: cur + 1, oName: o.name.toUpperCase(), oDim: o.dim, oDimLow: o.dim.toLowerCase(), oDimBg: o.dimBg, oGoal: o.goal, cardAria: 'Configurar objetivo ' + o.name,
      catalog: CAT.map(([t, f], k) => {
        const on = x.ind === k + 1;
        const pick = () => set(cur, { ind: k + 1 });
        return { t, f, hasF: !!f, on: on ? 'true' : 'false', bd: on ? '#AC0B32' : 'transparent', bg: on ? '#FFF0EC' : 'transparent', rbd: on ? '#AC0B32' : '#B5A9A6', rbg: on ? '#AC0B32' : '#FFFFFF', pick, key: keyAct(pick) };
      }),
      isSlider: !isH, isHitos: isH,
      metaBig: x.meta === 0 ? '—' : (isH ? String(x.meta) : x.meta + ''), metaUnit: isH ? 'de 3 hitos' : '%', metaC: x.meta === 0 ? '#B5A9A6' : '#231417',
      metaMeaning: x.meta === 0 ? 'Mueve el control para fijar tu meta.' : o.mean(x.meta),
      metaAria: 'Meta de ' + o.name + ': ' + x.meta + ' ' + o.unit,
      oMax: o.max, oStep: o.step, oMeta: x.meta, midTick: Math.round(o.max / 2),
      setMeta: (e: any) => set(cur, { meta: parseInt(e.target.value, 10) }),
      showRange: false, rangeL: '0%', rangeW: '0%',
      hitos: (o.hitos || []).map((t: string, k: number) => {
        const on = !!x.hit[k];
        return {
          t, on: on ? 'true' : 'false', mark: on ? '✓' : '',
          bd: on ? '#AC0B32' : '#E5D8C8', bg: on ? '#FFF0EC' : '#FFFFFF', fg: '#231417', cbd: on ? '#AC0B32' : '#B5A9A6', cbg: on ? '#AC0B32' : '#FFFFFF',
          toggle: () => { const h = x.hit.slice(); h[k] = !h[k]; set(cur, { hit: h, meta: h.filter(Boolean).length }); }
        };
      }),
      hz: HZ.map(([k, t, d, arc]) => {
        const on = x.hz === k;
        const pick = () => set(cur, { hz: k });
        return { t, d, arc, on: on ? 'true' : 'false', bd: on ? '#231417' : '#EFE6E6', bg: on ? '#231417' : '#FFFFFF', fg: on ? '#FFFFFF' : '#231417', ic: on ? '#FF836C' : '#8A1428', pick, key: keyAct(pick) };
      }),
      curDone: complete(x), canPrev: cur > 0, prev: () => this.setState({ cur: cur - 1 }),
      canNext: !last, nextBg: complete(x) ? '#FF836C' : '#4A2A2F', nextFg: complete(x) ? '#1A0609' : '#C9B8A6',
      next: () => this.setState({ cur: Math.min(cur + 1, O.length - 1) }),
      isLast: last, doneN, check: () => { this.setState({ checked: true }); this.guardarPaso(4); },
      canAdjust: this.state['att'] === 1, adjust: () => { if (this.state['att'] === 1) this.setState({ checked: false, cur: 0, att: 2 }); },
      terminar: () => this.terminar(),
      summary: O.map((ob, i) => {
        const y = v[i], p = this.pts(ob, y), fb = fbOf(ob, y, p);
        const amber = '#FFF1DA';
        return {
          name: ob.name, c: ob.dimBg, pts: fmt(p.total), ptsC: p.total === 15 ? '#2C5E31' : '#8A1428',
          ind: y.ind ? CAT[y.ind - 1][0] : 'Sin indicador', iMark: p.ind ? '✓' : '↺', iBg: p.ind ? '#EAF4E6' : '#FFF0EC',
          meta: y.meta + ' ' + ob.unit + (p.ind ? (p.inRange ? ' · en rango' : y.meta < ob.lo ? ' · poco ambiciosa' : ' · difícil de alcanzar') : ''),
          mMark: p.ind && p.inRange ? '✓' : '~', mBg: p.ind && p.inRange ? '#EAF4E6' : p.ind ? amber : '#F1E9DF',
          hz: y.hz ? HZ.find((h) => h[0] === y.hz)![1] : 'Sin plazo', hMark: p.hz ? '✓' : '↺', hBg: p.hz ? '#EAF4E6' : '#FFF0EC',
          fb, fbC: fb.startsWith('✓') ? '#2C5E31' : '#8A1428'
        };
      }),
      csqWhat: O.filter((ob, i) => this.pts(ob, v[i]).total >= 15).length >= 3 ? 'La junta firma tu plan. Cada área sabe qué medir este año.' : 'La junta firma con dudas: algunas metas no se pueden medir.',
      csqInd: O.map((ob, i) => { const ok = this.pts(ob, v[i]).total >= 15; const lab = ({ AMBIENTAL: 'Ambiental', SOCIAL: 'Social', 'ECONÓMICA': 'Económico', GOBERNANZA: 'Gobernanza' } as Record<string, string>)[ob.dim]; return { label: lab, c: ob.dimBg, v: ok ? '+3' : '0', tc: ok ? '#2C5E31' : '#5C4A4D' }; })
    };
  }
}
