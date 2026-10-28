# Portal Cedro — Capacitación

Página que aloja los videos de capacitación (Loom) para Cedro, en `cedro.ejecutivosdeelite.com`.

## Cómo está dividido el trabajo

- **El motor (Claude Code):** `assets/js/modules-data.js` (la lista de módulos/videos),
  `assets/js/app.js` (arma la página a partir de esa lista), `assets/js/access-gate.js`
  (el formulario de ingreso) y `api/ingreso.js` (función serverless que manda los mails
  con Resend). No se toca acá para cambiar el diseño.
- **El diseño (Codex):** `assets/css/style.css` y la estructura/clases de `index.html`.
  Se puede rehacer la estética libremente, pero los módulos tienen que seguir viniendo de
  `modules-data.js`, y el formulario de acceso tiene que seguir mandando los mismos 4 campos
  (`nombre`, `email`, `jefatura`, `whatsapp`) — no hardcodear videos ni sacar el gate.

## Agregar un módulo nuevo

Editar `assets/js/modules-data.js`: agregar un objeto al array `MODULES` con `id`, `order`,
`title` y el `loomId` (el código después de `loom.com/share/` en el link de Loom).

## Gate de acceso

Antes de ver los módulos, piden nombre/email/jefatura/whatsapp. Al enviar, el formulario
pega `POST /api/ingreso` (función serverless del propio proyecto, `api/ingreso.js`), que
manda dos mails con Resend: uno de bienvenida a quien se registró, y un aviso a Lucas con
los datos. La API key (`RESEND_API_KEY`) vive en Vercel → Settings → Environment
Variables, nunca en el código. El remitente verificado es `send.ejecutivosdeelite.com`.

Una vez que alguien completa el formulario, no se lo vuelve a pedir en ese navegador
(queda guardado en `localStorage`). No es autenticación real — es captura de datos +
desbloqueo, igual que el resto de las landings del negocio.

## Local

Abrir `index.html` en el navegador alcanza — no hay build step.

## Deploy

Vercel, conectado a este repo: cada push a `main` se despliega solo.
