import emailjs from "@emailjs/browser";

const EMAILJS_CONFIG = {
  serviceId: "service_8jn6y5r",
  templateId: "template_s4fyv79",
  templateReplyId: "template_uqont8f",
  publicKey: "cl53ezM2SDAFK6NOz",
};

const validators = {
  user_name: (v) => {
    if (!v.trim()) return "El nombre es obligatorio";
    if (v.trim().length < 2) return "Mínimo 2 caracteres";
    return null;
  },
  user_email: (v) => {
    if (!v.trim()) return "El correo es obligatorio";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Correo inválido";
    return null;
  },
  service_interest: (v) => {
    if (!v) return "Selecciona un servicio";
    return null;
  },
  message: (v) => {
    if (!v.trim()) return "El mensaje es obligatorio";
    if (v.trim().length < 10) return "Mínimo 10 caracteres";
    return null;
  },
};

const form = document.getElementById("contactForm");
if (form) {
  emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });

  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn?.querySelector(".btn-text");
  const btnLoader = submitBtn?.querySelector(".btn-loader");
  const btnDone = submitBtn?.querySelector(".btn-success-text");
  const btnArrow = submitBtn?.querySelector(".btn-send__icon");
  const formStatus = document.getElementById("formStatus");

  function showFieldError(name, msg) {
    const err = document.getElementById("error-" + name);
    const inp = form.querySelector('[name="' + name + '"]');
    if (err) err.textContent = msg || "";
    if (inp) {
      inp.classList.toggle("input-error", !!msg);
      inp.classList.toggle("input-valid", !msg && inp.value.trim() !== "");
    }
  }

  form.querySelectorAll("input, select, textarea").forEach((el) => {
    if (el.name === "bot_field") return;
    el.addEventListener("blur", () => {
      if (!validators[el.name]) return;
      showFieldError(el.name, validators[el.name](el.value));
    });
    el.addEventListener("input", () => {
      if (el.classList.contains("input-error") && validators[el.name]) {
        const err = validators[el.name](el.value);
        if (!err) showFieldError(el.name, null);
      }
    });
  });

  function validateAll() {
    let valid = true;
    Object.keys(validators).forEach((name) => {
      const el = form.querySelector('[name="' + name + '"]');
      const err = el ? validators[name](el.value) : null;
      showFieldError(name, err);
      if (err) valid = false;
    });
    return valid;
  }

  function setBtn(state) {
    if (!submitBtn) return;
    submitBtn.disabled = state === "loading" || state === "success";
    if (btnText) btnText.hidden = state === "loading" || state === "success";
    if (btnLoader) btnLoader.hidden = state !== "loading";
    if (btnDone) btnDone.hidden = state !== "success";
    if (btnArrow) btnArrow.hidden = state === "loading" || state === "success";
    submitBtn.dataset.state = state;
  }

  function showStatus(type, msg) {
    if (!formStatus) return;
    formStatus.textContent = msg;
    formStatus.className = "form-status form-status--" + type + " visible";
    setTimeout(() => formStatus.classList.remove("visible"), 8000);
  }

  function isBot() {
    return form.querySelector('[name="bot_field"]')?.value !== "";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isBot()) return;

    if (!validateAll()) {
      const firstErr = form.querySelector(".input-error");
      firstErr?.scrollIntoView({ behavior: "smooth", block: "center" });
      firstErr?.focus();
      return;
    }

    setBtn("loading");

    try {
      const payload = {
        user_name: form.querySelector('[name="user_name"]').value,
        user_email: form.querySelector('[name="user_email"]').value,
        user_phone: form.querySelector('[name="user_phone"]').value,
        user_company: form.querySelector('[name="user_company"]').value,
        service_interest: form.querySelector('[name="service_interest"]').value,
        message: form.querySelector('[name="message"]').value,
      };

      await Promise.all([
        emailjs.sendForm(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, form),
        emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateReplyId, payload),
      ]);

      setBtn("success");
      showStatus("success", "¡Mensaje enviado! Te contactaremos pronto.");

      setTimeout(() => {
        form.reset();
        form.querySelectorAll(".input-valid, .input-error").forEach((el) => {
          el.classList.remove("input-valid", "input-error");
        });
        setBtn("idle");
      }, 3000);
    } catch (err) {
      setBtn("error");
      let msg = "Error al enviar. Intenta nuevamente.";
      if (err.status === 400) msg = "Error de configuración. Contacta al admin.";
      if (err.status === 429) msg = "Demasiados intentos. Espera unos minutos.";
      if (!navigator.onLine) msg = "Sin conexión a internet.";
      showStatus("error", msg);
      setTimeout(() => setBtn("idle"), 5000);
    }
  });
}
