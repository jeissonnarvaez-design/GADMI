/**
 * Créditos y licencia (página /creditos, enlazada desde el pie de página).
 * COMPLETAR: nombres del equipo y origen exacto de la fotografía de fondo antes de la entrega.
 */
export const CREDITOS = {
  proyecto: 'GADMI Sost-Empresarial · Gestión Organizacional Sostenible',
  institucion: 'Universidad Autónoma de Occidente (UAO) · Facultad de Ciencias Empresariales y Jurídicas',
  equipo: [
    { rol: 'Autora del contenido académico', nombres: ['Profa. Ana Judith Paredes Chacín'] },
    { rol: 'Diseño, multimedia y desarrollo', nombres: ['Equipo GADMI Sost-Empresarial (completar nombres en core/data/creditos.ts)'] },
  ],
  fuentes: [
    { nombre: 'DM Sans', origen: 'Google Fonts', licencia: 'SIL Open Font License 1.1 (OFL)' },
    { nombre: 'Baloo 2', origen: 'Google Fonts', licencia: 'SIL Open Font License 1.1 (OFL)' },
  ],
  imagenes: [
    'Personajes (Teo, Nibi, Chispa, Laura, Andrés y Klaus), mapa de la Ruta e ilustraciones: creados por el equipo del proyecto.',
    'Fotografía de fondo de cacao: aportada por el equipo en el prototipo de diseño (confirmar autor y licencia).',
    'Logo de la Universidad Autónoma de Occidente: marca institucional, usada con fines académicos (no la cubre la licencia CC).',
    'Íconos: dibujados en SVG para el aplicativo.',
  ],
  software: 'Angular, Express, Firebase, jsPDF y qrcode, cada uno con su propia licencia de código abierto.',
  licencia: {
    nombre: 'Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0)',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es',
    resumen: 'Puedes compartir y adaptar esta obra si das el crédito correspondiente, no la usas con fines comerciales y compartes tus adaptaciones con la misma licencia.',
  },
};
