import { Component, ElementRef, inject, input, signal, viewChild, afterNextRender, Injector } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Accesibilidad } from './accesibilidad';

/**
 * Encabezado flotante del rediseño (HUD): botón circular de mini mapa (78 px, a /ruta)
 * montado sobre una cápsula con el rótulo y el título; en el centro, lo que la pantalla
 * proyecte con [centro] (barra de pasos/intentos); a la derecha, los granos y Accesibilidad.
 * Si `salida` trae un mensaje, el mini mapa pregunta antes de salir (guardado por paso).
 */
@Component({
  selector: 'app-hud',
  imports: [RouterLink, Accesibilidad],
  template: `
    <header class="hud" [style.padding]="pad()" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; background: transparent; color: #FBF5EC">
      <div style="display: flex; align-items: center; gap: 14px; min-width: 0">
        @if (!mini()) {
          <!-- Sin mini mapa: solo la cápsula (bitácora y temporada) -->
        } @else if (salida()) {
          <a [attr.href]="mapa()" (click)="irAlMapa($event)" aria-label="Ir al mapa" title="Ir al mapa" class="mini" style="position: relative; z-index: 2; display: block; width: 78px; height: 78px; border-radius: 999px; border: 4px solid #FBF5EC; box-shadow: 0 0 0 4px #5A2230, 4px 4px 0 4px #8A1428; overflow: hidden; box-sizing: border-box; flex-shrink: 0"><svg width="70" height="70" viewBox="0 0 44 44" aria-hidden="true" style="display: block"><rect width="44" height="44" fill="#EEF2DF"></rect><path d="M0 0h12c-4 10 4 18-2 28-3 6 0 12-2 16H0z" fill="#BFDCE4"></path><path d="M16 32L22 22L34 16M22 22L30 32" stroke="#D9C3A5" stroke-width="3" fill="none" stroke-linecap="round"></path><circle cx="16" cy="32" r="3" fill="#3F7E44"></circle><circle cx="34" cy="16" r="3" fill="#8A1428"></circle><circle cx="30" cy="32" r="3" fill="#9A5B2E"></circle><path d="M22 24c-3-3-4-5-4-7a4 4 0 0 1 8 0c0 2-1 4-4 7z" fill="#AC0B32" stroke="#FFFFFF" stroke-width="1.2"></path></svg></a>
        } @else {
          <a [routerLink]="mapa()" aria-label="Ir al mapa" title="Ir al mapa" class="mini" style="position: relative; z-index: 2; display: block; width: 78px; height: 78px; border-radius: 999px; border: 4px solid #FBF5EC; box-shadow: 0 0 0 4px #5A2230, 4px 4px 0 4px #8A1428; overflow: hidden; box-sizing: border-box; flex-shrink: 0"><svg width="70" height="70" viewBox="0 0 44 44" aria-hidden="true" style="display: block"><rect width="44" height="44" fill="#EEF2DF"></rect><path d="M0 0h12c-4 10 4 18-2 28-3 6 0 12-2 16H0z" fill="#BFDCE4"></path><path d="M16 32L22 22L34 16M22 22L30 32" stroke="#D9C3A5" stroke-width="3" fill="none" stroke-linecap="round"></path><circle cx="16" cy="32" r="3" fill="#3F7E44"></circle><circle cx="34" cy="16" r="3" fill="#8A1428"></circle><circle cx="30" cy="32" r="3" fill="#9A5B2E"></circle><path d="M22 24c-3-3-4-5-4-7a4 4 0 0 1 8 0c0 2-1 4-4 7z" fill="#AC0B32" stroke="#FFFFFF" stroke-width="1.2"></path></svg></a>
        }
        <div class="capsula" [class.sola]="!mini()" [style.padding]="mini() ? capPad() : '10px 40px'" [style.margin-left]="mini() ? '-44px' : '0'" [style.border-radius]="mini() ? '0 999px 999px 0' : '999px'" style="display: flex; flex-direction: column; gap: 4px; background: #2A0B12; min-width: 0"><span class="px" style="font-size: 10px; color: #FF836C">{{ kicker() }}</span><span style="font-size: 18px; font-weight: 800">{{ title() }}</span></div>
      </div>
      <ng-content select="[centro]" />
      <div style="display: flex; align-items: center; gap: 10px">
        @if (granos(); as g) {
          <span class="px" [attr.aria-label]="g + ' granos'" style="height: 44px; box-sizing: border-box; margin-right: 10px; display: flex; align-items: center; gap: 8px; padding: 0 14px; border: 2px solid #FFD3C9; border-radius: 6px; font-size: 10px; background-color: #FFD3C9"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="7" ry="9" fill="#9A5B2E" transform="rotate(-20 12 12)"></ellipse><path d="M13 4c-2 5-2 11-3 16" stroke="#FF836C" stroke-width="1.5" fill="none"></path></svg><span style="color: #231417">{{ g }}</span></span>
        }
        <ng-content />
        <app-accesibilidad tone="dark" />
      </div>
    </header>

    @if (preguntar()) {
      <div class="velo" (click)="preguntar.set(false)">
        <div #dlg role="alertdialog" aria-modal="true" aria-labelledby="hud-salir" class="gpanel" (click)="$event.stopPropagation()" style="background: #FFFFFF; color: #231417; padding: 20px 22px; max-width: 420px; width: calc(100vw - 48px); box-sizing: border-box; display: flex; flex-direction: column; gap: 14px">
          <p id="hud-salir" style="margin: 0; font-size: 17px; font-weight: 700; line-height: 1.4">{{ salida() }}</p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end">
            <button type="button" (click)="preguntar.set(false)" style="min-height: 46px; padding: 0 16px; border-radius: 6px; border: 2px solid #FF836C; background: transparent; color: #8A1428; font-weight: 800; font-size: 15px; cursor: pointer">Seguir aquí</button>
            <button type="button" class="gbtn" (click)="salir()" style="min-height: 46px; padding: 0 18px; border: none; background: #FF836C; color: #1A0609; font-weight: 800; font-size: 15px; cursor: pointer">Ir al mapa</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .mini:focus-visible{outline:3px solid #FF836C;outline-offset:6px}
    .velo{position:fixed;inset:0;z-index:900;background:rgba(26,6,9,.75);display:flex;align-items:center;justify-content:center}
    button{font-family:inherit} button:focus-visible{outline:3px solid #231417;outline-offset:2px}
    @media (max-width: 640px){ .hud{padding:14px 16px 6px !important} .capsula:not(.sola){padding:8px 18px 8px 50px !important} }
  `,
})
export class Hud {
  kicker = input.required<string>();
  title = input.required<string>();
  /** 'reto' (padding compacto) o 'modulo' (intro de módulo). */
  variant = input<'reto' | 'modulo'>('reto');
  granos = input<string | null>(null);
  mapa = input('/ruta');
  /** false = sin el botón de mini mapa (bitácora y temporada). */
  mini = input(true);
  /** Mensaje para confirmar la salida (p. ej. «Tu avance hasta el paso 2 está guardado. ¿Volver al mapa?»). */
  salida = input<string | null>(null);
  preguntar = signal(false);
  pad = () => (this.variant() === 'modulo' ? '20px 48px 6px' : '18px 28px 6px');
  capPad = () => (this.variant() === 'modulo' ? '10px 44px 10px 54px' : '8px 22px 8px 42px');
  private router = inject(Router);
  private injector = inject(Injector);
  private host = inject(ElementRef);

  irAlMapa(e: Event) {
    if (!this.salida()) return;
    e.preventDefault();
    this.preguntar.set(true);
    afterNextRender(() => this.host.nativeElement.querySelector('[role=alertdialog] button')?.focus(), { injector: this.injector });
  }
  salir() {
    this.preguntar.set(false);
    this.router.navigateByUrl(this.mapa());
  }
}
