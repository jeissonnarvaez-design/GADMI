import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Accesibilidad } from '../../shared/accesibilidad';
import { LogoUao } from '../../shared/logo-uao';
import { Personaje } from '../../shared/personaje';

const ODS: [number, string][] = [
  [7, 'Energía asequible y no contaminante'],
  [8, 'Trabajo decente y crecimiento económico'],
  [12, 'Producción y consumo responsables'],
  [13, 'Acción por el clima'],
  [15, 'Vida de ecosistemas terrestres'],
];
const HI: [string, string, string, string, string][] = [
  ['TEO', '¡Hola! Soy Teo. Te acompaño en este recorrido.', '110px', '2%', 'auto'],
  ['CHISPA', 'Soy Chispa. Yo te muestro lo que dicen los datos.', '160px', 'auto', '2%'],
  ['NIBI', 'Soy Nibi. Mira un momento el mundo desde aquí.', '160px', 'auto', '2%'],
];

/** Bienvenida (Main.dc.html): foto con velo, personajes con saludo y ODS. */
@Component({
  selector: 'app-bienvenida',
  imports: [RouterLink, Accesibilidad, Personaje, LogoUao],
  template: `
    <div style="min-height: 100vh; position: relative; overflow: hidden; display: flex; flex-direction: column; background: #2A0B12; color: #FFFFFF; font-family: 'DM Sans', Arial, sans-serif" [style.filter]="fx() ? 'url(#nibi-vision)' : 'none'">
      <svg width="0" height="0" style="position: absolute" aria-hidden="true"><filter id="nibi-vision"><feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"></feColorMatrix></filter></svg>
      <div aria-hidden="true" style="position: absolute; inset: 0; overflow: hidden">
        <img class="zoom" src="/assets/fondo-cacao.jpg" alt="" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.4">
        <div style="position: absolute; inset: 0; background: rgba(42,11,18,0.8)"></div>
      </div>

      <header style="position: relative; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 40px">
        <span style="background: #FFFFFF; border-radius: 999px; padding: 7px 20px 7px 16px; display: inline-flex; align-items: center"><app-logo-uao /></span>
        <div style="display: flex; align-items: center; gap: 10px"><span style="font-size: 14px; color: #FBF5EC; padding: 8px 14px; border-radius: 999px; background: rgba(0,0,0,0.25)">Hola, <strong>{{ name() }}</strong></span><app-accesibilidad tone="dark" /></div>
      </header>

      <main style="position: relative; flex: 1; width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 40px 40px; box-sizing: border-box; min-height: 690px; display: flex; align-items: center; justify-content: center">
        <section style="position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 18px; max-width: 560px">
          <h1 class="rise" style="margin: 0; display: flex; flex-direction: column; align-items: center; line-height: 0.9; color: #FFFFFF">
            <span style="font-size: 150px; font-weight: 800; letter-spacing: -0.05em">GADMI</span>
            <span style="font-size: 44px; font-weight: 700; letter-spacing: -0.02em; color: #FFD3C9; margin-top: 8px">Sost-Empresarial</span>
          </h1>
          <p class="rise r1" style="margin: 0; font-size: 20px; line-height: 1.4; color: #FBF5EC; max-width: 560px">Gestión Administrativa y Gestión Sostenible Empresarial</p>

          <ul class="rise r2" aria-label="Objetivos de Desarrollo Sostenible" style="list-style: none; margin: 8px 0 0; padding: 0; display: flex; gap: 14px; align-items: center; justify-content: center; flex-wrap: wrap">
            @for (o of ods; track o[0]; let i = $index) {
              <li class="float" [style.animation-delay]="i * -1.1 + 's'" [style.animation-duration]="5 + (i % 3) * 0.8 + 's'">
                <button type="button" class="ods" (click)="pick.set(pick() === i ? null : i)" [attr.aria-label]="'ODS ' + o[0] + ': ' + o[1]" [attr.aria-pressed]="pick() === i ? 'true' : 'false'"
                  [style.border]="'1.5px solid ' + (pick() === i ? '#FFFFFF' : 'rgba(255,255,255,0.4)')"
                  style="width: 68px; height: 68px; border-radius: 999px; cursor: pointer; background: rgba(255,255,255,0.12); color: #FFFFFF; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; backdrop-filter: blur(8px)">
                  <span style="font-size: 9px; font-weight: 700; letter-spacing: 0.12em; opacity: 0.85">ODS</span>
                  <span style="font-size: 23px; font-weight: 800">{{ o[0] }}</span>
                </button>
              </li>
            }
          </ul>
          <span aria-live="polite" style="font-size: 15px; color: #FBF5EC; min-height: 20px">{{ odsLabel() }}</span>

          <a class="cta rise r3" routerLink="/video" style="display: inline-flex; align-items: center; gap: 12px; min-height: 62px; padding: 0 36px; border-radius: 999px; background: #FFFFFF; color: #8A1428; font-weight: 800; font-size: 20px; text-decoration: none">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#8A1428" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>Empezar
          </a>
        </section>

        <div class="rise r4 side" style="position: absolute; left: 3%; top: 186px; z-index: 1">
          <button type="button" class="pj" (click)="greet(0)" (mouseenter)="mirar(0)" (mouseleave)="soltar()" (focus)="mirar(0)" (blur)="soltar()" aria-label="Teo: saludo" style="background: none; border: none; padding: 0; cursor: pointer"><app-personaje who="teo" [size]="250" /></button>
        </div>
        <div class="rise r4 side" style="position: absolute; right: 3%; top: 250px; z-index: 1; display: flex; align-items: flex-end; gap: 10px">
          <button type="button" class="pj" (click)="greet(1)" (mouseenter)="mirar(1)" (mouseleave)="soltar()" (focus)="mirar(1)" (blur)="soltar()" aria-label="Chispa: saludo" style="background: none; border: none; padding: 0; cursor: pointer"><app-personaje who="chispa" [size]="152" /></button>
          <button type="button" class="pj" (click)="greet(2)" (mouseenter)="mirar(2)" (mouseleave)="soltar()" (focus)="mirar(2)" (blur)="soltar()" aria-label="Nibi: saludo" style="background: none; border: none; padding: 0; cursor: pointer"><app-personaje who="nibi" [size]="164" /></button>
        </div>

        <div aria-live="polite" class="bubble" [style.top]="hi()[2]" [style.left]="hi()[3]" [style.right]="hi()[4]" style="position: absolute; z-index: 3; width: 260px; box-sizing: border-box; background: #FFFFFF; color: #231417; border-radius: 20px; padding: 12px 16px; box-shadow: 0 14px 34px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 3px">
          <span style="font-size: 12px; font-weight: 800; letter-spacing: 0.08em; color: #AC0B32">{{ hi()[0] }}</span>
          <span style="font-size: 17px; font-weight: 700; line-height: 1.3">{{ hi()[1] }}</span>
        </div>
      </main>
    </div>
  `,
  styles: `
    a{color:#FFFFFF} a:focus-visible,button:focus-visible{outline:3px solid #FFFFFF;outline-offset:3px} button{font-family:inherit}
    @keyframes rise{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    @keyframes zoom{from{transform:scale(1.08)}to{transform:scale(1)}}
    .rise{animation:rise .9s cubic-bezier(.2,.7,.2,1) both}.r1{animation-delay:.15s}.r2{animation-delay:.3s}.r3{animation-delay:.45s}.r4{animation-delay:.6s}
    .float{animation:float 6s ease-in-out infinite}
    .zoom{animation:zoom 14s ease-out both}
    .ods{transition:transform .25s cubic-bezier(.2,.7,.2,1), background .25s}.ods:hover,.ods:focus-visible{transform:scale(1.12);background:rgba(255,255,255,0.24)}
    .pj{transition:transform .25s cubic-bezier(.2,.7,.2,1)}.pj:hover,.pj:focus-visible{transform:translateY(-6px)}
    .cta{transition:transform .2s, box-shadow .2s}.cta:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(0,0,0,.3)}
    @media (prefers-reduced-motion: reduce){.rise,.float,.zoom{animation:none}.ods,.pj,.cta{transition:none}}
    @media (max-width: 900px){ .side { display: none; } .bubble { display: none !important; } h1 span:first-child { font-size: 96px !important; } }
  `,
})
export class BienvenidaPage implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  readonly ods = ODS;
  who = signal(0);
  auto = signal(true);
  fx = signal(false);
  pick = signal<number | null>(null);
  private timer: ReturnType<typeof setInterval> | null = null;
  private fxT: ReturnType<typeof setTimeout> | null = null;
  name = computed(() => this.auth.student()?.nombre.split(' ')[0] ?? '');
  hi = computed(() => HI[this.who()]);
  odsLabel = computed(() => (this.pick() === null ? '' : 'ODS ' + ODS[this.pick()!][0] + ' · ' + ODS[this.pick()!][1]));

  ngOnInit() {
    this.timer = setInterval(() => {
      if (!this.auto() || this.encima) return;
      const next = (this.who() + 1) % 3;
      this.who.set(next);
      if (next === 2) this.nibiFx();
    }, 4500);
  }
  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.fxT) clearTimeout(this.fxT);
  }
  private nibiFx() {
    if (this.fxT) clearTimeout(this.fxT);
    this.fx.set(true);
    this.fxT = setTimeout(() => this.fx.set(false), 4000);
  }
  /** Al pasar el mouse (o el foco) por un personaje se muestra su texto; la rotación se pausa. */
  private encima = false;
  mirar(i: number) {
    this.encima = true;
    if (this.who() !== i) {
      this.who.set(i);
      if (i === 2) this.nibiFx();
    }
  }
  /** Al salir, sigue la rotación automática (si no se eligió uno con clic). */
  soltar() {
    this.encima = false;
  }
  greet(i: number) {
    this.who.set(i);
    this.auto.set(false);
    this.fx.set(false);
    if (i === 2) this.nibiFx();
  }
}
