import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Student } from '../../core/models/models';
import { ApiService, apiError } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PreferencesService } from '../../core/services/preferences.service';
import { Accesibilidad } from '../../shared/accesibilidad';
import { Personaje } from '../../shared/personaje';

type Rol = 'docente' | 'estudiante';

/**
 * Ingreso de respaldo (Login.dc.html). Conserva los dos ingresos separados:
 * 1 · Docente y 2 · Estudiante (este último puede crear su cuenta).
 */
@Component({
  selector: 'app-login',
  imports: [FormsModule, Accesibilidad, Personaje],
  template: `
    <div style="min-height: 100vh; display: flex; flex-wrap: wrap; background: #FBF5EC; font-family: 'DM Sans', Arial, sans-serif; color: #231417">
      <section style="flex: 1 1 520px; min-height: 100vh; background: #8A1428; color: #FFFFFF; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 40px; box-sizing: border-box">
        <img src="/assets/fondo-cacao.jpg" alt="" aria-hidden="true" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.55">
        <div aria-hidden="true" style="position: absolute; inset: 0; background: rgba(138,20,40,0.78)"></div>
        <span style="position: relative; align-self: flex-start; background: #FFFFFF; border-radius: 999px; padding: 8px 16px; display: inline-flex"><img src="/assets/logo-uao.png" alt="Universidad Autónoma de Occidente" style="height: 22px; width: auto"></span>
        <div style="position: relative; display: flex; flex-direction: column; line-height: 0.9">
          <span style="font-size: 104px; font-weight: 800; letter-spacing: -0.05em">GADMI</span>
          <span style="font-size: 34px; font-weight: 700; color: #FFD3C9; margin-top: 8px">Sost-Empresarial</span>
        </div>
        <div class="pj-fila" style="position: relative; display: flex; align-items: flex-end; gap: 6px">
          <app-personaje who="teo" [size]="170" />
          <app-personaje who="chispa" [size]="110" />
          <app-personaje who="nibi" [size]="120" />
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
          <h1 style="margin: 0; font-size: 34px; font-weight: 800; letter-spacing: -0.02em; color: #231417">{{ registro() ? (rol() === 'docente' ? 'Registro docente' : 'Crea tu cuenta') : 'Ingresa' }}</h1>
          <p style="margin: 0; font-size: 16px; color: #5C4A4D">Usa tu correo institucional de la UAO.</p>

          @if (registro()) {
            <label style="display: flex; flex-direction: column; gap: 6px; font-size: 15px; font-weight: 700">Nombre y apellidos completos
              <input type="text" name="nombre" autocomplete="name" [(ngModel)]="nombre" style="min-height: 52px; border-radius: 14px; border: 1.5px solid #D9CBBB; padding: 0 16px; font-size: 16px; background: #FFFFFF">
            </label>
          }
          @if (registro() && rol() === 'estudiante') {
            <div style="display: flex; gap: 12px">
              <label style="flex: 1; display: flex; flex-direction: column; gap: 6px; font-size: 15px; font-weight: 700">Código
                <input type="text" name="codigo" [(ngModel)]="codigo" style="min-height: 52px; border-radius: 14px; border: 1.5px solid #D9CBBB; padding: 0 16px; font-size: 16px; background: #FFFFFF; width: 100%; box-sizing: border-box">
              </label>
              <label style="flex: 1; display: flex; flex-direction: column; gap: 6px; font-size: 15px; font-weight: 700">Grupo
                <input type="text" name="grupo" [(ngModel)]="grupo" style="min-height: 52px; border-radius: 14px; border: 1.5px solid #D9CBBB; padding: 0 16px; font-size: 16px; background: #FFFFFF; width: 100%; box-sizing: border-box">
              </label>
            </div>
          }
          <label style="display: flex; flex-direction: column; gap: 6px; font-size: 15px; font-weight: 700">Correo institucional
            <input type="email" name="correo" autocomplete="email" placeholder="nombre@uao.edu.co" [(ngModel)]="correo" style="min-height: 52px; border-radius: 14px; border: 1.5px solid #D9CBBB; padding: 0 16px; font-size: 16px; background: #FFFFFF">
          </label>
          <label style="display: flex; flex-direction: column; gap: 6px; font-size: 15px; font-weight: 700">Contraseña{{ registro() ? (rol() === 'docente' ? ' (mínimo 8)' : ' (mínimo 6)') : '' }}
            <input type="password" name="password" [attr.autocomplete]="registro() ? 'new-password' : 'current-password'" [(ngModel)]="password" style="min-height: 52px; border-radius: 14px; border: 1.5px solid #D9CBBB; padding: 0 16px; font-size: 16px; background: #FFFFFF">
          </label>
          @if (registro() && rol() === 'docente') {
            <label style="display: flex; flex-direction: column; gap: 6px; font-size: 15px; font-weight: 700">Código de registro docente
              <input type="text" name="codigoRegistro" autocomplete="off" [(ngModel)]="codigoRegistro" aria-describedby="codigo-ayuda" style="min-height: 52px; border-radius: 14px; border: 1.5px solid #D9CBBB; padding: 0 16px; font-size: 16px; background: #FFFFFF; letter-spacing: 0.04em">
              <span id="codigo-ayuda" style="font-size: 13px; font-weight: 400; color: #5C4A4D">Te lo entrega la coordinación del curso. Protege los datos de los estudiantes.</span>
            </label>
          }
          @if (error()) { <p role="alert" style="margin: 0; padding: 12px 14px; border-radius: 14px; background: #FFE3DC; color: #8A1428; font-weight: 700; font-size: 14px">{{ error() }}</p> }
          <button type="submit" [disabled]="loading()" style="display: flex; align-items: center; justify-content: center; min-height: 54px; border-radius: 999px; background: #AC0B32; color: #FFFFFF; font-weight: 800; font-size: 17px; border: none; cursor: pointer">{{ loading() ? 'Un momento…' : registro() ? (rol() === 'docente' ? 'Registrarme como docente' : 'Crear cuenta') : 'Ingresar' }}</button>
          @if (offline() && rol() === 'estudiante') {
            <button type="button" (click)="enterOffline()" style="min-height: 48px; border-radius: 999px; border: 2px solid #AC0B32; background: #FFFFFF; color: #AC0B32; font-weight: 800; font-size: 15px; cursor: pointer">Continuar sin conexión (solo este navegador)</button>
          }
          <button type="button" (click)="toggleRegistro()" style="align-self: center; background: none; border: none; color: #8A1428; text-decoration: underline; font-size: 14px; cursor: pointer">{{ registro() ? '¿Ya tienes cuenta? Ingresa' : rol() === 'docente' ? '¿Eres docente nuevo? Regístrate' : '¿Primera vez? Crea tu cuenta' }}</button>
          <a href="#recuperar" (click)="$event.preventDefault(); forgot.set(true)" style="font-size: 14px; align-self: center">¿Olvidaste tu contraseña?</a>
          @if (forgot()) { <span role="status" style="font-size: 13px; color: #5C4A4D; align-self: center; text-align: center">Pide a tu docente o a soporte que restablezca tu contraseña.</span> }
          <p style="margin: 8px 0 0; padding: 14px 16px; border-radius: 14px; background: #FFFFFF; font-size: 14px; color: #3D2C2F">Si entras desde el curso en Moodle, te reconocemos automáticamente y no necesitas esta pantalla.</p>
        </form>
      </section>
    </div>
  `,
  styles: `
    a{color:#8A1428} a:focus-visible,input:focus-visible,button:focus-visible{outline:3px solid #231417;outline-offset:2px} input,button{font-family:inherit}
    @media (max-width: 640px){
      .acc-login{position:static !important;display:flex;justify-content:flex-end;margin:-16px 0 18px}
      .pj-fila{transform:scale(.78);transform-origin:left bottom}
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
  registro = signal(false);
  nombre = '';
  codigo = '';
  grupo = '';
  correo = '';
  password = '';
  codigoRegistro = '';
  error = signal('');
  loading = signal(false);
  offline = signal(false);
  forgot = signal(false);

  ngOnInit() {
    if (this.preset()) this.rol.set(this.preset()!);
  }

  setRol(r: Rol) {
    this.rol.set(r);
    this.registro.set(false);
    this.error.set('');
  }
  toggleRegistro() {
    this.registro.update((v) => !v);
    this.error.set('');
  }

  private validate(): string {
    if (!/^[^@\s]+@uao\.edu\.co$/i.test(this.correo.trim())) return 'Usa tu correo institucional (@uao.edu.co).';
    if (this.registro() && this.rol() === 'docente') {
      if (!this.nombre.trim()) return 'Escribe tu nombre completo.';
      if (this.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
      if (!this.codigoRegistro.trim()) return 'Escribe el código de registro docente.';
    } else if (this.registro()) {
      if (!this.nombre.trim() || !this.codigo.trim() || !this.grupo.trim()) return 'Completa nombre, código y grupo.';
      if (this.nombre.trim().split(/\s+/).filter((p) => p.length >= 2).length < 2) return 'Escribe tu nombre y tus apellidos completos: así aparecerán en el certificado.';
      if (this.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    } else if (!this.password) return 'Escribe tu contraseña.';
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
      const call = this.registro()
        ? this.api.registroDocente({ nombre: this.nombre.trim(), correo: this.correo.trim(), password: this.password, codigoRegistro: this.codigoRegistro.trim() })
        : this.api.loginDocente(this.correo.trim(), this.password);
      call.subscribe({
        next: (r) => {
          this.auth.set({ rol: 'docente', token: r.token, docente: r.docente });
          this.router.navigate(['/docente']);
        },
        error: fail,
      });
      return;
    }
    const call = this.registro()
      ? this.api.registroEstudiante({ nombre: this.nombre.trim(), codigo: this.codigo.trim(), grupo: this.grupo.trim(), correo: this.correo.trim(), password: this.password })
      : this.api.loginEstudiante(this.correo.trim(), this.password);
    call.subscribe({ next: (r) => this.enter(r.estudiante, r.token), error: fail });
  }

  enterOffline() {
    const local: Student = {
      nombre: this.nombre.trim() || this.correo.split('@')[0],
      codigo: this.codigo.trim() || this.correo.trim().toLowerCase(),
      grupo: this.grupo.trim() || '—',
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
