import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Personaje, Who } from '../shared/personaje';

/** Panel de cierre de un reto (diseño de Ejercicio11). */
@Component({
  selector: 'app-reto-end',
  imports: [RouterLink, Personaje],
  template: `
    <div class="pop gpanel" aria-live="polite" style="width: min(100%, 720px); background: #8A1428; color: #FFFFFF; border-radius: 28px; padding: 32px; display: flex; flex-wrap: wrap; align-items: center; gap: 24px; box-sizing: border-box">
      <app-personaje [who]="who()" [size]="150" />
      <div style="flex: 1 1 280px; display: flex; flex-direction: column; gap: 10px">
        <span style="font-size: 34px; font-weight: 800; line-height: 1.05">{{ title() }}</span>
        <span style="font-size: 18px; color: #FBF5EC">{{ line() }}</span>
        @if (note()) { <span style="font-size: 15px; color: #FFD3C9">{{ note() }}</span> }
        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px">
          @if (canRetry()) {
            <button type="button" (click)="retry.emit()" style="min-height: 50px; padding: 0 22px; border-radius: 999px; border: 2px solid #FFFFFF; background: transparent; color: #FFFFFF; font-weight: 800; font-size: 16px; cursor: pointer">{{ retryLabel() }}</button>
          }
          <a class="gbtn" [routerLink]="next()" style="display: inline-flex; align-items: center; min-height: 50px; padding: 0 22px; border-radius: 999px; background: #FFFFFF; color: #8A1428; font-weight: 800; font-size: 16px; text-decoration: none">{{ nextLabel() }}</a>
          <a routerLink="/ruta" style="display: inline-flex; align-items: center; min-height: 50px; padding: 0 16px; color: #FFFFFF; font-weight: 700; font-size: 15px">Volver a la ruta</a>
        </div>
      </div>
    </div>
  `,
  styles: `
    @keyframes pop{0%{opacity:0;transform:scale(.6)}70%{transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
    .pop{animation:pop .45s cubic-bezier(.2,.7,.2,1) both}
    a{color:#FFFFFF} a:focus-visible,button:focus-visible{outline:3px solid #FF836C;outline-offset:3px}
    @media (prefers-reduced-motion: reduce){.pop{animation:none}}
  `,
})
export class RetoEnd {
  who = input<Who>('teo');
  title = input.required<string>();
  line = input.required<string>();
  note = input('');
  canRetry = input(false);
  retryLabel = input('Segundo intento');
  next = input.required<string>();
  nextLabel = input.required<string>();
  retry = output<void>();
}
