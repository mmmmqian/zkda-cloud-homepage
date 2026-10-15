/**
 * AutoDev V1.1: one AI development workbench. A prompt tray feeds a central coding
 * terminal and a compact build dock receives its output. The row under the
 * pointer lifts; nearby rows follow, and the single execution path answers.
 */
const {
  Cam, clamp, fit, proj, facing, rings, rrect, prism, solid, put, mk, open, poly,
  place, tween, tset, tval, tdone, disposer, pointer, register,
} = HL;

const TX = -39, TW = 132, TH = 102, SLAB = 3.2, BAR = 3.45;
const ROWS = [
  { v: 24, indent: 0, tokens: [10, 4, 7], phase: "generate" },
  { v: 32, indent: 2, tokens: [6, 13], phase: "edit" },
  { v: 40, indent: 4, tokens: [4, 8, 5], phase: "edit" },
  { v: 51, indent: 2, tokens: [8, 5, 9], phase: "review" },
  { v: 59, indent: 5, tokens: [12, 5], phase: "review" },
  { v: 67, indent: 5, tokens: [5, 7, 4], phase: "debug" },
  { v: 75, indent: 2, tokens: [9, 4, 6], phase: "build" },
  { v: 81, indent: 13, tokens: [5], phase: "deploy" },
];
const REST = [0, 0.2, 0.55, 1.15, 1.8, 1.05, 0.4, 0.1];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value, active = -1;
  const C = Cam(45, 0.5, 1.68);
  fit(C, [[-92, -8, 0], [145, -8, 0], [-92, 55, 0], [145, 55, 0], [TX, -3, TH + 7], [TX + TW, 8, TH + 7]], 200, 166);
  const P = proj(C), front = facing(C), root = mk("g", {}, svg);
  const P2 = (u, v, w) => P(TX + u, w, v);
  const face = (q) => 0.612 * q.nu + 0.5 * q.nv > 0;
  const path = (pts, cls = "nf lo", parent = root, attrs = {}) => mk("path", { d: open(pts.map((q) => P(...q))), class: cls, ...attrs }, parent);
  const dot = (x, y, z, r, cls, parent = root) => { const e = mk("circle", { r, class: cls }, parent); place(e, P(x, y, z)); return e; };
  const faceDot = (u, v, w, r, cls, parent) => { const e = mk("circle", { r, class: cls }, parent); place(e, P2(u, v, w)); return e; };
  const plate = (parent, x0, y0, x1, y1, r, z0, z1) => { const [o, i] = rings(x0, y0, x1, y1, r, 1.1); const s = solid(parent); put(s, prism(P, front, o, i, z0, z1)); return s; };
  const rim = (x0, y0, x1, y1, r, z) => poly(rrect(x0, y0, x1, y1, r, 5).map((q) => P(q.u, q.v, z)));
  const accent = (e, on) => { e.classList.toggle("hi", on); e.classList.toggle("lo", !on); };

  // One physical run links the input tray, the terminal foot and the output dock.
  const inputRun = path([[-72, 31, 1.15], [-51, 31, 1.15], [-51, 0, 1.15], [TX + 13, 0, 1.15]], "nf lo", root, { "data-input-run": "" });
  const outputRun = path([[TX + TW - 13, 0, 1.15], [108, 0, 1.15], [108, 27, 1.15], [116, 27, 1.15]], "nf lo", root, { "data-output-run": "" });
  const inputNode = dot(-72, 31, 1.15, 1.05, "dot off"), outputNode = dot(116, 27, 1.15, 1.05, "dot m");

  // The terminal is the centre and only vertical plane.
  const terminal = mk("g", { "data-terminal": "" }, root), [sr, si] = rings(0, 0, TW, TH, 8.5, 1.8), terminalBody = solid(terminal);
  put(terminalBody, prism(P2, face, sr, si, -SLAB, 0)); terminalBody.sil.setAttribute("data-terminal-body", "");
  const rows = ROWS.map((spec, i) => {
    const g = mk("g", { "data-code-row": i }, terminal), segs = [];
    let at = spec.indent;
    spec.tokens.forEach((n) => { const x0 = 12 + at * BAR; segs.push({ x0, x1: x0 + n * BAR - 1.2, el: solid(g) }); at += n + 1; });
    return { i, spec, segs, lift: tween(REST[i]), drawn: "" };
  });
  function drawRow(row, lift) {
    const key = lift.toFixed(3); if (key === row.drawn) return; row.drawn = key;
    const v = row.spec.v;
    row.segs.forEach((seg) => { const o = rrect(seg.x0, v - 1.7, seg.x1, v + 1.7, 1.7, 4), inn = rrect(seg.x0 + 0.65, v - 1.05, seg.x1 - 0.65, v + 1.05, 1.05, 4); put(seg.el, prism(P2, face, o, inn, lift, lift + 1.45)); });
  }
  rows.forEach((r, i) => drawRow(r, REST[i]));
  const aiRailRing = rrect(7.4, 48, 9.8, 70, 1.2, 5), aiRailInner = rrect(8.05, 48.65, 9.15, 69.35, 0.55, 5), aiRail = solid(terminal);
  put(aiRail, prism(P2, face, aiRailRing, aiRailInner, 0, 1.2)); aiRail.sil.classList.add("lo"); aiRail.sil.setAttribute("data-ai-region", "");

  // Header and command shelf sit over the code, preserving the terminal's honest occlusion.
  const [hr, hi] = rings(2.2, TH - 17, TW - 2.2, TH - 2.2, 5.5, 1.15);
  put(solid(terminal), prism(P2, face, hr, hi, 0, 3.2));
  [13, 21, 29].forEach((u, i) => { const [o, n] = rings(u - 2.3, TH - 11.9, u + 2.3, TH - 7.3, 2.3, 0.7); const s = solid(terminal); put(s, prism(P2, face, o, n, 3.2, 4.2)); if (i === 1) s.sil.classList.add("lo"); });
  const [fr, fi] = rings(2.2, 2.2, TW - 2.2, 17, 5.5, 1.15);
  put(solid(terminal), prism(P2, face, fr, fi, 0, 3.2));
  const cursorRing = rrect(13, 7, 23, 12, 1.5, 4), cursorInner = rrect(13.7, 7.7, 22.3, 11.3, 0.8, 4), cursor = solid(terminal);
  put(cursor, prism(P2, face, cursorRing, cursorInner, 3.2, 4.4)); cursor.sil.classList.add("hi");
  const feedbackRing = rrect(TW - 45, 7, TW - 15, 12, 1.7, 5), feedbackInner = rrect(TW - 44.2, 7.8, TW - 15.8, 11.2, 0.9, 5), feedback = solid(terminal);
  put(feedback, prism(P2, face, feedbackRing, feedbackInner, 3.2, 4.15)); feedback.sil.classList.add("lo"); feedback.sil.setAttribute("data-execution-feedback", "");
  const feedbackDots = [TW - 39, TW - 31, TW - 23].map((u, i) => faceDot(u, 9.5, 4.35, 0.8, i === 2 ? "dot m" : "dot off", terminal));

  // Prompt tray: shallow language lines and a keyed insertion block, not a chat window.
  const prompt = mk("g", { "data-prompt": "" }, root), promptBody = plate(prompt, -91, 17, -48, 48, 5, 0, 5.2); promptBody.sil.setAttribute("data-prompt-body", "");
  mk("path", { d: rim(-86, 22, -54, 43, 3.5, 5.35), class: "nf lo" }, prompt);
  path([[-82, 27, 5.5], [-59, 27, 5.5]], "nf lo", prompt);
  path([[-82, 32.5, 5.5], [-70, 32.5, 5.5], [-67, 32.5, 5.5], [-57, 32.5, 5.5]], "nf lo", prompt);
  path([[-82, 38, 5.5], [-65, 38, 5.5]], "nf lo", prompt);
  const promptKey = mk("path", { d: rim(-86, 24, -82, 28, 1.2, 5.65), class: "nf lo" }, prompt);

  // Build & deploy is a receiving dock: two build layers and one release socket.
  const deploy = mk("g", { "data-build-deploy": "" }, root), deployBody = plate(deploy, 116, 12, 145, 48, 5, 0, 5.8); deployBody.sil.setAttribute("data-build-body", "");
  mk("path", { d: rim(121, 17, 140, 42, 3.5, 5.95), class: "nf lo" }, deploy);
  const buildA = plate(deploy, 120, 19, 138, 28, 2.2, 6, 8.4), buildB = plate(deploy, 123, 29.5, 141, 38.5, 2.2, 6, 10.2);
  const buildDots = [124, 130, 136].map((x, i) => dot(x, 41.2, 6.15, 1, i === 2 ? "dot m" : "dot off", deploy));

  const loop = register(stage, (_dt, now) => { let moving = false; rows.forEach((r) => { drawRow(r, tval(r.lift, now)); if (!tdone(r.lift, now)) moving = true; }); return moving; });
  bag.add(loop.unregister);

  // Pick from fixed resting row centres, never from a lifted line.
  const rowCentres = rows.map((r) => P2(TW / 2, r.spec.v, 0));
  function hit([x, y]) {
    const xs = rowCentres.map((p) => p[0]), ys = rowCentres.map((p) => p[1]);
    if (x < Math.min(...xs) - 83 || x > Math.max(...xs) + 83 || y < Math.min(...ys) - 8 || y > Math.max(...ys) + 8) return -1;
    let best = -1, dist = Infinity; rowCentres.forEach((p, i) => { const d = Math.abs(y - p[1]); if (d < dist) { dist = d; best = i; } });
    return dist <= 8 ? best : -1;
  }
  function setActive(next, force = false) {
    if (next === active && !force) return;
    const now = performance.now(), from = next >= 0 ? next : active; active = next;
    rows.forEach((r, i) => { const d = next < 0 ? Infinity : Math.abs(i - next), target = next < 0 ? REST[i] : 6.4 * clamp(1 - d / (reach + 0.7), 0, 1); tset(r.lift, target, now, next < 0 ? 0 : Math.abs(i - from) * 34); r.segs.forEach((s) => s.el.sil.classList.toggle("hi", i === next)); });
    const on = next >= 0; [inputRun, outputRun].forEach((e) => accent(e, on)); inputNode.setAttribute("class", on ? "dot" : "dot off"); outputNode.setAttribute("class", on ? "dot" : "dot m");
    accent(promptKey, on); buildDots[2].setAttribute("class", on ? "dot" : "dot m"); feedbackDots[2].setAttribute("class", on ? "dot" : "dot m"); cursor.sil.classList.toggle("hi", !on);
    read.textContent = on ? rows[next].spec.phase : "rest"; loop.wake();
  }
  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());
  return { set: (v) => { reach = v; setActive(active, true); }, destroy: bag.dispose };
}

hairline({
  name: "autodev-workspace-v1-1",
  means: "A prompt tray feeds a grouped AI coding terminal and a distinct build dock; the pointed code row remains the primary response.",
  rules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  range: [1, 2, 3.5],
  tour: [[229, 179], [229, 167], [229, 140], [229, 117], [229, 97], null],
  mount,
});
