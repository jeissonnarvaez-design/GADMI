import { Component, computed, inject, signal } from '@angular/core';
import { ApiService, Certificate, apiError } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { metersAt } from '../../core/services/company';
import { ProgressService } from '../../core/services/progress.service';
import { Hud } from '../../shared/hud';
import { LogoUao } from '../../shared/logo-uao';

const ODS: [number, string, string][] = [[7, 'Energía asequible y no contaminante', 'm2-presupuesto-verde'], [8, 'Trabajo decente y crecimiento económico', 'm3-crisis'], [12, 'Producción y consumo responsables', 'm1-valores'], [13, 'Acción por el clima', 'm4-cuellos-botella'], [15, 'Vida de ecosistemas terrestres', 'm1-foda']];
const MODS: [string, string, string][] = [['Planeación', 'Brújula estratégica', '#AC0B32'], ['Organización', 'Arquitectura verde', '#8A1428'], ['Dirección', 'Liderazgo con propósito', '#9A5B2E'], ['Control', 'Mirada ESG', '#231417']];
const fmt = (n: number) => n.toLocaleString('es-CO');

/**
 * Tu barra (Certificado.dc.html, ruta /barra): certificado e informe en un solo recuadro.
 * El código se genera en el backend al completar el módulo 4 y se reutiliza en cada descarga.
 */
@Component({
  selector: 'app-barra',
  imports: [Hud, LogoUao],
  template: `
    <div class="game-bg" style="min-height: 100vh; display: flex; flex-direction: column; color: #231417">
      <app-hud kicker="RECOMPENSA FINAL" title="Tu barra está lista" variant="modulo" />

      <main style="flex: 1; width: 100%; max-width: 1220px; margin: 0 auto; padding: 24px 28px; box-sizing: border-box; display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start; justify-content: center">
        <section aria-label="Tu barra: certificado e informe" style="flex: 0 1 760px; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 14px">
          <div class="pop" style="position: relative; width: 100%; border-radius: 18px; overflow: hidden; box-shadow: 0 24px 50px rgba(0,0,0,0.45)">
            <div aria-hidden="true" style="position: absolute; inset: 0; background: #5A2A1E; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); grid-template-rows: repeat(4, minmax(0, 1fr)); gap: 6px; padding: 10px; box-sizing: border-box">
              @for (q of squares; track q) { <span style="border-radius: 6px; background: #6B3B2A; box-shadow: inset 0 -4px 0 #4A2519, inset 0 3px 0 #7E4A36"></span> }
            </div>
            <div class="wrap" [style.transform]="open() ? 'translateX(82%)' : 'translateX(0)'" style="position: relative; background: #8A1428; padding: 16px; box-sizing: border-box">
              <article [attr.aria-hidden]="open() ? 'true' : null" style="position: relative; background: #FBF5EC; color: #231417; border-radius: 12px; padding: 28px 30px; display: flex; flex-direction: column; gap: 18px">
                <!-- 1. quién -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 14px">
                  <div style="display: flex; flex-direction: column; gap: 6px; min-width: 0">
                    <app-logo-uao size="sm" style="align-self: flex-start" />
                    <span style="font-size: 12px; font-weight: 800; letter-spacing: 0.1em; color: #AC0B32">CACAO RAÍZ · EDICIÓN 2030</span>
                    <span style="font-size: 30px; font-weight: 800; line-height: 1.05">{{ nombre() }}</span>
                    <span style="font-size: 14px; color: #5C4A4D">{{ subtitle() }}</span>
                  </div>
                  <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0">
                    <div role="img" [attr.aria-label]="cert() ? 'Código QR de verificación: lleva a ' + verifyUrl() : 'Código QR: se genera al completar el módulo 4'" style="width: 70px; height: 70px; border: 2px solid #231417; padding: 3px; box-sizing: border-box; background: #FFFFFF; display: flex; align-items: center; justify-content: center">
                      @if (qr()) { <img [src]="qr()" alt="" style="width: 100%; height: 100%; image-rendering: pixelated"> }
                      @else { <span style="font-size: 22px; color: #C9B8A6" aria-hidden="true">?</span> }
                    </div>
                    <span style="font-family: ui-monospace, Consolas, monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.03em; white-space: nowrap">{{ code() }}</span>
                  </div>
                </div>

                <!-- 2. resultado -->
                <div style="display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 10px; background: #FFF5F2; flex-wrap: wrap">
                  <span style="font-size: 20px; font-weight: 800; color: #8A1428; white-space: nowrap">{{ nivel() }}</span>
                  <div style="flex: 1; min-width: 80px; height: 10px; border-radius: 999px; background: #EADFD0"><div [style.width]="pct() + '%'" style="height: 10px; border-radius: 999px; background: #AC0B32"></div></div>
                  <span style="font-size: 16px; font-weight: 800; white-space: nowrap">{{ fmt(puntos()) }} / {{ fmt(overall().max) }} granos</span>
                </div>

                <!-- 3. módulos y poderes -->
                <div style="display: flex; flex-direction: column; gap: 10px; border-top: 1px solid #EFE6E6; padding-top: 16px">
                  <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: #5C4A4D">TUS 4 MÓDULOS</span>
                  <div class="g4" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px">
                    @for (m of mods(); track m.name) {
                      <div style="background: transparent; padding: 0 0 0 12px; display: flex; flex-direction: column; gap: 4px; border-left: 2px solid #EFE6E6">
                        <span style="font-size: 13px; font-weight: 800">{{ m.name }}</span>
                        <span style="font-size: 12px; color: #5C4A4D; line-height: 1.25; min-height: 30px">{{ m.power }}</span>
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px">
                          <strong style="font-size: 15px">{{ m.pts }}</strong>
                          <span role="img" [attr.aria-label]="m.aria" style="display: flex; gap: 3px">@for (x of m.pips; track $index) { <span [style.background]="x" style="width: 14px; height: 8px; border-radius: 999px"></span> }</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- 4. empresa -->
                <div style="display: flex; flex-direction: column; gap: 10px; border-top: 1px solid #EFE6E6; padding-top: 16px">
                  <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: #5C4A4D">TU EMPRESA EN 2030</span>
                  <div class="g4" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px 14px">
                    @for (m of meters(); track m.label) {
                      <div style="display: flex; flex-direction: column; gap: 4px"><div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700"><span>{{ m.label }}</span><span>{{ m.v }}</span></div><div style="height: 8px; border-radius: 999px; background: #EADFD0"><div [style.background]="m.c" [style.width]="m.v" style="height: 8px; border-radius: 999px"></div></div></div>
                    }
                  </div>
                </div>

                <!-- 5. ODS en burbujas -->
                <div style="display: flex; flex-direction: column; gap: 10px; border-top: 1px solid #EFE6E6; padding-top: 16px">
                  <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: #5C4A4D">ODS QUE TRABAJASTE</span>
                  @if (ods().length) {
                    <ul aria-label="ODS trabajados" style="list-style: none; margin: 0; padding: 4px 0 0; display: flex; justify-content: space-around; gap: 10px; flex-wrap: wrap">
                      @for (o of ods(); track o.n) {
                        <li style="text-align: center">
                          <span role="img" [attr.aria-label]="o.aria" [title]="o.aria" style="width: 50px; height: 50px; box-sizing: border-box; border-radius: 999px; background: #FFFFFF; border: 2px solid #B5A9A6; color: #6E5458; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1">
                            <span style="font-size: 9px; font-weight: 800; letter-spacing: 0.12em; opacity: 0.9">ODS</span>
                            <span style="font-size: 20px; font-weight: 800">{{ o.n }}</span>
                          </span>
                        </li>
                      }
                    </ul>
                  } @else {
                    <span style="font-size: 13px; color: #5C4A4D">Aún no hay ODS logrados.</span>
                  }
                </div>
              </article>
            </div>
          </div>
          <button type="button" class="gbtn" [class.hop]="!open()" (click)="open.set(!open())" style="min-height: 54px; padding: 0 24px 0 14px; border: 3px solid #FBF5EC; background: #6B3B2A; color: #FBF5EC; font-weight: 800; font-size: 16px; cursor: pointer; display: flex; align-items: center; gap: 12px"><svg width="30" height="26" viewBox="0 0 30 26" aria-hidden="true"><rect x="1" y="1" width="28" height="24" rx="4" fill="#4A2519"></rect><g fill="#7E4A36"><rect x="4" y="4" width="6" height="5" rx="1"></rect><rect x="12" y="4" width="6" height="5" rx="1"></rect><rect x="20" y="4" width="6" height="5" rx="1"></rect><rect x="4" y="11" width="6" height="5" rx="1"></rect><rect x="12" y="11" width="6" height="5" rx="1"></rect><rect x="20" y="11" width="6" height="5" rx="1"></rect></g><path d="M1 17 L29 12 V25 H1 Z" fill="#AC0B32"></path></svg>{{ open() ? 'Volver a envolver' : 'Ver tu barra de chocolate' }}</button>
        </section>

        <aside style="flex: 0 1 340px; min-width: 0; display: flex; flex-direction: column; gap: 14px; justify-content: flex-start">
          @if (!nombreOk()) {
            <form class="gpanel" (submit)="$event.preventDefault(); guardarNombre()" style="background: #FBF5EC; color: #231417; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px">
              <span class="px" style="font-size: 10px; color: #AC0B32; margin-bottom: 4px">TU NOMBRE COMPLETO</span>
              <label for="nombre-cert" style="font-size: 14px">El certificado lleva tu nombre y tus apellidos completos. Escríbelos como deben aparecer:</label>
              <input id="nombre-cert" type="text" autocomplete="name" [value]="nuevoNombre()" (input)="nuevoNombre.set($any($event.target).value)" style="min-height: 44px; border-radius: 8px; border: 1.5px solid #D9CBBB; padding: 0 12px; font-size: 16px; font-family: inherit">
              <button type="submit" class="gbtn" style="min-height: 44px; border: none; background: #AC0B32; color: #FFFFFF; font-weight: 800; font-size: 15px; cursor: pointer">Guardar nombre</button>
            </form>
          }
          <div class="gpanel" style="background: #2A0B12; color: #FBF5EC; padding: 18px 20px; display: flex; flex-direction: column; gap: 8px; justify-content: center; margin-bottom: 18px">
            <span class="px" style="font-size: 12px; color: #FF836C; margin-bottom: 8px">ENTRÉGALO EN MOODLE</span>
            @for (s of steps; track s[0]) {
              <div style="display: flex; gap: 12px; align-items: center; min-height: 56px"><span class="px" style="width: 38px; height: 38px; flex-shrink: 0; border-radius: 6px; background: #FF836C; color: #1A0609; font-size: 13px; display: flex; align-items: center; justify-content: center">{{ s[0] }}</span><span style="font-size: 18px; font-weight: 700; line-height: 1.3">{{ s[1] }}</span></div>
            }
          </div>
          <button type="button" class="gbtn glow" (click)="download()" [disabled]="busy()" style="min-height: 58px; border: none; background: #AC0B32; color: #FFFFFF; font-weight: 800; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 0 16px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"></path></svg>{{ busy() ? 'Preparando el PDF…' : 'Descargar certificado e informe (PDF)' }}</button>
          <div class="gpanel" style="margin-top: 10px; background: #FBF5EC; border: none; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px">
            <div style="display: flex; flex-direction: column; gap: 4px; min-width: 0"><span class="px" style="font-size: 10px; color: #AC0B32; margin-bottom: 4px">TU CÓDIGO</span><span style="font-family: ui-monospace, Consolas, monospace; font-size: 15px; font-weight: 700; letter-spacing: 0.03em; overflow-wrap: anywhere; color: #5C4A4D">{{ code() }}</span></div>
            <button type="button" class="gbtn" (click)="copy()" [disabled]="!cert()" aria-live="polite" style="min-height: 40px; padding: 0 14px; border: none; background: #FF836C; color: #1A0609; font-weight: 800; font-size: 14px; cursor: pointer; flex-shrink: 0">{{ copied() ? '✓ Copiado' : 'Copiar' }}</button>
          </div>
          @if (msg()) { <p role="status" style="margin: 0; font-size: 14px; color: #FFD3C9">{{ msg() }}</p> }
        </aside>
      </main>
    </div>
  `,
  styles: `
    a{color:#8A1428} a:focus-visible,button:focus-visible{outline:3px solid #FBF5EC;outline-offset:3px;box-shadow:0 0 0 6px #231417;} button{font-family:inherit} button:disabled{opacity:.6;cursor:default}
    @keyframes pop{0%{opacity:0;transform:scale(.7)}70%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
    @keyframes hop{0%,60%,100%{transform:translateY(0) rotate(0)}70%{transform:translateY(-10px) rotate(-2deg)}80%{transform:translateY(0) rotate(0)}}
    .pop{animation:pop .6s cubic-bezier(.2,.7,.2,1) both}
    .wrap{transition:transform .9s cubic-bezier(.6,0,.2,1)}
    .hop{animation:hop 2.4s ease-in-out infinite}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
    .float{animation:float 5s ease-in-out infinite}
    @media (max-width: 640px){.g4{grid-template-columns:repeat(2,minmax(0,1fr)) !important}}
    @media (prefers-reduced-motion: reduce){.pop,.hop,.float{animation:none}.wrap{transition:none}}
  `,
})
export class BarraPage {
  private progress = inject(ProgressService);
  private auth = inject(AuthService);
  private api = inject(ApiService);
  readonly squares = Array.from({ length: 24 }, (_, i) => i);
  readonly steps = [['1', 'Descarga el PDF.'], ['2', 'Abre la tarea de la profe en Moodle.'], ['3', 'Sube el PDF y pega tu código.']];
  readonly fmt = fmt;
  open = signal(false);
  copied = signal(false);
  busy = signal(false);
  msg = signal('');
  cert = signal<Certificate | null>(null);
  qr = signal<string | null>(null);
  overall = this.progress.overall;

  nombre = computed(() => this.auth.student()?.nombre ?? '');
  /** Nombre y al menos un apellido (dos palabras). */
  nombreOk = computed(() => this.nombre().trim().split(/\s+/).filter((p) => p.length >= 2).length >= 2);
  nuevoNombre = signal(this.auth.student()?.nombre ?? '');
  code = computed(() => this.cert()?.codigo ?? '—');
  puntos = computed(() => this.cert()?.puntaje ?? this.overall().points);
  pct = computed(() => Math.round((this.puntos() / (this.overall().max || 1)) * 100));
  nivel = computed(() => this.cert()?.nivel ?? this.overall().level.name);
  verifyUrl = computed(() => (this.cert() ? `${location.origin}/verificar/${this.cert()!.codigo}` : ''));
  subtitle = computed(() => {
    const c = this.cert();
    const grupo = c?.grupo ?? this.auth.student()?.grupo ?? '';
    const fecha = c ? new Date(c.fechaEmision).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'certificado pendiente';
    return ['Gerente general', c?.periodo, grupo, fecha].filter(Boolean).join(' · ');
  });
  mods = computed(() =>
    this.progress.moduleStats().map((s, i) => {
      const n = !s.completed ? 0 : s.tier === 'destacado' ? 3 : s.tier === 'logrado' ? 2 : 1;
      const [name, power, c] = MODS[i];
      return { name, power, c, pts: s.points + ' / ' + s.max, pips: [0, 1, 2].map((k) => (k < n ? '#AC0B32' : '#EADFD0')), aria: 'Poder nivel ' + n + ' de 3' };
    }),
  );
  meters = computed(() => {
    this.progress.moduleStats();
    const m = metersAt(this.progress, 4);
    return ([['Ambiental', m.ambiental, '#3F7E44'], ['Social', m.social, '#9A5B2E'], ['Gobernanza', m.gobernanza, '#8A1428'], ['Económico', m.economico, '#231417']] as [string, number, string][]).map(([label, v, c]) => ({ label, v: Math.min(100, v) + '%', c }));
  });
  ods = computed(() => {
    this.progress.moduleStats();
    return ODS.filter(([, , ex]) => (this.progress.best(ex)?.grade ?? 0) >= 3).map(([n, name], i) => ({ n, aria: 'ODS ' + n + ': ' + name, delay: i * -1.1 + 's' }));
  });

  ngOnInit() {
    if (!this.auth.token()) return this.msg.set('Sin conexión: el código del certificado se genera al conectarte.');
    this.api.certificado().subscribe({
      next: (c) => {
        this.cert.set(c);
        this.makeQr();
      },
      error: (e) => this.msg.set(apiError(e).message),
    });
  }

  /** QR real que apunta a /verificar/:codigo. */
  private async makeQr() {
    const { toDataURL } = await import('qrcode');
    this.qr.set(await toDataURL(this.verifyUrl(), { margin: 0, width: 192, errorCorrectionLevel: 'M', color: { dark: '#231417', light: '#FFFFFF' } }));
  }

  /** Completa el nombre del estudiante (para cuentas creadas solo con el primer nombre). */
  guardarNombre() {
    const n = this.nuevoNombre().trim().replace(/\s+/g, ' ');
    if (n.split(' ').filter((p) => p.length >= 2).length < 2) return this.msg.set('Escribe tu nombre y al menos un apellido.');
    if (!this.auth.token()) {
      this.auth.updateStudent({ nombre: n });
      return;
    }
    this.api.cambiarNombre(n).subscribe({
      next: (r) => { this.auth.updateStudent({ nombre: r.nombre }); this.msg.set('✓ Nombre guardado. Ya aparece en tu certificado.'); },
      error: (e) => this.msg.set(apiError(e).message),
    });
  }

  async copy() {
    const c = this.cert();
    if (!c) return;
    try {
      await navigator.clipboard.writeText(c.codigo);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    } catch {
      this.msg.set('No se pudo copiar. Selecciona el código y cópialo a mano.');
    }
  }

  /**
   * Un solo PDF con el mismo contenido del recuadro (certificado e informe),
   * dibujado con jsPDF: texto nítido y seleccionable, QR y enlace de verificación.
   */
  async download() {
    const c = this.cert();
    if (!c) {
      this.msg.set('El PDF lleva tu código de verificación: se genera al completar el módulo 4.');
      return;
    }
    if (!this.nombreOk()) {
      this.msg.set('Antes de descargar, escribe tu nombre y tus apellidos completos.');
      return;
    }
    this.busy.set(true);
    this.msg.set('');
    try {
      const { jsPDF } = await import('jspdf');
      const logo = await loadImage('/assets/logo-uao.png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      const X = 14, CW = W - 28, P = 8;
      const L = X + P, R = X + CW - P, IW = R - L;
      const text = (t: string, x: number, y: number, size: number, color: string, opts: { bold?: boolean; align?: 'left' | 'right' | 'center'; mono?: boolean } = {}) => {
        pdf.setFont(opts.mono ? 'courier' : 'helvetica', opts.bold ? 'bold' : 'normal');
        pdf.setFontSize(size);
        pdf.setTextColor(color);
        pdf.text(t, x, y, { align: opts.align ?? 'left' });
      };
      const bar = (x: number, y: number, w: number, h: number, pct: number, color: string) => {
        pdf.setFillColor('#EADFD0');
        pdf.roundedRect(x, y, w, h, h / 2, h / 2, 'F');
        if (pct > 0) {
          pdf.setFillColor(color);
          pdf.roundedRect(x, y, Math.max(h, (w * Math.min(100, pct)) / 100), h, h / 2, h / 2, 'F');
        }
      };
      // Fondo bordó (envoltura) y etiqueta crema
      pdf.setFillColor('#8A1428');
      pdf.rect(0, 0, W, H, 'F');
      pdf.setFillColor('#FBF5EC');
      pdf.roundedRect(X, 16, CW, 178, 4, 4, 'F');
      // 1. Quién
      const lw = (logo.w / logo.h) * 6;
      pdf.addImage(logo.data, 'PNG', L, 24, lw, 6);
      pdf.setDrawColor('#8A1428');
      pdf.setLineWidth(0.35);
      pdf.line(L + lw + 3, 23.3, L + lw + 3, 30.7);
      text('FACULTAD DE CIENCIAS', L + lw + 6, 26.4, 6.5, '#8A1428', { bold: true });
      text('EMPRESARIALES Y JURÍDICAS', L + lw + 6, 29.6, 6.5, '#8A1428', { bold: true });
      const sep = (y: number) => {
        pdf.setDrawColor('#EFE6E6');
        pdf.setLineWidth(0.25);
        pdf.line(L, y, R, y);
      };
      text('CACAO RAÍZ · EDICIÓN 2030', L, 37, 9, '#AC0B32', { bold: true });
      text(this.nombre(), L, 48, 24, '#231417', { bold: true });
      text(this.subtitle(), L, 55, 10.5, '#5C4A4D');
      if (this.qr()) {
        pdf.setDrawColor('#231417');
        pdf.setLineWidth(0.6);
        pdf.rect(R - 24, 22, 24, 24);
        pdf.addImage(this.qr()!, 'PNG', R - 23, 23, 22, 22);
        pdf.link(R - 24, 22, 24, 24, { url: this.verifyUrl() });
      }
      text(c.codigo, R - 12, 50, 7.5, '#231417', { bold: true, mono: true, align: 'center' });
      // 2. Resultado
      pdf.setFillColor('#FFF5F2');
      pdf.roundedRect(L, 62, IW, 15, 2.5, 2.5, 'F');
      text(this.nivel(), L + 5, 71.5, 14, '#8A1428', { bold: true });
      const pts = fmt(this.puntos()) + ' / ' + fmt(this.overall().max) + ' granos';
      text(pts, R - 5, 71.5, 12, '#231417', { bold: true, align: 'right' });
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      const bx = L + 9 + pdf.getTextWidth(this.nivel());
      pdf.setFontSize(12);
      bar(bx, 68.5, R - 9 - pdf.getTextWidth(pts) - bx, 2.6, this.pct(), '#AC0B32');
      // 3. Módulos y poderes
      sep(81);
      text('TUS 4 MÓDULOS', L, 86, 8, '#5C4A4D', { bold: true });
      const gw = (IW - 3 * 3) / 4;
      this.mods().forEach((m, i) => {
        const x = L + i * (gw + 3);
        pdf.setDrawColor('#EFE6E6');
        pdf.setLineWidth(0.5);
        pdf.line(x, 89, x, 117);
        text(m.name, x + 3, 96, 10, '#231417', { bold: true });
        text(m.power, x + 3, 101, 8, '#5C4A4D');
        text(m.pts, x + 3, 112, 11, '#231417', { bold: true });
        m.pips.forEach((col, k) => {
          pdf.setFillColor(col);
          pdf.roundedRect(x + gw - 3 - (3 - k) * 5, 109.6, 4.2, 2.4, 1.2, 1.2, 'F');
        });
      });
      // 4. Empresa
      sep(122);
      text('TU EMPRESA EN 2030', L, 127, 8, '#5C4A4D', { bold: true });
      this.meters().forEach((m, i) => {
        const x = L + i * (gw + 3);
        text(m.label, x, 133, 9, '#231417', { bold: true });
        text(m.v, x + gw, 133, 9, '#231417', { bold: true, align: 'right' });
        bar(x, 135.5, gw, 2.4, parseInt(m.v, 10), m.c);
      });
      // 5. ODS en burbujas
      sep(142);
      text('ODS QUE TRABAJASTE', L, 147, 8, '#5C4A4D', { bold: true });
      const ods = this.ods();
      if (!ods.length) text('Aún no hay ODS logrados.', L, 156, 9, '#5C4A4D');
      ods.forEach((o, i) => {
        const cx = L + (IW / ods.length) * (i + 0.5);
        pdf.setFillColor('#FFFFFF');
        pdf.setDrawColor('#B5A9A6');
        pdf.setLineWidth(0.5);
        pdf.circle(cx, 163, 8, 'FD');
        text('ODS', cx, 160.5, 6, '#6E5458', { bold: true, align: 'center' });
        text(String(o.n), cx, 167, 13, '#6E5458', { bold: true, align: 'center' });
      });
      text('Verifica este certificado en:', L, 184, 8.5, '#5C4A4D');
      pdf.setTextColor('#8A1428');
      pdf.textWithLink(this.verifyUrl(), L + 40, 184, { url: this.verifyUrl() });
      // Pie: cómo entregarlo
      text('Entrégalo en Moodle: 1. Descarga este PDF. 2. Abre la tarea de la profe. 3. Sube el PDF y pega tu código: ' + c.codigo, X, 204, 8.5, '#FBF5EC');
      pdf.setProperties({ title: 'Certificado GADMI · ' + c.codigo, author: 'GADMI Sost-Empresarial · UAO', subject: 'Certificado e informe CACAO Raíz 2030' });
      pdf.save(`certificado-gadmi-${c.codigo}.pdf`);
    } catch (e) {
      console.error(e);
      this.msg.set('No se pudo generar el PDF. Intenta de nuevo.');
    } finally {
      this.busy.set(false);
    }
  }
}

/** Carga una imagen como data URL (para el PDF). */
function loadImage(src: string): Promise<{ data: string; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = img.naturalWidth;
      cv.height = img.naturalHeight;
      cv.getContext('2d')!.drawImage(img, 0, 0);
      resolve({ data: cv.toDataURL('image/png'), w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = src;
  });
}
