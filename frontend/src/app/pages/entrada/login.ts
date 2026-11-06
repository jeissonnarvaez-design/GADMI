import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Student } from '../../core/models/models';
import { ApiService, apiError } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PreferencesService } from '../../core/services/preferences.service';
import { Accesibilidad } from '../../shared/accesibilidad';
import { LogoUao } from '../../shared/logo-uao';
import { Personaje } from '../../shared/personaje';

type Rol = 'docente' | 'estudiante';

/**
 * Ingreso de respaldo (Login.dc.html). Conserva los dos ingresos separados:
 * 1 · Docente y 2 · Estudiante (este último puede crear su cuenta).
 */
@Component({
  selector: 'app-login',
  imports: [FormsModule, Accesibilidad, Personaje, LogoUao],
  template: `
    <div style="min-height: 100vh; display: flex; flex-wrap: wrap; background: #FBF5EC; font-family: 'DM Sans', Arial, sans-serif; color: #231417">
      <section style="flex: 1 1 520px; min-height: 100vh; background: #8A1428; color: #FFFFFF; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 40px; box-sizing: border-box">
        <img src="/assets/fondo-cacao.jpg" alt="" aria-hidden="true" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.22">
        <div aria-hidden="true" style="position: absolute; inset: 0; background: rgba(138,20,40,0.78)"></div>
        <span style="position: relative; align-self: flex-start; background: #FFFFFF; border-radius: 999px; padding: 8px 16px; display: inline-flex"><app-logo-uao /></span>
        <div style="position: relative; display: flex; flex-direction: column; line-height: 0.9">
          <span style="font-size: 104px; font-weight: 800; letter-spacing: -0.05em">GADMI</span>
          <span style="font-size: 34px; font-weight: 700; color: #FFD3C9; margin-top: 8px">Sost-Empresarial</span>
        </div>
        <!-- Personajes agrupados sobre una colina -->
        <div aria-hidden="true" class="colina" style="position: relative; height: 250px; margin: 0 -40px -40px; display: flex; align-items: flex-end; justify-content: center">
          <svg viewBox="0 0 600 110" preserveAspectRatio="none" style="position: absolute; left: 0; bottom: 0; width: 100%; height: 110px"><path d="M0 70 Q300 -10 600 70 V110 H0z" fill="#5E0F1E"></path><path d="M0 70 Q300 -10 600 70" fill="none" stroke="#FF836C" stroke-width="3" opacity="0.5"></path></svg>
          <div class="pj-fila" style="position: relative; display: flex; align-items: flex-end; margin-bottom: 52px">
            <div style="position: relative; margin-right: -14px; margin-bottom: -6px"><span style="position: absolute; left: 15%; right: 15%; bottom: -4px; height: 14px; border-radius: 999px; background: rgba(0,0,0,0.3)"></span><app-personaje who="chispa" [size]="124" /></div>
            <div style="position: relative; z-index: 1; margin-bottom: 12px"><span style="position: absolute; left: 15%; right: 15%; bottom: -4px; height: 16px; border-radius: 999px; background: rgba(0,0,0,0.3)"></span><app-personaje who="teo" [size]="184" /></div>
            <div style="position: relative; margin-left: -14px; margin-bottom: -6px"><span style="position: absolute; left: 15%; right: 15%; bottom: -4px; height: 14px; border-radius: 999px; background: rgba(0,0,0,0.3)"></span><app-personaje who="nibi" [size]="132" /></div>
          </div>
        </div>
      </section>

      <section style="flex: 1 1 480px; display: flex; flex-direction: column; justify-content: center; padding: 40px; box-sizing: border-box; position: relative">
        <div class="acc-login" style="position: absolute; right: 32px; top: 28px"><app-accesibilidad tone="light" /></div>
        <form (ngSubmit)="submit()" novalidate style="width: 100%; max-width: 400px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px">
          <div role="tablist" aria-label="¿Quién ingresa?" style="display: flex; gap: 6px; padding: 5px; border-radius: 999px; background: #FFFFFF; align-self: flex-start">
            @for (r of roles; track r.id) {
              <button type="button" role="tab" [attr.aria-selected]="rol() === r.id ? 'true' : 'false'" (click)="setRol(r.id)"
                [style.background]="rol() === r.id ? '#231417' : 'transparent'" [style.color]="rol() === r.id ? '#FFFFFF' : '#231417'"
                style="min-height: 42px; padding: 0 18px; border-radius: 999px; border: none; font-weight: 800; font-size: 14px; cursor: pointer">{{ r.label }}</button>
            }
          </div>
          <h1 style="margin: 0; font-size: 34px; font-weight: 800; letter-spacing: -0.02em; color: #231417">Ingresa</h1>
          <p style="margin: 0; font-size: 16px; color: #5C4A4D">Usa tu correo institucional de la UAO.</p>

          <label style="display: flex; flex-direction: column; gap: 6px; font-size: 15px; font-weight: 700">Correo institucional
            <input type="email" name="correo" autocomplete="email" placeholder="nombre@uao.edu.co" [(ngModel)]="correo" style="min-height: 52px; border-radius: 14px; border: 1.5px solid #D9CBBB; padding: 0 16px; font-size: 16px; background: #FFFFFF">
          </label>
          <label style="display: flex; flex-direction: column; gap: 6px; font-size: 15px; font-weight: 700">Contraseña
            <input type="password" name="password" autocomplete="current-password" [(ngModel)]="password" style="min-height: 52px; border-radius: 14px; border: 1.5px solid #D9CBBB; padding: 0 16px; font-size: 16px; background: #FFFFFF">
          </label>
          @if (error()) { <p role="alert" style="margin: 0; padding: 12px 14px; border-radius: 14px; background: #FFE3DC; color: #8A1428; font-weight: 700; font-size: 14px">{{ error() }}</p> }
          <button type="submit" [disabled]="loading()" style="display: flex; align-items: center; justify-content: center; min-height: 54px; border-radius: 999px; background: #AC0B32; color: #FFFFFF; font-weight: 800; font-size: 17px; border: none; cursor: pointer">{{ loading() ? 'Un momento…' : 'Ingresar' }}</button>
          @if (offline() && rol() === 'estudiante') {
            <button type="button" (click)="enterOffline()" style="min-height: 48px; border-radius: 999px; border: 2px solid #AC0B32; background: #FFFFFF; color: #AC0B32; font-weight: 800; font-size: 15px; cursor: pointer">Continuar sin conexión (solo este navegador)</button>
          }
          <a href="#recuperar" (click)="$event.preventDefault(); forgot.set(true)" style="font-size: 14px; align-self: center">¿Olvidaste tu contraseña?</a>
          @if (forgot()) { <span role="status" style="font-size: 13px; color: #5C4A4D; align-self: center; text-align: center">Pide a tu docente o a soporte que restablezca tu contraseña.</span> }
          <p style="margin: 8px 0 0; padding: 14px 16px; border-radius: 14px; background: #FFFFFF; font-size: 14px; color: #3D2C2F">Las cuentas se crean desde el curso en Moodle con tu correo institucional. Si entras desde Moodle, te reconocemos automáticamente y no necesitas esta pantalla.</p>
        </form>
      </section>
    </div>
  `,
  styles: `
    a{color:#8A1428} a:focus-visible,input:focus-visible,button:focus-visible{outline:3px solid #231417;outline-offset:2px} input,button{font-family:inherit}
    @media (max-width: 640px){
      .acc-login{position:static !important;display:flex;justify-content:flex-end;margin:-16px 0 18px}
      .pj-fila{transform:scale(.78);transform-origin:center bottom}.colina{height:200px !important}
    }
  `,
})
export class LoginPage {
  /** Rol preseleccionado desde la ruta (/ingreso/docente o /ingreso/estudiante). */
  preset = input<Rol | undefined>(undefined, { alias: 'rol' });
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private prefs = inject(PreferencesService);
  private router = inject(Router);
  readonly roles: { id: Rol; label: string }[] = [
    { id: 'docente', label: '1 · Docente' },
    { id: 'estudiante', label: '2 · Estudiante' },
  ];
  rol = signal<Rol>('estudiante');
  correo = '';
  password = '';
  error = signal('');
  loading = signal(false);
  offline = signal(false);
  forgot = signal(false);

  ngOnInit() {
    if (this.preset()) this.rol.set(this.preset()!);
  }

  setRol(r: Rol) {
    this.rol.set(r);
    this.error.set('');
  }

  private validate(): string {
    if (!/^[^@\s]+@uao\.edu\.co$/i.test(this.correo.trim())) return 'Usa tu correo institucional (@uao.edu.co).';
    if (!this.password) return 'Escribe tu contraseña.';
    return '';
  }

  submit() {
    const v = this.validate();
    this.error.set(v);
    if (v) return;
    this.loading.set(true);
    const fail = (e: unknown) => {
      this.loading.set(false);
      const err = apiError(e);
      this.offline.set(err.offline);
      this.error.set(err.message);
    };
    if (this.rol() === 'docente') {
      this.api.loginDocente(this.correo.trim(), this.password).subscribe({
        next: (r) => {
          this.auth.set({ rol: 'docente', token: r.token, docente: r.docente });
          this.router.navigate(['/docente']);
        },
        error: fail,
      });
      return;
    }
    this.api.loginEstudiante(this.correo.trim(), this.password).subscribe({ next: (r) => this.enter(r.estudiante, r.token), error: fail });
  }

  enterOffline() {
    const local: Student = {
      nombre: this.correo.split('@')[0],
      codigo: this.correo.trim().toLowerCase(),
      grupo: '—',
      correo: this.correo.trim().toLowerCase(),
      aceptaPrivacidad: null,
    };
    this.auth.set({ rol: 'estudiante', token: null, estudiante: local, offline: true });
    this.router.navigate(['/conectando']);
  }

  private enter(s: Student, token: string) {
    this.auth.set({ rol: 'estudiante', token, estudiante: s });
    this.prefs.replace(s.preferencias);
    this.router.navigate(['/conectando']);
  }
}
