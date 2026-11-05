import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Hud } from '../../shared/hud';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/1.2.json';
import { DcReto } from './dc-reto';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* Contenido de la actividad (retos/data/1.2.json): no modificar */
const K = DATA.opciones as unknown as [string, string, string][];
/* Semáforo de opciones (solo presentación): [fondo suave, borde suave, texto, fondo elegido, texto elegido] */
const TONE: Record<string, string[]> = { v: ['#EAF6E7', '#A9D8A4', '#2C5E31', '#4E9A4A', '#FFFFFF'], a: ['#FDECEC', '#F2B2B2', '#8A1F1F', '#D2504A', '#FFFFFF'], n: ['#FFF7DC', '#F0D88A', '#6B5200', '#F2C744', '#3A2A00'] };
const C = DATA.ideas as unknown as [string, string, number, string][];
const ODS = DATA.ods;
/* Nombres y colores oficiales de los ODS (solo presentación) */
const ODSN: Record<number, [string, string]> = { 5: ['Igualdad de género', '#FF3A21'], 7: ['Energía asequible y no contaminante', '#FCC30B'], 8: ['Trabajo decente y crecimiento económico', '#A21942'], 12: ['Producción y consumo responsables', '#BF8B2E'], 15: ['Vida de ecosistemas terrestres', '#56C02B'] };
const FB = DATA.retro as Record<string, string>;
const PA = DATA.puntos.parteA, PB = DATA.puntos.parteB, PC = DATA.puntos.parteC;
const keyAct = (fn: () => void) => (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };
const PROMPT = DATA.consignas as Record<string, string>;

/** Reto 1.2 · Valores que dejan huella (Reto12.dc.html, rediseño): 3 partes, semáforo, frase bandera. */
@Component({
  selector: 'app-reto-12',
  imports: [Hud, Personaje],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 1 · RETO 1.2'" [title]="titulo" [granos]="(v().score + ' / ' + v().maxScore)" [salida]="salida()">
    <div centro [attr.aria-label]="(v().progText)" style="display: flex; align-items: center; gap: 8px">@for (p of v().steps; track $index) {<span [style]="'width: 100px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}<span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().progText }}</span></div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1180px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
    
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
      <app-personaje who="chispa" [size]="88" />
      <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px"><span class="px" style="font-size: 10px; color: #AC0B32">{{ v().sitLabel }}</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().prompt }}</span></div>
      <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; cursor: pointer; display: flex; align-items: center; justify-content: center; border-style: none; background-color: #ffd3c9"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FBF5EC" stroke-width="2" aria-hidden="true" style="stroke: #231417"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg></button>
    </div>

    
    @if (v().pA) {
      <div style="display: flex; flex-direction: column; gap: 16px">
        <div role="list" aria-label="Ideas de marca" class="g4" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px">
          @for (c of v().cards; track $index) {
            <div role="listitem" [attr.aria-label]="(c.aria)" class="card" [style]="'position: relative; overflow: hidden; background: #FFFFFF; border-radius: 10px; border: 3px solid ' + (c.bd) + '; display: flex; flex-direction: column'">
              <div style="padding: 12px 12px 0; display: flex; flex-direction: column; gap: 10px; flex: 1">
                <div style="display: flex; align-items: center; gap: 10px">
                  <span [style]="'width: 42px; height: 42px; flex-shrink: 0; border-radius: 8px; background: ' + (c.ibg) + '; display: flex; align-items: center; justify-content: center'"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A0609" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="(c.icon)"></path></svg></span>
                  <span class="px" style="font-size: 10px; color: #6E5458">IDEA {{ c.n }}</span>
                  @if (c.showBadge) {<span class="pop" aria-hidden="true" [style]="'margin-left: auto; width: 28px; height: 28px; border-radius: 999px; background: ' + (c.badgeBg) + '; color: #FFFFFF; font-size: 15px; font-weight: 800; display: flex; align-items: center; justify-content: center'">{{ c.badge }}</span>}
                </div>
                <span style="font-size: 15px; font-weight: 700; line-height: 1.3; min-height: 60px">{{ c.text }}</span>
                <div role="group" [attr.aria-label]="(c.grp)" style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px">
                  @for (o of c.opts; track $index) {
                    <button type="button" class="opt" (click)="o.pick?.($event)" [attr.aria-pressed]="(o.on)" [attr.aria-disabled]="(o.dis)" [style]="'min-height: 40px; padding: 0 12px; border-radius: 6px; border: 2px solid ' + (o.bd) + '; background: ' + (o.bg) + '; color: ' + (o.fg) + '; opacity: ' + (o.op) + '; font-size: 14px; font-weight: 700; text-align: left; display: flex; align-items: center; gap: 8px; cursor: ' + (o.cur)"><span style="width: 18px; text-align: center">{{ o.sym }}</span>{{ o.label }}</button>
                  }
                </div>
              </div>
              @if (c.showFb) {<div class="up" [style]="'padding: 10px 12px; background: ' + (c.fbBg) + '; border-top: 2px solid ' + (c.bd) + '; font-size: 13px; font-weight: 700; line-height: 1.3; color: ' + (c.fbc)">{{ c.fb }}</div>}
            </div>
          }
        </div>

        
        @if (v().gw) {
          <div class="pop gpanel" role="status" style="display: flex; align-items: center; gap: 12px; background: #EAF4E6; padding: 10px 16px">
            <span class="px" style="padding: 4px 8px; border-radius: 999px; background: #3F7E44; color: #FFFFFF; font-size: 10px">★ GREENWASHING DETECTADO</span>
            <span style="font-size: 16px; font-weight: 800; color: #2C5E31">Una frase bonita sin datos no es sostenibilidad. Lo detectaste.</span>
          </div>
        }

        
        @if (v().aChecked) {
          <section class="up gpanel" aria-label="Consecuencia de tu decisión" style="background: #8A1428; padding: 18px; display: flex; flex-direction: column; gap: 14px">
            <span class="px" style="font-size: 10px; color: #FFD3C9">CONSECUENCIA EN TU EMPRESA</span>
            <div class="g2" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px">
              <div style="background: #FFFFFF; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 10px"><span class="px" style="font-size: 10px; color: #AC0B32">QUÉ PASÓ</span><span style="font-size: 15px; font-weight: 700; line-height: 1.4">{{ v().csq.what }}</span></div>
              <div style="background: #FFFFFF; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 8px"><span class="px" style="font-size: 10px; color: #AC0B32">TU EMPRESA</span>
                @for (d of v().csq.ind; track $index) {<div style="display: flex; align-items: center; gap: 8px; font-size: 14px"><span [style]="'width: 10px; height: 10px; border-radius: 2px; background: ' + (d.c)"></span><strong style="flex: 1">{{ d.label }}</strong><span [style]="'font-weight: 800; color: ' + (d.tc)">{{ d.v }}</span></div><span style="font-size: 13px; color: #5C4A4D; margin: -4px 0 2px 18px">{{ d.why }}</span>}
              </div>
              <div style="background: #FFFFFF; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 10px"><span class="px" style="font-size: 10px; color: #3F7E44">LO QUE APRENDISTE</span><span style="font-size: 15px; font-weight: 700; line-height: 1.4">Un valor de marca solo cuenta si cambia algo que se puede medir.</span></div>
            </div>
          </section>
        }

        <div style="display: flex; justify-content: flex-end; align-items: center; gap: 14px; min-height: 52px">
          @if (v().aMsgShow) {
            <div class="pop gpanel" aria-live="polite" [style]="'flex: 1 1 420px; height: 52px; box-sizing: border-box; display: flex; align-items: center; gap: 10px; background: ' + (v().aMsgBg) + '; padding: 0 14px 0 6px; overflow: hidden'">
              <app-personaje who="chispa" [size]="42" />
              <strong [style]="'font-size: 15px; color: ' + (v().aMsgC)">{{ v().aMsg }}</strong>
            </div>
          }
          <span style="flex: 1"></span>
          @if (v().aOpen) {<button type="button" class="gbtn" (click)="v().checkA?.($event)" style="min-height: 52px; padding: 0 24px; border: none; background: #AC0B32; color: #FFFFFF; font-weight: 800; font-size: 16px; cursor: pointer">Revisar ({{ v().placed }}/8)</button>}
          @if (v().aChecked) {<button type="button" class="gbtn glow" (click)="v().toB?.($event)" style="min-height: 52px; padding: 0 24px; border: none; background: #FF836C; color: #1A0609; cursor: pointer"><span class="px" style="font-size: 11px">▶ PARTE B</span></button>}
        </div>
      </div>
    }

    
    @if (v().pB) {
      <div class="up" style="display: flex; flex-direction: column; gap: 0">
        <span class="px" style="font-size: 10px; color: #FF836C; margin-bottom: 10px">TUS 5 VALORES REALES · TOCA UNO</span>
        <div role="group" aria-label="Valores" class="g5" style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px">
          @for (v of v().vcards; track $index) {
            <div role="button" tabindex="0" [attr.aria-pressed]="(v.pressed)" [attr.aria-label]="(v.aria)" class="card" (click)="v.pick?.($event)" (keydown)="v.key?.($event)" [style]="'position: relative; height: 150px; box-sizing: border-box; padding: 12px; border-radius: 10px; border: 3px solid ' + (v.bd) + '; background: ' + (v.bg) + '; color: #231417; cursor: ' + (v.cur) + '; transform: ' + (v.lift) + '; display: flex; flex-direction: column; gap: 8px'">
              <span [style]="'width: 38px; height: 38px; border-radius: 8px; background: ' + (v.ibg) + '; display: flex; align-items: center; justify-content: center'"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A0609" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="(v.icon)"></path></svg></span>
              <span style="font-size: 14px; font-weight: 700; line-height: 1.3">{{ v.text }}</span>
              <span aria-hidden="true" [style]="'position: absolute; left: 50%; bottom: -12px; margin-left: -10px; width: 20px; height: 20px; border-radius: 999px; background: ' + (v.dot) + '; border: 3px solid #1A0609'"></span>
            </div>
          }
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style="display: block; width: 100%; height: 120px">
          @for (l of v().lines; track $index) {<path [attr.d]="(l.d)" fill="none" [attr.stroke]="(l.c)" stroke-width="4" [attr.stroke-dasharray]="(l.dash)" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>}
        </svg>
        <div role="group" aria-label="Objetivos de Desarrollo Sostenible" class="g5" style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px">
          @for (o of v().odsTiles; track $index) {
            <div role="button" tabindex="0" [attr.aria-label]="(o.aria)" [class]="'card ' + (o.cls)" (click)="o.pick?.($event)" (keydown)="o.key?.($event)" [style]="'position: relative; overflow: hidden; height: 120px; box-sizing: border-box; border-radius: 10px; border: 3px ' + (o.line) + ' #FF836C; background: #FFFFFF; cursor: pointer; display: flex; flex-direction: column'">
              <span aria-hidden="true" [style]="'position: absolute; left: 50%; top: -1px; margin-left: -10px; width: 20px; height: 20px; border-radius: 999px; background: ' + (o.dot) + '; border: 3px solid #1A0609; z-index: 1'"></span>
              <div [style]="'height: 10px; background: ' + (o.c)"></div>
              <div style="flex: 1; padding: 8px 12px; display: flex; flex-direction: column; justify-content: center; gap: 4px">
                <div style="display: flex; align-items: baseline; gap: 8px"><span class="px" style="font-size: 10px; color: #6E5458">ODS</span><span style="font-size: 30px; font-weight: 800; line-height: 1; color: #231417">{{ o.n }}</span><span class="px" style="margin-left: auto; font-size: 10px; color: #AC0B32">{{ o.count }}</span></div>
                <span style="font-size: 13px; font-weight: 600; line-height: 1.25; color: #5C4A4D">{{ o.name }}</span>
              </div>
            </div>
          }
        </div>
        <div style="display: flex; justify-content: flex-end; align-items: center; gap: 14px; margin-top: 22px; min-height: 52px">
          @if (v().bMsgShow) {
            <div class="pop gpanel" aria-live="polite" [style]="'flex: 1 1 420px; height: 52px; box-sizing: border-box; display: flex; align-items: center; gap: 10px; background: ' + (v().bFbBg) + '; padding: 0 14px 0 6px; overflow: hidden'">
              <app-personaje who="chispa" [size]="42" />
              <strong [style]="'font-size: 15px; color: ' + (v().bFbC)">{{ v().bFb }}</strong>
            </div>
          }
          <span style="flex: 1"></span>
          @if (v().bOpen) {<button type="button" class="gbtn" (click)="v().checkB?.($event)" style="min-height: 52px; padding: 0 24px; border: none; background: #AC0B32; color: #FFFFFF; font-weight: 800; font-size: 16px; cursor: pointer">Revisar ({{ v().linked }}/5)</button>}
          @if (v().bChecked) {<button type="button" class="gbtn glow" (click)="v().toC?.($event)" style="min-height: 52px; padding: 0 24px; border: none; background: #FF836C; color: #1A0609; cursor: pointer"><span class="px" style="font-size: 11px">▶ PARTE C</span></button>}
        </div>
      </div>
    }

    
    @if (v().pC) {
      <div class="up" style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; align-items: stretch">
        <label class="gpanel" style="background: #FFFFFF; padding: 24px; display: flex; flex-direction: column; gap: 14px">
          <span class="px" style="font-size: 10px; color: #AC0B32">TU FRASE BANDERA</span>
          <span style="font-size: 15px; color: #5C4A4D">Elige el valor que mejor representa a la marca.</span>
          <input type="text" maxlength="40" placeholder="Escribe tu frase…" [value]="(v().flag)" (input)="v().setFlag?.($event)" style="min-height: 64px; border-radius: 8px; border: 3px solid #231417; border-bottom-width: 6px; padding: 0 16px; font-size: 22px; font-weight: 800; background: #FFFFFF; color: #231417">
          <span class="px" style="align-self: flex-end; font-size: 10px; color: #6E5458">{{ v().flagLen }}/40</span>
          <span style="flex: 1"></span>
          <button type="button" class="gbtn glow" (click)="v().terminar()" style="align-self: flex-end; display: inline-flex; align-items: center; min-height: 52px; padding: 0 24px; background: #AC0B32; color: #FFFFFF; border: none; cursor: pointer"><span class="px" style="font-size: 11px">▶ TERMINAR</span></button>
        </label>
        <figure aria-label="Vista previa del empaque" style="margin: 0; display: flex; flex-direction: column; gap: 10px">
          <span class="px" style="font-size: 10px; color: #FF836C">ASÍ SE VERÁ EN TU EMPAQUE</span>
          <div style="flex: 1; min-height: 300px; border-radius: 12px; border: 3px solid #FF836C; box-shadow: 6px 6px 0 #8A1428; background-color: #6B3B2A; background-image: linear-gradient(90deg, rgba(0,0,0,0.12) 1px, transparent 1px), linear-gradient(rgba(0,0,0,0.12) 1px, transparent 1px); background-size: 48px 48px; display: flex; align-items: center; justify-content: center; padding: 28px; box-sizing: border-box">
            <div style="width: 100%; background: #FFFFFF; border-radius: 6px; padding: 22px 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; box-shadow: 0 8px 0 rgba(0,0,0,0.25)">
              <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="7" ry="10" fill="#9A5B2E" transform="rotate(-20 12 12)"></ellipse><path d="M13 3c-2 6-2 12-3 18" stroke="#FF836C" stroke-width="1.5" fill="none"></path></svg>
              <span class="px" style="font-size: 12px; color: #8A1428">CACAO RAÍZ</span>
              <span [style]="'font-size: 24px; font-weight: 800; font-style: italic; line-height: 1.25; color: ' + (v().previewC)">«{{ v().preview }}»</span>
              <span style="font-size: 12px; font-weight: 700; letter-spacing: .18em; color: #9A5B2E">DEL PACÍFICO</span>
            </div>
          </div>
        </figure>
      </div>
    }
  </main>
</div>`,
  styles: `a:focus-visible,button:focus-visible,input:focus-visible,[role=button]:focus-visible{outline:3px solid #FF836C;outline-offset:3px}
button,input{font-family:inherit}
@keyframes pop{0%{opacity:0;transform:scale(.7)}70%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes zp{0%,100%{box-shadow:0 0 0 0 rgba(255,131,108,0)}50%{box-shadow:0 0 0 5px rgba(255,131,108,.45)}}
@keyframes shine{0%,100%{transform:rotate(-6deg) scale(1)}50%{transform:rotate(6deg) scale(1.08)}}
.pop{animation:pop .4s cubic-bezier(.2,.7,.2,1) both}
.up{animation:up .4s cubic-bezier(.2,.7,.2,1) both}
.zpulse{animation:zp 1.2s ease-in-out infinite}
.shine{display:inline-block;animation:shine 1.4s ease-in-out infinite}
.card{transition:transform .15s,border-color .15s}
.opt{transition:background .12s,transform .12s}
.opt:hover{transform:translateX(2px)}
@media (prefers-reduced-motion: reduce){.pop,.up,.glow,.zpulse,.shine{animation:none}.gbtn,.card,.opt{transition:none}}
    @media (max-width: 760px){ .g2{grid-template-columns:1fr !important} .g4{grid-template-columns:repeat(2,minmax(0,1fr)) !important} .g5{grid-template-columns:repeat(3,minmax(0,1fr)) !important} }
  `,
})
export class Reto12 extends DcReto {
  readonly ejercicioId = DATA.id;
  readonly titulo = DATA.title;
  private router = inject(Router);

  constructor() {
    super();
    this.state = { part: 'A', pick: {}, aDone: false, attA: 1, lockA: {}, revA: {}, ods: {}, bDone: false, attB: 1, lockB: {}, revB: {}, flag: '', selV: null };
    this.restaurar();
  }
  /* Dos intentos (indicación de la profesora): en el 1.º las incorrectas se liberan para corregir; en el 2.º se cierra y se muestra la retroalimentación completa */
  checkA() {
    const { pick, lockA, attA } = this.state;
    const nl = { ...lockA }, wrong: number[] = [];
    C.forEach((c, i) => { if (lockA[i]) return; if (pick[i] === c[1]) nl[i] = true; else wrong.push(i); });
    if (!wrong.length || attA === 2) { this.setState({ lockA: nl, revA: {}, aDone: true }); return; }
    const p = { ...pick }, rv: any = {}; wrong.forEach((i) => { delete p[i]; rv[i] = true; });
    this.setState({ lockA: nl, pick: p, revA: rv, attA: 2 });
  }
  checkB() {
    const { ods, lockB, attB } = this.state;
    const nl = { ...lockB }, wrong: number[] = [];
    C.forEach((c, i) => { if (c[1] !== 'v' || lockB[i]) return; if (ods[i] === c[2]) nl[i] = true; else wrong.push(i); });
    if (!wrong.length || attB === 2) { this.setState({ lockB: nl, revB: {}, bDone: true, selV: null }); return; }
    const o = { ...ods }, rv: any = {}; wrong.forEach((i) => { delete o[i]; rv[i] = true; });
    this.setState({ lockB: nl, ods: o, revB: rv, attB: 2, selV: null });
  }
  /** TERMINAR: los granos cuentan y se guarda la frase bandera (va a la pancarta del mapa). */
  terminar() {
    const S = this.state;
    const flag = String(S['flag'] ?? '').trim().slice(0, DATA.fraseMax);
    if (!this.yaRegistrado()) {
      const aRight = C.filter((c, i) => S['pick'][i] === c[1]).length;
      const vals = C.map((c, i) => ({ c, i })).filter((x) => x.c[1] === 'v');
      const bRight = vals.filter((x) => S['ods'][x.i] === x.c[2]).length;
      const score = aRight * PA + bRight * PB + (flag.length > 3 ? PC : 0);
      const items = C.map((c, i) => ({ label: c[0], ok: S['pick'][i] === c[1], explanation: FB[c[1]] }));
      this.registrar(score, items, { picks: { A: S['pick'] }, ods: S['ods'], text: { C: flag } }, `${aRight}/8 ideas · ${bRight}/5 ODS · frase bandera.`,
        { greenwashing: S['pick'][3] === 'a', aLaPrimera: S['attA'] === 1 && S['attB'] === 1, segundoIntento: S['attA'] === 2 || S['attB'] === 2 });
    }
    this.router.navigateByUrl(this.after().link);
  }
  renderVals() {
    const { part, pick, aDone, attA, lockA, revA, ods, bDone, attB, lockB, revB, flag, selV } = this.state;
    const aScore = aDone ? C.filter((c, i) => pick[i] === c[1]).length * PA : 0;
    const vals = C.map((c, i) => ({ c, i })).filter((x) => x.c[1] === 'v');
    const bRight = vals.filter((x) => ods[x.i] === x.c[2]).length;
    const bScore = bDone ? bRight * PB : 0;
    const cScore = flag.trim().length > 3 ? PC : 0;
    const score = aScore + bScore + (part === 'C' ? cScore : 0);
    const pn = ({ A: 0, B: 1, C: 2 } as Record<string, number>)[part];
    const nRevA = Object.keys(revA).length, nRevB = Object.keys(revB).length;
    return {
      steps: ['A', 'B', 'C'].map((k, n) => (n === pn ? '#FF836C' : n < pn ? '#8A1428' : '#4A2A2F')),
      progText: 'PASO ' + (pn + 1) + ' DE 3',
      listen: () => this.speak(PROMPT[part]),
      score, maxScore: DATA.max, scoreAria: score + ' granos de 50',
      pA: part === 'A', pB: part === 'B', pC: part === 'C',
      sitLabel: part === 'A' ? 'SITUACIÓN · REUNIÓN DE MERCADEO' : part === 'B' ? 'SITUACIÓN · INFORME A LA JUNTA' : 'SITUACIÓN · LANZAMIENTO',
      prompt: PROMPT[part],
      csq: (() => {
        const okE = [2, 4, 6].filter((i) => pick[i] === 'v').length, okS = [0, 7].filter((i) => pick[i] === 'v').length, fake = [1, 3].filter((i) => pick[i] === 'v').length;
        const good = C.filter((c, i) => pick[i] === c[1]).length;
        return {
          what: good >= 6 ? 'Aprobaste ' + (okE + okS) + ' ideas con impacto real. La junta las acepta.' : 'Parte de lo aprobado no cambia nada. La junta pide revisarlo.',
          ind: [
            { label: 'Ambiental', c: '#3F7E44', v: '+' + okE * 2, tc: '#2C5E31', why: 'Empaques, energía y bosque.' },
            { label: 'Social', c: '#FF836C', v: '+' + okS * 2, tc: '#2C5E31', why: 'Familias y equidad en el equipo.' },
            { label: 'Gobernanza', c: '#8A1428', v: fake ? '−' + fake * 3 : '0', tc: fake ? '#AC0B32' : '#5C4A4D', why: fake ? 'Prometer sin datos es greenwashing.' : 'Sin promesas vacías.' },
          ],
        };
      })(),
      placed: Object.keys(pick).length,
      cards: C.map(([text, ok, , icon], i) => {
        const mine = pick[i], good = mine === ok, has = mine != null, lk = !!lockA[i], rv = !!revA[i] && !aDone;
        const shown = aDone || lk;
        return {
          n: i + 1, grp: 'Clasificar idea ' + (i + 1), text, icon,
          aria: 'Idea ' + (i + 1) + ': ' + text + (shown ? (good ? '. Correcta.' : '. Incorrecta.') : rv ? '. Por revisar.' : has ? '. Clasificada.' : '. Sin clasificar.'),
          ibg: '#FF836C',
          bd: shown ? (good ? '#3F7E44' : '#AC0B32') : has ? '#FF836C' : rv ? '#FF836C' : '#FFFFFF',
          showBadge: shown, badge: good ? '✓' : '✖', badgeBg: good ? '#3F7E44' : '#AC0B32',
          showFb: shown || rv,
          fb: shown ? (good ? '✓ ' : '→ ') + FB[ok] : '↺ Revisa esta idea: segundo intento.',
          fbc: shown && good ? '#2C5E31' : '#8A1428', fbBg: shown && good ? '#EAF4E6' : '#FFF0EC',
          opts: K.map(([k, sym, label]) => {
            const on = mine === k, closed = aDone || lk;
            return {
              sym, label, on: on ? 'true' : 'false', dis: closed ? 'true' : 'false',
              bg: on ? TONE[k][3] : TONE[k][0], fg: on ? TONE[k][4] : TONE[k][2], bd: on ? TONE[k][3] : TONE[k][1],
              op: closed && !on ? '0.5' : '1', cur: closed ? 'default' : 'pointer',
              pick: () => !closed && this.setState({ pick: { ...pick, [i]: k } }),
            };
          }),
        };
      }),
      aOpen: !aDone, aChecked: aDone, gw: aDone && pick[3] === 'a',
      aMsgShow: attA === 2 || aDone,
      aMsg: aDone ? C.filter((c, i) => pick[i] === c[1]).length + ' de 8 ideas bien clasificadas.' : nRevA + (nRevA === 1 ? ' idea por revisar.' : ' ideas por revisar.') + ' Intento 2 de 2.',
      aMsgBg: aDone && aScore === 32 ? '#EAF4E6' : '#FFF0EC', aMsgC: aDone && aScore === 32 ? '#2C5E31' : '#8A1428',
      checkA: () => this.checkA(),
      toB: () => { this.setState({ part: 'B' }); this.guardarPaso(1); },
      linked: Object.keys(ods).length,
      vcards: vals.map(({ c, i }) => {
        const s = selV === i, has = ods[i] != null, ok = ods[i] === c[2], lk = !!lockB[i], rv = !!revB[i] && !has;
        const shown = bDone || lk, closed = bDone || lk;
        const pick2 = () => { if (!closed) this.setState({ selV: s ? null : i }); };
        return {
          text: c[0], icon: c[3], pressed: s ? 'true' : 'false',
          aria: c[0] + (has ? ', unido al ODS ' + ods[i] : ', sin ODS') + (shown ? (ok ? '. Correcto.' : '. Incorrecto.') : rv ? '. Por revisar.' : '') + (s ? ' (seleccionado)' : ''),
          bg: '#FFFFFF',
          bd: shown ? (ok ? '#3F7E44' : '#AC0B32') : s ? '#FF836C' : rv ? '#FF836C' : has ? '#FFD3C9' : '#FFFFFF',
          ibg: '#FF836C',
          lift: s ? 'translateY(-6px)' : 'none', cur: closed ? 'default' : 'pointer',
          dot: shown ? (ok ? '#56C02B' : '#AC0B32') : has || s ? '#FF836C' : '#6E5458',
          pick: pick2, key: keyAct(pick2),
        };
      }),
      odsTiles: ODS.map((n) => {
        const cnt = vals.filter((x) => ods[x.i] === n).length;
        const pick3 = () => { if (bDone || selV == null) return; const rv = { ...revB }; delete rv[selV]; this.setState({ ods: { ...ods, [selV]: n }, revB: rv, selV: null }); };
        return {
          n, name: ODSN[n][0], c: ODSN[n][1], count: cnt ? '×' + cnt : '',
          aria: 'ODS ' + n + ', ' + ODSN[n][0] + (selV != null ? '. Toca para unir el valor seleccionado.' : ''),
          cls: selV != null && !bDone ? 'zpulse' : '', line: selV != null && !bDone ? 'solid' : 'dashed',
          dot: cnt ? '#FF836C' : '#6E5458', pick: pick3, key: keyAct(pick3),
        };
      }),
      lines: vals.map(({ c, i }, r) => ({ c, i, r })).filter((x) => ods[x.i] != null).map(({ c, i, r }) => {
        const x1 = 10 + r * 20, x2 = 10 + ODS.indexOf(ods[i]) * 20, ok = ods[i] === c[2], shown = bDone || !!lockB[i];
        return { d: 'M' + x1 + ' 0 C' + x1 + ' 55 ' + x2 + ' 45 ' + x2 + ' 100', c: shown ? (ok ? '#56C02B' : '#AC0B32') : '#FF836C', dash: shown && !ok ? '6 6' : 'none' };
      }),
      bOpen: !bDone, bChecked: bDone,
      bMsgShow: attB === 2 || bDone,
      bFb: bDone ? bRight + ' de 5 valores unidos con su ODS principal.' : nRevB + (nRevB === 1 ? ' relación no es la principal.' : ' relaciones no son las principales.') + ' Intento 2 de 2.',
      bFbBg: bDone && bRight === 5 ? '#EAF4E6' : '#FFF0EC', bFbC: bDone && bRight === 5 ? '#2C5E31' : '#8A1428',
      checkB: () => this.checkB(),
      toC: () => { this.setState({ part: 'C' }); this.guardarPaso(2); },
      flag, flagLen: flag.length, setFlag: (e: Event) => this.setState({ flag: (e.target as HTMLInputElement).value.slice(0, DATA.fraseMax) }),
      preview: flag.trim() || 'Tu frase aparecerá aquí', previewC: flag.trim() ? '#231417' : '#6E5458',
      terminar: () => this.terminar(),
    };
  }
}
