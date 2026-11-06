import { Component, ElementRef, HostListener, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LogoUao } from '../../shared/logo-uao';
import { Personaje } from '../../shared/personaje';

const STEPS = ['Verificando tu cuenta', 'Cargando tu progreso', 'Preparando tu empresa'];

/** Conectando (Conectando.dc.html): carga mientras se identifica al estudiante. */
@Component({
  selector: 'app-conectando',
  imports: [RouterLink, Personaje, LogoUao],
  template: `
    <div style="min-height: 100vh; background: #8A1428; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; box-sizing: border-box; text-align: center; color: #FFFFFF; font-family: 'DM Sans', Arial, sans-serif">
      <img src="/assets/fondo-cacao.jpg" alt="" aria-hidden="true" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.22">
      <div aria-hidden="true" style="position: absolute; inset: 0; background: rgba(138,20,40,0.8)"></div>

      <div style="position: relative; display: flex; flex-direction: column; align-items: center; gap: 26px">
        <span style="background: #FFFFFF; border-radius: 999px; padding: 8px 16px; display: inline-flex"><app-logo-uao /></span>
        <div style="position: relative; width: 200px; height: 200px; display: flex; align-items: center; justify-content: center">
          <svg class="spin" width="200" height="200" viewBox="0 0 100 100" aria-hidden="true" style="position: absolute; inset: 0"><circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="3"></circle><path d="M50 4 a46 46 0 0 1 46 46" fill="none" stroke="#FBF5EC" stroke-width="3" stroke-linecap="round"></path></svg>
          <span class="sigue-mouse" style="display: flex"><app-personaje who="teo-casual" [size]="140" /></span>
        </div>
        <h1 style="margin: 0; font-size: 34px; font-weight: 800; letter-spacing: -0.02em; color: #FFFFFF">Conectando con Moodle…</h1>

        <ul aria-live="polite" style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; width: 340px; max-width: 100%; min-height: 150px; text-align: left">
          @for (s of steps(); track s.label) {
            <li class="slide" style="display: flex; align-items: center; gap: 14px; padding: 10px 14px; border-radius: 14px; background: rgba(0,0,0,0.22); font-size: 17px; font-weight: 600">
              @if (s.loading) {
                <svg class="spin" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"></circle><path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"></path></svg>
              }
              @if (s.done) {
                <span class="check" style="width: 24px; height: 24px; border-radius: 999px; background: #FFFFFF; display: flex; align-items: center; justify-content: center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A1428" stroke-width="3.6" aria-hidden="true"><path d="M5 12l5 5 9-10"></path></svg></span>
              }
              <span>{{ s.label }}</span>
            </li>
          }
        </ul>

        <div style="min-height: 54px">
          @if (ready() && name()) {
            <button type="button" class="pop" (click)="continuar()" style="display: inline-flex; align-items: center; min-height: 54px; padding: 0 30px; border-radius: 999px; background: #FFFFFF; color: #8A1428; font-weight: 800; font-size: 18px; border: none; cursor: pointer; font-family: inherit">Hola, {{ name() }}. Continuar</button>
          }
        </div>
        <a routerLink="/ingreso" style="font-size: 14px; color: #FFD3C9">¿No te reconoce? Ingresa con tu correo</a>
      </div>
    </div>
  `,
  styles: `
    a{color:#FFFFFF} a:focus-visible,button:focus-visible{outline:3px solid #FFFFFF;outline-offset:3px}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes slide{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
    @keyframes check{0%{transform:scale(0)}70%{transform:scale(1.25)}100%{transform:scale(1)}}
    @keyframes pop{0%{opacity:0;transform:scale(.6)}100%{opacity:1;transform:scale(1)}}
    .spin{animation:spin 1.1s linear infinite;transform-origin:center}
    .slide{animation:slide .45s cubic-bezier(.2,.7,.2,1) both}
    .check{animation:check .35s cubic-bezier(.2,.7,.2,1) both}
    .pop{animation:pop .4s cubic-bezier(.2,.7,.2,1) both}
    @media (prefers-reduced-motion: reduce){.spin,.slide,.check,.pop{animation:none}}
  `,
})
export class ConectandoPage implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private el = inject(ElementRef<HTMLElement>);
  private base = new WeakMap<SVGGraphicsElement, { ojo: SVGGraphicsElement; ox: number; oy: number; radio: number }>();

  /** Las pupilas (capa propia dentro de cada ojo blanco) siguen al mouse sin salirse del ojo. */
  @HostListener('document:mousemove', ['$event'])
  seguirMouse(e: MouseEvent) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('menos-movimiento')) return;
    const root = this.el.nativeElement.querySelector('.sigue-mouse') as HTMLElement | null;
    if (!root) return;
    const ojos = Array.from(root.querySelectorAll('.pj-ojo:not(.pj-pupila)')) as SVGGraphicsElement[];
    for (const p of Array.from(root.querySelectorAll('.pj-pupila')) as SVGGraphicsElement[]) {
      // Posición de reposo de la pupila respecto a su ojo (se mide una sola vez, sin desplazamiento)
      let base = this.base.get(p);
      if (!base) {
        p.style.transform = '';
        const pr0 = p.getBoundingClientRect();
        const c0 = { x: pr0.left + pr0.width / 2, y: pr0.top + pr0.height / 2 };
        const ojo0 = ojos.map((o) => ({ o, r: o.getBoundingClientRect() })).sort((a, b) => Math.hypot(a.r.left + a.r.width / 2 - c0.x, a.r.top + a.r.height / 2 - c0.y) - Math.hypot(b.r.left + b.r.width / 2 - c0.x, b.r.top + b.r.height / 2 - c0.y))[0];
        if (!ojo0 || !pr0.width) continue;
        base = { ojo: ojo0.o, ox: c0.x - (ojo0.r.left + ojo0.r.width / 2), oy: c0.y - (ojo0.r.top + ojo0.r.height / 2), radio: Math.max(pr0.width, pr0.height) / 2 };
        this.base.set(p, base);
      }
      const ojo = base.ojo.getBoundingClientRect();
      const oc = { x: ojo.left + ojo.width / 2, y: ojo.top + ojo.height / 2 };
      const pc = { x: oc.x + base.ox, y: oc.y + base.oy };
      const max = Math.max(0, Math.min(ojo.width, ojo.height) / 2 - base.radio - 1);
      const dx = e.clientX - oc.x, dy = e.clientY - oc.y, d = Math.hypot(dx, dy) || 1;
      const k = Math.min(max, d / 6) / d;
      // de píxeles de pantalla a unidades del SVG de la pupila
      const m = p.getScreenCTM();
      const esc = m ? Math.hypot(m.a, m.b) : 1;
      const tx = (oc.x + dx * k - pc.x) / esc, ty = (oc.y + dy * k - pc.y) / esc;
      p.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
    }
  }
  private router = inject(Router);
  k = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;
  name = computed(() => this.auth.student()?.nombre.split(' ')[0] ?? '');
  ready = computed(() => this.k() >= 3);
  steps = computed(() => STEPS.slice(0, Math.min(this.k() + 1, 3)).map((label, i) => ({ label, loading: i === this.k(), done: i < this.k() })));

  ngOnInit() {
    this.timer = setInterval(() => (this.k() < 3 ? this.k.update((v) => v + 1) : this.timer && clearInterval(this.timer)), 1300);
  }
  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  /** Primera vez → privacidad; si ya empezó → «Continuar donde quedaste» (Ruta). */
  continuar() {
    const s = this.auth.student();
    if (!s) return;
    this.router.navigate([!s.aceptaPrivacidad ? '/primera-vez' : s.cartaFirmada ? '/ruta' : '/bienvenida']);
  }
}
