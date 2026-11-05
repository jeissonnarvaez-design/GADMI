# GADMI Sost-Empresarial · Prototipo (v2)

Simulador por temporadas: el estudiante lleva **CACAO Raíz del Pacífico S.A.S.** de 2026 a 2030 por 4 módulos (cada módulo es un año). Al final hay un Shark Tank y la barra-certificado. Implementa el *Documento maestro v2*.

```
gadmi-app/
├── frontend/          Angular 22
├── backend/           API Express + MySQL (ingreso docente y estudiante separados)
├── database/          schema.sql + seed.sql
└── docker-compose.yml MySQL 8 con el esquema precargado
```

## Cómo ejecutarlo (Windows · PowerShell)
Necesitas Node.js 20+ y Docker Desktop (o MySQL instalado). Ejecuta cada comando por separado: PowerShell 5 no acepta `&&`.

```powershell
docker compose up -d            # 1. MySQL (desde la carpeta gadmi-app)
cd backend
Copy-Item .env.example .env
npm install
npm start                       # 2. API en http://localhost:3000/api (MySQL de Docker en el puerto 3307)
```
En otra terminal:
```powershell
cd frontend
npm install
npm start                       # 3. App en http://localhost:4200
```
> Si tu MySQL tiene tablas de la versión anterior, la API las actualiza sola al arrancar (`✔ Base de datos actualizada…`), sin borrar datos. Las cuentas antiguas no tienen contraseña: usa «Crear cuenta» con el mismo código y correo.
> Sin Docker: ejecuta `database/schema.sql` y `database/seed.sql` en tu MySQL y ajusta `backend/.env`.

**Docente inicial** (se crea al arrancar la API, configurable en `backend/.env`): `docente@uao.edu.co` / `Docente2026*`.
**Docentes nuevos**: en el ingreso eligen «1 · Docente» y luego «¿Eres docente nuevo? Regístrate». Escriben su nombre, su correo @uao.edu.co, una contraseña de 8 caracteres o más y el **código de registro docente** (`DOCENTE_CODIGO_REGISTRO` en `backend/.env`, por defecto `GADMI-DOCENTE-2026`). El código evita que cualquiera cree una cuenta docente y vea las notas. Si se deja vacío, el registro queda deshabilitado.
**Estudiantes**: «Crear cuenta» en el ingreso de estudiante. Sin API, el estudiante puede seguir en modo sin conexión; el docente no.

## Pantallas de diseño integradas (GADMI_pantallas_sistemas)
Las 22 pantallas `.dc.html` del equipo están en Angular y reproducen fielmente el diseño: estilos, animaciones y bloque `prefers-reduced-motion`.

| Pantalla | Ruta | Archivo |
|---|---|---|
| Conectando | `/conectando` | `pages/entrada/conectando.ts` |
| Login (docente y estudiante) | `/ingreso` | `pages/entrada/login.ts` |
| Primera vez | `/primera-vez` | `pages/entrada/primera-vez.ts` |
| Bienvenida (Main) | `/bienvenida` | `pages/entrada/bienvenida.ts` |
| Video (Intro, 30 s) | `/video` | `pages/entrada/video.*` |
| Carta de la junta | `/carta` | `pages/entrada/carta.ts` |
| Ruta (Mapa) | `/ruta` | `pages/juego/ruta.*` |
| Intro de módulo | `/modulo/:n` | `pages/juego/intro-modulo.ts` |
| Retos | `/reto/:codigo` (1.1 … 4.3) | `retos/` |
| Bitácora | `/bitacora/:n` | `pages/juego/bitacora.ts` |
| Temporada | `/temporada/:n` | `pages/juego/temporada.ts` |
| Mis logros | `/logros` | `pages/juego/logros.ts` |
| Shark Tank | `/inversion` | `pages/final/inversion.ts` |
| Barra / certificado | `/barra` | `pages/final/barra.ts` |
| Informe | `/informe` | `pages/final/informe.ts` |
| Verificar (pública, QR) | `/verificar/:codigo` | `pages/final/verificar.ts` |
| Docente | `/docente` | `pages/docente/panel.ts` |
| Docente · detalle | `/docente/estudiante/:id` | `pages/docente/detalle.ts` |

**Componentes compartidos:** `app-personaje` (SVG oficiales con sus animaciones SMIL), `app-accesibilidad` (subtítulos, voz, texto grande, alto contraste y menos movimiento; se guardan por estudiante en MySQL), `app-game-header` y `app-granos`. Las clases `.px`, `.gpanel`, `.gbtn` y `.glow` son globales (`styles.scss`). Las fuentes son DM Sans y Press Start 2P. La voz está aislada en `core/services/speech.service.ts`, para cambiarla luego por la API de Gemini. El servicio elige una voz en español (es-CO si existe) y corrige los fallos de Chrome y Edge que dejaban mudo el altavoz. Todos los retos, la intro de módulo y la bitácora tienen el botón 🔊, que también sirve para detener la lectura. El video se narra por defecto (botón «Voz» para apagarlo). La preferencia «Voz» del menú de accesibilidad lee automáticamente las instrucciones al abrir cada pantalla.

**Retos en JSON (plantillas reutilizables):** el contenido de cada reto vive en `retos/data/<codigo>.json`: textos, opciones, respuestas, pistas, puntos y banderas para insignias.

| Plantilla | Diseño base | Retos que la usan |
|---|---|---|
| `tarjetas` (tarjeta por tarjeta) | Ejercicio11 | 1.1, 2.2, 3.1 |
| `partes` (clasificar por partes) | Reto12 | 1.2, 3.3, 4.1 |
| `cuadrantes` | Reto13 | 1.3 |
| `metas` (deslizadores) | Reto14 | 1.4 |
| `cartas` (escenario) | Cartas | 3.2 |
| Propios (organigrama y formularios) | — | 2.1, 2.5, 4.2, 4.3, en `exercises/` con el marco de juego |

## Dos ingresos separados
La pantalla de ingreso conserva el diseño con un selector **1 · Docente / 2 · Estudiante**. El estudiante puede crear su cuenta o, sin conexión, seguir en modo local. Cada rol tiene su propio token y las rutas están protegidas.

**Flujo del estudiante:** Ingreso → Conectando → (primera vez) Primera vez → Bienvenida → Video → Carta → Ruta. Si ya empezó: Conectando → Ruta.
**Cada módulo:** Intro → retos → Bitácora → Temporada → Ruta, con el siguiente módulo desbloqueado.
**Final:** Shark Tank → Barra → Informe. El docente entra a Panel → Detalle (bitácoras, comentario, nota opcional de 1 a 5, «Marcar como revisada») → Exportar CSV.

**Escala 1–5:** nota = 1 + 4 × (PE obtenidos / PE posibles). 1 es la más baja, 3 la mínima aprobatoria y 5 la máxima. Cuenta el mejor de 2 intentos: pistas después del primero y explicación después del segundo.

## Lo que sigue pendiente (no va en el prototipo)
- **PDF del certificado y del informe (jsPDF):** los botones muestran el aviso «pendiente». El certificado ya genera su **código único** en MySQL y la página `/verificar/:codigo` funciona.
- **QR real:** la etiqueta muestra un patrón derivado del código y enlaza a la verificación.
- **Envío de notas a Moodle:** el botón está deshabilitado (función a futuro).
- **Fondo artístico del organigrama y reporte GRI en PDF:** se mantienen los recuadros «Omitido en el prototipo».

## Pendientes por decidir (sección 15)
- Orden de los módulos: obligatorio por defecto. Se cambia con `SEQUENTIAL_MODULES` en `frontend/src/app/core/config.ts`.
- Discapacidad de Nibi: el texto ya no la fija.
- Requisito del certificado: el documento pide 600 de 1.000 PE (60 %, nota 3,4). La nota mínima aprobatoria de la escala sigue siendo 3,0.
- Shark Tank: es una capa nueva, por validar con la profe.
