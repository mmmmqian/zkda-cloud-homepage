/**
 * Token Hub / Model Manifold V2.4.
 * One API trunk enters a routing junction, then five independent channels
 * reach five model sockets. The socket under the pointer lifts and its whole
 * route takes the single Hairline accent. The slider sets lift in world units.
 */
const {
  Cam, fit, proj, facing, rings, rrect, prism, solid, put, mk, poly, open, place,
  unproj, tween, tset, tval, tdone, disposer, pointer, register,
} = HL;

const CORE = { x: -29, y: -24, w: 49, d: 48 };
const INLET = { x: -62, y: 8, w: 15, d: 25, h: 11 };
const PORTS = [
  { x: 25, y: -62, w: 18, d: 17, key: 0 },
  { x: 47, y: -60, w: 18, d: 17, key: 1 },
  { x: 69, y: -56, w: 18, d: 17, key: 2 },
  { x: 35, y: 10, w: 18, d: 17, key: 3 },
  { x: 58, y: 15, w: 18, d: 17, key: 4 },
];
const LANES = [-16, -9, -2, 6, 13], BASE = 2.15, PH = 6.2;
const HARNESSES = [
  [[20, -16, BASE], [24, -16, BASE], [24, -53.5, BASE], [25, -53.5, BASE]],
  [[20, -9, BASE], [31, -9, BASE], [31, -51.5, BASE], [47, -51.5, BASE]],
  [[20, -2, BASE], [38, -2, BASE], [38, -47.5, BASE], [69, -47.5, BASE]],
  [[20, 6, BASE], [28, 6, BASE], [28, 18.5, BASE], [35, 18.5, BASE]],
  [[20, 13, BASE], [45, 13, BASE], [45, 23.5, BASE], [58, 23.5, BASE]],
];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value, active = -1;
  const C = Cam(45, 0.5, 1.82);
  fit(C, [[-66, -67, 0], [90, -67, 0], [90, 36, 0], [-66, 36, 0], [-66, -67, 22], [90, 36, 22]], 200, 166);
  const P = proj(C), front = facing(C), root = mk("g", {}, svg);
  const line = (coords, cls = "nf lo", parent = root) => mk("path", { d: open(coords.map((q) => P(...q))), class: cls }, parent);
  const dot = (x, y, z, r = 1, cls = "dot off", parent = root) => { const el = mk("circle", { r, class: cls }, parent); place(el, P(x, y, z)); return el; };
  const rimPath = (x, y, w, d, r, z) => poly(rrect(x, y, x + w, y + d, r, 5).map((q) => P(q.u, q.v, z)));
  const makePlate = (parent, x, y, w, d, r, z0, z1) => { const [outer, inner] = rings(x, y, x + w, y + d, r, 1.15); const s = solid(parent); put(s, prism(P, front, outer, inner, z0, z1)); return { s, outer, inner }; };
  const toggleHi = (el, on) => el.classList.toggle("hi", on);
  const routeAccent = (el, on) => { toggleHi(el, on); el.classList.toggle("lo", !on); };

  // Ground topology first, so every solid honestly occludes the line behind it.
  const commonGround = line([[-47, 20, 1.6], [-40, 20, 1.6], [-40, 5, 1.6], [-29, 5, 1.6]], "nf");
  dot(-47, 20, 1.6, 1.05, "dot off");
  const harness = HARNESSES.map((coords) => line(coords, "nf lo"));
  HARNESSES.forEach((coords) => { const q = coords.at(-1); dot(q[0], q[1], q[2], 1, "dot off"); });

  // Router body: intake chamber -> junction -> five lanes -> five output wells.
  const router = mk("g", {}, root);
  makePlate(router, CORE.x, CORE.y, CORE.w, CORE.d, 5.5, 1.6, 7.1);
  mk("path", { d: rimPath(-25, -20, 41, 40, 4.6, 7.22), class: "nf lo" }, router);
  const commonRise = line([[-29, 5, 1.6], [-29, 5, 7.35], [-24, 5, 7.35]], "nf", router);
  const junctionWell = mk("path", { d: rimPath(-24, 1, 8, 8, 2.2, 7.42), class: "nf lo" }, router);
  const junction = dot(-20, 5, 7.45, 1.12, "dot", router);
  const commonFeed = line([[-16, 5, 7.35], [-12, 5, 7.35]], "nf", router);
  const spine = line([[-12, -16, 7.35], [-12, 13, 7.35]], "nf lo", router);
  const activeSpine = line([[-12, 5, 7.35], [-12, 5, 7.35]], "nf", router);
  const routes = LANES.map((y, i) => {
    const lane = line([[-12, y, 7.35], [20, y, 7.35]], "nf lo", router);
    const well = mk("path", { d: rimPath(15.9, y - 2.1, 4.1, 4.2, 1.1, 7.43), class: "nf lo" }, router);
    const drop = line([[20, y, 7.35], [20, y, BASE]], "nf lo", router);
    dot(-12, y, 7.42, 0.76, "dot off", router);
    dot(20, y, BASE, 1.05, "dot m", router);
    return { lane, well, drop, ground: harness[i] };
  });
  mk("path", { d: rimPath(-7, -19, 4, 37, 1.4, 7.46), class: "nf lo" }, router);

  // One keyed API inlet. Its blue transfers to the selected end-to-end route.
  const inlet = mk("g", {}, root);
  makePlate(inlet, INLET.x, INLET.y, INLET.w, INLET.d, 3.3, 1.9, 1.9 + INLET.h);
  mk("path", { d: rimPath(-59, 12, 9, 17, 2, 13.02), class: "nf lo" }, inlet);
  const apiKey = line([[-56.5, 14, 13.14], [-52.5, 14, 13.14], [-52.5, 26, 13.14], [-56.5, 26, 13.14]], "nf", inlet);

  function detail(p, z) {
    const cx = p.x + p.w / 2, cy = p.y + p.d / 2;
    if (p.key === 0) return { paths: [open([[cx - 4, cy - 1.2], [cx + 4, cy - 1.2]].map((q) => P(q[0], q[1], z + 0.22)))], dots: [[cx, cy + 2.8]] };
    if (p.key === 1) return { paths: [open([[cx - 4, cy + 4], [cx + 4, cy + 4]].map((q) => P(q[0], q[1], z + 0.21)))], dots: [[cx - 3, cy], [cx + 3, cy]] };
    if (p.key === 2) return { paths: [rimPath(cx - 3.5, cy - 3.1, 7, 6.2, 1.1, z + 0.23)], dots: [] };
    if (p.key === 3) return { paths: [-3, 1].map((dy) => open([[cx - 4, cy + dy], [cx + (dy < 0 ? 3 : 4), cy + dy]].map((q) => P(q[0], q[1], z + 0.23)))) , dots: [] };
    return { paths: [open([[cx - 4, cy + 4], [cx + 4, cy + 4]].map((q) => P(q[0], q[1], z + 0.23)))], dots: [[cx - 3.5, cy], [cx, cy], [cx + 3.5, cy]] };
  }

  const ports = [];
  [...PORTS].sort((a, b) => (a.x + a.y) - (b.x + b.y)).forEach((p) => {
    const g = mk("g", {}, root), [outer, inner] = rings(p.x, p.y, p.x + p.w, p.y + p.d, 3, 1.15);
    const body = solid(g), rim = mk("path", { class: "nf lo" }, g), q = detail(p, BASE + PH);
    const marks = q.paths.map(() => mk("path", { class: "nf lo" }, g));
    const beads = q.dots.map(() => mk("circle", { r: 0.82, class: "dot off" }, g));
    ports[p.key] = { p, outer, inner, body, rim, marks, beads, z: tween(0) };
  });

  function drawPort(o, dz) {
    const p = o.p, z = BASE + PH + dz;
    put(o.body, prism(P, front, o.outer, o.inner, BASE + dz, z));
    o.rim.setAttribute("d", rimPath(p.x + 3.1, p.y + 3, p.w - 6.2, p.d - 6, 1.8, z + 0.1));
    const q = detail(p, z);
    o.marks.forEach((el, i) => el.setAttribute("d", q.paths[i]));
    o.beads.forEach((el, i) => place(el, P(q.dots[i][0], q.dots[i][1], z + 0.24)));
  }
  ports.forEach((o) => drawPort(o, 0));

  const B = register(stage, (_dt, now) => {
    let moving = false;
    ports.forEach((o) => { drawPort(o, tval(o.z, now)); if (!tdone(o.z, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  function hit([sx, sy]) {
    let best = -1, score = Infinity;
    PORTS.forEach((p) => {
      const q = unproj(C, sx, sy, BASE + PH), cx = p.x + p.w / 2, cy = p.y + p.d / 2;
      const nx = Math.abs(q[0] - cx) / (p.w / 2 + 2.2), ny = Math.abs(q[1] - cy) / (p.d / 2 + 2.2), s = nx * nx + ny * ny;
      if (nx <= 1 && ny <= 1 && s < score) { best = p.key; score = s; }
    });
    return best;
  }

  function setActive(next, force = false) {
    if (next === active && !force) return;
    const now = performance.now(), from = next >= 0 ? next : active;
    active = next;
    ports.forEach((o, i) => {
      tset(o.z, i === next ? lift : 0, now, Math.abs(i - from) * 32);
      toggleHi(o.body.sil, i === next);
      [routes[i].lane, routes[i].well, routes[i].drop, routes[i].ground].forEach((el) => routeAccent(el, i === next));
    });
    const on = next >= 0;
    [apiKey, commonGround, commonRise, commonFeed].forEach((el) => toggleHi(el, on));
    routeAccent(junctionWell, on);
    activeSpine.setAttribute("d", on ? open([P(-12, 5, 7.35), P(-12, LANES[next], 7.35)]) : "");
    toggleHi(activeSpine, on);
    junction.setAttribute("class", "dot");
    read.textContent = on ? `model ${String(next + 1).padStart(2, "0")}` : "rest";
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());
  return { set: (v) => { lift = v; setActive(active, true); }, destroy: bag.dispose };
}

hairline({
  name: "model-manifold-v2-4",
  means: "One API input reaches five model sockets through a routing junction; the chosen socket and its complete route answer together.",
  rules: [1, 3, 4, 5, 6, 7, 8, 9, 10],
  range: [1.8, 2.6, 3.1],
  tour: [[326, 192], [221, 231], [277, 160], [197, 213], [303, 175], null],
  mount,
});
