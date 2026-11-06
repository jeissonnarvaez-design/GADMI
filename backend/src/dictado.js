// Dictado por voz: audio grabado en el navegador → texto con Gemini.
// Se usa cuando el navegador no trae reconocimiento de voz propio (Firefox, Brave…)
// o cuando el de Chrome/Edge falla. La clave GEMINI_API_KEY vive solo en el servidor.
const API_BASE = process.env.GEMINI_API_BASE ?? 'https://generativelanguage.googleapis.com';
const clean = (v) => String(v ?? '').replace(/[\s"'​-‍﻿]/g, '').replace(/^models\//, '');
const API_KEY = () => clean(process.env.GEMINI_API_KEY);
/** Modelos que entienden audio, en orden. Se puede fijar uno con GEMINI_STT_MODEL en backend/.env. */
const MODELS = [...new Set([clean(process.env.GEMINI_STT_MODEL), 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.8-flash-lite', 'gemini-3.8-flash'].filter(Boolean))];
const TIPOS = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/aac'];

export const dictadoDisponible = () => !!API_KEY();

export async function transcribir(base64, mime) {
  const tipo = String(mime ?? '').split(';')[0].trim().toLowerCase();
  if (!TIPOS.includes(tipo)) throw Object.assign(new Error('Formato de audio no admitido.'), { status: 400 });
  let lastError;
  for (const model of MODELS) {
    try {
      const res = await fetch(`${API_BASE}/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        signal: AbortSignal.timeout(Number(process.env.GEMINI_STT_TIMEOUT_MS ?? 20000)),
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY() },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'Transcribe literalmente este audio en español (Colombia). Devuelve solo el texto dicho, con puntuación normal, sin comillas, sin comentarios ni traducciones. Si no se entiende nada, devuelve una cadena vacía.' },
              { inline_data: { mime_type: tipo, data: base64 } },
            ],
          }],
          generationConfig: { temperature: 0 },
        }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        lastError = Object.assign(new Error(`Gemini (${model}) respondió ${res.status}: ${detail.slice(0, 200)}`), { status: res.status });
        console.warn('Dictado:', lastError.message);
        if (res.status === 401 || res.status === 403) break; // clave inválida: no sirve probar otro modelo
        continue;
      }
      const data = await res.json();
      const texto = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('').trim();
      return texto.replace(/^["«“]|["»”]$/g, '').trim();
    } catch (e) {
      lastError = e;
      console.warn(`Dictado: ${model} falló (${e.message}).`);
    }
  }
  throw Object.assign(new Error(lastError?.message ?? 'No se pudo transcribir.'), { status: 503 });
}
