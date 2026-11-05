import { Component, computed, input } from '@angular/core';

export type MediaKind = 'imagen' | 'video' | 'animacion' | 'audio' | 'pdf' | 'certificado';

const LABELS: Record<MediaKind, string> = {
  imagen: 'Imagen / ilustración',
  video: 'Video',
  animacion: 'Personaje / animación',
  audio: 'Audio / narración',
  pdf: 'Informe PDF',
  certificado: 'Certificado',
};

const ICONS: Record<MediaKind, string> = {
  imagen: '🖼',
  video: '🎬',
  animacion: '✨',
  audio: '🔊',
  pdf: '📄',
  certificado: '🏅',
};

/**
 * Marca visible de un elemento OMITIDO en el prototipo.
 * Indica qué va en ese lugar y con qué herramienta se producirá.
 */
@Component({
  selector: 'app-media-placeholder',
  template: `
    <figure class="ph" [class.compact]="compact()" role="note" [attr.aria-label]="'Pendiente: ' + title()">
      <div class="ph-head">
        <span class="ph-icon" aria-hidden="true">{{ icon() }}</span>
        <span class="ph-kind">{{ label() }}</span>
        <span class="ph-flag">Omitido en el prototipo</span>
      </div>
      <figcaption>
        <strong>{{ title() }}</strong>
        @if (description()) {
          <span class="ph-desc">{{ description() }}</span>
        }
        @if (tool()) {
          <span class="ph-tool">Herramienta prevista: {{ tool() }}</span>
        }
      </figcaption>
    </figure>
  `,
  styles: `
    .ph { margin: 0 0 1rem; border: 2px dashed #c9aa95; border-radius: 22px; background: repeating-linear-gradient(135deg, #fffaf4, #fffaf4 12px, #f7ece0 12px, #f7ece0 24px); color: var(--tinta); padding: .9rem 1rem; min-height: 120px; display: flex; flex-direction: column; justify-content: center; }
    .ph.compact { min-height: 0; padding: .5rem .75rem; }
    .ph-head { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; margin-bottom: .35rem; }
    .ph-icon { font-size: 1.3rem; }
    .ph-kind { font-weight: 700; color: var(--bordo); }
    .ph-flag { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; background: var(--bordo); color: #fff; padding: .1rem .5rem; border-radius: 999px; }
    figcaption { display: flex; flex-direction: column; gap: .2rem; }
    .ph-desc, .ph-tool { font-size: .9rem; color: var(--tinta-suave); }
  `,
})
export class MediaPlaceholder {
  kind = input.required<MediaKind>();
  title = input.required<string>();
  description = input('');
  tool = input('');
  compact = input(false);
  label = computed(() => LABELS[this.kind()]);
  icon = computed(() => ICONS[this.kind()]);
}
