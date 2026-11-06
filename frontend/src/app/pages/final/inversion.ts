import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Hud } from '../../shared/hud';
import { Mood, Personaje, Who } from '../../shared/personaje';
import DATA from './shark-tank.json';

interface Respuesta { texto: string; tipo: 'correcta' | 'neutra' | 'greenwashing'; interes: number; reaccion: string }
interface Pregunta { inversionista: string; pregunta: string; evalua: string; respuestas: Respuesta[] }
const ST = DATA as {
  pitch: { titulo: string; descripcion: string; pides: string };
  interesInicial: number;
  umbrales: { invierte: number; seRetira: number };
  /** personaje = nombre del SVG en public/assets/personajes (laura, andres, klaus). */
  inversionistas: { nombre: string; tipo: string; personaje: Who }[];
  datosPitch: { valor: string; etiqueta: string }[];
  versiones: { version: string; preguntas: Pregunta[] }[];
  final: { conTrato: string; sinTrato: string };
};

/**
 * Ronda de inversión (SharkTank.dc.html, /inversion). Capa nueva: no suma puntos.
 * Preguntas, respuestas, puntos de interés y reacciones salen de shark-tank.json.
 */
@Component({
  selector: 'app-inversion',
  imports: [RouterLink, Hud, Personaje],
  template: `
    <div class="game-bg" style="min-height: 100vh; display: flex; flex-direction: column; color: #FFFFFF; font-family: 'DM Sans', Arial, sans-serif">
      <app-hud kicker="FINAL · 2030" title="Ronda de inversión" variant="modulo" [mini]="false" style="position: relative; z-index: 3" />

      <!-- ESCENARIO -->
      <section class="set" aria-label="Set de la ronda de inversión" style="position: relative; overflow: hidden; background: radial-gradient(ellipse at 50% 0%, #7A3242 0%, #5A2230 75%)">
        <div aria-hidden="true" style="position: absolute; inset: 0; background-image: repeating-linear-gradient(90deg, rgba(255,131,108,0.05) 0 2px, transparent 2px 120px)"></div>
        <div aria-hidden="true" class="spot" style="position: absolute; left: 44%; top: -40px; width: 260px; height: 520px; background: linear-gradient(180deg, rgba(255,211,201,0.22), transparent 80%); clip-path: polygon(42% 0, 58% 0, 100% 100%, 0 100%)"></div>
        <div aria-hidden="true" class="spot" style="position: absolute; left: 65%; top: -40px; width: 260px; height: 520px; background: linear-gradient(180deg, rgba(255,211,201,0.18), transparent 80%); clip-path: polygon(42% 0, 58% 0, 100% 100%, 0 100%); animation-delay: 1.4s"></div>
        <div class="stage">
          <section class="gpanel pitch" aria-label="Tu pitch" style="position: relative; z-index: 1; box-sizing: border-box; background: #FFFFFF; color: #231417; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px">
            <div style="position: relative; display: flex; flex-direction: column; gap: 8px">
              <span style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; justify-content: center"><span class="px" style="font-size: 10px; color: #AC0B32">TU PITCH</span><button type="button" (click)="help.set(!help())" [attr.aria-expanded]="help() ? 'true' : 'false'" aria-controls="que-es-pitch" aria-label="¿Qué es un pitch?" [style.background]="help() ? '#AC0B32' : '#FFFFFF'" [style.color]="help() ? '#FFFFFF' : '#AC0B32'" style="width: 18px; height: 18px; border-radius: 999px; border: 1.5px solid #AC0B32; font-size: 11px; font-weight: 800; line-height: 1; cursor: pointer; padding: 0">?</button></span>
              @if (help()) { <span id="que-es-pitch" class="bub" role="note" style="font-size: 13px; line-height: 1.35; color: #3D2C2F; background: #FFE6DD; border-radius: 6px; padding: 8px 10px">Un pitch es una presentación corta de tu idea, con datos, para convencer a quien puede invertir en ella.</span> }
              <span style="font-size: 24px; font-weight: 800; line-height: 1.1; text-align: center">{{ pitch.titulo }}</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
              @for (d of data(); track d.l) {
                <div style="border-radius: 8px; border: 2px solid #AC0B32; padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; background-color: #FFFFFF"><strong style="font-size: 24px; line-height: 1.1; color: #8A1428">{{ d.v }}</strong><span style="font-size: 12px; font-weight: 600; color: #5C4A4D">{{ d.l }}</span></div>
              }
            </div>
            <span style="height: 44px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; padding: 0 14px; border: 2px solid #AC0B32; border-radius: 6px; font-size: 15px; background-color: #AC0B32; font-weight: 800; color: #FFFFFF">PIDES: {{ pitch.pides }}</span>
          </section>

          <!-- inversionistas -->
          <div class="sharks" style="position: relative; z-index: 1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; align-items: end">
            @for (s of sharks(); track s.nombre) {
              <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 373px">
                @if (s.talk) {
                  <div class="bub globo" aria-live="polite" style="position: absolute; z-index: 5; top: -5px; left: -60px; right: -60px; margin: 0; box-sizing: border-box; background: #FFFFFF; color: #231417; border-radius: 16px; padding: 14px 18px; font-size: 20px; font-weight: 800; line-height: 1.3; box-shadow: 6px 6px 0 #8A1428, 0 0 0 6px rgba(255,131,108,0.35), 0 20px 44px rgba(0,0,0,0.5); text-align: center; min-height: 105px"><span class="sr">{{ s.nombre }} dice: </span>{{ s.say }}<span aria-hidden="true" style="position: absolute; left: 50%; bottom: -10px; margin-left: -10px; width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 12px solid #FFFFFF"></span></div>
                }
                @if (s.stamped) {
                  <span class="stamp px" [style.border]="'4px solid ' + s.stC" [style.color]="s.stC" style="position: absolute; top: 60px; z-index: 2; padding: 10px 12px; background: rgba(26,6,9,0.85); font-size: 12px">{{ s.state }}</span>
                }
                <div aria-hidden="true" [style.background]="'radial-gradient(circle, rgba(255,131,108,' + s.glow + ') 0%, transparent 70%)'" style="position: absolute; bottom: 70px; width: 210px; height: 210px; border-radius: 999px"></div>
                <div [class.nod]="s.talk" style="position: relative; display: flex">
                  <app-personaje [who]="s.personaje" [size]="200" [mood]="s.mood" [talking]="s.talking" [outline]="false" [alt]="s.aria" />
                </div>
                <!-- mesa -->
                <div style="position: relative; width: calc(100% - 10px); box-sizing: border-box; height: 76px; margin-top: -26px; background: #8A1428; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; text-align: center">
                  <span style="font-size: 15px; font-weight: 800; color: #FBF5EC">{{ s.nombre }} <span style="font-weight: 600; color: #FFD3C9">· {{ s.tipo }}</span></span>
                  <span role="img" [attr.aria-label]="s.meterAria" style="display: flex; gap: 4px">
                    @for (c of s.coins; track $index) { <span [style.background]="c" style="width: 16px; height: 16px; border-radius: 999px; transition: background .4s"></span> }
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <section aria-live="polite" style="flex: 1; width: 100%; max-width: 1200px; margin: 0 auto; padding: 14px 32px 20px; box-sizing: border-box; display: flex; align-items: flex-start; gap: 18px">
        <div style="flex: 1; min-width: 0; background: #FFFFFF; color: #231417; border-radius: 14px; box-shadow: 0 16px 36px rgba(0,0,0,0.35); padding: 18px 22px; display: flex; flex-direction: column; justify-content: center; gap: 10px; box-sizing: border-box">
          @if (phase() === 'ask') {
            <div style="display: flex; flex-direction: column; gap: 10px">
              <span class="px" style="font-size: 13px; color: #AC0B32; margin-bottom: 2px">PREGUNTA {{ i() + 1 }}/{{ total }} · ELIGE TU RESPUESTA</span>
              <div class="answers" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px">
                @for (a of cur().respuestas; track a.texto; let k = $index) {
                  <button type="button" class="gbtn" (click)="answer(a)" style="text-align: left; min-height: 96px; padding: 12px 14px; border: 2px solid #F2D9D1; background: #FFF5F2; color: #231417; font-size: 18px; font-weight: 600; line-height: 1.3; cursor: pointer; display: flex; flex-direction: column; gap: 8px; align-items: flex-start"><span class="px" style="width: 30px; height: 30px; border-radius: 6px; background: #FF836C; color: #1A0609; font-size: 15px; display: flex; align-items: center; justify-content: center">{{ 'ABC'[k] }}</span>{{ a.texto }}</button>
                }
              </div>
            </div>
          }
          @if (phase() === 'react') {
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap">
              <div style="display: flex; flex-direction: column; gap: 4px; flex: 1 1 320px">
                <span [style.color]="deltaC()" style="font-size: 18px; font-weight: 700">{{ deltaText() }}</span>
                <span style="font-size: 14px; color: #5C4A4D"><strong style="color: #8A1428">Evalúa:</strong> {{ cur().evalua }}</span>
              </div>
              <button type="button" class="gbtn glow" (click)="next()" style="min-height: 50px; padding: 0 22px; border: none; background: #FF836C; color: #1A0609; cursor: pointer"><span class="px" style="font-size: 10px">▶ {{ i() < total - 1 ? 'SIGUIENTE' : 'VER LA OFERTA' }}</span></button>
            </div>
          }
          @if (phase() === 'end') {
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap">
              <div style="display: flex; flex-direction: column; gap: 4px"><span style="font-size: 26px; font-weight: 800">{{ dealTitle() }}</span><span style="font-size: 15px; color: #5C4A4D">{{ deals() > 0 ? final.conTrato : final.sinTrato }}</span></div>
              <div style="display: flex; gap: 10px; flex-wrap: wrap">
                <button type="button" class="gbtn" (click)="restart()" style="min-height: 50px; padding: 0 18px; border: 2px solid #8A1428; background: transparent; color: #8A1428; font-weight: 800; cursor: pointer">Repetir</button>
                <a class="gbtn glow" routerLink="/barra" style="display: inline-flex; align-items: center; min-height: 50px; padding: 0 22px; background: #FF836C; color: #1A0609; text-decoration: none"><span class="px" style="font-size: 10px">▶ VER TU BARRA</span></a>
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: `
    a{color:#FFFFFF} a:focus-visible,button:focus-visible{outline:3px solid #FF836C;outline-offset:3px} button{font-family:inherit}
    .set{height:540px;margin-top:-90px}
    .stage{position:relative;height:100%;max-width:1280px;margin:0 auto;box-sizing:border-box;padding:126px 32px 33px 66px;display:flex;gap:71px;align-items:flex-end}
    .pitch{width:320px;min-height:372px;flex-shrink:0;align-self:flex-start}
    .sharks{flex:1;min-width:0;height:407px}
    .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
    @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
    @keyframes bub{0%{opacity:0;transform:translateY(8px) scale(.9)}100%{opacity:1;transform:none}}
    .bub{animation:bub .35s cubic-bezier(.2,.7,.2,1) both}
    @keyframes stamp{0%{opacity:0;transform:rotate(-12deg) scale(2.2)}60%{opacity:1;transform:rotate(-8deg) scale(.92)}100%{transform:rotate(-8deg) scale(1)}}
    .stamp{animation:stamp .55s cubic-bezier(.2,.7,.2,1) both}
    @keyframes sway{0%,100%{opacity:.55}50%{opacity:.85}}
    .spot{animation:sway 3s ease-in-out infinite}
    @keyframes nod{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    .nod{animation:nod 1.4s ease-in-out infinite}
    @media (max-width: 1000px){
      .set{height:auto}
      .stage{flex-direction:column;align-items:stretch;padding:24px 16px;gap:18px}
      .pitch{width:100%;height:auto}
      .sharks{height:auto}
      .answers{grid-template-columns:1fr !important}
    }
    @media (max-width: 600px){.sharks{grid-template-columns:1fr !important}}
    @media (prefers-reduced-motion: reduce){.bub,.stamp,.spot,.nod{animation:none}}
  `,
})
export class InversionPage {
  readonly pitch = ST.pitch;
  readonly final = ST.final;
  /** Versión de las preguntas (A o B): al azar en cada partida; «Repetir» pasa a la otra. */
  version = signal(Math.floor(Math.random() * ST.versiones.length));
  preguntas = computed(() => ST.versiones[this.version()].preguntas);
  get total() {
    return this.preguntas().length;
  }
  help = signal(false);
  i = signal(0);
  phase = signal<'ask' | 'react' | 'end'>('ask');
  interest = signal(ST.inversionistas.map(() => ST.interesInicial));
  last = signal<{ r: string; d: number; tipo: Respuesta['tipo'] } | null>(null);
  cur = computed(() => this.preguntas()[Math.min(this.i(), this.preguntas().length - 1)]);
  /** Índice del inversionista que pregunta (se busca por su nombre). */
  who = computed(() => Math.max(0, ST.inversionistas.findIndex((x) => x.nombre === this.cur().inversionista)));
  deals = computed(() => this.interest().filter((v) => v >= ST.umbrales.invierte).length);
  dealTitle = computed(() => {
    const n = ST.inversionistas.length;
    return this.deals() === n ? '¡Trato con los ' + (n === 3 ? 'tres' : n) + '!' : this.deals() > 0 ? 'Trato con ' + this.deals() + ' de ' + n : 'Sin trato… todavía';
  });
  deltaText = computed(() => {
    const l = this.last();
    if (!l) return '';
    const name = ST.inversionistas[this.who()].nombre;
    return l.tipo === 'greenwashing' || l.d < 0 ? '▼ ' + name + ' pierde interés. Sin datos, suena a greenwashing.' : l.d > 0 ? '▲ ' + name + ' se interesa.' : '■ ' + name + ' no se mueve. Faltan cifras.';
  });
  deltaC = computed(() => (!this.last() ? '#231417' : this.last()!.d > 0 ? '#2C5E31' : this.last()!.d < 0 ? '#AC0B32' : '#231417'));

  sharks = computed(() =>
    ST.inversionistas.map((s, k) => {
      const v = this.interest()[k];
      const { invierte, seRetira } = ST.umbrales;
      const mood: Mood = v >= invierte ? 'happy' : v <= seRetira ? 'sad' : 'mid';
      const ended = this.phase() === 'end';
      const talk = k === this.who() && !ended;
      const state = v >= invierte ? 'INVIERTE' : v <= seRetira ? 'SE RETIRA' : 'LO PIENSA';
      const filled = Math.round(v / 20);
      return {
        ...s, mood, talk, talking: talk && this.phase() === 'ask',
        say: this.phase() === 'react' && this.last() ? '«' + this.last()!.r + '»' : this.cur().pregunta,
        glow: talk ? '0.45' : '0.08',
        aria: s.nombre + ', inversionista ' + s.tipo.toLowerCase() + ': ' + state.toLowerCase(),
        stamped: ended, state, stC: v >= invierte ? '#56C02B' : v <= seRetira ? '#FF836C' : '#FFD3C9',
        coins: [0, 1, 2, 3, 4].map((n) => (n < filled ? '#FF836C' : '#4A2A2F')),
        meterAria: 'Interés ' + filled + ' de 5',
      };
    }),
  );

  /** Datos del pitch (shark-tank.json): son los que citan las respuestas correctas. */
  readonly data = () => ST.datosPitch.map((d) => ({ l: d.etiqueta, v: d.valor }));

  answer(a: Respuesta) {
    const w = this.who();
    this.interest.update((v) => v.map((x, k) => (k === w ? Math.max(0, Math.min(100, x + a.interes)) : x)));
    this.last.set({ r: a.reaccion, d: a.interes, tipo: a.tipo });
    this.phase.set('react');
  }
  next() {
    if (this.i() < this.total - 1) {
      this.i.update((v) => v + 1);
      this.phase.set('ask');
    } else this.phase.set('end');
  }
  restart() {
    this.version.update((v) => (v + 1) % ST.versiones.length);
    this.i.set(0);
    this.phase.set('ask');
    this.interest.set(ST.inversionistas.map(() => ST.interesInicial));
    this.last.set(null);
  }
}
