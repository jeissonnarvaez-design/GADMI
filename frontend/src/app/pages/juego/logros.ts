import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Badge } from '../../core/services/badges';
import { ProgressService } from '../../core/services/progress.service';
import { Router } from '@angular/router';
import { Hud } from '../../shared/hud';

const STAR = 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z';
type Shape = 'shield' | 'hex' | 'medal';
/** Forma según el tipo: escudo = módulo · hexágono = habilidad · medalla = hito. */
const GROUPS: [string, Shape, string[]][] = [
  ['MÓDULOS', 'shield', ['brujula-clara', 'arquitectura-verde', 'liderazgo-proposito', 'mirada-esg']],
  ['HABILIDADES', 'hex', ['detector-greenwashing', 'presupuesto-equilibrio', 'a-la-primera', 'mejora-continua', 'hilo-conductor']],
  ['HITOS', 'medal', ['voz-propia', 'recorrido-completo']],
];
/** Cómo se gana (texto corto del diseño) e ícono de cada insignia. */
const UI: Record<string, [string, string]> = {
  'brujula-clara': ['Módulo 1 con 200 o más granos.', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z'],
  'arquitectura-verde': ['Módulo 2 con el 80 % o más de sus granos.', 'M3 21V11l5-3v3l5-3v3l5-3v13zM3 21h18'],
  'liderazgo-proposito': ['Módulo 3 con el 80 % o más de sus granos.', STAR],
  'mirada-esg': ['Módulo 4 con el 80 % o más de sus granos.', 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z'],
  'detector-greenwashing': ['Descubre los 4 casos de Brillo.', 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5'],
  'presupuesto-equilibrio': ['Cumple el tope en 2.3 y las metas en 2.5.', 'M12 3v18M5 7h14M5 7l-3 7h6zM19 7l-3 7h6z'],
  'a-la-primera': ['80 % de un módulo sin segundos intentos.', 'M13 2L4 14h7l-1 8 9-12h-7z'],
  'mejora-continua': ['Sube 20 granos al reintentar un reto.', 'M4 17l6-6 4 4 6-8M14 7h6v6'],
  'hilo-conductor': ['Tus 4 objetivos llegan hasta el final.', 'M4 12c4-8 12 8 16 0'],
  'voz-propia': ['Completa las 4 bitácoras.', 'M4 5h16v11H8l-4 4z'],
  'recorrido-completo': ['Termina los 4 módulos.', STAR],
};
const PAL: Record<Shape, Record<string, string>> = {
  shield: { rim: '#FBF5EC', body: '#AC0B32', ring: '#FBF5EC', ink: '#FBF5EC', rib: '#8A1428', rib2: '#8A1428' },
  hex: { rim: '#FBF5EC', body: '#9A5B2E', ring: '#FBF5EC', ink: '#FBF5EC', rib: '#8A1428', rib2: '#8A1428' },
  medal: { rim: '#FBF5EC', body: '#231417', ring: '#FBF5EC', ink: '#FBF5EC', rib: '#AC0B32', rib2: '#8A1428' },
};
const LOCK = { rim: '#4A2A2F', body: '#2A0B12', ring: '#4A2A2F', ink: '#6E5458', rib: '#3A1A20', rib2: '#3A1A20' };
const SEEN_KEY = 'gadmi-sost-empresarial:insignias-vistas:';

/** Mis logros (Logros.dc.html): nivel e insignias SVG (ganada, nueva o bloqueada). */
@Component({
  selector: 'app-logros',
  imports: [Hud, NgTemplateOutlet],
  template: `
    <ng-template #shape let-b>
      @if (b.medal) {
        <svg:path d="M40 72 L26 124 L42 116 L52 128 L62 82 Z" [attr.fill]="b.rib"></svg:path>
        <svg:path d="M80 72 L94 124 L78 116 L68 128 L58 82 Z" [attr.fill]="b.rib2"></svg:path>
        <svg:circle cx="60" cy="56" r="48" [attr.fill]="b.rim"></svg:circle>
        <svg:circle cx="60" cy="56" r="40" [attr.fill]="b.body"></svg:circle>
        <svg:circle cx="60" cy="56" r="33" fill="none" [attr.stroke]="b.ring" stroke-width="2" [attr.stroke-dasharray]="b.dash"></svg:circle>
      }
      @if (b.shield) {
        <svg:path d="M60 4 L108 20 V62 C108 94 87 114 60 126 C33 114 12 94 12 62 V20 Z" [attr.fill]="b.rim"></svg:path>
        <svg:path d="M60 14 L98 27 V62 C98 87 81 104 60 114 C39 104 22 87 22 62 V27 Z" [attr.fill]="b.body"></svg:path>
        <svg:path d="M60 22 L90 32 V62 C90 82 77 96 60 104 C43 96 30 82 30 62 V32 Z" fill="none" [attr.stroke]="b.ring" stroke-width="2" [attr.stroke-dasharray]="b.dash"></svg:path>
      }
      @if (b.hex) {
        <svg:path d="M60 4 L110 33 V93 L60 122 L10 93 V33 Z" [attr.fill]="b.rim"></svg:path>
        <svg:path d="M60 15 L100 38 V88 L60 111 L20 88 V38 Z" [attr.fill]="b.body"></svg:path>
        <svg:path d="M60 24 L92 43 V83 L60 102 L28 83 V43 Z" fill="none" [attr.stroke]="b.ring" stroke-width="2" [attr.stroke-dasharray]="b.dash"></svg:path>
      }
      <svg:path d="M30 30 Q46 16 66 18 Q44 26 34 44 Z" fill="#FFFFFF" [attr.opacity]="b.gloss"></svg:path>
      <svg:g [attr.transform]="b.itf"><svg:path [attr.d]="b.icon" fill="none" [attr.stroke]="b.ink" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></svg:path></svg:g>
    </ng-template>

    <div class="game-bg" style="min-height: 100vh; display: flex; flex-direction: column; color: #231417">
      <app-hud kicker="PROGRESO" title="Mis logros" variant="modulo">
        <!-- El estudiante entra desde Moodle: «Salir» queda discreto aquí, no en Accesibilidad -->
        <button type="button" (click)="salir()" style="min-height: 44px; padding: 0 12px; border: none; background: transparent; color: #FFD3C9; font-size: 14px; font-weight: 700; text-decoration: underline; cursor: pointer">Salir</button>
      </app-hud>
      <main style="flex: 1; width: 100%; max-width: 1180px; margin: 0 auto; padding: 28px 32px; box-sizing: border-box; display: flex; flex-direction: column; gap: 22px">
        <section class="gpanel" style="background: #2A0B12; color: #FFFFFF; border-radius: 26px; padding: 24px 28px; display: flex; flex-direction: column; gap: 14px">
          <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px"><span style="font-size: 28px; font-weight: 800">{{ overall().level.name }}</span><span style="font-size: 16px; color: #E9DCCF">{{ fmt(overall().points) }} / {{ fmt(overall().max) }} granos</span></div>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px">
            <span style="font-size: 16px; color: #E9DCCF">Nota final</span>
            <strong style="font-size: 26px; line-height: 1">{{ nota() }}<span style="font-size: 16px; color: #C9B8A6; font-weight: 600"> / 5</span></strong>
            @if (overall().completed) {
              <span class="px" [style.background]="aprobado() ? '#3F7E44' : '#AC0B32'" style="font-size: 10px; padding: 6px 8px; border-radius: 4px; color: #FFFFFF">{{ aprobado() ? 'APROBADO' : 'AÚN NO APRUEBA' }}</span>
            }
          </div>
          <div style="position: relative; height: 14px; border-radius: 999px; background: rgba(255,255,255,0.12)"><div style="height: 14px; border-radius: 999px; background: #FBF5EC" [style.width]="pct()"></div></div>
          <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); font-size: 12px; color: #C9B8A6">
            @for (t of thresholds(); track t.label; let last = $last) { <span [style.text-align]="last ? 'right' : 'left'">{{ t.label }} · {{ t.at }}</span> }
          </div>
          <span style="font-size: 13px; color: #C9B8A6">Escala de 1 a 5: 1 es la nota más baja, 3 la mínima para aprobar y 5 la máxima.</span>
        </section>
        <div style="display: flex; flex-wrap: wrap; gap: 22px; align-items: stretch">
          <section aria-labelledby="ins" style="flex: 999 1 600px; min-width: 0; display: flex; flex-direction: column; gap: 16px">
            <div style="display: flex; justify-content: space-between; align-items: baseline"><h1 id="ins" class="px" style="margin: 0; font-size: 14px; font-weight: 400; color: #FBF5EC">INSIGNIAS</h1><span class="px" style="font-size: 10px; color: #FBF5EC">{{ got() }} / {{ total() }}</span></div>
            @for (g of groups(); track g.name) {
              <div role="group" [attr.aria-label]="g.name" style="display: flex; flex-direction: column; gap: 8px">
                <span class="px" style="font-size: 10px; color: #C9B8A6; margin-bottom: 4px">{{ g.name }}</span>
                <div style="display: flex; flex-wrap: wrap; gap: 6px">
                  @for (b of g.items; track b.id) {
                    <button type="button" class="bdg" [class.won]="b.on" (click)="sel.set(b.id)" [attr.aria-pressed]="b.id === selId() ? 'true' : 'false'" [attr.aria-label]="b.name + ', ' + b.st.toLowerCase()" style="width: 112px">
                      <svg width="88" height="96" viewBox="0 0 120 130" aria-hidden="true">
                        <ng-container *ngTemplateOutlet="shape; context: { $implicit: b }" />
                        @if (b.locked) {
                          <g transform="translate(78 84)"><circle cx="12" cy="12" r="15" fill="#1A0609" stroke="#6E5458" stroke-width="2"></circle><rect x="5" y="11" width="14" height="10" rx="2" fill="#6E5458"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="#6E5458" stroke-width="2.4"></path></g>
                        }
                        @if (b.isNew) {
                          <path class="spark" d="M104 10 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#FBF5EC"></path>
                          <path class="spark" style="animation-delay: .8s" d="M14 96 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#FBF5EC"></path>
                        }
                      </svg>
                      <span [style.color]="b.nameC" style="font-size: 12px; font-weight: 800; line-height: 1.2; text-align: center; min-height: 29px">{{ b.name }}</span>
                      @if (b.hasProg) { <span aria-hidden="true" style="width: 70px; height: 6px; border-radius: 2px; background: #3A1A20"><span [style.width]="b.progW" style="display: block; height: 6px; border-radius: 2px; background: #FBF5EC"></span></span> }
                      @if (b.isNew) { <span class="px" style="font-size: 10px; padding: 3px 5px; background: #FBF5EC; color: #1A0609; border-radius: 3px">NUEVA</span> }
                    </button>
                  }
                </div>
              </div>
            }
          </section>

          <aside aria-live="polite" class="gpanel" style="flex: 1 1 300px; min-width: 0; background: #FFFFFF; color: #231417; padding: 22px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center">
            @for (d of detail(); track d.id) {
              <div class="bpop" style="display: flex; flex-direction: column; align-items: center; gap: 12px">
                <span class="px" style="font-size: 10px; color: #8A1428">{{ d.st }}</span>
                <svg width="150" height="162" viewBox="0 0 120 130" aria-hidden="true"><ng-container *ngTemplateOutlet="shape; context: { $implicit: d }" /></svg>
                <span style="font-size: 22px; font-weight: 800; color: #8A1428">{{ d.name }}</span>
                <span style="font-size: 15px; color: #1A0609; line-height: 1.4">{{ d.how }}</span>
                @if (d.hasProg) { <span class="px" style="font-size: 10px; color: #8A1428">{{ d.prog }}</span> }
              </div>
            }
          </aside>
        </div>
      </main>
    </div>
  `,
  styles: `
    button{font-family:inherit}
    .bdg{background:none;border:none;padding:6px 4px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;border-radius:10px;color:#FBF5EC;transition:transform .18s}
    .bdg:hover{transform:translateY(-4px) scale(1.04)}
    .bdg[aria-pressed="true"]{background:rgba(251,245,236,.12);outline:2px dashed #FBF5EC;outline-offset:2px}
    .bdg:focus-visible{outline:3px solid #FBF5EC;outline-offset:3px}
    @keyframes bfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    .won svg{animation:bfloat 3.2s ease-in-out infinite;filter:drop-shadow(0 4px 0 rgba(0,0,0,.35))}
    @keyframes spark{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}
    .spark{animation:spark 1.6s ease-in-out infinite;transform-origin:center;transform-box:fill-box}
    @keyframes bpop{0%{transform:scale(.6) rotate(-8deg);opacity:0}70%{transform:scale(1.08)}100%{transform:none;opacity:1}}
    .bpop{animation:bpop .45s cubic-bezier(.2,.7,.2,1) both}
    @media (prefers-reduced-motion: reduce){.bdg{transition:none}.won svg,.spark,.bpop{animation:none}}
  `,
})
export class LogrosPage implements OnDestroy {
  private progress = inject(ProgressService);
  private auth = inject(AuthService);
  private router = inject(Router);
  salir() {
    this.auth.logout();
    this.router.navigate(['/ingreso']);
  }
  overall = this.progress.overall;
  readonly fmt = (n: number) => n.toLocaleString('es-CO');
  private seenKey = SEEN_KEY + (this.auth.student()?.codigo ?? 'local');
  /** Insignias que el estudiante ya vio ganadas (las demás ganadas salen como «NUEVA»). */
  private seen = signal<string[]>(this.readSeen());
  sel = signal<string | null>(null);

  private all = computed(() => {
    const map = new Map(this.progress.badges().map((b) => [b.id, b]));
    return GROUPS.flatMap(([, shape, ids]) => ids.map((id) => this.look(shape, map.get(id)!)));
  });
  groups = computed(() => GROUPS.map(([name, , ids]) => ({ name, items: ids.map((id) => this.all().find((b) => b.id === id)!) })));
  got = computed(() => this.all().filter((b) => b.on).length);
  total = computed(() => this.all().length);
  selId = computed(() => this.sel() ?? (this.all().find((b) => b.isNew) ?? this.all().find((b) => b.on) ?? this.all()[0]).id);
  detail = computed(() => [this.all().find((b) => b.id === this.selId())!]);
  /** Nota de 1 a 5 con una cifra decimal (coma decimal). */
  nota = computed(() => (this.overall().completed ? this.overall().grade.toFixed(1).replace('.', ',') : '—'));
  aprobado = computed(() => this.overall().grade >= 3);
  pct = computed(() => (this.overall().max ? (this.overall().points / this.overall().max) * 100 : 0) + '%');
  /** Umbrales del documento (0/500/700/850 de 1.000) llevados a los puntos del prototipo. */
  thresholds = computed(() => {
    const f = this.overall().max / 1000;
    return [['Explorador/a', 0], ['En formación', 500], ['Sostenible', 700], ['Líder de impacto', 850]].map(([label, at]) => ({ label, at: Math.round((at as number) * f) }));
  });

  private look(shape: Shape, b: Badge) {
    const on = b.earned;
    const isNew = on && !this.seen().includes(b.id);
    const pr = b.progress;
    return {
      id: b.id, name: b.name, how: UI[b.id]?.[0] ?? b.criterion, icon: UI[b.id]?.[1] ?? STAR, ...(on ? PAL[shape] : LOCK),
      shield: shape === 'shield', hex: shape === 'hex', medal: shape === 'medal', on,
      dash: on ? 'none' : '4 4', gloss: on ? '0.22' : '0.04',
      itf: shape === 'medal' ? 'translate(36 32) scale(2)' : 'translate(36 38) scale(2)',
      locked: !on, isNew, hasProg: !on && !!pr,
      progW: pr ? Math.round((pr[0] / pr[1]) * 100) + '%' : '0%', prog: pr ? pr[0] + ' DE ' + pr[1] : '',
      nameC: on ? '#FBF5EC' : '#6E5458',
      st: isNew ? '¡NUEVA!' : on ? 'GANADA' : 'BLOQUEADA', stC: on ? '#FBF5EC' : '#6E5458',
    };
  }

  private readSeen(): string[] {
    try {
      return JSON.parse(localStorage.getItem(this.seenKey) ?? '[]');
    } catch {
      return [];
    }
  }
  /** Al salir de la pantalla, las insignias nuevas ya cuentan como vistas. */
  ngOnDestroy() {
    try {
      localStorage.setItem(this.seenKey, JSON.stringify(this.all().filter((b) => b.on).map((b) => b.id)));
    } catch {
      /* sin almacenamiento local */
    }
  }
}
