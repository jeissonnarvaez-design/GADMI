import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Hud } from '../../shared/hud';
import { Feedback } from '../../shared/feedback';
import { Personaje } from '../../shared/personaje';
import DATA from '../data/1.1.json';
import { DcReto } from './dc-reto';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* Contenido oficial de la profesora (retos/data/1.1.json): no modificar */
const Z = DATA.zonas as unknown as [string, string, string, string][];
const B = DATA.notas as unknown as [string, string, string][];
const HINT = DATA.pistas as unknown as Record<string, string>;
const OBJ = DATA.objetivos as unknown as [number, string, string][];
const DIMS = DATA.dimensiones as unknown as Record<string, [string, string]>;
const DIM_ORDER = DATA.ordenDimensiones as unknown as string[];
const P1 = DATA.puntos.fase1, P2 = DATA.puntos.fase2;
const keyAct = (fn: () => void) => (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };
const stop = (e: Event) => { if (e && e.stopPropagation) e.stopPropagation(); };

/** Misión 1.1 · La brújula (Ejercicio11.dc.html, rediseño): 2 fases, 2 intentos por fase. */
@Component({
  selector: 'app-reto-11',
  imports: [RouterLink, Hud, Personaje, Feedback],
  template: `<div class="game-bg" style="min-height: 100vh">
  <app-hud [kicker]="'MÓDULO 1 · RETO 1.1'" [title]="titulo" [granos]="(v().score + ' / ' + v().maxScore)" [salida]="salida()">
    <div centro [attr.aria-label]="(v().progText)" style="display: flex; align-items: center; gap: 8px; color: rgb(35, 20, 23)">
          @for (p of v().phases; track $index) {<span [style]="'width: 120px; height: 8px; border-radius: 999px; background: ' + (p)"></span>}
          <span class="px" style="margin-left: 8px; font-size: 10px; color: #FFD3C9">{{ v().progText }}</span>
        </div>
  </app-hud>
  <main style="flex: 1; width: 100%; max-width: 1180px; margin: 0 auto; padding: 14px 32px 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">

    @if (v().playing) {
      <div style="display: flex; flex-direction: column; gap: 16px">
        
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px">
          <app-personaje who="teo" [size]="88" />
          <div class="gpanel" style="flex: 1; background: #FFE6DD; padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; border-style: none"><span class="px" style="font-size: 10px; color: #AC0B32">{{ v().sitLabel }}</span><span style="font-size: 18px; font-weight: 700; line-height: 1.35">{{ v().sitText }}</span></div>
          <button type="button" (click)="v().listen?.($event)" aria-label="Escuchar instrucción" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; cursor: pointer; display: flex; align-items: center; justify-content: center; background-color: #ffd3c9; border-style: none"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FBF5EC" stroke-width="2" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" stroke="#231417"></path></svg></button>
        </div>

        
        

        
        @if (v().p1) {
          <div style="display: flex; flex-direction: column; gap: 14px">
            <section aria-label="Notas por ubicar" (click)="v().trayClick?.($event)" (dragover)="v().allowDrop?.($event)" (drop)="v().dropTray?.($event)" style="min-height: 112px; padding: 12px; border-radius: 8px; border: 5px solid #FF836C; display: flex; flex-wrap: wrap; gap: 10px; align-content: flex-start">
              <span class="px" style="width: 100%; font-size: 10px; color: #FF836C">{{ v().trayLabel }}</span>
              @for (c of v().tray; track $index) {
                <button type="button" class="card tcard" draggable="true" (dragstart)="c.drag?.($event)" (click)="c.pick?.($event)" [attr.aria-pressed]="(c.pressed)" [attr.aria-label]="(c.aria)" [style]="'width: calc(33.333% - 7px); box-sizing: border-box; text-align: center; justify-content: center; align-items: center; padding: 10px 12px; border-radius: 8px; border: 3px ' + (c.line) + ' ' + (c.bd) + '; background: ' + (c.bg) + '; color: #231417; cursor: grab; transform: ' + (c.lift) + '; box-shadow: ' + (c.sh) + '; display: flex; flex-direction: column; gap: 6px'">
                  <span style="font-size: 15px; font-weight: 700; line-height: 1.3; text-align: center">{{ c.text }}</span>
                  @if (c.review) {<span style="font-size: 13px; font-weight: 700; color: #8A1428">↺ Pista: {{ c.hint }}</span>}
                </button>
              }
            </section>

            <div role="group" aria-label="Zonas de la brújula" class="zgrid" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px">
              @for (z of v().zones; track $index) {
                <div role="button" tabindex="0" [attr.aria-label]="(z.aria)" [class]="'zone ' + (z.cls)" (click)="z.drop?.($event)" (keydown)="z.key?.($event)" (dragover)="v().allowDrop?.($event)" (drop)="z.dropEv?.($event)" [style]="'min-height: 230px; box-sizing: border-box; border-radius: 8px; background: ' + (z.bg) + '; color: #FBF5EC; padding: 12px; display: flex; flex-direction: column; gap: 8px; cursor: pointer; border-style: solid; border-width: 5px; border-color: #ff836c'">
                  <div style="display: flex; align-items: center; gap: 10px">
                    <span style="width: 36px; height: 36px; flex-shrink: 0; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fbf5ec; background-color: #ff836c"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A0609" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="stroke: #141413"><path [attr.d]="(z.icon)"></path></svg></span>
                    <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0"><strong style="font-size: 17px">{{ z.label }}</strong><span style="font-size: 12px; color: #C9B8A6">{{ z.sub }}</span></div>
                    <span class="px" style="margin-left: auto; font-size: 10px; color: #FFD3C9">{{ z.count }}</span>
                  </div>
                  @for (it of z.items; track $index) {
                    <button type="button" (click)="it.pick?.($event)" [attr.draggable]="(it.draggable)" (dragstart)="it.drag?.($event)" [attr.aria-label]="(it.aria)" [style]="'text-align: left; padding: 8px 10px; border-radius: 6px; border: 2px solid ' + (it.bd) + '; background: ' + (it.bg) + '; color: #231417; font-size: 13px; font-weight: 600; line-height: 1.3; cursor: ' + (it.cursor)">
                      <span [style]="'font-weight: 800; color: ' + (it.mc)">{{ it.mark }}</span>{{ it.text }}
                      @if (it.showWhy) {<span [style]="'display: block; margin-top: 4px; font-size: 12px; font-weight: 700; color: ' + (it.mc)">{{ it.why }}</span>}
                    </button>
                  }
                </div>
              }
            </div>
          </div>
        }

        
        @if (v().p2) {
          <div class="up p2grid" style="display: grid; grid-template-columns: minmax(0, 1fr) 150px minmax(0, 1fr); align-items: start">
            <div role="group" aria-label="Objetivos" style="display: flex; flex-direction: column; gap: 12px">
              <span class="px" style="height: 16px; font-size: 10px; color: #FF836C">TUS 4 OBJETIVOS</span>
              @for (o of v().objs; track $index) {
                <div role="button" tabindex="0" [attr.aria-pressed]="(o.pressed)" [attr.aria-label]="(o.aria)" class="card" (click)="o.pick?.($event)" (keydown)="o.key?.($event)" [style]="'position: relative; height: 96px; box-sizing: border-box; padding: 10px 26px 10px 14px; border-radius: 8px; border: 3px solid ' + (o.bd) + '; background: ' + (o.bg) + '; color: #231417; cursor: pointer; display: flex; flex-direction: column; justify-content: center; gap: 4px; transform: ' + (o.lift)">
                  <div style="display: flex; align-items: center; gap: 8px"><span class="px" style="font-size: 10px; color: #AC0B32">{{ o.label }}</span>@if (o.canClear) {<button type="button" (click)="o.clear?.($event)" aria-label="Quitar relación" style="margin-left: auto; height: 24px; padding: 0 8px; border-radius: 999px; border: 1.5px solid #8A1428; background: #FFFFFF; color: #8A1428; font-size: 12px; font-weight: 800; cursor: pointer">✕ Quitar</button>}</div>
                  <span style="font-size: 13px; font-weight: 600; line-height: 1.3">{{ o.text }}</span>
                  @if (o.review) {<span style="font-size: 12px; font-weight: 700; color: #8A1428">↺ Revisa esta relación.</span>}
                  <span aria-hidden="true" [style]="'position: absolute; right: -10px; top: 50%; margin-top: -9px; width: 18px; height: 18px; border-radius: 999px; background: ' + (o.dot) + '; border: 3px solid #1A0609'"></span>
                </div>
              }
            </div>
            <div style="padding-top: 28px" aria-hidden="true">
              <svg viewBox="0 0 100 420" preserveAspectRatio="none" style="display: block; width: 100%; height: 420px">
                @for (l of v().lines; track $index) {<path [attr.d]="(l.d)" fill="none" [attr.stroke]="(l.c)" stroke-width="4" [attr.stroke-dasharray]="(l.dash)" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>}
              </svg>
            </div>
            <div role="group" aria-label="Dimensiones de sostenibilidad" style="display: flex; flex-direction: column; gap: 12px">
              <span class="px" style="height: 16px; font-size: 10px; color: #FF836C">DIMENSIONES</span>
              @for (d of v().dims; track $index) {
                <div role="button" tabindex="0" [attr.aria-label]="(d.aria)" [class]="'zone ' + (d.cls)" (click)="d.pick?.($event)" (keydown)="d.key?.($event)" [style]="'position: relative; height: 96px; box-sizing: border-box; padding: 10px 14px 10px 26px; border-radius: 8px; border: 5px ' + (d.line) + ' #FF836C; background: #2A0B12; color: #FBF5EC; cursor: pointer; display: flex; align-items: center; gap: 12px'">
                  <span aria-hidden="true" [style]="'position: absolute; left: -10px; top: 50%; margin-top: -9px; width: 18px; height: 18px; border-radius: 999px; background: ' + (d.dot) + '; border: 3px solid #1A0609'"></span>
                  <span style="width: 44px; height: 44px; flex-shrink: 0; border-radius: 8px; background: #FF836C; display: flex; align-items: center; justify-content: center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A0609" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="(d.icon)"></path></svg></span>
                  <div style="display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 18px">{{ d.label }}</strong><span class="px" style="font-size: 10px; color: #FFD3C9">{{ d.count }}</span></div>
                </div>
              }
            </div>
          </div>
        }

        
        <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap; min-height: 64px">
          @if (v().p2) {<button type="button" class="gbtn" (click)="v().back?.($event)" aria-label="Volver a la fase 1" style="min-height: 52px; padding: 0 18px; border: 2px solid #FF836C; background: #2A0B12; color: #FBF5EC; cursor: pointer"><span class="px" style="font-size: 10px">◀ FASE 1</span></button>}
          @if (v().fbShow) {
            <app-feedback class="pop" [ok]="v().fbColor === '#2C5E31'" [titulo]="v().fbTitle" [texto]="v().fbText" />
          }
          <span style="flex: 1"></span>
          @if (v().canClear) {<button type="button" (click)="v().clearAll?.($event)" aria-label="Limpiar: devuelve las respuestas sin comprobar" style="height: 44px; padding: 0 16px; border: 2px solid rgba(255,131,108,0.55); border-radius: 6px; background: transparent; color: #FFD3C9; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; cursor: pointer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD3C9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"></path></svg>Limpiar</button>}
          @if (v().canCheck) {<button type="button" class="gbtn" (click)="v().check?.($event)" [attr.aria-disabled]="(v().checkDis)" [style]="'min-height: 52px; padding: 0 24px; border: none; background: ' + (v().checkBg) + '; color: ' + (v().checkFg) + '; font-weight: 800; font-size: 16px; cursor: ' + (v().checkCursor)">Comprobar ({{ v().readyN }}/{{ v().needN }})</button>}
          @if (v().canNext) {<button type="button" class="gbtn glow" (click)="v().next?.($event)" style="min-height: 52px; padding: 0 24px; border: none; background: #FF836C; color: #1A0609; cursor: pointer"><span class="px" style="font-size: 11px">▶ {{ v().nextLabel }}</span></button>}
        </div>
      </div>
    }

    @if (v().ended) {
      <div style="flex: 1; min-height: 640px; display: flex; align-items: center; justify-content: center">
      <div class="pop gpanel" style="width: min(100%, 960px); box-sizing: border-box; background: #8A1428; color: #FFFFFF; padding: 40px 44px; display: flex; flex-direction: column; gap: 32px">
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 32px">
          <app-personaje who="teo" [size]="150" />
          <div style="flex: 1 1 340px; display: flex; flex-direction: column; gap: 18px">
            <span style="font-size: 36px; font-weight: 800; line-height: 1.05">{{ v().endTitle }}</span>
            <div style="display: flex; flex-wrap: wrap; gap: 10px">
              <span class="px" style="padding: 9px 12px; border-radius: 6px; background: #2A0B12; border: 2px solid #FF836C; font-size: 10px; color: #FBF5EC">{{ v().right }}/9 NOTAS</span>
              <span class="px" style="padding: 9px 12px; border-radius: 6px; background: #2A0B12; border: 2px solid #FF836C; font-size: 10px; color: #FBF5EC">{{ v().rightLinks }}/4 RELACIONES</span>
              <span class="px" style="padding: 9px 12px; border-radius: 6px; background: #2A0B12; border: 2px solid #FF836C; font-size: 10px; color: #FBF5EC">{{ v().score }} GRANOS</span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 14px; margin-top: 4px">
              <a class="gbtn" [routerLink]="after().link" style="display: inline-flex; align-items: center; min-height: 52px; box-sizing: border-box; padding: 0 24px; background: #FFFFFF; color: #8A1428; font-weight: 800; font-size: 16px; text-decoration: none">{{ after().closes ? 'Cerrar el módulo' : 'Siguiente reto' }}</a>
              <a class="gbtn" routerLink="/ruta" style="display: inline-flex; align-items: center; min-height: 52px; box-sizing: border-box; padding: 0 24px; background: transparent; border: 2px solid #FFFFFF; color: #FFFFFF; font-weight: 800; font-size: 16px; text-decoration: none">Volver al mapa</a>
            </div>
          </div>
        </div>
        <section aria-label="Consecuencia de tus decisiones" class="csq" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px">
          <div style="background: #FFFFFF; color: #231417; border-radius: 10px; padding: 20px; display: flex; flex-direction: column; gap: 12px"><span class="px" style="font-size: 10px; color: #AC0B32">QUÉ PASÓ</span><span style="font-size: 15px; font-weight: 700; line-height: 1.4">{{ v().csqWhat }}</span></div>
          <div style="background: #FFFFFF; color: #231417; border-radius: 10px; padding: 20px; display: flex; flex-direction: column; gap: 12px"><span class="px" style="font-size: 10px; color: #AC0B32">TU EMPRESA</span><div style="display: flex; align-items: center; gap: 8px; font-size: 15px"><span style="width: 10px; height: 10px; border-radius: 2px; background: #8A1428"></span><strong style="flex: 1">Gobernanza</strong><span style="font-weight: 800; color: #2C5E31">+{{ v().csqGob }}</span></div><span style="font-size: 14px; color: #5C4A4D; line-height: 1.4">Un rumbo claro orienta cada decisión del equipo.</span></div>
          <div style="background: #FFFFFF; color: #231417; border-radius: 10px; padding: 20px; display: flex; flex-direction: column; gap: 12px"><span class="px" style="font-size: 10px; color: #3F7E44">LO QUE APRENDISTE</span><span style="font-size: 15px; font-weight: 700; line-height: 1.4">Sin misión, visión y objetivos medibles, no hay plan que seguir.</span></div>
        </section>
      </div>
      </div>
    }
  </main>
</div>`,
  styles: `a:focus-visible,button:focus-visible,[role=button]:focus-visible{outline:3px solid #FF836C;outline-offset:3px}
button{font-family:inherit}
@keyframes pop{0%{opacity:0;transform:scale(.6)}70%{transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes zp{0%,100%{box-shadow:inset 0 0 0 0 rgba(255,131,108,0)}50%{box-shadow:inset 0 0 0 4px rgba(255,131,108,.45)}}
.pop{animation:pop .45s cubic-bezier(.2,.7,.2,1) both}
.up{animation:up .35s cubic-bezier(.2,.7,.2,1) both}
.zpulse{animation:zp 1.2s ease-in-out infinite}
.card{transition:transform .15s,box-shadow .15s,border-color .15s}
.card:hover{box-shadow:0 8px 18px rgba(0,0,0,.35)}
.zone{transition:background .15s}
@media (prefers-reduced-motion: reduce){.pop,.up,.zpulse{animation:none}.card,.zone{transition:none}}
    @media (max-width: 760px){ .zgrid{grid-template-columns:repeat(2,minmax(0,1fr)) !important} .tcard{width:calc(50% - 5px) !important} .p2grid{grid-template-columns:minmax(0,1fr) 60px minmax(0,1fr) !important} .csq{grid-template-columns:1fr !important} }
  `,
})
export class Reto11 extends DcReto {
  readonly ejercicioId = DATA.id;
  readonly titulo = DATA.title;
  private dragI: number | null = null;

  constructor() {
    super();
    this.state = { phase: 'p1', att1: 1, att2: 1, place: {}, sel: null, locked: {}, review: {}, reveal: {}, done1: false, fb: null,
      link: {}, selObj: null, locked2: {}, review2: {}, reveal2: {}, done2: false };
    this.restaurar();
  }
  placeCard(i: number | null, k: string) {
    const { place, locked, done1, review } = this.state;
    if (i == null || locked[i] || done1) return;
    const r = { ...review }; delete r[i];
    this.setState({ place: { ...place, [i]: k }, sel: null, review: r });
  }
  unplace(i: number | null) {
    const { place, locked, done1 } = this.state;
    if (i == null || locked[i] || done1 || place[i] == null) return;
    const p = { ...place }; delete p[i];
    this.setState({ place: p, sel: null });
  }
  check1() {
    const { place, locked, att1 } = this.state;
    const nl = { ...locked }, wrong: number[] = [];
    B.forEach((b, i) => { if (locked[i]) return; if (place[i] === b[1]) nl[i] = true; else wrong.push(i); });
    if (!wrong.length) { this.setState({ locked: nl, done1: true, sel: null, fb: { ok: true, t: '¡Brújula clara!', x: 'Las 9 notas están en su lugar. Ahora, los objetivos.' } }); this.speak('¡Brújula clara!'); this.guardarPaso(1); return; }
    if (att1 === 1) {
      const p = { ...place }, rv: any = {}; wrong.forEach((i) => { delete p[i]; rv[i] = true; });
      this.setState({ locked: nl, place: p, review: rv, att1: 2, sel: null, fb: { ok: false, t: 'Mmm, ' + wrong.length + (wrong.length === 1 ? ' nota quedó' : ' notas quedaron') + ' fuera de lugar.', x: 'Volvieron a la bandeja con una pista. Tienes un segundo intento.' } });
    } else {
      const p = { ...place }, rv: any = {}; wrong.forEach((i) => { p[i] = B[i][1]; rv[i] = true; });
      this.setState({ locked: nl, place: p, reveal: rv, review: {}, done1: true, sel: null, fb: { ok: false, t: 'Así queda tu brújula.', x: 'Las marcadas con → muestran dónde iba cada nota y por qué.' } });
      this.guardarPaso(1);
    }
  }
  check2() {
    const { link, locked2, att2 } = this.state;
    const nl = { ...locked2 }, wrong: number[] = [];
    OBJ.forEach((o, r) => { if (locked2[r]) return; if (link[r] === o[2]) nl[r] = true; else wrong.push(r); });
    if (!wrong.length) { this.setState({ locked2: nl, done2: true, selObj: null, fb: { ok: true, t: '¡Cada objetivo cuida su dimensión!', x: 'La junta ve un plan equilibrado.' } }); this.speak('¡Muy bien!'); this.guardarPaso(2); return; }
    if (att2 === 1) {
      const l = { ...link }, rv: any = {}; wrong.forEach((r) => { delete l[r]; rv[r] = true; });
      this.setState({ locked2: nl, link: l, review2: rv, att2: 2, selObj: null, fb: { ok: false, t: wrong.length + (wrong.length === 1 ? ' relación no es la principal.' : ' relaciones no son las principales.'), x: 'Piensa qué cuida primero cada objetivo. Segundo intento.' } });
    } else {
      const l = { ...link }, rv: any = {}; wrong.forEach((r) => { l[r] = OBJ[r][2]; rv[r] = true; });
      this.setState({ locked2: nl, link: l, reveal2: rv, review2: {}, done2: true, selObj: null, fb: { ok: false, t: 'Así se relacionan.', x: 'Las líneas punteadas muestran la dimensión principal de cada objetivo.' } });
      this.guardarPaso(2);
    }
  }
  /** Al terminar: los granos cuentan (mejor resultado) y se guardan las respuestas. */
  terminar() {
    const S = this.state;
    const right = Object.keys(S['locked']).length, rightLinks = Object.keys(S['locked2']).length;
    const score = right * P1 + rightLinks * P2;
    const items = B.map((b, i) => ({ label: b[0], ok: !S['reveal'][i], explanation: Z.find((z) => z[0] === b[1])![1] + ': ' + b[2] }))
      .concat(OBJ.map((o, r) => ({ label: 'Objetivo ' + o[1].toLowerCase() + ' → ' + DIMS[o[2]][0], ok: !S['reveal2'][r], explanation: '' })));
    this.setState({ phase: 'end' });
    this.registrar(score, items, { place: S['place'], link: S['link'] }, `${right}/9 notas · ${rightLinks}/4 relaciones · ${score} granos.`,
      { aLaPrimera: S['att1'] === 1 && S['att2'] === 1, segundoIntento: S['att1'] === 2 || S['att2'] === 2 });
  }
  renderVals() {
    const S = this.state;
    const { phase, place, sel, locked, review, reveal, done1, fb, link, selObj, locked2, review2, reveal2, done2 } = S;
    const p1 = phase === 'p1', p2 = phase === 'p2';
    const right = Object.keys(locked).length, rightLinks = Object.keys(locked2).length;
    const score = right * P1 + rightLinks * P2;
    const placedN = Object.keys(place).length, linkedN = Object.keys(link).length;
    const readyN = p1 ? placedN : linkedN, needN = p1 ? B.length : OBJ.length;
    const ready = readyN === needN;
    const allowDrop = (e: Event) => { if (e && e.preventDefault) e.preventDefault(); };
    const rowY = (r: number) => 48 + r * 108;
    return {
      fase: p2 ? 2 : 1, attempt: p2 ? S['att2'] : S['att1'], score, maxScore: B.length * P1 + OBJ.length * P2, scoreAria: score + ' granos',
      playing: phase !== 'end', ended: phase === 'end', p1, p2,
      sitLabel: p1 ? 'SITUACIÓN · TU PRIMER DÍA' : 'SITUACIÓN · LA JUNTA PREGUNTA',
      sitText: p1 ? 'La junta dejó sus notas revueltas. Arma la brújula: ubica cada nota en su zona.' : 'Cada objetivo cuida una dimensión de la empresa. Une cada uno con su dimensión principal.',
      listen: () => this.speak(p1 ? 'Arrastra o toca cada nota y luego toca su zona: misión, visión, objetivo o no va.' : 'Toca un objetivo y luego la dimensión que más cuida: ambiental, social, económica o gobernanza.'),
      phases: [p1 ? '#FF836C' : '#FFD3C9', p2 ? '#FF836C' : '#4A2A2F'],
      progText: p1 ? 'FASE 1 DE 2' : 'FASE 2 DE 2',
      allowDrop,
      trayLabel: placedN === B.length ? 'TODAS LAS NOTAS ESTÁN UBICADAS' : 'NOTAS DE LA JUNTA · ARRASTRA O TOCA UNA',
      trayClick: () => { if (sel != null && place[sel] != null) this.unplace(sel); },
      dropTray: (e: Event) => { allowDrop(e); const i = this.dragI != null ? this.dragI : sel; this.dragI = null; this.unplace(i); },
      tray: B.map((b, i) => ({ b, i })).filter((x) => place[x.i] == null).map(({ b, i }) => {
        const s = sel === i, rv = !!review[i];
        return {
          text: b[0], review: rv, hint: HINT[b[1]], pressed: s ? 'true' : 'false',
          aria: b[0] + (s ? ' (seleccionada)' : '') + (rv ? ' (por revisar)' : ''),
          bg: s ? '#FFFFFF' : '#FFFFFF', bd: s ? '#FF836C' : rv ? '#FF836C' : '#FFFFFF', line: rv && !s ? 'dashed' : 'solid',
          lift: s ? 'translateY(-6px)' : 'none', sh: s ? '0 10px 20px rgba(0,0,0,0.4)' : 'none',
          drag: (e: DragEvent) => { this.dragI = i; try { e.dataTransfer!.setData('text/plain', String(i)); e.dataTransfer!.effectAllowed = 'move'; } catch { /* */ } },
          pick: (e: Event) => { stop(e); if (!done1) this.setState({ sel: s ? null : i }); },
        };
      }),
      zones: Z.map(([k, l, sub, icon]) => {
        const items = B.map((b, i) => ({ b, i })).filter((x) => place[x.i] === k);
        const drop = () => { if (sel != null) this.placeCard(sel, k); };
        return {
          label: l, sub, icon, count: items.length ? String(items.length) : '',
          aria: 'Zona ' + l + ', ' + items.length + ' notas.' + (sel != null ? ' Toca para ubicar aquí la nota seleccionada.' : ''),
          cls: sel != null && !done1 ? 'zpulse' : '', line: 'solid', bg: sel != null && !done1 ? '#3A1019' : '#2A0B12',
          drop, key: keyAct(drop),
          dropEv: (e: Event) => { allowDrop(e); const i = this.dragI != null ? this.dragI : sel; this.dragI = null; this.placeCard(i, k); },
          items: items.map(({ b, i }) => {
            const lk = !!locked[i], rvl = !!reveal[i], s = sel === i, free = !lk && !rvl && !done1;
            return {
              text: b[0], why: b[2], showWhy: done1 && (lk || rvl),
              mark: lk ? '✓ ' : rvl ? '→ ' : '', mc: lk ? '#2C5E31' : '#8A1428',
              bg: lk ? '#EAF4E6' : rvl ? '#FFF0EC' : s ? '#FFFFFF' : '#FFFFFF', bd: lk ? '#3F7E44' : rvl ? '#AC0B32' : s ? '#FF836C' : '#FFFFFF',
              cursor: free ? 'grab' : 'default', draggable: free ? 'true' : 'false',
              aria: b[0] + (lk ? ' (correcta)' : rvl ? ' (iba aquí)' : s ? ' (seleccionada)' : ''),
              drag: (e: DragEvent) => { if (!free) return; this.dragI = i; try { e.dataTransfer!.setData('text/plain', String(i)); } catch { /* */ } },
              pick: (e: Event) => { stop(e); if (free) this.setState({ sel: s ? null : i }); },
            };
          }),
        };
      }),
      objs: OBJ.map(([bi, lab], r) => {
        const s = selObj === r, lk = !!locked2[r], rv2 = !!reveal2[r], has = link[r] != null, free = !lk && !rv2 && !done2;
        const pick = () => { if (free) this.setState({ selObj: s ? null : r }); };
        return {
          label: lab, text: B[bi][0], review: !!review2[r] && !has, pressed: s ? 'true' : 'false',
          aria: 'Objetivo ' + lab.toLowerCase() + (has ? ', unido a ' + DIMS[link[r]][0] : ', sin relación') + (s ? ' (seleccionado)' : ''),
          bg: lk ? '#EAF4E6' : rv2 ? '#FFF0EC' : s ? '#FFFFFF' : '#FFFFFF', bd: lk ? '#3F7E44' : rv2 ? '#AC0B32' : s ? '#FF836C' : '#FFFFFF',
          lift: s ? 'translateX(6px)' : 'none', dot: lk ? '#56C02B' : rv2 ? '#AC0B32' : has || s ? '#FF836C' : '#6E5458',
          canClear: has && free, clear: (e: Event) => { stop(e); const l = { ...link }; delete l[r]; this.setState({ link: l }); },
          pick, key: keyAct(pick),
        };
      }),
      dims: DIM_ORDER.map((k) => {
        const n = Object.keys(link).filter((r) => link[r] === k).length;
        const pick = () => { if (selObj == null || done2) return; const r = selObj; const rv = { ...review2 }; delete rv[r]; this.setState({ link: { ...link, [r]: k }, selObj: null, review2: rv }); };
        return {
          label: DIMS[k][0], icon: DIMS[k][1], count: n ? n + (n === 1 ? ' OBJETIVO' : ' OBJETIVOS') : '',
          aria: 'Dimensión ' + DIMS[k][0] + (selObj != null ? '. Toca para unir el objetivo seleccionado.' : ''),
          cls: selObj != null ? 'zpulse' : '', line: 'solid', dot: n ? '#FF836C' : '#6E5458',
          pick, key: keyAct(pick),
        };
      }),
      lines: Object.keys(link).map((r) => {
        const y1 = rowY(Number(r)), y2 = rowY(DIM_ORDER.indexOf(link[r]));
        const lk = !!locked2[r], rv2 = !!reveal2[r];
        return { d: 'M0 ' + y1 + ' C50 ' + y1 + ' 50 ' + y2 + ' 100 ' + y2, c: lk ? '#56C02B' : rv2 ? '#FFD3C9' : '#FF836C', dash: rv2 ? '6 6' : 'none' };
      }),
      fbShow: !!fb, fbTitle: fb ? fb.t : '', fbText: fb ? fb.x : '', fbBg: fb && fb.ok ? '#EAF4E6' : '#FFF0EC', fbColor: fb && fb.ok ? '#2C5E31' : '#8A1428',
      canCheck: (p1 && !done1) || (p2 && !done2), readyN, needN,
      checkDis: ready ? 'false' : 'true', checkBg: ready ? '#AC0B32' : '#4A2A2F', checkFg: ready ? '#FFFFFF' : '#C9B8A6', checkCursor: ready ? 'pointer' : 'not-allowed',
      check: () => { if (!ready) return; if (p1) this.check1(); else this.check2(); },
      canNext: (p1 && done1) || (p2 && done2), nextLabel: p1 ? 'FASE 2' : 'TERMINAR',
      next: () => (p1 ? this.setState({ phase: 'p2', sel: null, fb1: fb, fb: S['fb2'] || null }) : this.terminar()),
      back: () => this.setState({ phase: 'p1', selObj: null, fb2: fb, fb: S['fb1'] || null }),
      canClear: p1 ? !done1 && Object.keys(place).some((i) => !locked[i]) : p2 && !done2 && Object.keys(link).some((r) => !locked2[r]),
      clearAll: () => {
        if (p1) { const p: any = {}; Object.keys(place).forEach((i) => { if (locked[i]) p[i] = place[i]; }); this.setState({ place: p, sel: null }); }
        else { const l: any = {}; Object.keys(link).forEach((r) => { if (locked2[r]) l[r] = link[r]; }); this.setState({ link: l, selObj: null }); }
      },
      right, rightLinks,
      endTitle: right === 9 && rightLinks === 4 ? '¡Brújula clara!' : right + rightLinks >= 10 ? 'Buen rumbo.' : 'Misión cumplida.',
      csqGob: Math.round(((right + rightLinks) / 13) * 8),
      csqWhat: right >= 7 && rightLinks >= 3 ? 'El equipo ya sabe hacia dónde va la empresa. La junta aprueba tu brújula.' : 'La brújula aún tiene notas fuera de lugar. El equipo duda del rumbo.',
    };
  }
}
