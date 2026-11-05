import { Component, ElementRef, HostListener, afterNextRender, computed, effect, inject, Injector, input, model, output, signal, untracked, viewChild } from '@angular/core';

export interface TourStep {
  /** Valor del atributo data-tour del elemento que se resalta. */
  target: string;
  text: string;
}

/**
 * Recorrido guiado: resalta una parte a la vez, oscurece y bloquea el resto,
 * y muestra un texto de una línea con «Siguiente» y «Saltar tour».
 * Teclado: Tab se queda en los botones del recorrido y Esc lo cierra.
 * Cada paso se anuncia a los lectores de pantalla (aria-live).
 */
@Component({
  selector: 'app-tour',
  template: `
    @if (open()) {
      <div class="tour-block" (click)="$event.stopPropagation()" aria-hidden="true"></div>
      @if (rect(); as r) {
        <div class="tour-spot" aria-hidden="true" [style.top.px]="r.top - 6" [style.left.px]="r.left - 6" [style.width.px]="r.width + 12" [style.height.px]="r.height + 12"></div>
      }
      <div #box class="tour-box up" role="dialog" aria-modal="true" aria-labelledby="tour-txt" [style.top.px]="pos().top" [style.left.px]="pos().left" [style.transform]="pos().above ? 'translateY(-100%)' : 'none'">
        <span class="px" style="font-size: 10px; color: #AC0B32; margin-bottom: 4px">RECORRIDO · {{ i() + 1 }}/{{ steps().length }}</span>
        <p id="tour-txt" style="margin: 0; font-size: 16px; font-weight: 700; line-height: 1.35">{{ step().text }}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px">
          <button #skip type="button" (click)="close(false)" (keydown)="trap($event)" style="min-height: 44px; padding: 0 12px; border: none; background: transparent; color: #8A1428; font-size: 14px; font-weight: 700; text-decoration: underline; cursor: pointer">Saltar tour</button>
          <button #next type="button" class="gbtn" (click)="advance()" (keydown)="trap($event)" style="min-height: 44px; padding: 0 18px; border: none; background: #AC0B32; color: #FFFFFF; cursor: pointer"><span class="px" style="font-size: 10px">{{ last() ? '✓ LISTO' : '▶ SIGUIENTE' }}</span></button>
        </div>
      </div>
      <div class="sr" aria-live="assertive">{{ announce() }}</div>
    }
  `,
  styles: `
    .tour-block{position:fixed;inset:0;z-index:1000;background:transparent;cursor:not-allowed}
    .tour-spot{position:fixed;z-index:1001;border-radius:14px;box-shadow:0 0 0 9999px rgba(26,6,9,.8);outline:3px solid #FF836C;pointer-events:none;transition:all .3s cubic-bezier(.2,.7,.2,1)}
    .tour-box{position:fixed;z-index:1002;width:min(360px, calc(100vw - 32px));box-sizing:border-box;padding:14px 16px;border-radius:8px;background:#FBF5EC;color:#231417;box-shadow:4px 4px 0 #8A1428;display:flex;flex-direction:column;gap:10px;font-family:'DM Sans',Arial,sans-serif}
    .tour-box button:focus-visible{outline:3px solid #231417;outline-offset:2px}
    .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
    @keyframes up{from{opacity:0;transform:translateY(12px)}to{opacity:1}}
    .up{animation:up .3s cubic-bezier(.2,.7,.2,1) both}
    @media (prefers-reduced-motion: reduce){.up{animation:none}.tour-spot{transition:none}}
  `,
})
export class Tour {
  steps = input.required<TourStep[]>();
  open = model(false);
  /** true = terminó; false = lo saltó o cerró con Esc. */
  closed = output<boolean>();

  i = signal(0);
  rect = signal<DOMRect | null>(null);
  step = computed(() => this.steps()[this.i()]);
  last = computed(() => this.i() === this.steps().length - 1);
  announce = computed(() => `Recorrido guiado, paso ${this.i() + 1} de ${this.steps().length}: ${this.step().text}`);
  pos = computed(() => {
    const r = this.rect();
    const vw = typeof window === 'undefined' ? 1280 : window.innerWidth;
    const vh = typeof window === 'undefined' ? 800 : window.innerHeight;
    const w = Math.min(360, vw - 32);
    if (!r) return { top: vh / 2 - 60, left: (vw - w) / 2, above: false };
    const left = Math.max(16, Math.min(r.left + r.width / 2 - w / 2, vw - w - 16));
    const below = r.bottom + 18;
    if (below + 150 < vh) return { top: below, left, above: false };
    if (r.top - 18 > 150) return { top: r.top - 18, left, above: true };
    return { top: Math.max(16, vh - 170), left, above: false };
  });

  private nextBtn = viewChild<ElementRef<HTMLButtonElement>>('next');
  private skipBtn = viewChild<ElementRef<HTMLButtonElement>>('skip');
  private injector = inject(Injector);
  private returnFocus: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const open = this.open();
      const i = this.i();
      untracked(() => {
        if (!open) return;
        if (i === 0 && !this.returnFocus) this.returnFocus = document.activeElement as HTMLElement | null;
        const el = this.target();
        el?.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
        this.measure();
        afterNextRender(() => { this.measure(); this.nextBtn()?.nativeElement.focus(); }, { injector: this.injector });
      });
    });
  }

  /** Abre el recorrido desde el primer paso. */
  start() {
    this.i.set(0);
    this.open.set(true);
  }

  advance() {
    if (this.last()) this.close(true);
    else this.i.update((n) => n + 1);
  }

  close(finished: boolean) {
    if (!this.open()) return;
    this.open.set(false);
    this.i.set(0);
    this.rect.set(null);
    this.closed.emit(finished);
    this.returnFocus?.focus?.();
    this.returnFocus = null;
  }

  /** El foco no sale de los dos botones del recorrido. */
  trap(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const a = this.skipBtn()?.nativeElement;
    const b = this.nextBtn()?.nativeElement;
    (document.activeElement === a ? b : a)?.focus();
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.open()) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.close(false);
    } else if (e.key === 'Tab' && !(e.target as HTMLElement)?.closest?.('.tour-box')) {
      e.preventDefault();
      this.nextBtn()?.nativeElement.focus();
    }
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  measure() {
    if (!this.open()) return;
    this.rect.set(this.target()?.getBoundingClientRect() ?? null);
  }

  private target(): HTMLElement | null {
    return document.querySelector<HTMLElement>(`[data-tour="${this.step().target}"]`);
  }
}
