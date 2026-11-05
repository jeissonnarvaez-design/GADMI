// Autenticación sin dependencias externas: scrypt para contraseñas y token firmado con HMAC.
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SECRET = process.env.AUTH_SECRET ?? 'cambia-este-secreto-en-produccion';
const TTL_MS = 1000 * 60 * 60 * 12; // 12 horas

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64);
  const ref = Buffer.from(hash, 'hex');
  return ref.length === test.length && timingSafeEqual(ref, test);
}

const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (data) => createHmac('sha256', SECRET).update(data).digest('base64url');

export function createToken(id, rol) {
  const payload = b64(JSON.stringify({ sub: id, rol, exp: Date.now() + TTL_MS }));
  return `${payload}.${sign(payload)}`;
}

export function readToken(token) {
  const [payload, sig] = String(token ?? '').split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  return data.exp > Date.now() ? data : null;
}

/** Middleware: exige un token del rol indicado ('estudiante' | 'docente'). */
export const requireRole = (rol) => (req, res, next) => {
  const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
  const data = readToken(token);
  if (!data || data.rol !== rol) return res.status(401).json({ error: 'Sesión no válida para este rol.' });
  req.userId = data.sub;
  next();
};

/** Middleware: exige cualquier sesión válida (estudiante o docente). */
export const requireSession = (req, res, next) => {
  const data = readToken((req.headers.authorization ?? '').replace(/^Bearer\s+/i, ''));
  if (!data) return res.status(401).json({ error: 'Inicia sesión para usar la voz.' });
  req.userId = data.sub;
  next();
};
