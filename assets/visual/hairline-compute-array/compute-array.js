/**
 * Compute array: seven heterogeneous compute packages share one backplane.
 * The package under the pointer rises; neighbouring packages answer by distance.
 * Static rest-plane hit tests keep selection stable while packages move.
 */
const {
  Cam, clamp, facing, fit, open, poly, proj, rrect, rings, prism, seg, solid, put,
  tdone, tset, tval, tween, disposer, mk, place, pointer, reflect, register, unproj,
} = HL;

const BOARD = [-76, -61, 76, 61];
const PARTS = [
  { x: -58, y: -43, w: 42, d: 34, h: 13, z: 1, kind: "accel", label: "unit 01" },
  { x: -10, y: -48, w: 28, d: 39, h: 10, z: 0, kind: "memory", label: "unit 02" },
  { x:  24, y: -42, w: 39, d: 31, h: 15, z: 2, kind: "compute", label: "unit 03" },
  { x: -50, y:   1, w: 31, d: 38, h: 11, z: 0, kind: "io", label: "unit 04" },
  { x: -12, y:  -2, w: 43, d: 42, h: 19, z: 4, kind: "core", label: "unit 05" },
  { x:  37, y:  -2, w: 28, d: 38, h: 12, z: 1, kind: "memory", label: "unit 06" },
  { x:  19, y:  40, w: 49, d: 26, h: 14, z: 2, kind: "accel", label: "unit 07" },
];
const CORE = 4;

function footprint(p) { return rings(p.x, p.y, p.x + p.w, p.y + p.d, 4.8, 1.45); }
function centre(p) { return [p.x + p.w / 2, p.y + p.d / 2]; }

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value, active = -1;
  const C = Cam(45, 0.5, 1.38);
  fit(C, [[BOARD[0], BOARD[1], 0], [BOARD[2], BOARD[1], 0], [BOARD[2], BOARD[3], 0],
    [BOARD[0], BOARD[3], 0], [-12, -2, 50], [68, 66, 28]], 200, 166);
  const P = proj(C), front = facing(C);
  const root = mk("g", {}, svg);
  const [br, bi] = rings(...BOARD, 9, 1.8);
  reflect(svg, root, P, front, br, 0, 12);
  const board = solid(root);
  put(board, prism(P, front, br, bi, 0, 7));

  const links = PARTS.map((p, i) => {
    if (i === CORE) return null;
    const a = centre(PARTS[CORE]), b = centre(p), mx = (a[0] + b[0]) / 2;
    return mk("path", { d: open([P(a[0], a[1], 7.15), P(mx, a[1], 7.15), P(mx, b[1], 7.15), P(b[0], b[1], 7.15)]), class: "nf lo dash" }, root);
  });

  const modules = PARTS.map((p, i) => {
    const group = mk("g", {}, root), body = solid(group);
    const marks = mk("path", { class: "nf lo" }, group);
    const dots = [];
    const count = p.kind === "memory" ? 3 : p.kind === "io" ? 4 : p.kind === "core" ? 4 : 2;
    for (let k = 0; k < count; k++) dots.push(mk("circle", { r: p.kind === "core" ? 1.35 : 1.05, class: "dot off" }, group));
    return { ...p, body, marks, dots, ring: footprint(p)[0], inner: footprint(p)[1], rise: tween(p.z) };
  });

  function features(m, z) {
    const inset = 6, x0 = m.x + inset, x1 = m.x + m.w - inset;
    const y0 = m.y + inset, y1 = m.y + m.d - inset, paths = [];
    let pts = [];
    if (m.kind === "accel") {
      paths.push(seg(P(x0, y0 + 4, z), P(x1, y0 + 4, z)), seg(P(x0, y1 - 4, z), P(x1, y1 - 4, z)));
      pts = [[x0 + 4, (y0 + y1) / 2], [x1 - 4, (y0 + y1) / 2]];
    } else if (m.kind === "memory") {
      paths.push(seg(P(x0, (y0 + y1) / 2, z), P(x1, (y0 + y1) / 2, z)));
      pts = [0.2, 0.5, 0.8].map(t => [x0 + (x1 - x0) * t, y0 + 3]);
    } else if (m.kind === "io") {
      paths.push(seg(P(x0, y1 - 5, z), P(x1, y1 - 5, z)));
      pts = [0.15, 0.38, 0.62, 0.85].map(t => [x0 + (x1 - x0) * t, y0 + 4]);
    } else if (m.kind === "core") {
      const die = rrect(m.x + 11, m.y + 10, m.x + m.w - 11, m.y + m.d - 10, 3, 5);
      paths.push(poly(die.map(q => P(q.u, q.v, z))));
      pts = [[m.x + 8, m.y + 8], [m.x + m.w - 8, m.y + 8], [m.x + 8, m.y + m.d - 8], [m.x + m.w - 8, m.y + m.d - 8]];
    } else {
      const die = rrect(m.x + 9, m.y + 8, m.x + m.w - 9, m.y + m.d - 8, 3, 5);
      paths.push(poly(die.map(q => P(q.u, q.v, z))));
      pts = [[m.x + 7, m.y + m.d / 2], [m.x + m.w - 7, m.y + m.d / 2]];
    }
    return { d: paths.join(""), pts: pts.map(q => P(q[0], q[1], z)) };
  }

  function draw(m, rise) {
    const z0 = 7 + rise, z1 = z0 + m.h;
    put(m.body, prism(P, front, m.ring, m.inner, z0, z1));
    const f = features(m, z1 + 0.05);
    m.marks.setAttribute("d", f.d);
    m.dots.forEach((dot, i) => place(dot, f.pts[i]));
  }

  function hit(point) {
    let found = -1, best = Infinity;
    PARTS.forEach((p, i) => {
      const w = unproj(C, point[0], point[1], 7 + p.z + p.h);
      const pad = 3;
      if (w[0] >= p.x - pad && w[0] <= p.x + p.w + pad && w[1] >= p.y - pad && w[1] <= p.y + p.d + pad) {
        const c = centre(p), score = ((w[0] - c[0]) / p.w) ** 2 + ((w[1] - c[1]) / p.d) ** 2;
        if (score < best) { best = score; found = i; }
      }
    });
    return found;
  }

  const loop = register(stage, (_dt, now) => {
    let moving = false;
    modules.forEach(m => { const z = tval(m.rise, now); draw(m, z); if (!tdone(m.rise, now)) moving = true; });
    return moving;
  });
  bag.add(loop.unregister);

  function select(next) {
    if (next === active) return;
    const now = performance.now(), origin = next >= 0 ? next : active;
    active = next;
    modules.forEach((m, i) => {
      const a = centre(m), b = origin >= 0 ? centre(PARTS[origin]) : a;
      const distance = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const neighbour = next >= 0 ? clamp(1 - distance / 72, 0, 1) : 0;
      const target = m.z + (i === next ? lift : neighbour * 3.5);
      tset(m.rise, target, now, clamp(distance * 0.65, 0, 55));
      m.body.sil.classList.toggle("hi", i === next || (next < 0 && i === CORE));
      links[i]?.classList.toggle("dash", i !== next);
    });
    read.textContent = next < 0 ? "rest" : PARTS[next].label;
    loop.wake();
  }

  modules.forEach((m, i) => { draw(m, m.z); m.body.sil.classList.toggle("hi", i === CORE); });
  bag.add(pointer(stage, { move: p => select(hit(p)), leave: () => select(-1) }));
  bag.add(() => svg.replaceChildren());
  return { set: v => { lift = v; if (active >= 0) { const a = active; active = -2; select(a); } }, destroy: bag.dispose };
}

hairline({
  name: "compute-array",
  means: "Seven heterogeneous compute packages share one backplane; the chosen package rises and nearby structure answers.",
  rules: [1, 2, 4, 5, 6, 8, 9, 10],
  range: [14, 22, 30],
  tour: [[268, 146], [147, 137], [189, 110], [191, 144], null],
  mount,
});
