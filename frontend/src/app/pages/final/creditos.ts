import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CREDITOS } from '../../core/data/creditos';
import { LogoUao } from '../../shared/logo-uao';

/** Créditos y licencia (pública). */
@Component({
  selector: 'app-creditos',
  imports: [LogoUao],
  template: `
    <div style="min-height: 100vh; background: #FBF5EC; color: #231417; font-family: 'DM Sans', Arial, sans-serif; padding: 40px 24px; box-sizing: border-box">
      <article style="max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 22px">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap">
          <app-logo-uao size="md" />
          <button type="button" (click)="volver()" style="min-height: 44px; padding: 0 18px; border-radius: 999px; border: 2px solid #8A1428; background: transparent; color: #8A1428; font-weight: 800; font-size: 15px; cursor: pointer; font-family: inherit">← Volver</button>
        </div>
        <header>
          <span class="px" style="font-size: 13px; color: #AC0B32">CRÉDITOS Y LICENCIA</span>
          <h1 style="margin: 4px 0 0; font-size: 32px; font-weight: 800; letter-spacing: -0.02em">{{ c.proyecto }}</h1>
          <p style="margin: 6px 0 0; font-size: 16px; color: #5C4A4D">{{ c.institucion }}</p>
        </header>
        <section aria-labelledby="eq">
          <h2 id="eq" style="margin: 0 0 8px; font-size: 20px; color: #8A1428">Equipo</h2>
          @for (e of c.equipo; track e.rol) {
            <p style="margin: 0 0 6px; font-size: 16px"><strong>{{ e.rol }}:</strong> {{ e.nombres.join(', ') }}</p>
          }
        </section>
        <section aria-labelledby="fu">
          <h2 id="fu" style="margin: 0 0 8px; font-size: 20px; color: #8A1428">Fuentes tipográficas</h2>
          <ul style="margin: 0; padding-left: 20px; font-size: 16px; line-height: 1.6">
            @for (f of c.fuentes; track f.nombre) { <li>{{ f.nombre }} · {{ f.origen }} · {{ f.licencia }}</li> }
          </ul>
        </section>
        <section aria-labelledby="im">
          <h2 id="im" style="margin: 0 0 8px; font-size: 20px; color: #8A1428">Imágenes</h2>
          <ul style="margin: 0; padding-left: 20px; font-size: 16px; line-height: 1.6">
            @for (i of c.imagenes; track i) { <li>{{ i }}</li> }
          </ul>
          <p style="margin: 8px 0 0; font-size: 15px; color: #5C4A4D">Software: {{ c.software }}</p>
        </section>
        <section aria-labelledby="li" style="background: #FFFFFF; border-radius: 16px; padding: 18px 20px">
          <h2 id="li" style="margin: 0 0 6px; font-size: 20px; color: #8A1428">Licencia</h2>
          <p style="margin: 0 0 6px; font-size: 16px; font-weight: 700">{{ c.licencia.nombre }}</p>
          <p style="margin: 0 0 10px; font-size: 15px; color: #3D2C2F">{{ c.licencia.resumen }}</p>
          <a [href]="c.licencia.url" target="_blank" rel="noopener" style="color: #8A1428; font-weight: 700">Ver la licencia completa</a>
        </section>
      </article>
    </div>
  `,
  styles: `a:focus-visible,button:focus-visible{outline:3px solid #231417;outline-offset:2px}`,
})
export class CreditosPage {
  readonly c = CREDITOS;
  private location = inject(Location);
  volver() {
    this.location.back();
  }
}
