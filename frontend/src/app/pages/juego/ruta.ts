import { Component, ElementRef, HostListener, Injector, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MODULES } from '../../core/data/modules';
import { ApiService, BoardMessage } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { metersAt } from '../../core/services/company';
import { ProgressService } from '../../core/services/progress.service';
import { RETOS_JSON } from '../../retos/registry';
import { Accesibilidad } from '../../shared/accesibilidad';
import { ObjetivoCurso } from '../../shared/objetivo-curso';
import { Tour, TourStep } from '../../shared/tour';
import { MapaIlustracion, SceneLayers, ZoneId, ZoneState } from './mapa/mapa-ilustracion';

const YEARS = [2026, 2027, 2028, 2029, 2030];
const PHASE = ['Diagnóstico', 'Planeación', 'Organización', 'Dirección', 'Control'];
type Dim = 'Ambiental' | 'Social' | 'Gobernanza' | 'Económico';
const DIMS: [Dim, 'ambiental' | 'social' | 'gobernanza' | 'economico'][] = [['Ambiental', 'ambiental'], ['Social', 'social'], ['Gobernanza', 'gobernanza'], ['Económico', 'economico']];
const MCOL: Record<Dim, string> = { Ambiental: '#3F7E44', Social: '#FF836C', Gobernanza: '#8A1428', 'Económico': '#9A5B2E' };
const MICON: Record<Dim, string> = { Ambiental: 'M12 21v-8M12 13c-4 0-6-3-6-7 4 0 6 3 6 7zM12 13c4 0 6-3 6-7-4 0-6 3-6 7z', Social: 'M9 7a3 3 0 1 0 0 .1M3 20v-1a6 6 0 0 1 12 0v1M17 11a2.5 2.5 0 1 0 0-.1M15 20v-1a4 4 0 0 1 6-3.5', Gobernanza: 'M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z', 'Económico': 'M4 17l6-6 4 4 6-8M14 7h6v6' };
const MTIP: Record<Dim, string> = {
  Ambiental: 'Energía, residuos y bosque. Sube con decisiones como paneles solares o compostaje.',
  Social: 'Bienestar del equipo y de las 120 familias: salarios, capacitación, rotación.',
  Gobernanza: 'Ética y transparencia: código, canal de denuncias e informe de sostenibilidad.',
  'Económico': 'Ventas y margen. Sin dinero no hay sostenibilidad posible.',
};
/** ODS: número, reto que lo logra (con nota ≥ 3) y nombre. */
const ODS: [number, string, string][] = [[7, 'm2-presupuesto-verde', 'Energía asequible y no contaminante'], [8, 'm3-crisis', 'Trabajo decente'], [12, 'm1-valores', 'Producción y consumo responsables'], [13, 'm4-cuellos-botella', 'Acción por el clima'], [15, 'm1-foda', 'Vida de ecosistemas terrestres']];

/** Un reto suelto (módulo 1) o un módulo completo (2–4) dentro del menú de una zona. */
type Item = { kind: 'reto'; code: string } | { kind: 'modulo'; module: number };
const ZONES: { id: ZoneId; name: string; x: string; y: string; icon: string; items: Item[] }[] = [
  { id: 'sala', name: 'Sala de juntas', x: '57%', y: '60%', icon: 'M4 21V4M4 4h12l-2 4 2 4H4', items: [{ kind: 'reto', code: '1.1' }, { kind: 'reto', code: '1.4' }, { kind: 'modulo', module: 4 }] },
  { id: 'mercado', name: 'Mercado', x: '16%', y: '30%', icon: 'M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', items: [{ kind: 'reto', code: '1.2' }, { kind: 'reto', code: '1.3' }] },
  { id: 'planta', name: 'Planta', x: '80%', y: '36%', icon: 'M3 21V11l5-3v3l5-3v3l5-3v13zM3 21h18', items: [{ kind: 'modulo', module: 2 }] },
  { id: 'finca', name: 'Finca', x: '24%', y: '72%', icon: 'M3 11l9-7 9 7M5 10v10h14V10', items: [{ kind: 'modulo', module: 3 }] },
];
const TOOLS = [
  ['Mis logros', 'logros', 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z'],
  ['Bitácora', 'bitacora', 'M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4zM8 9h8M8 13h6'],
  ['Objetivo del curso', 'objetivo', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z'],
];
const TOUR: TourStep[] = [
  { target: 'tiempo', text: 'Tus años como gerente. Los pasados se pueden revivir.' },
  { target: 'mapa', text: 'Toca una zona con borde coral para ver sus retos.' },
  { target: 'tablero', text: 'Así va tu empresa. Toca un medidor para saber qué mide.' },
  { target: 'mision', text: 'Aquí sigues donde quedaste.' },
  { target: 'accesibilidad', text: 'Ajusta subtítulos, voz y texto cuando quieras.' },
];
type RetoState = 'open' | 'done' | 'locked';

/** Ruta (Mapa.dc.html): pantalla central del juego. */
@Component({
  selector: 'app-ruta',
  imports: [RouterLink, Accesibilidad, MapaIlustracion, ObjetivoCurso, Tour],
  templateUrl: './ruta.html',
  styles: `
    a{color:#8A1428} a:focus-visible,button:focus-visible,[tabindex]:focus-visible{outline:3px solid #FF836C;outline-offset:3px} button{font-family:inherit}
    @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(255,131,108,.7)}100%{box-shadow:0 0 0 18px rgba(255,131,108,0)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    .pulse{animation:pulse 1.6s ease-out infinite}
    .float{animation:float 5s ease-in-out infinite}
    .up{animation:up .35s cubic-bezier(.2,.7,.2,1) both}
    .pin{transition:transform .18s}.pin:hover{transform:scale(1.07)}
    .node{transition:transform .18s}.node:hover{transform:scale(1.1)}
    @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
    .bounce{animation:bounce 1.2s ease-in-out infinite}
    .menu-x{display:flex;align-items:center;gap:10px;width:100%;min-height:44px;padding:0 10px;border:none;border-top:1px solid #EADFD0;background:transparent;color:#231417;font-size:15px;font-weight:600;cursor:pointer;text-align:left}
    .mapa{height:618px}.lado{height:618px}
    @media (max-width: 900px){.mapa{height:520px}.lado{height:auto}.linea{width:24px !important}.nodo{width:64px !important}}
    @media (max-width: 560px){
      .mapa{height:440px}.linea{width:8px !important}.nodo{width:56px !important}
      .pin{font-size:12px !important;padding:4px 10px 4px 4px !important;gap:6px !important}
      .pin > span:first-child{width:24px !important;height:24px !important}
      [role=menu],[role=tooltip]{max-width:calc(100vw - 48px)}
    }
    @media (prefers-reduced-motion: reduce){.pulse,.float,.up,.bounce{animation:none}.pin,.node{transition:none}}
  `,
})
export class RutaPage {
  private progress = inject(ProgressService);
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);
  readonly tourSteps = TOUR;
  private tour = viewChild(Tour);

  /** Año que se mira (índice 0–4). null = hoy. */
  view = signal<number | null>(null);
  zone = signal<number | null>(null);
  tip = signal<string | null>(null);
  meter = signal<Dim | null>(null);
  event = signal(false);
  objetivo = signal(false);
  messages = signal<BoardMessage[]>([]);

  stats = this.progress.moduleStats;
  overall = this.progress.overall;

  /** Año actual: 2026 es el diagnóstico; cada módulo cerrado (retos + temporada) avanza un año. */
  cur = computed(() => Math.min(4, 1 + this.stats().filter((s) => s.done && this.progress.seasonDone(s.module.id)).length));
  v = computed(() => this.view() ?? this.cur());
  memory = computed(() => this.v() < this.cur());
  curYear = computed(() => String(YEARS[this.cur()]));
  curPhase = computed(() => PHASE[this.cur()]);
  viewYear = computed(() => YEARS[this.v()]);
  tools = computed(() => TOOLS.map(([label, key, icon]) => ({ label, key, icon, href: key === 'logros' ? '/logros' : key === 'bitacora' ? '/bitacora/' + Math.max(1, this.cur()) : null })));

  years = computed(() =>
    YEARS.map((yr, i) => {
      const cur = this.cur();
      const past = i < cur, now = i === cur, future = i > cur;
      const tipText = past ? 'Ver cómo era tu empresa en ' + yr : future ? 'Se abre al cerrar ' + PHASE[i - 1] + '.' : '';
      const viewing = this.v() === i;
      return {
        i, yr, past, now, future, line: i > 0, lineC: i <= cur ? '#FF836C' : '#4A2A2F', phase: PHASE[i],
        c: future ? '#6E5458' : '#FBF5EC', c2: future ? '#6E5458' : '#C9B8A6',
        viewing, bg: viewing && past ? '#FF836C' : '#2A0B12', ic: viewing && past ? '#1A0609' : '#FF836C',
        aria: past ? 'Recuerdo ' + yr + ': ' + PHASE[i] : now ? 'Hoy, ' + yr + ': ' + PHASE[i] : yr + ' bloqueado. ' + tipText,
        tip: this.tip() === 'y' + i && !now, tipText,
      };
    }),
  );

  /** Capas de la escena con las decisiones tomadas hasta el año que se mira. */
  scene = computed<SceneLayers>(() => {
    this.stats();
    const v = this.v();
    const has = (id: string) => Number(id.charAt(1)) <= v;
    const ans = <T>(id: string) => (has(id) ? this.progress.lastAnswers<T>(id) : undefined);
    const pass = (id: string) => has(id) && (this.progress.best(id)?.grade ?? 0) >= 3;
    const verde = ans<string[]>('m2-presupuesto-verde') ?? [];
    const crisis = ans<Record<string, string>>('m3-crisis') ?? {};
    const cleaner = (verde.includes('a') ? 1 : 0) + (verde.includes('b') ? 1 : 0);
    return {
      flag: pass('m1-brujula'), solar: verde.includes('a'), compost: verde.includes('c'), forest: verde.includes('d'),
      smoke: cleaner === 0 ? 3 : cleaner === 1 ? 2 : 0, lit: pass('m1-metas') || crisis['B'] === '1', people: crisis['A'] === '1',
    };
  });

  // ---------- Zonas y retos
  private exercise(code: string) {
    return MODULES.flatMap((m) => m.exercises).find((e) => e.code === code)!;
  }
  /** El módulo m está abierto cuando es el año en curso (o uno anterior). */
  private moduleOpen(m: number) {
    return m <= this.cur() && this.progress.isModuleOpen(m);
  }
  /** Los retos de un módulo se juegan en orden: abierto = el primero sin hacer. */
  private retoState(code: string): RetoState {
    const e = this.exercise(code);
    if (this.progress.isCompleted(e.id)) return 'done';
    if (!this.moduleOpen(e.module)) return 'locked';
    const list = MODULES[e.module - 1].exercises;
    const first = list.find((x) => !this.progress.isCompleted(x.id));
    return first?.id === e.id ? 'open' : 'locked';
  }
  private itemInfo(it: Item) {
    if (it.kind === 'reto') {
      const e = this.exercise(it.code);
      return { module: e.module, state: this.retoState(it.code), name: it.code + ' ' + (RETOS_JSON[it.code]?.title ?? e.title), pts: e.maxPoints + ' pts', link: '/reto/' + it.code };
    }
    const m = MODULES[it.module - 1];
    const s = this.stats()[it.module - 1];
    const state: RetoState = s.done ? 'done' : this.moduleOpen(it.module) ? 'open' : 'locked';
    const codes = m.exercises.map((e) => e.code);
    return { module: it.module, state, name: codes[0] + ' a ' + codes[codes.length - 1] + ' ' + m.phase, pts: s.max + ' pts', link: '/modulo/' + it.module };
  }

  zones = computed(() => {
    this.stats();
    const cur = this.cur();
    const tip = this.tip();
    return ZONES.map((z, i) => {
      const items = z.items.map((it) => this.itemInfo(it));
      const ss = items.map((x) => x.state);
      const st: ZoneState = ss.includes('open') ? 'open' : ss.every((s) => s === 'done') ? 'done' : ss.includes('done') ? 'done-part' : 'locked';
      const firstMod = Math.min(...items.map((x) => x.module));
      const sel = this.zone() === i;
      /** Zona del año en curso cuyos retos aún esperan a que termines el anterior. */
      const inOrder = st === 'locked' && items.some((x) => x.module === cur && this.moduleOpen(x.module));
      const tipText =
        inOrder ? 'Sigue en orden: termina el reto anterior.'
        : st === 'locked' ? '🔒 Completa ' + PHASE[firstMod - 1] + ' (' + YEARS[firstMod - 1] + ') para abrir esta zona.'
        : st === 'open' ? '¡Hay retos esperándote!'
        : st === 'done' ? '✓ Zona completada'
        : items.some((x) => x.module === cur) ? 'Sigue en orden: termina el reto anterior.' : 'Vuelves aquí más adelante.';
      return {
        ...z, st, i, items, sel, tipText, inOrder, zi: tip === 'z' + i || sel ? 4 : 2,
        aria: z.name + '. ' + tipText,
        bg: sel ? '#231417' : st === 'locked' ? '#E9E4DE' : '#FFFFFF', fg: sel ? '#FFFFFF' : st === 'locked' ? '#6E6563' : '#231417',
        bd: sel ? '#FF836C' : st === 'open' ? '#FF836C' : st === 'locked' ? '#B5A9A6' : '#3F7E44',
        dot: st === 'open' ? '#AC0B32' : st === 'locked' ? '#9A8F8C' : '#3F7E44',
        pinIcon: st === 'locked' ? 'M5 11h14v10H5zM8 11V8a4 4 0 0 1 8 0v3' : st === 'done' ? 'M5 12l5 5 9-10' : z.icon,
        op: st === 'locked' ? '0.9' : '1',
        menu: sel && (st !== 'locked' || inOrder),
        showTip: tip === 'z' + i && !(sel && (st !== 'locked' || inOrder)),
      };
    });
  });
  zoneStates = computed(() => Object.fromEntries(this.zones().map((z) => [z.id, z.st])) as Record<ZoneId, ZoneState>);

  // ---------- Novedad de la junta (viene de la base de datos)
  boardMessage = computed(() => this.messages().find((m) => m.anio === YEARS[this.cur()]) ?? null);

  // ---------- Tablero
  meters = computed(() => {
    this.stats();
    const v = this.v();
    const now = metersAt(this.progress, v);
    const prev = v > 0 ? metersAt(this.progress, v - 1) : now;
    return DIMS.map(([label, key]) => {
      const val = Math.min(100, now[key]);
      const d = val - Math.min(100, prev[key]);
      const n = Math.round(val / 10);
      return {
        label, icon: MICON[label], c: MCOL[label], v: val,
        trend: v === 0 ? '' : d > 0 ? '▲ +' + d : d < 0 ? '▼ ' + d : '■ 0', tc: d > 0 ? '#56C02B' : d < 0 ? '#FF836C' : '#C9B8A6',
        cells: Array.from({ length: 10 }, (_, k) => (k < n ? MCOL[label] : '#4A2A2F')),
        open: this.meter() === label, tip: MTIP[label],
        aria: label + ': ' + val + ' de 100' + (v === 0 ? '' : d > 0 ? ', sube ' + d : d < 0 ? ', baja ' + -d : ', igual') + ' frente al año anterior',
      };
    });
  });
  ods = computed(() => {
    this.stats();
    const v = this.v();
    return ODS.map(([n, ex, name], i) => {
      const on = Number(ex.charAt(1)) <= v && (this.progress.best(ex)?.grade ?? 0) >= 3;
      return {
        n, delay: i * -0.9 + 's', aria: 'ODS ' + n + ': ' + name + (on ? ' (logrado)' : ' (aún no)'),
        bg: on ? 'rgba(255,131,108,0.28)' : 'rgba(255,255,255,0.06)', bd: on ? '#FF836C' : 'rgba(255,255,255,0.25)', fg: on ? '#FFFFFF' : '#8C7A7D',
      };
    });
  });

  // ---------- Siguiente misión: el siguiente reto pendiente
  mission = computed(() => {
    this.stats();
    for (const s of this.stats()) {
      const m = s.module;
      const pending = m.exercises.find((e) => !this.progress.isCompleted(e.id));
      if (pending) {
        const started = m.exercises.some((e) => this.progress.isCompleted(e.id));
        if (m.id > 1 && !started) return { text: 'Intro del módulo ' + m.id + ' · ' + m.phase, link: '/modulo/' + m.id };
        const zone = ZONES.find((z) => z.items.some((it) => (it.kind === 'reto' ? it.code === pending.code : it.module === m.id)));
        return { text: pending.code + ' ' + (RETOS_JSON[pending.code]?.title ?? pending.title) + ' · ' + (zone?.name ?? m.phase), link: '/reto/' + pending.code };
      }
      if (!this.progress.seasonDone(m.id)) {
        return this.progress.isReflectionComplete(m.id)
          ? { text: 'Cierre de temporada ' + m.year + ' · ' + m.phase, link: '/temporada/' + m.id }
          : { text: 'Bitácora del módulo ' + m.id + ' · ' + m.phase, link: '/bitacora/' + m.id };
      }
    }
    return { text: 'Ronda de inversión · 2030', link: '/inversion' };
  });
  modPips = computed(() => [1, 2, 3, 4].map((m) => (m < this.cur() || this.mission().link === '/inversion' ? '#FF836C' : m === this.cur() ? '#FBF5EC' : '#4A2A2F')));

  private host = inject(ElementRef);

  constructor() {
    this.api.mensajes().subscribe((m) => m && this.messages.set(m));
    // La primera vez que entra a la Ruta se muestra el recorrido guiado.
    afterNextRender(() => {
      const s = this.auth.student();
      if (s && !s.tourVisto) this.tour()?.start();
    });
  }

  // ---------- Acciones
  unhover() {
    this.tip.set(null);
  }
  pickYear(i: number) {
    this.view.set(i === this.cur() ? null : i);
    this.zone.set(null);
    this.event.set(false);
  }
  pickZone(i: number) {
    this.zone.set(this.zone() === i ? null : i);
    this.event.set(false);
    this.tip.set('z' + i);
  }
  toggleEvent() {
    this.event.set(!this.event());
    this.zone.set(null);
  }
  private injector = inject(Injector);
  tool(key: string) {
    if (key !== 'objetivo') return;
    this.objetivo.set(true);
    afterNextRender(() => this.host.nativeElement.querySelector('[aria-label="Objetivo del curso"][role="dialog"] button')?.focus(), { injector: this.injector });
  }
  repeatTour(menu: Accesibilidad) {
    menu.close();
    this.view.set(null);
    this.zone.set(null);
    this.tour()?.start();
  }
  tourClosed() {
    const s = this.auth.student();
    if (s?.tourVisto) return;
    const now = new Date().toISOString();
    this.auth.updateStudent({ tourVisto: now });
    if (this.auth.token()) this.api.saveOnboarding({ tourVisto: now }).subscribe();
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/ingreso']);
  }

  /** Tocar fuera de una zona, del «!» o de un año cierra su menú o mensaje. */
  @HostListener('document:click', ['$event'])
  onDoc(e: MouseEvent) {
    const t = e.target as HTMLElement;
    if (!t.closest?.('[data-keep]')) {
      this.zone.set(null);
      this.event.set(false);
      if (this.tip()?.startsWith('z') || this.tip()?.startsWith('y')) this.tip.set(null);
    }
  }
  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.objetivo()) this.objetivo.set(false);
    this.zone.set(null);
    this.event.set(false);
    this.tip.set(null);
  }
}
