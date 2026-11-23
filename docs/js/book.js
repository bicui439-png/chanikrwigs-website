// Booking page.
// LIVE mode: open times and booking come straight from the salon system (live.js → /api/v1/website),
//            the same engine the Calendar and Ella use.
// REQUEST mode (fallback, e.g. while the system routes aren't deployed or the system is down):
//            the customer picks a preferred time and the request is emailed to the salon (Netlify Forms).
// PREVIEW (claude.ai preview, localhost): example times, nothing is sent.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // website card key -> the salon system's service name
  const SERVICES = {
    "consultation": { name: "New wig consultation", system: "Buy Wig Consultation", step: 60, dropoff: false },
    "wash-set": { name: "Wash & Set", system: "Wash and Set", step: 30, dropoff: true },
    "repair": { name: "Repair", system: "Repair Appointment", step: 30, dropoff: false },
  };
  const FALLBACK_CLOSED_WEEKDAYS = [5, 6]; // Fri + Sat — only used when the system can't be reached
  const PHONE = "718-676-6003";

  const state = { service: null, date: null, time: null, month: null, mode: SITE.live ? "checking" : "preview" };
  const closedDays = new Map(); // "YYYY-MM-DD" -> reason (live mode)
  let lastBookable = null;
  const note = $("[data-preview-note]");

  // ---------- which mode are we in? ----------
  const ready = (async () => {
    if (!SITE.live) return;
    try {
      const list = await salonApi("/services", { timeout: 6000 });
      for (const s of list || []) {
        const key = Object.keys(SERVICES).find(k => SERVICES[k].system === s.name);
        if (key) SERVICES[key].dropoff = !!s.dropoff_required;
      }
      state.mode = "live";
      if (note) note.textContent = "Times shown are live from our salon calendar.";
    } catch {
      state.mode = "request";
      if (note) note.textContent = "Pick your preferred day and time, and we'll text you to confirm.";
    }
  })();

  // ---------- helpers ----------
  const pad = n => String(n).padStart(2, "0");
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fmtTime = m => { const h = Math.floor(m / 60), mm = pad(m % 60); return `${((h + 11) % 12) + 1}:${mm} ${h < 12 ? "AM" : "PM"}`; };
  const fmtDate = d => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const hhmmToMin = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  function addBusinessDays(d, n) { const x = new Date(d); while (n > 0) { x.setDate(x.getDate() + 1); if (!FALLBACK_CLOSED_WEEKDAYS.includes(x.getDay())) n--; } return x; }
  function addBusinessDaysBack(d, n) { const x = new Date(d); while (n > 0) { x.setDate(x.getDate() - 1); if (!FALLBACK_CLOSED_WEEKDAYS.includes(x.getDay())) n--; } return x; }
  const earliest = () => {
    if (state.mode === "live") return today; // the system decides what's still open today
    const first = addBusinessDays(today, 1);
    if (state.service !== "wash-set") return first;
    const d = new Date(first);
    while (addBusinessDaysBack(d, 3) < first) d.setDate(d.getDate() + 1);
    return d;
  };
  const latest = () => {
    if (lastBookable) return lastBookable;
    const x = new Date(today); x.setDate(x.getDate() + 60); return x;
  };
  const isClosed = d => state.mode === "live" ? closedDays.has(iso(d)) : FALLBACK_CLOSED_WEEKDAYS.includes(d.getDay());

  function showStep(n, scroll = true) {
    $$(".panel").forEach(p => p.classList.toggle("on", p.dataset.panel == n));
    $$("[data-step-label]").forEach(s => {
      s.classList.toggle("on", s.dataset.stepLabel == n);
      s.classList.toggle("done", +s.dataset.stepLabel < n);
    });
    if (scroll) $("#booking").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---------- step 1: service ----------
  function pickService(key) {
    state.service = key; state.date = null; state.time = null;
    $$(".choice").forEach(c => c.classList.toggle("sel", c.dataset.service === key));
    $("[data-dropoff]").hidden = !SERVICES[key].dropoff;
    $('[data-next="2"]').disabled = false;
  }
  $$(".choice").forEach(c => c.addEventListener("click", () => pickService(c.dataset.service)));
  const fromHash = location.hash.replace("#", "");
  if (SERVICES[fromHash]) pickService(fromHash);

  // ---------- step 2: date & time ----------
  async function loadClosedDays(monthStart) {
    if (state.mode !== "live") return;
    try {
      const res = await salonApi(`/closed-days?start=${iso(monthStart)}&days=42`);
      (res.closed || []).forEach(c => closedDays.set(c.date, c.reason));
      if (res.last_bookable_day) { const [y, m, d] = res.last_bookable_day.split("-").map(Number); lastBookable = new Date(y, m - 1, d); }
    } catch {}
  }

  async function renderMonth() {
    const m = state.month, first = new Date(m.getFullYear(), m.getMonth(), 1);
    $("[data-month-label]").textContent = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    await loadClosedDays(first < today ? today : first);
    const box = $("[data-days]"); box.innerHTML = "";
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(d => box.insertAdjacentHTML("beforeend", `<div class="dow">${d}</div>`));
    for (let i = 0; i < first.getDay(); i++) box.insertAdjacentHTML("beforeend", "<span></span>");
    const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const date = new Date(m.getFullYear(), m.getMonth(), d);
      const closed = date >= today && isClosed(date);
      const off = date < earliest() || date > latest() || closed;
      const b = document.createElement("button");
      b.className = "day"; b.disabled = off; b.innerHTML = `${d}<small>${closed ? "closed" : "&nbsp;"}</small>`;
      if (state.date && iso(state.date) === iso(date)) b.classList.add("sel");
      b.addEventListener("click", () => pickDate(date));
      box.appendChild(b);
    }
    const [prev, next] = $$("[data-month]");
    prev.disabled = m <= new Date(today.getFullYear(), today.getMonth(), 1);
    next.disabled = new Date(m.getFullYear(), m.getMonth() + 1, 1) > latest();
  }
  $$("[data-month]").forEach(b => b.addEventListener("click", () => {
    state.month = new Date(state.month.getFullYear(), state.month.getMonth() + +b.dataset.month, 1); renderMonth();
  }));

  async function getSlots(date) {
    const svc = SERVICES[state.service];
    if (state.mode === "live") {
      const res = await salonApi(`/availability?service=${encodeURIComponent(svc.system)}&date=${iso(date)}`);
      if (res.closed) return { closed: res.closed, slots: [] };
      return { slots: res.slots.map(hhmmToMin) };
    }
    // request / preview: every slot in opening hours (preview shows example gaps)
    const out = [];
    for (let m = 10 * 60; m <= 16 * 60; m += svc.step) {
      const seed = (date.getDate() * 31 + m * 7 + state.service.length * 13) % 10;
      if (state.mode === "request" || seed > 2) out.push(m);
    }
    return { slots: out };
  }

  async function pickDate(date) {
    state.date = date; state.time = null; $('[data-next="3"]').disabled = true; renderMonth();
    const box = $("[data-times]"); box.innerHTML = "<span>Loading open times&hellip;</span>";
    let res;
    try { res = await getSlots(date); }
    catch { box.innerHTML = `<span>We couldn't load times right now. Please try again, or call or WhatsApp us at ${PHONE}.</span>`; return; }
    if (res.closed) { box.innerHTML = `<span>Sorry, the ${res.closed}. Please pick another day.</span>`; return; }
    box.innerHTML = res.slots.length ? "" : "<span>No open times this day. Please pick another day.</span>";
    res.slots.forEach(m => {
      const b = document.createElement("button"); b.className = "time"; b.textContent = fmtTime(m);
      b.addEventListener("click", () => { state.time = m; $$(".time", box).forEach(x => x.classList.toggle("sel", x === b)); $('[data-next="3"]').disabled = false; });
      box.appendChild(b);
    });
  }

  // ---------- step 3: details ----------
  function dropoffLine() {
    if (!SERVICES[state.service].dropoff) return "";
    const by = addBusinessDaysBack(state.date, 3);
    const when = by < today ? "as soon as you can" : `3 business days before your appointment (by ${fmtDate(by)})`;
    return `<br><small>Please drop off your wig ${when}. You can use the mail slot in our door anytime &mdash; attach your name, phone number and instructions.</small>`;
  }
  function renderSummary() {
    const s = SERVICES[state.service];
    $("[data-summary]").innerHTML = `<b>${s.name}</b><br>${fmtDate(state.date)} at ${fmtTime(state.time)}${dropoffLine()}`;
  }

  $$("[data-next]").forEach(b => b.addEventListener("click", async () => {
    const n = +b.dataset.next;
    if (n === 2) {
      await ready;
      const e = earliest(); state.month = state.month || new Date(e.getFullYear(), e.getMonth(), 1);
      $("[data-times]").innerHTML = ""; showStep(2); renderMonth(); return;
    }
    if (n === 3) renderSummary();
    showStep(n);
  }));
  $$("[data-back]").forEach(b => b.addEventListener("click", () => showStep(+b.dataset.back)));

  function friendly(result) {
    switch (result.status) {
      case "unavailable": return "Sorry, that time was just taken. Please pick another time.";
      case "duplicate_service": return `You already have a ${SERVICES[state.service].name} appointment that day. To change it, call or WhatsApp us at ${PHONE}.`;
      case "closed": return "Sorry, the salon is closed then. Please pick another day.";
      case "in_past": return "That time has already passed. Please pick another time.";
      case "too_far_ahead": return `We book up to 2 months ahead. For a later date, call or WhatsApp us at ${PHONE}.`;
      default: return `Sorry, we couldn't book that. Please call or WhatsApp us at ${PHONE}.`;
    }
  }

  $('[data-form="booking"]').addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target, err = $("[data-err]"), data = Object.fromEntries(new FormData(f));
    const digits = (data.phone || "").replace(/\D/g, "");
    if (!data.first || !data.last) { err.textContent = "Please enter your first and last name."; return; }
    if (digits.length < 10) { err.textContent = "Please enter a valid mobile number."; return; }
    if (!data.heard_from) { err.textContent = "Please tell us how you heard about us."; return; }
    err.textContent = "";
    const svc = SERVICES[state.service];
    const btn = $('button[type="submit"]', f); btn.disabled = true;
    const when = `${fmtDate(state.date)} at ${fmtTime(state.time)}`;
    try {
      if (state.mode === "live") {
        const result = await salonApi("/book", { body: {
          service: svc.system,
          datetime: `${iso(state.date)}T${pad(Math.floor(state.time / 60))}:${pad(state.time % 60)}`,
          first_name: data.first, last_name: data.last, phone: data.phone,
          email: data.email || null,
          // until the system stores the promotions choice itself, it also rides in the note
          notes: [data.notes, data.promos === "yes" ? "Wants promotions: YES" : ""].filter(Boolean).join(" | ") || null,
          heard_from: data.heard_from,
          sms_consent: true,                       // appointment & customer-care texts always go out
          marketing_opt_in: data.promos === "yes", // the only real choice on the form
          website: data.website || null,
        } });
        if (!result.success) {
          err.textContent = friendly(result);
          if (result.status === "unavailable") { showStep(2); pickDate(state.date); }
          return;
        }
        $("[data-done-text]").innerHTML = `You're booked for <b>${svc.name}</b> on <b>${when}</b>.` +
          " We'll text you a confirmation." + dropoffLine();
      } else {
        const r = await sendForm("booking-request", { service: svc.name, date: iso(state.date), time: fmtTime(state.time),
          first: data.first, last: data.last, phone: data.phone, email: data.email || "", notes: data.notes || "",
          heard_from: data.heard_from, promotions: data.promos === "yes" ? "YES" : "no" });
        $("[data-done-text]").textContent = r.preview
          ? `Preview only: nothing was sent. On the live site, this books ${svc.name} on ${when} straight into the salon calendar.`
          : `We received your request for ${svc.name} on ${when}. We'll text you to confirm.`;
      }
      showStep(4);
    } catch (ex) {
      err.textContent = ex && ex.status === 429
        ? "Too many tries — please wait a minute and try again."
        : `Sorry, that didn't go through. Please call or WhatsApp us at ${PHONE}.`;
    } finally { btn.disabled = false; }
  });

  showStep(1, false);
})();
