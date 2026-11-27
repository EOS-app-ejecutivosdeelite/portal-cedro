// MOTOR — gate de acceso. Pide nombre/email/jefatura/whatsapp, lo manda a
// /api/ingreso (que manda los mails con Resend) y recién ahí muestra los
// módulos. Una vez que alguien entra, no se lo vuelve a pedir en este
// navegador (localStorage) — no es un login real, es captura de datos.
(function () {
  const INGRESO_ENDPOINT = "/api/ingreso";
  const STORAGE_KEY = "cedro_access_granted";
  // Inscripciones cerradas (Jere, 27/11/2026). Con false no se muestra el
  // formulario sino el aviso de cierre; quien ya entró en este navegador sigue
  // entrando. Para reabrir, poner true (y lo mismo en api/ingreso.js).
  const INSCRIPCIONES_ABIERTAS = false;

  const gate = document.getElementById("access-gate");
  const moduleList = document.getElementById("module-list");
  const form = document.getElementById("access-form");
  const feedback = document.getElementById("gate-feedback");
  const closed = document.getElementById("gate-closed");

  function unlock() {
    gate.hidden = true;
    moduleList.hidden = false;
  }

  if (localStorage.getItem(STORAGE_KEY) === "1") {
    unlock();
    return;
  }

  if (!INSCRIPCIONES_ABIERTAS) {
    form.hidden = true;
    closed.hidden = false;
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector(".gate-submit");
    const originalText = submitBtn.textContent;

    const data = {
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim(),
      jefatura: form.jefatura.value.trim(),
      whatsapp: form.whatsapp.value.trim(),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";
    feedback.textContent = "";

    try {
      const resp = await fetch(INGRESO_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!resp.ok) throw new Error("Respuesta no OK: " + resp.status);

      localStorage.setItem(STORAGE_KEY, "1");
      unlock();
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      feedback.textContent = "No pudimos procesar el ingreso. Probá de nuevo.";
      console.error("Webhook error:", err);
    }
  });
})();
