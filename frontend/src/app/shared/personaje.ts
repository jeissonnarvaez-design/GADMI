import { Component, ElementRef, computed, effect, inject, input, signal } from '@angular/core';

export type Who = 'teo' | 'teo-casual' | 'chispa' | 'nibi' | 'brillo' | 'laura' | 'andres' | 'klaus';
export type Mood = 'happy' | 'mid' | 'sad';

const LABELS: Record<Who, string> = {
  teo: 'Teo, una semilla de cacao con traje, el guía del juego',
  'teo-casual': 'Teo, una semilla de cacao, el guía del juego',
  chispa: 'Chispa, un bombillo con sombrero y gafas',
  nibi: 'Nibi, una semilla de cacao con gafas rosadas y un lazo',
  brillo: 'Brillo, un virus verde: el greenwashing',
  laura: 'Laura, inversionista de impacto',
  andres: 'Andrés, inversionista financiero',
  klaus: 'Klaus, comprador europeo',
};

/** SVG ya cargados (se piden una sola vez por personaje). */
const cache = new Map<Who, Promise<string>>();
function load(who: Who): Promise<string> {
  if (!cache.has(who)) cache.set(who, fetch(`/assets/personajes/${who}.svg`).then((r) => (r.ok ? r.text() : '')).catch(() => ''));
  return cache.get(who)!;
}

/**
 * Personajes oficiales (SVG del equipo en public/assets/personajes).
 * Cada SVG trae sus partes etiquetadas (ojos, pupilas, cejas, brazos, boca) y se
 * animan con CSS según el personaje (ver «Personajes» en styles.scss).
 * Los inversionistas cambian de cara con `mood` y mueven la boca con `talking`.
 */
@Component({
  selector: 'app-personaje',
  template: `<div #box role="img" [attr.aria-label]="label()" [style.width.px]="size()" [style.height.px]="size()" [style.filter]="outline() ? outlineFilter : null"
    [class]="'pj pj-mood-' + mood() + (talking() ? ' pj-habla' : '')" style="display: flex; align-items: center; justify-content: center"></div>`,
  host: { style: 'display: inline-block; line-height: 0' },
})
export class Personaje {
  who = input<Who>('teo');
  size = input(200);
  mood = input<Mood>('mid');
  talking = input(false);
  /** Contorno claro para que se vea sobre fondos oscuros. */
  outline = input(true);
  /** Texto alternativo propio (si no, el nombre y descripción del personaje). */
  alt = input<string | null>(null);
  readonly outlineFilter = 'drop-shadow(0 6px 10px rgba(35,20,23,0.25))';
  label = computed(() => this.alt() ?? LABELS[this.who()] ?? '');
  private host = inject(ElementRef<HTMLElement>);
  private svg = signal('');

  constructor() {
    effect(() => {
      const who = this.who();
      load(who).then((s) => {
        if (this.who() !== who) return;
        const box = this.host.nativeElement.querySelector('div') as HTMLDivElement;
        // Contenido propio y estático de /assets (no viene del usuario).
        box.innerHTML = s;
        const svg = box.querySelector('svg');
        if (svg) svg.setAttribute('style', 'width: 100%; height: 100%; overflow: visible');
        this.svg.set(s);
      });
    });
  }
}
