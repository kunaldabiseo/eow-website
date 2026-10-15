/* EOW mobile + tablet behaviour. Runs only at max-width:1080px and undoes itself above that,
   so the desktop experience (Lenis, pinned sections, sideways services) is untouched. */
(function(){
"use strict";
const MQ = matchMedia("(max-width:1080px)"), PHONE = matchMedia("(max-width:720px)");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const G = window.gsap;
const parts = [];                 // each part: {on(), off()}

/* ---------- header height -> CSS variable (anchors and the chapter label use it) ---------- */
const header = $("#header") || $(".header");
const setHead = () => { if (header) document.documentElement.style.setProperty("--m-head", Math.round(header.getBoundingClientRect().height) + "px"); };

/* ---------- 1. chapter label: once a section's own heading has scrolled away, a small label
   under the header keeps telling the reader where they are ---------- */
parts.push((() => {
  let el, secs = [], tick = false, onScroll;
  const label = s => { const e = $(".sec-head .eyebrow, .eyebrow, .ex-kicker", s); const h = $("h2", s);
    return ((e && e.textContent.trim()) || (h && h.textContent.trim()) || "").replace(/^\d+\s*/, "").slice(0, 46); };
  const update = () => { tick = false; if (!el) return;
    const top = (header ? header.getBoundingClientRect().bottom : 0) + 4; let cur = -1;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= top + 40) cur = i; });
    const s = secs[cur]; let show = false;
    if (s && s.getBoundingClientRect().bottom > top + 120) { const h = $(".sec-head", s) || $("h2", s); show = !h || h.getBoundingClientRect().bottom < top; }
    if (show) { const t = `<b>${String(cur + 1).padStart(2, "0")}/${String(secs.length).padStart(2, "0")}</b>${label(s)}`; if (el.innerHTML !== t) el.innerHTML = t; }
    el.classList.toggle("on", show); };
  // inner pages: the article's own h2s act as chapters
  let hs = [];
  const innerUpdate = () => { tick = false; if (!el) return;
    const top = (header ? header.getBoundingClientRect().bottom : 0) + 4; let cur = -1;
    hs.forEach((h, i) => { if (h.getBoundingClientRect().bottom < top) cur = i; });
    const body = $(".ip-body, .sp"); const inBody = body && body.getBoundingClientRect().bottom > top + 120;
    const show = cur >= 0 && inBody;
    if (show) { const t = `<b>${String(cur + 1).padStart(2, "0")}/${String(hs.length).padStart(2, "0")}</b>${hs[cur].textContent.trim().slice(0, 46)}`; if (el.innerHTML !== t) el.innerHTML = t; }
    el.classList.toggle("on", show); };
  const innerOn = () => { hs = $$(".ip-body .prose h2, .sp h2").filter(h => h.offsetParent !== null && h.textContent.trim().length > 3 && !h.closest(".ip-mail, .sp-mailbox, .sc"));
    if (hs.length < 3) return;
    el = document.createElement("div"); el.className = "m-chapter"; el.setAttribute("aria-hidden", "true"); document.body.appendChild(el);
    onScroll = () => { if (!tick) { tick = true; requestAnimationFrame(innerUpdate); } };
    addEventListener("scroll", onScroll, {passive: true}); innerUpdate(); };
  return {
    on(){ secs = $$("main > section[id]:not(.hero)").filter(s => label(s));
      if (!secs.length) return innerOn();
      el = document.createElement("div"); el.className = "m-chapter"; el.setAttribute("aria-hidden", "true"); document.body.appendChild(el);
      onScroll = () => { if (!tick) { tick = true; requestAnimationFrame(update); } };
      addEventListener("scroll", onScroll, {passive: true}); update(); },
    off(){ if (onScroll) removeEventListener("scroll", onScroll); if (el) el.remove(); el = onScroll = null; }
  };
})());

/* ---------- 2. services: tap-to-open list instead of the sideways track ---------- */
parts.push((() => {
  const track = $("#svcTrack"); let made = [];
  const open = (card, on, animate) => {
    card.classList.toggle("m-open", on); const btn = $(".m-svc-head", card), body = $(".m-svc-body", card);
    if (btn) btn.setAttribute("aria-expanded", on);
    if (on && animate && G && !reduce && body) G.fromTo(body, {opacity: 0, y: -6}, {opacity: 1, y: 0, duration: .35, ease: "power2.out", clearProps: "opacity,transform"});
  };
  return {
    on(){ if (!track) return; const cards = $$(".card", track);
      cards.forEach((card, i) => {
        const h3 = $("h3", card), p = $("p", card), foot = $(".svc-foot", card), num = $(".num", card);
        if (!h3) return;
        const id = "m-svc-" + i;
        const btn = document.createElement("button"); btn.type = "button"; btn.className = "m-svc-head"; btn.setAttribute("aria-controls", id);
        btn.innerHTML = `<span class="m-n">${String(i + 1).padStart(2, "0")}</span>`;
        const body = document.createElement("div"); body.className = "m-svc-body"; body.id = id;
        // move the real heading, text and tags (no copies), and remember where they came from
        const rec = {card, btn, body, nodes: []};
        [h3, p, foot].forEach(n => { if (n) rec.nodes.push({n, parent: n.parentNode, next: n.nextSibling}); });
        if (num) { rec.nodes.push({n: num, parent: num.parentNode, next: num.nextSibling}); num.hidden = true; }
        btn.appendChild(h3); btn.insertAdjacentHTML("beforeend", '<span class="m-chev" aria-hidden="true">+</span>');
        if (p) body.appendChild(p); if (foot) body.appendChild(foot);
        card.prepend(body); card.prepend(btn);
        btn.addEventListener("click", () => { const was = card.classList.contains("m-open"); cards.forEach(c => c !== card && open(c, false)); open(card, !was, true); });
        made.push(rec); open(card, i === 0, false);
      }); },
    off(){ made.reverse().forEach(r => { r.nodes.reverse().forEach(({n, parent, next}) => { if (n.classList && n.classList.contains("num")) n.hidden = false; parent.insertBefore(n, next && next.parentNode === parent ? next : null); });
        r.btn.remove(); r.body.remove(); r.card.classList.remove("m-open"); }); made = [];
      if (window.ScrollTrigger) ScrollTrigger.refresh(); }
  };
})());

/* ---------- 3. states: a native picker (phones) that drives the existing state chips ---------- */
parts.push((() => {
  let wrap;
  const chips = () => $$("#stateChips [data-code], #stateChips button, #stateChips a");
  const sync = () => { const sel = $("select", wrap || document.createElement("i")); const t = $("#statePanel h3"); if (sel && t) { const o = [...sel.options].find(o => o.textContent === t.textContent.trim()); if (o) sel.value = o.value; } };
  let mo;
  return {
    on(){ const box = $("#states .ex-card"), list = chips(); if (!box || !list.length) return;
      wrap = document.createElement("div"); wrap.className = "m-state-pick";
      wrap.innerHTML = `<label for="mStatePick">Pick a state</label><select id="mStatePick">${list.map((c, i) => `<option value="${i}">${(c.dataset.name || c.getAttribute("title") || c.textContent).replace(/\s+/g, " ").trim()}</option>`).join("")}</select>`;
      const filters = $(".filters", box); (filters || box.firstChild).after(wrap);
      const sel = $("select", wrap);
      // option text: use the chip's visible state name only
      [...sel.options].forEach((o, i) => { const c = list[i]; const nm = c.querySelector("b, .nm, span:last-child"); if (nm && nm.textContent.trim().length > 2) o.textContent = nm.textContent.trim(); });
      sel.addEventListener("change", () => { const c = chips()[+sel.value]; if (c) c.click(); });
      const panel = $("#statePanel"); if (panel) { mo = new MutationObserver(sync); mo.observe(panel, {subtree: true, childList: true, characterData: true}); }
      sync(); },
    off(){ if (mo) mo.disconnect(); if (wrap) wrap.remove(); wrap = mo = null; }
  };
})());

/* ---------- 4. footer: fold the link groups ---------- */
parts.push((() => {
  let made = [];
  return {
    on(){ if (!PHONE.matches) return; $$("footer .f-cols > div").forEach((col, i) => { const h = $("h4", col), ul = $("ul", col); if (!h || !ul) return;
        const btn = document.createElement("button"); btn.type = "button"; btn.className = "m-fold-btn"; btn.setAttribute("aria-expanded", "false");
        const addedId = !ul.id; if (addedId) ul.id = "mFold" + i; btn.setAttribute("aria-controls", ul.id);
        const rec = {col, h, next: h.nextSibling, btn, ul, addedId}; btn.appendChild(h); btn.insertAdjacentHTML("beforeend", '<i aria-hidden="true">+</i>'); col.prepend(btn); col.classList.add("m-fold");
        btn.addEventListener("click", () => { const o = !col.classList.contains("open"); col.classList.toggle("open", o); btn.setAttribute("aria-expanded", o); });
        made.push(rec); }); },
    off(){ made.forEach(r => { r.col.insertBefore(r.h, r.next && r.next.parentNode === r.col ? r.next : r.col.firstChild); r.btn.remove(); r.col.classList.remove("m-fold", "open"); if (r.addedId) r.ul.removeAttribute("id"); }); made = []; }
  };
})());

/* ---------- 5. light entrance for each section's heading (GSAP, small screens only) ---------- */
parts.push((() => {
  let ctx;
  return {
    on(){ if (!G || !window.ScrollTrigger || reduce) return;
      ctx = G.context(() => {
        $$("main > section .sec-head, #states .state-panel, #credentials .profile, #records .casefile").forEach(el => {
          G.from(el, {y: 18, opacity: 0, duration: .5, ease: "power2.out", clearProps: "transform,opacity", scrollTrigger: {trigger: el, start: "top 92%", once: true}});
        });
      }); },
    off(){ if (ctx) ctx.revert(); ctx = null; }
  };
})());

/* ---------- 6. credentials timeline: first three on phones, the rest one tap away ---------- */
parts.push((() => {
  let btn, tl;
  return {
    on(){ if (!PHONE.matches) return; tl = $("#timeline"); if (!tl) return; const items = $$(".tl", tl); if (items.length <= 3) return;
      items.slice(3).forEach(li => li.classList.add("m-more"));
      btn = document.createElement("button"); btn.type = "button"; btn.className = "m-tl-btn"; btn.setAttribute("aria-expanded", "false");
      const label = o => btn.innerHTML = `${o ? "Show fewer" : `Show all ${items.length} credentials`} <i aria-hidden="true">${o ? "↑" : "↓"}</i>`; label(false);
      btn.addEventListener("click", () => { const o = !tl.classList.contains("m-all"); tl.classList.toggle("m-all", o); btn.setAttribute("aria-expanded", o); label(o);
        if (!o) tl.scrollIntoView({block: "start", behavior: reduce ? "auto" : "smooth"}); });
      tl.after(btn); },
    off(){ if (tl) { tl.classList.remove("m-all"); $$(".tl", tl).forEach(li => li.classList.remove("m-more")); } if (btn) btn.remove(); btn = tl = null; }
  };
})());

/* ---------- 7. (removed: no on-page hash links) ---------- */
false && parts.push((() => {
  let nav;
  return {
    on(){ const prose = $(".ip-body .prose"); if (!prose) return;
      const hs = $$("h2", prose).filter(h => !h.closest(".ip-mail") && h.textContent.trim().length > 3);
      if (hs.length < 4) return;
      hs.forEach((h, i) => { if (!h.id) { h.id = "sec-" + (i + 1); h.dataset.mId = "1"; } });
      nav = document.createElement("nav"); nav.className = "m-toc"; nav.setAttribute("aria-label", "On this page");
      nav.innerHTML = `<span class="m-toc-t">On this page</span><ol>${hs.map(h => `<li><a href="#${h.id}">${h.textContent.trim().replace(/[:?]$/, "")}</a></li>`).join("")}</ol>`;
      prose.prepend(nav); },
    off(){ if (nav) nav.remove(); nav = null; $$("[data-m-id]").forEach(h => { h.removeAttribute("id"); h.removeAttribute("data-m-id"); }); }
  };
})());

/* ---------- 8. related section: show the nearest states first, the full list one tap away ---------- */
parts.push((() => {
  let made = [];
  return {
    on(){ if (!PHONE.matches) return; $$(".ip-related .rel-states").forEach(box => { const a = $$("a", box); if (a.length <= 8) return;
        a.slice(8).forEach(x => x.classList.add("m-more")); box.classList.add("m-fold-states");
        const b = document.createElement("button"); b.type = "button"; b.className = "m-more-btn"; b.setAttribute("aria-expanded", "false");
        const lab = o => b.innerHTML = `${o ? "Show fewer states" : `Show all ${a.length} states`} <i aria-hidden="true">${o ? "↑" : "↓"}</i>`; lab(false);
        b.addEventListener("click", () => { const o = !box.classList.contains("m-all"); box.classList.toggle("m-all", o); b.setAttribute("aria-expanded", o); lab(o); });
        box.after(b); made.push({box, b, a}); }); },
    off(){ made.forEach(({box, b, a}) => { a.forEach(x => x.classList.remove("m-more")); box.classList.remove("m-fold-states", "m-all"); b.remove(); }); made = []; }
  };
})());

/* ---------- lifecycle ---------- */
let active = false, phone = PHONE.matches;
const apply = () => {
  setHead();
  const want = MQ.matches;
  if (want && active && phone !== PHONE.matches) { parts.slice().reverse().forEach(p => p.off()); active = false; }   // phone <-> tablet: rebuild
  phone = PHONE.matches;
  if (want && !active) { parts.forEach(p => { try { p.on(); } catch (e) { console.warn("[EOW mobile]", e); } }); active = true; }
  else if (!want && active) { parts.slice().reverse().forEach(p => { try { p.off(); } catch (e) {} }); active = false; }
};
const onChange = () => apply();
MQ.addEventListener ? MQ.addEventListener("change", onChange) : MQ.addListener(onChange);
PHONE.addEventListener ? PHONE.addEventListener("change", onChange) : PHONE.addListener(onChange);
addEventListener("resize", () => setHead(), {passive: true});
const fsToggle = () => { const fs = $(".f-states"); if (!fs || $(".fs-toggle", fs)) return; const n = $$("#fStates li").length; const h = $("h4", fs); if (!h || !n) return;
  h.insertAdjacentHTML("afterend", `<button type="button" class="fs-toggle" aria-expanded="false">Show all ${n} state pages</button>`);
  const bt = $(".fs-toggle", fs); bt.addEventListener("click", () => { const o = fs.classList.toggle("open"); bt.setAttribute("aria-expanded", o); bt.textContent = o ? "Hide state pages" : `Show all ${n} state pages`; }); };
const boot = () => { fsToggle(); apply(); };
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
