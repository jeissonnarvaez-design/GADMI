import { Component, input } from '@angular/core';

/** Contador de «granos» (puntos) de la barra superior de juego. */
@Component({
  selector: 'app-granos',
  template: `<span class="px" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 2px solid #FBF5EC; border-radius: 6px; font-size: 10px; color: #FBF5EC" [attr.aria-label]="label() || (value() + ' granos')"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="7" ry="9" fill="#9A5B2E" transform="rotate(-20 12 12)"></ellipse><path d="M13 4c-2 5-2 11-3 16" stroke="#FBF5EC" stroke-width="1.5" fill="none"></path></svg>{{ value() }}</span>`,
})
export class Granos {
  value = input.required<string | number>();
  label = input('');
}
