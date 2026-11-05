// Capa de datos sobre Cloud Firestore (reemplaza las consultas SQL de MySQL).
//
// Colecciones:
//   docentes/{id}                      nombre, correo, passwordHash, creadoEn
//   estudiantes/{id}                   datos + resumen: progreso{m}, bitacoras{m}, primerIntento{ejercicio}
//     ├─ intentos/{ejercicio}_{n}      respuestas, retroalimentacion, puntaje, puntajeMax, nota, fecha
//     ├─ decisiones/{ejercicio}        última opción elegida (hilo conductor)
//     ├─ bitacoras/{modulo}            respuestas, calificacion, comentario, revisadaEn
//     └─ insignias/{insignia}          fecha
//   certificados/{codigo}              codigo, estudianteId, periodo, grupo, fechaEmision, puntaje, nivel, estado ('valido' | 'anulado')
//   mensajes/{id}                      mensajes de la junta para el «!» de la Ruta: anio, titulo, texto, orden, activo
//   contadores/{docentes|estudiantes}  siguiente id numérico (las URL del panel usan números)
//   unicos/{tipo:valor}                garantiza correo y código únicos
import { db } from './firebase.js';
import { INCLUIDOS, MODULOS, ejercicio, maxModulo } from './catalogo.js';
import { toGrade } from './grading.js';

const now = () => new Date().toISOString();
const D = () => db.collection('docentes');
const E = () => db.collection('estudiantes');
const C = () => db.collection('certificados');
const est = (id) => E().doc(String(id));
/** Solo cuentan los certificados con el formato nuevo (periodo-grupo-iniciales-XXXXXX); los GADMI-XXXX-XXXX de pruebas anteriores se ignoran. */
const formatoNuevo = (c) => !!c?.periodo;

/** Error con código HTTP para responder directamente. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Siguiente id numérico (transacción, sin repetir). */
async function nextId(tx, name) {
  const ref = db.collection('contadores').doc(name);
  const snap = await tx.get(ref);
  const id = (snap.exists ? snap.data().siguiente : 0) + 1;
  tx.set(ref, { siguiente: id });
  return id;
}

const unico = (tipo, valor) => db.collection('unicos').doc(`${tipo}:${String(valor).toLowerCase().replace(/\//g, '_')}`);

export async function ping() {
  await db.collection('contadores').doc('estudiantes').get();
}

// ------------------------------------------------------------------ Docentes
export async function teacherByEmail(correo) {
  const q = await D().where('correo', '==', correo).limit(1).get();
  return q.empty ? null : q.docs[0].data();
}

export async function countTeachers() {
  const q = await D().limit(1).get();
  return q.size;
}

export async function createTeacher({ nombre, correo, passwordHash }) {
  return db.runTransaction(async (tx) => {
    const u = unico('correo', correo);
    if ((await tx.get(u)).exists) throw new HttpError(409, 'Ya existe una cuenta con ese correo. Ingresa con tu contraseña.');
    const id = await nextId(tx, 'docentes');
    const doc = { id, nombre, correo, passwordHash, creadoEn: now() };
    tx.create(u, { rol: 'docente', id });
    tx.set(D().doc(String(id)), doc);
    return doc;
  });
}

export async function listTeachers() {
  const q = await D().get();
  return q.docs.map((d) => d.data()).map(({ id, nombre, correo, creadoEn }) => ({ id, nombre, correo, creado_en: creadoEn })).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

// ------------------------------------------------------------------ Estudiantes
export async function studentByEmail(correo) {
  const q = await E().where('correo', '==', correo).limit(1).get();
  return q.empty ? null : q.docs[0].data();
}

export async function getStudent(id) {
  const s = await est(id).get();
  return s.exists ? s.data() : null;
}

export async function createStudent({ nombre, codigo, correo, grupo, periodo, passwordHash }) {
  return db.runTransaction(async (tx) => {
    const uc = unico('correo', correo);
    const uk = unico('codigo', codigo);
    const [a, b] = await Promise.all([tx.get(uc), tx.get(uk)]);
    if (a.exists) throw new HttpError(409, a.data().rol === 'docente' ? 'Ese correo pertenece a una cuenta docente. Usa el ingreso docente.' : 'Ya existe una cuenta con ese código o correo. Ingresa con tu contraseña.');
    if (b.exists) throw new HttpError(409, 'Ya existe una cuenta con ese código o correo. Ingresa con tu contraseña.');
    const id = await nextId(tx, 'estudiantes');
    const doc = {
      id, nombre, codigo, correo, grupo, periodo, passwordHash,
      aceptaPrivacidadEn: null, preferencias: null, cartaFirmadaEn: null, tourVistoEn: null, creadoEn: now(),
      progreso: {}, bitacoras: {}, primerIntento: {},
    };
    tx.create(uc, { rol: 'estudiante', id });
    tx.create(uk, { rol: 'estudiante', id });
    tx.set(est(id), doc);
    return doc;
  });
}

/** Privacidad, preferencias y carta de la junta (las fechas solo se guardan la primera vez). */
export async function updateOnboarding(id, { aceptaPrivacidad, preferencias, cartaFirmada, tourVisto }) {
  const s = await getStudent(id);
  if (!s) throw new HttpError(404, 'Estudiante no encontrado.');
  const patch = {};
  if (aceptaPrivacidad && !s.aceptaPrivacidadEn) patch.aceptaPrivacidadEn = new Date(aceptaPrivacidad).toISOString();
  if (preferencias) patch.preferencias = preferencias;
  if (cartaFirmada && !s.cartaFirmadaEn) patch.cartaFirmadaEn = new Date(cartaFirmada).toISOString();
  if (tourVisto && !s.tourVistoEn) patch.tourVistoEn = new Date(tourVisto).toISOString();
  if (Object.keys(patch).length) await est(id).update(patch);
}

/** Guarda un intento, la decisión y recalcula el progreso del módulo. */
export async function saveAttempt(id, { ejercicioId, numeroIntento, respuestas, retroalimentacion, puntaje, puntajeMax, nota }) {
  const ej = ejercicio(ejercicioId);
  if (!ej) throw new HttpError(400, 'Reto desconocido.');
  return db.runTransaction(async (tx) => {
    const ref = est(id);
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpError(404, 'Estudiante no encontrado.');
    const s = snap.data();
    const m = String(ej.modulo);
    const prog = s.progreso?.[m] ?? { mejor: {} };
    const mejor = { ...(prog.mejor ?? {}), [ejercicioId]: Math.max(prog.mejor?.[ejercicioId] ?? 0, puntaje) };
    const puntos = INCLUIDOS.filter((e) => e.modulo === ej.modulo).reduce((sum, e) => sum + (mejor[e.id] ?? 0), 0);
    const max = maxModulo(ej.modulo);
    const modulo = { mejor, completados: Object.keys(mejor).filter((k) => ejercicio(k)?.incluido).length, puntos, nota: toGrade(puntos, max) };
    const fecha = now();
    tx.set(ref.collection('intentos').doc(`${ejercicioId}_${numeroIntento}`), {
      ejercicioId, numeroIntento, respuestas: respuestas ?? null, retroalimentacion: retroalimentacion ?? null, puntaje, puntajeMax, nota, fecha,
    });
    tx.set(ref.collection('decisiones').doc(ejercicioId), { ejercicioId, opcion: respuestas ?? null, fecha });
    const patch = { [`progreso.${m}`]: modulo };
    if (numeroIntento === 1) patch[`primerIntento.${ejercicioId}`] = { fallo: puntaje < puntajeMax };
    tx.update(ref, patch);
    return { puntos, max, nota: modulo.nota };
  });
}

export async function saveReflection(id, moduloId, respuestas) {
  const ref = est(id);
  const completa = respuestas.every((t) => String(t).trim().length >= 10);
  const prev = (await ref.get()).data()?.bitacoras?.[String(moduloId)];
  await ref.collection('bitacoras').doc(String(moduloId)).set({ moduloId: Number(moduloId), respuestas }, { merge: true });
  await ref.update({ [`bitacoras.${moduloId}`]: { completa, revisada: prev?.revisada ?? false } });
}

export async function saveBadges(id, insignias) {
  const col = est(id).collection('insignias');
  const refs = insignias.map((i) => col.doc(String(i)));
  if (!refs.length) return;
  const snaps = await db.getAll(...refs);
  const batch = db.batch();
  snaps.forEach((s, i) => !s.exists && batch.set(refs[i], { insignia: insignias[i], fecha: now() }));
  await batch.commit();
}

/** Progreso en el formato que espera el frontend (intentos por reto y bitácoras). */
export async function studentProgress(id) {
  const ref = est(id);
  const [intentos, bitacoras, insignias] = await Promise.all([ref.collection('intentos').get(), ref.collection('bitacoras').get(), ref.collection('insignias').get()]);
  const attempts = {};
  intentos.docs
    .map((d) => d.data())
    .sort((a, b) => a.ejercicioId.localeCompare(b.ejercicioId) || a.numeroIntento - b.numeroIntento)
    .forEach((i) => {
      const fb = i.retroalimentacion ?? {};
      (attempts[i.ejercicioId] ??= []).push({
        number: i.numeroIntento, points: i.puntaje, max: i.puntajeMax, grade: i.nota,
        answers: i.respuestas, items: fb.items ?? [], summary: fb.summary, flags: fb.flags ?? {}, date: i.fecha,
      });
    });
  const reflections = Object.fromEntries(bitacoras.docs.map((d) => [d.id, d.data().respuestas]));
  return { attempts, reflections, badges: insignias.docs.map((d) => d.data()) };
}

// ------------------------------------------------------------------ Docente: curso
export async function listStudents(grupo) {
  const q = grupo ? await E().where('grupo', '==', String(grupo)).get() : await E().get();
  return q.docs.map((d) => d.data()).sort((a, b) => a.grupo.localeCompare(b.grupo) || a.nombre.localeCompare(b.nombre));
}

export async function groups(periodoActual) {
  const all = await listStudents();
  const counts = {};
  all.forEach((s) => {
    counts[s.grupo] ??= { estudiantes: 0, periodo: s.periodo ?? periodoActual };
    counts[s.grupo].estudiantes++;
  });
  return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([grupo, v]) => ({ grupo, periodo: v.periodo, estudiantes: v.estudiantes }));
}

/** Panel del curso: avance por estudiante (todo sale del documento del estudiante). */
export function overviewRow(s, cert) {
  const totalMax = MODULOS.reduce((sum, m) => sum + maxModulo(m.id), 0);
  const modulos = MODULOS.map((m) => {
    const p = s.progreso?.[String(m.id)];
    return { moduloId: m.id, puntos: p?.puntos ?? 0, max: maxModulo(m.id), completados: p?.completados ?? 0, ejercicios: INCLUIDOS.filter((e) => e.modulo === m.id).length, nota: p ? p.nota : null };
  });
  const puntos = modulos.reduce((a, m) => a + m.puntos, 0);
  const bits = Object.values(s.bitacoras ?? {});
  const bitacoraEstado = !bits.length ? 'Pendiente' : bits.some((b) => !b.revisada) ? 'Revisar' : 'Revisada';
  return {
    id: s.id, nombre: s.nombre, codigo: s.codigo, correo: s.correo, grupo: s.grupo, modulos, puntos, puntosMax: totalMax, bitacoraEstado,
    nota: modulos.some((m) => m.completados) ? toGrade(puntos, totalMax) : null, bitacoras: bits.filter((b) => b.completa).length,
    certificado: cert ? { codigo: cert.codigo, estado: cert.estado } : null,
  };
}

/** Certificado de cada estudiante (uno por estudiante). */
async function certsByStudent() {
  const map = new Map();
  (await C().get()).docs.map((d) => d.data()).filter(formatoNuevo).forEach((c) => map.set(c.estudianteId, c));
  return map;
}

export async function courseOverview(grupo) {
  const [students, certs] = await Promise.all([listStudents(grupo), certsByStudent()]);
  return students.map((s) => overviewRow(s, certs.get(s.id)));
}

export async function studentDetail(id) {
  const s = await getStudent(id);
  if (!s) return null;
  const ref = est(id);
  const [progreso, decisiones, bitacoras] = await Promise.all([studentProgress(id), ref.collection('decisiones').get(), ref.collection('bitacoras').get()]);
  return {
    s,
    progreso,
    decisiones: decisiones.docs.map((d) => d.data()).sort((a, b) => a.ejercicioId.localeCompare(b.ejercicioId)).map((d) => ({ ejercicioId: d.ejercicioId, opcion: d.opcion, fecha: d.fecha })),
    bitacoras: bitacoras.docs.map((d) => d.data()).sort((a, b) => a.moduloId - b.moduloId).map((b) => ({
      moduloId: b.moduloId, respuestas: b.respuestas, calificacion: b.calificacion ?? null, comentario: b.comentario ?? null, revisada: !!b.revisadaEn,
    })),
  };
}

export async function listReflections({ grupo, modulo }) {
  const students = await listStudents(grupo);
  const rows = [];
  for (const s of students) {
    const q = await est(s.id).collection('bitacoras').get();
    q.docs.map((d) => d.data())
      .filter((b) => !modulo || b.moduloId === Number(modulo))
      .sort((a, b) => a.moduloId - b.moduloId)
      .forEach((b) => rows.push({
        estudianteId: s.id, nombre: s.nombre, codigo: s.codigo, grupo: s.grupo, moduloId: b.moduloId,
        respuestas: b.respuestas, calificacion: b.calificacion ?? null, comentario: b.comentario ?? null,
      }));
  }
  return rows;
}

export async function reviewReflection(estudianteId, moduloId, calificacion, comentario) {
  const ref = est(estudianteId);
  const b = ref.collection('bitacoras').doc(String(moduloId));
  const snap = await b.get();
  if (!snap.exists) throw new HttpError(404, 'La bitácora no existe.');
  await b.update({ calificacion, comentario: comentario ?? null, revisadaEn: now() });
  await ref.update({ [`bitacoras.${moduloId}.revisada`]: true });
}

/** Tarjetas del panel y «Donde más se equivocan» (% que falla el primer intento). */
export async function courseSummary(grupo) {
  const students = await listStudents(grupo);
  const rows = students.map((st) => overviewRow(st));
  const activos = rows.filter((r) => r.modulos.some((m) => m.completados));
  const promedio = activos.length ? Math.round(activos.reduce((s, r) => s + r.puntos, 0) / activos.length) : 0;
  const ids = new Set(students.map((s) => s.id));
  const certs = (await C().get()).docs.map((d) => d.data()).filter((c) => formatoNuevo(c) && ids.has(c.estudianteId) && c.estado === 'valido');
  const porRevisar = students.reduce((n, s) => n + Object.values(s.bitacoras ?? {}).filter((b) => !b.revisada).length, 0);
  const stats = {};
  for (const s of students) {
    for (const [ex, v] of Object.entries(s.primerIntento ?? {})) {
      stats[ex] ??= { total: 0, fallan: 0 };
      stats[ex].total++;
      if (v.fallo) stats[ex].fallan++;
    }
  }
  const dificiles = Object.entries(stats)
    .map(([ex, v]) => ({ codigo: ejercicio(ex)?.codigo ?? ex, titulo: ejercicio(ex)?.titulo ?? ex, pct: Math.round((v.fallan / v.total) * 100), total: v.total }))
    .filter((x) => x.pct > 0)
    .sort((a, b) => b.pct - a.pct || b.total - a.total)
    .slice(0, 3)
    .map(({ total, ...rest }) => rest);
  return { estudiantes: rows.length, activos: activos.length, promedio, certificados: certs.length, bitacorasPorRevisar: porRevisar, dificiles };
}

// ------------------------------------------------------------------ Certificados
/** Certificado del estudiante (se emite una sola vez y se reutiliza). */
export async function certificateOf(estudianteId) {
  const q = await C().where('estudianteId', '==', estudianteId).get();
  return q.docs.map((d) => d.data()).find(formatoNuevo) ?? null;
}

/**
 * Crea el certificado dentro de una transacción: si el estudiante ya tiene uno, lo devuelve;
 * si el código al azar ya existe (muy raro), prueba otro.
 */
export async function createCertificate(estudianteId, build) {
  const marca = db.collection('unicos').doc(`certificado:${estudianteId}`);
  for (let intento = 0; intento < 5; intento++) {
    const cert = build();
    const out = await db.runTransaction(async (tx) => {
      const m = await tx.get(marca);
      if (m.exists) return (await tx.get(C().doc(m.data().codigo))).data();
      const ref = C().doc(cert.codigo);
      if ((await tx.get(ref)).exists) return null;
      tx.create(ref, cert);
      tx.create(marca, { codigo: cert.codigo });
      return cert;
    });
    if (out) return out;
  }
  throw new HttpError(500, 'No se pudo generar el código del certificado. Intenta de nuevo.');
}

export async function updateCertificate(codigo, patch) {
  await C().doc(codigo).update(patch);
}

export async function getCertificate(codigo) {
  const s = await C().doc(codigo).get();
  if (!s.exists) return null;
  const c = s.data();
  if (!formatoNuevo(c)) return null;
  const st = await getStudent(c.estudianteId);
  return { ...c, nombre: st?.nombre ?? '' };
}

/** Puntaje actual (mejor intento de cada reto) y si ya completó el módulo 4. */
export async function certificateFacts(id) {
  const s = await getStudent(id);
  const puntos = Object.values(s?.progreso ?? {}).reduce((sum, p) => sum + (p.puntos ?? 0), 0);
  const m4 = INCLUIDOS.filter((e) => e.modulo === 4).length;
  return { s, puntos, modulo4: (s?.progreso?.['4']?.completados ?? 0) >= m4 };
}

// ------------------------------------------------------------------ Mensajes de la junta («!» de la Ruta)
export async function listMessages() {
  const q = await db.collection('mensajes').get();
  return q.docs.map((d) => ({ id: d.id, ...d.data() })).filter((m) => m.activo !== false).sort((a, b) => a.anio - b.anio || (a.orden ?? 0) - (b.orden ?? 0));
}

/** Si no hay mensajes, crea los del diseño (luego se editan en la consola de Firebase). */
export async function seedMessages(defaults) {
  const col = db.collection('mensajes');
  if (!(await col.limit(1).get()).empty) return false;
  const batch = db.batch();
  defaults.forEach((m, i) => batch.set(col.doc(`m${i + 1}`), { ...m, orden: i + 1, activo: true }));
  await batch.commit();
  return true;
}
