import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getExerciseByCode } from '../core/data/modules';
import { ProgressService } from '../core/services/progress.service';
import { CuellosBotellaExercise } from '../exercises/modulo4/cuellos-botella';
import { PlanAccionExercise } from '../exercises/modulo4/plan-accion';
import { OrganigramaExercise } from '../exercises/modulo2/organigrama';
import { PresupuestoVerdeExercise } from '../exercises/modulo2/presupuesto-verde';
import { RETOS_JSON } from './registry';
import type { CartasReto, CuadrantesReto, MetasReto, PartesReto, TarjetasReto } from './reto.types';
import { RetoCartas } from './templates/cartas';
import { RetoCuadrantes } from './templates/cuadrantes';
import { RetoMetas } from './templates/metas';
import { RetoPartes } from './templates/partes';
import { RetoTarjetas } from './templates/tarjetas';
import { Reto11 } from './dc/reto-11';
import { Reto12 } from './dc/reto-12';
import { Reto13 } from './dc/reto-13';
import { Reto14 } from './dc/reto-14';

/** /reto/:code → plantilla según el JSON del reto (o componente propio: organigrama y formularios). */
@Component({
  selector: 'app-reto-page',
  imports: [RouterLink, Reto11, Reto12, Reto13, Reto14, RetoTarjetas, RetoPartes, RetoCuadrantes, RetoMetas, RetoCartas, OrganigramaExercise, PresupuestoVerdeExercise, CuellosBotellaExercise, PlanAccionExercise],
  template: `
    @if (!meta()) {
      <div class="game-bg" style="align-items: center; justify-content: center; color: #FBF5EC"><p>Reto no encontrado. <a routerLink="/ruta" style="color: #FBF5EC">Volver a la ruta</a></p></div>
    } @else if (!open()) {
      <div class="game-bg" style="align-items: center; justify-content: center; color: #FBF5EC; gap: 16px; text-align: center; padding: 32px">
        <span class="px" style="font-size: 12px; color: #FBF5EC">BLOQUEADO</span>
        <p style="font-size: 20px; font-weight: 700; margin: 0">Este reto se abre al terminar el módulo {{ meta()!.module - 1 }}.</p>
        <a class="gbtn" routerLink="/ruta" style="padding: 12px 20px; background: #FBF5EC; color: #1A0609; text-decoration: none; font-weight: 800">Volver a la ruta</a>
      </div>
    } @else {
      @for (k of [code()]; track k) {
        @if (json(); as d) {
          @switch ($any(d.template)) {
            @case ('brujula') { <app-reto-11 /> }
            @case ('valores') { <app-reto-12 /> }
            @case ('foda') { <app-reto-13 /> }
            @case ('metas-v2') { <app-reto-14 /> }
            @case ('tarjetas') { <app-reto-tarjetas [data]="$any(d)" /> }
            @case ('partes') { <app-reto-partes [data]="$any(d)" /> }
            @case ('cuadrantes') { <app-reto-cuadrantes [data]="$any(d)" /> }
            @case ('metas') { <app-reto-metas [data]="$any(d)" /> }
            @case ('cartas') { <app-reto-cartas [data]="$any(d)" /> }
          }
        } @else {
          @switch (code()) {
            @case ('2.1') { <app-organigrama /> }
            @case ('2.5') { <app-presupuesto-verde /> }
            @case ('4.2') { <app-cuellos-botella /> }
            @case ('4.3') { <app-plan-accion /> }
          }
        }
      }
    }
  `,
})
export class RetoPage {
  code = input.required<string>();
  private progress = inject(ProgressService);
  meta = computed(() => getExerciseByCode(this.code()));
  json = computed(() => RETOS_JSON[this.code()] as TarjetasReto | PartesReto | CuadrantesReto | MetasReto | CartasReto | undefined);
  open = computed(() => (this.progress.moduleStats(), !!this.meta() && this.progress.isModuleOpen(this.meta()!.module)));
}
