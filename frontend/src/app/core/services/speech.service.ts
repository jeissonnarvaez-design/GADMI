import { Injectable, inject, signal } from '@angular/core';
import { API_URL } from '../config';
import { AuthService } from './auth.service';

/** Personajes con voz propia de Gemini (Teo = Charon). Los demás usan la voz del navegador. */
const GEMINI_VOICES = ['teo'];

/**
 * Voz del aplicativo (speechSynthesis del navegador, español de Colombia si existe).
 * Más adelante se puede cambiar por la API de Gemini sin tocar las pantallas.
 *
 * Corrige fallos conocidos de Chrome/Edge:
 *  - speak() justo después de cancel() se descarta en silencio → se espera un momento.
 *  - la frase puede ser recolectada antes de sonar → se guarda una referencia.
 *  - las voces cargan tarde (getVoices() vacío al inicio) → se escucha «voiceschanged».
 *  - el motor puede quedar en pausa → resume() antes de hablar.
 */
@Injectable({ providedIn: 'root' })
export class SpeechService {
  readonly speaking = signal(false);
  /** Texto que se está leyendo (para resaltar el botón que lo lanzó). */
  readonly current = signal<string | null>(null);
  readonly supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  /** Último problema (p. ej. el navegador no tiene voces instaladas). */
  readonly error = signal('');

  private voice: SpeechSynthesisVoice | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private keepAlive: ReturnType<typeof setInterval> | null = null;
  private auth = inject(AuthService);
  private audio: HTMLAudioElement | null = null;
  private audioUrl: string | null = null;
  /** Cada lectura tiene un número: si llega una respuesta vieja, se ignora. */
  private seq = 0;
  /** Si Gemini falla (sin clave, sin red), no se vuelve a intentar en esta sesión. */
  private geminiOff = false;

  constructor() {
    if (!this.supported) return;
    this.pickVoice();
    speechSynthesis.addEventListener?.('voiceschanged', () => this.pickVoice());
  }

  /** Prefiere es-CO, luego otras variantes latinas, luego cualquier español. */
  private pickVoice() {
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return;
    const es = voices.filter((v) => v.lang?.toLowerCase().startsWith('es'));
    const by = (...langs: string[]) => es.find((v) => langs.includes(v.lang.toLowerCase().replace('_', '-')));
    this.voice = by('es-co') ?? by('es-419', 'es-mx', 'es-us') ?? es.find((v) => v.localService) ?? es[0] ?? null;
  }

  /**
   * Lee el texto. Con `who = 'teo'` usa la voz Charon de Gemini (vía el backend);
   * si no está disponible, cae a la voz del navegador.
   */
  speak(text: string, who?: string) {
    if (who && GEMINI_VOICES.includes(who) && !this.geminiOff && this.auth.token()) {
      this.speakGemini(text, who);
      return;
    }
    this.speakBrowser(text);
  }

  private async speakGemini(text: string, who: string) {
    this.cancel();
    const id = ++this.seq;
    this.error.set('');
    this.speaking.set(true);
    this.current.set(text);
    try {
      const res = await fetch(`${API_URL}/voz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.auth.token()}` },
        body: JSON.stringify({ texto: text.replace(/[«»▶▌]/g, '').trim(), personaje: who }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      if (id !== this.seq) return; // se pidió otra lectura mientras tanto
      this.audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(this.audioUrl);
      this.audio = audio;
      audio.onended = () => id === this.seq && this.finishAudio();
      audio.onerror = () => id === this.seq && this.fallback(text);
      await audio.play();
    } catch {
      if (id !== this.seq) return;
      this.geminiOff = true;
      this.fallback(text);
    }
  }

  private fallback(text: string) {
    this.stopAudio();
    this.speakBrowser(text);
  }

  private finishAudio() {
    this.stopAudio();
    this.speaking.set(false);
    this.current.set(null);
  }

  private stopAudio() {
    if (this.audio) {
      this.audio.onended = null;
      this.audio.onerror = null;
      this.audio.pause();
    }
    if (this.audioUrl) URL.revokeObjectURL(this.audioUrl);
    this.audio = null;
    this.audioUrl = null;
  }

  private speakBrowser(text: string) {
    if (!this.supported) {
      this.error.set('Tu navegador no tiene lectura en voz alta.');
      return;
    }
    const clean = text.replace(/[«»▶▌]/g, '').trim();
    if (!clean) return;
    this.stopTimers();
    speechSynthesis.cancel();
    this.error.set('');
    this.speaking.set(true);
    this.current.set(text);
    // Pausa breve: si se habla justo después de cancel(), Chrome descarta la frase.
    this.timer = setTimeout(() => {
      if (!this.voice) this.pickVoice();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = this.voice?.lang ?? 'es-CO';
      if (this.voice) u.voice = this.voice;
      u.rate = 1;
      u.pitch = 1;
      u.onend = () => this.done(u);
      u.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          this.error.set(e.error === 'not-allowed' ? 'Pulsa el botón de nuevo para escuchar.' : 'No se pudo reproducir la voz en este navegador.');
        }
        this.done(u);
      };
      this.utterance = u;
      speechSynthesis.resume();
      speechSynthesis.speak(u);
      // Chrome corta las lecturas largas (~15 s) si no se «despierta» el motor.
      this.keepAlive = setInterval(() => {
        if (!speechSynthesis.speaking) return;
        speechSynthesis.pause();
        speechSynthesis.resume();
      }, 10000);
    }, 120);
  }

  /** Lee el texto o, si ya se está leyendo ese mismo texto, lo detiene. */
  toggle(text: string, who?: string) {
    if (this.speaking() && this.current() === text) this.cancel();
    else this.speak(text, who);
  }

  cancel() {
    this.seq++;
    this.stopAudio();
    if (!this.supported) {
      this.speaking.set(false);
      this.current.set(null);
      return;
    }
    this.stopTimers();
    speechSynthesis.cancel();
    this.utterance = null;
    this.speaking.set(false);
    this.current.set(null);
  }

  private done(u: SpeechSynthesisUtterance) {
    if (this.utterance !== u) return;
    this.stopTimers();
    this.utterance = null;
    this.speaking.set(false);
    this.current.set(null);
  }

  private stopTimers() {
    if (this.timer) clearTimeout(this.timer);
    if (this.keepAlive) clearInterval(this.keepAlive);
    this.timer = null;
    this.keepAlive = null;
  }
}
