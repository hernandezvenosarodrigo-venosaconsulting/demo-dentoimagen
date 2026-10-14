/* Dento Imagen Nvo. Vallarta · interacción y animaciones */
(function () {
  "use strict";

  /* ---------- Configuración (editar aquí) ---------- */
  var CONFIG = {
    whatsapp: "523223725097",
    ga4: "",            // ID de Google Analytics 4, p. ej. "G-XXXXXXX". Vacío = desactivado
    formEndpoint: "",   // URL de Formspree / Getform / backend propio para recibir el formulario por correo. Vacío = solo WhatsApp
    email: "dra_sonia@dentoimagen.com.mx",
    timeZone: "America/Bahia_Banderas",
    hours: [[10, 14], [16, 20]],   // lunes a viernes
    days: [1, 2, 3, 4, 5]
  };

  var lang = document.documentElement.lang === "en" ? "en" : "es";
  var T = {
    es: {
      wa: "Hola, quisiera agendar una cita en Dento Imagen Nvo. Vallarta",
      ortho: "Hola, quisiera una valoración de ortodoncia en Dento Imagen Nvo. Vallarta",
      clean: "Hola, quisiera agendar una limpieza en Dento Imagen Nvo. Vallarta",
      svc: "Hola, quisiera información sobre {s} en Dento Imagen Nvo. Vallarta",
      open: "Abierto ahora", closed: "Cerrado", opensAt: "abre {d} a las {h}", today: "hoy", tomorrow: "mañana", monday: "el lunes",
      closesAt: "cierra a las {h}",
      other: "Otro / no estoy seguro",
      formWa: "Hola, soy {name}. Quisiera agendar una cita en Dento Imagen Nvo. Vallarta.\n• Servicio: {service}\n• Fecha preferida: {date}\n• Teléfono: {phone}\n• Correo: {email}\n{message}",
      noDate: "por definir",
      formOk: "¡Listo! Abrimos WhatsApp con tu mensaje. ¿Prefieres correo? <a href=\"{mailto}\">Envíalo por correo aquí</a>.",
      formErr: "Por favor escribe tu nombre y tu teléfono.",
      subject: "Solicitud de cita — Dento Imagen"
    },
    en: {
      wa: "Hi, I'd like to book an appointment at Dento Imagen Nvo. Vallarta",
      ortho: "Hi, I'd like an orthodontic assessment at Dento Imagen Nvo. Vallarta",
      clean: "Hi, I'd like to book a dental cleaning at Dento Imagen Nvo. Vallarta",
      svc: "Hi, I'd like information about {s} at Dento Imagen Nvo. Vallarta",
      open: "Open now", closed: "Closed", opensAt: "opens {d} at {h}", today: "today", tomorrow: "tomorrow", monday: "on Monday",
      closesAt: "closes at {h}",
      other: "Other / not sure",
      formWa: "Hi, I'm {name}. I'd like to book an appointment at Dento Imagen Nvo. Vallarta.\n• Service: {service}\n• Preferred date: {date}\n• Phone: {phone}\n• Email: {email}\n{message}",
      noDate: "flexible",
      formOk: "Done! WhatsApp is open with your message. Prefer email? <a href=\"{mailto}\">Send it by email here</a>.",
      formErr: "Please enter your name and phone number.",
      subject: "Appointment request — Dento Imagen"
    }
  }[lang];
  var fill = function (s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k] != null ? o[k] : ""; }); };
  var waUrl = function (text) { return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text); };

  /* ---------- Idioma: guardar preferencia ---------- */
  try { localStorage.setItem("di-lang", lang); } catch (e) {}
  document.querySelectorAll(".lang a").forEach(function (a) {
    a.addEventListener("click", function () {
      try { localStorage.setItem("di-lang", a.dataset.lang); } catch (e) {}
      if (location.hash) a.href = a.getAttribute("href") + location.hash;
    });
  });

  /* ---------- Analítica (GA4 opcional) ---------- */
  window.dataLayer = window.dataLayer || [];
  function track(name, params) {
    window.dataLayer.push(Object.assign({ event: name }, params || {}));
    if (window.gtag) window.gtag("event", name, params || {});
  }
  if (CONFIG.ga4) {
    var g = document.createElement("script");
    g.async = true; g.src = "https://www.googletagmanager.com/gtag/js?id=" + CONFIG.ga4;
    document.head.appendChild(g);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date()); window.gtag("config", CONFIG.ga4);
  }

  /* ---------- Enlaces de WhatsApp ---------- */
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = waUrl(T[a.dataset.waMsg] || T.wa);
    a.target = "_blank"; a.rel = "noopener";
    a.addEventListener("click", function () { track("whatsapp_click", { location: a.className || "link", language: lang }); });
  });
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
    a.addEventListener("click", function () { track("phone_click", { language: lang }); });
  });

  /* ---------- Abierto ahora / Cerrado ---------- */
  function clinicNow() {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: CONFIG.timeZone, weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday);
    return { day: day, mins: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
  }
  function hh(h) { return (lang === "en" ? (h > 12 ? h - 12 + " pm" : h + (h === 12 ? " pm" : " am")) : h + ":00"); }
  function status() {
    var n = clinicNow(), workday = CONFIG.days.indexOf(n.day) > -1, txt, open = false;
    if (workday) {
      for (var i = 0; i < CONFIG.hours.length; i++) {
        var r = CONFIG.hours[i];
        if (n.mins >= r[0] * 60 && n.mins < r[1] * 60) { open = true; txt = T.open + " · " + fill(T.closesAt, { h: hh(r[1]) }); break; }
      }
      if (!open) {
        var next = CONFIG.hours.filter(function (r) { return n.mins < r[0] * 60; })[0];
        if (next) txt = T.closed + " · " + fill(T.opensAt, { d: T.today, h: hh(next[0]) });
      }
    }
    if (!txt) {
      var d = n.day === 5 || n.day === 6 ? T.monday : T.tomorrow;
      if (n.day === 0) d = T.tomorrow;
      txt = T.closed + " · " + fill(T.opensAt, { d: d, h: hh(CONFIG.hours[0][0]) });
    }
    document.querySelectorAll(".js-status").forEach(function (el) {
      el.classList.toggle("is-open", open);
      var t = el.querySelector(".js-status-txt"); if (t) t.textContent = txt;
    });
  }
  status(); setInterval(status, 60000);

  /* ---------- Barra superior y menú móvil ---------- */
  var hdr = document.getElementById("hdr"), body = document.body, burger = document.getElementById("burger");
  addEventListener("scroll", function () { hdr.classList.toggle("solid", scrollY > 30); }, { passive: true });
  hdr.classList.toggle("solid", scrollY > 30);
  function menu(open) {
    body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  }
  burger.addEventListener("click", function () { menu(!body.classList.contains("menu-open")); });
  document.querySelectorAll(".mmenu a").forEach(function (a) { a.addEventListener("click", function () { menu(false); }); });
  addEventListener("keydown", function (e) { if (e.key === "Escape") { menu(false); closeLb(); } });

  /* ---------- Servicios: panel con la descripción ---------- */
  var panel = document.getElementById("panel"), svcSel = document.getElementById("serviceSel");
  var svcs = document.querySelectorAll(".svc");
  svcs.forEach(function (b) {
    var name = b.querySelector("h3").textContent;
    svcSel.insertAdjacentHTML("beforeend", "<option>" + name + "</option>");
    b.addEventListener("click", function () {
      document.getElementById("panelTitle").textContent = name;
      document.getElementById("panelBody").innerHTML = b.querySelector(".full").innerHTML;
      var img = b.querySelector("img"); document.getElementById("panelImg").src = img.src;
      var wa = document.getElementById("panelWa");
      wa.href = waUrl(fill(T.svc, { s: name.toLowerCase() })); wa.target = "_blank"; wa.rel = "noopener";
      wa.onclick = function () { track("whatsapp_click", { location: "service_panel", service: b.dataset.svc, language: lang }); };
      if (panel.showModal) panel.showModal(); else panel.setAttribute("open", "");
      track("service_open", { service: b.dataset.svc });
    });
  });
  svcSel.insertAdjacentHTML("beforeend", "<option>" + T.other + "</option>");
  document.getElementById("panelClose").addEventListener("click", function () { panel.close(); });
  panel.addEventListener("click", function (e) { if (e.target === panel) panel.close(); });

  /* ---------- Galería con View Transitions ---------- */
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lb = document.getElementById("lightbox"), lbImg = lb.querySelector("img"), lastImg = null;
  function vt(fn) { if (document.startViewTransition && !reduced) document.startViewTransition(fn); else fn(); }
  document.querySelectorAll("#mosaic button").forEach(function (b) {
    b.addEventListener("click", function () {
      var img = b.querySelector("img"); lastImg = img; img.style.viewTransitionName = "pic";
      vt(function () { img.style.viewTransitionName = ""; lbImg.src = img.src; lbImg.alt = img.alt; lbImg.style.viewTransitionName = "pic"; lb.classList.add("open"); });
    });
  });
  function closeLb() {
    if (!lb.classList.contains("open")) return;
    vt(function () { lbImg.style.viewTransitionName = ""; lb.classList.remove("open"); if (lastImg) lastImg.style.viewTransitionName = "pic"; });
    setTimeout(function () { if (lastImg) lastImg.style.viewTransitionName = ""; }, 600);
  }
  lb.addEventListener("click", closeLb);

  /* ---------- Antes / después ---------- */
  var cmp = document.getElementById("compare"), rng = cmp.querySelector("input");
  rng.addEventListener("input", function () { cmp.style.setProperty("--pos", rng.value + "%"); });

  /* ---------- Carrusel de reseñas ---------- */
  var track_ = document.getElementById("revTrack");
  var step = function (dir) { var c = track_.querySelector(".rev"); track_.scrollBy({ left: dir * (c.offsetWidth + 20), behavior: reduced ? "auto" : "smooth" }); };
  document.getElementById("revPrev").addEventListener("click", function () { step(-1); });
  document.getElementById("revNext").addEventListener("click", function () { step(1); });

  /* ---------- Formulario → WhatsApp (+ correo) ---------- */
  var form = document.getElementById("bookForm"), ok = document.getElementById("formOk");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = Object.fromEntries(new FormData(form));
    if (!d.name.trim() || !d.phone.trim()) { ok.textContent = T.formErr; ok.classList.add("show"); form.querySelector(d.name.trim() ? "[name=phone]" : "[name=name]").focus(); return; }
    var text = fill(T.formWa, { name: d.name.trim(), service: d.service, date: d.date || T.noDate, phone: d.phone, email: d.email || "—", message: d.message ? "\n" + d.message : "" });
    window.open(waUrl(text), "_blank", "noopener");
    var mailto = "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent(T.subject) + "&body=" + encodeURIComponent(text);
    if (CONFIG.formEndpoint) {
      fetch(CONFIG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(Object.assign({ _subject: T.subject, language: lang }, d)) }).catch(function () {});
    }
    ok.innerHTML = fill(T.formOk, { mailto: mailto }); ok.classList.add("show");
    track("generate_lead", { method: "whatsapp_form", service: d.service, language: lang });
  });

  /* ---------- Animaciones (GSAP + ScrollTrigger + Lenis) ---------- */
  if (reduced || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    var lenis = new Lenis({ lerp: 0.1 }); window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href"); if (id.length < 2 || !document.querySelector(id)) return;
        e.preventDefault(); lenis.scrollTo(id, { offset: -80 }); history.replaceState(null, "", id);
      });
    });
    // Al abrir con #sección: posición absoluta (Lenis calcula mal si el navegador ya saltó)
    var goHash = function () {
      var el = location.hash && document.querySelector(location.hash); if (!el) return;
      lenis.scrollTo(el.getBoundingClientRect().top + window.scrollY - 80, { immediate: true, force: true });
    };
    if (document.readyState === "complete") goHash(); else addEventListener("load", function () { setTimeout(goHash, 0); });
  }

  var bar = document.createElement("div"); bar.className = "progress"; document.body.appendChild(bar);
  gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });

  // Hero: título palabra por palabra + zoom lento
  var h1 = document.getElementById("heroTitle");
  (function split(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
          var s = document.createElement("span"); s.className = "w"; s.textContent = w; frag.appendChild(s);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) {
        // palabra resaltada: se anima entera y arrastra la puntuación que la sigue ("tú,")
        var w = document.createElement("span"); w.className = "w";
        n.parentNode.insertBefore(w, n); w.appendChild(n);
        var nx = w.nextSibling, m = nx && nx.nodeType === 3 && nx.textContent.match(/^[,.;:!?]+/);
        if (m) { w.appendChild(document.createTextNode(m[0])); nx.textContent = nx.textContent.slice(m[0].length); }
      }
    });
  })(h1);
  gsap.from("#heroTitle .w", { y: 40, opacity: 0, rotate: 3, duration: .7, stagger: .05, ease: "power3.out", delay: .1 });
  gsap.from(".hero .badge, .hero .lead, .hero .ctas, .hero .minis", { y: 24, opacity: 0, duration: .8, stagger: .1, delay: .55, ease: "power2.out" });
  gsap.fromTo(".hero-img img", { scale: 1.15 }, { scale: 1, duration: 8, ease: "power1.out" });
  gsap.from(".float", { scale: .6, opacity: 0, duration: .8, stagger: .15, delay: 1, ease: "back.out(2)" });

  // Títulos y bloques
  gsap.utils.toArray(".eyebrow, h2, .lead").forEach(function (el) {
    if (el.closest(".hero")) return;
    gsap.from(el, { y: 30, opacity: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  // Tarjetas escalonadas
  [".why-grid .feat", ".svc-grid .svc", ".team-grid .member", ".rev-track .rev", "#mosaic button"].forEach(function (sel) {
    var items = gsap.utils.toArray(sel); if (!items.length) return;
    ScrollTrigger.batch(items, {
      start: "top 90%", once: true,
      onEnter: function (b) { gsap.fromTo(b, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .09, ease: "power3.out", overwrite: true }); }
    });
    gsap.set(items, { opacity: 0 });
  });

  // Contadores
  document.querySelectorAll(".count").forEach(function (el) {
    var o = { v: 0 }, to = +el.dataset.to, dec = +(el.dataset.dec || 0), pre = el.dataset.pre || "";
    gsap.to(o, { v: to, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%" },
      onUpdate: function () { el.textContent = pre + o.v.toFixed(dec); } });
  });

  // Bloque de tecnología
  gsap.from(".tech", { y: 60, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".tech", start: "top 85%" } });

  // Ortodoncia: parallax
  gsap.to("#orthoBg", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".ortho", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.fromTo("#orthoCard", { yPercent: 30, rotate: 4 }, { yPercent: -20, rotate: -3, ease: "none", scrollTrigger: { trigger: ".ortho", start: "top bottom", end: "bottom top", scrub: true } });

  // Higiene, antes/después, mapa y formulario
  gsap.from(".hyg-box", { y: 60, opacity: 0, scale: .97, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".hyg-box", start: "top 85%" } });
  gsap.fromTo("#compare", { clipPath: "inset(0 100% 0 0 round 20px)" }, { clipPath: "inset(0 0% 0 0 round 20px)", duration: 1.3, ease: "power3.inOut", scrollTrigger: { trigger: "#compare", start: "top 80%" } });
  [".map", ".form"].forEach(function (sel) { gsap.from(sel, { y: 50, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: sel, start: "top 85%" } }); });

  addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
