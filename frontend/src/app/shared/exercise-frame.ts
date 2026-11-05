import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MAX_ATTEMPTS } from '../core/config';
import { afterExercise, getExercise } from '../core/data/modules';
import { EvalResult } from '../core/models/models';
import { ProgressService } from '../core/services/progress.service';
import { SpeechService } from '../core/services/speech.service';
import { Escuchar } from './escuchar';
import { GameHeader } from './game-header';
import { Granos } from './grano';
import { GradeBadge } from './grade-badge';
import { Personaje, Who } from './personaje';

export type Evaluator = () => { result: EvalResult; answers: unknown };

const WHO: Record<number, Who> = { 1: 'teo', 2: 'nibi', 3: 'nibi', 4: 'chispa' };

/**
 * Marco de los retos con plantilla propia (organigrama y formularios: 2.1, 2.5, 4.2, 4.3),
 * con el estilo videojuego. Dos intentos, pistas tras el 1.º, explicación tras el 2.º.
 */
@Component({
  selector: 'app-exercise-frame',
  imports: [RouterLink, GameHeader, Granos, GradeBadge, Personaje, Escuchar],
  template: `
    <div class="game-bg" style="color: #231417">
      <app-game-header back="/ruta" [kicker]="'MÓDULO ' + ex().module + ' · RETO ' + ex().code + ' · PASO ' + paso()" [title]="ex().title">
        <app-granos [value]="(best()?.points ?? 0) + ' / ' + ex().maxPoints" />
      </app-game-header>

      <main style="flex: 1; width: 100%; max-width: 1180px; margin: 0 auto; padding: 22px 28px 30px; box-sizing: border-box; display: flex; flex-direction: column; gap: 18px; justify-content: center">
        <div style="display: flex; align-items: center; gap: 14px">
          <app-personaje [who]="who()" [size]="80" />
          <div class="gpanel" style="flex: 1; background: #2A0B12; color: #FBF5EC; padding: 12px 16px; display: flex; flex-direction: column; gap: 8px">
            <span style="font-size: 18px; font-weight: 700">{{ ex().consigna }}</span>
            <details class="why-dark"><summary>¿Por qué?</summary><p style="margin: 8px 0 0; font-size: 14px">{{ ex().fundamento }} {{ ex().interaccion }}</p></details>
          </div>
          <app-escuchar [who]="who()" [text]="ex().consigna" />
        </div>

        <section class="work" [attr.aria-disabled]="locked()">
          <ng-content />
        </section>

        <section class="gpanel" style="background: #FBF5EC; padding: 18px 20px; display: flex; flex-direction: column; gap: 12px">
          @if (!locked()) {
            <div class="row">
              <button type="button" class="gbtn" (click)="submit()" [disabled]="!ready()" style="min-height: 50px; padding: 0 22px; border: none; background: #AC0B32; color: #FFFFFF; font-weight: 800; font-size: 16px; cursor: pointer">
                {{ attempts().length === 0 ? 'Revisar' : 'Revisar (2.º intento)' }}
              </button>
              @if (!ready() && readyHint()) { <span class="small muted">{{ readyHint() }}</span> }
            </div>
          }

          <div aria-live="polite">
            @if (last(); as a) {
              <div style="display: flex; gap: 14px; align-items: flex-start; flex-wrap: wrap">
                <app-personaje who="chispa" [size]="72" />
                <div style="flex: 1 1 320px; display: flex; flex-direction: column; gap: 6px">
                  <div class="row">
                    <strong style="font-size: 18px">Intento {{ a.number }}: {{ fmt(a.points) }} de {{ a.max }} granos</strong>
                    <app-grade [grade]="a.grade" />
                  </div>
                  @if (a.summary) { <span style="font-weight: 600">{{ a.summary }}</span> }
                  @if (improvement() > 0) { <span class="tag tag-ok">Subiste {{ fmt(improvement()) }} granos. Eso es mejora continua en acción.</span> }
                  <ul class="fb-list">
                    @if (!locked()) {
                      @for (it of wrong(); track $index) { <li class="li-bad">↺ <strong>{{ it.label }}:</strong> {{ it.hint }}</li> }
                    } @else {
                      @for (it of a.items; track $index) { <li [class.li-ok]="it.ok" [class.li-bad]="!it.ok">{{ it.ok ? '✓' : '↺' }} <strong>{{ it.label }}:</strong> {{ it.explanation }}</li> }
                    }
                  </ul>
                </div>
              </div>
            }
          </div>

          @if (locked()) {
            <div class="row">
              <a class="gbtn glow" [routerLink]="after().link" style="display: inline-flex; align-items: center; min-height: 50px; padding: 0 22px; background: #FBF5EC; color: #1A0609; text-decoration: none"><span class="px" style="font-size: 11px">▶ {{ after().label }}</span></a>
              <a routerLink="/ruta" style="color: #8A1428; font-weight: 700">Volver a la ruta</a>
            </div>
          }
        </section>
      </main>
    </div>
  `,
  styles: `
    .why-dark > summary { cursor: pointer; font-weight: 800; color: #FBF5EC; font-size: 14px; }
    .fb-list { padding-left: 0; list-style: none; margin: 4px 0 0; }
    .fb-list li { margin-bottom: .35rem; }
    .li-ok { color: #2C5E31; }
    .li-bad { color: #8A1428; }
    a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid #FBF5EC;outline-offset:3px;box-shadow:0 0 0 6px #231417;}
  `,
})
export class ExerciseFrame {
  /** Rótulo «PASO n/N» (los retos con plantilla propia son de un paso salvo que indiquen otro). */
  paso = input('1/1');
  exerciseId = input.required<string>();
  evaluate = input.required<Evaluator>();
  ready = input(true);
  readyHint = input('');

  private progress = inject(ProgressService);
  voice = inject(SpeechService);
  readonly maxAttempts = MAX_ATTEMPTS;

  ex = computed(() => getExercise(this.exerciseId()));
  who = computed(() => WHO[this.ex().module] ?? 'teo');
  attempts = computed(() => (this.progress.moduleStats(), this.progress.attempts(this.exerciseId())));
  attemptNo = computed(() => Math.min(this.attempts().length + 1, MAX_ATTEMPTS));
  last = computed(() => this.attempts().at(-1));
  best = computed(() => (this.attempts(), this.progress.best(this.exerciseId())));
  locked = computed(() => (this.attempts(), this.progress.isLocked(this.exerciseId())));
  wrong = computed(() => this.last()?.items.filter((i) => !i.ok) ?? []);
  improvement = computed(() => {
    const list = this.attempts();
    return list.length === 2 ? list[1].points - list[0].points : 0;
  });
  after = computed(() => afterExercise(this.exerciseId()));

  submit() {
    const { result, answers } = this.evaluate()();
    this.progress.submit(this.ex(), result, answers);
  }

  fmt(n: number) {
    return Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',');
  }
}
