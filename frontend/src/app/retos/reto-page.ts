import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getExerciseByCode } from '../core/data/modules';
import { ProgressService } from '../core/services/progress.service';
import { RETOS_JSON } from './registry';
import { Reto11 } from './dc/reto-11';
import { Reto12 } from './dc/reto-12';
import { Reto13 } from './dc/reto-13';
import { Reto14 } from './dc/reto-14';
import { Reto21 } from './dc/reto-21';
import { Reto22 } from './dc/reto-22';
import { Reto23 } from './dc/reto-23';
import { Reto24 } from './dc/reto-24';
import { Reto25 } from './dc/reto-25';
import { Reto31 } from './dc/reto-31';
import { Reto32 } from './dc/reto-32';
import { Reto33 } from './dc/reto-33';
import { Reto34 } from './dc/reto-34';
import { Reto41 } from './dc/reto-41';
import { Reto42 } from './dc/reto-42';
import { Reto43 } from './dc/reto-43';
import { Reto44 } from './dc/reto-44';

/** /reto/:code → plantilla según el JSON del reto (o componente generado del diseño final: retos 2.1–4.4). */
@Component({
  selector: 'app-reto-page',
  imports: [RouterLink, Reto11, Reto12, Reto13, Reto14, Reto21, Reto22, Reto23, Reto24, Reto25, Reto31, Reto32, Reto33, Reto34, Reto41, Reto42, Reto43, Reto44],
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
          }
        } @else {
          @switch (code()) {
            @case ('2.1') { <app-reto-21 /> }
            @case ('2.2') { <app-reto-22 /> }
            @case ('2.3') { <app-reto-23 /> }
            @case ('2.4') { <app-reto-24 /> }
            @case ('2.5') { <app-reto-25 /> }
            @case ('3.1') { <app-reto-31 /> }
            @case ('3.2') { <app-reto-32 /> }
            @case ('3.3') { <app-reto-33 /> }
            @case ('3.4') { <app-reto-34 /> }
            @case ('4.1') { <app-reto-41 /> }
            @case ('4.2') { <app-reto-42 /> }
            @case ('4.3') { <app-reto-43 /> }
            @case ('4.4') { <app-reto-44 /> }
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
  json = computed(() => RETOS_JSON[this.code()] as { template?: string } | undefined);
  open = computed(() => (this.progress.moduleStats(), !!this.meta() && this.progress.isModuleOpen(this.meta()!.module)));
}
