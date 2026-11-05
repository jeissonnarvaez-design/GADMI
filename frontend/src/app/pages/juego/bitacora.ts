import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { getModule } from '../../core/data/modules';
import { ProgressService } from '../../core/services/progress.service';
import { Escuchar } from '../../shared/escuchar';
import { Hud } from '../../shared/hud';
import { Personaje } from '../../shared/personaje';

/** Bitácora (Bitacora.dc.html): 3 preguntas de reflexión. No suma puntos. */
@Component({
  selector: 'app-bitacora-page',
  imports: [Hud, Personaje, Escuchar],
  template: `
    <div class="game-bg" style="color: #231417">
      <app-hud [kicker]="'CIERRE · MÓDULO ' + id()" title="Bitácora del gerente" variant="modulo" [mini]="false" />
      <main style="flex: 1; width: 100%; max-width: 900px; margin: 0 auto; padding: 32px; box-sizing: border-box; display: flex; flex-direction: column; gap: 22px; justify-content: center">
        <div style="display: flex; align-items: center; gap: 14px">
          <app-personaje who="teo" [size]="90" />
          <div style="flex: 1; background: #FFFFFF; border-radius: 20px 20px 20px 4px; padding: 14px 18px; font-size: 18px; font-weight: 700">Antes de cerrar el año, cuéntame qué piensas. Aquí no hay respuestas malas.</div>
        </div>
        <div style="display: flex; gap: 6px" [attr.aria-label]="'Pregunta ' + (i() + 1) + ' de 3'">
          @for (q of questions(); track $index) { <span style="flex: 1; height: 6px; border-radius: 999px" [style.background]="$index <= i() ? '#AC0B32' : '#E2D6C8'"></span> }
        </div>
        @for (k of [i()]; track k) {
          <section class="up gpanel" style="background: #FFFFFF; border-radius: 26px; padding: 28px; display: flex; flex-direction: column; gap: 14px">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px"><span class="px" style="font-size: 10px; color: #AC0B32">PREGUNTA {{ i() + 1 }}/3</span><app-escuchar who="teo" [text]="questions()[i()]" label="Escuchar la pregunta" /></div>
            <label style="display: flex; flex-direction: column; gap: 14px">
              <span style="font-size: 24px; font-weight: 800; line-height: 1.25">{{ questions()[i()] }}</span>
              <textarea rows="5" placeholder="Escribe aquí…" [value]="a()[i()]" (input)="setAnswer($any($event.target).value)" style="border-radius: 16px; border: 1.5px solid #D9CBBB; padding: 14px 16px; font-size: 17px; line-height: 1.5; resize: vertical; background: #FBF5EC"></textarea>
            </label>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap">
              <button type="button" (click)="dictar()" [disabled]="!canDictate" [title]="canDictate ? 'Dictar con voz' : 'Tu navegador no permite dictado'" style="min-height: 46px; padding: 0 16px; border-radius: 999px; border: 1px solid #EADFD0; background: #FFFFFF; display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; cursor: pointer; color: #231417"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path></svg>{{ listening() ? 'Escuchando…' : 'Dictar con voz' }}</button>
              <div style="display: flex; gap: 10px">
                @if (i() > 0) { <button type="button" (click)="i.set(i() - 1)" style="min-height: 50px; padding: 0 20px; border-radius: 999px; border: 2px solid #231417; background: transparent; font-weight: 800; font-size: 16px; cursor: pointer; color: #231417">Atrás</button> }
                @if (i() < 2) {
                  <button type="button" (click)="i.set(i() + 1)" class="gbtn" style="min-height: 50px; padding: 0 24px; border-radius: 999px; border: none; background: #AC0B32; color: #FFFFFF; font-weight: 800; font-size: 16px; cursor: pointer">Siguiente</button>
                } @else {
                  <button type="button" (click)="close()" [disabled]="!complete()" class="gbtn glow" [style.background]="complete() ? '#AC0B32' : '#C9B8A6'" style="display: inline-flex; align-items: center; min-height: 50px; padding: 0 24px; border-radius: 999px; border: none; color: #FFFFFF; font-weight: 800; font-size: 16px; cursor: pointer">Guardar y cerrar el año</button>
                }
              </div>
            </div>
            @if (i() === 2 && !complete()) { <span role="status" style="font-size: 13px; color: #8A1428; font-weight: 700">Responde las tres preguntas (mínimo 10 caracteres cada una).</span> }
          </section>
        }
        <p style="margin: 0; font-size: 14px; color: #C9B8A6; text-align: center">La bitácora no suma granos. Es necesaria para el certificado y la profe puede leerla.</p>
      </main>
    </div>
  `,
  styles: `
    a:focus-visible,button:focus-visible,textarea:focus-visible{outline:3px solid #FF836C;outline-offset:2px}
    @keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
    .up{animation:up .4s cubic-bezier(.2,.7,.2,1) both}
    @media (prefers-reduced-motion: reduce){.up{animation:none}}
  `,
})
export class BitacoraPage {
  id = input.required<string>();
  private progress = inject(ProgressService);
  private router = inject(Router);
  i = signal(0);
  a = signal<string[]>(['', '', '']);
  listening = signal(false);
  readonly canDictate = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  questions = computed(() => getModule(Number(this.id()))?.reflections ?? []);
  complete = computed(() => this.a().every((t) => t.trim().length >= 10));

  ngOnInit() {
    this.a.set([...this.progress.reflection(Number(this.id()))]);
  }

  setAnswer(v: string) {
    this.a.update((arr) => arr.map((x, j) => (j === this.i() ? v : x)));
  }

  /** Dictado con el reconocimiento de voz del navegador (si existe). */
  dictar() {
    const W = window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
    const R = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!R) return;
    const rec = new R();
    rec.lang = 'es-CO';
    rec.onresult = (e: any) => this.setAnswer((this.a()[this.i()] + ' ' + e.results[0][0].transcript).trim());
    rec.onend = () => this.listening.set(false);
    this.listening.set(true);
    rec.start();
  }

  close() {
    this.progress.saveReflection(Number(this.id()), this.a());
    this.router.navigate(['/temporada', this.id()]);
  }
}
