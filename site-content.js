/* Samir Edu World — editable content.
   Shared by index.html (applies saved content to the page) and admin.html (builds the edit form).
   Every editable spot in index.html is marked with data-c, data-list, data-img, data-href or data-json. */
(function (global) {
  "use strict";

  const SCHEMA = [
    { id: "profile", title: "Name and contact", fields: [
      { key: "profile.name", label: "Your name", type: "text" },
      { key: "profile.hashtag", label: "Hashtag under your photo", type: "text" },
      { key: "profile.tagline", label: "Short line in the menu", type: "text" },
      { key: "contact.phone", label: "Phone and WhatsApp number", type: "phone", help: "10-digit mobile number. Every call and WhatsApp button uses it." },
      { key: "contact.email", label: "Email", type: "email" },
      { key: "contact.teachesAt", label: "Where you teach (contact section)", type: "text" },
      { key: "contact.lead", label: "Message in the contact section", type: "textarea" },
      { key: "notch.short", label: "Top pill, first word", type: "text", help: "The black pill at the very top of the page." },
      { key: "notch.long", label: "Top pill, rest of the text", type: "text" }
    ]},
    { id: "hero", title: "Top of the page", fields: [
      { key: "hero.badge", label: "Small badge above the headline", type: "text" },
      { key: "hero.word1", label: "First blue word", type: "text", help: "The headline reads: Teaching [first] and [second] since [year]." },
      { key: "hero.word2", label: "Second blue word", type: "text" },
      { key: "hero.year", label: "Teaching since (year)", type: "text" },
      { key: "hero.lede", label: "Intro paragraph", type: "textarea" },
      { type: "heading", label: "The two small cards" },
      { key: "roles.college.label", label: "First card, small text", type: "text" },
      { key: "roles.college.value", label: "First card, big text", type: "text" },
      { key: "roles.tuition.label", label: "Second card, small text", type: "text" },
      { key: "roles.tuition.value", label: "Second card, big text", type: "text" }
    ]},
    { id: "photos", title: "Photos", fields: [
      { key: "photos.hero", label: "Main photo (top of the page)", type: "image", aspect: 960 / 1300 },
      { key: "photos.about", label: "About photo", type: "image", aspect: 960 / 1368 }
    ]},
    { id: "stats", title: "Numbers", fields: [
      { key: "stats", label: "Number", type: "items", fixed: 4, fields: [
        { key: "num", label: "Number", type: "text" },
        { key: "suffix", label: "After the number", type: "text", help: "For example + (leave empty for nothing)" },
        { key: "label", label: "Label", type: "text" }
      ]}
    ]},
    { id: "where", title: "Who I teach", fields: [
      { type: "heading", label: "Political Science card" },
      { key: "where.pol.title", label: "Title", type: "text" },
      { key: "where.pol.text", label: "Description", type: "textarea" },
      { key: "where.pol.tags", label: "Topics", type: "list" },
      { type: "heading", label: "Education card" },
      { key: "where.edu.title", label: "Title", type: "text" },
      { key: "where.edu.text", label: "Description", type: "textarea" },
      { key: "where.edu.tags", label: "Topics", type: "list" }
    ]},
    { id: "about", title: "About me", fields: [
      { key: "about.p1", label: "First paragraph", type: "textarea" },
      { key: "about.p2", label: "Second paragraph", type: "textarea" },
      { key: "about.facts", label: "Fact", type: "items", fixed: 4, fields: [
        { key: "label", label: "Label", type: "text" },
        { key: "value", label: "Value", type: "text" }
      ]}
    ]},
    { id: "subjects", title: "Subjects", fields: [
      { type: "heading", label: "Political Science card" },
      { key: "subjects.pol.title", label: "Title", type: "text" },
      { key: "subjects.pol.text", label: "Description", type: "textarea" },
      { key: "subjects.pol.topics", label: "Topics", type: "list" },
      { key: "subjects.pol.tags", label: "Tags", type: "list" },
      { type: "heading", label: "Education card" },
      { key: "subjects.edu.title", label: "Title", type: "text" },
      { key: "subjects.edu.text", label: "Description", type: "textarea" },
      { key: "subjects.edu.topics", label: "Topics", type: "list" },
      { key: "subjects.edu.tags", label: "Tags", type: "list" },
      { type: "heading", label: "Answer writing card" },
      { key: "subjects.answer.title", label: "Title", type: "text" },
      { key: "subjects.answer.text", label: "Description", type: "textarea" },
      { type: "heading", label: "Assignments card" },
      { key: "subjects.projects.title", label: "Title", type: "text" },
      { key: "subjects.projects.text", label: "Description", type: "textarea" },
      { type: "heading", label: "Exam preparation card (blue)" },
      { key: "subjects.exams.title", label: "Title", type: "text" },
      { key: "subjects.exams.text", label: "Description", type: "textarea" },
      { type: "heading", label: "How a class works" },
      { key: "subjects.how.title", label: "Title", type: "text" },
      { key: "subjects.how.steps", label: "Step", type: "items", fixed: 3, fields: [
        { key: "title", label: "Step name", type: "text" },
        { key: "text", label: "Description", type: "text" }
      ]},
      { type: "heading", label: "Tuition card" },
      { key: "subjects.tuition.title", label: "Title", type: "text" },
      { key: "subjects.tuition.text", label: "Description", type: "textarea" },
      { key: "subjects.tuition.tags", label: "Tags", type: "list" }
    ]},
    { id: "notes", title: "Free notes", note: "Each note keeps its drawing. You can change all of its text.", fields: [
      { key: "notes.intro", label: "Intro text", type: "textarea" },
      { key: "notes.items", label: "Note", type: "items", fixed: 6, fields: [
        { key: "subject", label: "Subject", type: "text" },
        { key: "level", label: "Classes", type: "text" },
        { key: "title", label: "Title", type: "text" },
        { key: "text", label: "Description", type: "textarea" }
      ]}
    ]},
    { id: "journey", title: "Journey", fields: [
      { key: "journey", label: "Milestone", type: "items", add: "Add a milestone", fields: [
        { key: "year", label: "Year", type: "text" },
        { key: "title", label: "Title", type: "text" },
        { key: "text", label: "Description", type: "textarea" }
      ]}
    ]},
    { id: "samples", title: "Sample reviews", note: "These show only until the first real review is posted. Then the real reviews replace them automatically.", fields: [
      { key: "reviews.samples", label: "Sample review", type: "items", json: true, add: "Add a sample review", fields: [
        { key: "name", label: "Name", type: "text" },
        { key: "role", label: "Who they are", type: "text" },
        { key: "rating", label: "Stars", type: "rating" },
        { key: "message", label: "Review", type: "textarea" }
      ]}
    ]}
  ];

  const get = (o, p) => p.split(".").reduce((a, k) => (a == null ? undefined : a[k]), o);
  function set(o, p, v) {
    const ks = p.split("."); let a = o;
    for (let i = 0; i < ks.length - 1; i++) {
      if (a[ks[i]] == null) a[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {};
      a = a[ks[i]];
    }
    a[ks[ks.length - 1]] = v;
  }
  const digits = s => String(s == null ? "" : s).replace(/\D/g, "");
  const national = s => { const d = digits(s); return d.length > 10 && d.startsWith("91") ? d.slice(-10) : d; };
  const phoneDisplay = s => { const n = national(s); return n.length === 10 ? "+91 " + n.slice(0, 5) + " " + n.slice(5) : String(s); };
  const whatsapp = s => { const n = national(s); return n.length === 10 ? "91" + n : n; };

  function textOf(el) {
    let t = el.textContent.replace(/\s+/g, " ").trim();
    const sfx = el.getAttribute("data-suffix");
    if (sfx && t.endsWith(sfx)) t = t.slice(0, -sfx.length);
    if (el.getAttribute("data-fmt") === "phone") t = national(t);
    if (el.getAttribute("data-fmt") === "count") t = t.replace(/,/g, "");
    return t;
  }

  // Read the content currently on a page (used by the admin page to get the defaults from index.html)
  function read(doc) {
    const c = {};
    SCHEMA.forEach(sec => sec.fields.forEach(f => {
      if (!f.key) return;
      if (f.type === "list") {
        const box = doc.querySelector('[data-list="' + f.key + '"]');
        if (box) set(c, f.key, [...box.children].map(ch => ch.textContent.trim()));
      } else if (f.type === "items" && f.json) {
        const s = doc.querySelector('[data-json="' + f.key + '"]');
        if (s) try { set(c, f.key, JSON.parse(s.textContent)); } catch (e) {}
      } else if (f.type === "items" && f.fixed) {
        if (!doc.querySelector('[data-c^="' + f.key + '.0."]')) return;
        const arr = [];
        for (let i = 0; i < f.fixed; i++) {
          const o = {};
          f.fields.forEach(g => { const el = doc.querySelector('[data-c="' + f.key + "." + i + "." + g.key + '"]'); o[g.key] = el ? textOf(el) : ""; });
          arr.push(o);
        }
        set(c, f.key, arr);
      } else if (f.type === "items") {
        const box = doc.querySelector('[data-list="' + f.key + '"]');
        if (box) set(c, f.key, [...box.children].map(ch => {
          const o = {};
          f.fields.forEach(g => { const el = ch.querySelector('[data-i="' + g.key + '"]'); o[g.key] = el ? el.textContent.trim() : ""; });
          return o;
        }));
      } else if (f.type === "image") {
        const el = doc.querySelector('[data-img="' + f.key + '"]');
        if (el) set(c, f.key, el.getAttribute("src"));
      } else {
        const el = doc.querySelector('[data-c="' + f.key + '"]');
        if (el) set(c, f.key, textOf(el));
      }
    }));
    return c;
  }

  // Write saved content into the page
  function apply(doc, c) {
    if (!c || typeof c !== "object") return;
    doc.querySelectorAll("[data-c]").forEach(el => {
      const v = get(c, el.getAttribute("data-c"));
      if (v == null || typeof v === "object") return;
      const fmt = el.getAttribute("data-fmt");
      if (fmt === "phone") el.textContent = phoneDisplay(v);
      else if (fmt === "count") {
        if (el._tw) el._tw.kill();
        const d = String(v).replace(/,/g, "").trim();
        if (/^\d+$/.test(d)) { el.setAttribute("data-count", d); el.textContent = Number(d).toLocaleString("en-IN"); }
        else { el.removeAttribute("data-count"); el.textContent = v; }
      } else el.textContent = String(v) + (el.getAttribute("data-suffix") || "");
    });
    doc.querySelectorAll("[data-href]").forEach(el => {
      const [k, kind] = el.getAttribute("data-href").split("|");
      const v = get(c, k);
      if (!v) return;
      el.setAttribute("href", kind === "tel" ? "tel:+91" + national(v) : "mailto:" + String(v).trim());
    });
    doc.querySelectorAll("[data-img]").forEach(el => { const v = get(c, el.getAttribute("data-img")); if (v) el.setAttribute("src", v); });
    doc.querySelectorAll("[data-json]").forEach(el => { const v = get(c, el.getAttribute("data-json")); if (Array.isArray(v)) el.textContent = JSON.stringify(v); });
    doc.querySelectorAll("[data-list]").forEach(box => {
      const v = get(c, box.getAttribute("data-list"));
      if (!Array.isArray(v)) return;
      if (!box._tpl && box.firstElementChild) box._tpl = box.firstElementChild.cloneNode(true);
      if (!box._tpl) return;
      box.innerHTML = "";
      v.forEach(item => {
        const n = box._tpl.cloneNode(true);
        n.removeAttribute("style");
        if (typeof item === "string") n.textContent = item;
        else n.querySelectorAll("[data-i]").forEach(el => { el.textContent = item[el.getAttribute("data-i")] || ""; });
        box.appendChild(n);
      });
    });
    doc.dispatchEvent(new CustomEvent("content:applied", { detail: c }));
  }

  global.SiteContent = { SCHEMA, read, apply, get, set, phoneDisplay, whatsapp, national };
})(window);
