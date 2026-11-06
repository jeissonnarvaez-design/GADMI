// Genera subtítulos WebVTT (.vtt) en español a partir de un video, con Gemini.
// El mismo .vtt sirve para los subtítulos (CC) y para el botón «Transcripción».
//   npm run subtitulos -- ../frontend/public/assets/video/IMG_7890.MOV ../frontend/public/assets/video/bienvenida.vtt
//   npm run subtitulos -- ../frontend/public/assets/video/YouCut_20261106_001829818.mp4 ../frontend/public/assets/video/modulo-1.vtt
// Usa GEMINI_API_KEY de backend/.env. Revisa siempre el resultado: es un borrador que conviene corregir a mano.
import 'dotenv/config';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname } from 'node:path';

const [video, salida] = process.argv.slice(2);
if (!video || !salida) {
  console.error('Uso: npm run subtitulos -- <video.mp4|.mov> <salida.vtt>');
  process.exit(1);
}
const KEY = String(process.env.GEMINI_API_KEY ?? '').trim();
if (!KEY) {
  console.error('Falta GEMINI_API_KEY en backend/.env');
  process.exit(1);
}
const BASE = process.env.GEMINI_API_BASE ?? 'https://generativelanguage.googleapis.com';
const TIPOS = { '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm', '.m4v': 'video/mp4' };
const mime = TIPOS[extname(video).toLowerCase()] ?? 'video/mp4';
const bytes = readFileSync(video);
const H = { 'x-goog-api-key': KEY };

// 1) Subir el video (API de archivos de Gemini, carga reanudable)
const ini = await fetch(`${BASE}/upload/v1beta/files`, {
  method: 'POST',
  headers: { ...H, 'X-Goog-Upload-Protocol': 'resumable', 'X-Goog-Upload-Command': 'start', 'X-Goog-Upload-Header-Content-Length': String(statSync(video).size), 'X-Goog-Upload-Header-Content-Type': mime, 'Content-Type': 'application/json' },
  body: JSON.stringify({ file: { display_name: basename(video) } }),
});
const url = ini.headers.get('x-goog-upload-url');
if (!ini.ok || !url) throw new Error(`No se pudo iniciar la carga (${ini.status}): ${await ini.text()}`);
console.log('Subiendo', basename(video), (bytes.length / 1e6).toFixed(1), 'MB…');
const up = await fetch(url, { method: 'POST', headers: { 'X-Goog-Upload-Offset': '0', 'X-Goog-Upload-Command': 'upload, finalize', 'Content-Length': String(bytes.length) }, body: bytes });
if (!up.ok) throw new Error(`Falló la carga (${up.status}): ${await up.text()}`);
let file = (await up.json()).file;

// 2) Esperar a que Gemini procese el video
for (let i = 0; file.state !== 'ACTIVE'; i++) {
  if (file.state === 'FAILED' || i > 90) throw new Error('Gemini no pudo procesar el video.');
  await new Promise((r) => setTimeout(r, 2000));
  file = await (await fetch(`${BASE}/v1beta/${file.name}`, { headers: H })).json();
}

// 3) Pedir los subtítulos
const PROMPT = `Genera los subtítulos de este video en formato WebVTT, en español de Colombia.
Reglas:
- Empieza con la línea WEBVTT y una línea en blanco.
- Transcribe literalmente lo que se dice (sin traducir, sin resumir), con puntuación normal.
- Cada subtítulo: máximo 2 líneas de 42 caracteres y entre 1 y 7 segundos, con tiempos exactos HH:MM:SS.mmm --> HH:MM:SS.mmm.
- Si se distingue quién habla y es un personaje (Teo, Nibi, Chispa…), empieza el texto con «Nombre: ».
- Describe entre corchetes los sonidos importantes sin voz, por ejemplo [música suave].
- Devuelve solo el WebVTT, sin comentarios ni bloques de código.`;
const MODELOS = [...new Set([process.env.GEMINI_STT_MODEL, 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3.8-flash'].filter(Boolean))];
let vtt = '';
for (const m of MODELOS) {
  const r = await fetch(`${BASE}/v1beta/models/${m}:generateContent`, {
    method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ file_data: { mime_type: mime, file_uri: file.uri } }, { text: PROMPT }] }], generationConfig: { temperature: 0 } }),
  });
  if (!r.ok) { console.warn(`Modelo ${m}: ${r.status}`); continue; }
  const d = await r.json();
  vtt = (d.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('').trim().replace(/^```(?:vtt|webvtt)?\s*|\s*```$/g, '');
  if (vtt.startsWith('WEBVTT')) break;
}
if (!vtt.startsWith('WEBVTT')) throw new Error('No se obtuvo un WebVTT válido. Intenta de nuevo o con otro modelo (GEMINI_STT_MODEL).');
writeFileSync(salida, vtt + '\n');
await fetch(`${BASE}/v1beta/${file.name}`, { method: 'DELETE', headers: H }).catch(() => {});
console.log(`✔ Subtítulos guardados en ${salida} (${(vtt.match(/-->/g) ?? []).length} líneas). Revísalos antes de publicarlos.`);
