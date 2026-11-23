// Connection to the salon system (Railway). Public, read-mostly routes under /api/v1/website —
// see Documentation/website_booking.md in the salon system repo.
window.SALON_API = "https://chanikramersalon-production.up.railway.app/api/v1/website";

window.salonApi = async function (path, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeout || 10000);
  try {
    const r = await fetch(SALON_API + path, {
      method: opts.body ? "POST" : "GET",
      headers: opts.body ? { "Content-Type": "application/json" } : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: ctrl.signal,
    });
    let data = null;
    try { data = await r.json(); } catch {}
    if (!r.ok) {
      const err = new Error((data && data.detail) || `HTTP ${r.status}`);
      err.status = r.status;
      throw err;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
};

// Live pieces shown on several pages: running sales + brands in stock.
(function () {
  if (!window.SITE || !SITE.live) return;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmtEnd = iso => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const strips = document.querySelectorAll("[data-sales]");
  if (strips.length) {
    salonApi("/sales").then(sales => {
      // Show only the customer-facing website text. The campaign NAME is an internal
      // label (written for staff), so it is never displayed here.
      sales = (sales || []).filter(s => s.text);
      if (!sales.length) return;
      const html = sales.map(s =>
        `<span class="sale">${esc(s.text)}${s.ends ? ` <i>until ${fmtEnd(s.ends)}</i>` : ""}</span>`
      ).join("");
      strips.forEach(el => {
        el.innerHTML = `<div class="wrap"><span class="label">Now at the salon</span>${html}<a class="btn" href="book.html#consultation">Book a consultation</a></div>`;
        el.hidden = false;
      });
    }).catch(() => {});
  }

  const brands = document.querySelector("[data-brands]");
  if (brands) {
    salonApi("/brands").then(list => {
      if (!list || !list.length) return;
      brands.querySelector(".chips").innerHTML = list.map(b => `<span class="chip">${esc(b)}</span>`).join("");
      brands.hidden = false;
    }).catch(() => {});
  }
})();

// ---------- footer: sales & promotions sign-up ----------
// Goes straight into the salon system (POST /website/subscribe). If the system
// can't be reached yet, the sign-up is emailed to the salon instead, so none is lost.
(function () {
  const f = document.querySelector('[data-form="subscribe"]');
  if (!f) return;
  const msg = f.querySelector("[data-sub-msg]");
  f.addEventListener("submit", async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    const digits = (d.phone || "").replace(/\D/g, "");
    msg.className = "err";
    if (!d.first || !d.last) { msg.textContent = "Please enter your first and last name."; return; }
    if (digits.length < 10) { msg.textContent = "Please enter a valid mobile number."; return; }
    if (d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) { msg.textContent = "Please check your email address."; return; }
    if (!!d.bmonth !== !!d.bday) { msg.textContent = "Please pick both the month and the day of your birthday."; return; }
    msg.textContent = "";
    const btn = f.querySelector("button"); btn.disabled = true;
    const done = text => { f.reset(); msg.className = "ok"; msg.textContent = text; };
    try {
      if (!window.SITE || !SITE.live) return done("Preview only: nothing was sent. On the live site this signs you up in the salon system.");
      if (d.website) return done("You're subscribed. Thank you!");
      try {
        await salonApi("/subscribe", { body: {
          first_name: d.first, last_name: d.last, phone: d.phone, email: d.email || null,
          birthday_month: d.bmonth ? +d.bmonth : null, birthday_day: d.bday ? +d.bday : null, website: d.website || null,
        } });
      } catch (ex) {
        if (ex && ex.status && ex.status !== 404) throw ex;   // a real error from the system: show it
        await sendForm("subscribe", { first: d.first, last: d.last, phone: d.phone, email: d.email || "",
          birthday: d.bmonth ? `${d.bmonth}/${d.bday}` : "" });   // system not reachable yet: email it
      }
      done("You're subscribed! Watch your phone for our next sale.");
    } catch (ex) {
      msg.textContent = ex && ex.status === 429 ? "Too many tries, please wait a minute."
        : (ex && ex.message && ex.status === 400 ? ex.message : "Sorry, that didn't go through. Please try again or WhatsApp us at 718-676-6003.");
    } finally { btn.disabled = false; }
  });
})();
