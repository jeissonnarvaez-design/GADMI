import { Component, ElementRef, HostListener, computed, inject, input, signal } from '@angular/core';
import { Preferences } from '../core/models/models';
import { PreferencesService } from '../core/services/preferences.service';

const DEFS: [keyof Preferences, string, string][] = [
  ['subtitulos', 'Subtítulos', 'M3 6h18v12H3zM7 11h4M13 11h4M7 14h6'],
  ['voz', 'Voz', 'M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7'],
  ['textoGrande', 'Texto grande', 'M4 19L9 5l5 14M6 14h6M15 19l3-8 3 8M16 16h4'],
  ['altoContraste', 'Alto contraste', 'M12 3a9 9 0 1 0 0 18zM12 3a9 9 0 0 1 0 18'],
  ['menosMovimiento', 'Menos movimiento', 'M6 4v16M18 4v16M10 9h4'],
];

/** Menú de accesibilidad (Accesibilidad.dc.html, rediseño). Las preferencias se guardan por estudiante. */
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
        <div class="drop" role="group" aria-label="Opciones de accesibilidad" style="position: absolute; right: 0; top: 54px; z-index: 50; width: 300px; max-width: calc(100vw - 32px); background: #2A0B12; color: #FBF5EC; border: 3px solid #FF836C; border-radius: 8px; box-shadow: 6px 6px 0 #8A1428; padding: 12px; box-sizing: border-box; display: flex; flex-direction: column; gap: 4px">
          <span class="px" style="font-size: 10px; color: #FF836C; padding: 2px 8px 8px">ACCESIBILIDAD</span>
          @for (o of defs; track o[0]) {
            @let on = prefs.prefs()[o[0]];
            <button type="button" class="opt" role="switch" [attr.aria-checked]="on ? 'true' : 'false'" (click)="prefs.toggle(o[0])" style="display: flex; align-items: center; gap: 12px; min-height: 50px; padding: 0 8px; border: none; border-radius: 6px; background: transparent; color: inherit; cursor: pointer; font-family: inherit; font-size: 15px; font-weight: 700; text-align: left">
              <span [style.background]="on ? '#FF836C' : '#4A2A2F'" style="width: 32px; height: 32px; flex-shrink: 0; border-radius: 6px; display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" [attr.stroke]="on ? '#1A0609' : '#FBF5EC'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="o[2]"></path></svg></span>
              <span style="flex: 1">{{ o[1] }}</span>
              <span aria-hidden="true" [style.background]="on ? '#AC0B32' : '#4A2A2F'" [style.border]="'2px solid ' + (on ? '#FF836C' : '#6E5458')" style="width: 44px; height: 24px; flex-shrink: 0; border-radius: 999px; box-sizing: border-box; display: flex; align-items: center; padding: 0 2px"><span class="knob" [style.transform]="'translateX(' + (on ? '20px' : '0px') + ')'" style="width: 16px; height: 16px; border-radius: 999px; background: #FBF5EC"></span></span>
            </button>
          }
          <!-- Opciones extra de la pantalla (p. ej. «Repetir recorrido guiado» en la Ruta) -->
          <ng-content />
        </div>
      }
    </div>
  `,
  styles: `
    .opt:hover { background: rgba(255,131,108,0.12) !important; }
    .opt:focus-visible { outline: 3px solid #FF836C; outline-offset: 2px; }
    .knob { transition: transform .18s; }
    @keyframes drop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
    .drop { animation: drop .18s ease both; }
    @media (prefers-reduced-motion: reduce) { .knob { transition: none; } .drop { animation: none; } }
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
