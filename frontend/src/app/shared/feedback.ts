import { Component, computed, input } from '@angular/core';
import { Personaje } from './personaje';

/**
 * Mensaje de retroalimentación de los retos (diseño final): panel de 52 px, Chispa grande
 * (78 px) sobresaliendo arriba a la izquierda, círculo ✓ (verde) o ↺ (vino), título en negrita,
 * línea divisoria fina y descripción a la derecha.
 */
@Component({
  selector: 'app-feedback',
  imports: [Personaje],
  template: `
    <div class="gpanel fb" aria-live="polite" [style.background]="ok() ? '#EAF4E6' : '#FFF0EC'"
      style="position: relative; height: 52px; box-sizing: border-box; display: flex; align-items: center; gap: 16px; padding: 0 18px 0 92px; overflow: visible">
      <span style="position: absolute; left: 6px; bottom: -4px; display: block; line-height: 0"><app-personaje who="chispa" [size]="78" [mood]="ok() ? 'happy' : 'mid'" /></span>
      <span aria-hidden="true" [style.background]="color()" style="width: 26px; height: 26px; flex-shrink: 0; border-radius: 999px; color: #FFFFFF; font-size: 14px; font-weight: 800; display: flex; align-items: center; justify-content: center">{{ ok() ? '✓' : '↺' }}</span>
      <strong [style.color]="color()" style="flex-shrink: 0; font-size: 17px">{{ titulo() }}</strong>
      @if (texto()) {
        <span aria-hidden="true" style="width: 2px; height: 28px; flex-shrink: 0; background: rgba(35,20,23,0.15)"></span>
        <span style="min-width: 0; font-size: 15px; font-weight: 600; line-height: 1.3; color: #3D2C2F">{{ texto() }}</span>
      }
    </div>
  `,
  styles: `
    :host { display: block; flex: 1 1 420px; min-width: 0; }
    @media (max-width: 700px) {
      .fb { height: auto !important; min-height: 52px; flex-wrap: wrap; gap: 4px 10px !important; padding: 8px 12px 8px 72px !important; }
      .fb > span:first-child { left: 0 !important; }
      .fb > span:nth-child(4) { display: none !important; }
    }
  `,
})
export class Feedback {
  ok = input(false);
  titulo = input('');
  texto = input('');
  color = computed(() => (this.ok() ? '#2C5E31' : '#8A1428'));
}
