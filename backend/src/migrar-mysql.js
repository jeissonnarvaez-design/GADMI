// Copia los datos de la base MySQL anterior a Firestore (se ejecuta una sola vez).
//   1. Enciende el MySQL viejo (docker compose up -d en la versión anterior).
//   2. npm run migrar-mysql
// Lee DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME (por defecto el MySQL de Docker: 127.0.0.1:3307, gadmi/gadmi).
import 'dotenv/config';
import { db } from './firebase.js';
import * as store from './store.js';

let mysql;
try {
  mysql = (await import('mysql2/promise')).default;
} catch {
  console.error('✘ Falta el paquete mysql2. Ejecuta: npm install mysql2');
  process.exit(1);
}

const conn = await mysql.createConnection({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3307),
  user: process.env.DB_USER ?? 'gadmi',
  password: process.env.DB_PASSWORD ?? 'gadmi',
  database: process.env.DB_NAME ?? 'gadmi',
});
const json = (v) => (v == null ? null : typeof v === 'string' ? JSON.parse(v) : v);
const iso = (d) => (d ? new Date(d).toISOString() : null);
const unico = (tipo, valor) => db.collection('unicos').doc(`${tipo}:${String(valor).toLowerCase().replace(/\//g, '_')}`);

const [docentes] = await conn.query('SELECT * FROM docente');
const [estudiantes] = await conn.query("SELECT * FROM estudiante WHERE password_hash <> ''");
let batch = db.batch();
for (const d of docentes) {
  batch.set(db.collection('docentes').doc(String(d.id)), { id: d.id, nombre: d.nombre, correo: d.correo, passwordHash: d.password_hash, creadoEn: iso(d.creado_en) });
  batch.set(unico('correo', d.correo), { rol: 'docente', id: d.id });
}
for (const s of estudiantes) {
  batch.set(db.collection('estudiantes').doc(String(s.id)), {
    id: s.id, nombre: s.nombre, codigo: s.codigo, correo: s.correo, grupo: s.grupo, passwordHash: s.password_hash,
    aceptaPrivacidadEn: iso(s.acepta_privacidad_en), preferencias: json(s.preferencias), cartaFirmadaEn: iso(s.carta_firmada_en),
    creadoEn: iso(s.creado_en), progreso: {}, bitacoras: {}, primerIntento: {},
  });
  batch.set(unico('correo', s.correo), { rol: 'estudiante', id: s.id });
  batch.set(unico('codigo', s.codigo), { rol: 'estudiante', id: s.id });
}
batch.set(db.collection('contadores').doc('docentes'), { siguiente: Math.max(0, ...docentes.map((d) => d.id)) });
batch.set(db.collection('contadores').doc('estudiantes'), { siguiente: Math.max(0, ...estudiantes.map((s) => s.id)) });
await batch.commit();
console.log(`✔ ${docentes.length} docentes y ${estudiantes.length} estudiantes`);

const ids = new Set(estudiantes.map((s) => s.id));
const [intentos] = await conn.query('SELECT * FROM intento ORDER BY estudiante_id, ejercicio_id, numero_intento');
let n = 0;
for (const i of intentos.filter((x) => ids.has(x.estudiante_id))) {
  await store.saveAttempt(i.estudiante_id, {
    ejercicioId: i.ejercicio_id, numeroIntento: i.numero_intento, respuestas: json(i.respuestas), retroalimentacion: json(i.retroalimentacion),
    puntaje: Number(i.puntaje), puntajeMax: Number(i.puntaje_max), nota: Number(i.nota),
  });
  n++;
}
console.log(`✔ ${n} intentos (con su progreso y decisiones)`);

const [bitacoras] = await conn.query('SELECT * FROM bitacora');
for (const b of bitacoras.filter((x) => ids.has(x.estudiante_id))) {
  await store.saveReflection(b.estudiante_id, b.modulo_id, json(b.respuestas) ?? []);
  if (b.revisada_en) await store.reviewReflection(b.estudiante_id, b.modulo_id, b.calificacion_docente === null ? null : Number(b.calificacion_docente), b.comentario_docente);
}
console.log(`✔ ${bitacoras.length} bitácoras`);

const [insignias] = await conn.query('SELECT * FROM insignia_obtenida');
for (const id of ids) await store.saveBadges(id, insignias.filter((x) => x.estudiante_id === id).map((x) => x.insignia));
// Los certificados viejos (GADMI-XXXX-XXXX) no se copian: con el formato nuevo
// (periodo-grupo-iniciales-XXXXXX) se emiten solos al completar el módulo 4.
console.log(`✔ ${insignias.length} insignias`);
await conn.end();
console.log('Listo. Ya puedes apagar MySQL/Docker.');
process.exit(0);
