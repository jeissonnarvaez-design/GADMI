/**
 * Aviso de privacidad (Ley 1581 de 2012 y Decreto 1377 de 2013, Colombia).
 * Antes de publicar, la UAO debe CONFIRMAR los datos del responsable y del canal de contacto
 * (campo `contacto`): aquí no se inventan correos ni teléfonos institucionales.
 * Si cambia el texto, sube `version`: el consentimiento queda guardado con la versión aceptada.
 */
export const AVISO_PRIVACIDAD = {
  version: '2026-11',
  responsable:
    'Universidad Autónoma de Occidente (UAO), Facultad de Ciencias Empresariales y Jurídicas, Cali (Colombia), a través del curso que usa GADMI Sost-Empresarial.',
  contacto:
    'Escribe a tu docente por Moodle o usa el canal oficial de protección de datos personales publicado por la UAO en su sitio web (www.uao.edu.co).',
  secciones: [
    {
      titulo: 'Qué datos recogemos',
      items: [
        'Nombre y apellidos, código estudiantil, correo institucional, grupo y periodo académico.',
        'Tu avance en el juego: respuestas de los retos, granos, notas, insignias y bitácoras reflexivas.',
        'Tus preferencias de accesibilidad y la fecha en que aceptas este aviso.',
        'No pedimos documento de identidad, teléfono, dirección ni datos sensibles.',
      ],
    },
    {
      titulo: 'Para qué los usamos',
      items: [
        'Mostrar y guardar tu progreso en el curso.',
        'Calificar los retos y permitir que tu docente haga seguimiento y lea tus bitácoras.',
        'Emitir tu certificado y su código de verificación (la página pública solo muestra nombre, periodo, grupo, nivel, granos y fecha).',
        'Mejorar el curso con estadísticas del grupo, sin publicar datos personales.',
      ],
    },
    {
      titulo: 'Quién los ve y dónde se guardan',
      items: [
        'Solo tú y los docentes del curso. No se venden ni se ceden a terceros.',
        'Se guardan en servicios de nube contratados para el aplicativo (Google Firebase), con acceso protegido.',
      ],
    },
    {
      titulo: 'Tus derechos (artículo 8 de la Ley 1581 de 2012)',
      items: [
        'Conocer, actualizar y rectificar tus datos.',
        'Pedir prueba de esta autorización y saber cómo se usan tus datos.',
        'Revocar la autorización o pedir que se borren, cuando no exista un deber legal o académico de conservarlos.',
        'Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).',
        'Acceder gratis a tus datos.',
      ],
    },
  ],
};
