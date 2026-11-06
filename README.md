# GADMI Sost-Empresarial

**Gestión Organizacional Sostenible**: aplicativo web gamificado de la Universidad Autónoma de Occidente (UAO), Facultad de Ciencias Empresariales y Jurídicas.

El estudiante dirige **CACAO Raíz S.A.S.**, una empresa de chocolate del Pacífico colombiano, de 2026 a 2030. Cada año es un módulo y corresponde a una fase del proceso administrativo:

| Módulo | Fase | Retos |
|---|---|---|
| 1 | Planeación | 1.1 La brújula · 1.2 Valores que dejan huella · 1.3 FODA · 1.4 Metas e indicadores |
| 2 | Organización | 2.1 Organigrama · 2.2 Funciones · 2.3 Presupuesto de talento humano · 2.4 Grupos de interés · 2.5 Presupuesto verde |
| 3 | Dirección | 3.1 Dilemas · 3.2 Liderar en crisis · 3.3 Comunicación · 3.4 Tablero de clima |
| 4 | Control | 4.1 Tablero ESG · 4.2 Cuellos de botella · 4.3 Plan de acción · 4.4 Cerrar el círculo |

- Cada módulo vale 250 granos, 1000 en total.
- Cada reto tiene dos intentos y cuenta el mejor. Después del primer intento hay pistas; después del segundo, la solución.
- Cada módulo cierra con una bitácora reflexiva de 3 preguntas y la temporada del año.
- Al final hay una ronda de inversión y el certificado («Tu barra»), con código y QR verificables.

## Aplicativo publicado

**[PEGA AQUÍ EL ENLACE DE VERCEL](https://vercel.com)**

## Usuarios de prueba

En la pantalla de ingreso, el selector **Docente / Estudiante** llena solo estos datos:

| Rol | Correo | Contraseña |
|---|---|---|
| Estudiante | `estudiante.prueba@uao.edu.co` | `Prueba2026*` |
| Docente | `docente@uao.edu.co` | `Docente2026*` |

- El botón **«Reiniciar»**, junto a «Accesibilidad», es solo para pruebas. Borra el progreso del estudiante para empezar de cero.
- La API crea los dos usuarios al arrancar. Se configuran en `backend/.env` con `DOCENTE_*` y `DEMO_ESTUDIANTE_*`.

## Integración con Moodle

- **Ingreso:** en el curso real, el estudiante entra **directo desde Moodle, sin contraseña**, por LTI. Moodle le dice al aplicativo quién es y en qué curso y grupo está.
- **Notas:** los **granos y las notas** (escala 1 a 5) llegan al **libro de calificaciones** del curso. Mientras tanto, el panel docente exporta las notas en CSV.
- **Informe:** el estudiante descarga su **informe final en PDF**, certificado incluido, y lo **sube a una tarea del curso**. El docente verifica el código o el QR en `/verificar`.
- **Demostración:** sin Moodle se usa el **acceso de prueba** de la sección anterior. No hay registro abierto: las cuentas vienen de Moodle o las crea un administrador con `npm run crear-usuarios` (lista CSV exportada de Moodle).

## Tecnologías

| Parte | Tecnología |
|---|---|
| Aplicativo | **Angular 22** (componentes standalone, signals), TypeScript, SVG animado |
| API | Node.js 24 + Express |
| Base de datos | **Firebase Cloud Firestore**. El prototipo empezó en MySQL; `npm run migrar-mysql` pasa los datos viejos. |
| Voz y subtítulos | Gemini (voz de Teo, dictado en la bitácora, generador de subtítulos `.vtt`) |
| PDF y QR | jsPDF y qrcode |
| Publicación | Vercel (frontend y API como función) |

## Cómo ejecutarlo

Requisitos: Node.js 24 o superior y un proyecto de Firebase con Firestore (o el emulador de Firestore).

```bash
cd backend
cp .env.example .env
npm install
npm start
```

- Pon en `.env` la clave de la cuenta de servicio (`firebase-key.json` o `FIREBASE_SERVICE_ACCOUNT_JSON`) y, si quieres voz, `GEMINI_API_KEY`.
- `npm start` levanta la API en http://localhost:3000/api.

En otra terminal:

```bash
cd frontend
npm install
npm start
```

El aplicativo queda en http://localhost:4200.

Para publicar en Vercel, el repositorio ya trae `vercel.json` y `api/index.js`. En Vercel solo se configura la variable `FIREBASE_SERVICE_ACCOUNT_JSON` y, opcionalmente, `GEMINI_API_KEY`.

**Comandos útiles (en `backend/`):**
- `npm run crear-usuarios -- estudiantes lista.csv`: crea cuentas desde un CSV con las columnas `nombre;codigo;correo;grupo;password`.
- `npm run subtitulos -- video.mp4 salida.vtt`: genera los subtítulos de un video. De ese mismo archivo sale la transcripción.

## Estructura

```
frontend/   Angular. Pantallas en src/app/pages, retos en src/app/retos (contenido en retos/data/*.json)
backend/    API Express + Firestore (src/), scripts de administración (scripts/)
api/        Entrada de la API para Vercel
diseno/     Editables: mapa-ruta.svg, personajes y pantallas exportadas del prototipo
```

## Accesibilidad (WCAG 2.2 AA)

- Menú de accesibilidad: subtítulos, voz, texto grande, alto contraste y menos movimiento.
- Videos con subtítulos `.vtt` y transcripción.
- Todo se maneja con teclado.
- Se respeta `prefers-reduced-motion`.
- Contraste AA.

## Licencia y créditos

- Licencia **CC BY-NC-SA 4.0**: ver [LICENSE](LICENSE). El logo de la UAO es marca institucional y queda fuera de esta licencia.
- **Contenido académico:** Profa. Ana Judith Paredes Chacín.
- **Fuentes:** DM Sans y Baloo 2 (Google Fonts, licencia SIL OFL 1.1).
- **Personajes, mapa e ilustraciones:** equipo del proyecto.
- Los créditos completos están en el aplicativo, en el enlace **«Créditos y licencia»** del pie de página.
