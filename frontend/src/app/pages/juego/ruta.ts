import { Component, ElementRef, HostListener, Injector, afterNextRender, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MODULES } from '../../core/data/modules';
import { ApiService, BoardMessage } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { metersAt } from '../../core/services/company';
import { ProgressService } from '../../core/services/progress.service';
import { RETOS_JSON } from '../../retos/registry';
import { Accesibilidad } from '../../shared/accesibilidad';
import { LogoUao } from '../../shared/logo-uao';
import { Tour, TourStep } from '../../shared/tour';
import { MapLayers, menosMovimiento, MapaIlustracion, SceneLayers, ZoneId, ZoneState } from './mapa/mapa-ilustracion';

const YEARS = [2026, 2027, 2028, 2029, 2030];
const PHASE = ['Diagnóstico', 'Planeación', 'Organización', 'Dirección', 'Control'];
type Dim = 'Ambiental' | 'Social' | 'Gobernanza' | 'Económico';
const DIMS: [Dim, 'ambiental' | 'social' | 'gobernanza' | 'economico'][] = [['Ambiental', 'ambiental'], ['Social', 'social'], ['Económico', 'economico'], ['Gobernanza', 'gobernanza']];
const MCOL: Record<Dim, string> = { Ambiental: '#3F7E44', Social: '#FF836C', Gobernanza: '#8A1428', 'Económico': '#9A5B2E' };
const MICON: Record<Dim, string> = { Ambiental: 'M12 21v-8M12 13c-4 0-6-3-6-7 4 0 6 3 6 7zM12 13c4 0 6-3 6-7-4 0-6 3-6 7z', Social: 'M9 7a3 3 0 1 0 0 .1M3 20v-1a6 6 0 0 1 12 0v1M17 11a2.5 2.5 0 1 0 0-.1M15 20v-1a4 4 0 0 1 6-3.5', Gobernanza: 'M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z', 'Económico': 'M4 17l6-6 4 4 6-8M14 7h6v6' };
const MTIP: Record<Dim, string> = {
  Ambiental: 'Energía, residuos y bosque. Sube con decisiones como paneles solares o compostaje.',
  Social: 'Bienestar del equipo y de las 120 familias: salarios, capacitación, rotación.',
  Gobernanza: 'Ética y transparencia: código, canal de denuncias e informe de sostenibilidad.',
  'Económico': 'Ventas y margen. Sin dinero no hay sostenibilidad posible.',
};
/** ODS: número, reto que lo logra (con nota ≥ 3) y nombre. */
/** Colores oficiales de cada ODS (cuando ya se logró). */
/** ODS por año (como en el prototipo): se logran al cerrar el módulo correspondiente.
 *  [ODS, índice del año en YEARS desde el que se logra, nombre] → 7 y 12 desde 2028, 8 y 13 desde 2029, 15 en 2030. */
const ODS: [number, number, string][] = [[7, 2, 'Energía asequible y no contaminante'], [8, 3, 'Trabajo decente'], [12, 2, 'Producción y consumo responsables'], [13, 3, 'Acción por el clima'], [15, 4, 'Vida de ecosistemas terrestres']];

/** Un reto suelto (módulo 1) o un módulo completo (2–4) dentro del menú de una zona. */
type Item = { kind: 'reto'; code: string } | { kind: 'modulo'; module: number };
const ZONES: { id: ZoneId; name: string; x: string; y: string; icon: string; items: Item[] }[] = [
  { id: 'sala', name: 'Sala de juntas', x: '66%', y: '70%', icon: 'M4 21V4M4 4h12l-2 4 2 4H4', items: [{ kind: 'reto', code: '1.1' }, { kind: 'reto', code: '1.4' }, { kind: 'modulo', module: 4 }] },
  { id: 'mercado', name: 'Mercado', x: '24%', y: '75%', icon: 'M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', items: [{ kind: 'reto', code: '1.2' }, { kind: 'reto', code: '1.3' }] },
  { id: 'planta', name: 'Planta', x: '80%', y: '38%', icon: 'M3 21V11l5-3v3l5-3v3l5-3v13zM3 21h18', items: [{ kind: 'modulo', module: 2 }] },
  { id: 'finca', name: 'Finca', x: '31%', y: '33%', icon: 'M3 11l9-7 9 7M5 10v10h14V10', items: [{ kind: 'modulo', module: 3 }] },
];
const TOOLS = [
  ['Mis logros', 'logros', 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z'],
  ['Bitácora', 'bitacora', 'M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4zM8 9h8M8 13h6'],
];
/** Recorrido guiado: textos cortos y sin ambigüedad, como un tutorial (uno por elemento). */
const TOUR: TourStep[] = [
  { target: 'mapa', text: 'Cada zona es un área de tu empresa. Toca la que dice AHORA para ver tu siguiente reto.' },
  { target: 'tablero', text: 'Así va tu empresa. Toca un medidor para saber qué mide.' },
  { target: 'ods', text: 'Estos son los ODS. Brillan cuando los logras al cerrar un módulo.' },
  { target: 'tiempo', text: 'Cada módulo que cierras suma un año. Toca un año pasado para ver cómo estaba tu empresa.' },
  { target: 'mision', text: 'Aquí está tu siguiente reto. Toca CONTINUAR para ir directo.' },
  { target: 'accesibilidad', text: 'Aquí activas subtítulos, voz, texto grande o menos movimiento. También cierras sesión.' },
];
type RetoState = 'open' | 'done' | 'locked';

/** Ruta (Mapa.dc.html): pantalla central del juego. */
@Component({
  selector: 'app-ruta',
  imports: [RouterLink, Accesibilidad, MapaIlustracion, Tour, LogoUao],
  templateUrl: './ruta.html',
  styles: `
    a{color:#8A1428} a:focus-visible,button:focus-visible,[tabindex]:focus-visible{outline:3px solid #FF836C;outline-offset:3px} button{font-family:inherit}
    @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(255,131,108,.7)}100%{box-shadow:0 0 0 18px rgba(255,131,108,0)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    .pulse{animation:pulse 1.6s ease-out infinite}
    .float{animation:float 5s ease-in-out infinite}
    @keyframes odsBrillo{0%,100%{box-shadow:0 0 0 3px rgba(255,211,201,.85),0 0 10px 2px rgba(255,211,201,.45)}50%{box-shadow:0 0 0 4px rgba(255,255,255,.95),0 0 22px 6px rgba(255,211,201,.8)}}
    .ods-on{animation:odsBrillo 2.4s ease-in-out infinite}
    @keyframes odsNuevo{0%{transform:translateY(0) scale(1);box-shadow:0 0 0 0 rgba(255,255,255,0)}35%{transform:translateY(-14px) scale(1.18);box-shadow:0 0 0 6px rgba(255,255,255,.95),0 0 30px 10px rgba(255,211,201,.9)}70%{transform:translateY(0) scale(.96)}100%{transform:none}}
    .ods-nuevo{animation:odsNuevo .9s cubic-bezier(.2,.7,.2,1.2) both !important}
    .bloqueo{position:fixed;inset:0;z-index:60;cursor:wait;background:transparent}
    .up{animation:up .35s cubic-bezier(.2,.7,.2,1) both}
    .bar{transition:width .8s cubic-bezier(.2,.7,.2,1)}
    .pin{transition:transform .18s}.pin:hover{transform:scale(1.07)}
    .node{transition:transform .18s}.node:hover{transform:scale(1.1)}
    @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
    .bounce{animation:bounce 1.2s ease-in-out infinite}
    .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;margin:0}
    .menu-x{display:flex;align-items:center;gap:12px;width:100%;min-height:50px;padding:0 8px;margin-top:4px;border:none;border-top:1px solid #4A2A2F;border-radius:6px;background:transparent;color:#FBF5EC;font-size:15px;font-weight:700;cursor:pointer;text-align:left}
    .menu-x:hover{background:rgba(255,131,108,.12)}
    .mx-ic{width:32px;height:32px;flex-shrink:0;border-radius:6px;background:#4A2A2F;display:flex;align-items:center;justify-content:center}
    .mapa{height:calc(100vh - 160px);min-height:620px}
    @media (max-width: 900px){
      .mapa{height:auto;min-height:640px}
      .lado{position:static !important;flex-direction:column;align-items:stretch !important;order:-1}
      .tablero{flex-wrap:wrap;gap:12px 20px !important}
      .tablero > button{flex:1 1 40% !important}
      .ods{position:static !important;flex-direction:row !important;justify-content:space-between}
    }
    @media (max-width: 560px){
      .mapa{min-height:520px}
      .linea{width:14px !important}
      .pin{font-size:12px !important;padding:4px 8px 4px 4px !important;gap:5px !important}
      .pin > span:first-child{width:22px !important;height:22px !important}
      .chip{display:none}
      [role=menu],[role=tooltip]{max-width:calc(100vw - 48px)}
    }
    @media (prefers-reduced-motion: reduce){.pulse,.float,.up,.bounce,.ods-on,.ods-nuevo{animation:none !important}.bar,.pin,.node{transition:none}}
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
  /** La Bitácora se habilita cuando ya escribiste la primera. */
  tools = computed(() => {
    this.stats();
    const firstBit = [1, 2, 3, 4].find((m) => this.progress.isReflectionComplete(m));
    return TOOLS.map(([label, key, icon], k) => {
      const href = key === 'logros' ? '/logros' : firstBit ? '/bitacora/' + Math.max(firstBit, ...[1, 2, 3, 4].filter((m) => this.progress.isReflectionComplete(m))) : null;
      return { label, key, icon, href, k, tip: !href && this.tip() === 't' + k };
    });
  });

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
      // Si el módulo aún no empieza, el reto lleva primero a la intro del módulo (video y «COMENZAR»).
      const empezado = MODULES[e.module - 1].exercises.some((x) => this.progress.isCompleted(x.id));
      return { module: e.module, state: this.retoState(it.code), name: it.code + ' ' + (RETOS_JSON[it.code]?.title ?? e.title), pts: e.maxPoints + ' pts', link: empezado ? '/reto/' + it.code : '/modulo/' + e.module };
    }
    const m = MODULES[it.module - 1];
    const s = this.stats()[it.module - 1];
    const state: RetoState = s.done ? 'done' : this.moduleOpen(it.module) ? 'open' : 'locked';
    const codes = m.exercises.map((e) => e.code);
    return { module: it.module, state, name: codes[0] + ' a ' + codes[codes.length - 1] + ' ' + m.phase, pts: s.max + ' pts', link: '/modulo/' + it.module };
  }

  /** Zona donde está el siguiente reto pendiente. */
  missionZone = computed(() => {
    const link = this.mission().link;
    const code = link.startsWith('/reto/') ? link.slice(6) : ((this.mission() as { code?: string }).code ?? null);
    const mod = link.startsWith('/modulo/') ? Number(link.slice(8)) : null;
    return ZONES.findIndex((z) => z.items.some((it) => (it.kind === 'reto' ? it.code === code : it.module === mod && !(code && z.items.some((x) => x.kind === 'reto' && x.code === code)))));
  });

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
      /** La zona de la siguiente misión lleva el rótulo «MISIÓN» y el estado «AHORA». */
      const mission = this.missionZone() === i;
      return {
        ...z, st, i, items, sel, tipText, inOrder, mission, zi: tip === 'z' + i || sel ? 4 : 2,
        aria: z.name + '. ' + (mission ? 'Aquí está tu siguiente misión. ' : '') + tipText,
        bg: sel ? '#231417' : st === 'locked' ? '#E9E4DE' : '#FFFFFF', fg: sel ? '#FFFFFF' : st === 'locked' ? '#5C4A4D' : '#231417',
        bd: sel ? '#FF836C' : st === 'open' ? '#FF836C' : st === 'locked' ? '#B5A9A6' : '#3F7E44',
        dot: st === 'open' ? '#AC0B32' : st === 'locked' ? '#9A8F8C' : '#3F7E44',
        stT: mission ? 'AHORA' : st === 'open' ? 'ABIERTA' : st === 'done' ? 'HECHA' : st === 'done-part' ? 'EN CURSO' : 'BLOQUEADA',
        stBg: mission ? '#AC0B32' : st === 'open' ? '#AC0B32' : st === 'locked' ? '#6E5458' : '#2C5E31',
        pulse: st === 'open' || mission,
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
    const a = this.anim();
    return ODS.map(([n, at, name], i) => {
      const on = a ? a.odsOn.includes(n) : v >= at;
      const nuevo = !!a && a.odsNuevo === n;
      return {
        n, delay: i * -0.9 + 's', aria: 'ODS ' + n + ': ' + name + (on ? ' (logrado)' : ' (aún no)'),
        on, nuevo, bg: '#FFFFFF', bd: '#B5A9A6', fg: '#6E5458', /* ODS siempre neutros: los logrados brillan, no cambian de color */
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
        // Todo módulo (también el 1) empieza por su intro: video y «COMENZAR».
        if (!started) return { text: 'Intro del módulo ' + m.id + ' · ' + m.phase, link: '/modulo/' + m.id, code: pending.code };
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

  // ---------- Capas del mapa ilustrado
  /** % de granos del módulo m (para saber si la zona queda «buena»: ≥ 60 % al cerrarlo). */
  private pctModulo(m: number) {
    const s = this.stats()[m - 1];
    return s.max ? s.points / s.max : 0;
  }
  mapLayers = computed<MapLayers>(() => this.anim()?.layers ?? this.layersFor(this.v()));

  /** Capas del mapa para un año (índice de YEARS). */
  private layersFor(v: number): MapLayers {
    const good = (m: number, desde: number) => v >= desde && this.progress.seasonDone(m) && this.pctModulo(m) >= 0.6;
    const frase = this.progress.lastAnswers<{ text?: Record<string, string> }>('m1-valores')?.text?.['C'] ?? '';
    return {
      sala: good(1, 2), mercado: good(1, 2), planta: good(2, 3), finca: good(3, 4),
      composta: v >= 2, arboles: v >= 4, humo: v < 2 ? 2 : v === 2 ? 1 : 0, frase: frase.trim().slice(0, 26),
    };
  }

  // ---------- Animación al volver de un módulo cerrado
  /** Mientras no es null, la Ruta está bloqueada y muestra los cambios uno por uno. */
  anim = signal<{ layers: MapLayers; odsOn: number[]; odsNuevo: number | null; texto: string } | null>(null);
  private animKey() {
    return 'gadmi-sost-empresarial:ruta-anio:' + (this.auth.student()?.codigo ?? 'local');
  }
  private revisarCambios(c: number) {
    if (this.anim()) return;
    let prev = NaN;
    try { prev = Number(localStorage.getItem(this.animKey()) ?? NaN); } catch { /* sin almacenamiento */ }
    const guardar = () => { try { localStorage.setItem(this.animKey(), String(c)); } catch { /* nada */ } };
    if (Number.isNaN(prev) || prev >= c || menosMovimiento()) return guardar();
    void this.reproducir(prev, c).then(guardar);
  }
  private async reproducir(prev: number, c: number) {
    const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const L0 = this.layersFor(prev), L1 = this.layersFor(c);
    const odsOn = ODS.filter(([, at]) => at <= prev).map(([n]) => n);
    const nuevos = ODS.filter(([, at]) => at > prev && at <= c).map(([n]) => n);
    let layers = { ...L0 };
    this.anim.set({ layers, odsOn, odsNuevo: null, texto: 'Tu empresa cambia con lo que decidiste…' });
    await espera(700);
    const NOMBRE: Record<string, string> = { sala: 'La sala de juntas', mercado: 'El mercado', planta: 'La planta', finca: 'La finca', composta: 'Llega el compost', arboles: 'Crecen los árboles' };
    // 1) zonas mala → buena; 2) piezas nuevas (compost, árboles; paneles y pancarta van en las zonas buenas)
    for (const k of ['sala', 'mercado', 'planta', 'finca', 'composta', 'arboles'] as const) {
      if (L0[k] === L1[k]) continue;
      layers = { ...layers, [k]: L1[k], humo: L1.humo, frase: L1.frase };
      const zona = ['sala', 'mercado', 'planta', 'finca'].includes(k);
      this.anim.update((a) => a && { ...a, layers, texto: zona ? NOMBRE[k] + ' mejora' : NOMBRE[k] });
      await espera(1250);
    }
    if (layers.humo !== L1.humo) { layers = { ...layers, humo: L1.humo }; this.anim.update((a) => a && { ...a, layers }); await espera(600); }
    // 3) ODS que se logran, uno por uno (brillo y salto, sin cambiar de color)
    for (const n of nuevos) {
      odsOn.push(n);
      this.anim.update((a) => a && { ...a, odsOn: [...odsOn], odsNuevo: n, texto: 'Logras el ODS ' + n });
      await espera(950);
    }
    this.anim.set(null);
  }

  private host = inject(ElementRef);

  constructor() {
    this.api.mensajes().subscribe((m) => m && this.messages.set(m));
    // Al volver de un módulo cerrado: animación de los cambios (se bloquea la Ruta mientras tanto).
    effect(() => {
      const c = this.cur();
      untracked(() => this.revisarCambios(c));
    });
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
    this.zone.set(null);
    this.event.set(false);
    this.tip.set(null);
  }
}
