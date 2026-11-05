import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, BitacoraRow, apiError } from '../../core/services/api.service';
import { CalificarBitacora } from './calificar-bitacora';

/** Revisar bitácoras: leer y, si quiere, calificar (filtros por grupo y módulo). */
@Component({
  selector: 'app-revisar-bitacoras',
  imports: [RouterLink, CalificarBitacora],
  template: `
    <div class="container">
      <nav class="small"><a routerLink="/docente">Panel del curso</a> › Bitácoras</nav>
      <h1>Revisar bitácoras</h1>
      <section class="card row">
        <label for="f-grupo">Grupo</label>
        <select id="f-grupo" class="sel" (change)="group.set($any($event.target).value); load()">
          <option value="">Todos</option>
          @for (g of groups(); track g.grupo) { <option [value]="g.grupo">{{ g.grupo }}</option> }
        </select>
        <label for="f-mod">Módulo</label>
        <select id="f-mod" class="sel" (change)="mod.set(+$any($event.target).value); load()">
          <option value="0">Todos</option>
          @for (m of [1, 2, 3, 4]; track m) { <option [value]="m">Módulo {{ m }}</option> }
        </select>
        <span class="spacer"></span>
        <span class="small muted">{{ rows().length }} bitácoras</span>
      </section>
      @if (error()) { <p class="alerta" role="alert">{{ error() }}</p> }
      @for (r of rows(); track r.estudianteId + '-' + r.moduloId) {
        <app-calificar-bitacora [row]="r" [studentId]="r.estudianteId!" />
      } @empty {
        <p class="muted">No hay bitácoras con estos filtros.</p>
      }
    </div>
  `,
  styles: `.sel { width: auto; }`,
})
export class RevisarBitacorasPage {
  private api = inject(ApiService);
  rows = signal<BitacoraRow[]>([]);
  groups = signal<{ grupo: string; estudiantes: number }[]>([]);
  group = signal('');
  mod = signal(0);
  error = signal('');

  constructor() {
    this.api.grupos().subscribe({ next: (g) => this.groups.set(g), error: () => {} });
    this.load();
  }

  load() {
    this.api.bitacoras({ grupo: this.group() || undefined, modulo: this.mod() || undefined }).subscribe({
      next: (r) => this.rows.set(r),
      error: (e) => this.error.set(apiError(e).message),
    });
  }
}
