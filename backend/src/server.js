import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { randomInt } from 'node:crypto';
import { createToken, hashPassword, requireRole, requireSession, verifyPassword } from './auth.js';
import { MAX_TOTAL } from './catalogo.js';
import { toGrade } from './grading.js';
import * as store from './store.js';
import { HttpError } from './store.js';
import { sintetizar, vozDisponible } from './voz.js';
import { dictadoDisponible, transcribir } from './dictado.js';
import { crearEstudiante, isUaoEmail, limpiarNombre, nombreCompleto, normGrupo, periodoActual } from './cuentas.js';

const app = express();
app.use(cors({ origin: (process.env.CORS_ORIGIN ?? 'http://localhost:4200').split(',') }));
app.use(express.json({ limit: '1mb' }));

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const estudiante = requireRole('estudiante');
const docente = requireRole('docente');

function publicStudent(r) {
  return {
    id: r.id, nombre: r.nombre, codigo: r.codigo, correo: r.correo, grupo: r.grupo,
    aceptaPrivacidad: r.aceptaPrivacidadEn ?? null,
    cartaFirmada: r.cartaFirmadaEn ?? null,
    tourVisto: r.tourVistoEn ?? null,
    preferencias: r.preferencias ?? null,
  };
}

app.get('/api/health', wrap(async (_req, res) => {
  await store.ping();
  res.json({ ok: true });
}));

// ------------------------------------------------------------------ Voz de personajes (Gemini TTS)
/**
 * Dictado: audio (base64, máx. ~1 minuto) → texto. Lo usa el botón «Dictar con voz»
 * cuando el navegador no tiene reconocimiento de voz propio o este falla.
 */
app.post('/api/voz/transcribir', requireSession, wrap(async (req, res) => {
  if (!dictadoDisponible()) return res.status(404).json({ error: 'El dictado no está configurado en el servidor (falta GEMINI_API_KEY).' });
  const { audio, tipo } = req.body ?? {};
  if (typeof audio !== 'string' || !audio || audio.length > 900_000) return res.status(400).json({ error: 'Audio vacío o demasiado largo (máx. 1 minuto).' });
  try {
    res.json({ texto: await transcribir(audio, tipo) });
  } catch (e) {
    res.status(e.status === 400 ? 400 : 503).json({ error: e.status === 400 ? e.message : 'No se pudo convertir tu voz en texto. Intenta de nuevo.' });
  }
}));

/** ¿Hay voz de Gemini para este personaje? (si no, el navegador usa su voz). */
app.get('/api/voz/:personaje', (req, res) => res.json({ disponible: vozDisponible(req.params.personaje) }));

/** Texto → audio WAV con la voz del personaje (Teo = Charon). */
app.post('/api/voz', requireSession, wrap(async (req, res) => {
  const { texto, personaje } = req.body ?? {};
  const t = String(texto ?? '').trim();
  if (!t || t.length > 600) return res.status(400).json({ error: 'Texto vacío o demasiado largo (máx. 600 caracteres).' });
  if (!vozDisponible(personaje)) return res.status(404).json({ error: 'Voz de Gemini no configurada para este personaje.' });
  try {
    const wav = await sintetizar(t, personaje);
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(wav);
  } catch (e) {
    console.error('Voz Gemini:', e.message);
    // 503 = temporal (el navegador lee esta frase y vuelve a intentar con Gemini en la siguiente).
    res.status([429, 500, 503].includes(e.status) ? 503 : 502).json({ error: 'No se pudo generar la voz con Gemini.' });
  }
}));

// ------------------------------------------------------------------ Ingreso docente
app.post('/api/auth/docente/login', wrap(async (req, res) => {
  const { correo, password } = req.body ?? {};
  const d = await store.teacherByEmail(String(correo ?? '').trim().toLowerCase());
  if (!d || !verifyPassword(String(password ?? ''), d.passwordHash)) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  }
  res.json({ token: createToken(d.id, 'docente'), docente: { id: d.id, nombre: d.nombre, correo: d.correo } });
}));

/*
 * Sin auto-registro: las cuentas se crean desde Moodle (LTI) o por un administrador.
 * - Docentes: script `npm run crear-usuarios -- docentes archivo.csv` (o el docente inicial del .env).
 * - Estudiantes: el mismo script con la lista exportada de Moodle, o POST /api/docente/estudiantes.
 */

/** Lista de docentes (para el panel). */
app.get('/api/docente/docentes', requireRole('docente'), wrap(async (_req, res) => {
  res.json(await store.listTeachers());
}));

// ------------------------------------------------------------------ Cuentas de estudiantes (solo docentes/administración)
/**
 * Crea una o varias cuentas de estudiante (p. ej. la lista del curso exportada de Moodle).
 * Cuerpo: { estudiantes: [{ nombre, codigo, correo, grupo, password }] }. No hay registro público.
 */
app.post('/api/docente/estudiantes', docente, wrap(async (req, res) => {
  const lista = Array.isArray(req.body?.estudiantes) ? req.body.estudiantes.slice(0, 500) : [];
  if (!lista.length) return res.status(400).json({ error: 'Envía la lista de estudiantes.' });
  const creados = [], errores = [];
  for (const e of lista) {
    try {
      const s = await crearEstudiante(e);
      creados.push({ id: s.id, correo: s.correo });
    } catch (err) {
      errores.push({ correo: e?.correo ?? '', error: err.message });
    }
  }
  res.status(201).json({ creados, errores });
}));

app.post('/api/auth/estudiante/login', wrap(async (req, res) => {
  const { correo, password } = req.body ?? {};
  const s = await store.studentByEmail(String(correo ?? '').trim().toLowerCase());
  if (!s || !verifyPassword(String(password ?? ''), s.passwordHash)) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  }
  res.json({ token: createToken(s.id, 'estudiante'), estudiante: publicStudent(s) });
}));

// ------------------------------------------------------------------ Estudiante (requiere token)
app.put('/api/estudiante/onboarding', estudiante, wrap(async (req, res) => {
  const { aceptaPrivacidad, avisoVersion, preferencias, cartaFirmada, tourVisto } = req.body ?? {};
  await store.updateOnboarding(req.userId, { aceptaPrivacidad, avisoVersion, preferencias, cartaFirmada, tourVisto });
  res.json({ ok: true });
}));

/** PROVISIONAL (botón «Reiniciar progreso»): borra todo el avance del estudiante. */
app.delete('/api/estudiante/progreso', estudiante, wrap(async (req, res) => {
  await store.resetStudent(req.userId);
  res.json({ ok: true });
}));

app.get('/api/estudiante/progreso', estudiante, wrap(async (req, res) => {
  res.json(await store.studentProgress(req.userId));
}));

app.post('/api/estudiante/intentos', estudiante, wrap(async (req, res) => {
  const { ejercicioId, numeroIntento, respuestas, retroalimentacion, puntaje, puntajeMax } = req.body ?? {};
  if (!ejercicioId || ![1, 2].includes(numeroIntento)) return res.status(400).json({ error: 'Intento inválido.' });
  const max = Number(puntajeMax);
  const points = Math.max(0, Math.min(Number(puntaje), max));
  const nota = toGrade(points, max); // la nota se recalcula en el servidor
  const modulo = await store.saveAttempt(req.userId, { ejercicioId, numeroIntento, respuestas, retroalimentacion, puntaje: points, puntajeMax: max, nota });
  // Al completar el módulo 4 se emite el certificado (una sola vez).
  const cert = await ensureCertificate(req.userId);
  res.status(201).json({ ok: true, nota, modulo, certificado: cert?.codigo ?? null });
}));

app.put('/api/estudiante/bitacoras', estudiante, wrap(async (req, res) => {
  const { moduloId, respuestas } = req.body ?? {};
  if (!moduloId || !Array.isArray(respuestas)) return res.status(400).json({ error: 'Bitácora inválida.' });
  await store.saveReflection(req.userId, Number(moduloId), respuestas.map(String));
  res.json({ ok: true });
}));

/** Corregir el nombre (nombre y apellidos completos) para el certificado. */
app.put('/api/estudiante/nombre', estudiante, wrap(async (req, res) => {
  const nombre = limpiarNombre(req.body?.nombre);
  if (!nombreCompleto(nombre)) return res.status(400).json({ error: 'Escribe tu nombre y tus apellidos completos.' });
  await store.updateStudentName(req.userId, nombre);
  res.json({ ok: true, nombre });
}));

/** Mensajes de la junta para el «!» de la Ruta (colección «mensajes» de Firestore). */
app.get('/api/estudiante/mensajes', estudiante, wrap(async (_req, res) => {
  res.json((await store.listMessages()).map(({ id, anio, titulo, texto }) => ({ id, anio, titulo, texto })));
}));

app.put('/api/estudiante/insignias', estudiante, wrap(async (req, res) => {
  const { insignias } = req.body ?? {};
  if (!Array.isArray(insignias)) return res.status(400).json({ error: 'Insignias inválidas.' });
  await store.saveBadges(req.userId, insignias);
  res.json({ ok: true });
}));

// ------------------------------------------------------------------ Docente (requiere token)
app.get('/api/docente/grupos', docente, wrap(async (_req, res) => {
  res.json(await store.groups(periodoActual()));
}));

/** Panel del curso: avance por estudiante (filtrable por grupo). */
app.get('/api/docente/estudiantes', docente, wrap(async (req, res) => {
  res.json(await store.courseOverview(req.query.grupo));
}));

app.get('/api/docente/estudiantes/:id', docente, wrap(async (req, res) => {
  const d = await store.studentDetail(Number(req.params.id));
  if (!d) return res.status(404).json({ error: 'Estudiante no encontrado.' });
  res.json({ estudiante: publicStudent(d.s), progreso: d.progreso, decisiones: d.decisiones, bitacoras: d.bitacoras });
}));

app.get('/api/docente/bitacoras', docente, wrap(async (req, res) => {
  res.json(await store.listReflections({ grupo: req.query.grupo, modulo: req.query.modulo }));
}));

/** Calificación opcional de la bitácora (escala 1–5). */
app.put('/api/docente/bitacoras/:estudianteId/:moduloId', docente, wrap(async (req, res) => {
  const { calificacion, comentario } = req.body ?? {};
  const nota = calificacion === null || calificacion === '' || calificacion === undefined ? null : Number(calificacion);
  if (nota !== null && !(nota >= 1 && nota <= 5)) return res.status(400).json({ error: 'La calificación va de 1,0 a 5,0.' });
  await store.reviewReflection(Number(req.params.estudianteId), Number(req.params.moduloId), nota, comentario);
  res.json({ ok: true });
}));

/** Exportar notas en CSV (separador «;» para Excel en español). */
app.get('/api/docente/export.csv', docente, wrap(async (req, res) => {
  const rows = await store.courseOverview(req.query.grupo);
  const head = ['Código', 'Nombre', 'Correo', 'Grupo', 'Nota M1', 'Nota M2', 'Nota M3', 'Nota M4', 'Granos totales', 'Granos posibles', 'Nota global', 'Bitácoras completas'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const num = (v) => (v === null || v === undefined ? '' : String(v).replace('.', ','));
  const lines = rows.map((r) => [r.codigo, r.nombre, r.correo, r.grupo, ...r.modulos.map((m) => num(m.nota)), num(r.puntos), num(r.puntosMax), num(r.nota), r.bitacoras].map(esc).join(';'));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="notas-gadmi${req.query.grupo ? '-' + req.query.grupo : ''}.csv"`);
  res.send('﻿' + [head.map(esc).join(';'), ...lines].join('\r\n'));
}));

/** Resumen del curso para las tarjetas del panel y «Donde más se equivocan». */
app.get('/api/docente/resumen', docente, wrap(async (req, res) => {
  res.json(await store.courseSummary(req.query.grupo));
}));

// ------------------------------------------------------------------ Certificado
const LEVELS = [[4.4, 'Líder de impacto'], [3.8, 'Gestor/a sostenible'], [3, 'Gestor/a en formación'], [1, 'Explorador/a sostenible']];
const levelFor = (g) => LEVELS.find(([from]) => g >= from)[1];

/** 6 caracteres al azar: A-Z y 2-9, sin 0, O, 1, I ni L (no se confunden al copiarlos). */
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const azar = (n) => Array.from({ length: n }, () => ALFABETO[randomInt(ALFABETO.length)]).join('');
const sinTildes = (t) => String(t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Iniciales del nombre (hasta 3 letras): «María García Ruiz» → MGR. */
function iniciales(nombre) {
  const letras = sinTildes(nombre).toUpperCase().split(/\s+/).map((p) => p.replace(/[^A-Z]/g, '')).filter(Boolean).map((p) => p[0]);
  return (letras.length > 3 ? [letras[0], letras[letras.length - 2], letras[letras.length - 1]] : letras).join('') || 'X';
}
const limpiar = (t) => sinTildes(t).toUpperCase().replace(/[^A-Z0-9]/g, '');

/** Normaliza un código escrito por una persona: mayúsculas y sin espacios. */
const normalizarCodigo = (c) => String(c ?? '').toUpperCase().replace(/\s+/g, '');

/**
 * Emite el certificado (una sola vez) si cumple los requisitos: 4 módulos, 600 granos o más, 4 bitácoras e informe descargado.
 * Formato: periodo-grupo-iniciales-XXXXXX (p. ej. 2026-2-G1-MGR-K7Q4X9).
 * Si ya existe, lo reutiliza (y, si sigue válido, actualiza el puntaje con su mejor intento).
 */
async function ensureCertificate(estudianteId) {
  const prev = await store.certificateOf(estudianteId);
  const { s, puntos, elegible } = await store.certificateFacts(estudianteId);
  const nivel = levelFor(toGrade(puntos, MAX_TOTAL));
  if (prev) {
    if (prev.estado === 'valido' && (prev.puntaje !== puntos || prev.nivel !== nivel)) {
      await store.updateCertificate(prev.codigo, { puntaje: puntos, nivel });
      return { ...prev, puntaje: puntos, nivel };
    }
    return prev;
  }
  if (!elegible || !s) return null;
  const periodo = s.periodo ?? periodoActual();
  const grupo = limpiar(s.grupo) || 'G';
  return store.createCertificate(estudianteId, () => ({
    codigo: `${periodo}-${grupo}-${iniciales(s.nombre)}-${azar(6)}`,
    estudianteId, periodo, grupo: s.grupo, fechaEmision: new Date().toISOString(), puntaje: puntos, nivel, estado: 'valido',
  }));
}

const certJson = (c) => ({
  codigo: c.codigo, periodo: c.periodo, grupo: c.grupo, fechaEmision: c.fechaEmision, puntaje: c.puntaje, max: MAX_TOTAL,
  nota: toGrade(c.puntaje, MAX_TOTAL), nivel: c.nivel, estado: c.estado,
});

/** Certificado del estudiante. Si aún no cumple los requisitos, responde 409 con lo que le falta (constancia de participación). */
app.post('/api/estudiante/certificado', estudiante, wrap(async (req, res) => {
  const c = await ensureCertificate(req.userId);
  if (!c) {
    const { requisitos } = await store.certificateFacts(req.userId);
    return res.status(409).json({ error: 'Aún no cumples los requisitos del certificado: por ahora recibes la constancia de participación.', requisitos });
  }
  res.json(certJson(c));
}));

/**
 * Verificación pública (QR) y buscador del docente. Solo muestra nombre, periodo, grupo,
 * nivel, puntos y fecha: nunca documento ni correo.
 */
app.get('/api/certificados/:codigo', wrap(async (req, res) => {
  const c = await store.getCertificate(normalizarCodigo(req.params.codigo));
  if (!c) return res.status(404).json({ error: 'Este código no existe.' });
  res.json({
    codigo: c.codigo, estudiante: c.nombre, periodo: c.periodo, grupo: c.grupo, nivel: c.nivel,
    puntos: c.puntaje, max: MAX_TOTAL, fecha: c.fechaEmision, estado: c.estado, fechaAnulacion: c.fechaAnulacion ?? null,
  });
}));

/** Anular un certificado (solo docente). */
app.patch('/api/certificados/:codigo', docente, wrap(async (req, res) => {
  if (req.body?.estado !== 'anulado') return res.status(400).json({ error: "Solo se puede cambiar el estado a 'anulado'." });
  const codigo = normalizarCodigo(req.params.codigo);
  const c = await store.getCertificate(codigo);
  if (!c) return res.status(404).json({ error: 'Este código no existe.' });
  if (c.estado !== 'anulado') await store.updateCertificate(codigo, { estado: 'anulado', fechaAnulacion: new Date().toISOString(), anuladoPor: req.userId });
  res.json({ ok: true, codigo, estado: 'anulado' });
}));

/** Mensajes iniciales de la junta (se pueden editar o añadir en la colección «mensajes»). */
const MENSAJES_INICIALES = [
  { anio: 2027, titulo: 'Correo de la junta', texto: 'La junta quiere ver los valores de la marca antes de fin de mes. Ve al Mercado.' },
];

/**
 * Docente de prueba (acceso de demostración): se asegura en cada arranque que exista
 * DOCENTE_CORREO con la contraseña DOCENTE_PASSWORD, aunque ya haya otros docentes.
 */
async function ensureDefaultTeacher() {
  const correo = (process.env.DOCENTE_CORREO ?? 'docente@uao.edu.co').trim().toLowerCase();
  const password = process.env.DOCENTE_PASSWORD ?? 'Docente2026*';
  if (!correo) return;
  const d = await store.teacherByEmail(correo);
  if (!d) {
    await store.createTeacher({ nombre: process.env.DOCENTE_NOMBRE ?? 'Docente de Prueba', correo, passwordHash: hashPassword(password) });
    console.log(`✔ Docente de prueba creado: ${correo}`);
  } else if (!verifyPassword(password, d.passwordHash)) {
    await store.setPasswordHash('docente', d.id, hashPassword(password));
    console.log(`✔ Contraseña del docente de prueba actualizada: ${correo}`);
  }
}

/**
 * Estudiante de prueba para la demostración sin Moodle (lo llena solo el ingreso de respaldo).
 * Se crea si no existe. Para desactivarlo, deja DEMO_ESTUDIANTE_CORREO vacío en el .env.
 */
async function ensureDemoStudent() {
  const correo = (process.env.DEMO_ESTUDIANTE_CORREO ?? 'estudiante.prueba@uao.edu.co').trim().toLowerCase();
  if (!correo) return;
  const password = process.env.DEMO_ESTUDIANTE_PASSWORD ?? 'Prueba2026*';
  const e = await store.studentByEmail(correo);
  if (e) {
    if (!verifyPassword(password, e.passwordHash)) {
      await store.setPasswordHash('estudiante', e.id, hashPassword(password));
      console.log(`✔ Contraseña del estudiante de prueba actualizada: ${correo}`);
    }
    return;
  }
  await crearEstudiante({
    nombre: process.env.DEMO_ESTUDIANTE_NOMBRE ?? 'Estudiante de Prueba', codigo: process.env.DEMO_ESTUDIANTE_CODIGO ?? 'PRUEBA-01',
    correo, grupo: 'G1', password,
  });
  console.log(`✔ Estudiante de prueba creado: ${correo}`);
}

/** Códigos gRPC de Firestore → mensaje claro. */
const FIRESTORE_HINTS = {
  7: 'Firebase rechazó el acceso (PERMISSION_DENIED). Revisa que la clave de cuenta de servicio sea del proyecto correcto.',
  16: 'Credenciales de Firebase no válidas (UNAUTHENTICATED). Descarga de nuevo backend/firebase-key.json.',
  5: 'No existe la base de datos de Firestore. Créala en la consola de Firebase (Firestore Database → Crear base de datos).',
  14: 'No hay conexión con Firebase (UNAVAILABLE). Revisa tu internet.',
};

app.use((err, _req, res, _next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  console.error(err);
  const hint = FIRESTORE_HINTS[err.code] ?? 'Error en la base de datos (Firebase). Revisa la consola de la API.';
  res.status(500).json({ error: `${hint} (${err.code ?? 'error'})` });
});

/** Tareas de arranque (docente inicial y mensajes de la junta). Se hacen una vez por instancia. */
let arranque = null;
function prepararDatos() {
  arranque ??= (async () => {
    await store.ping();
    console.log(`✔ Conectado a Firebase (Firestore)${process.env.FIRESTORE_EMULATOR_HOST ? ' · emulador ' + process.env.FIRESTORE_EMULATOR_HOST : ''}`);
    await ensureDefaultTeacher().catch((e) => console.warn('Docente de prueba:', e.message));
    await ensureDemoStudent().catch((e) => console.warn('Estudiante de prueba:', e.message));
    if (await store.seedMessages(MENSAJES_INICIALES)) console.log('✔ Mensajes de la junta iniciales creados');
  })().catch((e) => {
    arranque = null;
    console.error('✘ No se pudo conectar a Firestore:', FIRESTORE_HINTS[e.code] ?? e.message);
  });
  return arranque;
}

// En Vercel la API corre como función (api/index.js importa esta app); en local, con app.listen.
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`API GADMI escuchando en http://localhost:${port}/api`);
    prepararDatos();
  });
} else {
  prepararDatos();
}

export default app;
