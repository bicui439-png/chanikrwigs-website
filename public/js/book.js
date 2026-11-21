// Booking page.
// getAvailability() and createBooking() are the two places that will talk to the salon system
// once Ofir provides an endpoint. Until then: preview shows example times; live mode sends a
// booking request to the salon (front desk) instead of a confirmed booking.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const SERVICES = {
    "consultation": { name: "New wig consultation", step: 60, dropoff: false },
    "wash-set": { name: "Wash & Set", step: 30, dropoff: true },
    "reset": { name: "Reset", step: 30, dropoff: false },
    "repair": { name: "Repair / other", step: 30, dropoff: false },
  };
  const CLOSED_WEEKDAYS = [6]; // Saturday - example only; live hours come from the system calendar

  const state = { service: null, date: null, time: null, month: null };
  const note = $("[data-preview-note]");
  // Until the salon system is connected, the live site takes booking REQUESTS: the customer picks
  // a preferred time and the front desk confirms by text.
  const REQUEST_MODE = true;
  if (SITE.live && note) note.textContent = "Pick your preferred day and time, and we'll text you to confirm.";

  // ---------- system connection points ----------
  async function getAvailability(service, date) {
    // LIVE: return await fetch(`/api/availability?service=${service}&date=${iso(date)}`).then(r => r.json());
    const step = SERVICES[service].step, out = [];
    for (let m = 10 * 60; m <= 17 * 60 + 30; m += step) {
      const seed = (date.getDate() * 31 + m * 7 + service.length * 13) % 10;
      if ((SITE.live && REQUEST_MODE) || seed > 2) out.push(m); // preview shows example gaps
    }
    return out;
  }
  async function createBooking(payload) {
    // LIVE (after Ofir's API): POST /api/book -> appointment created in the salon system.
    return sendForm("booking-request", payload);
  }

  // ---------- helpers ----------
  const iso = d => d.toISOString().slice(0, 10);
  const fmtTime = m => { const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, "0"); return `${((h + 11) % 12) + 1}:${mm} ${h < 12 ? "AM" : "PM"}`; };
  const fmtDate = d => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  function addBusinessDays(d, n) { const x = new Date(d); while (n > 0) { x.setDate(x.getDate() + 1); if (x.getDay() !== 6) n--; } return x; }
  const earliest = () => {
    const first = addBusinessDays(today, 1);
    if (state.service !== "wash-set") return first;
    // the wig must be dropped off 3 business days before - earliest drop-off is tomorrow
    const d = new Date(first);
    while (addBusinessDaysBack(d, 3) < first) d.setDate(d.getDate() + 1);
    return d;
  };
  const latest = () => { const x = new Date(today); x.setDate(x.getDate() + 60); return x; };

  function showStep(n, scroll = true) {
    $$(".panel").forEach(p => p.classList.toggle("on", p.dataset.panel == n));
    $$("[data-step-label]").forEach(s => {
      s.classList.toggle("on", s.dataset.stepLabel == n);
      s.classList.toggle("done", +s.dataset.stepLabel < n);
    });
    if (scroll) $("#booking").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---------- step 1 ----------
  function pickService(key) {
    state.service = key; state.date = null; state.time = null;
    $$(".choice").forEach(c => c.classList.toggle("sel", c.dataset.service === key));
    $("[data-dropoff]").hidden = !SERVICES[key].dropoff;
    $('[data-next="2"]').disabled = false;
  }
  $$(".choice").forEach(c => c.addEventListener("click", () => pickService(c.dataset.service)));
  const fromHash = location.hash.replace("#", "");
  if (SERVICES[fromHash]) pickService(fromHash);

  // ---------- step 2 ----------
  function renderMonth() {
    const m = state.month, first = new Date(m.getFullYear(), m.getMonth(), 1);
    $("[data-month-label]").textContent = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const box = $("[data-days]"); box.innerHTML = "";
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(d => box.insertAdjacentHTML("beforeend", `<div class="dow">${d}</div>`));
    for (let i = 0; i < first.getDay(); i++) box.insertAdjacentHTML("beforeend", "<span></span>");
    const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const date = new Date(m.getFullYear(), m.getMonth(), d);
      const off = date < earliest() || date > latest() || CLOSED_WEEKDAYS.includes(date.getDay());
      const b = document.createElement("button");
      b.className = "day"; b.disabled = off; b.innerHTML = `${d}<small>${off && date >= today && CLOSED_WEEKDAYS.includes(date.getDay()) ? "closed" : "&nbsp;"}</small>`;
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
  async function pickDate(date) {
    state.date = date; state.time = null; $('[data-next="3"]').disabled = true; renderMonth();
    const box = $("[data-times]"); box.innerHTML = "<span>Loading times&hellip;</span>";
    const slots = await getAvailability(state.service, date);
    box.innerHTML = slots.length ? "" : "<span>No open times this day. Please pick another day.</span>";
    slots.forEach(m => {
      const b = document.createElement("button"); b.className = "time"; b.textContent = fmtTime(m);
      b.addEventListener("click", () => { state.time = m; $$(".time", box).forEach(x => x.classList.toggle("sel", x === b)); $('[data-next="3"]').disabled = false; });
      box.appendChild(b);
    });
  }

  // ---------- step 3 ----------
  function renderSummary() {
    const s = SERVICES[state.service];
    $("[data-summary]").innerHTML = `<b>${s.name}</b><br>${fmtDate(state.date)} at ${fmtTime(state.time)}` +
      (s.dropoff ? `<br><small>Please drop off your wig by ${fmtDate(addBusinessDaysBack(state.date, 3))}.</small>` : "");
  }
  function addBusinessDaysBack(d, n) { const x = new Date(d); while (n > 0) { x.setDate(x.getDate() - 1); if (x.getDay() !== 6) n--; } return x; }

  $$("[data-next]").forEach(b => b.addEventListener("click", () => {
    const n = +b.dataset.next;
    if (n === 2) { const e = earliest(); state.month = state.month || new Date(e.getFullYear(), e.getMonth(), 1); renderMonth(); $("[data-times]").innerHTML = ""; }
    if (n === 3) renderSummary();
    showStep(n);
  }));
  $$("[data-back]").forEach(b => b.addEventListener("click", () => showStep(+b.dataset.back)));

  $('[data-form="booking"]').addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target, err = $("[data-err]"), data = Object.fromEntries(new FormData(f));
    const digits = (data.phone || "").replace(/\D/g, "");
    if (!data.first || !data.last) { err.textContent = "Please enter your first and last name."; return; }
    if (digits.length < 10) { err.textContent = "Please enter a valid mobile number."; return; }
    if (!data.heard_from) { err.textContent = "Please tell us how you heard about us."; return; }
    err.textContent = "";
    const payload = { service: SERVICES[state.service].name, date: iso(state.date), time: fmtTime(state.time), ...data };
    const btn = $('button[type="submit"]', f); btn.disabled = true;
    try {
      const r = await createBooking(payload);
      $("[data-done-text]").textContent = r.preview
        ? `Preview only: nothing was sent. On the live site, ${data.first} gets a text confirming ${payload.service} on ${fmtDate(state.date)} at ${payload.time}.`
        : `We received your request for ${payload.service} on ${fmtDate(state.date)} at ${payload.time}. You'll get a text from us to confirm.`;
      showStep(4);
    } catch {
      err.textContent = "Sorry, that didn't go through. Please call or WhatsApp us at 718-676-6003.";
    } finally { btn.disabled = false; }
  });

  showStep(1, false);
})();
