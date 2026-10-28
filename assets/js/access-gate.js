// MOTOR — gate de acceso. Pide nombre/email/jefatura/whatsapp, lo manda a
// /api/ingreso (que manda los mails con Resend) y recién ahí muestra los
// módulos. Una vez que alguien entra, no se lo vuelve a pedir en este
// navegador (localStorage) — no es un login real, es captura de datos.
(function () {
  const INGRESO_ENDPOINT = "/api/ingreso";
  const STORAGE_KEY = "cedro_access_granted";

  const gate = document.getElementById("access-gate");
  const moduleList = document.getElementById("module-list");
  const form = document.getElementById("access-form");
  const feedback = document.getElementById("gate-feedback");

  function unlock() {
    gate.hidden = true;
    moduleList.hidden = false;
  }

  if (localStorage.getItem(STORAGE_KEY) === "1") {
    unlock();
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
