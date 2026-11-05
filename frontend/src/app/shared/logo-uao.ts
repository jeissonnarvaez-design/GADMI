import { Component, computed, input } from '@angular/core';

/** Logo UAO + línea vertical + «FACULTAD DE CIENCIAS EMPRESARIALES Y JURÍDICAS» (rediseño). */
@Component({
  selector: 'app-logo-uao',
  template: `
    <span style="display: inline-flex; align-items: center; gap: 12px; padding-right: 4px">
      <img src="/assets/logo-uao.png" alt="Universidad Autónoma de Occidente" [style.height.px]="s().img" style="width: auto">
      <span aria-hidden="true" [style.height.px]="s().line" style="width: 1.5px; background: #8A1428"></span>
      <span [style.font-size.px]="s().text" style="display: flex; flex-direction: column; font-weight: 800; line-height: 1.2; letter-spacing: 0.04em; color: #8A1428; text-align: left">
        <span>FACULTAD DE CIENCIAS</span><span>EMPRESARIALES Y JURÍDICAS</span>
      </span>
    </span>
  `,
  host: { style: 'display: inline-flex' },
})
export class LogoUao {
  /** sm = entrada y certificado · md = panel docente · lg = verificar. */
  size = input<'sm' | 'md' | 'lg'>('sm');
  s = computed(() => ({ sm: { img: 22, line: 28, text: 10 }, md: { img: 28, line: 32, text: 11 }, lg: { img: 30, line: 34, text: 11 } })[this.size()]);
}
