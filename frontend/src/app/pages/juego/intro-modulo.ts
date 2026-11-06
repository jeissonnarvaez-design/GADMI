import { effect, Component, ElementRef, Injector, afterNextRender, computed, inject, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getModule } from '../../core/data/modules';
import { PreferencesService } from '../../core/services/preferences.service';
import { ProgressService } from '../../core/services/progress.service';
import { RETOS_JSON } from '../../retos/registry';
import { Hud } from '../../shared/hud';
import { Who } from '../../shared/personaje';

/** Transcripción del video de cada módulo (el del módulo 1 viene del diseño; los demás, del encargo). */
const TRANSCRIPCION: Record<number, string> = {
  1: 'Teo: Gerente, la junta quiere saber hacia dónde vamos. En este módulo vas a definir la misión y la visión, elegir valores reales, leer el entorno con un FODA y ponerle metas medibles a cada objetivo. ¡Empecemos!',
};
const SEEN_KEY = 'gadmi-sost-empresarial:video-modulo-visto:';
/**
 * Video de cada módulo en public/assets/video/ (se prueba en orden; el primero que exista se usa).
 * Subtítulos: modulo-N.vtt (de ahí sale también la transcripción).
 */
const VIDEOS: Record<number, string[]> = {
  1: ['YouCut_20261106_001829818.mp4', 'modulo-1.mp4'],
  2: ['modulo-2.mp4'],
  3: ['modulo-3.mp4'],
  4: ['modulo-4.mp4'],
};

/**
 * Intro de módulo (IntroModulo.dc.html, rediseño): encargo, retos del año y video en «modo cine».
 * Video: ver VIDEOS (módulo 1: YouCut_20261106_001829818.mp4) con subtítulos modulo-N.vtt; la
 * transcripción se arma con el mismo .vtt. «COMENZAR» aparece después de ver el video.
 */
@Component({
  selector: 'app-intro-modulo',
  imports: [RouterLink, Hud],
  template: `
    @if (module(); as m) {
      <div class="game-bg" style="color: #FFFFFF">
        <app-hud [kicker]="m.intro.scene.toUpperCase()" [title]="'Módulo ' + m.id + ' · ' + m.phase" variant="modulo" />
        <main style="flex: 1; width: 100%; max-width: 1180px; margin: 0 auto; padding: 0 32px 40px; box-sizing: border-box; display: flex; flex-wrap: wrap; align-items: center; align-content: center; gap: 40px">
          <section style="flex: 0 1 380px; min-width: 0; display: flex; flex-direction: column; gap: 16px">
            @if (!open()) {
              <span class="up px" style="align-self: flex-start; font-size: 11px; padding: 8px 10px; background: #6E5458; color: #FFFFFF">BLOQUEADO · {{ m.year }}</span>
              <h1 class="up d1" style="margin: 0; font-size: 58px; line-height: 0.95; font-weight: 800; letter-spacing: -0.04em">{{ m.phase.split(' ')[0] }}</h1>
              <p class="up d2" style="margin: 0; font-size: 19px; color: #E9DCCF">Se abre al terminar el módulo {{ m.id - 1 }}.</p>
            } @else {
              <span class="up px" style="align-self: flex-start; font-size: 11px; padding: 8px 10px; background: #FF836C; color: #1A0609">NUEVA MISIÓN · {{ m.year }}</span>
              <h1 class="up d1" style="margin: 0; font-size: 58px; line-height: 0.95; font-weight: 800; letter-spacing: -0.04em; hyphens: manual">{{ m.id === 1 ? 'Planea­ción' : m.phase.split(' ')[0] }}</h1>
              <p class="up d2" style="margin: 0; font-size: 19px; color: #E9DCCF">{{ m.intro.goal }}</p>
              <ol class="up d3" style="list-style: none; margin: 6px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; max-width: 380px">
                @for (r of retos(); track r.code) {
                  <li><a [routerLink]="'/reto/' + r.code" style="display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 4px; border: 2px solid rgba(255,131,108,0.5); font-size: 15px; font-weight: 700; background-color: #FFFFFF; color: #5A2230; text-decoration: none; height: 100%; box-sizing: border-box"><span class="px" style="font-size: 10px; color: #AC0B32">{{ r.code }}</span>{{ r.title }}@if (r.done) { <span aria-label="hecho" style="margin-left: auto; color: #2C5E31">✓</span> }</a></li>
                }
              </ol>
              <div class="up d4" style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; min-height: 58px">
                @if (seen()) {
                  <a class="gbtn glow" [routerLink]="cta().link" style="display: inline-flex; align-items: center; gap: 10px; min-height: 58px; padding: 0 30px; background: #FF836C; color: #1A0609; text-decoration: none"><span class="px" style="font-size: 13px">▶ {{ cta().label }}</span></a>
                } @else {
                  <span style="align-self: center; font-size: 15px; color: #FFD3C9">Mira el video para empezar.</span>
                }
              </div>
            }
          </section>

          <section aria-label="Video del módulo" style="flex: 1 1 640px; min-width: 0; display: flex; flex-direction: column; gap: 12px">
            <div class="up d5 gpanel" style="position: relative; aspect-ratio: 16 / 9; background: radial-gradient(ellipse at 50% 30%, #4A1520, #1A0609 75%); overflow: hidden; display: flex; align-items: center; justify-content: center">
              <button type="button" class="gbtn glow play" (click)="play()" [attr.aria-label]="'Reproducir video del módulo ' + m.id" style="width: 108px; height: 108px; border-radius: 999px !important; border: none; background: #FF836C; cursor: pointer; display: flex; align-items: center; justify-content: center"><svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="#1A0609"></path></svg></button>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; color: #FBF5EC">
              <span style="flex: 1; height: 6px; border-radius: 999px; background: #4A2A2F; overflow: hidden"><span [style.width]="seen() ? '100%' : '0%'" style="display: block; height: 100%; background: #FF836C"></span></span>
              <button type="button" (click)="toggleCc()" [attr.aria-pressed]="cc() ? 'true' : 'false'" aria-label="Subtítulos" [style.background]="cc() ? '#FF836C' : 'transparent'" [style.color]="cc() ? '#1A0609' : '#FBF5EC'" style="min-height: 36px; padding: 0 12px; border-radius: 6px; border: 2px solid #FF836C; font-weight: 800; font-size: 13px; cursor: pointer">CC</button>
              <button type="button" (click)="tr.set(!tr())" [attr.aria-expanded]="tr() ? 'true' : 'false'" style="min-height: 36px; padding: 0 12px; border-radius: 6px; border: 2px solid #FF836C; background: transparent; color: #FBF5EC; font-weight: 800; font-size: 13px; cursor: pointer">Transcripción</button>
            </div>
            @if (tr() && !playing()) {
              <section class="up" aria-label="Transcripción del video" style="margin: 0; padding: 12px 14px; border-radius: 6px; background: #2A0B12; color: #E9DCCF; font-size: 14px; line-height: 1.5; display: flex; flex-direction: column; gap: 4px">
                @if (lineasVtt().length) {
                  @for (l of lineasVtt(); track $index) { <span>@if (l[0]) {<strong style="color: #FBF5EC">{{ l[0] }}:&nbsp;</strong>}{{ l[1] }}</span> }
                } @else { <span>{{ transcript() }}</span> }
              </section>
            }
          </section>
        </main>
      </div>

      <!-- Modo cine: al dar play el video crece a pantalla completa y el fondo se oscurece -->
      @if (playing()) {
        <div role="dialog" aria-modal="true" [attr.aria-label]="'Video del módulo ' + m.id" class="cine" (keydown.escape)="close()">
          <div style="position: relative; width: min(92vw, 150vh); aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: radial-gradient(ellipse at 50% 30%, #7A3242, #2A0B12 75%); box-shadow: 0 30px 80px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center">
            <video #vid [hidden]="!hasVideo()" playsinline autoplay preload="auto"
              (loadedmetadata)="onReady()" (ended)="markSeen()" (timeupdate)="onTime()"
              style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; background: #1A0609">
              @for (f of fuentes(); track f; let last = $last) {
                <source [src]="'/assets/video/' + f" (error)="last && hasVideo.set(false)">
              }
              <track kind="captions" [src]="'/assets/video/modulo-' + m.id + '.vtt'" srclang="es" label="Español" default (load)="leerVtt()">
            </video>
            @if (!hasVideo()) {
              <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; padding: 20px">
                <span class="px" style="font-size: 14px; color: #FFD3C9">▶ VIDEO · MÓDULO {{ m.id }}</span>
                <span style="font-size: 15px; color: #E9DCCF">El video de este módulo está en producción. Mientras tanto, lee la transcripción.</span>
              </div>
              @if (cc()) { <span style="position: absolute; left: 50%; bottom: 28px; transform: translateX(-50%); max-width: 80%; padding: 8px 16px; border-radius: 6px; background: rgba(0,0,0,0.8); color: #FFFFFF; font-size: 22px; text-align: center">{{ ccLine() }}</span> }
            }
          </div>
          <div style="width: min(92vw, 150vh); display: flex; align-items: center; gap: 12px; color: #FBF5EC; flex-wrap: wrap">
            <span style="flex: 1 1 160px; height: 8px; border-radius: 999px; background: #4A2A2F; overflow: hidden"><span [style.width]="prog() + '%'" style="display: block; height: 100%; background: #FF836C"></span></span>
            <button type="button" (click)="toggleCc()" [attr.aria-pressed]="cc() ? 'true' : 'false'" aria-label="Subtítulos" [style.background]="cc() ? '#FF836C' : 'transparent'" [style.color]="cc() ? '#1A0609' : '#FBF5EC'" style="min-height: 40px; padding: 0 14px; border-radius: 6px; border: 2px solid #FF836C; font-weight: 800; font-size: 14px; cursor: pointer">CC</button>
            <button type="button" (click)="tr.set(!tr())" [attr.aria-expanded]="tr() ? 'true' : 'false'" style="min-height: 40px; padding: 0 14px; border-radius: 6px; border: 2px solid #FF836C; background: transparent; color: #FBF5EC; font-weight: 800; font-size: 14px; cursor: pointer">Transcripción</button>
            <button type="button" (click)="close()" aria-label="Cerrar video" class="cerrar" style="min-height: 40px; padding: 0 16px; border-radius: 6px; border: none; background: #FFFFFF; color: #8A1428; font-weight: 800; font-size: 14px; cursor: pointer">✕ Cerrar</button>
          </div>
          @if (tr()) {
            <section aria-label="Transcripción del video" style="margin: 0; width: min(92vw, 150vh); box-sizing: border-box; padding: 12px 16px; border-radius: 8px; background: #2A0B12; color: #E9DCCF; font-size: 15px; line-height: 1.5; display: flex; flex-direction: column; gap: 4px">
              @if (lineasVtt().length) {
                @for (l of lineasVtt(); track $index) { <span>@if (l[0]) {<strong style="color: #FBF5EC">{{ l[0] }}:&nbsp;</strong>}{{ l[1] }}</span> }
              } @else { <span>{{ transcript() }}</span> }
            </section>
          }
        </div>
      }
    }
  `,
  styles: `
    a{color:#FFFFFF} a:focus-visible,button:focus-visible{outline:3px solid #FF836C;outline-offset:3px} button{font-family:inherit}
    @keyframes up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
    .up{animation:up .7s cubic-bezier(.2,.7,.2,1) both}
    .d1{animation-delay:.3s}.d2{animation-delay:.6s}.d3{animation-delay:.9s}.d4{animation-delay:1.2s}.d5{animation-delay:1.5s}
    video::cue{background:rgba(20,10,12,.9);color:#FFFFFF;font-family:'DM Sans',Arial,sans-serif;font-size:22px;line-height:1.4}
    .cine{position:fixed;inset:0;z-index:50;background:rgba(26,6,9,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;box-sizing:border-box;overflow:auto;animation:up .35s cubic-bezier(.2,.7,.2,1) both}
    @media (prefers-reduced-motion: reduce){.up,.cine{animation:none}}
  `,
})
export class IntroModuloPage {
  id = input.required<string>();
  private progress = inject(ProgressService);
  private prefs = inject(PreferencesService);
  private injector = inject(Injector);
  private host = inject(ElementRef);
  private vid = viewChild<ElementRef<HTMLVideoElement>>('vid');
  module = computed(() => getModule(Number(this.id())));
  open = computed(() => (this.progress.moduleStats(), this.progress.isModuleOpen(Number(this.id()))));
  who = computed(() => (this.module()?.intro.character.toLowerCase() ?? 'teo') as Who);
  retos = computed(() => {
    this.progress.moduleStats();
    return (this.module()?.exercises ?? []).map((e) => ({ code: e.code, title: RETOS_JSON[e.code]?.title ?? e.title, done: this.progress.isCompleted(e.id) }));
  });
  cta = computed(() => {
    const m = this.module()!;
    const next = m.exercises.find((e) => !this.progress.isCompleted(e.id));
    if (next) return { link: '/reto/' + next.code, label: this.retos().some((r) => r.done) ? 'CONTINUAR' : 'COMENZAR' };
    if (!this.progress.seasonDone(m.id)) return { link: '/bitacora/' + m.id, label: 'BITÁCORA Y CIERRE' };
    return { link: '/temporada/' + m.id, label: 'VER TEMPORADA' };
  });

  // ---------- Video en modo cine
  playing = signal(false);
  hasVideo = signal(true);
  cc = signal(this.prefs.prefs().subtitulos);
  tr = signal(false);
  prog = signal(0);
  private visto = signal(false);
  /** Ya vio el video (o ya empezó los retos de este módulo). */
  seen = computed(() => this.visto() || this.retos().some((r) => r.done) || this.readSeen());
  transcript = computed(() => {
    const m = this.module()!;
    return TRANSCRIPCION[m.id] ?? `${m.intro.character}: ${m.intro.text} ${m.intro.goal}`;
  });
  fuentes = computed(() => VIDEOS[this.module()!.id] ?? ['modulo-' + this.module()!.id + '.mp4']);
  /** Transcripción leída del .vtt (quién: texto). Si no hay .vtt, se usa el texto del módulo. */
  lineasVtt = signal<[string, string][]>([]);
  private vttCargado = effect(() => {
    const id = this.module()?.id;
    if (!id) return;
    fetch('/assets/video/modulo-' + id + '.vtt', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.text() : ''))
      .then((t) => {
        if (!t.startsWith('WEBVTT')) return;
        const out: [string, string][] = [];
        for (const bloque of t.split(/\r?\n\r?\n/)) {
          const lineas = bloque.split(/\r?\n/);
          const k = lineas.findIndex((l) => l.includes('-->'));
          if (k < 0) continue;
          const txt = lineas.slice(k + 1).join(' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
          if (!txt) continue;
          const m = txt.match(/^([A-ZÁÉÍÓÚÑ][\wáéíóúñ]{1,15}):\s*(.+)$/);
          out.push(m ? [m[1], m[2]] : ['', txt]);
        }
        if (out.length) this.lineasVtt.set(out);
      })
      .catch(() => {});
  });
  leerVtt() {
    const cues = this.vid()?.nativeElement.textTracks?.[0]?.cues;
    if (!cues?.length) return;
    const out: [string, string][] = [];
    for (const c of Array.from(cues) as VTTCue[]) {
      const t = String(c.text ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (!t) continue;
      const m = t.match(/^([A-ZÁÉÍÓÚÑ][\wáéíóúñ]{1,15}):\s*(.+)$/);
      out.push(m ? [m[1], m[2]] : ['', t]);
    }
    this.lineasVtt.set(out);
  }
  ccLine = computed(() => this.transcript().replace(/^[^:]+:\s*/, '').split(/(?<=[.!?])\s/)[0]);

  play() {
    this.hasVideo.set(true);
    this.playing.set(true);
    this.prog.set(0);
    afterNextRender(() => this.host.nativeElement.querySelector('.cerrar')?.focus(), { injector: this.injector });
  }
  close() {
    this.vid()?.nativeElement.pause();
    this.playing.set(false);
    // Sin video todavía: abrir el reproductor cuenta como visto (el contenido está en la transcripción).
    if (!this.hasVideo()) this.markSeen();
  }
  onReady() {
    const track = this.vid()?.nativeElement.textTracks?.[0];
    if (track) track.mode = this.cc() ? 'showing' : 'hidden';
    this.leerVtt();
  }
  onTime() {
    const v = this.vid()?.nativeElement;
    if (!v || !v.duration) return;
    this.prog.set(Math.round((v.currentTime / v.duration) * 100));
    if (v.currentTime / v.duration > 0.9) this.markSeen();
  }
  toggleCc() {
    this.cc.set(!this.cc());
    this.onReady();
  }
  markSeen() {
    this.visto.set(true);
    try {
      localStorage.setItem(SEEN_KEY + this.id(), '1');
    } catch {
      /* sin almacenamiento local */
    }
  }
  private readSeen() {
    try {
      return localStorage.getItem(SEEN_KEY + this.id()) === '1';
    } catch {
      return false;
    }
  }
}
