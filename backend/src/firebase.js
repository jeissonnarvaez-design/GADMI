// Conexión a Firebase (Cloud Firestore) con el SDK de administrador.
// Credenciales: archivo de cuenta de servicio (FIREBASE_SERVICE_ACCOUNT, por defecto ./firebase-key.json).
import 'dotenv/config';
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const backendDir = resolve(fileURLToPath(new URL('..', import.meta.url)));
const keyPath = (() => {
  const p = (process.env.FIREBASE_SERVICE_ACCOUNT ?? './firebase-key.json').trim();
  return isAbsolute(p) ? p : resolve(backendDir, p);
})();

function init() {
  // Emulador local de Firestore (para pruebas): no necesita credenciales.
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? 'demo-gadmi' });
  }
  // En Vercel no hay archivo: la llave va en la variable FIREBASE_SERVICE_ACCOUNT_JSON
  // (el contenido del JSON, tal cual o en base64).
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? '').trim();
  if (raw) {
    const sa = JSON.parse(raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8'));
    if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    return initializeApp({ credential: cert(sa), projectId: process.env.FIREBASE_PROJECT_ID ?? sa.project_id });
  }
  if (!existsSync(keyPath)) {
    console.error(`✘ No encontré la clave de Firebase en ${keyPath}`);
    console.error('  Descárgala en la consola de Firebase: Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada,');
    console.error('  y guárdala como backend/firebase-key.json (o indica la ruta en FIREBASE_SERVICE_ACCOUNT).');
    if (process.env.VERCEL) throw new Error('Falta la variable FIREBASE_SERVICE_ACCOUNT_JSON en Vercel.');
    process.exit(1);
  }
  const sa = JSON.parse(readFileSync(keyPath, 'utf8'));
  return initializeApp({ credential: cert(sa), projectId: process.env.FIREBASE_PROJECT_ID ?? sa.project_id });
}

export const app = init();
export const db = getFirestore(app);
db.settings({ ignoreUndefinedProperties: true });
