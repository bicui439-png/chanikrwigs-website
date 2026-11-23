"""Builds the static pages of the Chani Kramer Wigs site from shared parts.
Run:  python3 build.py   -> writes docs/*.html
"""
from pathlib import Path

OUT = Path(__file__).parent / "docs"

ICON_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M12 2.6a9.4 9.4 0 0 0-8.1 14.2L2.6 21.4l4.7-1.2A9.4 9.4 0 1 0 12 2.6z"/><path fill="currentColor" d="M8.6 7.4c.2-.4.5-.4.8-.4h.6c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.5.7c-.1.2-.2.4 0 .6.5.9 1.2 1.7 2.1 2.3.3.2.6.3.8.1l.7-.8c.2-.2.4-.2.6-.1l1.9.9c.3.1.4.3.4.5 0 .6-.3 1.4-.9 1.8-.6.4-1.6.6-3.3-.1-2-.9-3.6-2.6-4.4-4.3-.6-1.4-.4-2.6.2-3.2z"/></svg>'
ICON_IG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.6" cy="6.4" r="1.2" fill="currentColor"/></svg>'
ICON_FB = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.6 22v-8.4h2.9l.5-3.4h-3.4V8.1c0-1 .4-1.7 1.8-1.7H17V3.3c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.6-4.3 4.4v2.6H7.2v3.4h2.9V22h3.5z"/></svg>'

PHONE = "718-676-6003"
WA_LINK = "https://wa.me/17186766003"
IG_LINK = "https://www.instagram.com/chanikr/"
FB_LINK = "https://www.facebook.com/Chani-kramer-wigs-salon-134208143738070/"


def head(title, desc):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="img/favicon.png">
<link rel="preload" href="fonts/adore-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/overthinking.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/site.css">
</head>
<body>
"""


def header(active):
    def a(href, label, key):
        cls = ' class="active"' if key == active else ""
        return f'<a href="{href}"{cls}>{label}</a>'
    return f"""<header class="site-header"><div class="wrap">
  <a class="logo" href="index.html" aria-label="Chani Kramer Wigs Salon - home"><img src="img/logo.png" alt="Chani Kramer Wigs Salon" width="348" height="130"></a>
  <button class="menu-toggle" aria-expanded="false" aria-controls="nav">Menu</button>
  <nav class="nav" id="nav">
    {a("index.html", "Home", "home")}
    {a("about.html", "About", "about")}
    {a("collections.html", "Collections", "collections")}
    {a("kallah.html", "Kallah", "kallah")}
    {a("faq.html", "FAQ", "faq")}
    <a href="{IG_LINK}" target="_blank" rel="noopener">Gallery</a>
    <a href="#visit" data-open-visit>Visit</a>
    <a class="btn" href="book.html">Book now</a>
  </nav>
</div></header>
"""


CONTACT_FORM = """<form class="form" data-form="contact" novalidate>
  <h3>Have a question? We're here to help</h3>
  <div class="row"><input name="name" placeholder="Name" autocomplete="name" required></div>
  <div class="row"><input name="email" type="email" placeholder="Email" autocomplete="email"></div>
  <div class="row"><input name="phone" type="tel" placeholder="Phone" autocomplete="tel" required></div>
  <div class="row"><textarea name="message" placeholder="Message" required></textarea></div>
  <div class="actions"><button class="btn" type="submit">Send</button></div>
  <p class="note" role="status"></p>
</form>"""


SUBSCRIBE = """<section class="subscribe" id="subscribe"><div class="wrap">
  <div class="sub-head">
    <h2>Be the first to know</h2>
    <p>Sales, new collections and exclusive promotions &mdash; straight to your phone.</p>
  </div>
  <form data-form="subscribe" novalidate>
    <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <div class="sub-grid">
      <input name="first" placeholder="First name" autocomplete="given-name" required>
      <input name="last" placeholder="Last name" autocomplete="family-name" required>
      <input name="phone" type="tel" placeholder="Mobile phone" autocomplete="tel" required>
      <input name="email" type="email" placeholder="Email (optional)" autocomplete="email">
      <div class="bday"><span>Birthday <small>(optional)</small></span>
        <select name="bmonth" aria-label="Birthday month"><option value="">Month</option>MONTHS</select>
        <select name="bday" aria-label="Birthday day"><option value="">Day</option>DAYS</select>
      </div>
      <button class="btn" type="submit">Subscribe</button>
    </div>
    <p class="fine">By subscribing you agree to receive promotional texts from Chani Kr Wigs Salon. Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to unsubscribe. <a href="terms.html">Terms</a> &middot; <a href="privacy.html">Privacy</a></p>
    <p class="err" data-sub-msg></p>
  </form>
</div></section>
""".replace("MONTHS", "".join(f'<option value="{i}">{m}</option>' for i, m in enumerate(
    ["January", "February", "March", "April", "May", "June", "July", "August",
     "September", "October", "November", "December"], 1))
).replace("DAYS", "".join(f'<option value="{d}">{d}</option>' for d in range(1, 32)))


def footer():
    return SUBSCRIBE + f"""<footer class="footer"><div class="grid">
  <a class="flogo" href="index.html"><img src="img/logo-white.png" alt="Chani Kramer Wigs Salon" width="366" height="251"></a>
  <div class="contact-col">
    <div class="icons">
      <a href="{WA_LINK}" target="_blank" rel="noopener" aria-label="WhatsApp">{ICON_WA}</a>
      <a href="{IG_LINK}" target="_blank" rel="noopener" aria-label="Instagram">{ICON_IG}</a>
      <a href="{FB_LINK}" target="_blank" rel="noopener" aria-label="Facebook">{ICON_FB}</a>
    </div>
    <div class="addr">
      <a href="tel:+17186766003">{PHONE}</a><br>
      1474 60th Street<br>
      Brooklyn, New York<br>
      11219
    </div>
    <div class="hours" data-hours hidden></div>
  </div>
</div></footer>
<div class="copy"><div class="wrap">
  <span>Copyright <span data-year>2026</span> &copy; All rights reserved.</span>
  <span><a href="faq.html">FAQ</a><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms &amp; Conditions</a></span>
</div></div>

<a class="wa-float" href="{WA_LINK}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">{ICON_WA}</a>

<div class="modal" id="visit" role="dialog" aria-modal="true" aria-label="Visit the salon">
  <div class="box marble">
    <button class="close" aria-label="Close">&times;</button>
    <div class="body">
      <img class="mlogo" src="img/logo-white.png" alt="Chani Kramer Wigs Salon">
      <div class="cols">
        <div>
          <div class="framed"><img src="img/contact.webp" alt="The salon lounge" loading="lazy"></div>
          <div class="book-cta center"><a class="btn" href="book.html">Book an appointment</a></div>
          <div class="hours" data-hours hidden></div>
        </div>
        {CONTACT_FORM}
      </div>
    </div>
    <div class="bar">
      <span><a href="{WA_LINK}" target="_blank" rel="noopener" aria-label="WhatsApp">{ICON_WA}</a><a href="{IG_LINK}" target="_blank" rel="noopener" aria-label="Instagram">{ICON_IG}</a><a href="{FB_LINK}" target="_blank" rel="noopener" aria-label="Facebook">{ICON_FB}</a></span>
      <a href="tel:+17186766003">{PHONE}</a>
      <span>1474 60th street</span>
      <span>BK, NY, 11219</span>
    </div>
  </div>
</div>
<button class="chat-float" data-chat-open aria-label="Chat with us">{ICON_CHAT}<span>Chat with us</span></button>
<div class="chat-box" data-chat hidden role="dialog" aria-label="Chat with Chani Kramer Wigs Salon">
  <div class="chat-head"><b>Chani Kramer Wigs</b><small>Usually answers in seconds</small><button data-chat-close aria-label="Close chat">&times;</button></div>
  <div class="chat-log" data-chat-log><div class="msg bot">Hi! Ask me anything &mdash; booking, wig care, repairs, our collections.</div></div>
  <form class="chat-form" data-chat-form><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><input name="message" maxlength="800" placeholder="Type your message&hellip;" autocomplete="off" required><button aria-label="Send">&rarr;</button></form>
</div>
<script src="js/site.js"></script>
<script src="js/live.js"></script>
"""


ICON_CHAT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>'


def marquee(text):
    item = f"<span>{text}</span>" * 6
    return f'<div class="marquee" aria-hidden="true"><div class="track">{item}{item}</div></div>\n'


TESTIMONIALS = [
    ("Chanie and Co. were so helpful and honest and weren't trying to just make money off of me but really making sure I got the best fit, and most comfortable with for me! Highly recommend!", "Naomi Samberg"),
    ("I have no words! My daughter is a kallah and wig shopping is always hard. Chani and all her wonderful staff made this such a great experience. My daughter was so thrilled. And the new salon feels like a spa!", "Renee Pruzansky"),
    ("Chani is a real artist. I love my Rina. Thanks so much for making me feel beautiful with my new wig!!", "Anaëlle Adler"),
    ("I highly recommend Chani Kr Wigs for anyone looking for a top-notch experience. The combination of skilled stylists, a welcoming atmosphere, and quality products makes Chani Kr a cut above the rest.", "Brucha Fischman"),
    ("Not only was Chani and her staff calm and patient, everyone was friendly. And made sure I left extremely happy!! I cannot say enough nice things. Everyone needs a Chani Kramer wig!!!", "Avital Ruzohorsky"),
]


def home():
    import json
    reels = json.loads((Path(__file__).parent / "looks.json").read_text())
    looks = "".join(
        f'<a class="look" href="https://www.instagram.com/reel/{rid}/" target="_blank" rel="noopener" aria-label="Watch this look on Instagram"><img src="img/look-{i}.webp" alt="Customer wearing her new wig" loading="lazy"><span class="play"></span></a>'
        for i, rid in enumerate(reels, 1)
    )
    testi = "".join(
        f'<div class="testimonial{" on" if i == 0 else ""}"><p>{t}</p><div class="name">{n}</div></div>'
        for i, (t, n) in enumerate(TESTIMONIALS)
    )
    stats = [("93", "%", "Repeat clients"), ("2000", "+", "Satisfied customers in 2023"), ("32", "", "Years combined experience"),
             ("15", "", "Wig companies"), ("100", "%", "Satisfaction"), ("1", "", "Woman at a time")]
    stats_html = "".join(
        f'<div class="stat"><div class="n" data-count="{v}" data-suffix="{s}">0{s}</div><div class="l">{l}</div></div>' for v, s, l in stats
    )
    return (head("Chani Kramer Wigs Salon | Brooklyn", "A boutique wig salon in Brooklyn. New wigs, repairs, wash & set and styling. Book your appointment online.")
        + header("home")
        + f"""<main>
<section class="hero photo-bg" style="background-image:url('img/hero-lounge.webp')">
  <div class="script">it&rsquo;s fun, it&rsquo;s chic</div>
  <h1 class="display">It&rsquo;s the Chani K experience</h1>
  <a class="btn big light" href="book.html">Book an appointment</a>
</section>

<div class="sales-strip" data-sales hidden></div>

<section class="intro marble">
  <div class="inner">
    <img class="quote" src="img/quote.svg" alt="">
    <h2>Where wig care is self-care.</h2>
    <p>A warm and welcoming place, where styles and smiles are formed.</p>
    <a class="btn" href="book.html">Visit our salon</a>
  </div>
</section>

{marquee("A wig doesn&rsquo;t make the woman, but a good wig definitely helps.")}

<section class="looks">
  <div class="head"><h2 class="section-title">Discover why 93% of our customers keep coming back for more.</h2></div>
  <div class="carousel" data-carousel>
    <button class="arrow prev" aria-label="Previous">&#8249;</button>
    <div class="viewport"><div class="strip">{looks}</div></div>
    <button class="arrow next" aria-label="Next">&#8250;</button>
  </div>
  <div class="cta"><a class="btn" href="{IG_LINK}" target="_blank" rel="noopener">Visit our Instagram</a></div>
</section>

<section class="beauty photo-bg" style="background-image:url('img/hero-station.webp')">
  <div class="script">beauty is in the eye of the beholder.</div>
  <p>At Chani Kramer Wigs, we want you to see your beauty every time you look in the mirror.</p>
</section>

<section class="testimonials marble m1">
  <div class="slider" data-testimonials>
    <button class="arrow prev" aria-label="Previous review">&#8249;</button>
    {testi}
    <img class="quote" src="img/quote.svg" alt="">
    <button class="arrow next" aria-label="Next review">&#8250;</button>
  </div>
</section>
<div class="after-testimonials"><a class="btn" href="book.html">Visit our salon</a> <a class="link-google" href="https://www.google.com/maps?cid=11406666481372628110" target="_blank" rel="noopener">Read our reviews on Google &rarr;</a></div>

<section class="help"><h2 class="section-title">How can we help you today?</h2></section>
<section class="services">
  <div class="grid">
    <a class="service" href="book.html#consultation"><div class="num">01</div><div class="t">Buy a new wig.<br>Buy a new look.</div><span class="go">Book a consultation</span></a>
    <a class="service" href="book.html#repair"><div class="num">02</div><div class="t">Repair a wig.<br>Repair a dream.</div><span class="go">Book a repair</span></a>
    <a class="service" href="book.html#wash-set"><div class="num">03</div><div class="t">Style a wig.<br>Style a vision.</div><span class="go">Book a wash &amp; set</span></a>
  </div>
</section>

<section class="about-stats">
  <h2 class="section-title">About us</h2>
  <div class="stats">{stats_html}</div>
  <div class="cta"><a class="btn" href="book.html">Visit our salon</a></div>
</section>

<section class="contact marble m3" id="contact">
  <h2 class="section-title">Contact us</h2>
  <div class="grid">
    <div class="framed"><img src="img/contact.webp" alt="The salon lounge" loading="lazy"></div>
    {CONTACT_FORM}
  </div>
</section>
</main>
"""
        + footer() + "</body>\n</html>\n")


def about():
    return (head("About | Chani Kramer Wigs Salon", "Meet Chani - a boutique wig salon for the everyday woman in Brooklyn.")
        + header("about")
        + f"""<main>
<section class="page-hero photo-bg" style="background-image:url('img/about-hero.webp')">
  <h1 class="section-title">About us</h1>
</section>

<section class="hi marble">
  <div class="grid">
    <img src="img/chani.webp" alt="Chani Kramer" width="379" height="438">
    <div>
      <div class="script">hi there,</div>
      <p>I&rsquo;m Chani, a wife and mother, and the owner of Chani Kr Wigs.<br>A boutique wig salon for the everyday woman.</p>
      <p>Whilst selling and styling wigs for 10+ years,<br>my mission is to help every woman find a quality wig that suits her style, her look, and her budget.</p>
      <p>To help every woman feel beautiful.</p>
    </div>
  </div>
</section>

<section class="dream pink">
  <img src="img/quote.svg" alt="" style="width:50px;margin:0 auto -30px">
  <div class="script">this is my dream</div>
  <p>I dream of making your dreams come true.<br>What&rsquo;s your dream?</p>
  <a class="btn" href="book.html">Make your dream come true</a>
</section>

{marquee("We&rsquo;ve got to have a dream if we are going to make a dream come true.")}

<section class="salon" style="background:linear-gradient(#fff 0,#fff 140px,var(--blush-soft) 140px)">
  <h2 class="section-title">About our salon</h2>
  <div class="grid">
    <div>
      <p>A wig salon is a place where dreams come true.</p>
      <p>A kallah dreams of her future, a young woman dreams of her fresh new look, a mature woman dreams of her youthfulness.</p>
      <p>We dream of the delight in your eyes when a repair is done to perfection.</p>
      <p>We dream of the confidence in your eyes when you fall in love with your fresh new look.</p>
    </div>
    <img src="img/salon-lounge.webp" alt="Inside the salon" loading="lazy">
  </div>
</section>

<section class="whats marble">
  <div class="script">what&rsquo;s your dream?</div>
  <a class="btn" href="book.html">Make your dream come true</a>
</section>
</main>
"""
        + footer() + "</body>\n</html>\n")


def book():
    return (head("Book an appointment | Chani Kramer Wigs Salon", "Book a wig consultation, wash & set, reset or repair at Chani Kramer Wigs Salon in Brooklyn.")
        + header("book")
        + """<main class="marble book-wrap">
<p class="preview-note" data-preview-note>Preview: the times below are examples. Once the salon system is connected, they will be the real open times, and bookings will go straight into the system.</p>
<div class="book" id="booking">
  <div class="head">
    <div class="script">book your visit</div>
  </div>
  <div class="steps" aria-hidden="true"><span data-step-label="1">1. Service</span><span data-step-label="2">2. Date &amp; time</span><span data-step-label="3">3. Your details</span></div>

  <div class="panel on" data-panel="1">
    <div class="choices">
      <button class="choice" data-service="consultation"><div class="n">01</div><div class="t">New wig consultation</div><div class="d">Buy a new wig, buy a new look. Try on styles with our consultant and find the one for you.</div></button>
      <button class="choice" data-service="wash-set"><div class="n">02</div><div class="t">Wash &amp; Set</div><div class="d">Style a wig, style a vision. A full wash and set for your wig.</div></button>
      <button class="choice" data-service="repair"><div class="n">03</div><div class="t">Repair</div><div class="d">Repair a wig, repair a dream. Tell us what you need and we&rsquo;ll take care of it.</div></button>
    </div>
    <div class="callout" data-dropoff hidden>Please drop off your wig <b>3 business days before</b> your appointment. You can use the mail slot in our door at any time, day or night. Attach your name, phone number and instructions.</div>
    <div class="nav-row"><span></span><button class="btn" data-next="2" disabled>Continue</button></div>
  </div>

  <div class="panel" data-panel="2">
    <div class="month-nav"><button data-month="-1" aria-label="Previous month">&#8249;</button><b data-month-label></b><button data-month="1" aria-label="Next month">&#8250;</button></div>
    <div class="days" data-days></div>
    <div class="times" data-times></div>
    <div class="nav-row"><button class="link-back" data-back="1">&larr; Back</button><button class="btn" data-next="3" disabled>Continue</button></div>
  </div>

  <div class="panel" data-panel="3">
    <div class="summary" data-summary></div>
    <form class="form" data-form="booking" novalidate>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="two">
        <div class="row"><input name="first" placeholder="First name" autocomplete="given-name" required></div>
        <div class="row"><input name="last" placeholder="Last name" autocomplete="family-name" required></div>
        <div class="row"><input name="phone" type="tel" placeholder="Mobile phone" autocomplete="tel" required></div>
        <div class="row"><input name="email" type="email" placeholder="Email (optional)" autocomplete="email"></div>
      </div>
      <div class="row"><select name="heard_from" required>
        <option value="">How did you hear about us?</option>
        <option>Instagram</option><option>A friend or family member</option><option>Google search</option>
        <option>WhatsApp status</option><option>Walked by the salon</option><option>I'm a returning customer</option><option>Other</option>
      </select></div>
      <div class="row"><textarea name="notes" placeholder="Anything we should know? (wig brand, what needs repair, etc.)"></textarea></div>
      <label class="consent promo"><input type="checkbox" name="promos" value="yes"> <span><b>Yes, send me our best sales &amp; exclusive offers!</b> Be the first to hear about new collections and special promotions.</span></label>
      <p class="fine">We'll text you about your appointment (confirmation and reminders). Msg &amp; data rates may apply. <a href="terms.html">Terms</a> &middot; <a href="privacy.html">Privacy</a></p>
      <p class="err" data-err></p>
      <div class="nav-row"><button type="button" class="link-back" data-back="2">&larr; Back</button><button class="btn" type="submit">Book appointment</button></div>
    </form>
  </div>

  <div class="panel" data-panel="4">
    <div class="done-box">
      <div class="script">thank you!</div>
      <p data-done-text></p>
      <p>Questions? Call or WhatsApp us at 718-676-6003.</p>
      <p style="margin-top:28px"><a class="btn" href="index.html">Back to home</a></p>
    </div>
  </div>
</div>
</main>
"""
        + footer() + '<script src="js/book.js"></script>\n</body>\n</html>\n')



def collections():
    cards = [
        ("rina", "Rina", "coll-rina.webp", "Our signature collection.",
         "Rina is the line we're proudest of: beautiful, natural wigs that are made to last. If you're choosing between collections, this is the one we recommend trying on first.",
         "Book a Rina consultation"),
        ("naya", "Naya", "naya.webp", "Beautifully made. Beautifully priced.",
         "Very natural lace-top wigs at a friendlier price. Naya is for the woman who wants the look and feel of a lace top without stretching her budget.",
         "Book a Naya consultation"),
        ("nechami", "Nechami", "coll-nechami.webp", "Virgin hair from Israel, ready to wear.",
         "Ready-made virgin-hair wigs from Israel, very well priced. Choose from what we have in the salon, or we can order a piece in for you.",
         "Book a Nechami consultation"),
    ]
    body = "".join(f"""
  <article class="coll" id="{k}">
    <img src="img/{img}" alt="A customer wearing a {name} wig" loading="lazy">
    <div>
      <div class="script">{name.lower()}</div>
      <h2>{tag}</h2>
      <p>{txt}</p>
      <a class="btn" href="book.html#consultation">{cta}</a>
    </div>
  </article>""" for k, name, img, tag, txt, cta in cards)
    return (head("Wig collections | Chani Kramer Wigs Salon", "Rina, Naya and Nechami wigs at Chani Kramer Wigs Salon in Brooklyn.")
        + header("collections")
        + f"""<main>
<section class="page-hero photo-bg" style="background-image:url('img/about-hero.webp')"><h1 class="section-title">Our collections</h1></section>
<div class="sales-strip" data-sales hidden></div>
<section class="colls marble">
  <div class="brands" data-brands hidden><h2 class="section-title">Brands we carry</h2><div class="chips"></div></div>
  <p class="lead">Every woman is different, so we carry more than one line. Come try them on, and we'll help you find the one that suits your style, your look and your budget. Don't see your color? We can usually get it for you.</p>
  {body}
</section>
{marquee("Beautifully made. Beautifully priced.")}
</main>
""" + footer() + "</body>\n</html>\n")


def kallah():
    steps = [
        ("01", "Come for a consultation", "Bring your mother, your sister or your best friend. We'll sit with you, hear what you're dreaming of, and help you try on styles."),
        ("02", "Choose your wig", "Pick your wig, put down a deposit, and it's set aside for you."),
        ("03", "Cut &amp; style", "Your wig is cut and styled to suit you. You pay the balance at the cut."),
        ("04", "Ready for the wedding", "Book a wash &amp; set before the big day, so it's perfect when you walk down the aisle."),
    ]
    steps_html = "".join(f'<div class="kstep"><div class="num">{n}</div><h3>{t}</h3><p>{d}</p></div>' for n, t, d in steps)
    return (head("Kallah wigs | Chani Kramer Wigs Salon", "Kallah wig shopping at Chani Kramer Wigs Salon in Brooklyn. Book your kallah consultation.")
        + header("kallah")
        + f"""<main>
<section class="kallah-hero marble">
  <div class="grid">
    <div>
      <div class="script">mazel tov, kallah!</div>
      <h1>Your first wig should feel like a dream.</h1>
      <p>A kallah dreams of her future. We dream of the confidence in your eyes when you fall in love with your fresh new look. Take your time, bring the people you love, and let us make wig shopping the easiest part of your engagement.</p>
      <a class="btn big" href="book.html#consultation">Book a kallah consultation</a>
    </div>
    <img src="img/kallah-1.webp" alt="A customer in her new wig" loading="lazy">
  </div>
</section>
<section class="ksteps pink">
  <h2 class="section-title">How it works</h2>
  <div class="grid">{steps_html}</div>
</section>
<section class="kquote marble m1">
  <img class="quote" src="img/quote.svg" alt="">
  <p>I have no words! My daughter is a kallah and wig shopping is always hard. Chani and all her wonderful staff made this such a great experience. My daughter was so thrilled. And the new salon feels like a spa!</p>
  <div class="name">Renee Pruzansky</div>
  <a class="btn" href="book.html#consultation">Book your consultation</a>
</section>
</main>
""" + footer() + "</body>\n</html>\n")


FAQS = [
    ("How do I book an appointment?", 'Book online on our <a href="book.html">booking page</a>, or call or WhatsApp us at 718-676-6003. Our assistant answers 24 hours a day, so you never wait on hold.'),
    ("What are your opening hours?", 'Our hours change with the season and the holidays. The <a href="book.html">booking page</a> always shows the days and times we\'re open.'),
    ("How does Wash &amp; Set drop-off work?", "Please drop off your wig 3 business days before your appointment. You can drop it off any time, day or night, through the mail slot in our door. Just attach your name, phone number and instructions."),
    ("Which wigs do you carry?", 'We carry <a href="collections.html#rina">Rina</a>, <a href="collections.html#naya">Naya</a> and <a href="collections.html#nechami">Nechami</a>, plus wigs from other companies. Come try them on at a consultation.'),
    ("What if the color I want isn't in the salon?", "We carry a big variety of stock, and we can usually get a color for you even if it isn't in the salon. Just ask."),
    ("How does paying for a new wig work?", "You put down a deposit to hold your wig. The balance is paid when your wig is cut."),
    ("Do you repair wigs?", 'Yes. <a href="book.html#repair">Book a repair</a> and tell us what needs fixing, and we\'ll take care of it.'),
    ("I'm a kallah. Where do I start?", 'Start with a consultation. See our <a href="kallah.html">kallah page</a> for how it works.'),
    ("Where are you?", "1474 60th Street, Brooklyn, NY 11219."),
]


def faq():
    items = "".join(f'<details class="qa"><summary>{q}</summary><div>{a}</div></details>' for q, a in FAQS)
    return (head("FAQ | Chani Kramer Wigs Salon", "Answers to common questions: booking, hours, wig drop-off, collections and payment.")
        + header("faq")
        + f"""<main class="marble faq-wrap">
<div class="faq-box">
  <h1 class="section-title">Questions &amp; answers</h1>
  {items}
  <p class="more">Still have a question? Call or WhatsApp us at 718-676-6003, or <a href="#visit" data-open-visit>send us a message</a>.</p>
</div>
</main>
""" + footer() + "</body>\n</html>\n")


PRIVACY = """<h1 class="section-title">Privacy Policy</h1>
<p class="sub">Privacy Policy &mdash; Chani Kr Wigs Salon (KR wigs LLC)</p>
<p><i>Last updated: July 18, 2026</i></p>
<p>Chani Kr Wigs Salon respects your privacy. This policy explains how we collect and use your personal information.</p>
<p><b>Information we collect.</b> When you book an appointment or contact us, we may collect your name, phone number, and appointment details.</p>
<p><b>How we use your information.</b> We use your information solely to schedule and manage your appointments and to send you appointment confirmations, reminders, and customer service notifications by SMS, if you have agreed to receive them.</p>
<p><b>Promotional messages.</b> From time to time, we may also send you promotional or marketing SMS messages (special offers, seasonal sales, event invitations) if you are an existing customer and have not opted out. You may opt out of promotional messages at any time by replying STOP &mdash; this will not affect appointment confirmation or reminder messages, which require a separate opt-in. We do not sell or share your mobile number with third parties for marketing purposes.</p>
<p><b>SMS consent and mobile information.</b> Mobile information will not be sold or shared with third parties for promotional or marketing purposes. SMS opt-in consent and phone numbers collected for SMS purposes are not shared with any third parties or affiliates for marketing purposes.</p>
<p><b>Opting out.</b> You may stop receiving SMS messages at any time by replying STOP to any message. Reply HELP for assistance, or contact us at 718-676-6003.</p>
<p><b>Data retention.</b> We keep your information only as long as needed to provide our services and comply with legal obligations.</p>
<p><b>Contact us.</b> Questions about this policy? Contact Chani Kr Wigs Salon at chani@chanikrwigs.com or 718-676-6003, 1474 60th St, Brooklyn, NY.</p>"""

TERMS = """<h1 class="section-title">Terms &amp; Conditions</h1>
<p class="sub">Terms &amp; Conditions &mdash; Chani Kr Wigs Salon</p>
<p>By providing your phone number and agreeing to receive text messages from Chani Kr Wigs Salon (KR wigs LLC), you consent to receive SMS informational messages, including appointment confirmations, appointment reminders, and customer service notifications.</p>
<p>Message frequency varies depending on your appointments and interactions with us.</p>
<p>Message and data rates may apply. Charges depend on your mobile carrier plan.</p>
<p><b>Opting out:</b> Reply STOP at any time to unsubscribe. You will receive a final confirmation message, and no further messages will be sent.</p>
<p><b>Help:</b> Reply HELP for assistance, call us at 718-676-6003, or email chani@chanikrwigs.com.</p>
<p><b>Privacy:</b> We do not sell or share your mobile information with third parties for promotional or marketing purposes. See our <a href="privacy.html">Privacy Policy</a> for details.</p>
<p>Carriers are not liable for delayed or undelivered messages.</p>"""


def legal(title, body):
    return (head(f"{title} | Chani Kramer Wigs Salon", title) + header("")
            + f'<main class="legal marble"><div class="legal-box">{body}</div></main>\n' + footer() + "</body>\n</html>\n")


if __name__ == "__main__":
    (OUT / "collections.html").write_text(collections(), encoding="utf-8")
    (OUT / "kallah.html").write_text(kallah(), encoding="utf-8")
    (OUT / "faq.html").write_text(faq(), encoding="utf-8")
    (OUT / "privacy.html").write_text(legal("Privacy Policy", PRIVACY), encoding="utf-8")
    (OUT / "terms.html").write_text(legal("Terms & Conditions", TERMS), encoding="utf-8")
    (OUT / "index.html").write_text(home(), encoding="utf-8")
    (OUT / "about.html").write_text(about(), encoding="utf-8")
    (OUT / "book.html").write_text(book(), encoding="utf-8")

    # ---- GitHub Pages extras (no _redirects support there) ----
    (OUT / "CNAME").write_text("chanikrwigs.com\n")
    (OUT / ".nojekyll").write_text("")
    def at(path, html):  # page served from a sub-folder: make relative links resolve from the site root
        d = OUT / path; d.mkdir(parents=True, exist_ok=True)
        (d / "index.html").write_text(html.replace("<head>", '<head>\n<base href="/">', 1), encoding="utf-8")
    # old WordPress legal URLs (10DLC registration points to them): same content, same address
    at("privacy-policy-2", legal("Privacy Policy", PRIVACY))
    at("terms-conditions", legal("Terms & Conditions", TERMS))
    (OUT / "404.html").write_text('<!doctype html><meta charset="utf-8"><title>Chani Kramer Wigs</title><meta http-equiv="refresh" content="0; url=/"><a href="/">Go to the home page</a>', encoding="utf-8")
    # ---- Google: sitemap + robots ----
    base = "https://chanikrwigs.com"
    urls = ["/", "/about", "/collections", "/kallah", "/book", "/faq", "/privacy-policy-2/", "/terms-conditions/"]
    (OUT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "".join(f"  <url><loc>{base}{u}</loc></url>\n" for u in urls) + "</urlset>\n", encoding="utf-8")
    (OUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /__forms.html\n\nSitemap: {base}/sitemap.xml\n", encoding="utf-8")
    print("built", [p.name for p in OUT.glob("*.html")])
