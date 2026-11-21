// Shared behaviour for every page.
// SITE.live = false while the site is a preview: forms show a notice instead of sending.
window.SITE = window.SITE || {
  // forms only send for real on the hosted site; everywhere else (previews) they show a notice
  live: /(^|\.)chanikrwigs\.com$|\.netlify\.app$|\.github\.io$/.test(location.hostname),
  // Web3Forms access key (free form service, emails submissions to chani@chanikrwigs.com).
  // It is meant to be public: it can only send to that inbox.
  formKey: "",
};

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // year
  $$("[data-year]").forEach(e => (e.textContent = new Date().getFullYear()));

  // mobile menu
  const toggle = $(".menu-toggle"), nav = $("#nav");
  if (toggle) toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });

  // visit popup
  const modal = $("#visit");
  const openModal = e => { e && e.preventDefault(); modal.classList.add("open"); nav && nav.classList.remove("open"); };
  const closeModal = () => modal.classList.remove("open");
  $$("[data-open-visit]").forEach(a => a.addEventListener("click", openModal));
  if (modal) {
    $(".close", modal).addEventListener("click", closeModal);
    modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
  }

  // looks carousel
  $$("[data-carousel]").forEach(c => {
    const strip = $(".strip", c), items = $$(".look", c);
    let i = 0;
    const perView = () => (innerWidth <= 560 ? 2 : innerWidth <= 1000 ? 3 : 5);
    const go = n => {
      const max = Math.max(0, items.length - perView());
      i = n < 0 ? max : n > max ? 0 : n;
      const w = items[0].getBoundingClientRect().width + 12;
      strip.style.transform = `translateX(${-i * w}px)`;
    };
    $(".prev", c).addEventListener("click", () => go(i - 1));
    $(".next", c).addEventListener("click", () => go(i + 1));
    addEventListener("resize", () => go(i));
    let t = setInterval(() => go(i + 1), 4000);
    c.addEventListener("mouseenter", () => clearInterval(t));
    c.addEventListener("mouseleave", () => (t = setInterval(() => go(i + 1), 4000)));
  });

  // testimonials
  $$("[data-testimonials]").forEach(s => {
    const items = $$(".testimonial", s);
    let i = 0;
    const show = n => { items[i].classList.remove("on"); i = (n + items.length) % items.length; items[i].classList.add("on"); };
    $(".prev", s).addEventListener("click", () => show(i - 1));
    $(".next", s).addEventListener("click", () => show(i + 1));
    setInterval(() => show(i + 1), 7000);
  });

  // counters
  const counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || "", t0 = performance.now();
      const step = now => {
        const p = Math.min(1, (now - t0) / 1600), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = v.toLocaleString("en-US") + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), { threshold: 0.4 });
    counters.forEach(c => io.observe(c));
  } else counters.forEach(c => (c.textContent = (+c.dataset.count).toLocaleString("en-US") + (c.dataset.suffix || "")));

  // contact forms
  window.sendForm = async function (name, data) {
    if (!SITE.live) return { preview: true };
    const subject = { "contact": "Website message - Chani Kramer Wigs", "booking-request": "New booking request - Chani Kramer Wigs" }[name];
    const { website, ...fields } = data;            // honeypot: bots fill "website"
    if (website) return { ok: true };
    let r;
    if (SITE.formKey) {
      r = await fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: SITE.formKey, subject, from_name: "chanikrwigs.com", form: name, ...fields }),
      });
    } else { // Netlify Forms (only works while the site is hosted on Netlify)
      const body = new URLSearchParams({ "form-name": name, subject, ...fields }).toString();
      r = await fetch("/__forms.html", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
    }
    if (!r.ok) throw new Error("send failed");
    return { ok: true };
  };

  $$('[data-form="contact"]').forEach(f => f.addEventListener("submit", async e => {
    e.preventDefault();
    const note = $(".note", f);
    const data = Object.fromEntries(new FormData(f));
    if (!data.name || !data.phone || !data.message) { note.textContent = "Please fill in your name, phone and message."; return; }
    try {
      const r = await sendForm("contact", data);
      note.textContent = r.preview
        ? "Preview only: this message was not sent. On the live site it goes to the salon."
        : "Thank you! We'll get back to you soon.";
      if (!r.preview) f.reset();
    } catch {
      note.textContent = "Sorry, that didn't go through. Please call or WhatsApp us at 718-676-6003.";
    }
  }));
})();
