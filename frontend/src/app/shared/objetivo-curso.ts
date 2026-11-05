import { Component, output, signal } from '@angular/core';

/**
 * «Lo que vas a lograr» (PrimeraVez.dc.html, paso 1): objetivo del curso.
 * Se usa en Primera vez y en el botón «Objetivo del curso» de la Ruta.
 */
@Component({
  selector: 'app-objetivo-curso',
  template: `
    <section class="up" aria-labelledby="obj" style="width: 100%; max-width: 760px; background: #FFFFFF; border-radius: 28px; padding: 36px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 22px; text-align: center; color: #231417; font-family: 'DM Sans', Arial, sans-serif">
      <span style="font-size: 13px; font-weight: 800; letter-spacing: 0.12em; color: #AC0B32">LO QUE VAS A LOGRAR</span>
      <h1 id="obj" style="margin: 0; font-size: 30px; line-height: 1.2; font-weight: 800; letter-spacing: -0.02em; max-width: 620px">Practicar las 4 fases del proceso administrativo, pensando de forma crítica en la sostenibilidad de una empresa.</h1>
      <div aria-label="Las 4 fases" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px">
        @for (f of phases; track f[0]; let i = $index) {
          <span style="display: flex; align-items: center; gap: 8px"><span [style.background]="f[1]" style="padding: 10px 16px; border-radius: 999px; color: #FFFFFF; font-size: 15px; font-weight: 800">{{ i + 1 }}. {{ f[0] }}</span>@if (i < 3) {<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9B8A6" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>}</span>
        }
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px">
        <span style="font-size: 14px; color: #5C4A4D">Con las 4 dimensiones de la sostenibilidad</span>
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px">
          @for (d of dims; track d[0]) {<span [style.border]="'2px solid ' + d[1]" style="padding: 8px 14px; border-radius: 999px; color: #231417; font-size: 14px; font-weight: 700">{{ d[0] }}</span>}
        </div>
      </div>
      <button type="button" (click)="full.set(!full())" [attr.aria-expanded]="full() ? 'true' : 'false'" style="min-height: 40px; border: none; background: transparent; color: #8A1428; font-size: 15px; font-weight: 700; text-decoration: underline; cursor: pointer">{{ full() ? 'Ocultar objetivo completo' : 'Ver objetivo completo' }}</button>
      @if (full()) {
        <p style="margin: 0; padding: 16px 18px; border-radius: 16px; background: #FBF5EC; font-size: 15px; line-height: 1.55; color: #3D2C2F; text-align: left">Promover desde un pensamiento crítico-reflexivo la práctica de las fases del proceso administrativo, Planeación, Organización, Dirección y Control, bajo la estrategia de las dimensiones que rigen la sostenibilidad: social, económica, ambiental y gobernanza, dinamizadas desde la gestión de una organización o proyecto simulado.</p>
      }
      <button type="button" (click)="ok.emit()" style="min-width: 240px; min-height: 54px; border-radius: 999px; border: none; background: #AC0B32; color: #FFFFFF; font-weight: 800; font-size: 17px; cursor: pointer">Entendido</button>
    </section>
  `,
  styles: `
    button{font-family:inherit} button:focus-visible{outline:3px solid #231417;outline-offset:2px}
    @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
    .up{animation:up .45s cubic-bezier(.2,.7,.2,1) both}
    @media (prefers-reduced-motion: reduce){.up{animation:none}}
  `,
  host: { style: 'display: contents' },
})
export class ObjetivoCurso {
  ok = output();
  full = signal(false);
  readonly phases = [['Planeación', '#AC0B32'], ['Organización', '#8A1428'], ['Dirección', '#9A5B2E'], ['Control', '#231417']];
  readonly dims = [['Social', '#9A5B2E'], ['Económica', '#231417'], ['Ambiental', '#3F7E44'], ['Gobernanza', '#8A1428']];
}
