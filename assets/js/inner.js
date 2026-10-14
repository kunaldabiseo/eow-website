/* EOW inner pages: header, menus, case form, contact form, reveals. Same behaviour as the homepage. */
(function(){
"use strict";
const CONFIG = { formEndpoint: "" }; // URL that accepts a POST of the form (FormData). Empty = demo mode.
const CASE_NAMES = ["Cataract and IOL surgery", "LASIK and refractive surgery", "Glaucoma", "Retina and retinal detachment", "Oculoplastic and eyelid surgery", "Vision loss", "HGN and DUI eye tests"];
const STATE_NAMES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

requestAnimationFrame(() => document.body.classList.add("ready"));
const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

/* header state + progress + back to top */
const header = $("#header"), progress = $("#progress"), toTop = $("#toTop"), ring = $("#toTopRing"), pct = $("#ttPct");
const C = 2 * Math.PI * 21;
if (ring) { ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C; }
let tk = false;
const onScroll = () => {
  tk = false; const y = scrollY, h = document.documentElement.scrollHeight - innerHeight, k = h > 0 ? y / h : 0;
  if (progress) progress.style.transform = `scaleX(${k})`;
  if (header) header.classList.toggle("scrolled", y > 30);
  if (toTop) toTop.classList.toggle("show", y > 600);
  if (ring) ring.style.strokeDashoffset = C * (1 - k);
  if (pct) pct.textContent = Math.round(k * 100) + "%";
};
addEventListener("scroll", () => { if (!tk) { tk = true; requestAnimationFrame(onScroll); } }, {passive: true}); onScroll();
if (toTop) toTop.addEventListener("click", () => scrollTo({top: 0, behavior: reduce ? "auto" : "smooth"}));

/* mega menu */
const megaBtn = $("#megaBtn"), mega = $("#mega");
if (megaBtn && mega) {
  let t; const setMega = o => { mega.classList.toggle("open", o); megaBtn.setAttribute("aria-expanded", o); };
  megaBtn.addEventListener("click", () => setMega(!mega.classList.contains("open")));
  if (fine) { const li = megaBtn.parentElement;
    li.addEventListener("mouseenter", () => { clearTimeout(t); setMega(true); });
    li.addEventListener("mouseleave", () => { t = setTimeout(() => setMega(false), 180); }); }
  document.addEventListener("click", e => { if (!e.target.closest(".nav-links > li")) setMega(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMega(false); });
}

/* mobile menu */
const mm = $("#mobileMenu"), menuBtn = $("#menuBtn");
const setMenu = o => { if (!mm) return; mm.classList.toggle("open", o); mm.setAttribute("aria-hidden", !o); if (menuBtn) menuBtn.setAttribute("aria-expanded", o); document.body.classList.toggle("locked", o); };
if (menuBtn) menuBtn.addEventListener("click", () => setMenu(true));
const mc = $("#menuClose"); if (mc) mc.addEventListener("click", () => setMenu(false));
$$("#mobileMenu a, #mobileMenu button").forEach(a => a.addEventListener("click", () => setMenu(false)));

/* toast */
let toastT; const toast = m => { const t = $("#toast"); if (!t) return; t.textContent = m; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2400); };

/* overlays */
let lastFocus = null;
const openOverlay = ov => { lastFocus = document.activeElement; ov.classList.add("open"); ov.setAttribute("aria-hidden", "false"); document.body.classList.add("locked"); };
const closeOverlay = ov => { ov.classList.remove("open"); ov.setAttribute("aria-hidden", "true"); document.body.classList.remove("locked"); if (lastFocus && lastFocus.focus) lastFocus.focus(); };
const trap = (ov, e) => { if (e.key !== "Tab") return; const f = $$("a[href],button:not([disabled]),input:not(.hp),select,textarea", ov).filter(x => x.offsetParent !== null); if (!f.length) return;
  if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } };

/* multi-step case form (same as homepage) */
const fo = $("#formOverlay"), form = $("#caseForm");
if (fo && form) {
  const fsteps = $$(".fstep", form), fNext = $("#fNext"), fBack = $("#fBack"), fFoot = $("#formFoot");
  $("#fType").innerHTML += CASE_NAMES.map(n => `<option>${esc(n)}</option>`).join("") + `<option>Other eye case</option>`;
  $("#fState").innerHTML += STATE_NAMES.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join("") + `<option>Outside the United States</option>`;
  let fi = 0;
  const showF = i => { fi = i; fsteps.forEach((s, k) => s.classList.toggle("on", k === i));
    fBack.style.visibility = i > 0 && i < 4 ? "visible" : "hidden"; fFoot.style.display = i === 4 ? "none" : "";
    fNext.textContent = i === 3 ? "Send case details" : "Continue"; $("#fStepTxt").textContent = `Step ${Math.min(i + 1, 4)} of 4`;
    const first = $("input:not(.hp),select,textarea", fsteps[i]); if (first && i < 4) setTimeout(() => first.focus({preventScroll: true}), 60); };
  const validStep = i => { let ok = true;
    if (i === 0) { const has = !!$("input[name=side]:checked", form); $("[data-req=side]", form).classList.toggle("err", !has); ok = has; }
    $$("[required]", fsteps[i]).forEach(inp => { const good = inp.type === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim()) : inp.minLength > 0 ? inp.value.trim().length >= inp.minLength : !!inp.value.trim();
      inp.closest(".field").classList.toggle("err", !good); if (!good) ok = false; });
    return ok; };
  form.addEventListener("input", e => { const f = e.target.closest(".field"); if (f) f.classList.remove("err"); });
  form.addEventListener("change", e => { if (e.target.name === "side") { $("[data-req=side]", form).classList.remove("err"); setTimeout(() => { if (fi === 0) showF(1); }, 260); } });
  fBack.addEventListener("click", () => showF(Math.max(0, fi - 1)));
  fNext.addEventListener("click", async () => {
    if (!validStep(fi)) return; if (fi < 3) return showF(fi + 1); if ($(".hp", form).value) return showF(4);
    fNext.disabled = true; fNext.textContent = "Sending..."; const data = new FormData(form);
    try { if (CONFIG.formEndpoint) { const r = await fetch(CONFIG.formEndpoint, {method: "POST", body: data}); if (!r.ok) throw new Error("bad status"); }
      else { console.warn("[EOW] Demo mode: set CONFIG.formEndpoint to deliver form submissions.", Object.fromEntries(data)); await new Promise(r => setTimeout(r, 700)); }
      showF(4); form.reset(); }
    catch (e) { toast("Could not send. Please try again or use the contact page."); }
    finally { fNext.disabled = false; fNext.textContent = "Send case details"; } });
  form.addEventListener("submit", e => { e.preventDefault(); fNext.click(); });
  form.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.tagName !== "BUTTON") { e.preventDefault(); fNext.click(); } });
  const openForm = (pre = {}) => { if (fi === 4) form.reset(); showF(0); if (pre.state) $("#fState").value = pre.state; if (pre.caseType) $("#fType").value = pre.caseType; openOverlay(fo); };
  fo.addEventListener("click", e => { if (e.target === fo || e.target.closest("[data-close]")) closeOverlay(fo); });
  fo.addEventListener("keydown", e => { if (e.key === "Escape") closeOverlay(fo); trap(fo, e); });
  document.addEventListener("click", e => { const b = e.target.closest("[data-open-form]"); if (b) { e.preventDefault(); openForm({state: b.dataset.state || document.body.dataset.state || "", caseType: b.dataset.case || document.body.dataset.case || ""}); } });
  /* side tracker + progress bar */
  const t = $("#fStepTxt"), items = $$(".ms-track li"), bar = $("#mProg");
  const upd = () => { const sent = $('.fstep[data-step="4"].on'); const m = (t.textContent || "").match(/(\d+)/); const k = m ? +m[1] - 1 : 0;
    items.forEach((li, i) => { li.classList.toggle("on", !sent && i === k); li.classList.toggle("done", !!sent || i < k); }); if (bar) bar.style.width = ((sent ? 4 : k + 1) / 4 * 100) + "%"; };
  new MutationObserver(upd).observe(t, {childList: true, characterData: true, subtree: true});
  fsteps.forEach(f => new MutationObserver(upd).observe(f, {attributes: true, attributeFilter: ["class"]})); upd();
}

/* contact page form: same fields as the live contact form */
$$(".ip-form").forEach(f => f.addEventListener("submit", async e => {
  e.preventDefault(); const btn = $("button[type=submit]", f); const data = new FormData(f);
  const bad = $$("[required]", f).filter(i => !i.value.trim() || (i.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim())));
  $$("[required]", f).forEach(i => i.style.borderColor = bad.includes(i) ? "#302C2C" : ""); if (bad.length) { bad[0].focus(); return; }
  btn.disabled = true;
  try { if (CONFIG.formEndpoint) { const r = await fetch(CONFIG.formEndpoint, {method: "POST", body: data}); if (!r.ok) throw 0; f.classList.add("sent"); f.reset(); }
    else { const body = [...data.entries()].map(([k, v]) => `${k.replace(/[\[\]]/g, "")}: ${v}`).join("\n");
      location.href = `mailto:talefkowitzmd@gmail.com?subject=${encodeURIComponent("Expert ophthalmology witness enquiry")}&body=${encodeURIComponent(body)}`; f.classList.add("sent"); } }
  catch (err) { toast("Could not send. Please email talefkowitzmd@gmail.com."); }
  finally { btn.disabled = false; } }));

/* reveal on scroll */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), {rootMargin: "0px 0px -8% 0px"});
$$("[data-reveal]").forEach((el, i) => { el.style.transitionDelay = (i % 3) * 70 + "ms"; io.observe(el); });
$$("footer").forEach(el => io.observe(el));

/* highlight underline in headings once visible */
const hio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("hl-on"); hio.unobserve(e.target); } }), {threshold: .4});
$$(".final h2").forEach(h => hio.observe(h));
})();
