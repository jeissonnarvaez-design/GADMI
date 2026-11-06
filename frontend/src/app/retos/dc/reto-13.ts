import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Hud } from '../../shared/hud';
import { Feedback } from '../../shared/feedback';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/1.3.json';
import { DcReto } from './dc-reto';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* Contenido oficial de la profesora (retos/data/1.3.json): no modificar */
const Q = DATA.cuadrantes as unknown as Record<string, [string, string, string, string]>;
const T = DATA.tarjetas as unknown as [string, string, number][];
const INCENT = DATA.incentivo; /* distractor: incentivos tributarios */
const INC_WHY = DATA.porQueIncentivo;
const WHY = DATA.porQue as Record<string, string>;
const INT: Record<string, number> = { F: 1, D: 1, O: 0, A: 0 };
const PT = DATA.puntos.tarjeta, PE = DATA.puntos.estrategia;
/* Pista sin revelar el cuadrante: se basa en dónde lo puso el estudiante */
const hintFor = (i: number, k: string) => (i === INCENT && k === 'F' ? '¿La empresa controla esta ley o existe afuera?' : INT[k] !== INT[T[i][1]] ? (INT[k] ? '¿De verdad la empresa lo controla?' : '¿Esto pasa afuera o depende de la empresa?') : '¿Le ayuda a la empresa o le juega en contra?');
const S = DATA.estrategias as unknown as [string, string, boolean, string][];
const CONSIGNA = DATA.consigna;
const keyAct = (fn: () => void) => (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };
const stop = (e: any) => { if (e && e.stopPropagation) e.stopPropagation(); };

/** Reto 1.3 · Análisis FODA (Reto13.dc.html, rediseño): matriz con arrastre o toque, 2 intentos, decisión FO. */
@Component({
  selector: 'app-reto-13',
  imports: [Hud, Personaje, Feedback],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 1 · RETO 1.3'" [title]="titulo" [granos]="(v().score + ' / ' + v().maxScore)" [salida]="salida()">
    <div centro [attr.aria-label]="(v().progText)" style="display: flex; align-items: center; gap: 8px">@for (p of v().steps; track $index) {<span [style]="'width: 120px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}<span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().progText }}</span></div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1240px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
    
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
      <app-personaje who="teo" [size]="88" />
      <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px"><span class="px" style="font-size: 10px; color: #AC0B32">{{ v().sitLabel }}</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().sitText }}</span></div>
      <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; cursor: pointer; display: flex; align-items: center; justify-content: center; background-color: #ffd3c9; border-style: none"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FBF5EC" stroke-width="2" aria-hidden="true" style="stroke: #231417"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg></button>
    </div>

    
    @if (v().pA) {
      <div style="display: flex; flex-direction: column; gap: 16px">
        <div class="g2" style="display: grid; grid-template-columns: 380px minmax(0, 1fr); gap: 20px; align-items: start">
          <section aria-label="Factores por ubicar" (click)="v().trayClick?.($event)" (dragover)="v().allowDrop?.($event)" (drop)="v().dropTray?.($event)" style="height: 575px; box-sizing: border-box; padding: 12px; border-radius: 8px; border: 5px solid #FF836C; display: flex; flex-direction: column; gap: 10px">
            <span class="px" style="font-size: 10px; color: #FF836C">{{ v().trayLabel }}</span>
            <div class="trayscroll" style="height: 520px; overflow-y: auto; scroll-snap-type: y mandatory; display: grid; grid-auto-rows: 96px; gap: 10px; padding-right: 6px">
            @for (c of v().tray; track $index) {
              <button type="button" class="card" draggable="true" (dragstart)="c.drag?.($event)" (click)="c.pick?.($event)" [attr.aria-pressed]="(c.pressed)" [attr.aria-label]="(c.aria)" [style]="'scroll-snap-align: start; box-sizing: border-box; height: 96px; overflow: hidden; text-align: center; justify-content: center; align-items: center; padding: 10px 12px; border-radius: 8px; border: 3px ' + (c.line) + ' ' + (c.bd) + '; background: ' + (c.bg) + '; color: #231417; cursor: grab; box-shadow: ' + (c.sh) + '; display: flex; flex-direction: column; gap: 6px'">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 6px"><span style="font-size: 14px; font-weight: 700; line-height: 1.3">{{ c.text }}</span><span style="flex-shrink: 0; padding: 2px 8px; border-radius: 999px; background: #FFFFFF; border: 1.5px solid #B5A9A6; color: #5C4A4D; font-size: 11px; font-weight: 800">ODS {{ c.ods }}</span></div>
                @if (c.review) {<span style="font-size: 12px; font-weight: 700; color: #8A1428">↺ {{ c.hint }}</span>}
              </button>
            }
            </div>
          </section>

          <div role="group" aria-label="Matriz FODA" style="display: grid; grid-template-columns: 30px minmax(0, 1fr) minmax(0, 1fr); grid-template-rows: auto auto auto; gap: 10px">
            <span></span>
            <span class="px" style="text-align: center; font-size: 10px; color: #FFD3C9">A FAVOR</span>
            <span class="px" style="text-align: center; font-size: 10px; color: #FFD3C9">EN CONTRA</span>
            @for (row of v().rows; track $index) {
              <span class="px" style="writing-mode: vertical-rl; transform: rotate(180deg); text-align: center; font-size: 10px; color: #FFD3C9">{{ row.label }}</span>
              @for (z of row.q; track $index) {
                <div role="button" tabindex="0" [attr.aria-label]="(z.aria)" [class]="(z.cls)" (click)="z.drop?.($event)" (keydown)="z.key?.($event)" (dragover)="v().allowDrop?.($event)" (drop)="z.dropEv?.($event)" [style]="'height: 270px; overflow-y: auto; box-sizing: border-box; border-radius: 8px; border: 5px ' + (z.line) + ' #FF836C; background: ' + (z.bg) + '; color: #FBF5EC; padding: 12px; display: flex; flex-direction: column; gap: 8px; cursor: pointer; border-style: solid; border-width: 5px'">
                  <div style="display: flex; align-items: center; gap: 10px">
                    <span style="width: 36px; height: 36px; flex-shrink: 0; border-radius: 6px; background: #FF836C; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A0609" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="(z.icon)"></path></svg></span>
                    <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0"><strong style="font-size: 17px">{{ z.name }}</strong><span style="font-size: 12px; color: #C9B8A6">{{ z.desc }}</span></div>
                    <span class="px" style="margin-left: auto; font-size: 10px; color: #FFD3C9">{{ z.count }}</span>
                  </div>
                  @for (it of z.items; track $index) {
                    <button type="button" (click)="it.pick?.($event)" [attr.draggable]="(it.draggable)" (dragstart)="it.drag?.($event)" [attr.aria-label]="(it.aria)" [style]="'text-align: left; padding: 7px 9px; border-radius: 6px; border: 2px solid ' + (it.bd) + '; background: ' + (it.bg) + '; color: #231417; font-size: 13px; font-weight: 600; line-height: 1.3; cursor: ' + (it.cursor)">
                      <span [style]="'font-weight: 800; color: ' + (it.mc)">{{ it.mark }}</span>{{ it.text }} <span style="font-size: 11px; font-weight: 800; color: #6E5458">· ODS {{ it.ods }}</span>
                      @if (it.showWhy) {<span [style]="'display: block; margin-top: 4px; font-size: 12px; font-weight: 700; color: ' + (it.mc)">{{ it.why }}</span>}
                    </button>
                  }
                </div>
              }
            }
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap; min-height: 52px">
          @if (v().fbShow) {
            <app-feedback class="pop" [ok]="v().fbColor === '#2C5E31'" [titulo]="v().fbTitle" [texto]="v().fbText" />
          }
          <span style="flex: 1"></span>
          @if (v().canClear) {<button type="button" (click)="v().clearAll?.($event)" aria-label="Limpiar: devuelve las tarjetas sin comprobar" style="height: 44px; padding: 0 16px; border: 2px solid rgba(255,131,108,0.55); border-radius: 6px; background: transparent; color: #FFD3C9; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; cursor: pointer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD3C9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"></path></svg>Limpiar</button>}
          @if (v().canCheck) {<button type="button" class="gbtn" (click)="v().check?.($event)" [attr.aria-disabled]="(v().checkDis)" [style]="'min-height: 52px; padding: 0 24px; border: none; background: ' + (v().checkBg) + '; color: ' + (v().checkFg) + '; font-weight: 800; font-size: 16px; cursor: ' + (v().checkCursor)">Comprobar ({{ v().placedN }}/12)</button>}
          @if (v().doneA) {<button type="button" class="gbtn glow" (click)="v().toB?.($event)" style="min-height: 52px; padding: 0 24px; border: none; background: #FF836C; color: #1A0609; cursor: pointer"><span class="px" style="font-size: 11px">▶ TOMAR LA DECISIÓN</span></button>}
        </div>
      </div>
    }

    
    @if (v().pB) {
      <div style="display: flex; flex-direction: column; gap: 16px">
        <div class="g2" style="display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 22px; align-items: start">
          <aside class="shrink" aria-label="Tu diagnóstico" style="background: #2A0B12; border: 2px solid #FF836C; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 10px">
            <span class="px" style="font-size: 10px; color: #FF836C">TU DIAGNÓSTICO</span>
            <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
              @for (m of v().mini; track $index) {
                <div style="border-radius: 6px; border: 2px solid rgba(255,131,108,0.5); background: #2A0B12; padding: 8px; display: flex; flex-direction: column; gap: 4px">
                  <strong style="font-size: 13px; color: #FBF5EC">{{ m.name }}</strong>
                  @for (t of m.items; track $index) {<span style="font-size: 11px; line-height: 1.3; color: #C9B8A6">• {{ t }}</span>}
                </div>
              }
            </div>
          </aside>

          <section class="up" aria-label="Estrategias" style="display: flex; flex-direction: column; gap: 12px">
            <span class="px" style="font-size: 10px; color: #FF836C">TU DECISIÓN · ELIGE UNA SOLA ESTRATEGIA</span>
            <div role="radiogroup" aria-label="Estrategias" class="g2" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px">
              @for (s of v().strategies; track $index) {
                <div role="radio" tabindex="0" [attr.aria-checked]="(s.checked)" [attr.aria-disabled]="(s.dis)" [attr.aria-label]="(s.aria)" class="card" (click)="s.pick?.($event)" (keydown)="s.key?.($event)" [style]="'position: relative; min-height: 170px; box-sizing: border-box; padding: 16px; border-radius: 10px; border: 3px solid ' + (s.bd) + '; background: ' + (s.bg) + '; opacity: ' + (s.op) + '; cursor: ' + (s.cur) + '; transform: ' + (s.lift) + '; display: flex; flex-direction: column; gap: 12px'">
                  <div style="display: flex; align-items: center; gap: 10px">
                    <span class="px" [style]="'width: 36px; height: 36px; border-radius: 6px; background: ' + (s.tagBg) + '; color: #FFFFFF; font-size: 12px; display: flex; align-items: center; justify-content: center'">{{ s.id }}</span>
                    <span class="px" [style]="'font-size: 10px; color: ' + (s.stC)">{{ s.state }}</span>
                    <span aria-hidden="true" [style]="'margin-left: auto; width: 22px; height: 22px; box-sizing: border-box; border-radius: 999px; border: 3px solid ' + (s.radioBd) + '; background: ' + (s.radio)"></span>
                  </div>
                  <span style="font-size: 16px; font-weight: 700; line-height: 1.35; color: #231417">{{ s.t }}</span>
                  @if (s.showFb) {<span class="pop" [style]="'margin-top: auto; font-size: 13px; font-weight: 700; color: ' + (s.fbC)">{{ s.fb }}</span>}
                </div>
              }
            </div>
          </section>
        </div>

        @if (v().doneB) {
          <section class="up gpanel" aria-label="Consecuencia de tu decisión" style="background: #8A1428; padding: 18px; display: flex; flex-direction: column; gap: 14px">
            <span class="px" style="font-size: 10px; color: #FFD3C9">CONSECUENCIA EN TU EMPRESA</span>
            <div class="g2" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px">
              @if (v().okB) {
                <div style="background: #FFFFFF; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 10px"><span class="px" style="font-size: 10px; color: #AC0B32">QUÉ PASÓ</span><span style="font-size: 15px; font-weight: 700; line-height: 1.4">Un comprador alemán pide muestras: tu trazabilidad cumple el reglamento europeo.</span></div>
                <div style="background: #FFFFFF; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 8px"><span class="px" style="font-size: 10px; color: #AC0B32">TU EMPRESA</span><div style="display: flex; align-items: center; gap: 8px; font-size: 15px"><span style="width: 10px; height: 10px; border-radius: 2px; background: #231417"></span><strong style="flex: 1">Económico</strong><span style="font-weight: 800; color: #2C5E31">+4</span></div><div style="display: flex; align-items: center; gap: 8px; font-size: 15px"><span style="width: 10px; height: 10px; border-radius: 2px; background: #3F7E44"></span><strong style="flex: 1">Ambiental</strong><span style="font-weight: 800; color: #2C5E31">+2</span></div></div>
              }
              <div [style]="'grid-column: ' + (v().learnSpan) + '; background: #FFFFFF; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 10px'"><span class="px" style="font-size: 10px; color: #3F7E44">LO QUE APRENDISTE</span><span style="font-size: 15px; font-weight: 700; line-height: 1.4">La mejor estrategia usa lo que haces bien para aprovechar lo que pasa afuera.</span></div>
            </div>
          </section>
        }

        <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap; min-height: 52px">
          @if (v().fbBShow) {
            <app-feedback class="pop" [ok]="v().fbBC === '#2C5E31'" [titulo]="v().fbB" />
          }
          <span style="flex: 1"></span>
          @if (v().canConfirm) {<button type="button" class="gbtn" (click)="v().confirm?.($event)" [attr.aria-disabled]="(v().confDis)" [style]="'min-height: 52px; padding: 0 24px; border: none; background: ' + (v().confBg) + '; color: ' + (v().confFg) + '; font-weight: 800; font-size: 16px; cursor: ' + (v().confCur)">Confirmar decisión</button>}
          @if (v().doneB) {<button type="button" class="gbtn glow pop" (click)="v().siguiente()" style="display: inline-flex; align-items: center; min-height: 52px; padding: 0 24px; background: #FF836C; color: #1A0609; border: none; cursor: pointer"><span class="px" style="font-size: 11px">▶ RETO 1.4</span></button>}
        </div>
      </div>
    }
  </main>
</div>`,
  styles: `a:focus-visible,button:focus-visible,[role=button]:focus-visible{outline:3px solid #FF836C;outline-offset:3px}
button{font-family:inherit}
@keyframes pop{0%{opacity:0;transform:scale(.7)}70%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes zp{0%,100%{box-shadow:inset 0 0 0 0 rgba(255,131,108,0)}50%{box-shadow:inset 0 0 0 4px rgba(255,131,108,.45)}}
@keyframes shrink{from{opacity:0;transform:scale(1.25) translateX(30%)}to{opacity:1;transform:none}}
.pop{animation:pop .4s cubic-bezier(.2,.7,.2,1) both}
.up{animation:up .4s cubic-bezier(.2,.7,.2,1) both}
.shrink{animation:shrink .6s cubic-bezier(.2,.7,.2,1) both;transform-origin:left top}
.zpulse{animation:zp 1.2s ease-in-out infinite}
.card{transition:transform .15s,box-shadow .15s,border-color .15s}
.card:hover{box-shadow:0 8px 18px rgba(0,0,0,.35)}
.trayscroll{scrollbar-width:thin;scrollbar-color:#FF836C #2A0B12}
@media (prefers-reduced-motion: reduce){.pop,.up,.glow,.zpulse,.shrink{animation:none}.gbtn,.card{transition:none}}
    @media (max-width: 760px){ .g2{grid-template-columns:1fr !important} .g4{grid-template-columns:repeat(2,minmax(0,1fr)) !important} }
  `,
})
export class Reto13 extends DcReto {
  readonly ejercicioId = DATA.id;
  readonly titulo = DATA.title;
  private router = inject(Router);
  private dragI: number | null = null;

  constructor() {
    super();
    this.state = { part: 'A', place: {}, sel: null, locked: {}, review: {}, reveal: {}, att1: 1, doneA: false, fb: null,
      strat: null, tried: {}, attB: 1, doneB: false, okB: false, fbB: null };
    this.restaurar();
  }
  placeCard(i: number | null, k: string) {
    const { place, locked, doneA, review } = this.state;
    if (i == null || locked[i] || doneA) return;
    const r = { ...review }; delete r[i];
    this.setState({ place: { ...place, [i]: k }, sel: null, review: r });
  }
  unplace(i: number | null) {
    const { place, locked, doneA } = this.state;
    if (i == null || locked[i] || doneA || place[i] == null) return;
    const p = { ...place }; delete p[i];
    this.setState({ place: p, sel: null });
  }
  /* Dos intentos (indicación de la profesora) */
  checkA() {
    const { place, locked, att1 } = this.state;
    const nl: any = { ...locked }, wrong: number[] = [];
    T.forEach((t, i) => { if (locked[i]) return; if (place[i] === t[1]) nl[i] = true; else wrong.push(i); });
    if (!wrong.length) { this.setState({ locked: nl, doneA: true, sel: null, fb: { ok: true, t: '¡Matriz completa!', x: 'Ya tienes tu diagnóstico.' } }); this.speak('¡Matriz completa!'); return; }
    if (att1 === 1) {
      const p: any = { ...place }, rv: any = {}; wrong.forEach((i) => { rv[i] = hintFor(i, place[i]); delete p[i]; });
      this.setState({ locked: nl, place: p, review: rv, att1: 2, sel: null, fb: { ok: false, t: wrong.length + (wrong.length === 1 ? ' tarjeta volvió' : ' tarjetas volvieron') + ' con una pista.', x: 'Intento 2 de 2.' } });
    } else {
      const p: any = { ...place }, rv: any = {}; wrong.forEach((i) => { p[i] = T[i][1]; rv[i] = true; });
      this.setState({ locked: nl, place: p, reveal: rv, review: {}, doneA: true, sel: null, fb: { ok: false, t: 'Así queda tu matriz.', x: 'Las marcadas con → muestran dónde iba cada factor.' } });
    }
  }
  confirmB() {
    const { strat, tried, attB } = this.state;
    if (strat == null) return;
    const s = S[strat];
    if (s[2]) { this.setState({ doneB: true, okB: true, fbB: { ok: true, t: s[3] } }); this.speak('¡Exacto!'); this.cerrar(); return; }
    const tr = { ...tried, [strat]: true };
    if (attB === 1) this.setState({ tried: tr, attB: 2, strat: null, fbB: { ok: false, t: s[3] + ' Intento 2 de 2.' } });
    else { this.setState({ tried: tr, doneB: true, okB: false, strat: null, fbB: { ok: false, t: s[3] + ' La estrategia FO era la A.' } }); this.cerrar(); }
  }
  /** Al decidir la estrategia, el reto termina: los granos cuentan. */
  cerrar() {
    const S0 = this.state;
    const right = Object.keys(S0['locked']).length;
    const score = right * PT + (S0['okB'] ? PE : 0);
    const items = T.map((t, i) => ({ label: t[0], ok: !!S0['locked'][i], explanation: Q[t[1]][0] + ': ' + WHY[t[1]] }));
    const elegida = S0['okB'] ? S.findIndex((s) => s[2]) : Object.keys(S0['tried']).map(Number).at(-1);
    this.registrar(score, items, { place: S0['place'], strategy: elegida != null ? S[elegida][0] : null, estrategiaCorrecta: !!S0['okB'] },
      `${right}/12 tarjetas · estrategia ${S0['okB'] ? 'FO' : 'no FO'} · ${score} granos.`,
      { aLaPrimera: S0['att1'] === 1 && S0['attB'] === 1, segundoIntento: S0['att1'] === 2 || S0['attB'] === 2 });
  }
  siguiente() {
    this.router.navigateByUrl(this.after().link);
  }
  renderVals() {
    const St = this.state;
    const { part, place, sel, locked, review, reveal, doneA, fb, strat, tried, doneB, okB, fbB } = St;
    const pA = part === 'A', pB = part === 'B';
    const right = Object.keys(locked).length;
    const score = right * PT + (okB ? PE : 0);
    const placedN = Object.keys(place).length, ready = placedN === T.length;
    const allowDrop = (e: any) => { if (e && e.preventDefault) e.preventDefault(); };
    const zone = (k: string) => {
      const [name, desc, c, icon] = Q[k];
      const items = T.map((t, i) => ({ t, i })).filter((x) => place[x.i] === k);
      const drop = () => { if (sel != null) this.placeCard(sel, k); };
      const on = sel != null && !doneA;
      return {
        name, desc, c, icon, count: items.length ? String(items.length) : '',
        aria: 'Cuadrante ' + name + ', ' + items.length + ' tarjetas.' + (on ? ' Toca para ubicar aquí la tarjeta seleccionada.' : ''),
        cls: on ? 'zpulse' : '', line: 'solid', bg: on ? '#3A1019' : '#2A0B12',
        drop, key: keyAct(drop),
        dropEv: (e: any) => { allowDrop(e); const i = this.dragI != null ? this.dragI : sel; this.dragI = null; this.placeCard(i, k); },
        items: items.map(({ t, i }) => {
          const lk = !!locked[i], rvl = !!reveal[i], s = sel === i, free = !lk && !rvl && !doneA;
          return {
            text: t[0], ods: t[2], mark: lk ? '✓ ' : rvl ? '→ ' : '', mc: lk ? '#2C5E31' : '#8A1428',
            showWhy: doneA && (rvl || i === INCENT), why: i === INCENT ? INC_WHY : WHY[t[1]],
            bg: lk ? '#EAF4E6' : rvl ? '#FFF0EC' : s ? '#FFFFFF' : '#FFFFFF', bd: lk ? '#3F7E44' : rvl ? '#AC0B32' : s ? '#FF836C' : '#FFFFFF',
            cursor: free ? 'grab' : 'default', draggable: free ? 'true' : 'false',
            aria: t[0] + (lk ? ' (correcta)' : rvl ? ' (iba aquí)' : s ? ' (seleccionada)' : ''),
            drag: (e: any) => { if (!free) return; this.dragI = i; try { e.dataTransfer.setData('text/plain', String(i)); } catch { /* */ } },
            pick: (e: any) => { stop(e); if (free) this.setState({ sel: s ? null : i }); }
          };
        })
      };
    };
    return {
      score, maxScore: DATA.max, scoreAria: score + ' granos de 80', siguiente: () => this.siguiente(), pA, pB,
      steps: [pA ? '#FF836C' : '#FFD3C9', pB ? '#FF836C' : '#4A2A2F'], progText: pA ? 'PASO 1 DE 2' : 'PASO 2 DE 2',
      sitLabel: pA ? 'SITUACIÓN · INFORME DEL ENTORNO' : 'SITUACIÓN · LA JUNTA PIDE UNA ESTRATEGIA',
      sitText: pA ? CONSIGNA : DATA.consignaB,
      listen: () => this.speak(pA ? CONSIGNA : DATA.consignaB),
      allowDrop,
      trayLabel: ready ? 'TODAS LAS TARJETAS ESTÁN UBICADAS' : 'FACTORES · ARRASTRA O TOCA UNO',
      trayClick: () => { if (sel != null && place[sel] != null) this.unplace(sel); },
      dropTray: (e: any) => { allowDrop(e); const i = this.dragI != null ? this.dragI : sel; this.dragI = null; this.unplace(i); },
      tray: T.map((t, i) => ({ t, i })).filter((x) => place[x.i] == null).map(({ t, i }) => {
        const s = sel === i, rv = review[i] != null;
        return {
          text: t[0], ods: t[2], review: rv, hint: rv ? review[i] : '', pressed: s ? 'true' : 'false',
          aria: t[0] + ', ODS ' + t[2] + (s ? ' (seleccionada)' : '') + (rv ? ' (por revisar)' : ''),
          bg: s ? '#FFFFFF' : '#FFFFFF', bd: s || rv ? '#FF836C' : '#FFFFFF', line: rv && !s ? 'dashed' : 'solid',
          lift: s ? 'translateY(-6px)' : 'none', sh: s ? '0 10px 20px rgba(0,0,0,0.4)' : 'none',
          drag: (e: any) => { this.dragI = i; try { e.dataTransfer.setData('text/plain', String(i)); e.dataTransfer.effectAllowed = 'move'; } catch { /* */ } },
          pick: (e: any) => { stop(e); if (!doneA) this.setState({ sel: s ? null : i }); }
        };
      }),
      rows: [{ label: 'INTERNO', q: [zone('F'), zone('D')] }, { label: 'EXTERNO', q: [zone('O'), zone('A')] }],
      fbShow: !!fb, fbTitle: fb ? fb.t : '', fbText: fb ? fb.x : '', fbBg: fb && fb.ok ? '#EAF4E6' : '#FFF0EC', fbColor: fb && fb.ok ? '#2C5E31' : '#8A1428',
      placedN, canCheck: !doneA,
      checkDis: ready ? 'false' : 'true', checkBg: ready ? '#AC0B32' : '#4A2A2F', checkFg: ready ? '#FFFFFF' : '#C9B8A6', checkCursor: ready ? 'pointer' : 'not-allowed',
      check: () => { if (ready) this.checkA(); },
      canClear: !doneA && Object.keys(place).some((i) => !locked[i]),
      clearAll: () => { const p: any = {}; Object.keys(place).forEach((i) => { if (locked[i]) p[i] = place[i]; }); this.setState({ place: p, sel: null }); },
      doneA, toB: () => { this.setState({ part: 'B', sel: null }); this.guardarPaso(1); },
      mini: ['F', 'O', 'D', 'A'].map((k) => ({ name: Q[k][0], c: Q[k][2], items: T.filter((t) => t[1] === k).map((t) => t[0]) })),
      strategies: S.map(([id, t, ok], k) => {
        const on = strat === k, tr = !!tried[k], showOk = doneB && ok, closed = doneB || tr;
        const pick = () => { if (!closed) this.setState({ strat: on ? null : k }); };
        return {
          id, t, checked: on ? 'true' : 'false', dis: closed ? 'true' : 'false',
          aria: 'Opción ' + id + ': ' + t + (tr ? '. Descartada.' : showOk ? '. Estrategia FO.' : ''),
          bg: showOk ? '#EAF4E6' : tr ? '#FFF0EC' : on ? '#FFFFFF' : '#FFFFFF',
          bd: showOk ? '#3F7E44' : tr ? '#AC0B32' : on ? '#FF836C' : '#FFFFFF',
          op: tr && doneB ? '0.7' : '1', cur: closed ? 'default' : 'pointer', lift: on ? 'translateY(-6px)' : 'none',
          tagBg: showOk ? '#3F7E44' : tr ? '#AC0B32' : '#8A1428',
          state: showOk ? '✓ ESTRATEGIA FO' : tr ? '✖ NO ES FO' : on ? 'ELEGIDA' : '', stC: showOk ? '#2C5E31' : tr ? '#8A1428' : '#AC0B32',
          radio: on || showOk ? (showOk ? '#3F7E44' : '#FF836C') : '#FFFFFF', radioBd: showOk ? '#3F7E44' : on ? '#FF836C' : '#B5A9A6',
          showFb: tr || showOk, fb: S[k][3], fbC: showOk ? '#2C5E31' : '#8A1428',
          pick, key: keyAct(pick)
        };
      }),
      canConfirm: !doneB, confDis: strat == null ? 'true' : 'false',
      confBg: strat == null ? '#4A2A2F' : '#AC0B32', confFg: strat == null ? '#C9B8A6' : '#FFFFFF', confCur: strat == null ? 'not-allowed' : 'pointer',
      confirm: () => this.confirmB(),
      fbBShow: !!fbB, fbB: fbB ? fbB.t : '', fbBBg: fbB && fbB.ok ? '#EAF4E6' : '#FFF0EC', fbBC: fbB && fbB.ok ? '#2C5E31' : '#8A1428',
      doneB, okB, learnSpan: okB ? 'auto' : '1 / -1'
    };
  }
}
