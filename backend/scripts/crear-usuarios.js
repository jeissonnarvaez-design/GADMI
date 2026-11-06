// Crea cuentas desde un CSV (no hay auto-registro en el aplicativo).
//   npm run crear-usuarios -- estudiantes lista.csv   columnas: nombre;codigo;correo;grupo;password
//   npm run crear-usuarios -- docentes docentes.csv   columnas: nombre;correo;password
// Acepta separador «;» (Excel en español) o «,». La primera fila son los títulos de las columnas.
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { crearDocente, crearEstudiante } from '../src/cuentas.js';

const [tipo, archivo] = process.argv.slice(2);
if (!['estudiantes', 'docentes'].includes(tipo) || !archivo) {
  console.error('Uso: npm run crear-usuarios -- estudiantes|docentes archivo.csv');
  process.exit(1);
}
const lineas = readFileSync(archivo, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
const sep = lineas[0].includes(';') ? ';' : ',';
const cols = lineas[0].split(sep).map((c) => c.trim().toLowerCase());
let ok = 0;
for (const [n, linea] of lineas.slice(1).entries()) {
  const v = linea.split(sep).map((x) => x.trim());
  const fila = Object.fromEntries(cols.map((c, i) => [c, v[i] ?? '']));
  try {
    const u = tipo === 'estudiantes' ? await crearEstudiante(fila) : await crearDocente(fila);
    ok++;
    console.log(`✔ ${u.correo}`);
  } catch (e) {
    console.error(`✖ fila ${n + 2} (${fila.correo ?? '?'}): ${e.message}`);
  }
}
console.log(`Listo: ${ok} de ${lineas.length - 1} cuentas creadas.`);
process.exit(0);
