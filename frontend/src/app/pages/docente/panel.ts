import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService, CourseRow, CourseSummary, PublicCertificate, apiError, normalizarCodigo } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Accesibilidad } from '../../shared/accesibilidad';

/** Panel del curso (Docente.dc.html) con datos reales. */
@Component({
  selector: 'app-panel-docente',
  imports: [RouterLink, Accesibilidad],
  template: `
    <div style="min-height: 100vh; background: #FBF5EC; display: flex; flex-direction: column; font-family: 'DM Sans', Arial, sans-serif; color: #231417">
      <header style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 40px; background: #FFFFFF; border-bottom: 1px solid #EADFD0">
        <div style="display: flex; align-items: center; gap: 16px">
          <img src="/assets/logo-uao.png" alt="UAO" style="height: 28px; width: auto">
          <div style="display: flex; flex-direction: column"><span style="font-size: 13px; color: #5C4A4D">Vista docente · {{ teacher() }}</span><span style="font-size: 18px; font-weight: 700">Seguimiento GADMI</span></div>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 14px">Grupo
            <select (change)="setGroup($any($event.target).value)" style="min-height: 44px; border-radius: 10px; border: 1px solid #D9CBBB; padding: 0 10px; font-size: 15px; background: #FFFFFF; color: #231417">
              <option value="">Todos</option>
              @for (g of groups(); track g.grupo) { <option [value]="g.grupo" [selected]="group() === g.grupo">{{ g.grupo }} · {{ g.periodo }}</option> }
            </select>
          </label>
          <button type="button" (click)="export()" style="min-height: 44px; padding: 0 16px; border-radius: 10px; border: 1px solid #D9CBBB; background: #FFFFFF; font-weight: 600; font-size: 14px; cursor: pointer; color: #231417">Exportar CSV</button>
          <button type="button" disabled title="A futuro: sincronizar con el libro de calificaciones de Moodle" style="min-height: 44px; padding: 0 16px; border-radius: 10px; border: none; background: #AC0B32; color: #FFFFFF; font-weight: 700; font-size: 14px; cursor: not-allowed; opacity: .6">Enviar notas a Moodle</button>
          <app-accesibilidad tone="light" />
          <button type="button" (click)="logout()" style="min-height: 44px; padding: 0 14px; border-radius: 10px; border: 1px solid #D9CBBB; background: transparent; font-size: 14px; cursor: pointer; color: #231417">Salir</button>
        </div>
      </header>

      <main style="flex: 1; width: 100%; max-width: 1200px; margin: 0 auto; padding: 28px 40px; box-sizing: border-box; display: flex; flex-direction: column; gap: 24px; justify-content: center">
        @if (error()) { <p role="alert" style="margin: 0; padding: 12px 16px; border-radius: 14px; background: #FFE3DC; color: #8A1428; font-weight: 700">{{ error() }}</p> }
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px">
          <div style="background: #FFFFFF; border-radius: 16px; padding: 18px 20px; display: flex; flex-direction: column; gap: 4px"><span style="font-size: 14px; color: #5C4A4D">Estudiantes activos</span><span style="font-size: 32px; font-weight: 800">{{ sum()?.activos ?? '—' }}</span></div>
          <div style="background: #FFFFFF; border-radius: 16px; padding: 18px 20px; display: flex; flex-direction: column; gap: 4px"><span style="font-size: 14px; color: #5C4A4D">Promedio de puntos</span><span style="font-size: 32px; font-weight: 800">{{ sum()?.promedio ?? '—' }}</span></div>
          <div style="background: #FFFFFF; border-radius: 16px; padding: 18px 20px; display: flex; flex-direction: column; gap: 4px"><span style="font-size: 14px; color: #5C4A4D">Certificados emitidos</span><span style="font-size: 32px; font-weight: 800">{{ sum()?.certificados ?? '—' }}</span></div>
          <a routerLink="/docente/bitacoras" style="background: #FFFFFF; border-radius: 16px; padding: 18px 20px; display: flex; flex-direction: column; gap: 4px; border: 2px solid #AC0B32; text-decoration: none; color: #231417"><span style="font-size: 14px; color: #5C4A4D">Bitácoras por revisar</span><span style="font-size: 32px; font-weight: 800; color: #8A1428">{{ sum()?.bitacorasPorRevisar ?? '—' }}</span></a>
        </div>

        <section aria-labelledby="verif" style="background: #FFFFFF; border-radius: 16px; padding: 16px 20px; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px">
          <h2 id="verif" style="margin: 0; font-size: 18px; font-weight: 700">Verificar certificado</h2>
          <form (submit)="$event.preventDefault(); vCheck()" style="flex: 1 1 380px; display: flex; gap: 8px">
            <input type="text" aria-label="Código del certificado" placeholder="Pega el código que entregó el estudiante" [value]="vCode()" (input)="vCode.set($any($event.target).value); vShown.set(false)" autocomplete="off" spellcheck="false" style="flex: 1; min-width: 0; min-height: 44px; border-radius: 10px; border: 1px solid #D9CBBB; padding: 0 12px; font-size: 15px; font-family: ui-monospace, Consolas, monospace; letter-spacing: 0.03em; background: #FFFFFF; color: #231417">
            <button type="submit" style="min-height: 44px; padding: 0 18px; border-radius: 10px; border: none; background: #231417; color: #FFFFFF; font-weight: 700; font-size: 14px; cursor: pointer">Verificar</button>
          </form>
          @if (vShown()) {
            <div class="pop" aria-live="polite" [style.background]="vLook().bg" [style.color]="vLook().fg" style="display: flex; align-items: center; gap: 10px; padding: 8px 14px; border-radius: 10px; font-size: 14px; font-weight: 700">
              <span>{{ vLook().text }}</span>
              @if (vLook().canVoid) { <button type="button" (click)="vVoid()" [disabled]="voiding()" style="min-height: 32px; padding: 0 10px; border-radius: 8px; border: 1px solid #8A1428; background: #FFFFFF; color: #8A1428; font-size: 13px; font-weight: 700; cursor: pointer">Anular</button> }
            </div>
          }
        </section>

        <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start">
          <section aria-labelledby="tabla" style="flex: 999 1 640px; min-width: 0; background: #FFFFFF; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 12px">
            <h2 id="tabla" style="margin: 0; font-size: 18px; font-weight: 700; color: #231417">Avance por estudiante</h2>
            <div style="overflow-x: auto">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; min-width: 760px">
                <thead>
                  <tr style="text-align: left; color: #5C4A4D; border-bottom: 1px solid #EADFD0">
                    <th scope="col" style="padding: 10px 8px; font-weight: 600">Estudiante</th>
                    @for (m of [1, 2, 3, 4]; track m) { <th scope="col" style="padding: 10px 8px; font-weight: 600">M{{ m }}</th> }
                    <th scope="col" style="padding: 10px 8px; font-weight: 600">Total</th>
                    <th scope="col" style="padding: 10px 8px; font-weight: 600">Nota</th>
                    <th scope="col" style="padding: 10px 8px; font-weight: 600">Bitácora</th>
                    <th scope="col" style="padding: 10px 8px; font-weight: 600">Certificado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of rows(); track r.id) {
                    <tr style="border-bottom: 1px solid #F1E8DC">
                      <th scope="row" style="padding: 12px 8px; text-align: left; font-weight: 600"><a [routerLink]="['/docente/estudiante', r.id]" style="color: #231417">{{ r.nombre }}</a><br><span style="font-size: 12px; color: #5C4A4D; font-weight: 400">{{ r.codigo }} · {{ r.grupo }}</span></th>
                      @for (m of r.modulos; track m.moduloId) { <td style="padding: 12px 8px">{{ m.completados ? m.puntos : '—' }}</td> }
                      <td style="padding: 12px 8px; font-weight: 700">{{ r.puntos }}</td>
                      <td style="padding: 12px 8px">{{ r.nota === null ? '—' : r.nota.toFixed(1) }}</td>
                      <td style="padding: 12px 8px"><a [routerLink]="['/docente/estudiante', r.id]" [queryParams]="{ tab: 1 }">{{ r.bitacoraEstado }}</a></td>
                      <td style="padding: 12px 8px">
                        @if (r.certificado; as c) {
                          <button type="button" (click)="useCode(c.codigo)" title="Verificar este código" [attr.aria-label]="'Verificar el certificado ' + c.codigo + (c.estado === 'anulado' ? ' (anulado)' : '')" [style.color]="c.estado === 'anulado' ? '#8C7A7D' : '#8A1428'" [style.text-decoration]="c.estado === 'anulado' ? 'line-through' : 'underline'" style="border: none; background: transparent; padding: 0; cursor: pointer; font-family: ui-monospace, Consolas, monospace; font-size: 12px">{{ c.codigo }}</button>
                        } @else { <span style="color: #8C7A7D">—</span> }
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="9" style="padding: 14px 8px; color: #5C4A4D">{{ loading() ? 'Cargando…' : 'Aún no hay estudiantes registrados.' }}</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="dif" style="flex: 1 1 300px; min-width: 0; background: #FFFFFF; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 14px">
            <h2 id="dif" style="margin: 0; font-size: 18px; font-weight: 700; color: #231417">Donde más se equivocan</h2>
            @for (h of sum()?.dificiles ?? []; track h.codigo) {
              <div style="display: flex; flex-direction: column; gap: 6px">
                <div style="display: flex; justify-content: space-between; gap: 8px; font-size: 14px"><span>{{ h.codigo }} {{ h.titulo }}</span><strong>{{ h.pct }}%</strong></div>
                <div style="height: 8px; border-radius: 999px; background: #EADFD0"><div [style.width]="h.pct + '%'" style="height: 8px; border-radius: 999px; background: #8A1428"></div></div>
              </div>
            } @empty {
              <span style="font-size: 14px; color: #5C4A4D">Aún no hay intentos registrados.</span>
            }
            <p style="margin: 0; font-size: 13px; color: #5C4A4D">Porcentaje de estudiantes que fallan el primer intento. Sirve para retomar el tema en clase.</p>
          </section>
        </div>
      </main>
    </div>
  `,
  styles: `
    a{color:#8A1428}a:hover{color:#AC0B32} a:focus-visible,button:focus-visible,select:focus-visible,input:focus-visible{outline:3px solid #231417;outline-offset:3px} button,select,input{font-family:inherit}
    @keyframes pop{0%{opacity:0;transform:scale(.95)}100%{opacity:1;transform:none}}
    .pop{animation:pop .3s ease both}
    @media (prefers-reduced-motion: reduce){.pop{animation:none}}
  `,
})
export class PanelDocentePage {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  rows = signal<CourseRow[]>([]);
  sum = signal<CourseSummary | null>(null);
  groups = signal<{ grupo: string; periodo: string; estudiantes: number }[]>([]);
  // Verificar certificado (GET /api/certificados/:codigo) y anular (PATCH, solo docente)
  vCode = signal('');
  vShown = signal(false);
  vResult = signal<PublicCertificate | null | 'error'>(null);
  voiding = signal(false);
  vLook = computed(() => {
    const c = this.vResult();
    if (c === 'error') return { text: '✕ No se pudo consultar el código', bg: '#F1E8DC', fg: '#231417', canVoid: false };
    if (!c) return { text: '✕ Ese código no existe', bg: '#F1E8DC', fg: '#231417', canVoid: false };
    if (c.estado === 'anulado') return { text: '⊘ Anulado · ' + c.estudiante, bg: '#FFE3DC', fg: '#8A1428', canVoid: false };
    return { text: '✓ Válido · ' + c.estudiante + ' · ' + c.puntos + ' pts', bg: '#EAF4E6', fg: '#2C5E31', canVoid: true };
  });
  group = signal('');
  error = signal('');
  loading = signal(true);
  teacher = () => this.auth.teacher()?.nombre ?? '';

  constructor() {
    this.api.grupos().subscribe({ next: (g) => this.groups.set(g), error: (e) => this.error.set(apiError(e).message) });
    this.load();
  }
  setGroup(g: string) {
    this.group.set(g);
    this.load();
  }
  load() {
    this.loading.set(true);
    const g = this.group() || undefined;
    this.api.curso(g).subscribe({ next: (r) => { this.rows.set(r); this.loading.set(false); }, error: (e) => { this.loading.set(false); this.error.set(apiError(e).message); } });
    this.api.resumen(g).subscribe({ next: (s) => this.sum.set(s), error: () => {} });
  }
  vCheck() {
    const q = normalizarCodigo(this.vCode());
    if (!q) return;
    this.vCode.set(q);
    this.api.verificar(q).subscribe({
      next: (c) => { this.vResult.set(c); this.vShown.set(true); },
      error: (e) => { this.vResult.set(e instanceof HttpErrorResponse && e.status === 404 ? null : 'error'); this.vShown.set(true); },
    });
  }
  /** Al tocar un código de la tabla, se verifica. */
  useCode(codigo: string) {
    this.vCode.set(codigo);
    this.vCheck();
  }
  vVoid() {
    const c = this.vResult();
    if (!c || c === 'error') return;
    if (!confirm(`¿Anular el certificado ${c.codigo} de ${c.estudiante}? Quien lo verifique verá que fue anulado.`)) return;
    this.voiding.set(true);
    this.api.anularCertificado(c.codigo).subscribe({
      next: () => {
        this.voiding.set(false);
        this.vResult.set({ ...c, estado: 'anulado', fechaAnulacion: new Date().toISOString() });
        this.rows.update((rs) => rs.map((r) => (r.certificado?.codigo === c.codigo ? { ...r, certificado: { codigo: c.codigo, estado: 'anulado' } } : r)));
        this.api.resumen(this.group() || undefined).subscribe({ next: (s) => this.sum.set(s), error: () => {} });
      },
      error: (e) => { this.voiding.set(false); this.error.set(apiError(e).message); },
    });
  }
  export() {
    exportCsv(this.api, this.group() || undefined, (m) => this.error.set(m));
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/ingreso']);
  }
}

/** Descarga el CSV de notas (con el token de sesión). */
export function exportCsv(api: ApiService, grupo: string | undefined, onError: (m: string) => void) {
  api.exportCsv(grupo).subscribe({
    next: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notas-gadmi${grupo ? '-' + grupo : ''}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    error: (e) => onError(apiError(e).message),
  });
}
