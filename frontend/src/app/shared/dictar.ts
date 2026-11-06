import { Component, NgZone, OnDestroy, inject, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService, apiError } from '../core/services/api.service';

type Modo = 'listo' | 'escuchando' | 'grabando' | 'transcribiendo';
const MAX_SEG = 60;

/**
 * Botón «Dictar con voz». Funciona en cualquier navegador moderno:
 * 1. Si el navegador trae reconocimiento de voz (Chrome, Edge, Safari), lo usa: el texto
 *    aparece mientras hablas. Se pulsa otra vez para terminar.
 * 2. Si no lo trae (Firefox, Brave…) o falla, graba el audio (máx. 1 minuto) y el servidor
 *    lo convierte en texto con Gemini.
 * Emite cada fragmento reconocido en (texto); la pantalla decide dónde agregarlo.
 */
@Component({
  selector: 'app-dictar',
  template: `
    <span style="display: inline-flex; align-items: center; gap: 10px; flex-wrap: wrap">
      <button type="button" (click)="toggle()" [disabled]="modo() === 'transcribiendo' || !soportado"
        [attr.aria-pressed]="activo() ? 'true' : 'false'"
        [title]="soportado ? '' : 'Tu navegador no permite usar el micrófono'"
        [style.background]="activo() ? '#AC0B32' : '#FFFFFF'" [style.color]="activo() ? '#FFFFFF' : '#231417'" [style.border]="'1px solid ' + (activo() ? '#AC0B32' : '#EADFD0')"
        style="min-height: 46px; padding: 0 16px; border-radius: 999px; display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit">
        <span [class.rec]="activo()" style="display: flex"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" [attr.stroke]="activo() ? '#FFFFFF' : '#231417'" stroke-width="2" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path></svg></span>
        {{ etiqueta() }}
      </button>
      <span role="status" aria-live="polite" style="font-size: 13px; font-weight: 600; color: #5C4A4D">{{ aviso() }}</span>
    </span>
  `,
  styles: `
    button:focus-visible{outline:3px solid #FF836C;outline-offset:2px}
    button:disabled{opacity:.6;cursor:wait}
    @keyframes rec{0%,100%{opacity:1}50%{opacity:.35}}
    .rec{animation:rec 1s ease-in-out infinite}
    @media (prefers-reduced-motion: reduce){.rec{animation:none}}
  `,
})
export class Dictar implements OnDestroy {
  texto = output<string>();
  private api = inject(ApiService);
  private zone = inject(NgZone);
  modo = signal<Modo>('listo');
  aviso = signal('');
  private seg = signal(0);

  private W = window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
  private SR = this.W.SpeechRecognition ?? this.W.webkitSpeechRecognition;
  private grabable = !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
  /** El reconocimiento del navegador falló por red/servicio: desde ahí se usa el servidor. */
  private usarServidor = !this.SR;
  readonly soportado = !!this.SR || this.grabable;

  private rec: any = null;
  private media: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  activo = () => this.modo() === 'escuchando' || this.modo() === 'grabando';
  etiqueta = () => {
    switch (this.modo()) {
      case 'escuchando': return 'Detener dictado';
      case 'grabando': return `Detener (${MAX_SEG - this.seg()} s)`;
      case 'transcribiendo': return 'Escribiendo tu voz…';
      default: return 'Dictar con voz';
    }
  };

  toggle() {
    const m = this.modo();
    if (m === 'escuchando') {
      const rec = this.rec;
      try { rec?.stop(); } catch { /* ya detenido */ }
      // Si el navegador no confirma el final, se libera el botón igual.
      setTimeout(() => {
        if (this.rec === rec && this.modo() === 'escuchando') {
          try { rec?.abort(); } catch { /* nada */ }
          this.rec = null;
          this.modo.set('listo');
          this.aviso.set('');
        }
      }, 1500);
    }
    else if (m === 'grabando') this.media?.stop();
    else if (m === 'listo') {
      this.aviso.set('');
      if (this.SR && !this.usarServidor) this.escuchar();
      else void this.grabar();
    }
  }

  // ---------- 1. Reconocimiento del navegador
  private escuchar() {
    let rec: any;
    try {
      rec = new this.SR!();
    } catch {
      this.usarServidor = true;
      void this.grabar();
      return;
    }
    this.rec = rec;
    rec.lang = 'es-CO';
    rec.continuous = true;
    rec.interimResults = false;
    let paso = false;
    let falla = '';
    rec.onresult = (e: any) => this.zone.run(() => {
      paso = true;
      for (let k = e.resultIndex; k < e.results.length; k++) {
        if (e.results[k].isFinal) {
          const t = String(e.results[k][0]?.transcript ?? '').trim();
          if (t) this.texto.emit(t);
        }
      }
    });
    rec.onerror = (e: any) => { falla = e?.error ?? 'error'; };
    // Si el servicio de voz del navegador no arranca en 4 s, se graba y transcribe en el servidor.
    let arranco = false;
    rec.onaudiostart = () => { arranco = true; };
    setTimeout(() => {
      if (this.rec === rec && !arranco && !paso) {
        falla = 'network';
        try { rec.abort(); } catch { /* nada */ }
        setTimeout(() => { if (this.rec === rec) rec.onend(); }, 600);
      }
    }, 4000);
    rec.onend = () => this.zone.run(() => {
      if (this.rec !== rec) return;
      this.rec = null;
      this.modo.set('listo');
      if (['network', 'service-not-allowed', 'language-not-supported', 'audio-capture'].includes(falla) && this.grabable) {
        // El servicio del navegador no está disponible: se graba y transcribe en el servidor.
        this.usarServidor = true;
        this.aviso.set('Probando otra forma de dictado…');
        void this.grabar();
      } else if (falla === 'not-allowed') {
        this.aviso.set('Permite el uso del micrófono (ícono del candado junto a la dirección) y vuelve a intentarlo.');
      } else if (!paso && falla === 'no-speech') {
        this.aviso.set('No te escuché. Pulsa de nuevo y habla cerca del micrófono.');
      }
    });
    try {
      rec.start();
      this.modo.set('escuchando');
      this.aviso.set('Habla ahora. Pulsa «Detener dictado» al terminar.');
    } catch {
      this.rec = null;
      this.usarServidor = true;
      void this.grabar();
    }
  }

  // ---------- 2. Grabación + transcripción en el servidor
  private async grabar() {
    if (!this.grabable) {
      this.aviso.set('Tu navegador no permite usar el micrófono.');
      return;
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (e) {
      const n = (e as DOMException)?.name;
      this.aviso.set(n === 'NotAllowedError' || n === 'SecurityError'
        ? 'Permite el uso del micrófono (ícono del candado junto a la dirección) y vuelve a intentarlo.'
        : 'No encontré un micrófono en este equipo.');
      return;
    }
    const tipo = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm'].find((t) => MediaRecorder.isTypeSupported?.(t)) ?? '';
    const media = new MediaRecorder(this.stream, { ...(tipo ? { mimeType: tipo } : {}), audioBitsPerSecond: 24000 });
    this.media = media;
    const partes: Blob[] = [];
    media.ondataavailable = (e) => e.data.size && partes.push(e.data);
    media.onstop = () => this.zone.run(() => {
      this.limpiarGrabacion();
      const blob = new Blob(partes, { type: media.mimeType || tipo || 'audio/webm' });
      if (blob.size < 1500) {
        this.modo.set('listo');
        this.aviso.set('La grabación quedó vacía. Pulsa de nuevo y habla.');
        return;
      }
      this.enviar(blob);
    });
    media.start(1000);
    this.seg.set(0);
    this.modo.set('grabando');
    this.aviso.set('Grabando… habla y pulsa «Detener» al terminar.');
    this.timer = setInterval(() => {
      this.seg.update((s) => s + 1);
      if (this.seg() >= MAX_SEG) media.state !== 'inactive' && media.stop();
    }, 1000);
  }

  private enviar(blob: Blob) {
    this.modo.set('transcribiendo');
    this.aviso.set('');
    const fr = new FileReader();
    fr.onload = () => this.zone.run(() => {
      const b64 = String(fr.result).split(',')[1] ?? '';
      this.api.transcribir(b64, blob.type).subscribe({
        next: (r) => {
          this.modo.set('listo');
          const t = (r?.texto ?? '').trim();
          if (t) this.texto.emit(t);
          this.aviso.set(t ? '' : 'No se entendió el audio. Intenta de nuevo, más despacio.');
        },
        error: (e: HttpErrorResponse) => {
          this.modo.set('listo');
          this.aviso.set(e.status === 0 ? 'Sin conexión: no se pudo convertir tu voz en texto.' : apiError(e).message);
        },
      });
    });
    fr.readAsDataURL(blob);
  }

  private limpiarGrabacion() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.media = null;
  }

  ngOnDestroy() {
    try { this.rec?.abort(); } catch { /* ya detenido */ }
    if (this.media && this.media.state !== 'inactive') {
      this.media.onstop = null;
      this.media.stop();
    }
    this.limpiarGrabacion();
  }
}
