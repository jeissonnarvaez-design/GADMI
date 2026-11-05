import { Component, computed, input } from '@angular/core';
import { PASS_GRADE } from '../core/services/grading';

/** Nota en escala 1–5 (3 es el mínimo aprobatorio). */
@Component({
  selector: 'app-grade',
  template: `
    @if (grade() === null) {
      <span class="g pending">Sin nota</span>
    } @else {
      <span class="g" [class.pass]="pass()" [class.fail]="!pass()" [attr.aria-label]="'Nota ' + grade() + ' de 5, ' + status()">
        <strong>{{ grade()!.toFixed(1) }}</strong><span>/ 5</span>
        @if (showStatus()) { <em>{{ status() }}</em> }
      </span>
    }
  `,
  styles: `
    .g { display: inline-flex; align-items: baseline; gap: .25rem; padding: .15rem .6rem; border-radius: 8px; font-size: .95rem; white-space: nowrap; }
    .g strong { font-size: 1.15rem; }
    .g em { font-style: normal; font-size: .8rem; font-weight: 600; margin-left: .3rem; }
    .pass { background: var(--ok-claro); color: var(--ok); }
    .fail { background: var(--error-claro); color: var(--bordo); }
    .pending { background: #eee7dd; color: var(--tinta-suave); }
  `,
})
export class GradeBadge {
  grade = input<number | null>(null);
  showStatus = input(true);
  pass = computed(() => (this.grade() ?? 0) >= PASS_GRADE);
  status = computed(() => (this.pass() ? 'Aprobado' : 'Por debajo del mínimo (3,0)'));
}
