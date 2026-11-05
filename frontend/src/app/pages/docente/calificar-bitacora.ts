import { Component, inject, input, output, signal } from '@angular/core';
import { getModule } from '../../core/data/modules';
import { ApiService, BitacoraRow, apiError } from '../../core/services/api.service';

/** Lectura y calificación opcional (1–5) de una bitácora. */
@Component({
  selector: 'app-calificar-bitacora',
  template: `
    <article class="card bit">
      <div class="row">
        <h3>Módulo {{ row().moduloId }}</h3>
        @if (row().nombre) { <span class="small muted">{{ row().nombre }} · {{ row().codigo }} · {{ row().grupo }}</span> }
      </div>
      <ol>
        @for (q of questions(); track $index) {
          <li><span class="small muted">{{ q }}</span><br />{{ row().respuestas[$index] || '—' }}</li>
        }
      </ol>
      <div class="row">
        <label [for]="'cal-' + key()">Calificación (opcional)</label>
        <select class="sel" [id]="'cal-' + key()" (change)="grade.set($any($event.target).value)">
          <option value="" [selected]="grade() === ''">Sin calificar</option>
          @for (n of scale; track n) { <option [value]="n" [selected]="grade() === '' + n">{{ n.toFixed(1) }}</option> }
        </select>
        <label class="sr-only" [for]="'com-' + key()">Comentario</label>
        <input type="text" class="com" [id]="'com-' + key()" placeholder="Comentario para el estudiante" [value]="comment()" (input)="comment.set($any($event.target).value)" />
        <button type="button" class="btn btn-sm" (click)="save()">Guardar</button>
        <span class="small" aria-live="polite">{{ status() }}</span>
      </div>
    </article>
  `,
  styles: `.bit { margin-bottom: .8rem; } ol { padding-left: 1.2rem; } li { margin-bottom: .4rem; } .sel { width: auto; } .com { flex: 1; min-width: 12rem; }`,
})
export class CalificarBitacora {
  row = input.required<BitacoraRow>();
  studentId = input.required<number>();
  saved = output<void>();
  private api = inject(ApiService);
  readonly scale = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  grade = signal('');
  comment = signal('');
  status = signal('');

  ngOnInit() {
    const c = this.row().calificacion;
    this.grade.set(c === null ? '' : String(c));
    this.comment.set(this.row().comentario ?? '');
  }

  key() {
    return `${this.studentId()}-${this.row().moduloId}`;
  }

  questions() {
    return getModule(this.row().moduloId)?.reflections ?? [];
  }

  save() {
    this.api.calificarBitacora(this.studentId(), this.row().moduloId, this.grade() === '' ? null : Number(this.grade()), this.comment()).subscribe({
      next: () => {
        this.status.set('Guardado.');
        this.saved.emit();
      },
      error: (e) => this.status.set(apiError(e).message),
    });
  }
}
