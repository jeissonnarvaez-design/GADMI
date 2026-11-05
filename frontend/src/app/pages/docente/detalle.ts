import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MODULES, getModule } from '../../core/data/modules';
import { ApiService, BitacoraRow, StudentDetail, apiError } from '../../core/services/api.service';
import { Accesibilidad } from '../../shared/accesibilidad';
import { LogoUao } from '../../shared/logo-uao';
import { exportCsv } from './panel';

/** Detalle del estudiante (DocenteDetalle.dc.html): detalle, bitácoras y exportar. */
@Component({
  selector: 'app-detalle-docente',
  imports: [RouterLink, Accesibilidad, LogoUao],
  template: `
    <div style="min-height: 100vh; background: #FBF5EC; display: flex; flex-direction: column; font-family: 'DM Sans', Arial, sans-serif; color: #231417">
      <header style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 32px; background: #FFFFFF; border-bottom: 1px solid #EADFD0">
        <div style="display: flex; align-items: center; gap: 14px">
          <a routerLink="/docente" aria-label="Volver al panel" style="display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 999px; border: 1px solid #EADFD0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"></path></svg></a>
          <app-logo-uao size="sm" class="logo-det" />
          <div style="display: flex; flex-direction: column"><span style="font-size: 13px; color: #5C4A4D">Vista docente</span><span style="font-size: 18px; font-weight: 800">{{ d()?.estudiante?.nombre ?? '…' }} · Grupo {{ d()?.estudiante?.grupo ?? '' }}</span></div>
        </div>
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap">
          <div role="tablist" aria-label="Secciones" style="display: flex; gap: 6px; padding: 5px; border-radius: 999px; background: #FBF5EC">
            @for (t of tabs; track t; let i = $index) {
              <button type="button" role="tab" [attr.aria-selected]="tab() === i ? 'true' : 'false'" (click)="tab.set(i)" [style.background]="tab() === i ? '#231417' : 'transparent'" [style.color]="tab() === i ? '#FFFFFF' : '#231417'" style="min-height: 42px; padding: 0 18px; border-radius: 999px; border: none; font-weight: 800; font-size: 14px; cursor: pointer">{{ t }}</button>
            }
          </div>
          <app-accesibilidad tone="light" />
        </div>
      </header>
      <main style="flex: 1; width: 100%; max-width: 1180px; margin: 0 auto; padding: 26px 32px; box-sizing: border-box; display: flex; flex-direction: column; gap: 18px; justify-content: center">
        @if (error()) { <p role="alert" style="margin: 0; padding: 12px 16px; border-radius: 14px; background: #FFE3DC; color: #8A1428; font-weight: 700">{{ error() }}</p> }
        @if (d(); as det) {
          @if (tab() === 0) {
            <div style="display: flex; flex-wrap: wrap; gap: 16px">
              <section style="flex: 1 1 340px; background: #FFFFFF; border-radius: 22px; padding: 20px; display: flex; flex-direction: column; gap: 12px">
                <span style="font-size: 17px; font-weight: 800">Granos por reto</span>
                @for (r of retos(); track r.n) {
                  <div style="display: grid; grid-template-columns: 1fr 70px 80px; gap: 8px; align-items: center; font-size: 14px; padding: 6px 0; border-bottom: 1px solid #F1E8DC"><span style="font-weight: 600">{{ r.n }}</span><span>{{ r.p }}</span><span style="color: #5C4A4D">{{ r.i }}</span></div>
                }
              </section>
              <section style="flex: 1 1 340px; background: #FFFFFF; border-radius: 22px; padding: 20px; display: flex; flex-direction: column; gap: 12px">
                <span style="font-size: 17px; font-weight: 800">Decisiones clave</span>
                @for (x of decisions(); track x[0]) {
                  <div style="padding: 12px 14px; border-radius: 14px; background: #FBF5EC; font-size: 14px"><strong>{{ x[0] }}</strong> {{ x[1] }}</div>
                } @empty { <span style="font-size: 14px; color: #5C4A4D">Aún no hay decisiones.</span> }
              </section>
            </div>
          }

          @if (tab() === 1) {
            @for (b of det.bitacoras; track b.moduloId) {
              <section style="background: #FFFFFF; border-radius: 22px; padding: 22px; display: flex; flex-direction: column; gap: 14px">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px"><span style="font-size: 13px; font-weight: 800; letter-spacing: 0.08em; color: #AC0B32">BITÁCORA · MÓDULO {{ b.moduloId }}</span>@if (b.revisada) { <span style="font-size: 13px; font-weight: 800; color: #2C5E31">✓ Revisada</span> }</div>
                @for (q of questions(b.moduloId); track $index) {
                  <div style="display: flex; flex-direction: column; gap: 4px; padding-bottom: 12px; border-bottom: 1px solid #F1E8DC"><span style="font-size: 15px; font-weight: 800">{{ q }}</span><span style="font-size: 15px; color: #3D2C2F; line-height: 1.5">{{ b.respuestas[$index] || '—' }}</span></div>
                }
                <label style="display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 700">Comentario para el estudiante (opcional)
                  <textarea rows="3" [value]="comment(b)" (input)="setComment(b, $any($event.target).value)" style="border-radius: 14px; border: 1.5px solid #D9CBBB; padding: 12px; font-size: 15px"></textarea>
                </label>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap">
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700">Calificación (opcional)
                    <select (change)="setGrade(b, $any($event.target).value)" style="min-height: 40px; border-radius: 10px; border: 1px solid #D9CBBB; padding: 0 8px; font-size: 14px; background: #FFFFFF">
                      <option value="" [selected]="grade(b) === ''">Sin nota</option>
                      @for (n of scale; track n) { <option [value]="n" [selected]="grade(b) === '' + n">{{ n.toFixed(1) }}</option> }
                    </select>
                  </label>
                  <button type="button" (click)="review(b)" style="min-height: 46px; padding: 0 20px; border-radius: 999px; border: none; background: #AC0B32; color: #FFFFFF; font-weight: 800; cursor: pointer">Marcar como revisada</button>
                  <span role="status" style="font-size: 14px; color: #2C5E31; font-weight: 700">{{ saved()[b.moduloId] ?? '' }}</span>
                </div>
              </section>
            } @empty {
              <section style="background: #FFFFFF; border-radius: 22px; padding: 22px"><span style="font-size: 15px; color: #5C4A4D">Aún no ha escrito bitácoras.</span></section>
            }
          }

          @if (tab() === 2) {
            <section style="background: #FFFFFF; border-radius: 22px; padding: 22px; display: flex; flex-direction: column; gap: 14px; max-width: 640px">
              <span style="font-size: 20px; font-weight: 800">Exportar notas del grupo</span>
              <span style="font-size: 15px; color: #3D2C2F">Un archivo con nombre, código, granos por módulo, nivel y estado del certificado.</span>
              <button type="button" (click)="export()" style="align-self: flex-start; min-height: 50px; padding: 0 22px; border-radius: 999px; border: none; background: #AC0B32; color: #FFFFFF; font-weight: 800; font-size: 16px; cursor: pointer">Descargar CSV</button>
              <span style="font-size: 14px; color: #5C4A4D; padding: 12px 14px; border-radius: 14px; background: #FBF5EC">A futuro: enviar las notas directo al libro de calificaciones de Moodle.</span>
            </section>
          }
        }
      </main>
    </div>
  `,
  styles: `a{color:#8A1428} a:focus-visible,button:focus-visible,textarea:focus-visible,select:focus-visible{outline:3px solid #231417;outline-offset:2px} button,textarea,select{font-family:inherit}`,
})
export class DetalleDocentePage {
  id = input.required<string>();
  /** ?tab=1 abre directamente las bitácoras. */
  tabParam = input<string | undefined>(undefined, { alias: 'tab' });
  private api = inject(ApiService);
  readonly tabs = ['Detalle', 'Bitácoras', 'Exportar notas'];
  readonly scale = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  tab = signal(0);
  d = signal<StudentDetail | null>(null);
  error = signal('');
  edits = signal<Record<number, { c: string; g: string }>>({});
  saved = signal<Record<number, string>>({});

  ngOnInit() {
    if (this.tabParam()) this.tab.set(Number(this.tabParam()));
    this.api.detalleEstudiante(Number(this.id())).subscribe({ next: (d) => this.d.set(d), error: (e) => this.error.set(apiError(e).message) });
  }

  retos = computed(() => {
    const det = this.d();
    if (!det) return [];
    return MODULES.flatMap((m) => m.exercises).map((e) => {
      const list = det.progreso.attempts[e.id] ?? [];
      const best = list.reduce((b, a) => Math.max(b, a.points), 0);
      return { n: e.code + ' ' + e.title, p: list.length ? best + '/' + e.maxPoints : '—', i: list.length ? list.length + (list.length === 1 ? ' intento' : ' intentos') : '' };
    });
  });

  /** Decisiones clave leídas de las respuestas guardadas (hilo conductor). */
  decisions = computed<[string, string][]>(() => {
    const det = this.d();
    if (!det) return [];
    const get = <T>(id: string) => det.decisiones.find((x) => x.ejercicioId === id)?.opcion as T | undefined;
    const out: [string, string][] = [];
    const foda = get<{ strategy?: string }>('m1-foda');
    if (foda) out.push(['FODA:', foda.strategy === 'a' ? 'eligió la estrategia FO correcta.' : 'eligió otra estrategia.']);
    const metas = get<Record<string, { meta: number; horizon: string }>>('m1-metas');
    if (metas?.['energia']) out.push(['Meta de energía:', `–${metas['energia'].meta} % en el plazo ${metas['energia'].horizon.toLowerCase() || 'sin definir'}.`]);
    const val = get<{ picks?: Record<string, Record<string, string>>; text?: Record<string, string> }>('m1-valores');
    if (val) {
      out.push(['Greenwashing:', val.picks?.['A']?.['v7'] === 'a' ? 'detectó la etiqueta sin datos.' : 'no detectó la etiqueta sin datos.']);
      if (val.text?.['C']) out.push(['Frase bandera:', `«${val.text['C']}».`]);
    }
    const verde = get<string[]>('m2-presupuesto-verde');
    if (verde) out.push(['Presupuesto verde:', verde.length ? 'eligió ' + verde.join(', ') + (verde.includes('f') ? ' (incluye la campaña).' : '.') : 'sin inversiones.']);
    const crisis = get<Record<string, string>>('m3-crisis');
    if (crisis) out.push(['Crisis:', `${['A', 'B', 'C'].filter((k) => crisis[k] === '1').length} de 3 resueltas de forma óptima.`]);
    return out;
  });

  questions(m: number) {
    return getModule(m)?.reflections ?? [];
  }
  comment(b: BitacoraRow) {
    return this.edits()[b.moduloId]?.c ?? b.comentario ?? '';
  }
  grade(b: BitacoraRow) {
    return this.edits()[b.moduloId]?.g ?? (b.calificacion === null ? '' : String(b.calificacion));
  }
  setComment(b: BitacoraRow, c: string) {
    this.edits.update((e) => ({ ...e, [b.moduloId]: { c, g: this.grade(b) } }));
  }
  setGrade(b: BitacoraRow, g: string) {
    this.edits.update((e) => ({ ...e, [b.moduloId]: { c: this.comment(b), g } }));
  }
  review(b: BitacoraRow) {
    const g = this.grade(b);
    this.api.calificarBitacora(this.d()!.estudiante.id!, b.moduloId, g === '' ? null : Number(g), this.comment(b)).subscribe({
      next: () => {
        this.saved.update((s) => ({ ...s, [b.moduloId]: 'Guardado.' }));
        this.d.update((d) => (d ? { ...d, bitacoras: d.bitacoras.map((x) => (x.moduloId === b.moduloId ? { ...x, revisada: true } : x)) } : d));
      },
      error: (e) => this.saved.update((s) => ({ ...s, [b.moduloId]: apiError(e).message })),
    });
  }
  export() {
    exportCsv(this.api, this.d()?.estudiante.grupo, (m) => this.error.set(m));
  }
}
