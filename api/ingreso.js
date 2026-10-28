// MOTOR — recibe el formulario de acceso y manda los mails con Resend:
// uno de bienvenida a quien se registró, otro de aviso a Lucas con los datos.
// La API key vive en Vercel (RESEND_API_KEY), nunca en el código.

const FROM = "Academia de Elite <capacitacion@send.ejecutivosdeelite.com>";
const NOTIFY_TO = "lucas@lucasalbo.com";

async function sendEmail(payload) {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Resend error: ${resp.status} ${errText}`);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { nombre, email, jefatura, whatsapp } = req.body || {};

  if (!nombre || !email || !jefatura || !whatsapp) {
    res.status(400).json({ error: "Faltan campos" });
    return;
  }

  try {
    await Promise.all([
      sendEmail({
        from: FROM,
        to: email,
        subject: "Tu acceso al Portal de Capacitación",
        html: `
          <p>Hola ${nombre},</p>
          <p>Ya tenés acceso al portal de capacitación. Podés ver los módulos acá:</p>
          <p><a href="https://cedro.ejecutivosdeelite.com">cedro.ejecutivosdeelite.com</a></p>
        `,
      }),
      sendEmail({
        from: FROM,
        to: NOTIFY_TO,
        subject: "Nuevo ingreso — Portal Cedro",
        html: `
          <p>Nombre: ${nombre}</p>
          <p>Email: ${email}</p>
          <p>Jefatura: ${jefatura}</p>
          <p>WhatsApp: ${whatsapp}</p>
        `,
      }),
    ]);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo enviar el mail" });
  }
};
