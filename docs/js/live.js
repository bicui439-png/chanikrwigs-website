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
