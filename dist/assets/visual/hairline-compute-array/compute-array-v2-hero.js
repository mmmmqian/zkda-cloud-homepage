/**
 * Compute array V2: one infrastructure backplane carries seven heterogeneous
 * packages. A two-plane scheduler anchors the centre; three dim packet groups
 * identify the task layer without becoming a second focus.
 */
const {
  Cam, clamp, facing, fit, flatDot, open, poly, proj, rrect, ringAt, rings, run,
  prism, seg, solid, put, tdone, tset, tval, tween, disposer, mk, place, pointer,
  reflect, register, unproj,
} = HL;

const BOARD = [-76, -61, 76, 61];
const PARTS = [
  { x: -58, y: -43, w: 42, d: 34, h: 13, z: 1, kind: "accel", lanes: 2, label: "unit 01" },
  { x: -10, y: -48, w: 28, d: 39, h: 10, z: 0, kind: "memory", axis: "u", label: "unit 02" },
  { x:  24, y: -42, w: 39, d: 31, h: 15, z: 2, kind: "compute", label: "unit 03" },
  { x: -50, y:   1, w: 31, d: 38, h: 11, z: 0, kind: "io", label: "unit 04" },
  { x: -12, y:  -2, w: 43, d: 42, h: 19, z: 4, kind: "core", label: "unit 05" },
  { x:  37, y:  -2, w: 28, d: 38, h: 12, z: 1, kind: "memory", axis: "v", label: "unit 06" },
  { x:  19, y:  40, w: 49, d: 26, h: 14, z: 2, kind: "accel", lanes: 3, label: "unit 07" },
];
const CORE = 4, ORDER = [0, 1, 3, 2, 4, 5, 6];

function footprint(p, inset = 0) {
  return rings(p.x + inset, p.y + inset, p.x + p.w - inset, p.y + p.d - inset,
    Math.max(2.5, 4.8 - inset * 0.28), inset ? 1 : 1.45);
}
function centre(p) { return [p.x + p.w / 2, p.y + p.d / 2]; }

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value, active = -1;
  const C = Cam(45, 0.5, 1.84);
  fit(C, [[BOARD[0], BOARD[1], 0], [BOARD[2], BOARD[1], 0], [BOARD[2], BOARD[3], 0],
    [BOARD[0], BOARD[3], 0], [-12, -2, 66], [68, 66, 34]], 200, 166);
  const P = proj(C), front = facing(C), root = mk("g", {}, svg);
  const [br, bi] = rings(...BOARD, 9, 1.8);
  reflect(svg, root, P, front, br, 0, 12);
  const board = solid(root);
  put(board, prism(P, front, br, bi, 0, 7));
  mk("path", { d: open(ringAt(P, run(br, front), 2.6)), class: "nf lo" }, root);
  const mountRail = rrect(BOARD[0] + 6, BOARD[1] + 6, BOARD[2] - 6, BOARD[3] - 6, 5, 6);
  mk("path", { d: poly(mountRail.map(q => P(q.u, q.v, 7.08))), class: "nf lo" }, root);

  const links = PARTS.map((p, i) => {
    if (i === CORE) return null;
    const a = centre(PARTS[CORE]), b = centre(p), mx = (a[0] + b[0]) / 2;
    return mk("path", { d: open([P(a[0], a[1], 7.15), P(mx, a[1], 7.15),
      P(mx, b[1], 7.15), P(b[0], b[1], 7.15)]), class: "nf lo dash" }, root);
  });

  // Three packet groups sit on representative routes: one, two and three dots.
  [[0, 3], [2, 2], [6, 1]].forEach(([index, count]) => {
    const a = centre(PARTS[CORE]), b = centre(PARTS[index]), t = 0.48;
    for (let k = 0; k < count; k++) {
      const dot = flatDot(root, C, 0.62, "dot off");
      place(dot, P(a[0] + (b[0] - a[0]) * t + (k - (count - 1) / 2) * 3.2,
        a[1] + (b[1] - a[1]) * t, 7.28));
    }
  });

  const modules = [];
  ORDER.forEach(i => {
    const p = PARTS[i], group = mk("g", {}, root), body = solid(group);
    const planes = i === CORE ? [solid(group), solid(group)] : [];
    const marks = mk("path", { class: "nf lo" }, group), dots = [];
    const count = p.kind === "memory" ? 3 : p.kind === "io" ? 4 : p.kind === "core" ? 4 : p.lanes || 2;
    for (let k = 0; k < count; k++) dots.push(mk("circle", { r: p.kind === "core" ? 1.35 : 1.05, class: "dot off" }, group));
    modules[i] = { ...p, body, planes, marks, dots, ring: footprint(p)[0], inner: footprint(p)[1], rise: tween(p.z) };
  });

  function features(m, z) {
    const x0 = m.x + 6, x1 = m.x + m.w - 6, y0 = m.y + 6, y1 = m.y + m.d - 6, paths = [];
    let pts = [];
    if (m.kind === "accel") {
      for (let k = 0; k < m.lanes; k++) {
        const y = y0 + 4 + k * (y1 - y0 - 8) / Math.max(1, m.lanes - 1);
        paths.push(seg(P(x0, y, z), P(x1, y, z)));
      }
      pts = Array.from({ length: m.lanes }, (_, k) => [x0 + 4 + k * (x1 - x0 - 8) / Math.max(1, m.lanes - 1), (y0 + y1) / 2]);
    } else if (m.kind === "memory") {
      if (m.axis === "u") paths.push(seg(P(x0, (y0 + y1) / 2, z), P(x1, (y0 + y1) / 2, z)));
      else paths.push(seg(P((x0 + x1) / 2, y0, z), P((x0 + x1) / 2, y1, z)));
      pts = [0.2, 0.5, 0.8].map(t => m.axis === "u" ? [x0 + (x1 - x0) * t, y0 + 3] : [x0 + 3, y0 + (y1 - y0) * t]);
    } else if (m.kind === "io") {
      paths.push(seg(P(x0, y1 - 5, z), P(x1, y1 - 5, z)));
      pts = [0.15, 0.38, 0.62, 0.85].map(t => [x0 + (x1 - x0) * t, y0 + 4]);
    } else {
      const die = rrect(m.x + 9, m.y + 8, m.x + m.w - 9, m.y + m.d - 8, 3, 5);
      paths.push(poly(die.map(q => P(q.u, q.v, z))));
      if (m.kind === "compute") {
        const inner = rrect(m.x + 13, m.y + 11, m.x + m.w - 13, m.y + m.d - 11, 2, 5);
        paths.push(poly(inner.map(q => P(q.u, q.v, z))));
      }
      pts = [[m.x + 7, m.y + 7], [m.x + m.w - 7, m.y + 7], [m.x + 7, m.y + m.d - 7], [m.x + m.w - 7, m.y + m.d - 7]].slice(0, m.dots.length);
    }
    return { d: paths.join(""), pts: pts.map(q => P(q[0], q[1], z)) };
  }

  function draw(m, rise) {
    const z0 = 7 + rise, z1 = z0 + m.h;
    put(m.body, prism(P, front, m.ring, m.inner, z0, z1));
    if (m.planes.length) {
      const p0 = footprint(m, 6.5), p1 = footprint(m, 9.5);
      put(m.planes[0], prism(P, front, p0[0], p0[1], z1 + 1.6, z1 + 2.6));
      put(m.planes[1], prism(P, front, p1[0], p1[1], z1 + 4.0, z1 + 5.0));
    }
    const f = features(m, z1 + 0.05);
    m.marks.setAttribute("d", f.d);
    m.dots.forEach((dot, i) => place(dot, f.pts[i]));
  }

  function hit(point) {
    let found = -1, best = Infinity;
    PARTS.forEach((p, i) => {
      const w = unproj(C, point[0], point[1], 7 + p.z + p.h), pad = 3;
      if (w[0] >= p.x - pad && w[0] <= p.x + p.w + pad && w[1] >= p.y - pad && w[1] <= p.y + p.d + pad) {
        const c = centre(p), score = ((w[0] - c[0]) / p.w) ** 2 + ((w[1] - c[1]) / p.d) ** 2;
        if (score < best) { best = score; found = i; }
      }
    });
    return found;
  }

  const loop = register(stage, (_dt, now) => {
    let moving = false;
    modules.forEach(m => { draw(m, tval(m.rise, now)); if (!tdone(m.rise, now)) moving = true; });
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
      const response = i === CORE && next >= 0 && next !== CORE ? 2.2 + neighbour * 2.2 : neighbour * 3.5;
      tset(m.rise, m.z + (i === next ? lift : response), now, clamp(distance * 0.65, 0, 55));
      m.body.sil.classList.toggle("hi", i === next || (next < 0 && i === CORE));
      links[i]?.classList.toggle("hi", i === next);
      links[i]?.classList.toggle("lo", i !== next);
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
  name: "compute-array-v2-hero",
  means: "One platform carries heterogeneous compute units; a central scheduler and its route answer the chosen package.",
  rules: [1, 2, 4, 5, 6, 8, 9, 10],
  range: [14, 22, 30],
  tour: [[293, 137], [129, 127], [186, 104], [190, 137], null],
  mount,
});
