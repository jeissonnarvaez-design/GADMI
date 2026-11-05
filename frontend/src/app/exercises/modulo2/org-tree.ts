import { Component, computed, input } from '@angular/core';
import { OrgAnswers, PORTFOLIO } from './organigrama.data';

/** Nodo recursivo de la vista previa del organigrama. */
@Component({
  selector: 'app-org-node',
  imports: [],
  template: `
    <div class="node" [class.advice]="org()[nodeId()].line === 'asesoria' && depth() > 0" [class.distractor]="isDistractor()">
      <span>{{ label() }}</span>
      @if (org()[nodeId()].line === 'asesoria' && depth() > 0) { <em class="small">(asesoría)</em> }
    </div>
    @if (children().length) {
      <ul>
        @for (c of children(); track c) {
          <li [class.li-advice]="org()[c].line === 'asesoria'"><app-org-node [nodeId]="c" [org]="org()" [depth]="depth() + 1" [visited]="nextVisited()" /></li>
        }
      </ul>
    }
  `,
  styles: `
    :host { display: block; }
    .node { display: inline-flex; gap: .3rem; align-items: baseline; background: #fff; border: 2px solid var(--vino); border-radius: 8px; padding: .3rem .6rem; font-size: .9rem; font-weight: 600; }
    .node.advice { border-style: dashed; border-color: var(--teal); }
    .node.distractor { border-color: #8a6100; background: var(--ambar-claro); }
    ul { list-style: none; margin: .3rem 0 0 .9rem; padding-left: .9rem; border-left: 2px solid var(--vino); }
    li { margin: .35rem 0; position: relative; }
    li::before { content: ''; position: absolute; left: -.9rem; top: 1rem; width: .8rem; border-top: 2px solid var(--vino); }
    li.li-advice::before { border-top-style: dashed; border-color: var(--teal); }
  `,
})
export class OrgNode {
  nodeId = input.required<string>();
  org = input.required<OrgAnswers>();
  depth = input(0);
  visited = input<string[]>([]);
  label = computed(() => PORTFOLIO.find((b) => b.id === this.nodeId())?.label ?? this.nodeId());
  isDistractor = computed(() => !!PORTFOLIO.find((b) => b.id === this.nodeId())?.distractor);
  nextVisited = computed(() => [...this.visited(), this.nodeId()]);
  children = computed(() =>
    PORTFOLIO.filter(
      (b) => this.org()[b.id].included && this.org()[b.id].parent === this.nodeId() && !this.nextVisited().includes(b.id),
    ).map((b) => b.id),
  );
}

/** Vista previa del lienzo: raíces y cajas sin conexión válida. */
@Component({
  selector: 'app-org-tree',
  imports: [OrgNode],
  template: `
    <div class="tree" role="group" aria-label="Vista previa del organigrama">
      @for (r of roots(); track r) {
        <app-org-node [nodeId]="r" [org]="org()" />
      } @empty {
        <p class="muted small">Incluye cajas del portafolio para ver aquí tu organigrama.</p>
      }
      @if (orphans().length) {
        <p class="small orph">Cajas en un ciclo (se reportan entre sí): {{ orphans().join(', ') }}</p>
      }
      <p class="small muted legend">Línea continua = mando · Línea punteada = asesoría</p>
    </div>
  `,
  styles: `.tree { display: flex; flex-direction: column; gap: .8rem; } .orph { color: var(--bordo); } .legend { margin-top: .5rem; }`,
})
export class OrgTree {
  org = input.required<OrgAnswers>();
  roots = computed(() => {
    const o = this.org();
    return PORTFOLIO.filter((b) => o[b.id].included && (!o[b.id].parent || !o[o[b.id].parent]?.included)).map((b) => b.id);
  });
  orphans = computed(() => {
    const o = this.org();
    const reached = new Set<string>();
    const walk = (id: string) => {
      if (reached.has(id)) return;
      reached.add(id);
      PORTFOLIO.filter((b) => o[b.id].included && o[b.id].parent === id).forEach((b) => walk(b.id));
    };
    this.roots().forEach(walk);
    return PORTFOLIO.filter((b) => o[b.id].included && !reached.has(b.id)).map((b) => b.label);
  });
}
