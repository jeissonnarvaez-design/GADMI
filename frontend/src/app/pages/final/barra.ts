import { Component, computed, inject, signal } from '@angular/core';
import { getModule } from '../../core/data/modules';
import { ApiService, Certificate, apiError } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { metersAt } from '../../core/services/company';
import { ProgressService } from '../../core/services/progress.service';
import { Hud } from '../../shared/hud';
import { LogoUao } from '../../shared/logo-uao';
import { INSIGNIA_UI, STAR } from '../../core/data/insignias';

const ODS: [number, string, string][] = [[7, 'Energía asequible y no contaminante', 'm2-presupuesto-verde'], [8, 'Trabajo decente y crecimiento económico', 'm3-crisis'], [12, 'Producción y consumo responsables', 'm1-valores'], [13, 'Acción por el clima', 'm4-cuellos-botella'], [15, 'Vida de ecosistemas terrestres', 'm1-foda']];
const MODS: [string, string, string][] = [['Planeación', 'Brújula estratégica', '#AC0B32'], ['Organización', 'Arquitectura verde', '#8A1428'], ['Dirección', 'Liderazgo con propósito', '#9A5B2E'], ['Control', 'Mirada ESG', '#231417']];
const fmt = (n: number) => n.toLocaleString('es-CO');

/**
 * Tu barra (Certificado.dc.html, ruta /barra): certificado e informe en un solo recuadro.
 * El código lo genera el backend cuando se cumplen los requisitos (4 módulos, 600 granos o más,
 * 4 bitácoras e informe descargado) y se reutiliza en cada descarga. Si no, es constancia de participación.
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
                <!-- 1. Encabezado: logos, título, quién -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 14px">
                  <div style="display: flex; flex-direction: column; gap: 8px; min-width: 0">
                    <app-logo-uao size="sm" style="align-self: flex-start" />
                    <span style="font-size: 12px; font-weight: 800; letter-spacing: 0.08em; color: #AC0B32; line-height: 1.35">{{ elegible() ? 'CERTIFICADO DE RECORRIDO ACADÉMICO' : 'CONSTANCIA DE PARTICIPACIÓN' }}</span>
                    <span style="font-size: 15px; font-weight: 800; color: #8A1428; line-height: 1.3">GADMI Sost-Empresarial: Gestión Organizacional Sostenible</span>
                    <span style="font-size: 30px; font-weight: 800; line-height: 1.05; margin-top: 4px">{{ nombre() }}</span>
                    <span style="font-size: 14px; color: #5C4A4D">Código estudiantil {{ codigoEst() }}{{ grupoTxt() }}</span>
                  </div>
                  @if (elegible()) {
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0">
                      <div role="img" [attr.aria-label]="cert() ? 'Código QR de verificación: lleva a ' + verifyUrl() : 'Código QR: se genera al emitir el certificado'" style="width: 70px; height: 70px; border: 2px solid #231417; padding: 3px; box-sizing: border-box; background: #FFFFFF; display: flex; align-items: center; justify-content: center">
                        @if (qr()) { <img [src]="qr()" alt="" style="width: 100%; height: 100%; image-rendering: pixelated"> }
                        @else { <span style="font-size: 22px; color: #C9B8A6" aria-hidden="true">?</span> }
                      </div>
                      <span style="font-family: ui-monospace, Consolas, monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.03em; white-space: nowrap">{{ code() }}</span>
                    </div>
                  }
                </div>

                @if (elegible()) {
                  <!-- 2. Texto del certificado -->
                  <p style="margin: 0; font-size: 16px; line-height: 1.55; color: #231417">Completó el recorrido por las cuatro fases del proceso administrativo (planeación, organización, dirección y control) aplicadas a la gestión sostenible de una empresa, con un desempeño de <strong>{{ fmt(puntos()) }} granos</strong>, nivel <strong>{{ nivel() }}</strong>.</p>
                  @if (puntos() >= 850) {
                    <span style="align-self: flex-start; padding: 6px 12px; border-radius: 999px; background: #8A1428; color: #FFFFFF; font-size: 13px; font-weight: 800; letter-spacing: 0.04em">★ MENCIÓN · LÍDER DE IMPACTO</span>
                  }
                  <!-- 3. Competencias -->
                  <div style="display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #EFE6E6; padding-top: 14px">
                    <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: #5C4A4D">COMPETENCIAS</span>
                    <ul style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; font-size: 14px; line-height: 1.4">
                      @for (c of competencias; track c) { <li>{{ c }}</li> }
                    </ul>
                  </div>
                } @else {
                  <!-- Constancia: módulos completados e invitación a retomar -->
                  <p style="margin: 0; font-size: 16px; line-height: 1.55">Participó en el recorrido de GADMI Sost-Empresarial y completó {{ completados().length === 0 ? 'ninguno de los módulos todavía' : (completados().length === 1 ? 'el módulo de ' : 'los módulos de ') + completadosTxt() }}, con {{ fmt(puntos()) }} granos.</p>
                  <div style="display: flex; flex-direction: column; gap: 6px; border-top: 1px solid #EFE6E6; padding-top: 14px">
                    <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: #5C4A4D">PARA OBTENER EL CERTIFICADO</span>
                    @for (r of requisitos(); track r.t) {
                      <span style="display: flex; gap: 8px; align-items: baseline; font-size: 14px"><strong [style.color]="r.ok ? '#2C5E31' : '#8A1428'">{{ r.ok ? '✓' : '○' }}</strong>{{ r.t }}</span>
                    }
                  </div>
                  <p style="margin: 0; font-size: 15px; font-weight: 700; color: #8A1428">Te invitamos a retomar el recorrido en la Ruta: tu avance está guardado.</p>
                }

                <!-- 4. Pie: intensidad, fecha, insignias -->
                <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px 16px; border-top: 1px solid #EFE6E6; padding-top: 12px; font-size: 13px; color: #5C4A4D">
                  <span>Intensidad estimada: <strong style="color: #231417">8 horas</strong> · {{ fecha() }}</span>
                  @if (insignias().length) {
                    <span role="list" aria-label="Insignias obtenidas" style="display: flex; gap: 6px; flex-wrap: wrap">
                      @for (b of insignias(); track b.id) {
                        <span role="listitem" [title]="b.name" [attr.aria-label]="'Insignia: ' + b.name" style="width: 26px; height: 26px; border-radius: 999px; background: #8A1428; display: inline-flex; align-items: center; justify-content: center"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="b.icon"></path></svg></span>
                      }
                    </span>
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

  readonly competencias = [
    'Formula objetivos e indicadores con criterio de sostenibilidad.',
    'Diseña estructuras y presupuestos coherentes con la estrategia.',
    'Decide ante dilemas éticos y crisis con criterios de liderazgo responsable.',
    'Evalúa el desempeño con indicadores ESG y propone planes de mejora.',
  ];
  codigoEst = computed(() => this.auth.student()?.codigo ?? '—');
  grupoTxt = computed(() => {
    const g = this.cert()?.grupo ?? this.auth.student()?.grupo ?? '';
    const p = this.cert()?.periodo ?? '';
    return (g ? ' · Grupo ' + g : '') + (p ? ' · Periodo ' + p : '');
  });
  fecha = computed(() => {
    const c = this.cert();
    const d = c ? new Date(c.fechaEmision) : new Date();
    return (c ? 'Emitido el ' : 'Fecha: ') + d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  });
  /** Requisitos: 4 módulos completos, 600 granos o más, 4 bitácoras e informe descargado (reto 4.4). */
  informeDescargado = computed(() => (this.progress.moduleStats(), this.progress.attempts('m4-cerrar-circulo').some((a) => (a.answers as { estado?: { dl?: boolean } })?.estado?.dl === true)));
  completados = computed(() => this.progress.moduleStats().filter((s) => s.done).map((s) => s.module.phase.split(' ')[0].toLowerCase()));
  /** «planeación, organización y control» */
  completadosTxt = computed(() => { const c = this.completados(); return c.length > 1 ? c.slice(0, -1).join(', ') + ' y ' + c[c.length - 1] : (c[0] ?? ''); });
  requisitos = computed(() => {
    const st = this.progress.moduleStats();
    const bit = st.filter((s) => this.progress.isReflectionComplete(s.module.id)).length;
    return [
      { t: 'Completar los cuatro módulos (' + st.filter((s) => s.done).length + ' de 4)', ok: st.every((s) => s.done) },
      { t: 'Reunir 600 granos o más (tienes ' + fmt(this.overall().points) + ')', ok: this.overall().points >= 600 },
      { t: 'Responder las cuatro bitácoras (' + bit + ' de 4)', ok: bit === 4 },
      { t: 'Descargar el informe final en el reto 4.4', ok: this.informeDescargado() },
    ];
  });
  /** Con certificado emitido por el backend, manda el backend; si no, los requisitos locales. */
  elegible = computed(() => !!this.cert() || this.requisitos().every((r) => r.ok));
  insignias = computed(() => this.progress.badges().filter((b) => b.earned).map((b) => ({ id: b.id, name: b.name, icon: INSIGNIA_UI[b.id]?.[1] ?? STAR })));

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
   * Un solo PDF (jsPDF, texto nítido y seleccionable):
   * página 1 = certificado (o constancia de participación); página 2 = informe con granos y bitácoras.
   */
  async download() {
    const c = this.cert();
    const cert = this.elegible() && !!c;
    if (!this.nombreOk()) {
      this.msg.set('Antes de descargar, escribe tu nombre y tus apellidos completos.');
      return;
    }
    if (this.elegible() && !c) {
      this.msg.set('Tu certificado se está generando. Intenta de nuevo en unos segundos.');
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
      const X = 14, CW = W - 28, P = 9;
      const L = X + P, R = X + CW - P, IW = R - L;
      const text = (t: string, x: number, y: number, size: number, color: string, opts: { bold?: boolean; align?: 'left' | 'right' | 'center'; mono?: boolean } = {}) => {
        pdf.setFont(opts.mono ? 'courier' : 'helvetica', opts.bold ? 'bold' : 'normal');
        pdf.setFontSize(size);
        pdf.setTextColor(color);
        pdf.text(t, x, y, { align: opts.align ?? 'left' });
      };
      /** Párrafo con salto de línea; devuelve la y siguiente. */
      const parrafo = (t: string, x: number, y: number, w: number, size: number, color: string, bold = false, lh = 1.45) => {
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.setFontSize(size);
        pdf.setTextColor(color);
        const lines = pdf.splitTextToSize(t, w) as string[];
        pdf.text(lines, x, y, { lineHeightFactor: lh });
        return y + lines.length * size * 0.3528 * lh;
      };
      const sep = (y: number) => {
        pdf.setDrawColor('#EFE6E6');
        pdf.setLineWidth(0.25);
        pdf.line(L, y, R, y);
      };
      const fondo = () => {
        pdf.setFillColor('#8A1428');
        pdf.rect(0, 0, W, H, 'F');
        pdf.setFillColor('#FBF5EC');
        pdf.roundedRect(X, 14, CW, H - 34, 4, 4, 'F');
      };
      const encabezado = () => {
        const lw = (logo.w / logo.h) * 6;
        pdf.addImage(logo.data, 'PNG', L, 22, lw, 6);
        pdf.setDrawColor('#8A1428');
        pdf.setLineWidth(0.35);
        pdf.line(L + lw + 3, 21.3, L + lw + 3, 28.7);
        text('FACULTAD DE CIENCIAS', L + lw + 6, 24.4, 6.5, '#8A1428', { bold: true });
        text('EMPRESARIALES Y JURÍDICAS', L + lw + 6, 27.6, 6.5, '#8A1428', { bold: true });
      };

      // ---------- Página 1: certificado o constancia
      fondo();
      encabezado();
      text(cert ? 'CERTIFICADO DE RECORRIDO ACADÉMICO' : 'CONSTANCIA DE PARTICIPACIÓN', L, 38, 9.5, '#AC0B32', { bold: true });
      text('GADMI Sost-Empresarial: Gestión Organizacional Sostenible', L, 44, 11, '#8A1428', { bold: true });
      text(this.nombre(), L, 56, 22, '#231417', { bold: true });
      text('Código estudiantil ' + this.codigoEst() + this.grupoTxt(), L, 62.5, 10, '#5C4A4D');
      if (cert && this.qr()) {
        pdf.setDrawColor('#231417');
        pdf.setLineWidth(0.6);
        pdf.rect(R - 26, 30, 26, 26);
        pdf.addImage(this.qr()!, 'PNG', R - 25, 31, 24, 24);
        pdf.link(R - 26, 30, 26, 26, { url: this.verifyUrl() });
        text(c!.codigo, R - 13, 60, 7, '#231417', { bold: true, mono: true, align: 'center' });
      }
      let y = 74;
      if (cert) {
        y = parrafo(`Completó el recorrido por las cuatro fases del proceso administrativo (planeación, organización, dirección y control) aplicadas a la gestión sostenible de una empresa, con un desempeño de ${fmt(this.puntos())} granos, nivel ${this.nivel()}.`, L, y, IW, 12, '#231417');
        if (this.puntos() >= 850) {
          pdf.setFillColor('#8A1428');
          pdf.roundedRect(L, y, 70, 8, 4, 4, 'F');
          text('MENCIÓN · LÍDER DE IMPACTO', L + 35, y + 5.4, 9, '#FFFFFF', { bold: true, align: 'center' });
          y += 13;
        }
        sep(y); y += 7;
        text('COMPETENCIAS', L, y, 8.5, '#5C4A4D', { bold: true }); y += 6;
        for (const comp of this.competencias) { y = parrafo('•  ' + comp, L, y, IW, 11, '#231417') + 1.5; }
      } else {
        const comp = this.completados();
        y = parrafo(`Participó en el recorrido de GADMI Sost-Empresarial y completó ${comp.length ? (comp.length === 1 ? 'el módulo de ' : 'los módulos de ') + this.completadosTxt() : 'ninguno de los módulos todavía'}, con ${fmt(this.overall().points)} granos.`, L, y, IW, 12, '#231417');
        sep(y); y += 7;
        text('PARA OBTENER EL CERTIFICADO', L, y, 8.5, '#5C4A4D', { bold: true }); y += 6;
        for (const r of this.requisitos()) { y = parrafo((r.ok ? 'Cumplido: ' : 'Falta: ') + r.t, L, y, IW, 11, r.ok ? '#2C5E31' : '#8A1428') + 1.5; }
        y = parrafo('Te invitamos a retomar el recorrido en la Ruta: tu avance está guardado.', L, y + 3, IW, 11.5, '#8A1428', true);
      }
      // pie: intensidad, fecha, insignias
      const pieY = H - 44;
      sep(pieY - 6);
      text('Intensidad estimada: 8 horas  ·  ' + this.fecha(), L, pieY, 9.5, '#5C4A4D');
      const ins = this.insignias();
      if (ins.length) {
        text('Insignias:', L, pieY + 9, 8.5, '#5C4A4D', { bold: true });
        let bx = L + 17;
        for (const b of ins.slice(0, 12)) {
          const img = iconoPng(b.icon);
          if (img) pdf.addImage(img, 'PNG', bx, pieY + 4.8, 6, 6);
          bx += 7.5;
        }
      }
      if (cert) {
        text('Verifica este certificado en:', L, pieY + 17, 8.5, '#5C4A4D');
        pdf.setTextColor('#8A1428');
        pdf.textWithLink(this.verifyUrl(), L + 40, pieY + 17, { url: this.verifyUrl() });
      }
      text('Entrégalo en Moodle: descarga este PDF, abre la tarea del curso y súbelo' + (cert ? ' con tu código ' + c!.codigo : '') + '.', X, H - 10, 8.5, '#FBF5EC');

      // ---------- Página 2: informe (granos por módulo y bitácoras)
      pdf.addPage();
      fondo();
      encabezado();
      text('INFORME FINAL · CACAO RAÍZ S.A.S.', L, 38, 9.5, '#AC0B32', { bold: true });
      text(this.nombre(), L, 46, 14, '#231417', { bold: true });
      y = 56;
      text('GRANOS POR MÓDULO', L, y, 8.5, '#5C4A4D', { bold: true }); y += 6;
      for (const st of this.progress.moduleStats()) {
        text('Módulo ' + st.module.id + ' · ' + st.module.phase, L, y, 10.5, '#231417');
        text('Ganaste ' + st.points + ' de ' + st.max + ' granos', R, y, 10.5, '#231417', { bold: true, align: 'right' });
        y += 6;
      }
      text('Total: ' + fmt(this.overall().points) + ' de ' + fmt(this.overall().max) + ' granos', R, y + 1, 11, '#8A1428', { bold: true, align: 'right' });
      y += 9;
      sep(y); y += 7;
      text('BITÁCORAS REFLEXIVAS', L, y, 8.5, '#5C4A4D', { bold: true }); y += 6;
      const limite = H - 26;
      for (const m of [1, 2, 3, 4]) {
        const mod = getModule(m);
        const resp = this.progress.reflection(m);
        if (y > limite - 20) { pdf.addPage(); fondo(); encabezado(); y = 38; }
        text('Módulo ' + m + ' · ' + (mod?.phase ?? ''), L, y, 11, '#8A1428', { bold: true }); y += 5.5;
        (mod?.reflections ?? []).forEach((q, k) => {
          if (y > limite - 14) { pdf.addPage(); fondo(); encabezado(); y = 38; }
          y = parrafo(q, L, y, IW, 9.5, '#5C4A4D', true, 1.3) + 0.5;
          y = parrafo((resp[k] ?? '').trim() || 'Sin respuesta.', L, y, IW, 10, '#231417', false, 1.35) + 3;
        });
        y += 2;
      }
      pdf.setProperties({ title: (cert ? 'Certificado' : 'Constancia') + ' GADMI Sost-Empresarial · ' + this.nombre(), author: 'GADMI Sost-Empresarial · UAO', subject: 'Certificado e informe final' });
      pdf.save(cert ? 'certificado-gadmi-' + c!.codigo + '.pdf' : 'constancia-gadmi.pdf');
    } catch (e) {
      console.error(e);
      this.msg.set('No se pudo generar el PDF. Intenta de nuevo.');
    } finally {
      this.busy.set(false);
    }
  }
}

/** Carga una imagen como data URL (para el PDF). */
/** Dibuja el ícono de una insignia (ruta SVG 24×24) en un círculo vino y lo devuelve como PNG. */
function iconoPng(d: string): string | null {
  try {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 96;
    const g = cv.getContext('2d');
    if (!g) return null;
    g.fillStyle = '#8A1428';
    g.beginPath(); g.arc(48, 48, 48, 0, Math.PI * 2); g.fill();
    g.translate(24, 24); g.scale(2, 2);
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 2; g.lineCap = 'round'; g.lineJoin = 'round';
    g.stroke(new Path2D(d));
    return cv.toDataURL('image/png');
  } catch {
    return null;
  }
}
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
