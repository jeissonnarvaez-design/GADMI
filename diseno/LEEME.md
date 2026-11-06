# Editables de diseño · GADMI Sost-Empresarial

Licencia: CC BY-NC-SA 4.0 (ver `../LICENSE`).

| Carpeta | Contenido |
|---|---|
| `mapa/mapa-ruta.svg` | Mapa de la Ruta (1800 × 1200) con capas por id: `fondo`, `Composta`, `Arboles`, `planta-mala`/`planta-buena` (con `Paneles`), `sala-mala`/`sala-buena` (con `Bandera`), `mercado-mala`/`mercado-buena`, `finca-mala`/`finca-buena`. El aplicativo muestra u oculta cada capa según el año y las decisiones. |
| `personajes/app/` | Personajes tal como los usa el aplicativo: SVG con partes etiquetadas (`pj-ojo`, `pj-pupila`, `pj-ceja`, `pj-brazo-izq`, `pj-boca`…) que se animan con CSS. |
| `personajes/originales/` | Archivos fuente del equipo: Teo, Nibi, Chispa e inversionistas (Laura, Andrés, Klaus), en SVG y PNG. |
| `pantallas/` | Las 35 pantallas del prototipo final exportadas en PNG (1280 × 800/900). |
| `prototipo/` | Prototipo final completo e interactivo: ábrelo en el navegador. |

Para cambiar el mapa o un personaje: edita el SVG (Affinity, Illustrator o Inkscape) **conservando los id y las clases** de las capas, y cópialo a `frontend/public/assets/mapa/` o `frontend/public/assets/personajes/`.
