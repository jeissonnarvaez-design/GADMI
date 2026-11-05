import { Component, OnDestroy, OnInit, computed, inject, input } from '@angular/core';
import { PreferencesService } from '../core/services/preferences.service';
import { SpeechService } from '../core/services/speech.service';

/**
 * Botón de altavoz: lee el texto en voz alta (o lo detiene si ya suena).
 * Con la preferencia «Voz» activa, el texto se lee solo al abrir la pantalla.
 */
@Component({
  selector: 'app-escuchar',
  template: `
    <button type="button" (click)="voice.toggle(text(), who())" [attr.aria-label]="playing() ? 'Detener lectura' : label()" [attr.aria-pressed]="playing() ? 'true' : 'false'" [title]="voice.error() || (playing() ? 'Detener lectura' : label())"
      [style.background]="playing() ? '#AC0B32' : '#FFFFFF'" [style.border-color]="playing() ? '#AC0B32' : '#EADFD0'"
      style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 999px; border: 1px solid #EADFD0; cursor: pointer; display: flex; align-items: center; justify-content: center">
      @if (playing()) {
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg>
      } @else {
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#231417" stroke-width="2" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path></svg>
      }
    </button>
    @if (voice.error() && voice.current() === null) { <span class="sr-only" role="status">{{ voice.error() }}</span> }
  `,
  styles: `:host { display: inline-flex; } button:focus-visible { outline: 3px solid #FF836C; outline-offset: 3px; }`,
})
export class Escuchar implements OnInit, OnDestroy {
  text = input.required<string>();
  label = input('Escuchar instrucción');
  /** Personaje que habla: 'teo' usa la voz Charon de Gemini. */
  who = input<string | undefined>(undefined);
  /** Leer al abrir si el estudiante activó «Voz» en Accesibilidad. */
  auto = input(true);
  voice = inject(SpeechService);
  private prefs = inject(PreferencesService);
  playing = computed(() => this.voice.speaking() && this.voice.current() === this.text());

  ngOnInit() {
    if (this.auto() && this.prefs.prefs().voz) this.voice.speak(this.text(), this.who());
  }
  ngOnDestroy() {
    if (this.playing()) this.voice.cancel();
  }
}
