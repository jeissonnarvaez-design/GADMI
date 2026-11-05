/** Reporte de sostenibilidad de CACAO Raíz S.A.S. al cierre de 2027 (ejercicios 4.2 y 4.3). */
export type Light = 'rojo' | 'amarillo' | 'verde';

export interface Topic {
  id: string;
  name: string;
  result: string;
  goal: string;
  light: Light;
  bottleneck: boolean;
  strategies: { id: string; text: string; correct: boolean }[];
}

export const TOPICS: Topic[] = [
  {
    id: 'energia', name: 'Energía por tonelada', result: '505 kWh/t', goal: '416 kWh/t (−20 %)', light: 'rojo', bottleneck: true,
    strategies: [
      { id: 'e1', text: 'Pedir al personal que apague las luces al salir.', correct: false },
      { id: 'e2', text: 'Medir el consumo por máquina y priorizar el cambio de la tostadora con mayor gasto.', correct: true },
      { id: 'e3', text: 'Publicar en redes que la empresa ahorra energía.', correct: false },
    ],
  },
  {
    id: 'residuos', name: 'Residuos aprovechados', result: '44 %', goal: '70 %', light: 'rojo', bottleneck: true,
    strategies: [
      { id: 'r1', text: 'Convertir la cascarilla en compost o en producto (infusión o abono) con un aliado local.', correct: true },
      { id: 'r2', text: 'Contratar más frecuencias de recolección de basura.', correct: false },
      { id: 'r3', text: 'Hacer una campaña de concienciación sobre reciclaje sin cambiar el proceso.', correct: false },
    ],
  },
  {
    id: 'accidentalidad', name: 'Accidentalidad', result: '5,8 por cada 100', goal: '≤ 3', light: 'rojo', bottleneck: true,
    strategies: [
      { id: 'a1', text: 'Hacer una campaña de concienciación, sin análisis de causas.', correct: false },
      { id: 'a2', text: 'Sancionar a quienes sufran accidentes.', correct: false },
      { id: 'a3', text: 'Investigar cada accidente con el comité de seguridad y salud en el trabajo y atacar las tres causas más frecuentes.', correct: true },
    ],
  },
  {
    id: 'ventas', name: 'Ventas nacionales', result: '+12 %', goal: '+15 %', light: 'amarillo', bottleneck: false,
    strategies: [
      { id: 'v1', text: 'Reforzar la fuerza de ventas en Cali y Bogotá.', correct: false },
      { id: 'v2', text: 'Bajar precios para vender más.', correct: false },
      { id: 'v3', text: 'Abrir una tienda en línea.', correct: false },
    ],
  },
  {
    id: 'rotacion', name: 'Rotación', result: '19 %', goal: '≤ 15 %', light: 'amarillo', bottleneck: false,
    strategies: [
      { id: 'o1', text: 'Hacer entrevistas de salida y ajustar el plan de bienestar.', correct: false },
      { id: 'o2', text: 'Subir todos los salarios por igual.', correct: false },
      { id: 'o3', text: 'Contratar por temporadas.', correct: false },
    ],
  },
  {
    id: 'familias', name: 'Familias capacitadas', result: '95 %', goal: '100 %', light: 'verde', bottleneck: false,
    strategies: [
      { id: 'f1', text: 'Completar la capacitación de las familias faltantes.', correct: false },
      { id: 'f2', text: 'Suspender la capacitación.', correct: false },
      { id: 'f3', text: 'Cambiar de proveedores.', correct: false },
    ],
  },
  {
    id: 'codigo', name: 'Código de ética y canal de denuncias', result: 'Implementados', goal: '3 de 3 hitos', light: 'verde', bottleneck: false,
    strategies: [
      { id: 'g1', text: 'Pasar al siguiente hito: el informe de sostenibilidad.', correct: false },
      { id: 'g2', text: 'Eliminar el canal de denuncias.', correct: false },
      { id: 'g3', text: 'Reescribir el código desde cero.', correct: false },
    ],
  },
];

export const BOTTLENECKS = TOPICS.filter((t) => t.bottleneck);
