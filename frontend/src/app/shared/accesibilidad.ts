import { Component, ElementRef, HostListener, computed, inject, input, signal } from '@angular/core';
import { Preferences } from '../core/models/models';
import { PreferencesService } from '../core/services/preferences.service';

const DEFS: [keyof Preferences, string][] = [
  ['subtitulos', 'Subtítulos'],
  ['voz', 'Voz'],
  ['textoGrande', 'Texto grande'],
  ['altoContraste', 'Alto contraste'],
  ['menosMovimiento', 'Menos movimiento'],
];

/** Menú de accesibilidad (Accesibilidad.dc.html). Las preferencias son globales. */
@Component({
  selector: 'app-accesibilidad',
  template: `
    <div style="position: relative; display: inline-block; font-family: 'DM Sans', Arial, sans-serif">
      <button type="button" (click)="open.set(!open())" [attr.aria-expanded]="open() ? 'true' : 'false'" aria-label="Accesibilidad"
        [style.border]="'1.5px solid ' + bd()" [style.background]="bg()" [style.color]="fg()"
        style="height: 44px; padding: 0 14px; border-radius: 999px; display: flex; align-items: center; gap: 8px; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 700">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" [attr.stroke]="fg()" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="4" r="2"></circle><path d="M4 8l8 2 8-2M12 10v5l-3 6M12 15l3 6"></path></svg>
        Accesibilidad
      </button>
      @if (open()) {
        <div role="group" aria-label="Opciones de accesibilidad" style="position: absolute; right: 0; top: 52px; z-index: 50; width: 290px; background: #FFFFFF; color: #231417; border-radius: 18px; padding: 10px; box-shadow: 0 18px 40px rgba(0,0,0,0.25); display: flex; flex-direction: column">
          @for (o of defs; track o[0]) {
            <label style="display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 48px; padding: 0 10px; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 600">
              <span>{{ o[1] }}</span>
              <input type="checkbox" [checked]="prefs.prefs()[o[0]]" (change)="prefs.toggle(o[0])" style="width: 20px; height: 20px; accent-color: #AC0B32">
            </label>
          }
          <!-- Opciones extra de la pantalla (p. ej. «Repetir recorrido» en la Ruta) -->
          <ng-content />
        </div>
      }
    </div>
  `,
  host: { style: 'display: inline-block' },
})
export class Accesibilidad {
  tone = input<'light' | 'dark'>('light');
  prefs = inject(PreferencesService);
  open = signal(false);
  readonly defs = DEFS;
  private host = inject(ElementRef);
  private dark = computed(() => this.tone() === 'dark');
  bg = computed(() => (this.dark() ? 'rgba(0,0,0,0.25)' : '#FFFFFF'));
  fg = computed(() => (this.dark() ? '#FFFFFF' : '#231417'));
  bd = computed(() => (this.dark() ? 'rgba(255,255,255,0.5)' : '#EADFD0'));

  @HostListener('document:click', ['$event'])
  onDoc(e: MouseEvent) {
    if (this.open() && !this.host.nativeElement.contains(e.target)) this.open.set(false);
  }
  @HostListener('document:keydown.escape')
  onEsc() {
    this.open.set(false);
  }
  close() {
    this.open.set(false);
  }
}
