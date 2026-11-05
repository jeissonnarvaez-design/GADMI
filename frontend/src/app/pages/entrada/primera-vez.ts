import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '../../core/models/models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PreferencesService } from '../../core/services/preferences.service';
import { ObjetivoCurso } from '../../shared/objetivo-curso';

const P: [keyof Preferences, string, string][] = [
  ['subtitulos', 'Subtítulos', 'M3 6h18v12H3zM7 13h4M13 13h4M7 10h10'],
  ['voz', 'Voz', 'M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13'],
  ['textoGrande', 'Texto grande', 'M4 20l6-16 6 16M6.5 14h7M17 20l2.5-7 2.5 7'],
  ['altoContraste', 'Alto contraste', 'M12 3a9 9 0 1 0 0 18zM12 3a9 9 0 0 1 0 18'],
  ['menosMovimiento', 'Menos movimiento', 'M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4'],
];

/** Primera vez (PrimeraVez.dc.html): objetivo del curso, privacidad y preferencias (3 pasos). */
@Component({
  selector: 'app-primera-vez',
  imports: [ObjetivoCurso],
  template: `
    <div style="min-height: 100vh; background: #FBF5EC; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 32px; box-sizing: border-box; gap: 24px; font-family: 'DM Sans', Arial, sans-serif; color: #231417">
      <div style="display: flex; gap: 8px" [attr.aria-label]="'Paso ' + (step() + 1) + ' de 3'">
        <span style="width: 60px; height: 6px; border-radius: 999px; background: #AC0B32"></span>
        <span style="width: 60px; height: 6px; border-radius: 999px" [style.background]="step() >= 1 ? '#AC0B32' : '#E2D6C8'"></span>
        <span style="width: 60px; height: 6px; border-radius: 999px" [style.background]="step() === 2 ? '#AC0B32' : '#E2D6C8'"></span>
      </div>

      @if (step() === 0) {
        <app-objetivo-curso (ok)="step.set(1)" />
      }

      @if (step() === 1) {
        <section class="up" style="width: 100%; max-width: 680px; background: #FFFFFF; border-radius: 28px; padding: 36px; box-sizing: border-box; display: flex; flex-direction: column; gap: 20px">
          <h1 style="margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.02em; color: #231417">Tus datos, cuidados</h1>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px">
            @for (d of data; track d) {
              <div style="display: flex; align-items: center; gap: 10px; padding: 14px; border-radius: 16px; background: #FBF5EC; font-size: 15px; font-weight: 600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F7E44" stroke-width="2.6" aria-hidden="true"><path d="M5 12l5 5 9-10"></path></svg>{{ d }}</div>
            }
          </div>
          <p style="margin: 0; font-size: 15px; color: #5C4A4D">No guardamos tu documento de identidad. Solo lo necesario para tu progreso y tu certificado.</p>
          <label style="display: flex; gap: 12px; align-items: center; font-size: 16px; font-weight: 600; cursor: pointer">
            <input type="checkbox" [checked]="ok()" (change)="ok.set(!ok())" style="width: 22px; height: 22px; accent-color: #AC0B32">
            Acepto el <a href="#aviso" (click)="$event.preventDefault()">aviso de privacidad</a>
          </label>
          <button type="button" (click)="ok() && step.set(2)" [disabled]="!ok()" [style.background]="ok() ? '#AC0B32' : '#C9B8A6'" style="min-height: 54px; border-radius: 999px; border: none; color: #FFFFFF; font-weight: 800; font-size: 17px; cursor: pointer">Siguiente</button>
        </section>
      }

      @if (step() === 2) {
        <section class="up" style="width: 100%; max-width: 820px; display: flex; flex-direction: column; gap: 22px; align-items: center">
          <h1 style="margin: 0; font-size: 34px; font-weight: 800; letter-spacing: -0.02em; color: #231417">¿Cómo quieres jugar?</h1>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; width: 100%">
            @for (p of opts; track p[0]) {
              @let on = prefs.prefs()[p[0]];
              <button type="button" class="opt" (click)="prefs.toggle(p[0])" [attr.aria-pressed]="on ? 'true' : 'false'"
                [style.border]="'2px solid ' + (on ? '#AC0B32' : '#EADFD0')" [style.background]="on ? '#AC0B32' : '#FFFFFF'" [style.color]="on ? '#FFFFFF' : '#231417'"
                style="min-height: 150px; border-radius: 22px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 12px">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" [attr.stroke]="on ? '#FFFFFF' : '#231417'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="p[2]"></path></svg>
                <span style="font-size: 16px; font-weight: 800">{{ p[1] }}</span>
              </button>
            }
          </div>
          <p style="margin: 0; font-size: 15px; color: #5C4A4D">Puedes cambiarlo cuando quieras desde el botón Accesibilidad.</p>
          <button type="button" (click)="listo()" style="display: inline-flex; align-items: center; min-height: 56px; padding: 0 40px; border-radius: 999px; background: #AC0B32; color: #FFFFFF; font-weight: 800; font-size: 17px; border: none; cursor: pointer">Listo</button>
        </section>
      }
    </div>
  `,
  styles: `
    a{color:#8A1428} a:focus-visible,input:focus-visible,button:focus-visible{outline:3px solid #231417;outline-offset:2px} button{font-family:inherit}
    @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
    .up{animation:up .45s cubic-bezier(.2,.7,.2,1) both}
    .opt{transition:transform .15s}.opt:hover{transform:translateY(-3px)}
    @media (prefers-reduced-motion: reduce){.up{animation:none}.opt{transition:none}}
  `,
})
export class PrimeraVezPage {
  prefs = inject(PreferencesService);
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);
  step = signal(0);
  ok = signal(false);
  readonly data = ['Nombre', 'Código estudiantil', 'Correo institucional', 'Tu progreso'];
  readonly opts = P;

  listo() {
    const now = new Date().toISOString();
    this.auth.updateStudent({ aceptaPrivacidad: now, preferencias: this.prefs.prefs() });
    if (this.auth.token()) this.api.saveOnboarding({ aceptaPrivacidad: now, preferencias: this.prefs.prefs() }).subscribe();
    this.router.navigate(['/bienvenida']);
  }
}
