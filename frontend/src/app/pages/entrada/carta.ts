import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Accesibilidad } from '../../shared/accesibilidad';
import { Personaje } from '../../shared/personaje';

const TEXT = 'Te nombramos gerente general. Haz crecer la empresa sin dañar a nadie.';

/** Carta de la junta (Carta.dc.html): nombramiento con toque de videojuego. */
@Component({
  selector: 'app-carta',
  imports: [Accesibilidad, Personaje],
  template: `
    <div style="min-height: 100vh; background: #1A0609; position: relative; overflow: hidden; display: flex; flex-direction: column; font-family: 'DM Sans', Arial, sans-serif; color: #FBF5EC">
      <div aria-hidden="true" style="position: absolute; inset: 0; background-image: linear-gradient(rgba(255,131,108,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,131,108,0.06) 1px, transparent 1px); background-size: 32px 32px"></div>
      @for (s of stars; track $index) { <span class="tw" aria-hidden="true" style="position: absolute; width: 4px; height: 4px; background: #FF836C" [style.left]="s.x" [style.top]="s.y" [style.animation-delay]="s.d"></span> }

      <header style="position: relative; display: flex; justify-content: space-between; align-items: center; padding: 18px 32px">
        <span class="px" style="font-size: 11px; color: #FF836C; letter-spacing: 0.08em">AÑO 2026 · CACAO RAÍZ</span>
        <app-accesibilidad tone="dark" />
      </header>

      <main style="position: relative; flex: 1; display: flex; align-items: center; justify-content: center; gap: 36px; padding: 0 32px 40px; flex-wrap: wrap">
        <div style="align-self: center"><app-personaje who="teo" [size]="210" /></div>

        <article class="in" style="position: relative; width: 600px; max-width: 100%; box-sizing: border-box; background: #2A0B12; border: 4px solid #FF836C; border-radius: 6px; box-shadow: 8px 8px 0 #8A1428, 0 30px 60px rgba(0,0,0,0.5); padding: 30px 32px 26px; display: flex; flex-direction: column; gap: 16px">
          <span class="px" style="position: absolute; top: -16px; left: 22px; background: #FF836C; color: #1A0609; font-size: 11px; padding: 8px 10px">NUEVA MISIÓN</span>
          <span style="font-size: 13px; font-weight: 800; letter-spacing: 0.12em; color: #FFD3C9">DE: LA JUNTA DIRECTIVA</span>
          <h1 style="margin: 0; font-size: 34px; line-height: 1.12; font-weight: 800; letter-spacing: -0.01em; min-height: 76px; color: #FBF5EC" [attr.aria-label]="text">{{ typed() }}<span class="blink" aria-hidden="true" style="color: #FF836C">▌</span></h1>

          <label style="display: flex; flex-direction: column; gap: 8px">
            <span class="px" style="font-size: 10px; color: #FFD3C9; margin-bottom: 2px">NOMBRE DEL GERENTE</span>
            <input type="text" [value]="name()" (input)="name.set($any($event.target).value)" style="min-height: 50px; border: 3px solid #FBF5EC; border-radius: 4px; background: #1A0609; color: #FBF5EC; font-size: 20px; font-weight: 700; padding: 0 14px">
          </label>

          <div style="height: 70px; border-bottom: 2px dashed rgba(251,245,236,0.4); display: flex; align-items: flex-end; justify-content: center">
            @if (signed()) {
              <svg width="240" height="64" viewBox="0 0 260 70" role="img" [attr.aria-label]="'Firma de ' + name()"><path class="draw" d="M10 52 C 30 8, 50 8, 52 44 S 80 62, 95 26 S 120 18, 130 48 C 140 66, 160 18, 175 36 S 210 54, 250 26" fill="none" stroke="#FF836C" stroke-width="4" stroke-linecap="round"></path></svg>
            }
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center">
            <button type="button" (click)="signed.set(!signed())" [disabled]="name().trim().length < 3" style="min-height: 50px; padding: 0 20px; border: 3px solid #FBF5EC; border-radius: 4px; background: transparent; color: #FBF5EC; font-weight: 800; font-size: 15px; cursor: pointer">{{ signed() ? 'Borrar firma' : 'Firmar' }}</button>
            @if (signed()) {
              <button type="button" class="pop glow" (click)="accept()" style="display: inline-flex; align-items: center; gap: 10px; min-height: 50px; padding: 0 22px; border-radius: 4px; background: #FF836C; color: #1A0609; border: none; cursor: pointer"><span class="px" style="font-size: 12px">▶ ACEPTAR MISIÓN</span></button>
            }
          </div>
        </article>
      </main>
    </div>
  `,
  styles: `
    a{color:#FBF5EC} a:focus-visible,input:focus-visible,button:focus-visible{outline:3px solid #FF836C;outline-offset:3px} input,button{font-family:inherit}
    @keyframes in{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}
    @keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}
    @keyframes twinkle{0%,100%{opacity:.15}50%{opacity:.8}}
    @keyframes draw{from{stroke-dashoffset:600}to{stroke-dashoffset:0}}
    @keyframes pop{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:none}}
    .in{animation:in .5s cubic-bezier(.2,.7,.2,1) both}
    .blink{animation:blink 1s steps(1) infinite}
    .tw{animation:twinkle 3s ease-in-out infinite}
    .draw{stroke-dasharray:600;animation:draw 1.2s ease-out both}
    .pop{animation:pop .35s ease-out both}
    @media (prefers-reduced-motion: reduce){.in,.blink,.tw,.draw,.glow,.pop{animation:none}}
  `,
})
export class CartaPage implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);
  readonly text = TEXT;
  readonly stars = Array.from({ length: 14 }, (_, i) => ({ x: ((i * 37) % 100) + '%', y: ((i * 53) % 100) + '%', d: i * 0.3 + 's' }));
  n = signal(0);
  name = signal(this.auth.student()?.nombre ?? '');
  signed = signal(false);
  typed = computed(() => TEXT.slice(0, this.n()));
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.timer = setInterval(() => (this.n() < TEXT.length ? this.n.update((v) => v + 1) : this.timer && clearInterval(this.timer)), 40);
  }
  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  accept() {
    const now = new Date().toISOString();
    this.auth.updateStudent({ cartaFirmada: now });
    if (this.auth.token()) this.api.saveOnboarding({ cartaFirmada: now }).subscribe();
    this.router.navigate(['/ruta']);
  }
}
