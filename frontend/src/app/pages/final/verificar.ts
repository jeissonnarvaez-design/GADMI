import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { LogoUao } from '../../shared/logo-uao';
import { ApiService, PublicCertificate, apiError, normalizarCodigo } from '../../core/services/api.service';

type Estado = 'valido' | 'anulado' | 'nada';
const ST: Record<Estado, { title: string; c: string; tc: string; icon: string; msg: string }> = {
  valido: { title: 'Certificado válido', c: '#3F7E44', tc: '#2C5E31', icon: 'M5 12l5 5 9-10', msg: '' },
  anulado: { title: 'Certificado anulado', c: '#8A1428', tc: '#8A1428', icon: 'M6 6l12 12M18 6L6 18', msg: 'La docente anuló este certificado.' },
  nada: { title: 'Este código no existe', c: '#5C4A4D', tc: '#231417', icon: 'M12 7v6M12 17h.01', msg: 'Revisa que esté bien escrito.' },
};
const fecha = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

/**
 * Verificar certificado (Verificar.dc.html, /verificar/:codigo): pública, sin login.
 * Tres estados: válido, anulado o no existe. Nunca muestra documento ni correo.
 */
@Component({
  selector: 'app-verificar',
  imports: [LogoUao],
  template: `
    <div style="min-height: 100vh; background: #FBF5EC; display: flex; flex-direction: column; align-items: center; padding: 48px 32px; box-sizing: border-box; gap: 24px; font-family: 'DM Sans', Arial, sans-serif; color: #231417">
      <app-logo-uao size="lg" />
      <h1 style="margin: 0; font-size: 36px; font-weight: 800; letter-spacing: -0.02em; text-align: center">Verificar un certificado de GADMI Sost-Empresarial</h1>
      <form (submit)="$event.preventDefault(); check()" style="display: flex; gap: 10px; width: 100%; max-width: 520px">
        <label style="flex: 1; display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 700">Código del certificado
          <input type="text" [value]="code()" (input)="code.set($any($event.target).value); estado.set(null)" autocomplete="off" spellcheck="false" style="min-height: 52px; border-radius: 14px; border: 1.5px solid #D9CBBB; padding: 0 16px; font-size: 17px; letter-spacing: 0.06em; background: #FFFFFF; min-width: 0">
        </label>
        <button type="submit" style="align-self: flex-end; min-height: 52px; padding: 0 22px; border-radius: 14px; border: none; background: #AC0B32; color: #FFFFFF; font-weight: 800; font-size: 16px; cursor: pointer">Verificar</button>
      </form>
      @if (estado(); as e) {
        <section class="pop" aria-live="polite" [style.border-left]="'8px solid ' + st()!.c" style="width: 100%; max-width: 620px; background: #FFFFFF; border-radius: 24px; padding: 28px; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px">
          <div style="display: flex; align-items: center; gap: 12px"><span [style.background]="st()!.c" style="width: 44px; height: 44px; flex-shrink: 0; border-radius: 999px; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" aria-hidden="true"><path [attr.d]="st()!.icon"></path></svg></span><span [style.color]="st()!.tc" style="font-size: 24px; font-weight: 800">{{ st()!.title }}</span></div>
          @if (st()!.msg) { <span style="font-size: 16px; color: #3D2C2F">{{ st()!.msg }}</span> }
          @for (f of fields(); track f[0]) {
            <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 16px; padding: 6px 0; border-bottom: 1px solid #F1E8DC"><span style="color: #5C4A4D">{{ f[0] }}</span><strong style="text-align: right">{{ f[1] }}</strong></div>
          }
        </section>
      }
      @if (error()) { <p role="alert" style="margin: 0; padding: 14px 18px; border-radius: 14px; background: #FFE3DC; color: #8A1428; font-weight: 700">{{ error() }}</p> }
      <p style="margin: 0; font-size: 14px; color: #5C4A4D; text-align: center; max-width: 520px">Página pública: a ella lleva el QR del certificado. No pide cuenta ni muestra documento o correo.</p>
    </div>
  `,
  styles: `
    a:focus-visible,button:focus-visible,input:focus-visible{outline:3px solid #231417;outline-offset:2px} button,input{font-family:inherit}
    @keyframes pop{0%{opacity:0;transform:scale(.9)}100%{opacity:1;transform:none}}
    .pop{animation:pop .35s cubic-bezier(.2,.7,.2,1) both}
    @media (prefers-reduced-motion: reduce){.pop{animation:none}}
  `,
})
export class VerificarPage {
  codigo = input<string>('');
  private api = inject(ApiService);
  code = signal('');
  estado = signal<Estado | null>(null);
  cert = signal<PublicCertificate | null>(null);
  error = signal('');
  st = computed(() => (this.estado() ? ST[this.estado()!] : null));
  fields = computed<[string, string][]>(() => {
    const c = this.cert();
    if (!c || this.estado() === 'nada') return [];
    const base: [string, string][] = [['Estudiante', c.estudiante], ['Periodo y grupo', c.periodo + ' · ' + c.grupo]];
    if (c.estado === 'anulado') return [...base, ['Anulado', fecha(c.fechaAnulacion)]];
    return [...base, ['Nivel', c.nivel], ['Granos', c.puntos.toLocaleString('es-CO') + ' / ' + c.max.toLocaleString('es-CO')], ['Emitido', fecha(c.fecha)]];
  });

  ngOnInit() {
    if (this.codigo()) {
      this.code.set(normalizarCodigo(this.codigo()));
      this.check();
    }
  }
  check() {
    const q = normalizarCodigo(this.code());
    this.error.set('');
    if (!q) return;
    this.code.set(q);
    this.api.verificar(q).subscribe({
      next: (c) => {
        this.cert.set(c);
        this.estado.set(c.estado === 'anulado' ? 'anulado' : 'valido');
      },
      error: (e) => {
        this.cert.set(null);
        if (e instanceof HttpErrorResponse && e.status === 404) this.estado.set('nada');
        else this.error.set(apiError(e).message);
      },
    });
  }
}
