/* EOW 3D eye for the case pages: same model as the homepage Case types panel, fixed to this page's case. */
(function(){
  const THREE = window.THREE;
  const wrap = document.querySelector(".ipc-3d");
  if (!THREE || !wrap) return;
  let gl;
  try { const c = document.createElement("canvas"); gl = c.getContext("webgl2") || c.getContext("webgl"); } catch(e) {}
  if (!gl) return;                                   // no WebGL: the photo fallback stays
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  wrap.closest(".ipc-media").classList.add("has3d");

  const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.localClippingEnabled = true;
  wrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);

  // ---- studio environment for reflections ----
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const envSphere = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.MeshBasicMaterial({side: THREE.BackSide, color: 0x2a2626}));
  envScene.add(envSphere);
  const box = (w, h, x, y, z, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color: new THREE.Color(i, i, i), side: THREE.DoubleSide})); m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m); };
  box(6, 3, 0, 6, 4, 4); box(3, 5, -7, 1, 3, 2.2); box(3, 5, 7, 0, 2, 1.6); box(8, 2, 0, -5, -4, 0.6);
  scene.environment = pmrem.fromScene(envScene, 0.02).texture;

  // ---- lights ----
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a2a24, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe9b0, 0.9); rim.position.set(-4, 1, -3); scene.add(rim);
  const fill = new THREE.PointLight(0xfff4e0, 0.5, 20); fill.position.set(-3, -2, 4); scene.add(fill);

  // ---- canvas textures ----
  const cv = (w, h, draw) => { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  function vessel(ctx, x, y, ang, len, wdt, col, depth) {
    ctx.strokeStyle = col; ctx.lineCap = "round";
    let px = x, py = y;
    for (let i = 0; i < len; i++) {
      ang += rnd(-0.22, 0.22);
      const nx = px + Math.cos(ang) * 6, ny = py + Math.sin(ang) * 6;
      ctx.lineWidth = Math.max(0.4, wdt * (1 - i / len));
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(nx, ny); ctx.stroke();
      if (depth > 0 && Math.random() < 0.06) vessel(ctx, nx, ny, ang + rnd(-1, 1), len * 0.5, wdt * 0.6, col, depth - 1);
      px = nx; py = ny;
    }
  }
  const scleraTex = cv(2048, 1024, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, "#EBDCD2"); g.addColorStop(0.25, "#FBF8F4"); g.addColorStop(0.5, "#EADBCF"); g.addColorStop(0.75, "#E2CEC0"); g.addColorStop(1, "#EBDCD2");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(${200 + rnd(0, 40)},${150 + rnd(0, 40)},${140 + rnd(0, 30)},${rnd(0.02, 0.06)})`; x.beginPath(); x.arc(rnd(0, w), rnd(0, h), rnd(2, 14), 0, 7); x.fill(); }
    // veins radiating toward the front (u = .25)
    const lg = x.createLinearGradient(0, 0, 0, h); lg.addColorStop(0, "rgba(255,255,255,.55)"); lg.addColorStop(0.35, "rgba(255,255,255,0)"); lg.addColorStop(1, "rgba(200,140,120,.25)");
    x.fillStyle = lg; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) vessel(x, rnd(0, w), rnd(h * 0.35, h * 0.75), -Math.PI / 2 + rnd(-0.35, 0.35), rnd(14, 34), rnd(1.6, 3.6), `rgba(${165 + rnd(0, 45)},${28 + rnd(0, 30)},${32 + rnd(0, 20)},${rnd(0.3, 0.65)})`, 2);
    for (let i = 0; i < 30; i++) vessel(x, rnd(0, w), rnd(h * 0.6, h), rnd(0, 6.28), rnd(15, 30), rnd(1.5, 3), `rgba(150,40,40,${rnd(0.2, 0.45)})`, 2);
  });
  const irisTex = cv(1024, 1024, (x, w) => {
    const c = w / 2;
    const g = x.createRadialGradient(c, c, w * 0.12, c, c, w * 0.5);
    g.addColorStop(0, "#5a3a1a"); g.addColorStop(0.22, "#9a7434"); g.addColorStop(0.36, "#6f8fa6"); g.addColorStop(0.78, "#4d6f8c"); g.addColorStop(0.93, "#24384a"); g.addColorStop(1, "#141c24");
    x.fillStyle = g; x.beginPath(); x.arc(c, c, c, 0, 7); x.fill();
    for (let i = 0; i < 900; i++) {
      const a = rnd(0, 6.28), r0 = rnd(0.14, 0.3) * w, r1 = rnd(0.32, 0.48) * w;
      x.strokeStyle = Math.random() < 0.5 ? `rgba(220,235,245,${rnd(0.05, 0.22)})` : `rgba(20,35,50,${rnd(0.06, 0.25)})`;
      x.lineWidth = rnd(0.6, 2.4); x.beginPath(); x.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
      x.quadraticCurveTo(c + Math.cos(a + 0.05) * (r0 + r1) / 2, c + Math.sin(a + 0.05) * (r0 + r1) / 2, c + Math.cos(a) * r1, c + Math.sin(a) * r1); x.stroke();
    }
    for (let i = 0; i < 40; i++) { const a = rnd(0, 6.28), r = rnd(0.2, 0.42) * w; x.fillStyle = `rgba(15,25,35,${rnd(0.15, 0.35)})`; x.beginPath(); x.ellipse(c + Math.cos(a) * r, c + Math.sin(a) * r, rnd(4, 12), rnd(2, 6), a, 0, 7); x.fill(); }
    x.strokeStyle = "rgba(200,150,70,.55)"; x.lineWidth = 6; x.beginPath();
    for (let i = 0; i <= 120; i++) { const a = i / 120 * 6.28, r = w * (0.2 + 0.012 * Math.sin(a * 14)); i ? x.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r) : x.moveTo(c + Math.cos(a) * r, c + Math.sin(a) * r); } x.stroke();
    const p = x.createRadialGradient(c, c, 0, c, c, w * 0.15); p.addColorStop(0, "#000"); p.addColorStop(0.85, "#050505"); p.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = p; x.beginPath(); x.arc(c, c, w * 0.155, 0, 7); x.fill();
  });
  const retinaTex = cv(2048, 1024, (x, w, h) => {
    // v = 0 at the front edge, v = 1 at the back of the eye (where the optic disc sits)
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#A8371B"); g.addColorStop(0.35, "#D45F2B"); g.addColorStop(0.75, "#E98445"); g.addColorStop(1, "#F2A05C");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 2200; i++) { x.fillStyle = `rgba(${110 + rnd(0, 60)},${25 + rnd(0, 30)},18,${rnd(0.03, 0.08)})`; x.beginPath(); x.arc(rnd(0, w), rnd(0, h), rnd(2, 10), 0, 7); x.fill(); }
    // vessels: start at the back (bottom edge) and climb toward the front, branching
    for (let i = 0; i < 16; i++) { const sx = i / 16 * w + rnd(0, w / 16);
      vessel(x, sx, h - 2, -Math.PI / 2 + rnd(-0.25, 0.25), rnd(55, 95), rnd(4, 7), i % 2 ? "rgba(135,18,12,.85)" : "rgba(88,14,22,.8)", 3); }
  });
  const muscleTex = cv(512, 128, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#B5483C"); g.addColorStop(0.5, "#D16A5A"); g.addColorStop(1, "#9C3A30");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { x.strokeStyle = `rgba(255,220,210,${rnd(0.05, 0.18)})`; x.lineWidth = rnd(0.5, 1.6); const y = rnd(0, h); x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w * 0.3, y + rnd(-6, 6), w * 0.7, y + rnd(-6, 6), w, y + rnd(-4, 4)); x.stroke(); }
  });

  // ---- clipping plane for the cutaway ----
  const cut = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 2);
  const clip = [cut];

  const eye = new THREE.Group(); scene.add(eye);
  const parts = {};
  const reg = (name, mesh) => { (parts[name] = parts[name] || []).push(mesh); return mesh; };
  const phys = o => new THREE.MeshPhysicalMaterial(Object.assign({clippingPlanes: clip, clipShadows: true}, o));

  // sclera (double sided so the cut shows the inside wall)
  const sclera = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96, 0, Math.PI * 2, 0.47, Math.PI - 0.47), phys({map: scleraTex, color: 0xf4ece6, roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.3, side: THREE.DoubleSide}));
  sclera.rotation.x = Math.PI / 2;
  // limbus: soft dark ring where the sclera meets the cornea
  const limbus = new THREE.Mesh(new THREE.TorusGeometry(0.452, 0.012, 12, 96), phys({color: 0x3b4a58, roughness: 0.5}));
  limbus.position.z = 0.892; eye.add(limbus);
  eye.add(sclera);
  // choroid + retina (inner wall, seen when cut)
  const choroid = new THREE.Mesh(new THREE.SphereGeometry(0.975, 96, 64, 0, Math.PI * 2, 0.6, Math.PI - 0.6), phys({color: 0x6b1f15, roughness: 0.8, side: THREE.BackSide}));
  choroid.rotation.x = Math.PI / 2; eye.add(choroid);
  const retina = reg("retina", new THREE.Mesh(new THREE.SphereGeometry(0.955, 96, 64, 0, Math.PI * 2, 0.62, Math.PI - 0.62), phys({map: retinaTex, roughness: 0.55, side: THREE.BackSide, emissive: 0x000000})));
  retina.rotation.x = Math.PI / 2;
  eye.add(retina);
  // macula marker (glows for vision loss)
  const macula = reg("macula", new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 16), phys({color: 0x7a2412, roughness: 0.6, emissive: 0x000000})));
  macula.position.set(0.18, -0.02, -0.93); eye.add(macula);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.1, 48), phys({color: 0xf6dc9c, roughness: 0.5, emissive: 0x3a2a00, side: THREE.DoubleSide}));
  disc.position.set(-0.05, 0.02, -0.945); eye.add(disc);
  // vitreous
  eye.add(new THREE.Mesh(new THREE.SphereGeometry(0.94, 64, 48), phys({color: 0xfff1e6, transparent: true, opacity: 0.12, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false})));
  // iris
  const iris = reg("iris", new THREE.Mesh(new THREE.CircleGeometry(0.44, 96), phys({map: irisTex, roughness: 0.55, clearcoat: 0.3, side: THREE.DoubleSide})));
  iris.position.z = 0.885; eye.add(iris);
  // ciliary body / drainage angle ring
  const ciliary = reg("angle", new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.035, 16, 96), phys({color: 0x8c3a31, roughness: 0.6, emissive: 0x000000})));
  ciliary.position.z = 0.84; eye.add(ciliary);
  // lens
  const lens = reg("lens", new THREE.Mesh(new THREE.SphereGeometry(0.3, 64, 48), phys({color: 0xe8c172, transparent: true, opacity: 0.92, roughness: 0.06, clearcoat: 1, emissive: 0x000000, side: THREE.DoubleSide})));
  lens.scale.set(1, 1, 0.42); lens.position.z = 0.74; eye.add(lens);
  // cornea dome
  const cornea = reg("cornea", new THREE.Mesh(new THREE.SphereGeometry(0.5, 96, 48, 0, Math.PI * 2, 0, 1.08), phys({color: 0xe8f4ff, transparent: true, opacity: 0.22, roughness: 0.02, metalness: 0, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 2.2, emissive: 0x000000, depthWrite: false})));
  cornea.rotation.x = Math.PI / 2; cornea.position.z = 0.66; eye.add(cornea);

  // optic nerve with sheath
  const nerve = reg("nerve", new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 1.5, 48, 1, false), phys({color: 0xf0dfae, roughness: 0.6, clearcoat: 0.2, emissive: 0x000000})));
  nerve.rotation.x = Math.PI / 2; nerve.position.z = -1.68; eye.add(nerve);

  // curves on the eyeball surface
  const onSphere = (R, theta, phi) => new THREE.Vector3(R * Math.sin(theta) * Math.cos(phi), R * Math.sin(theta) * Math.sin(phi), R * Math.cos(theta));
  // rectus muscles
  const mMat = phys({map: muscleTex, roughness: 0.6, emissive: 0x000000});
  [Math.PI / 2, -Math.PI / 2, 0, Math.PI].forEach(phi => {
    const pts = [onSphere(1.06, 0.95, phi), onSphere(1.08, 1.6, phi), onSphere(1.1, 2.3, phi), new THREE.Vector3(Math.cos(phi) * 0.5, Math.sin(phi) * 0.5, -1.6), new THREE.Vector3(Math.cos(phi) * 0.25, Math.sin(phi) * 0.25, -2.2)];
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.075, 12, false), mMat);
    tube.scale.set(1, 1, 1); eye.add(reg("muscle", tube));
  });
  // vessels (red arteries, blue veins) and yellow nerve fibres along the outside
  const tubeOn = (phi, col, rad, R, wig, from, to) => {
    const pts = []; for (let i = 0; i <= 14; i++) { const t = i / 14, th = from + (to - from) * t; pts.push(onSphere(R, th, phi + Math.sin(t * 6 + phi * 3) * wig)); }
    return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, rad, 8, false), phys({color: col, roughness: 0.4, clearcoat: 0.6, emissive: 0x000000}));
  };
  for (let i = 0; i < 7; i++) eye.add(tubeOn(i * 0.9 + 0.3, 0xb3261e, 0.011, 1.012, 0.12, 2.75, 1.05));
  for (let i = 0; i < 5; i++) eye.add(tubeOn(i * 1.25 + 0.75, 0x3d4f8c, 0.01, 1.012, 0.1, 2.7, 1.25));
  for (let i = 0; i < 8; i++) eye.add(reg("fibres", tubeOn(i * 0.78, 0xf2cf5b, 0.007, 1.018, 0.06, 2.85, 1.0)));
  // nerve branches leaving the optic nerve
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; const pts = [new THREE.Vector3(0, 0, -1.4), new THREE.Vector3(Math.cos(a) * 0.35, Math.sin(a) * 0.35, -1.25), onSphere(1.02, 2.6, a)];
    eye.add(reg("fibres", new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.008, 6, false), phys({color: 0xf2cf5b, roughness: 0.4, emissive: 0x000000})))); }

  // eyelids (shown for oculoplastic)
  const skin = phys({color: 0x8f4d3a, roughness: 0.6, clearcoat: 0.2, transparent: true, opacity: 0, side: THREE.DoubleSide, emissive: 0x000000});
  const upper = new THREE.Mesh(new THREE.SphereGeometry(1.13, 64, 32, 0, Math.PI, 0.32, 0.86), skin);
  const lower = new THREE.Mesh(new THREE.SphereGeometry(1.13, 64, 32, 0, Math.PI, 2.05, 0.78), skin);
  eye.add(reg("lid", upper)); eye.add(reg("lid", lower));
  const lashMat = phys({color: 0x2b1d17, roughness: 0.8, transparent: true, opacity: 0});
  const lashes = new THREE.Group(); eye.add(lashes);
  [[1.18, 1], [2.05, -1]].forEach(([th, dir]) => { for (let i = 0; i <= 70; i++) { const ph = 0.25 + i / 70 * (Math.PI - 0.5) + (Math.random() - .5) * 0.02;
    const base = new THREE.Vector3(1.13 * Math.sin(th) * -Math.cos(ph), 1.13 * Math.cos(th), 1.13 * Math.sin(th) * Math.sin(ph));
    const L = (dir > 0 ? 0.13 : 0.07) * (0.6 + Math.random() * 0.6) * Math.sin(ph);
    const tip = base.clone().add(new THREE.Vector3((Math.random() - .5) * .03, dir * L, L * 0.9)).add(base.clone().setY(0).normalize().multiplyScalar(L * 0.4));
    const l = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(base, base.clone().lerp(tip, .5).add(new THREE.Vector3(0, dir * L * .35, L * .2)), tip), 6, 0.0026, 4, false), lashMat);
    lashes.add(l); } });

  // ---- views per case type ----
  const V = {
    cataract: {cam: [2.7, 0.45, 0.7], at: [0, 0, 0.45], cut: 0.0, hl: ["lens"], d: 2.85},
    lasik:    {cam: [1.1, 0.35, 3.1], at: [0, 0, 0.6], cut: 2, hl: ["cornea"], d: 3.13},
    glaucoma: {cam: [2.6, 0.7, 0.9], at: [0, 0, 0.1], cut: 0.02, hl: ["angle", "nerve"], d: 3.42},
    retina:   {cam: [2.8, 0.6, -0.6], at: [0, 0, -0.25], cut: 0.02, hl: ["retina"], d: 3.23},
    oculo:    {cam: [0.9, 0.5, 3.4], at: [0, 0, 0.4], cut: 2, hl: ["lid"], d: 3.42, lids: 1},
    vision:   {cam: [2.7, 0.35, -0.5], at: [0, 0, -0.45], cut: 0.0, hl: ["macula", "nerve"], d: 3.52},
    hgn:      {cam: [2.4, 1.9, 1.6], at: [0, 0, -0.3], cut: 2, hl: ["muscle", "fibres"], d: 4.18}
  };
  let cur = V.cataract, curId = "cataract";
  const camPos = new THREE.Vector3(3, 1, 3), camAt = new THREE.Vector3(), tPos = new THREE.Vector3(), tAt = new THREE.Vector3();
  let cutVal = 2, lidVal = 0, drag = {x: 0, y: 0}, dragT = {x: 0, y: 0};
  const setCase = id => { if (!V[id]) return; curId = id; cur = V[id]; tAt.set(...cur.at); const dir = new THREE.Vector3(...cur.cam).normalize(); tPos.copy(dir.multiplyScalar(cur.d * ZOOM * Math.max(1, 1.5 / (camera.aspect || 1.5)))); };
  const ZOOM = 1.45;                                   // the hero card is smaller than the homepage panel, so pull the camera back
  const START = V[wrap.dataset.view] ? wrap.dataset.view : "cataract";
  setCase(START); camPos.copy(tPos).multiplyScalar(1.4); camAt.copy(tAt);

  // drag to rotate
  let down = null;
  wrap.addEventListener("pointerdown", e => { down = {x: e.clientX, y: e.clientY, dx: dragT.x, dy: dragT.y}; wrap.setPointerCapture(e.pointerId); wrap.classList.add("grab"); });
  wrap.addEventListener("pointermove", e => { if (!down) return; dragT.x = down.dx + (e.clientX - down.x) * 0.008; dragT.y = Math.max(-0.8, Math.min(0.8, down.dy + (e.clientY - down.y) * 0.006)); });
  const up = () => { down = null; wrap.classList.remove("grab"); };
  wrap.addEventListener("pointerup", up); wrap.addEventListener("pointercancel", up);

  // resize
  const size = () => { const r = wrap.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); if (typeof curId !== 'undefined' && curId) setCase(curId); };
  new ResizeObserver(size).observe(wrap); size();

  // render only while visible
  let visible = false, raf = 0, t0 = performance.now();
  const yellow = new THREE.Color(0xffd400);
  const all = Object.keys(parts);
  function frame(now) {
    const t = (now - t0) / 1000, dt = Math.min(0.1, (now - (frame.last || now)) / 1000); frame.last = now;
    const ease = r => 1 - Math.exp(-dt * r), k = ease(3.2);
    drag.x += (dragT.x - drag.x) * ease(8); drag.y += (dragT.y - drag.y) * ease(8);
    const sway = reduce ? 0 : Math.sin(t * 0.35) * 0.12;
    const p = tPos.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), drag.x + sway);
    p.applyAxisAngle(new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), drag.x + sway), -drag.y);
    camPos.lerp(p, k); camAt.lerp(tAt, k);
    camera.position.copy(camPos); camera.lookAt(camAt);
    cutVal += (cur.cut - cutVal) * ease(3.5); cut.constant = cutVal;
    lidVal += ((cur.lids || 0) - lidVal) * ease(4); skin.opacity = lidVal * 0.97; lashMat.opacity = lidVal; upper.visible = lower.visible = lashes.visible = lidVal > 0.02;
    const pulse = 0.35 + 0.25 * Math.sin(t * 3.2);
    all.forEach(name => { const on = cur.hl.includes(name); parts[name].forEach(m => {
      const mat = m.material; if (!mat.emissive) return;
      const target = on ? pulse : 0; mat.userData.e = (mat.userData.e || 0) + (target - (mat.userData.e || 0)) * ease(6);
      mat.emissive.copy(yellow).multiplyScalar(mat.userData.e * (name === "retina" ? 0.18 : name === "lid" ? 0.12 : 1));
      if (name === "cornea") mat.opacity = 0.22 + (mat.userData.e || 0) * 0.5;
    }); });
    renderer.render(scene, camera);
    raf = visible ? requestAnimationFrame(frame) : 0;
  }
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }, {rootMargin: "100px"}).observe(wrap);
})();

