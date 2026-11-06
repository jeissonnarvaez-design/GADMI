import { Component, ElementRef, OnDestroy, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreferencesService } from '../../core/services/preferences.service';
import { SpeechService } from '../../core/services/speech.service';
import { Personaje } from '../../shared/personaje';

const SC: [string, string, string][] = [
  ['Teo', 'Soy Teo, cacao del Pacífico colombiano.', 'música suave · olas'],
  ['Teo', 'Llego a CACAO Raíz: 48 personas, 120 familias.', 'máquinas de la planta'],
  ['Chispa', '¡Uy! Los datos dicen que estamos en rojo.', 'alerta suave'],
  ['Nibi', 'La gente está cansada y se está yendo.', 'música baja'],
  ['Teo', 'Desde hoy eres gerente. Del grano a la barra, sin dañar a nadie.', 'música que sube · aplausos'],
];
const DUR = [5, 6, 6, 6, 7];
const TOTAL = DUR.reduce((a, b) => a + b, 0);
const fmt = (s: number) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

/**
 * Video de bienvenida (Intro.dc.html).
 * Usa el video real public/assets/video/IMG_7890.MOV (o bienvenida.mp4 si existe) con subtítulos
 * public/assets/video/bienvenida.vtt. El video ya trae su voz: no se usa voz del navegador ni de IA.
 * Solo si no hay video se muestra la versión animada (esa sí con la voz de los personajes).
 * Adelantar solo funciona sobre lo ya visto; no hay botón «Saltar».
 */
@Component({
  selector: 'app-video',
  imports: [RouterLink, Personaje],
  templateUrl: './video.html',
  styles: `
a{color:#FFFFFF}
a:focus-visible,button:focus-visible{outline:3px solid #FBF5EC;outline-offset:3px;box-shadow:0 0 0 6px #231417;}
button{font-family:inherit}
@keyframes up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@keyframes pop{0%{opacity:0;transform:scale(.4)}70%{transform:scale(1.08)}100%{opacity:1;transform:scale(1)}}
@keyframes grow{from{width:0}}
@keyframes draw{from{stroke-dashoffset:900}to{stroke-dashoffset:0}}
@keyframes flash{0%,100%{box-shadow:inset 0 0 0 0 #FF051E}50%{box-shadow:inset 0 0 0 10px #FF051E}}
@keyframes dots{0%,100%{opacity:.2}50%{opacity:1}}
.up{animation:up .7s cubic-bezier(.2,.7,.2,1) both}
.pop{animation:pop .7s cubic-bezier(.2,.7,.2,1) both}
.grow{animation:grow 1.6s cubic-bezier(.2,.7,.2,1) .6s both}
.draw{stroke-dasharray:900;animation:draw 2.4s ease-out both}
.flash{animation:flash 1s ease-in-out 3}
.dot{animation:dots 1.2s infinite}.dot2{animation-delay:.2s}.dot3{animation-delay:.4s}
.d1{animation-delay:.4s}.d2{animation-delay:.9s}.d3{animation-delay:1.4s}.d4{animation-delay:1.9s}
@media (max-width: 640px){
  .ctrls{grid-template-columns:1fr !important;justify-items:center;gap:10px !important}
  .ctrls > div:last-child{justify-content:center !important}
  .stage p[aria-live]{font-size:15px !important;padding:8px 12px !important;bottom:10px !important;width:92% !important}
}
video::cue{background:rgba(20,10,12,.9);color:#FFFFFF;font-family:'DM Sans',Arial,sans-serif;font-size:20px;line-height:1.4}
@media (prefers-reduced-motion: reduce){.up,.pop,.grow,.draw,.flash,.dot{animation:none}}
  `,
})
export class VideoPage implements OnInit, OnDestroy {
  private voice = inject(SpeechService);
  private prefs = inject(PreferencesService);
  private vid = viewChild<ElementRef<HTMLVideoElement>>('vid');
  private stage = viewChild<ElementRef<HTMLElement>>('stage');
  /** Escala de las escenas animadas (1 en computador; menos en celular). */
  k = signal(1);
  private ro?: ResizeObserver;
  scene = signal(0);
  t = signal(0);
  playing = signal(true);
  captions = signal(this.prefs.prefs().subtitulos);
  /** Transcripción completa debajo del video. */
  tr = signal(false);
  /** Escena más lejana ya vista (versión animada) / segundo más lejano visto (video real). */
  seen = signal(0);
  videoReady = signal(false);
  /** Mientras se averigua si hay video real, la versión animada espera (y no habla). */
  private probando = signal(true);
  private sinVideoTimer: ReturnType<typeof setTimeout> | null = null;
  /** Líneas de la transcripción del video real, leídas del .vtt («Quién: texto» o solo texto). */
  private lineasVtt = signal<[string, string][]>([]);
  ended = signal(false);
  vTime = signal(0);
  vDur = signal(TOTAL);
  private maxWatched = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  readonly transcript: [string, string][] = SC.map(([who, text]) => [who, text]);
  transcripcion = computed(() => (this.videoReady() ? this.lineasVtt() : this.transcript));

  readonly meters = [['Ambiental', '22%'], ['Social', '28%'], ['Gobernanza', '10%'], ['Económico', '55%']];
  readonly stages = [
    ['Siembra', 'Planear', '#AC0B32', 'M12 21v-8M12 13c-4 0-6-3-6-7 4 0 6 3 6 7zM12 13c4 0 6-3 6-7-4 0-6 3-6 7z'],
    ['Árbol', 'Organizar', '#8A1428', 'M12 22v-7M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8 18h8'],
    ['Cosecha', 'Dirigir', '#9A5B2E', 'M12 3c4 2 6 6 6 10s-2 8-6 8-6-4-6-8 2-8 6-10zM12 3v18M8 8c1 4 1 8 0 11M16 8c-1 4-1 8 0 11'],
    ['Barra', 'Controlar', '#231417', 'M5 6h14v12H5zM5 10h14M5 14h14M10 6v12M15 6v12'],
  ];

  speaker = computed(() => SC[this.scene()][0]);
  caption = computed(() => SC[this.scene()][1]);
  elapsed = computed(() => (this.videoReady() ? this.vTime() : DUR.slice(0, this.scene()).reduce((a, b) => a + b, 0) + this.t()));
  total = computed(() => (this.videoReady() ? this.vDur() : TOTAL));
  progress = computed(() => ((this.elapsed() / (this.total() || 1)) * 100).toFixed(1) + '%');
  time = computed(() => fmt(this.elapsed()) + ' / ' + fmt(this.total()));
  canNext = computed(() => (this.videoReady() ? this.vTime() + 1 < this.seen() : this.scene() < this.seen()));

  ngAfterViewInit() {
    const el = this.stage()?.nativeElement;
    if (!el || typeof ResizeObserver === 'undefined') return;
    this.ro = new ResizeObserver(() => this.k.set(Math.min(1, el.clientWidth / 1132)));
    this.ro.observe(el);
  }

  ngOnInit() {
    this.timer = setInterval(() => {
      if (this.videoReady() || this.probando() || !this.playing()) return;
      const t = this.t() + 0.2;
      if (t < DUR[this.scene()]) return this.t.set(t);
      if (this.scene() < DUR.length - 1) this.go(this.scene() + 1);
      else {
        this.playing.set(false);
        this.t.set(DUR[this.scene()]);
        this.seen.set(DUR.length - 1);
      }
    }, 200);
    // Si en 8 s el video no ha cargado ni fallado, se muestra la versión animada.
    // (Si el video llega después, se cambia a él y se calla la voz).
    this.sinVideoTimer = setTimeout(() => this.sinVideo(), 8000);
  }
  ngOnDestroy() {
    this.ro?.disconnect();
    if (this.sinVideoTimer) clearTimeout(this.sinVideoTimer);
    if (this.timer) clearInterval(this.timer);
    this.voice.cancel();
  }

  // ---------- Video real
  /** No hay video real (o el navegador no puede reproducirlo): versión animada con voz. */
  sinVideo() {
    if (!this.probando() || this.videoReady()) return;
    this.probando.set(false);
    if (this.sinVideoTimer) clearTimeout(this.sinVideoTimer);
    if (this.playing()) this.speak(this.scene());
  }
  onVideoReady() {
    const v = this.vid()?.nativeElement;
    if (!v) return;
    this.probando.set(false);
    if (this.sinVideoTimer) clearTimeout(this.sinVideoTimer);
    this.voice.cancel();
    this.scene.set(0);
    this.t.set(0);
    this.videoReady.set(true);
    this.vDur.set(v.duration || TOTAL);
    this.applyCaptions();
    v.play().catch(() => this.playing.set(false));
  }
  onTime() {
    const v = this.vid()!.nativeElement;
    this.vTime.set(v.currentTime);
    if (v.currentTime > this.maxWatched && v.currentTime - this.maxWatched < 1.5) this.maxWatched = v.currentTime;
    this.seen.set(this.maxWatched);
  }
  /** No se puede saltar a una parte que todavía no se ha visto. */
  onSeeking() {
    const v = this.vid()!.nativeElement;
    if (v.currentTime > this.maxWatched + 0.5) v.currentTime = this.maxWatched;
  }
  onEnded() {
    this.ended.set(true);
    this.playing.set(false);
  }
  private applyCaptions() {
    const track = this.vid()?.nativeElement.textTracks?.[0];
    if (track) track.mode = this.captions() ? 'showing' : 'hidden';
    this.leerSubtitulos();
  }
  /** Arma la transcripción con los textos del .vtt. */
  leerSubtitulos() {
    const cues = this.vid()?.nativeElement.textTracks?.[0]?.cues;
    if (!cues?.length) return;
    const out: [string, string][] = [];
    for (const c of Array.from(cues) as VTTCue[]) {
      const txt = String(c.text ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (!txt) continue;
      const m = txt.match(/^([A-ZÁÉÍÓÚÑ][\wáéíóúñ]{1,15}):\s*(.+)$/);
      out.push(m ? [m[1], m[2]] : ['', txt]);
    }
    this.lineasVtt.set(out);
  }

  // ---------- Versión animada (provisional)
  private speak(i: number) {
    // Nunca se habla encima del video real (ya trae su voz) ni mientras se averigua si existe.
    if (this.videoReady() || this.probando()) return;
    this.voice.speak(SC[i][1], SC[i][0].toLowerCase());
  }
  go(i: number) {
    const s = Math.max(0, Math.min(DUR.length - 1, i));
    this.scene.set(s);
    this.t.set(0);
    this.seen.set(Math.max(this.seen(), s));
    if (this.playing()) this.speak(s);
  }

  // ---------- Controles
  prev() {
    const v = this.vid()?.nativeElement;
    if (this.videoReady() && v) {
      v.currentTime = Math.max(0, v.currentTime - 6);
      this.ended.set(false);
    } else this.go(this.scene() - 1);
  }
  next() {
    if (!this.canNext()) return;
    const v = this.vid()?.nativeElement;
    if (this.videoReady() && v) v.currentTime = Math.min(this.maxWatched, v.currentTime + 6);
    else this.go(this.scene() + 1);
  }
  togglePlay() {
    const v = this.vid()?.nativeElement;
    if (this.videoReady() && v) {
      if (v.paused) {
        this.ended.set(false);
        v.play().catch(() => {});
      } else v.pause();
      return;
    }
    if (!this.playing() && this.scene() === DUR.length - 1 && this.t() >= DUR[this.scene()]) {
      this.playing.set(true);
      this.go(0);
      return;
    }
    const was = this.playing();
    this.playing.set(!was);
    if (!was) this.speak(this.scene());
    else this.voice.cancel();
  }
  toggleCC() {
    this.captions.set(!this.captions());
    this.applyCaptions();
  }
}
