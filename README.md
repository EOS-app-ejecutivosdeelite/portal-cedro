# Portal Cedro — Capacitación

Página que aloja los videos de capacitación (Loom) para Cedro, en `cedro.ejecutivosdeelite.com`.

## Cómo está dividido el trabajo

- **El motor (Claude Code):** `assets/js/modules-data.js` (la lista de módulos/videos) y
  `assets/js/app.js` (la lógica que arma la página a partir de esa lista). No se toca acá
  para cambiar el diseño.
- **El diseño (Codex):** `assets/css/style.css` y la estructura/clases de `index.html`.
  Se puede rehacer la estética libremente, pero los módulos tienen que seguir viniendo de
  `modules-data.js` — no hardcodear videos directo en el HTML.

## Agregar un módulo nuevo

Editar `assets/js/modules-data.js`: agregar un objeto al array `MODULES` con `id`, `order`,
`title` y el `loomId` (el código después de `loom.com/share/` en el link de Loom).

## Local

Abrir `index.html` en el navegador alcanza — no hay build step.

## Deploy

Vercel, conectado a este repo: cada push a `main` se despliega solo.
