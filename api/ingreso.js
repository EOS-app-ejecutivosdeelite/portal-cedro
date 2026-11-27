// MOTOR — recibe el formulario de acceso, manda los mails con Resend
// (bienvenida + aviso a Lucas) y manda el lead a Meta Conversions API
// (mismo pixel que usa el resto del negocio). Las credenciales viven en
// Vercel (RESEND_API_KEY, META_ACCESS_TOKEN), nunca en el código.

const crypto = require("crypto");

// Inscripciones cerradas (Jere, 27/11/2026). Con false, /api/ingreso responde
// 403 antes de leer el body: no manda correos ni el evento a Meta. Para
// reabrir, poner true (y lo mismo en assets/js/access-gate.js).
const INSCRIPCIONES_ABIERTAS = false;

const FROM = "Academia de Elite <capacitacion@send.ejecutivosdeelite.com>";
const NOTIFY_TO = "lucas@lucasalbo.com";
const META_PIXEL_ID = "764837640846158";

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

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizePhone(whatsapp) {
  let p = whatsapp.replace(/\D/g, "");
  if (p.length === 9 && p.startsWith("9")) p = "56" + p;
  return p.length >= 10 ? p : null;
}

async function sendMetaLead({ nombre, email, whatsapp }) {
  if (!process.env.META_ACCESS_TOKEN) return;

  const emHash = sha256(email.trim().toLowerCase());
  const eventId = `cedro-lead-${emHash.slice(0, 16)}-${new Date().toISOString().slice(0, 10)}`;

  const user_data = { em: [emHash] };
  const phone = normalizePhone(whatsapp);
  if (phone) user_data.ph = [sha256(phone)];

  const event = {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "system_generated",
    event_id: eventId,
    user_data,
  };

  const resp = await fetch(`https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: [event], access_token: process.env.META_ACCESS_TOKEN }),
  });
  if (!resp.ok) {
    console.error("Meta CAPI error:", await resp.text());
  }
}

module.exports = async function handler(req, res) {
  if (!INSCRIPCIONES_ABIERTAS) {
    res.status(403).json({ error: "Inscripciones cerradas" });
    return;
  }

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
      sendMetaLead({ nombre, email, whatsapp }).catch((err) =>
        console.error("Meta CAPI error:", err)
      ),
    ]);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo enviar el mail" });
  }
};
