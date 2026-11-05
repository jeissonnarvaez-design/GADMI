import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getModule } from '../../core/data/modules';
import { ProgressService } from '../../core/services/progress.service';
import { RETOS_JSON } from '../../retos/registry';
import { Accesibilidad } from '../../shared/accesibilidad';
import { Escuchar } from '../../shared/escuchar';
import { Personaje, Who } from '../../shared/personaje';

/** Intro de módulo (IntroModulo.dc.html): encargo de la junta y retos del año. */
@Component({
  selector: 'app-intro-modulo',
  imports: [RouterLink, Accesibilidad, Personaje, Escuchar],
  template: `
    @if (module(); as m) {
      <div class="game-bg" style="color: #FFFFFF">
        <header style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 28px; background: #2A0B12; border-bottom: 3px solid #FF836C; color: #FBF5EC">
          <div style="display: flex; align-items: center; gap: 14px">
            <a routerLink="/ruta" aria-label="Volver" style="display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: 2px solid #FF836C; border-radius: 6px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FBF5EC" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"></path></svg></a>
            <div style="display: flex; flex-direction: column; gap: 6px"><span class="px" style="font-size: 10px; color: #FF836C">{{ m.intro.scene.toUpperCase() }}</span><span style="font-size: 18px; font-weight: 800">Módulo {{ m.id }} · {{ m.phase }}</span></div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px"><app-accesibilidad tone="dark" /></div>
        </header>
        <main style="flex: 1; width: 100%; max-width: 1180px; margin: 0 auto; padding: 0 32px 40px; box-sizing: border-box; display: flex; flex-wrap: wrap; align-items: center; align-content: center; gap: 40px">
          <section style="flex: 1 1 460px; display: flex; flex-direction: column; gap: 18px">
            @if (!open()) {
              <span class="up px" style="align-self: flex-start; font-size: 11px; padding: 8px 10px; background: #5C4A4D; color: #FBF5EC">BLOQUEADO · {{ m.year }}</span>
              <h1 class="up d1" style="margin: 0; font-size: 84px; line-height: 0.92; font-weight: 800; letter-spacing: -0.04em; color: #FFFFFF">{{ m.phase.split(' ')[0] }}</h1>
              <p class="up d2" style="margin: 0; font-size: 22px; color: #E9DCCF">Se abre al terminar el módulo {{ m.id - 1 }}.</p>
            } @else {
              <span class="up px" style="align-self: flex-start; font-size: 11px; padding: 8px 10px; background: #FF836C; color: #1A0609">NUEVA MISIÓN · {{ m.year }}</span>
              <h1 class="up d1" style="margin: 0; font-size: 84px; line-height: 0.92; font-weight: 800; letter-spacing: -0.04em; color: #FFFFFF; hyphens: manual">{{ m.id === 1 ? 'Planea­ción' : m.phase.split(' ')[0] }}</h1>
              <div class="up d2" style="display: flex; align-items: center; gap: 12px"><p style="margin: 0; font-size: 22px; color: #E9DCCF">{{ m.intro.goal }}</p><app-escuchar [who]="who()" [text]="m.intro.text + ' ' + m.intro.goal" label="Escuchar el encargo" /></div>
              <ol class="up d3" style="list-style: none; margin: 6px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; max-width: 520px">
                @for (r of retos(); track r.code) {
                  <li><a [routerLink]="'/reto/' + r.code" style="display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 4px; border: 2px solid rgba(255,131,108,0.5); background: rgba(255,131,108,0.06); font-size: 15px; font-weight: 700; text-decoration: none; color: #FFFFFF"><span class="px" style="font-size: 10px; color: #FF836C">{{ r.code }}</span>{{ r.title }}@if (r.done) { <span aria-label="hecho" style="margin-left: auto; color: #56C02B">✓</span> }</a></li>
                }
              </ol>
              <div class="up d4" style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px">
                <a class="gbtn glow" [routerLink]="cta().link" style="display: inline-flex; align-items: center; gap: 10px; min-height: 58px; padding: 0 30px; background: #FF836C; color: #1A0609; text-decoration: none"><span class="px" style="font-size: 13px">▶ {{ cta().label }}</span></a>
              </div>
            }
          </section>
          <section [attr.aria-label]="m.intro.scene" style="flex: 1 1 460px; position: relative; height: 480px">
            <svg viewBox="0 0 460 420" style="position: absolute; inset: 0; width: 100%; height: 100%" aria-hidden="true">
              <ellipse cx="230" cy="300" rx="200" ry="56" fill="#3D2C2F"></ellipse>
              <circle class="pop d1" cx="90" cy="230" r="26" fill="#5C4A4D"></circle><rect class="pop d1" x="62" y="256" width="56" height="44" rx="20" fill="#5C4A4D"></rect>
              <circle class="pop d2" cx="370" cy="230" r="26" fill="#5C4A4D"></circle><rect class="pop d2" x="342" y="256" width="56" height="44" rx="20" fill="#5C4A4D"></rect>
              <circle class="pop d3" cx="300" cy="200" r="22" fill="#6E5A5D"></circle><rect class="pop d3" x="276" y="222" width="48" height="36" rx="18" fill="#6E5A5D"></rect>
              <rect x="190" y="282" width="80" height="10" rx="5" fill="#FBF5EC" opacity="0.6"></rect>
            </svg>
            <div class="up d5" style="position: absolute; left: 50%; bottom: 40px; transform: translateX(-50%)"><app-personaje [who]="who()" [size]="190" /></div>
          </section>
        </main>
      </div>
    }
  `,
  styles: `
    a{color:#FFFFFF} a:focus-visible,button:focus-visible{outline:3px solid #FF836C;outline-offset:3px}
    @keyframes up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
    @keyframes pop{0%{opacity:0;transform:scale(.4)}100%{opacity:1;transform:scale(1)}}
    .up{animation:up .7s cubic-bezier(.2,.7,.2,1) both}
    .pop{transform-box:fill-box;transform-origin:center;animation:pop .5s cubic-bezier(.2,.7,.2,1) both}
    .d1{animation-delay:.3s}.d2{animation-delay:.6s}.d3{animation-delay:.9s}.d4{animation-delay:1.2s}.d5{animation-delay:1.5s}
    @media (prefers-reduced-motion: reduce){.up,.pop{animation:none}}
  `,
})
export class IntroModuloPage {
  id = input.required<string>();
  private progress = inject(ProgressService);
  module = computed(() => getModule(Number(this.id())));
  open = computed(() => (this.progress.moduleStats(), this.progress.isModuleOpen(Number(this.id()))));
  who = computed(() => (this.module()?.intro.character.toLowerCase() ?? 'teo') as Who);
  retos = computed(() => {
    this.progress.moduleStats();
    return (this.module()?.exercises ?? []).map((e) => ({ code: e.code, title: RETOS_JSON[e.code]?.title ?? e.title, done: this.progress.isCompleted(e.id) }));
  });
  cta = computed(() => {
    const m = this.module()!;
    const next = m.exercises.find((e) => !this.progress.isCompleted(e.id));
    if (next) return { link: '/reto/' + next.code, label: this.retos().some((r) => r.done) ? 'CONTINUAR' : 'COMENZAR' };
    if (!this.progress.seasonDone(m.id)) return { link: '/bitacora/' + m.id, label: 'BITÁCORA Y CIERRE' };
    return { link: '/temporada/' + m.id, label: 'VER TEMPORADA' };
  });
}
