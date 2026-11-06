// Creación de cuentas (sin auto-registro): las usan el endpoint de docentes y el script de administración.
import { hashPassword } from './auth.js';
import * as store from './store.js';
import { HttpError } from './store.js';

export const isUaoEmail = (s) => typeof s === 'string' && /^[^@\s]+@uao\.edu\.co$/i.test(s.trim());
/** Nombre sin espacios de más: «  laura   gómez » → «laura gómez». */
export const limpiarNombre = (n) => String(n ?? '').trim().replace(/\s+/g, ' ');
/** Nombre completo = al menos nombre y un apellido (dos palabras de 2 letras o más). */
export const nombreCompleto = (n) => limpiarNombre(n).split(' ').filter((p) => p.length >= 2).length >= 2;

/** Grupo en un formato único: «g 1», «1» o «G1» → «G1». */
export function normGrupo(g) {
  const t = String(g ?? '').trim().toUpperCase().replace(/\s+/g, '');
  return /^\d+$/.test(t) ? 'G' + t : t;
}

/**
 * Periodo académico actual («2026-2»). Se puede fijar con PERIODO_ACADEMICO en backend/.env;
 * si no, se calcula con la fecha (enero–junio = 1, julio–diciembre = 2).
 */
export function periodoActual() {
  const env = (process.env.PERIODO_ACADEMICO ?? '').trim();
  if (env) return env;
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() < 6 ? 1 : 2}`;
}

export async function crearEstudiante({ nombre, codigo, correo, grupo, password } = {}) {
  if (!nombre || !codigo || !grupo || !isUaoEmail(correo) || String(password ?? '').length < 6) {
    throw new HttpError(400, 'Datos incompletos, correo no institucional o contraseña de menos de 6 caracteres.');
  }
  if (!nombreCompleto(nombre)) throw new HttpError(400, 'Falta el nombre y los apellidos completos.');
  return store.createStudent({
    nombre: limpiarNombre(nombre), codigo: String(codigo).trim(), correo: correo.trim().toLowerCase(), grupo: normGrupo(grupo), periodo: periodoActual(), passwordHash: hashPassword(password),
  });
}

export async function crearDocente({ nombre, correo, password } = {}) {
  if (!nombre || !isUaoEmail(correo) || String(password ?? '').length < 8) {
    throw new HttpError(400, 'Nombre, correo @uao.edu.co y contraseña de al menos 8 caracteres.');
  }
  const email = correo.trim().toLowerCase();
  if (await store.studentByEmail(email)) throw new HttpError(409, 'Ese correo ya está registrado como estudiante.');
  return store.createTeacher({ nombre: limpiarNombre(nombre), correo: email, passwordHash: hashPassword(password) });
}
