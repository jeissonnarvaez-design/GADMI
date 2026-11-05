import { Component, OnDestroy, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getModule } from '../../core/data/modules';
import { metersAt } from '../../core/services/company';
import { PreferencesService } from '../../core/services/preferences.service';
import { ProgressService } from '../../core/services/progress.service';
import { GameHeader } from '../../shared/game-header';
import { Personaje } from '../../shared/personaje';

const M = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const S = [170, 168, 160, 158, 150, 146, 140, 132, 128, 118, 112, 104];
const E = [60, 62, 70, 76, 84, 96, 104, 112, 122, 134, 144, 156];
const path = (arr: number[], k: number) => arr.slice(0, k + 1).map((v, i) => (i ? 'L' : 'M') + (i * 54 + 6) + ' ' + v).join(' ');
const lerp = (a: number, b: number, f: number) => Math.round(a + (b - a) * f);
const EVENTS: Record<number, string> = {
  1: 'Junio: un cliente europeo pidió tu primer informe de sostenibilidad.',
  2: 'Junio: llegan los paneles y las familias empiezan el programa agroforestal.',
  3: 'Junio: la temporada alta pone a prueba al equipo.',
  4: 'Junio: la junta pide el reporte con semáforos.',
};
const TITLES: Record<number, string> = { 1: 'Ya tenemos rumbo.', 2: 'La empresa ya tiene estructura.', 3: 'Lideramos con propósito.', 4: 'Medimos y mejoramos.' };
const BADGE: Record<number, string> = { 1: 'brujula-clara', 2: 'arquitectura-verde', 3: 'liderazgo-proposito', 4: 'mirada-esg' };

/** Temporada (Temporada.dc.html): el año avanza y llega el reporte de cierre. */
@Component({
  selector: 'app-temporada',
  imports: [RouterLink, GameHeader, Personaje],
  template: `
    @if (module(); as mod) {
      <div class="game-bg" style="color: #FFFFFF">
        <app-game-header [kicker]="'MÓDULO ' + mod.id + ' · ' + mod.phase.toUpperCase()" [title]="'Temporada ' + mod.year">
          @if (k() < 12 && ready()) { <button type="button" class="gbtn" (click)="skip()" style="min-height: 44px; padding: 0 16px; border: 2px solid #FF836C; background: #2A0B12; color: #FBF5EC; font-weight: 700; cursor: pointer">Saltar</button> }
        </app-game-header>

        @if (!ready()) {
          <main style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 32px; text-align: center">
            <p style="font-size: 20px; font-weight: 700; margin: 0">Termina los retos del módulo para simular el año.</p>
            <a class="gbtn" [routerLink]="'/modulo/' + mod.id" style="padding: 12px 20px; background: #FF836C; color: #1A0609; text-decoration: none; font-weight: 800">Volver al módulo</a>
          </main>
        } @else {
          <main style="flex: 1; width: 100%; max-width: 1180px; margin: 0 auto; padding: 18px 32px 32px; box-sizing: border-box; display: flex; flex-direction: column; gap: 18px; justify-content: center">
            <div style="display: flex; gap: 4px" [attr.aria-label]="'Mes ' + Math.min(k() + 1, 12) + ' de 12'">
              @for (l of months; track l; let i = $index) {
                <div style="flex: 1; display: flex; flex-direction: column; gap: 6px; align-items: center"><span style="width: 100%; height: 8px; border-radius: 999px" [style.background]="i < k() ? '#FF836C' : i === k() ? '#FFFFFF' : 'rgba(255,255,255,0.12)'"></span><span style="font-size: 11px" [style.color]="i <= k() ? '#FFFFFF' : '#7A6A6D'">{{ l }}</span></div>
              }
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: stretch">
              <section class="gpanel" style="flex: 999 1 560px; min-width: 0; background: #2A0B12; border-radius: 24px; padding: 20px; display: flex; flex-direction: column; gap: 12px">
                <span style="font-weight: 800">Ventas y energía por tonelada</span>
                <svg viewBox="0 0 600 220" style="width: 100%; height: auto" role="img" [attr.aria-label]="'Gráfica: las ventas suben y la energía por tonelada baja durante ' + mod.year">
                  <path d="M0 200 H600 M0 140 H600 M0 80 H600 M0 20 H600" stroke="rgba(255,255,255,0.08)"></path>
                  <path [attr.d]="sales()" fill="none" stroke="#FF836C" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
                  <path [attr.d]="energy()" fill="none" stroke="#56C02B" stroke-width="4" stroke-dasharray="2 8" stroke-linecap="round"></path>
                  <path d="M0 150 H600" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.5"></path>
                  <text x="596" y="144" text-anchor="end" font-size="12" fill="#E9DCCF">tu meta de energía</text>
                </svg>
                <div style="display: flex; gap: 18px; font-size: 13px; color: #E9DCCF"><span>━ Ventas</span><span style="color: #56C02B">┅ Energía por tonelada</span></div>
              </section>
              <aside style="flex: 1 1 300px; min-width: 0; display: flex; flex-direction: column; gap: 12px">
                <section class="gpanel" style="background: #2A0B12; border-radius: 24px; padding: 18px; display: flex; flex-direction: column; gap: 10px">
                  @for (m of meters(); track m.label) {
                    <div style="display: flex; flex-direction: column; gap: 3px">
                      <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700"><span>{{ m.label }}</span><span>{{ m.v }}</span></div>
                      <div style="height: 10px; border-radius: 999px; background: rgba(255,255,255,0.1); overflow: hidden"><div class="bar" style="height: 10px; border-radius: 999px" [style.background]="m.c" [style.width]="m.w"></div></div>
                    </div>
                  }
                </section>
                @if (k() >= 6) {
                  <section class="up gpanel" style="background: #FBF5EC; color: #231417; border-radius: 20px; padding: 14px 16px; display: flex; gap: 12px; align-items: center">
                    <app-personaje who="chispa" [size]="60" />
                    <span style="font-size: 15px; font-weight: 700">{{ event() }}</span>
                  </section>
                }
              </aside>
            </div>

            @if (k() >= 12) {
              <section class="up gpanel" style="background: #8A1428; border-radius: 28px; padding: 24px 28px; display: flex; flex-wrap: wrap; align-items: center; gap: 24px">
                <app-personaje who="teo" [size]="120" />
                <div style="flex: 1 1 300px; display: flex; flex-direction: column; gap: 6px">
                  <span class="px" style="font-size: 10px; color: #FFD3C9">AÑO COMPLETADO</span><span style="font-size: 30px; font-weight: 800; letter-spacing: -0.02em">{{ title() }}</span>
                  <span style="font-size: 17px; color: #FBF5EC">{{ stat().points }} / {{ stat().max }} puntos · nota {{ stat().grade.toFixed(1) }} / 5</span>
                </div>
                @if (badge(); as b) {
                  <div class="pop" [style.opacity]="b.earned ? 1 : 0.55" style="display: flex; flex-direction: column; align-items: center; gap: 6px"><span [style.background]="b.earned ? '#FF836C' : '#5C4A4D'" style="width: 76px; height: 76px; border-radius: 999px; display: flex; align-items: center; justify-content: center"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M15.5 8.5l-2 5-5 2 2-5z"></path></svg></span><span style="font-size: 13px; font-weight: 800">{{ b.name }}{{ b.earned ? '' : ' (aún no)' }}</span></div>
                }
                <a class="gbtn glow" [routerLink]="nextLink()" style="display: inline-flex; align-items: center; min-height: 54px; padding: 0 22px; background: #FFFFFF; color: #8A1428; text-decoration: none"><span class="px" style="font-size: 11px">▶ {{ nextLabel() }}</span></a>
              </section>
            }
          </main>
        }
      </div>
    }
  `,
  styles: `
    a{color:#FFFFFF} a:focus-visible,button:focus-visible{outline:3px solid #FF836C;outline-offset:3px}
    @keyframes up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
    @keyframes pop{0%{opacity:0;transform:scale(.5) rotate(-10deg)}70%{transform:scale(1.1)}100%{opacity:1;transform:none}}
    .up{animation:up .5s cubic-bezier(.2,.7,.2,1) both}
    .pop{animation:pop .6s cubic-bezier(.2,.7,.2,1) both}
    .bar{transition:width .3s linear}
    @media (prefers-reduced-motion: reduce){.up,.pop{animation:none}.bar{transition:none}}
  `,
})
export class TemporadaPage implements OnInit, OnDestroy {
  id = input.required<string>();
  private progress = inject(ProgressService);
  private prefs = inject(PreferencesService);
  readonly months = M;
  readonly Math = Math;
  k = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  n = computed(() => Number(this.id()));
  module = computed(() => getModule(this.n()));
  stat = computed(() => this.progress.moduleStat(this.n()));
  ready = computed(() => this.stat().done);
  start = computed(() => (this.stat(), metersAt(this.progress, this.n() - 1)));
  end = computed(() => (this.stat(), metersAt(this.progress, this.n())));
  sales = computed(() => path(S, Math.min(this.k(), 11)));
  energy = computed(() => path(E, Math.min(this.k(), 11)));
  meters = computed(() => {
    const f = Math.min(this.k(), 11) / 11;
    const s = this.start();
    const e = this.end();
    return ([['Ambiental', 'ambiental', '#56C02B'], ['Social', 'social', '#FF836C'], ['Gobernanza', 'gobernanza', '#FBF5EC'], ['Económico', 'economico', '#FCC30B']] as const).map(([label, key, c]) => {
      const v = lerp(s[key], e[key], f);
      return { label, c, v: v + ' %', w: v + '%' };
    });
  });
  event = computed(() => EVENTS[this.n()]);
  title = computed(() => TITLES[this.n()]);
  badge = computed(() => this.progress.badges().find((b) => b.id === BADGE[this.n()]));
  nextLink = computed(() => (this.n() < 4 ? '/modulo/' + (this.n() + 1) : '/inversion'));
  nextLabel = computed(() => (this.n() < 4 ? 'MÓDULO ' + (this.n() + 1) : 'RONDA DE INVERSIÓN'));

  ngOnInit() {
    if (!this.ready()) return;
    if (this.progress.seasonDone(this.n()) || this.prefs.prefs().menosMovimiento) return this.skip();
    this.timer = setInterval(() => (this.k() < 12 ? this.k.update((v) => v + 1) : this.finish()), 650);
  }
  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  skip() {
    this.k.set(12);
    this.finish();
  }
  private finish() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.progress.markSeason(this.n());
  }
}
