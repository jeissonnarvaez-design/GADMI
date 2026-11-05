// Voz de los personajes con Gemini TTS (texto a voz). Teo usa la voz prediseñada «Charon».
// La clave GEMINI_API_KEY vive solo en el servidor (backend/.env).
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const API_BASE = process.env.GEMINI_API_BASE ?? 'https://generativelanguage.googleapis.com';
/** Limpia el valor del .env: espacios, comillas, caracteres invisibles y el prefijo «models/». */
const clean = (v) => String(v ?? '').replace(/[\s"'\u200B-\u200D\uFEFF]/g, '').replace(/^models\//, '');
const MODEL = clean(process.env.GEMINI_TTS_MODEL) || 'gemini-3.8-flash-lite-tts';
const API_KEY = () => clean(process.env.GEMINI_API_KEY);
/** Modelos de respaldo si el principal está saturado (503) o con límite de uso (429). */
const FALLBACKS = String(process.env.GEMINI_TTS_FALLBACK ?? 'gemini-2.5-flash-preview-tts,gemini-3.8-flash-tts')
  .split(',').map(clean).filter(Boolean);
const MODELS = [...new Set([MODEL, ...FALLBACKS])];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
// En Vercel el disco es de solo lectura salvo /tmp (la caché dura mientras viva la instancia).
const CACHE_DIR = process.env.VERCEL ? pathToFileURL(tmpdir() + '/cache-voz/') : new URL('../cache-voz/', import.meta.url);

/** Voz y estilo de cada personaje (Documento maestro, sección 4). */
const PERSONAJES = {
  teo: {
    voz: clean(process.env.GEMINI_VOZ_TEO) || 'Charon',
    // Instrucción de estilo opcional. Vacía por defecto: algunos modelos (como el «lite»)
    // no la entienden como instrucción y la leen en voz alta antes del texto.
    estilo: clean(process.env.GEMINI_ESTILO_TEO),
  },
};

/** Gemini entrega PCM 16 bits mono a 24 kHz: se le agrega la cabecera WAV para el navegador. */
function pcmToWav(pcm, sampleRate = 24000, channels = 1, bits = 16) {
  const h = Buffer.alloc(44);
  const byteRate = (sampleRate * channels * bits) / 8;
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(channels, 22);
  h.writeUInt32LE(sampleRate, 24); h.writeUInt32LE(byteRate, 28); h.writeUInt16LE((channels * bits) / 8, 32); h.writeUInt16LE(bits, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

export function vozDisponible(personaje) {
  return !!API_KEY() && !!PERSONAJES[personaje];
}

/** Devuelve el audio WAV del texto con la voz del personaje (usa caché en disco). */
export async function sintetizar(texto, personaje) {
  const p = PERSONAJES[personaje];
  const key = createHash('sha1').update(`${p.voz}|${p.estilo}|${texto}`).digest('hex');
  const file = new URL(`${key}.wav`, CACHE_DIR);
  try {
    return await readFile(file);
  } catch { /* no está en caché */ }

  let lastError = null;
  for (const model of MODELS) {
    for (let intento = 1; intento <= 2; intento++) {
      try {
        const wav = await pedirAudio(model, p, texto);
        await mkdir(CACHE_DIR, { recursive: true });
        await writeFile(file, wav);
        return wav;
      } catch (e) {
        if (e.name === 'TimeoutError' || e.name === 'AbortError') e = Object.assign(new Error(`Gemini TTS (${model}) tardó demasiado.`), { status: 503 });
        else if (!e.status) e.status = 503; // fallo de red: temporal
        lastError = e;
        // 429 (límite) o 500: esperar y reintentar una vez. 503 (saturado) o demora: pasar al siguiente modelo.
        if (![429, 500].includes(e.status)) break;
        if (intento === 1) await wait(800);
      }
    }
    console.warn(`Voz Gemini: ${model} no disponible (${lastError?.status ?? lastError?.message}). Probando otro modelo…`);
  }
  throw lastError;
}

async function pedirAudio(model, p, texto) {
  const res = await fetch(`${API_BASE}/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    // Si el modelo tarda más de 12 s, se prueba el siguiente (o el navegador lee la frase).
    signal: AbortSignal.timeout(Number(process.env.GEMINI_TTS_TIMEOUT_MS ?? 12000)),
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY() },
    body: JSON.stringify({
      contents: [{ parts: [{ text: p.estilo ? `${p.estilo}: ${texto}` : texto }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: p.voz } } },
      },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    if (res.status === 404 && model === MODEL) console.error(`El modelo «${model}» no existe para tu clave. Revisa GEMINI_TTS_MODEL en backend/.env.`);
    throw Object.assign(new Error(`Gemini TTS (${model}) respondió ${res.status}: ${detail.slice(0, 200)}`), { code: 'GEMINI_TTS', status: res.status });
  }
  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.find((x) => x.inlineData?.data);
  if (!part) throw Object.assign(new Error('Gemini no devolvió audio.'), { code: 'GEMINI_TTS', status: 500 });
  const mime = part.inlineData.mimeType ?? '';
  const raw = Buffer.from(part.inlineData.data, 'base64');
  // Los modelos nuevos (p. ej. gemini-3.8-flash-tts) ya entregan WAV; los «preview» entregan PCM crudo.
  const isWav = /wav/i.test(mime) || raw.subarray(0, 4).toString() === 'RIFF';
  const rate = Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000);
  return isWav ? raw : pcmToWav(raw, rate);
}
