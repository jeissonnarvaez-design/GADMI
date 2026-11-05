import { Component, computed, input } from '@angular/core';

/** Medidor horizontal accesible (role="meter"). */
@Component({
  selector: 'app-meter',
  template: `
    <div class="m">
      <div class="m-head">
        <span class="m-label">{{ label() }}</span>
        <span class="m-value">{{ display() }}</span>
      </div>
      <div class="m-track" role="meter" [attr.aria-label]="label()" [attr.aria-valuenow]="value()" aria-valuemin="0" [attr.aria-valuemax]="max()" [attr.aria-valuetext]="display()">
        <div class="m-fill" [style.width.%]="pct()" [class.over]="over()" [class.reached]="reached()" [class.alert]="alert()"></div>
        @if (target() !== null) {
          <div class="m-target" [style.left.%]="targetPct()" [title]="'Meta: ' + target()"></div>
        }
      </div>
      @if (alert()) { <span class="m-note m-alert">⚠ En alerta: se puede recuperar con tus próximas decisiones.</span> }
      @if (note()) { <span class="m-note">{{ note() }}</span> }
    </div>
  `,
  styles: `
    .m { margin-bottom: .6rem; }
    .m-head { display: flex; justify-content: space-between; gap: .5rem; font-size: .9rem; }
    .m-label { font-weight: 600; }
    .m-track { position: relative; height: 12px; background: #f1e4d6; border-radius: 999px; overflow: visible; margin-top: .2rem; }
    .m-fill { height: 100%; border-radius: 999px; background: var(--coral); transition: width var(--mov) ease; }
    .m-fill.reached { background: var(--cafe); }
    .m-fill.over, .m-fill.alert { background: var(--vino); }
    .m-target { position: absolute; top: -4px; width: 3px; height: 20px; background: var(--tinta); }
    .m-note { font-size: .8rem; color: var(--tinta-suave); display: block; } .m-alert { color: var(--bordo); font-weight: 600; }
  `,
})
export class Meter {
  label = input.required<string>();
  value = input.required<number>();
  max = input(100);
  unit = input('');
  /** Meta a alcanzar (marca vertical). */
  target = input<number | null>(null);
  /** Si true, superar `max` se muestra como exceso (p. ej. presupuesto). */
  limit = input(false);
  note = input('');
  /** Umbral bajo el cual el medidor entra en alerta (sin «game over»). */
  alertBelow = input<number | null>(null);
  alert = computed(() => this.alertBelow() !== null && this.value() < this.alertBelow()!);
  pct = computed(() => Math.max(0, Math.min(100, (this.value() / this.max()) * 100)));
  targetPct = computed(() => Math.min(100, ((this.target() ?? 0) / this.max()) * 100));
  over = computed(() => this.limit() && this.value() > this.max());
  reached = computed(() => this.target() !== null && this.value() >= this.target()!);
  display = computed(() =>
    this.target() !== null ? `${this.value()}${this.unit()} (meta ${this.target()}${this.unit()})` : this.limit() ? `${this.value()} / ${this.max()}${this.unit()}` : `${this.value()}${this.unit()}`,
  );
}
