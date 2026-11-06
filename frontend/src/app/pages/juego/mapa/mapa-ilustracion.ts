import { Component, ElementRef, computed, effect, inject, input, signal } from '@angular/core';

/** Estado de una zona del mapa, calculado desde el progreso. */
export type ZoneState = 'open' | 'done' | 'done-part' | 'locked';
export type ZoneId = 'sala' | 'mercado' | 'planta' | 'finca';

/** Capas de la escena que dependen de las decisiones del estudiante hasta ese año. */
export interface SceneLayers {
  flag: boolean;
  solar: boolean;
  compost: boolean;
  forest: boolean;
  /** Humo de la chimenea: 3 = mucho, 2 = poco, 0 = nada. */
  smoke: 0 | 2 | 3;
  lit: boolean;
  people: boolean;
}

/** Estado de cada zona en la ilustración por capas: buena (≥ 60 % del módulo al cerrarlo) o mala. */
export interface MapLayers {
  sala: boolean;
  mercado: boolean;
  planta: boolean;
  finca: boolean;
  composta: boolean;
  arboles: boolean;
  /** Humo de la planta: 2 = fuerte, 1 = suave, 0 = nada. */
  humo: 0 | 1 | 2;
  /** Frase bandera del reto 1.2 (máx. 26 caracteres) para la pancarta de la sala. */
  frase: string;
}

/** «Menos movimiento» (preferencia del sistema o del menú de accesibilidad). */
export function menosMovimiento(): boolean {
  return (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.classList.contains('menos-movimiento');
}

const MAP_URL = '/assets/mapa/mapa-ruta.svg';
let mapaSvg: Promise<string | null> | null = null;
function loadMap() {
  mapaSvg ??= fetch(MAP_URL, { cache: 'no-cache' })
    .then((r) => (r.ok ? r.text() : null))
    .then((t) => {
      // Si el archivo no existe, el servidor responde con index.html: eso no es el mapa.
      const i = t ? t.search(/<svg[\s>]/i) : -1;
      if (!t || i < 0 || /<html[\s>]/i.test(t.slice(0, i))) return null;
      // Quita la cabecera <?xml …?> y el <!DOCTYPE …> que exportan Affinity/Illustrator.
      return t.slice(i);
    })
    .catch(() => null)
    .then((svg) => {
      if (!svg) mapaSvg = null; // se vuelve a intentar la próxima vez que se abra la Ruta
      return svg;
    });
  return mapaSvg;
}

/**
 * Ilustración del mapa de CACAO Raíz.
 * Usa el SVG por capas public/assets/mapa/mapa-ruta.svg (1800 × 1200, en línea para mostrar
 * u ocultar capas por id). Si el archivo no está, se dibuja la ilustración provisional.
 * Recibe el año y el estado de cada zona: cuando lleguen los SVG por capas
 * definitivos, solo se cambia este componente; la Ruta (zonas, menús, tablero) no cambia.
 */
@Component({
  selector: 'app-mapa-ilustracion',
  template: `
    <div #host class="mapa-host" [class]="hostCls()" [hidden]="!ready()" role="img" [attr.aria-label]="label()" style="position: absolute; inset: 0; border-radius: 16px; overflow: hidden; background: #3CAAF4"></div>
    @if (!ready()) {
    <svg viewBox="0 0 640 300" preserveAspectRatio="xMidYMid slice" style="display: block; width: 100%; height: 100%; border-radius: 16px; background: #FFF8F1" role="img" [attr.aria-label]="label()">
      <rect x="0" y="244" width="640" height="56" fill="#EADFD0"></rect>
      <rect x="0" y="0" width="54" height="300" fill="#FFE3DC"></rect>
      <path d="M8 60 q10 -6 20 0 t20 0 M8 140 q10 -6 20 0 t20 0 M8 220 q10 -6 20 0 t20 0" fill="none" stroke="#9A5B2E" stroke-width="2.5"></path>
      <g><path d="M14 112 h30 l-6 10 h-18 z" fill="#8A1428"></path><rect x="27" y="96" width="3" height="16" fill="#231417"></rect><path d="M30 96 l10 8 h-10 z" fill="#9A5B2E"></path></g>
      @for (h of houses(); track h.x) {
        <g><path [attr.d]="h.roof" [attr.fill]="h.roofFill"></path><rect [attr.x]="h.x" y="214" width="34" height="30" [attr.fill]="h.wall"></rect><rect [attr.x]="h.wx" y="222" width="10" height="10" [attr.fill]="h.win"></rect></g>
      }
      @if (capas().forest) {
        <g class="pop"><rect x="222" y="214" width="6" height="30" fill="#6B3B2A"></rect><circle cx="225" cy="200" r="20" fill="#3F7E44"></circle><rect x="256" y="208" width="6" height="36" fill="#6B3B2A"></rect><circle cx="259" cy="192" r="24" fill="#56C02B"></circle><rect x="292" y="216" width="6" height="28" fill="#6B3B2A"></rect><circle cx="295" cy="202" r="18" fill="#3F7E44"></circle></g>
      } @else {
        <g><rect x="222" y="234" width="12" height="10" fill="#6B3B2A"></rect><rect x="262" y="236" width="12" height="8" fill="#6B3B2A"></rect><rect x="292" y="216" width="6" height="28" fill="#6B3B2A"></rect><circle cx="295" cy="204" r="16" fill="#3F7E44"></circle></g>
      }
      <path d="M340 244 V150 L390 122 V150 L440 122 V150 L490 122 V244 Z" fill="#FFFFFF" stroke="#8A1428" stroke-width="4" stroke-linejoin="round"></path>
      <rect x="500" y="80" width="26" height="164" fill="#FFFFFF" stroke="#8A1428" stroke-width="4"></rect>
      <rect x="400" y="204" width="34" height="40" fill="#8A1428"></rect>
      @for (s of smoke(); track s[0]) { <circle [attr.class]="'puff ' + s[2]" [attr.cx]="s[0]" cy="62" [attr.r]="s[1]" fill="#9A8F8C"></circle> }
      @if (capas().flag) { <g class="pop"><rect x="364" y="96" width="3" height="42" fill="#231417"></rect><path d="M367 96 h26 l-6 8 l6 8 h-26 z" fill="#FF051E"></path></g> }
      @if (capas().solar) { <g class="pop"><path d="M346 146 l40 -22 l12 6 l-40 22 z M396 146 l40 -22 l12 6 l-40 22 z M446 146 l40 -22 l2 1 l-30 22 z" fill="#231417" stroke="#9A5B2E" stroke-width="1.5"></path></g> }
      @if (!capas().compost) { <path d="M560 244 q30 -40 60 0 z" fill="#6B3B2A"></path> }
      @else { <g class="pop"><rect x="566" y="214" width="46" height="30" rx="4" fill="#3F7E44"></rect><path d="M589 214 v-14 M589 204 c-8 -2 -10 -8 -10 -12 c6 0 10 4 10 12 M589 204 c8 -2 10 -8 10 -12 c-6 0 -10 4 -10 12" stroke="#56C02B" stroke-width="3" fill="none"></path></g> }
      @for (p of people(); track p.x) { <g><circle [attr.cx]="p.x" cy="222" r="6" [attr.fill]="p.c"></circle><rect [attr.x]="p.bx" y="230" width="12" height="14" rx="5" [attr.fill]="p.c"></rect></g> }
    </svg>
    }
  `,
  styles: `
    @keyframes pop{0%{opacity:0;transform:scale(.3)}70%{transform:scale(1.12)}100%{opacity:1;transform:scale(1)}}
    @keyframes puff{0%{opacity:.8;transform:translateY(0)}100%{opacity:0;transform:translateY(-30px)}}
    .pop{transform-box:fill-box;transform-origin:center bottom;animation:pop .6s cubic-bezier(.2,.7,.2,1) both}
    .puff{transform-box:fill-box;animation:puff 2.4s ease-out infinite}.p2{animation-delay:.8s}.p3{animation-delay:1.6s}
    @media (prefers-reduced-motion: reduce){.pop,.puff{animation:none}}
    :host ::ng-deep .mapa-host svg{display:block;width:100%;height:100%}
    /* Cambio de capa con efecto de videojuego (al volver de un módulo): la mala se desvanece,
       la buena aparece con destello, chispas y un pequeño rebote (~1,2 s). */
    @keyframes aparece{0%{opacity:0;transform:scale(.6) translateY(18px)}55%{opacity:1;transform:scale(1.08) translateY(-6px)}78%{transform:scale(.97) translateY(0)}100%{opacity:1;transform:scale(1)}}
    @keyframes seVa{0%{opacity:1;filter:none}40%{filter:brightness(2.2)}100%{opacity:0;transform:scale(.94);filter:brightness(2.2)}}
    @keyframes destello{0%{opacity:.95;transform:scale(.2)}100%{opacity:0;transform:scale(1.6)}}
    @keyframes chispa{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.3)}}
    :host ::ng-deep .aparece{transform-box:fill-box;transform-origin:center bottom;animation:aparece .95s cubic-bezier(.2,.7,.2,1.2) both}
    :host ::ng-deep .se-va{transform-box:fill-box;transform-origin:center bottom;animation:seVa .55s ease-in both}
    :host ::ng-deep .destello{transform-box:fill-box;transform-origin:center;fill:#FFF6D8;animation:destello .8s ease-out both}
    :host ::ng-deep .chispa{transform-box:fill-box;transform-origin:center;animation:chispa .9s cubic-bezier(.2,.7,.3,1) both}
    @keyframes smk{0%{opacity:0;transform:translateY(10px) scale(.6)}20%{opacity:.9}100%{opacity:0;transform:translateY(-110px) scale(1.6)}}
    :host ::ng-deep .humo circle{fill:#B9B1AE;transform-box:fill-box;transform-origin:center;animation:smk 3.3s ease-out infinite}
    :host ::ng-deep .humo circle:nth-child(2){animation-delay:1.1s} :host ::ng-deep .humo circle:nth-child(3){animation-delay:2.2s}
    :host ::ng-deep .humo-0 .humo{display:none} :host ::ng-deep .humo-1 .humo .hb{display:none}
    @media (prefers-reduced-motion: reduce){:host ::ng-deep .humo circle{animation:none;opacity:.8}}
    :host-context(html.menos-movimiento) ::ng-deep .humo circle{animation:none !important;opacity:.8}
  `,
  host: { style: 'display: block; position: relative; width: 100%; height: 100%' },
})
export class MapaIlustracion {
  /** Año que se dibuja (2026–2030). */
  anio = input.required<number>();
  /** Estado de cada zona (para las capas definitivas: zonas iluminadas, bloqueadas…). */
  zonas = input<Partial<Record<ZoneId, ZoneState>>>({});
  capas = input.required<SceneLayers>();
  recuerdo = input(false);
  /** Capas del SVG ilustrado (si existe). */
  capasMapa = input<MapLayers | null>(null);
  /** true mientras la Ruta reproduce los cambios de un módulo recién cerrado. */
  animar = input(false);

  ready = signal(false);
  private el = inject(ElementRef<HTMLElement>);
  hostCls = computed(() => {
    const c = this.capasMapa();
    if (!c) return 'mapa-host';
    const b = (x: boolean) => (x ? 1 : 0);
    void b;
    return 'mapa-host humo-' + c.humo;
  });

  constructor() {
    loadMap().then((svg) => {
      if (!svg) return;
      const host = this.el.nativeElement.querySelector('.mapa-host') as HTMLElement;
      // SVG propio del proyecto (public/assets), no viene del usuario.
      host.innerHTML = svg;
      const root = host.querySelector('svg');
      if (root) {
        root.removeAttribute('width');
        root.removeAttribute('height');
        root.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        root.setAttribute('aria-hidden', 'true');
      }
      this.addHumo(host);
      this.ready.set(true);
      this.aplicarCapas(false);
      this.setFrase();
    });
    effect(() => {
      this.capasMapa();
      this.aplicarCapas(this.animar());
      this.setFrase();
    });
  }

  /** Último estado aplicado de cada capa (para saber qué cambió). */
  private aplicadas: Record<string, boolean> | null = null;

  /**
   * Muestra u oculta las capas del SVG. Con `animar` (al volver de un módulo), cada cambio
   * se ve con el efecto de videojuego; sin él (o con «menos movimiento»), es directo.
   */
  private aplicarCapas(animar: boolean) {
    const c = this.capasMapa();
    const host = this.el.nativeElement.querySelector('.mapa-host') as HTMLElement | null;
    if (!c || !host?.querySelector('svg')) return;
    const quiero: Record<string, boolean> = {
      'sala-buena': c.sala, 'sala-mala': !c.sala, 'mercado-buena': c.mercado, 'mercado-mala': !c.mercado,
      'planta-buena': c.planta, 'planta-mala': !c.planta, 'finca-buena': c.finca, 'finca-mala': !c.finca,
      Composta: c.composta, Arboles: c.arboles,
    };
    const antes = this.aplicadas;
    const mover = animar && !!antes && !menosMovimiento();
    for (const [id, on] of Object.entries(quiero)) {
      const g = host.querySelector('#' + id) as SVGGElement | null;
      if (!g) continue;
      const cambio = antes ? antes[id] !== on : true;
      if (!mover || !cambio) {
        g.style.display = on ? '' : 'none';
        continue;
      }
      if (on) {
        g.style.display = '';
        g.classList.remove('se-va');
        g.classList.add('aparece');
        this.chispas(g);
        setTimeout(() => g.classList.remove('aparece'), 1100);
      } else {
        g.classList.add('se-va');
        setTimeout(() => { g.classList.remove('se-va'); if (this.aplicadas?.[id] === false) g.style.display = 'none'; }, 560);
      }
    }
    this.aplicadas = quiero;
  }

  /** Destello y polvo de partículas sobre una capa que aparece. */
  private chispas(g: SVGGElement) {
    const root = g.ownerSVGElement?.querySelector('svg > g') ?? g.ownerSVGElement;
    if (!root) return;
    let bb: DOMRect;
    try { bb = g.getBBox(); } catch { return; }
    const NS = 'http://www.w3.org/2000/svg';
    const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2, r = Math.max(bb.width, bb.height) / 2;
    const fx = document.createElementNS(NS, 'g');
    const flash = document.createElementNS(NS, 'circle');
    flash.setAttribute('class', 'destello'); flash.setAttribute('cx', String(cx)); flash.setAttribute('cy', String(cy)); flash.setAttribute('r', String(r * 0.7));
    fx.appendChild(flash);
    const colores = ['#FFD3C9', '#FCC30B', '#FFFFFF', '#FF836C', '#56C02B'];
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2, d = r * (0.7 + (k % 3) * 0.25);
      const p = document.createElementNS(NS, 'circle');
      p.setAttribute('class', 'chispa'); p.setAttribute('cx', String(cx)); p.setAttribute('cy', String(cy)); p.setAttribute('r', String(6 + (k % 3) * 3));
      p.setAttribute('fill', colores[k % colores.length]);
      p.setAttribute('style', `--dx:${Math.round(Math.cos(a) * d)}px;--dy:${Math.round(Math.sin(a) * d)}px;animation-delay:${(k % 4) * 0.04}s`);
      fx.appendChild(p);
    }
    root.appendChild(fx);
    setTimeout(() => fx.remove(), 1200);
  }

  /** Humo por código: 3 bocanadas sobre las dos chimeneas altas de la planta. */
  private addHumo(host: HTMLElement) {
    const root = host.querySelector('svg > g') ?? host.querySelector('svg');
    if (!root || root.querySelector('.humo')) return;
    const NS = 'http://www.w3.org/2000/svg';
    [[1465, 170], [1608, 215]].forEach(([x, y]) => {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'humo');
      [[0, 0, 30, 'hb'], [14, -24, 24, ''], [-8, -50, 36, 'hb']].forEach(([dx, dy, r, cls]) => {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', String((x as number) + (dx as number)));
        c.setAttribute('cy', String((y as number) + (dy as number)));
        c.setAttribute('r', String(r));
        if (cls) c.setAttribute('class', cls as string);
        g.appendChild(c);
      });
      root.appendChild(g);
    });
  }

  /** Escribe la frase bandera (reto 1.2) en la pancarta de la sala buena. */
  private setFrase() {
    const host = this.el.nativeElement.querySelector('.mapa-host');
    const g = host?.querySelector('#sala-buena');
    if (!g) return;
    let t = g.querySelector('text.frase') as SVGTextElement | null;
    if (!t) {
      t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('class', 'frase');
      t.setAttribute('x', '1225');
      t.setAttribute('y', '684');
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('style', "font-family:'Baloo 2',sans-serif;font-weight:800;font-size:44px;fill:#2C5E31");
      g.appendChild(t);
    }
    t.textContent = (this.capasMapa()?.frase ?? '').slice(0, 26);
  }

  label = computed(() => (this.recuerdo() ? 'Recuerdo: ' : '') + 'Ilustración de CACAO Raíz en ' + this.anio());
  houses = computed(() => {
    const lit = this.capas().lit;
    return [70, 120, 170].map((x) => ({ x, wx: x + 12, roof: 'M' + (x - 4) + ' 214 L' + (x + 17) + ' 196 L' + (x + 38) + ' 214 Z', roofFill: lit ? '#AC0B32' : '#B5A9A6', wall: lit ? '#FFFFFF' : '#DCD3CC', win: lit ? '#FCC30B' : '#9A8F8C' }));
  });
  smoke = computed(() => (this.capas().smoke === 3 ? [[505, 14, ''], [515, 18, 'p2'], [522, 12, 'p3']] : this.capas().smoke === 2 ? [[512, 9, ''], [518, 7, 'p2']] : []) as [number, number, string][]);
  people = computed(() => [370, 390, 450].map((x) => ({ x, bx: x - 6, c: this.capas().people ? '#9A5B2E' : '#B5A9A6' })));
}
