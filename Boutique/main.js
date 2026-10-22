/* Aamber & August: shared behaviour */
const d = document.documentElement,
  $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)],
  fine = matchMedia("(pointer:fine)").matches,
  calm = matchMedia("(prefers-reduced-motion:reduce)").matches;
d.classList.add("js");

/* theme */
try { const s = localStorage.getItem("aa-theme"); if (s) d.dataset.theme = s; } catch (e) {}
$("#tt").onclick = () => {
  const dark = d.dataset.theme ? d.dataset.theme === "dark" : matchMedia("(prefers-color-scheme:dark)").matches;
  const next = dark ? "light" : "dark";
  d.dataset.theme = next;
  try { localStorage.setItem("aa-theme", next); } catch (e) {}
};

/* mobile menu */
const mb = $(".mb"), menu = $("#menu");
mb.onclick = () => mb.setAttribute("aria-expanded", menu.classList.toggle("open"));

/* stitch progress + banner parallax */
const onScroll = () => {
  d.style.setProperty("--p", scrollY / Math.max(1, d.scrollHeight - innerHeight));
  if (calm) return;
  $$("[data-par]").forEach(el => {
    const r = el.parentElement.getBoundingClientRect();
    const y = (r.top + r.height / 2 - innerHeight / 2) * -0.08;
    el.style.setProperty("--py", Math.max(-40, Math.min(40, y)) + "px");
  });
};
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* curtain reveal on scroll */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const i = [...e.target.parentElement.children].indexOf(e.target);
  setTimeout(() => e.target.classList.add("in"), (i % 4) * 140);
  io.unobserve(e.target);
}), { threshold: 0.12 });
$$(".rv").forEach(el => io.observe(el));

/* count-up numbers */
$$("[data-to]").forEach(el => {
  const to = +el.dataset.to, dec = el.dataset.to.includes(".") ? 1 : 0;
  let t0 = null;
  const tick = t => {
    t0 = t0 || t;
    const k = Math.min(1, (t - t0) / 1400);
    el.textContent = (to * (1 - Math.pow(1 - k, 3))).toFixed(dec);
    if (k < 1) requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { calm ? (el.textContent = to) : requestAnimationFrame(tick); cio.disconnect(); }
  });
  cio.observe(el);
});

/* rack follows the cursor, buttons are magnetic */
const rack = $("#rack");
if (fine && !calm) {
  if (rack) addEventListener("pointermove", e => {
    const r = rack.getBoundingClientRect();
    const k = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 1.4)));
    rack.style.setProperty("--tilt", k * 14);
  });
  $$(".btn").forEach(b => {
    b.addEventListener("pointermove", e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });
}

/* testimonial rotator */
const qs = $$(".qs blockquote"), dots = $$(".dots button");
if (qs.length) {
  let qi = 0, timer;
  const show = i => {
    qi = (i + qs.length) % qs.length;
    qs.forEach((q, j) => q.classList.toggle("on", j === qi));
    dots.forEach((b, j) => b.setAttribute("aria-current", j === qi));
  };
  const run = () => { clearInterval(timer); if (!calm) timer = setInterval(() => show(qi + 1), 6500); };
  dots.forEach((b, j) => (b.onclick = () => { show(j); run(); }));
  $(".qs").addEventListener("mouseenter", () => clearInterval(timer));
  $(".qs").addEventListener("mouseleave", run);
  show(0); run();
}

/* collection filter */
$$(".chip").forEach(c => c.onclick = () => {
  $$(".chip").forEach(x => x.setAttribute("aria-pressed", x === c));
  $$(".pc[data-cat]").forEach(p => {
    const ok = c.dataset.f === "all" || p.dataset.cat === c.dataset.f;
    p.hidden = !ok;
    if (ok) { p.classList.remove("pop"); void p.offsetWidth; p.classList.add("pop"); }
  });
});

/* contact form opens WhatsApp */
const f = $("#f");
if (f) f.onsubmit = e => {
  e.preventDefault();
  const text = "Hi, I’m " + $("#nm").value + ". " + $("#ms").value;
  window.open("https://wa.me/919207281219?text=" + encodeURIComponent(text), "_blank", "noopener");
};

/* gold curtain between pages */
$$("a[href]").forEach(a => a.addEventListener("click", e => {
  const h = a.getAttribute("href");
  if (calm || e.metaKey || e.ctrlKey || e.shiftKey || a.target || !/^[\w-]+\.html$/.test(h)) return;
  e.preventDefault();
  $(".curtain").classList.add("go");
  setTimeout(() => (location.href = h), 520);
}));
addEventListener("pageshow", e => { if (e.persisted) $(".curtain").classList.remove("go"); });
