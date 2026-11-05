import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Accesibilidad } from './accesibilidad';

/** Barra superior bordó del estilo videojuego (línea coral de 3 px y rótulo .px). */
@Component({
  selector: 'app-game-header',
  imports: [RouterLink, Accesibilidad],
  template: `
    <header style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 28px; background: #2A0B12; border-bottom: 3px solid #FBF5EC; color: #FBF5EC">
      <div style="display: flex; align-items: center; gap: 14px">
        @if (back()) {
          <a [routerLink]="back()" aria-label="Volver" style="display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: 2px solid #FBF5EC; border-radius: 6px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FBF5EC" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"></path></svg></a>
        }
        <ng-content select="[start]" />
        <div style="display: flex; flex-direction: column; gap: 6px"><span class="px" style="font-size: 10px; color: #FBF5EC">{{ kicker() }}</span><span style="font-size: 18px; font-weight: 800">{{ title() }}</span></div>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap">
        <ng-content />
        <app-accesibilidad tone="dark" />
      </div>
    </header>
  `,
  styles: `a:focus-visible { outline:3px solid #FBF5EC;outline-offset:3px;box-shadow:0 0 0 6px #231417; }`,
})
export class GameHeader {
  back = input<string | null>(null);
  kicker = input.required<string>();
  title = input.required<string>();
}
