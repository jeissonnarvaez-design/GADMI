import { ExerciseMeta, ModuleId, ModuleMeta } from '../models/models';

/**
 * Estructura de los 4 módulos. En este prototipo se implementan 3 ejercicios
 * por módulo; los demás quedan listados en `omitted` y se muestran en pantalla.
 */
export const MODULES: ModuleMeta[] = [
  {
    id: 1,
    phase: 'Planeación',
    year: 2027,
    title: 'Estrategia & Direccionamiento',
    intro: {
      character: 'Teo',
      scene: 'Sala de juntas',
      text: 'La junta está esperando. Primero necesitamos rumbo.',
      goal: 'Meta: darle rumbo a la empresa y ponerle números.',
    },
    objective:
      'Definir el marco estratégico y los objetivos operacionales de la empresa, resaltando los principios de las dimensiones que rigen la sostenibilidad.',
    exercises: [
      {
        id: 'm1-brujula',
        module: 1,
        code: '1.1',
        title: 'Brújula estratégica',
        route: 'brujula',
        maxPoints: 60,
        fundamento:
          'Diferenciar desde lo conceptual Misión, Visión y Objetivos organizacionales, y validar si se registran en el marco de las dimensiones de la sostenibilidad: social, económica, ambiental y gobernanza.',
        interaccion:
          'Parte A: ubica nueve bloques en cuatro zonas (Misión, Visión, Objetivos y «No va en la brújula»). Parte B: etiqueta cada objetivo con su dimensión.',
        consigna:
          'CACAO Raíz S.A.S. tiene ideas dispersas sobre quién es y hacia dónde se dirige. Ordena sus ideas y ubica cada bloque donde corresponda. Considera que algunos bloques no pertenecen al direccionamiento estratégico.',
      },
      {
        id: 'm1-valores',
        module: 1,
        code: '1.2',
        title: 'Valores que dejan huella',
        route: 'valores',
        maxPoints: 50,
        fundamento:
          'Distinguir entre contenidos e imágenes los valores diferenciales con los cuales la organización prevé impactar los ODS.',
        interaccion:
          'Parte A: clasifica ocho tarjetas en valor diferencial, solo apariencia o no aporta. Parte B: une cada valor diferencial con el ODS al que más aporta. Parte C: escribe una frase bandera para la marca.',
        consigna: 'Mercadeo propone ocho ideas. ¿Cuáles cambian algo real y cuáles solo se ven bien?',
      },
      {
        id: 'm1-foda',
        module: 1,
        code: '1.3',
        title: 'Análisis de entornos (FODA)',
        route: 'foda',
        maxPoints: 80,
        fundamento:
          'Análisis de entornos en la matriz FODA, mediante tarjetas de factores internos y externos donde prevalezcan los efectos de los ODS.',
        interaccion:
          'Parte A: ubica doce tarjetas en los cuatro cuadrantes del lienzo. Cada tarjeta lleva el ODS con el que se relaciona. Parte B: elige la estrategia que mejor cruza una fortaleza con una oportunidad (FO).',
        consigna:
          'Antes de decidir, visualiza a CACAO Raíz S.A.S. en su entorno interno y externo. Recuerda: lo que la empresa es capaz de controlar es interno y lo que pasa fuera de ella es externo.',
      },
      {
        id: 'm1-metas',
        module: 1,
        code: '1.4',
        title: 'Metas e indicadores (KPI)',
        route: 'metas',
        maxPoints: 60,
        fundamento:
          'Definición de metas e indicadores (KPI): objetivos cuantitativos y horizontes en el corto y mediano plazo.',
        interaccion:
          'Para cada uno de los cuatro objetivos de 1.1 elige el indicador de un catálogo, fija la meta con un deslizador y escoge el horizonte.',
        consigna:
          'Un objetivo sin indicador es un buen deseo. Otorga a cada objetivo una forma de medirlo, una meta y un plazo.',
      },
    ],
    omitted: [],
    reflections: [
      '¿Qué objetivo de CACAO Raíz S.A.S. parece ser el más difícil de cumplir y por qué?',
      '¿Qué tarjeta del FODA te hizo dudar y cómo resolviste la duda?',
      'Si fueras consumidor, ¿qué te haría confiar en que una marca es realmente sostenible?',
    ],
    closingMessage:
      'Terminaste la Planeación. Cacao Raíz ya tiene rumbo, metas e indicadores. Ahora toca organizarla.',
  },
  {
    id: 2,
    phase: 'Organización',
    year: 2028,
    intro: {
      character: 'Nibi',
      scene: 'Planos de la empresa',
      text: 'Hay que ordenar a las 48 personas y decidir en qué invertir.',
      goal: 'Meta: una estructura clara y un presupuesto verde.',
    },
    title: 'Estructura, Procesos & Cadena de Valor Verde',
    objective:
      'Diseñar la estructura/arquitectura organizacional, diferenciando los aportes entre lo estructural, posicional y funcional, dejando en evidencia los roles clave que determinan la viabilidad de la gestión de la sostenibilidad.',
    exercises: [
      {
        id: 'm2-organigrama',
        module: 2,
        code: '2.1',
        title: 'Organigrama',
        route: 'organigrama',
        maxPoints: 70,
        fundamento:
          'Estructurar el organigrama de una organización sostenible con un portafolio de opciones, considerando jerarquía, departamentos y líneas de mando.',
        interaccion:
          'Incluye cajas desde el portafolio, indica a quién reporta cada una y si la une una línea de mando (continua) o de asesoría (punteada).',
        consigna:
          'Diseña la estructura de CACAO Raíz S.A.S. considerando sus 48 colaboradores. La estructura debe ser clara, sin niveles de sobra y tener a alguien responsable de la sostenibilidad.',
      },
      {
        id: 'm2-funciones',
        module: 2,
        code: '2.2',
        title: 'Funciones',
        route: 'funciones',
        maxPoints: 40,
        fundamento: 'Asignar perfiles y funciones a cada área representada en el organigrama.',
        interaccion: 'Ubica diez tarjetas de función sobre las áreas del organigrama que diseñaste.',
        consigna:
          'Cada área existe para algo. Asigna cada función al área del organigrama que debe responder por ella.',
      },
      {
        id: 'm2-presupuesto-th',
        module: 2,
        code: '2.3',
        title: 'Presupuesto de talento humano',
        route: 'presupuesto-th',
        maxPoints: 40,
        fundamento:
          'Distribuir el presupuesto de talento humano entre los cargos clave según lo que la empresa necesita.',
        interaccion:
          'Seis deslizadores con rango salarial, tope de COP 46 M mensuales, factor prestacional de 1,52 y una justificación.',
        consigna:
          'Tienes 46 millones (COP) mensuales para los salarios de seis cargos clave. Considera que si otorgas más a uno, otro recibe menos. Decide según lo que la empresa necesita para cumplir sus objetivos.',
      },
      {
        id: 'm2-stakeholders',
        module: 2,
        code: '2.4',
        title: 'Grupos de interés',
        route: 'grupos-interes',
        maxPoints: 50,
        fundamento:
          'Identificar los grupos de interés y su poder e interés, y elegir proveedores responsables.',
        interaccion:
          'Ubica cada grupo en la matriz poder/interés y decide con qué proveedores de cacao trabajar.',
        consigna:
          'Toda empresa tiene grupos de interés. Ubica a cada uno según su poder e interés, y luego decide con qué proveedores de cacao trabajar.',
      },
      {
        id: 'm2-presupuesto-verde',
        module: 2,
        code: '2.5',
        title: 'Presupuesto verde',
        route: 'presupuesto-verde',
        maxPoints: 50,
        fundamento: 'Declarar el presupuesto verde: asignar recursos financieros para inversiones sustentables.',
        interaccion:
          'Activa o desactiva seis inversiones. Tres medidores se mueven en tiempo real: dinero usado, toneladas de CO₂ evitadas al año y ahorro anual.',
        consigna:
          'La junta aprobó COP 400 millones. Logra evitar al menos 150 t de CO₂ al año e incluye al menos una inversión con beneficio social directo.',
      },
    ],
    omitted: [],
    reflections: [
      '¿Qué cargo o área te parece indispensable para que la sostenibilidad no quede en el papel?',
      'En el presupuesto verde, ¿qué dejaste por fuera y qué perdiste con esa decisión?',
      '¿Pagarías más por un proveedor responsable si tu empresa estuviera en dificultades? Explica por qué.',
    ],
    closingMessage:
      'Terminaste la Organización. Cacao Raíz ya tiene estructura, responsables y un presupuesto verde. Ahora toca dirigirla.',
  },
  {
    id: 3,
    phase: 'Dirección',
    year: 2029,
    intro: {
      character: 'Nibi',
      scene: 'Planta en temporada alta',
      text: 'Llegan los dilemas y las crisis. Toca liderar a las personas.',
      goal: 'Meta: decidir con ética y comunicar con datos.',
    },
    title: 'Liderazgo organizacional-socioambiental & Toma de decisiones',
    objective:
      'Desarrollar competencias para liderar equipos de alto desempeño, valorando la comunicación, la responsabilidad, los compromisos y la gobernanza efectiva como base de una cultura sostenible capaz de responder a dilemas éticos.',
    exercises: [
      {
        id: 'm3-dilemas',
        module: 3,
        code: '3.1',
        title: 'Dilemas',
        route: 'dilemas',
        maxPoints: 80,
        fundamento:
          'Determinar en un portafolio de enunciados cuáles se asocian con prácticas sostenibles y cuáles generan dilemas éticos y ambientales (greenwashing, residuos peligrosos, condiciones laborales y proveedores).',
        interaccion:
          'Cuatro rondas. En cada una aparecen tres enunciados: elige el positivo y etiqueta los dos negativos como riesgo ético, riesgo ambiental o ambos.',
        consigna: 'No todo lo que parece una buena práctica lo es. Separa lo sostenible de lo que pone en riesgo a la empresa.',
      },
      {
        id: 'm3-crisis',
        module: 3,
        code: '3.2',
        title: 'Liderar en crisis',
        route: 'crisis',
        maxPoints: 90,
        fundamento:
          'Proponer, desde la capacidad de liderazgo, acciones para superar situaciones críticas: baja motivación del equipo, paro de proveedores y transformaciones del mercado.',
        interaccion:
          'Tres escenarios, cada uno con cuatro decisiones. Cada decisión mueve los indicadores de clima, productividad y reputación.',
        consigna: 'Eres la gerencia general. Elige, en cada escenario, la decisión de liderazgo más adecuada.',
      },
      {
        id: 'm3-comunicacion',
        module: 3,
        code: '3.3',
        title: 'Comunicación',
        route: 'comunicacion',
        maxPoints: 30,
        fundamento:
          'Monitorear la capacidad de comunicación del líder con los stakeholders, priorizando las capacidades internas y su relación con la sostenibilidad.',
        interaccion: 'Tres situaciones. Para cada una elige el mensaje (entre tres) y el canal (entre tres).',
        consigna: 'Lo que se comunica y cómo se comunica también es gestión sostenible. Elige el mensaje y el canal para cada caso.',
      },
      {
        id: 'm3-tablero-clima',
        module: 3,
        code: '3.4',
        title: 'Tablero de clima',
        route: 'tablero-clima',
        maxPoints: 50,
        fundamento:
          'Construir un tablero de clima organizacional con indicadores, umbrales de semáforo e interpretación.',
        interaccion:
          'Elige cuatro indicadores, define sus umbrales (±20 %) y elige la lectura correcta del tablero.',
        consigna:
          'Arma el tablero de clima: elige cuatro indicadores, define cuándo están en verde y lee lo que muestran.',
      },
    ],
    omitted: [],
    reflections: [
      '¿Cuál de las crisis te pareció más difícil y qué tipo de líder quisiste ser en ella?',
      '¿Recuerdas un caso real (de una empresa o de tu entorno) parecido a alguno de los dilemas?',
      '¿Qué indicador de tu tablero revisarías primero cada lunes y por qué?',
    ],
    closingMessage:
      'Terminaste la Dirección. Cacao Raíz tiene un liderazgo que decide con ética y comunica con datos. Ahora toca controlar.',
  },
  {
    id: 4,
    phase: 'Control (Evaluación)',
    year: 2030,
    intro: {
      character: 'Chispa',
      scene: 'Tablero de datos',
      text: '¿Cumplimos? Los datos lo dirán. Mide, aprende y mejora.',
      goal: 'Meta: medir, encontrar lo que falla y mejorar.',
    },
    title: 'Control bajo principios de sostenibilidad & Mejora continua',
    objective:
      'Promover el uso de instrumentos que permitan medir el desempeño de la empresa con criterios ambientales, sociales, económicos y de gobernanza, como base para convertir los hallazgos en un plan de mejora.',
    exercises: [
      {
        id: 'm4-tablero-esg',
        module: 4,
        code: '4.1',
        title: 'Tablero ESG',
        route: 'tablero-esg',
        maxPoints: 70,
        fundamento: 'Seleccionar los indicadores asociados con la sostenibilidad y ubicarlos en el tablero según su dimensión.',
        interaccion:
          'Parte A: de doce indicadores, marca los que son de sostenibilidad. Parte B: ubica los elegidos en las cuatro columnas del tablero (económica, social, ambiental, gobernanza).',
        consigna: 'Un buen tablero mide lo que importa. Elige los indicadores de sostenibilidad y ordénalos por dimensión.',
      },
      {
        id: 'm4-cuellos-botella',
        module: 4,
        code: '4.2',
        title: 'Cuellos de botella',
        route: 'cuellos-botella',
        maxPoints: 60,
        fundamento:
          'Acceder al reporte de sostenibilidad (bajo principios GRI), identificar tres cuellos de botella y definir una estrategia para cada uno.',
        interaccion:
          'El reporte de CACAO Raíz S.A.S. al cierre de 2027 aparece con semáforos. Marca tres cuellos de botella entre siete temas y, para cada uno, elige una estrategia entre tres.',
        consigna: 'Lee el reporte como lo leería la junta directiva: ¿dónde está atascada la empresa y qué harás al respecto?',
      },
      {
        id: 'm4-plan-accion',
        module: 4,
        code: '4.3',
        title: 'Plan de acción',
        route: 'plan-accion',
        maxPoints: 60,
        fundamento: 'Convertir la estrategia en un plan de acción y correctivos para atender las debilidades de sostenibilidad.',
        interaccion:
          'Una fila del plan por cada cuello de botella: lo que se hará (viene de 4.2), responsable (área del organigrama de 2.1), plazo, indicador de seguimiento, recurso y una frase sobre cómo saber que funcionó.',
        consigna: 'Estás en la etapa «Actuar» del ciclo PHVA. Tu plan permite reiniciar el ciclo con mejores datos.',
      },
      {
        id: 'm4-cerrar-circulo',
        module: 4,
        code: '4.4',
        title: 'Cerrar el círculo',
        route: 'cerrar-circulo',
        maxPoints: 60,
        fundamento:
          'Revisar los objetivos del Módulo 1 con sus resultados y decidir si se mantienen, se ajustan o se cambian.',
        interaccion:
          'Para cada uno de los cuatro objetivos elige mantener, ajustar o cambiar, y descarga el informe final en PDF.',
        consigna:
          'Vuelves a los cuatro objetivos del Módulo 1. Con su resultado, decide para cada uno: mantener la meta, ajustarla o cambiar la estrategia.',
      },
    ],
    omitted: [],
    reflections: [
      '¿Qué decisión tomada en un módulo anterior cambió lo que viste en el módulo 4?',
      'Si tuvieras que explicarle a la Junta Directiva en un minuto cómo va CACAO Raíz S.A.S., ¿qué dirías?',
      '¿Qué te llevas de esta experiencia para tu formación profesional?',
    ],
    closingMessage:
      'Terminaste el Control. Tu barra de chocolate está lista: Cacao Raíz mide, aprende y mejora.',
  },
];

export const ALL_EXERCISES: ExerciseMeta[] = MODULES.flatMap((m) => m.exercises);

export function getModule(id: number): ModuleMeta | undefined {
  return MODULES.find((m) => m.id === id);
}

export function getExercise(id: string): ExerciseMeta {
  const ex = ALL_EXERCISES.find((e) => e.id === id);
  if (!ex) throw new Error(`Ejercicio desconocido: ${id}`);
  return ex;
}

export function exerciseLink(ex: ExerciseMeta): string[] {
  return ['/reto', ex.code];
}

export function getExerciseByCode(code: string): ExerciseMeta | undefined {
  return ALL_EXERCISES.find((e) => e.code === code);
}

/** A dónde ir al terminar un reto: el siguiente del módulo o la bitácora. */
export function afterExercise(id: string): { link: string; label: string; closes: boolean } {
  const ex = getExercise(id);
  const n = nextExercise(id);
  if (n && n.module === ex.module) return { link: '/reto/' + n.code, label: 'RETO ' + n.code, closes: false };
  return { link: '/bitacora/' + ex.module, label: 'CERRAR MÓDULO', closes: true };
}

export function nextExercise(id: string): ExerciseMeta | undefined {
  const i = ALL_EXERCISES.findIndex((e) => e.id === id);
  return ALL_EXERCISES[i + 1];
}

export const MODULE_IDS: ModuleId[] = [1, 2, 3, 4];
