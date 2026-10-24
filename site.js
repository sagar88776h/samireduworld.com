/* Samir Edu World — shared script for every page.
   Supabase keys live in config.js. All text, numbers and photos are edited from admin.html. */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let motionOn = false;
  function refreshScroll(){ if (motionOn) { clearTimeout(refreshScroll.t); refreshScroll.t = setTimeout(() => ScrollTrigger.refresh(), 150); } }

  /* ---------- Always open at the top when a page is opened or refreshed ---------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  window.scrollTo(0, 0);

  /* ---------- Loading screen and page transitions ---------- */
  const loader = $("loader"), ldTitle = $("ldTitle"), ldBar = $("ldBar");
  const TITLES = {
    index: 'Samir <em class="script">Edu World</em>',
    about: 'About <em class="script">me</em>',
    subjects: 'What I <em class="script">teach</em>',
    notes: 'Free <em class="script">notes</em>',
    reviews: 'Kind <em class="script">words</em>',
    contact: 'Let’s <em class="script">talk</em>'
  };
  const wrapTitle = html => html.replace(/^([^<]+)\s/, '<span class="ld-w">$1</span> ').replace('<em class="script">', '<em class="script ld-w">');
  const pageKey = path => { const m = path.match(/([a-z-]+)\.html$/); return m && TITLES[m[1]] ? m[1] : "index"; };
  let revealed = false;
  const onReveal = [];
  const whenRevealed = fn => revealed ? fn() : onReveal.push(fn);
  function reveal(){
    if (revealed) return;
    revealed = true;
    if (loader) { loader.classList.add("out"); setTimeout(() => loader.classList.add("gone"), 850); }
    onReveal.splice(0).forEach(fn => fn());
  }
  if (!loader || reduce) reveal();
  else {
    const ready = new Promise(r => document.readyState === "complete" ? r() : addEventListener("load", r, { once: true }));
    Promise.race([ready, new Promise(r => setTimeout(r, 2200))])
      .then(() => setTimeout(reveal, Math.max(0, 800 - performance.now())));
  }
  function go(href, key){
    if (!loader || reduce) { location.href = href; return; }
    ldTitle.innerHTML = wrapTitle(TITLES[key] || TITLES.index);
    ldBar.innerHTML = "<i></i>";
    loader.classList.remove("gone", "out");
    loader.classList.add("enter");
    void loader.offsetWidth;
    loader.classList.remove("enter");
    let left = false;
    const leave = () => { if (!left) { left = true; location.href = href; } };
    loader.addEventListener("transitionend", leave, { once: true });
    setTimeout(leave, 950);
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== "_self") return;
    const raw = a.getAttribute("href");
    if (!raw || raw.startsWith("#") || /^(mailto|tel|https?:)/i.test(raw) && !raw.startsWith(location.origin)) return;
    const url = new URL(raw, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || !/(\.html|\/)$/.test(url.pathname)) return;
    e.preventDefault();
    setMenu(false);
    go(url.href, pageKey(url.pathname));
  });
  addEventListener("pageshow", e => {
    window.scrollTo(0, 0);
    if (e.persisted && loader) { loader.classList.add("out", "gone"); }
  });

  /* ---------- Settings, WhatsApp links ---------- */
  const CFG = window.SITE_CONFIG || {};
  const SUPABASE_URL = (CFG.SUPABASE_URL || "").trim(), SUPABASE_ANON_KEY = (CFG.SUPABASE_ANON_KEY || "").trim();
  const REVIEWS_NEED_APPROVAL = !!CFG.REVIEWS_NEED_APPROVAL;
  const looksReal = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 20 && !/xxxx/.test(SUPABASE_ANON_KEY);
  const SB = looksReal && window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
  let WHATSAPP_NUMBER = "918794573962";
  let SAMPLE_REVIEWS = [];
  const readSamples = () => { try { SAMPLE_REVIEWS = JSON.parse($("sampleReviewsData").textContent); } catch (e) { SAMPLE_REVIEWS = []; } };
  readSamples();
  const waLink = t => "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(t);
  function refreshLinks(){
    document.querySelectorAll("a.wa").forEach(a => a.href = waLink("Namaskar Sir, I found you on Samir Edu World."));
    document.querySelectorAll(".note").forEach(n => {
      const a = n.querySelector("a[data-note]"), h = n.querySelector("h3");
      if (!a || !h) return;
      const t = h.textContent.trim();
      a.dataset.note = t; a.href = waLink("Namaskar Sir, please send me the notes on: " + t + ".");
    });
  }
  refreshLinks();

  /* ---------- Notch, menu, theme ---------- */
  const notch = $("notch"), notchBtn = notch && notch.querySelector(".notch-btn");
  if (notch) {
    notchBtn.addEventListener("click", e => { e.stopPropagation(); const o = notch.classList.toggle("open"); notchBtn.setAttribute("aria-expanded", o); });
    document.addEventListener("click", e => { if (!notch.contains(e.target)) { notch.classList.remove("open"); notchBtn.setAttribute("aria-expanded", false); } });
  }
  const overlay = $("overlay"), menuBtn = $("menuBtn");
  function setMenu(open){
    if (!overlay) return;
    overlay.classList.toggle("open", open); overlay.setAttribute("aria-hidden", !open); menuBtn.setAttribute("aria-expanded", open);
    if (open) overlay.querySelector("nav a").focus();
  }
  if (overlay) {
    menuBtn.addEventListener("click", () => setMenu(true));
    $("closeBtn").addEventListener("click", () => { setMenu(false); menuBtn.focus(); });
    overlay.querySelectorAll('nav a[href^="#"]').forEach(a => a.addEventListener("click", () => setMenu(false)));
  }
  addEventListener("keydown", e => { if (e.key === "Escape") { setMenu(false); if (notch) notch.classList.remove("open"); } });
  const root = document.documentElement, themeBtn = $("themeBtn"), themeIcon = $("themeIcon");
  const MOON = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
  const SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  function paintIcon(){ if (!themeIcon) return; const d = isDark(); themeIcon.innerHTML = d ? SUN : MOON; themeBtn.setAttribute("aria-label", d ? "Switch to light mode" : "Switch to dark mode"); }
  paintIcon();
  if (themeBtn) themeBtn.addEventListener("click", () => { root.dataset.theme = isDark() ? "light" : "dark"; try { localStorage.setItem("sew-theme", root.dataset.theme); } catch (e) {} paintIcon(); });

  /* ---------- Contact form → WhatsApp ---------- */
  const cf = $("contactForm");
  if (cf) cf.addEventListener("submit", e => {
    e.preventDefault();
    const err = $("formErr"), name = cf.name.value.trim(), msg = cf.msg.value.trim();
    if (!name) { err.textContent = "Add your name so I know who’s writing."; cf.name.focus(); return; }
    if (!msg) { err.textContent = "Write a short message before sending."; cf.msg.focus(); return; }
    err.textContent = "";
    window.open(waLink("Namaskar Sir, I’m " + name + " (" + cf.who.value + (cf.cls.value ? ", " + cf.cls.value : "") + ").\n\n" + msg), "_blank", "noopener");
  });
  if ($("yr")) $("yr").textContent = new Date().getFullYear();
  document.querySelectorAll(".art .lns").forEach(g => { const c = g.cloneNode(true); c.setAttribute("class", "alt"); c.setAttribute("filter", "url(#pencil-b)"); g.parentNode.insertBefore(c, g); });

  /* ---------- Reviews: saved in Supabase, updated live ---------- */
  (function reviewsModule(){
    const list = $("rvList"), heroRating = $("heroRating");
    if (!list && !heroRating) return;
    const form = $("rvForm"), errEl = $("rvErr"), okEl = $("rvOk"), moreBtn = $("rvMore"), liveTxt = $("rvLive"), toast = $("rvToast"), btn = $("rvSubmit");
    const configured = !!SB, db = SB;
    let reviews = [], shown = 4;
    const fresh = new Set();
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const UNITS = [["minute", 60], ["hour", 3600], ["day", 86400], ["week", 604800], ["month", 2629800], ["year", 31557600]];
    function ago(t){
      const s = (new Date(t) - Date.now()) / 1000, a = Math.abs(s);
      if (a < 45) return "just now";
      let u = UNITS[0]; for (const x of UNITS) if (a >= x[1]) u = x;
      return rtf.format(Math.round(s / u[1]), u[0]);
    }
    const stars = n => "★".repeat(n) + '<span class="off">' + "★".repeat(5 - n) + "</span>";
    function uuid(){
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
      const b = crypto.getRandomValues(new Uint8Array(16)); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
      const h = [...b].map(x => x.toString(16).padStart(2, "0")).join("");
      return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
    }
    function card(r){
      const el = document.createElement("figure");
      el.className = "quote" + (fresh.has(r.id) ? " fresh" : "");
      el.innerHTML = '<span class="stars" role="img"></span><blockquote></blockquote><figcaption><i></i><div><span class="who"></span><span class="when"></span></div></figcaption>';
      const st = el.querySelector(".stars"); st.innerHTML = stars(r.rating); st.setAttribute("aria-label", "Rated " + r.rating + " out of 5");
      el.querySelector("blockquote").textContent = r.message;
      el.querySelector("i").textContent = (r.name.trim()[0] || "?").toUpperCase();
      el.querySelector(".who").textContent = r.name;
      const w = el.querySelector(".when"); w.dataset.role = r.role;
      if (r.created_at) { w.dataset.t = r.created_at; w.textContent = r.role + ", " + ago(r.created_at); } else w.textContent = r.role;
      return el;
    }
    function render(){
      const n = reviews.length, avg = n ? reviews.reduce((s, r) => s + r.rating, 0) / n : 0;
      if (heroRating) {
        heroRating.hidden = !n;
        if (n) { $("heroStars").innerHTML = stars(Math.round(avg)); $("heroAvg").textContent = avg.toFixed(1); $("heroCount").textContent = n + (n === 1 ? " review" : " reviews"); }
      }
      if (!list) return;
      $("rvAvg").textContent = n ? avg.toFixed(1) : "–";
      $("rvCount").textContent = n ? "Based on " + n + (n === 1 ? " review" : " reviews") : "No reviews yet";
      $("rvAvgStars").innerHTML = stars(Math.round(avg));
      $("rvAvg").parentElement.hidden = !n; $("rvInvite").hidden = !!n;
      const items = n ? reviews : SAMPLE_REVIEWS;
      list.innerHTML = "";
      if (!items.length) list.innerHTML = '<p class="rv-empty">No reviews yet. Be the first to share what learning with Samir Sir is like.</p>';
      items.slice(0, shown).forEach(r => list.appendChild(card(r)));
      moreBtn.hidden = items.length <= shown;
      fresh.clear();
      refreshScroll();
    }
    let toastTimer;
    function notify(r){
      if (!toast) return;
      toast.textContent = "New review from " + r.name + ", " + r.rating + "★";
      toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 4200);
    }
    function upsert(r, opts){
      if (!r || !r.id) return;
      const i = reviews.findIndex(x => x.id === r.id);
      if (i > -1) reviews[i] = r;
      else { reviews.unshift(r); if (opts.highlight) fresh.add(r.id); if (opts.toast) notify(r); }
      reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      render();
    }
    function remove(id){ if (!id) return; reviews = reviews.filter(r => r.id !== id); render(); }
    function setLive(state){
      if (!liveTxt) return;
      liveTxt.parentElement.classList.toggle("off", state !== "live");
      liveTxt.parentElement.hidden = state === "preview";
      liveTxt.textContent = { live: "Live", connecting: "Connecting…", offline: "Offline, showing saved reviews", preview: "Preview mode" }[state];
    }
    async function start(){
      if (!configured) { if ($("rvPreview")) $("rvPreview").hidden = false; setLive("preview"); render(); return; }
      if (list) list.innerHTML = '<div class="rv-skel"></div><div class="rv-skel"></div>';
      setLive("connecting");
      const { data, error } = await db.from("reviews").select("id, created_at, name, role, rating, message").order("created_at", { ascending: false }).limit(500);
      if (error) { setLive("offline"); reviews = []; render(); return; }
      reviews = data || []; render();
      if (!list) return;
      db.channel("reviews-live")
        .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, p => {
          if (p.eventType === "DELETE") return remove(p.old && p.old.id);
          const r = p.new;
          if (r.approved === false) return remove(r.id);
          upsert({ id: r.id, created_at: r.created_at, name: r.name, role: r.role, rating: r.rating, message: r.message }, { highlight: true, toast: true });
        })
        .subscribe(s => setLive(s === "SUBSCRIBED" ? "live" : (s === "CHANNEL_ERROR" || s === "TIMED_OUT" || s === "CLOSED") ? "offline" : "connecting"));
    }
    window.__reviewsRender = () => { readSamples(); render(); };
    if (list && form) {
      const rate = form.querySelector(".rate-stars");
      const checked = () => (form.querySelector(".rate-stars input:checked") || {}).value || "";
      const paint = v => rate.dataset.v = v;
      rate.querySelectorAll("input").forEach(i => i.addEventListener("change", () => paint(i.value)));
      rate.querySelectorAll("label").forEach((l, k) => l.addEventListener("mouseenter", () => paint(k + 1)));
      rate.addEventListener("mouseleave", () => paint(checked()));
      form.message.addEventListener("input", () => $("rvChars").textContent = form.message.value.length);
      moreBtn.addEventListener("click", () => { shown += 4; render(); });
      const dlg = $("rvDialog");
      const openDlg = () => { okEl.hidden = true; errEl.textContent = ""; dlg.showModal ? dlg.showModal() : dlg.setAttribute("open", ""); };
      const closeDlg = () => { dlg.close ? dlg.close() : dlg.removeAttribute("open"); };
      $("rvOpen").addEventListener("click", openDlg);
      $("rvClose").addEventListener("click", closeDlg);
      dlg.addEventListener("click", e => { if (e.target === dlg) closeDlg(); });
      setInterval(() => list.querySelectorAll(".when[data-t]").forEach(w => w.textContent = w.dataset.role + ", " + ago(w.dataset.t)), 60000);
      const fail = (msg, el) => { errEl.textContent = msg; if (el) el.focus(); };
      form.addEventListener("submit", async e => {
        e.preventDefault(); errEl.textContent = ""; okEl.hidden = true;
        const name = form.name.value.trim(), role = form.role.value, message = form.message.value.trim(), rating = +checked();
        if (form.website.value) { form.reset(); paint(""); okEl.textContent = "Thank you! Your review has been posted."; okEl.hidden = false; return; }
        if (!rating) return fail("Choose a star rating from 1 to 5.", rate.querySelector("input"));
        if (name.length < 2) return fail("Add your name (at least 2 letters).", form.name);
        if (message.length < 10) return fail("Write a little more: at least 10 characters.", form.message);
        let last = 0; try { last = +localStorage.getItem("sew-review") || 0; } catch (x) {}
        if (db && Date.now() - last < 6 * 3600e3) return fail("You’ve already posted a review from this device. Thank you!");
        const row = { id: uuid(), name, role, rating, message };
        btn.disabled = true; btn.firstChild.textContent = "Posting…";
        try {
          if (db) { const { error } = await db.from("reviews").insert(row); if (error) throw error; }
          try { if (db) localStorage.setItem("sew-review", String(Date.now())); } catch (x) {}
          form.reset(); paint(""); $("rvChars").textContent = "0";
          if (db && REVIEWS_NEED_APPROVAL) okEl.textContent = "Thank you! Your review will appear once Samir Sir approves it.";
          else { upsert({ ...row, created_at: new Date().toISOString() }, { highlight: true, toast: false }); okEl.textContent = db ? "Thank you! Your review is live." : "Preview: your review shows below but isn’t saved yet."; }
          okEl.hidden = false;
          setTimeout(() => { if (dlg.open) closeDlg(); }, 2200);
        } catch (x) {
          fail(String((x && x.message) || "").includes("Too many") ? "Lots of reviews are coming in right now. Please try again in a few minutes." : "Your review couldn’t be posted. Check your internet connection and try again.");
        } finally { btn.disabled = false; btn.firstChild.textContent = "Post review"; }
      });
    }
    start();
  })();

  /* ---------- Editable content saved from admin.html ---------- */
  document.addEventListener("content:applied", e => {
    const c = e.detail || {};
    if (c.contact && c.contact.phone) WHATSAPP_NUMBER = SiteContent.whatsapp(c.contact.phone);
    refreshLinks();
    if (window.__reviewsRender) window.__reviewsRender();
    const h1 = $("hero-title");
    if (h1) h1.setAttribute("aria-label", [...h1.querySelectorAll(".hl")].map(l => l.textContent.replace(/\s+/g, " ").trim()).join(" "));
    refreshScroll();
  });
  if (window.SiteContent) {
    try { const cached = JSON.parse(localStorage.getItem("sew-content-v2") || "null"); if (cached) SiteContent.apply(document, cached); } catch (x) {}
    if (SB) SB.from("site_content").select("data").eq("id", "site").maybeSingle().then(({ data }) => {
      if (!data || !data.data) return;
      SiteContent.apply(document, data.data);
      try { localStorage.setItem("sew-content-v2", JSON.stringify(data.data)); } catch (x) {}
    });
  }

  /* ---------- Motion (starts as the loading screen lifts) ---------- */
  if (!window.gsap || !window.ScrollTrigger || reduce) return;
  whenRevealed(initMotion);

  function initMotion(){
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.clearScrollMemory("manual");
    motionOn = true;
    const has = sel => document.querySelector(sel);
    let lenis = null;
    if (window.Lenis) {
      lenis = new Lenis({ lerp: 0.09 });
      lenis.scrollTo(0, { immediate: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    document.querySelectorAll('a[href^="#"]:not(.wa)').forEach(a => a.addEventListener("click", e => {
      const id = a.getAttribute("href"); if (id.length < 2) return;
      const el = id === "#top" ? null : document.querySelector(id);
      if (id !== "#top" && !el) return;
      e.preventDefault(); setMenu(false);
      lenis ? lenis.scrollTo(el || 0, { offset: -80, duration: 1.4 }) : (el || document.body).scrollIntoView({ behavior: "smooth" });
    }));

    // Headings: words rise, script words are "written" left to right
    document.querySelectorAll("[data-split]").forEach(h => {
      h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
      const parts = [];
      h.childNodes.forEach(n => {
        if (n.nodeType === 3) n.textContent.split(/\s+/).filter(Boolean).forEach(w => parts.push('<span class="w" aria-hidden="true"><span>' + w + "</span></span>"));
        else if (n.nodeType === 1) { n.setAttribute("aria-hidden", "true"); n.classList.add("sw"); parts.push(n.outerHTML); }
      });
      h.innerHTML = parts.join(" ");
      gsap.timeline({ scrollTrigger: { trigger: h, start: "top 88%", once: true } })
        .from(h.querySelectorAll(".w > span"), { yPercent: 115, duration: 1, ease: "power4.out", stagger: 0.07 })
        .fromTo(h.querySelectorAll(".sw"), { clipPath: "inset(-20% 100% -40% 0)" }, { clipPath: "inset(-20% 0% -40% 0)", duration: 1.1, ease: "power2.inOut" }, 0.25);
    });

    // Header comes in on every page
    gsap.from(".notch-btn", { yPercent: -110, duration: 0.9, ease: "power3.out" });
    gsap.from(".brand, .head-right", { y: -30, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.1 });
    gsap.from(".fab", { scale: 0, duration: 0.7, ease: "back.out(2)", delay: has(".hero") ? 2.2 : 0.6 });

    // Home: hero intro
    if (has(".hero")) {
      gsap.set("#heroImg", { "--rv": 0 });
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from("#heroBadge", { y: 20, opacity: 0, duration: 0.7 }, 0.1)
        .from(".hero-title .wd", { yPercent: 115, duration: 1.1, ease: "power4.out", stagger: 0.12 }, 0.2)
        .fromTo(".hero-title .sw", { clipPath: "inset(-20% 100% -40% 0)" }, { clipPath: "inset(-20% 0% -40% 0)", duration: 1.2, ease: "power2.inOut", stagger: 0.35 }, 0.5)
        .from(".hero-title .pw", { scale: 0, rotate: -12, duration: 0.9, ease: "back.out(2)", stagger: 0.2 }, 0.7)
        .from(".hero-lede, .role, .hero-cta", { y: 30, opacity: 0, duration: 0.9, stagger: 0.12 }, 1)
        .from("#heroCard", { y: 80, rotate: 3, opacity: 0, duration: 1.3 }, 0.3)
        .to("#heroImg", { "--rv": 130, duration: 2.2, ease: "power2.inOut" }, 0.8)
        .from(".sig strong", { y: 30, opacity: 0, duration: 0.8 }, 1.7)
        .fromTo(".sig .script", { clipPath: "inset(-30% 100% -50% 0)" }, { clipPath: "inset(-30% 0% -50% 0)", duration: 1.3, ease: "power2.inOut" }, 2);
      gsap.to("#heroCard", { yPercent: 8, rotate: -2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero-title", { yPercent: -12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    }
    if (has(".stats")) ScrollTrigger.create({ trigger: ".stats", start: "top 92%", once: true, onEnter: () => document.querySelectorAll("[data-count]").forEach(el => {
      const n = +el.dataset.count, o = { v: 0 };
      if (!n) return;
      el._tw = gsap.to(o, { v: n, duration: 2, ease: "power2.out", onUpdate: () => el.textContent = Math.round(o.v).toLocaleString("en-IN") });
    }) });

    // Progress line + header that hides on the way down
    gsap.to(".progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
    const head = $("head");
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: s => head.classList.toggle("hide", s.direction === 1 && s.scroll() > 240 && !(notch && notch.classList.contains("open"))) });

    // About: the drawing fills in
    if (has("#aboutImg")) {
      gsap.set("#aboutImg", { "--rv": 0 });
      const first = has("#about.page-first");
      gsap.to("#aboutImg", first ? { "--rv": 130, duration: 2.2, ease: "power2.inOut", delay: 0.2 } : { "--rv": 130, ease: "none", scrollTrigger: { trigger: "#about", start: "top 80%", end: "center 50%", scrub: 1 } });
      gsap.from("#aboutCard", first ? { y: 60, rotate: -2, opacity: 0, duration: 1.2, ease: "power3.out" } : { scale: 0.92, rotate: -2, ease: "none", scrollTrigger: { trigger: "#about", start: "top 90%", end: "center 50%", scrub: 1 } });
    }

    // Reveals
    gsap.set(".reveal", { y: 50, opacity: 0 });
    ScrollTrigger.batch(".reveal", { start: "top 92%", once: true, onEnter: b => gsap.to(b, { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.09 }) });

    // Marquee reacts to scroll
    if (has(".marquee-track")) {
      const mq = gsap.to(".marquee-track", { xPercent: -50, repeat: -1, duration: 32, ease: "none" });
      ScrollTrigger.create({ start: 0, end: "max", onUpdate: s => {
        const boost = 1 + Math.min(Math.abs(s.getVelocity()) / 400, 5);
        gsap.timeline({ overwrite: true }).to(mq, { timeScale: s.direction * boost, duration: 0.2 }).to(mq, { timeScale: s.direction, duration: 1 });
      }});
    }
    if (has("#timeline")) gsap.fromTo(".tl-fill", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "#timeline", start: "top 70%", end: "bottom 60%", scrub: true } });

    // Notes: drawings draw themselves as you scroll
    document.querySelectorAll(".note").forEach(p => {
      const lines = [...p.querySelectorAll(".lns path, .alt path, .acc")];
      lines.forEach(l => { const n = l.getTotalLength(); l.style.strokeDasharray = n; l.style.strokeDashoffset = n; });
      gsap.timeline({ scrollTrigger: { trigger: p, start: "top 92%", end: "center 55%", scrub: true } }).to(lines, { strokeDashoffset: 0, ease: "none", stagger: 0.05 });
    });

    // Cursor + magnetic buttons (mouse only)
    if (matchMedia("(pointer: fine)").matches) {
      const ring = document.querySelector(".cursor"), dot = document.querySelector(".cursor-dot");
      const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" }), ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
      const dx = gsap.quickTo(dot, "x", { duration: 0.08 }), dy = gsap.quickTo(dot, "y", { duration: 0.08 });
      addEventListener("mousemove", e => { rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); ring.classList.add("on"); dot.classList.add("on"); });
      document.addEventListener("mouseleave", () => { ring.classList.remove("on"); dot.classList.remove("on"); });
      document.addEventListener("mouseover", e => { if (e.target.closest("a, button, select, input, textarea")) ring.classList.add("big"); });
      document.addEventListener("mouseout", e => { if (e.target.closest("a, button, select, input, textarea")) ring.classList.remove("big"); });
      document.querySelectorAll(".magnetic").forEach(b => {
        const mx = gsap.quickTo(b, "x", { duration: 0.4, ease: "power3" }), my = gsap.quickTo(b, "y", { duration: 0.4, ease: "power3" });
        b.addEventListener("mousemove", e => { const r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.25); my((e.clientY - r.top - r.height / 2) * 0.35); });
        b.addEventListener("mouseleave", () => { mx(0); my(0); });
      });
    }
    addEventListener("load", () => { window.scrollTo(0, 0); if (lenis) lenis.scrollTo(0, { immediate: true }); ScrollTrigger.refresh(); });
    ScrollTrigger.refresh();
  }
})();
