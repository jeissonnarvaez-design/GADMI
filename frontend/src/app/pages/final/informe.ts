import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { metersAt } from '../../core/services/company';
import { ProgressService } from '../../core/services/progress.service';
import { Accesibilidad } from '../../shared/accesibilidad';
import { Personaje } from '../../shared/personaje';

/** Informe «CACAO Raíz 2030» (Informe.dc.html): vista previa con datos reales. */
@Component({
  selector: 'app-informe',
  imports: [RouterLink, Accesibilidad, Personaje],
  template: `
    <div style="min-height: 100vh; background: #FBF5EC; display: flex; flex-direction: column; font-family: 'DM Sans', Arial, sans-serif; color: #231417">
      <header style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 32px; background: #FFFFFF; border-bottom: 1px solid #EADFD0">
        <div style="display: flex; align-items: center; gap: 14px">
          <a routerLink="/barra" aria-label="Volver" style="display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 999px; border: 1px solid #EADFD0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"></path></svg></a>
          <span style="font-size: 18px; font-weight: 800">Informe «CACAO Raíz 2030»</span>
        </div>
        <app-accesibilidad tone="light" />
      </header>
      <main style="flex: 1; width: 100%; max-width: 1180px; margin: 0 auto; padding: 28px 32px; box-sizing: border-box; display: flex; flex-wrap: wrap; gap: 28px; align-items: center; align-content: center">
        <section aria-label="Vista previa del informe" style="flex: 1.3 1 520px; min-width: 0; display: flex; flex-direction: column; gap: 12px">
          <div style="background: #FFFFFF; border-radius: 8px; box-shadow: 0 18px 44px rgba(35,20,23,0.12); padding: 36px 40px; display: flex; flex-direction: column; gap: 16px; border-top: 8px solid #8A1428">
            <div style="display: flex; justify-content: space-between; align-items: center"><img src="/assets/logo-uao.png" alt="UAO" style="height: 24px; width: auto"><span style="font-size: 12px; color: #5C4A4D">Página {{ p() + 1 }} de 4</span></div>
            <span style="font-size: 12px; font-weight: 800; letter-spacing: 0.1em; color: #AC0B32">{{ page().kicker }}</span>
            <span style="font-size: 28px; font-weight: 800; letter-spacing: -0.02em">{{ page().title }}</span>
            @for (r of page().rows; track r.l) {
              <div style="display: flex; flex-direction: column; gap: 6px">
                <div style="display: flex; justify-content: space-between; font-size: 14px"><span style="font-weight: 700">{{ r.l }}</span><span>{{ r.v }}</span></div>
                <div style="height: 8px; border-radius: 999px; background: #F1E8DC"><div [style.width]="r.w" style="height: 8px; border-radius: 999px; background: #AC0B32"></div></div>
              </div>
            }
            <p style="margin: 6px 0 0; font-size: 14px; line-height: 1.5; color: #3D2C2F">{{ page().note }}</p>
          </div>
          <div role="group" aria-label="Páginas" style="display: flex; gap: 8px; justify-content: center">
            @for (n of [0, 1, 2, 3]; track n) {
              <button type="button" (click)="p.set(n)" [attr.aria-pressed]="p() === n ? 'true' : 'false'" [style.background]="p() === n ? '#231417' : '#FFFFFF'" [style.color]="p() === n ? '#FFFFFF' : '#231417'" style="min-width: 44px; min-height: 44px; border-radius: 999px; border: 1px solid #D9CBBB; font-weight: 800; cursor: pointer">{{ n + 1 }}</button>
            }
          </div>
        </section>
        <aside style="flex: 1 1 340px; min-width: 0; display: flex; flex-direction: column; gap: 16px">
          <button type="button" (click)="msg.set('La descarga en PDF (jsPDF) está pendiente en este prototipo.')" style="min-height: 58px; border-radius: 999px; border: none; background: #AC0B32; color: #FFFFFF; font-weight: 800; font-size: 17px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"></path></svg>Descargar informe y certificado (PDF)</button>
          @if (msg()) { <span role="status" style="font-size: 14px; color: #8A1428; font-weight: 700">{{ msg() }}</span> }
          <section style="background: #FFFFFF; border-radius: 22px; padding: 20px; display: flex; flex-direction: column; gap: 12px">
            <span style="font-size: 17px; font-weight: 800">Entrégalo en Moodle</span>
            @for (s of steps; track s[0]) {
              <div style="display: flex; gap: 12px; align-items: center"><span style="width: 32px; height: 32px; flex-shrink: 0; border-radius: 999px; background: #FBF5EC; color: #8A1428; font-weight: 800; display: flex; align-items: center; justify-content: center">{{ s[0] }}</span><span style="font-size: 15px">{{ s[1] }}</span></div>
            }
          </section>
          <div style="display: flex; align-items: center; gap: 12px">
            <app-personaje who="chispa" [size]="70" />
            <span style="font-size: 15px; font-weight: 700">Tu informe sale de tus propias decisiones. Nadie más tiene uno igual.</span>
          </div>
        </aside>
      </main>
    </div>
  `,
  styles: `a{color:#8A1428} a:focus-visible,button:focus-visible{outline:3px solid #231417;outline-offset:3px} button{font-family:inherit}`,
})
export class InformePage {
  private progress = inject(ProgressService);
  p = signal(0);
  msg = signal('');
  readonly steps = [['1', 'Descarga el PDF.'], ['2', 'Abre la tarea que dejó la profe en Moodle.'], ['3', 'Sube el archivo y envía.']];

  private pages = computed(() => {
    const stats = this.progress.moduleStats();
    const o = this.progress.overall();
    const m = metersAt(this.progress, 4);
    const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
    const metas = this.progress.lastAnswers<Record<string, { indicator: string }>>('m1-metas');
    const IND: Record<string, string> = { energia: 'kwh', familias: 'fam', ventas: 'ven', gobernanza: 'hit' };
    const withInd = metas ? Object.entries(IND).filter(([k, v]) => metas[k]?.indicator === v).length : 0;
    const verde = this.progress.best('m2-presupuesto-verde');
    const crisis = this.progress.lastAnswers<Record<string, string>>('m3-crisis') ?? {};
    const optimas = ['A', 'B', 'C'].filter((k) => crisis[k] === '1').length;
    const cuellos = this.progress.lastAnswers<{ marked: string[] }>('m4-cuellos-botella');
    const detectados = (cuellos?.marked ?? []).filter((x) => ['energia', 'residuos', 'accidentalidad'].includes(x)).length;
    const bit = (id: number) => pct(this.progress.reflection(id).filter((t) => t.trim().length >= 10).length, 3);
    return [
      { kicker: 'RESUMEN', title: `${o.level.name} · ${o.points} puntos`, rows: stats.map((s) => ({ l: s.module.phase.split(' ')[0], v: `${s.points} / ${s.max}`, w: pct(s.points, s.max) + '%' })), note: `Puntaje por módulo. Nota global ${o.grade.toFixed(1)} / 5 (3,0 mínimo).` },
      { kicker: 'TU EMPRESA EN 2030', title: 'Cómo quedó CACAO Raíz', rows: [['Ambiental', m.ambiental], ['Social', m.social], ['Gobernanza', m.gobernanza], ['Económico', m.economico]].map(([l, v]) => ({ l: l as string, v: v + ' %', w: v + '%' })), note: 'Medidores al cierre de la última temporada.' },
      { kicker: 'TUS DECISIONES', title: 'Lo que elegiste, módulo a módulo', rows: [['Objetivos con indicador', pct(withInd, 4)], ['Presupuesto verde en metas', verde ? pct(verde.points, verde.max) : 0], ['Crisis resueltas de forma óptima', pct(optimas, 3)], ['Cuellos de botella detectados', pct(detectados, 3)]].map(([l, v]) => ({ l: l as string, v: v + ' %', w: v + '%' })), note: 'Incluye tu organigrama y tu plan de acción.' },
      { kicker: 'TUS REFLEXIONES', title: 'Las 4 bitácoras', rows: stats.map((s) => ({ l: s.module.phase.split(' ')[0], v: bit(s.module.id) + ' %', w: bit(s.module.id) + '%' })), note: 'Tus respuestas completas, tal como las escribiste.' },
    ];
  });
  page = computed(() => this.pages()[this.p()]);
}
