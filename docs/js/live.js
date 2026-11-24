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
    // Sales typed here on the website (shown until their end date), plus any the salon system sends.
    const today = new Date().toISOString().slice(0, 10);
    const LOCAL_SALES = [
      { text: "Kallah Sale: buy 2 Rina wigs at full price, get a fall wig for $500 ($1,825 value).", ends: "2026-11-30" }
    ].filter(s => !s.ends || s.ends >= today);
    salonApi("/sales").catch(() => []).then(sales => {
      // Show only the customer-facing website text. The campaign NAME is an internal
      // label (written for staff), so it is never displayed here.
      sales = LOCAL_SALES.concat((sales || []).filter(s => s.text && !LOCAL_SALES.some(l => l.text === s.text)));
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
      const HIDE_BRANDS = ["yafi"]; // brands we don't show on the website
      list = (list || []).filter(b => !HIDE_BRANDS.includes(String(b).trim().toLowerCase()));
      if (!list.length) return;
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

// ---------- live opening hours (footer + Visit box) ----------
(function () {
  const boxes = document.querySelectorAll("[data-hours]");
  if (!boxes.length || !window.SITE || !SITE.live) return;
  const t12 = hm => { const [h, m] = hm.split(":").map(Number); return `${((h + 11) % 12) + 1}${m ? ":" + String(m).padStart(2, "0") : ""} ${h < 12 ? "AM" : "PM"}`; };
  salonApi("/hours").then(h => {
    if (!h || !h.week || !h.week.length) return;
    const today = h.next_days && h.next_days[0];
    let now = "";
    if (today) now = today.closed ? `<p class="now closed">Closed today${today.closed !== "Closed" ? " &mdash; " + today.closed : ""}</p>`
      : `<p class="now open">Open today ${t12(today.open)} &ndash; ${t12(today.close)}${today.note ? " (" + today.note + ")" : ""}</p>`;
    const rows = h.week.map(d => `<li><span>${d.day}</span><span>${d.open ? t12(d.open) + " &ndash; " + t12(d.close) : "Closed"}</span></li>`).join("");
    // A day is a "special" closure when the salon is closed on a day it is normally open
    // (holiday, staff event) - the regular Fri/Sat closures are already in the weekly list.
    const normallyOpen = new Set(h.week.filter(d => d.open).map(d => d.day));
    const upcoming = (h.next_days || []).filter((d, i) => i > 0 && d.closed && normallyOpen.has(d.day))
      .map(d => `<li class="special"><span>${new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span><span>${d.closed === "Closed" ? "Closed" : "Closed &mdash; " + d.closed}</span></li>`).join("");
    boxes.forEach(b => { b.innerHTML = `<h3>Hours</h3>${now}<ul>${rows}${upcoming}</ul>`; b.hidden = false; });
  }).catch(() => {});
})();

// ---------- chat bubble ----------
// Talks to the salon system's assistant (POST /website/chat). If the system can't be
// reached, it offers WhatsApp/phone instead, where the same assistant answers.
(function () {
  const open = document.querySelector("[data-chat-open]"), box = document.querySelector("[data-chat]");
  if (!open || !box) return;
  const log = box.querySelector("[data-chat-log]"), form = box.querySelector("[data-chat-form]");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const linkify = s => esc(s).replace(/(https?:\/\/[^\s)]+|chanikrwigs\.com\/book)/g, u => `<a href="${u.startsWith("http") ? u : "https://" + u}">${u}</a>`).replace(/\n/g, "<br>");
  let sid; try { sid = sessionStorage.getItem("chat_sid"); } catch {}
  if (!sid) { sid = "web-" + Math.random().toString(36).slice(2, 12); try { sessionStorage.setItem("chat_sid", sid); } catch {} }
  const history = [];
  // Who she is: first name + mobile (+ optional email). Asked once before the first message
  // so the salon system files the chat under her customer profile and texts/emails the answer.
  const who = box.querySelector("[data-chat-who]");
  let me = null; try { me = JSON.parse(localStorage.getItem("chat_who") || "null"); } catch {}
  const showChat = () => { who.hidden = true; form.hidden = false; };
  if (me && me.phone) showChat();
  who.addEventListener("submit", e => {
    e.preventDefault();
    const digits = who.phone.value.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
    if (digits.length !== 10) { who.phone.setCustomValidity("Please enter a 10-digit US mobile number"); who.phone.reportValidity(); return; }
    me = { first_name: who.first.value.trim(), phone: digits, email: who.email.value.trim() || null };
    try { localStorage.setItem("chat_who", JSON.stringify(me)); } catch {}
    showChat(); add("bot", `Thanks, ${esc(me.first_name)}! What can I help you with?`); form.message.focus();
  });
  who.phone.addEventListener("input", () => who.phone.setCustomValidity(""));
  const add = (cls, html) => { const d = document.createElement("div"); d.className = "msg " + cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; };
  open.addEventListener("click", () => { box.hidden = false; open.hidden = true; (form.hidden ? who.first : form.message).focus(); });
  box.querySelector("[data-chat-close]").addEventListener("click", () => { box.hidden = true; open.hidden = false; });
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const text = form.message.value.trim(); if (!text) return;
    form.message.value = ""; add("me", esc(text));
    const wait = add("bot typing", "&hellip;");
    let reply;
    try {
      if (!window.SITE || !SITE.live) reply = "Preview only: on the live site the salon's assistant answers here.";
      else {
        const r = await salonApi("/chat", { body: { message: text, session_id: sid, history: history.slice(-8), website: form.website.value || null,
          first_name: me && me.first_name, phone: me && me.phone, email: me && me.email } });
        reply = r.reply;
      }
    } catch (ex) {
      reply = ex && ex.status === 429 ? "You're sending messages quickly &mdash; please wait a minute."
        : `Our chat is offline right now. For a quick answer, <a href="https://wa.me/17186766003" target="_blank" rel="noopener">WhatsApp us</a> or call <a href="tel:+17186766003">718-676-6003</a> &mdash; our assistant answers there 24/7.`;
      wait.className = "msg bot"; wait.innerHTML = reply; return;
    }
    history.push({ role: "user", text }, { role: "assistant", text: reply });
    wait.className = "msg bot"; wait.innerHTML = linkify(reply);
  });
})();
