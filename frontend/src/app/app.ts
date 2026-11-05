import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { PreferencesService } from './core/services/preferences.service';
import { ProgressService } from './core/services/progress.service';

/** Contenedor: cada pantalla trae su propia barra superior (diseño). */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <a class="skip" href="#main">Saltar al contenido</a>
    @if (auth.offline()) {
      <p class="offline" role="status">Modo sin conexión: tu progreso se guarda solo en este navegador.</p>
    } @else if (auth.rol() === 'estudiante' && progress.apiOnline() === false) {
      <p class="offline" role="status">Se perdió la conexión con la API. El progreso se guarda en este navegador.</p>
    }
    <main id="main" tabindex="-1"><router-outlet /></main>
  `,
  styles: `
    .skip { position: absolute; left: -999px; top: 0; background: #fff; color: #231417; padding: .5rem 1rem; z-index: 100; border-radius: 999px; }
    .skip:focus { left: 1rem; top: .5rem; }
    .offline { margin: 0; background: #FFE3DC; color: #8A1428; text-align: center; padding: .35rem; font-size: .85rem; font-weight: 700; font-family: 'DM Sans', Arial, sans-serif; }
    main:focus { outline: none; }
  `,
})
export class App {
  protected auth = inject(AuthService);
  protected progress = inject(ProgressService);
  // Aplica las preferencias de accesibilidad desde el inicio.
  private prefs = inject(PreferencesService);
}
