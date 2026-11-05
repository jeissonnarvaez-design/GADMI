/** Contenido del ejercicio 2.1 · Lienzo del organigrama. */
export interface OrgBox {
  id: string;
  label: string;
  distractor?: boolean;
}

export const PORTFOLIO: OrgBox[] = [
  { id: 'asamblea', label: 'Asamblea de accionistas' },
  { id: 'junta', label: 'Junta directiva' },
  { id: 'gerente', label: 'Gerencia general' },
  { id: 'comite', label: 'Comité de sostenibilidad' },
  { id: 'revisoria', label: 'Revisoría fiscal' },
  { id: 'produccion', label: 'Producción' },
  { id: 'comercial', label: 'Comercial' },
  { id: 'admin', label: 'Administrativa y financiera' },
  { id: 'talento', label: 'Talento humano' },
  { id: 'abastecimiento', label: 'Abastecimiento sostenible' },
  { id: 'vp-innovacion', label: 'Vicepresidencia de Innovación Global', distractor: true },
  { id: 'sub-redes', label: 'Subgerencia de Redes Sociales', distractor: true },
  { id: 'depto-sost', label: 'Departamento de Sostenibilidad con cinco subdirecciones', distractor: true },
];

export const LINE_AREAS = ['produccion', 'comercial', 'admin', 'talento', 'abastecimiento'];

export type LineType = 'mando' | 'asesoria';

export interface OrgNodeState {
  included: boolean;
  parent: string;
  line: LineType;
}

export type OrgAnswers = Record<string, OrgNodeState>;

export const RULES = [
  { n: 1, text: 'Asamblea y junta directiva están por encima de la gerencia general.', message: 'El gobierno de la empresa (quién elige y supervisa a la gerencia) va arriba.' },
  { n: 2, text: 'Hay una sola gerencia general.', message: 'Dos jefes en la cima diluyen la responsabilidad.' },
  { n: 3, text: 'El comité de sostenibilidad está unido a la gerencia por línea punteada (asesoría).', message: 'El comité asesora y coordina; no da órdenes a las áreas.' },
  { n: 4, text: 'La revisoría fiscal reporta a la asamblea, no a la gerencia.', message: 'Quien controla no puede depender de quien es controlado.' },
  { n: 5, text: 'Las cinco áreas de línea dependen de la gerencia general.', message: 'Producción, comercial, administrativa, talento humano y abastecimiento ejecutan la operación.' },
  { n: 6, text: 'El abastecimiento sostenible existe como área propia.', message: 'En esta empresa la relación con 120 familias es estratégica.' },
  { n: 7, text: 'No hay más de tres niveles bajo la gerencia y no se usan cajas distractoras.', message: 'Para 48 personas, una estructura alta y con cargos de más encarece y vuelve lenta la empresa.' },
];

export const PTS_RULE = 10; // 7 × 10 = 70

export function emptyOrg(): OrgAnswers {
  return Object.fromEntries(PORTFOLIO.map((b) => [b.id, { included: false, parent: '', line: 'mando' as LineType }]));
}

/** Cadena de jefes (padres) de un nodo; se detiene ante ciclos. */
export function ancestors(org: OrgAnswers, id: string): string[] {
  const out: string[] = [];
  let cur = org[id]?.parent;
  while (cur && org[cur]?.included && !out.includes(cur) && cur !== id) {
    out.push(cur);
    cur = org[cur].parent;
  }
  return out;
}

export function evaluateRules(org: OrgAnswers): boolean[] {
  const inc = (id: string) => !!org[id]?.included;
  const p = (id: string) => (inc(id) ? org[id].parent : '');
  const roots = PORTFOLIO.filter((b) => inc(b.id) && (!p(b.id) || !inc(p(b.id))));

  const r1 = inc('asamblea') && inc('junta') && inc('gerente') && p('junta') === 'asamblea' && ancestors(org, 'gerente').includes('junta');
  const underJuntaMando = PORTFOLIO.filter((b) => inc(b.id) && p(b.id) === 'junta' && org[b.id].line === 'mando');
  const r2 = inc('gerente') && roots.length === 1 && underJuntaMando.length === 1 && underJuntaMando[0].id === 'gerente';
  const r3 = inc('comite') && p('comite') === 'gerente' && org['comite'].line === 'asesoria';
  const r4 = inc('revisoria') && p('revisoria') === 'asamblea';
  const r5 = LINE_AREAS.every((a) => inc(a) && p(a) === 'gerente' && org[a].line === 'mando');
  const r6 = inc('abastecimiento');
  const depthUnderGerente = Math.max(
    0,
    ...PORTFOLIO.filter((b) => inc(b.id)).map((b) => {
      const anc = ancestors(org, b.id);
      const i = anc.indexOf('gerente');
      return i === -1 ? 0 : i + 1;
    }),
  );
  const r7 = inc('gerente') && depthUnderGerente <= 3 && PORTFOLIO.every((b) => !b.distractor || !inc(b.id));
  return [r1, r2, r3, r4, r5, r6, r7];
}
