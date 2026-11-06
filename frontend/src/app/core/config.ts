/** URL base del backend Express + Firebase Firestore (ver /backend). */
// Usa el mismo equipo desde el que se abrió la página: así funciona también
// al entrar desde un celular con la IP del computador (http://192.168.x.x:4200).
// En Vercel (o cualquier dominio publicado) la API está en el mismo sitio: /api.
const LOCAL = typeof location === 'undefined' || /^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(location.hostname);
export const API_URL = LOCAL ? `${typeof location !== 'undefined' ? location.protocol + '//' + location.hostname : 'http://localhost'}:3000/api` : '/api';

/** Claves de almacenamiento local (respaldo si la API no está disponible). */
export const STORAGE_KEY = 'gadmi-sost-empresarial:v2';
export const SESSION_KEY = 'gadmi-sost-empresarial:sesion';
export const PREFS_KEY = 'gadmi-sost-empresarial:preferencias';

/** Intentos permitidos por reto autocalificable. */
export const MAX_ATTEMPTS = 2;

/**
 * Orden de los módulos. Pendiente de decidir con la profe (obligatorio o libre).
 * true = cada módulo se abre al terminar los retos del anterior.
 */
export const SEQUENTIAL_MODULES = true;

/**
 * Acceso de prueba (demostración sin Moodle): el selector Docente / Estudiante del ingreso
 * llena estos datos. Deben coincidir con los usuarios que crea el backend al arrancar
 * (DOCENTE_CORREO / DOCENTE_PASSWORD y DEMO_ESTUDIANTE_CORREO / DEMO_ESTUDIANTE_PASSWORD).
 */
export const ACCESO_PRUEBA = {
  estudiante: { correo: 'estudiante.prueba@uao.edu.co', password: 'Prueba2026*' },
  docente: { correo: 'docente@uao.edu.co', password: 'Docente2026*' },
} as const;
