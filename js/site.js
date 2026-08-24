(() => {
  document.documentElement.classList.add("js");
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(year);
  });

  const heroMotion = document.querySelector("[data-hero-motion]");
  const heroWebGLCanvas = heroMotion?.querySelector("[data-hero-webgl]");
  const heroEventGlowCanvas = heroMotion?.querySelector("[data-hero-event-glow]");
  const heroGridCanvas = heroMotion?.querySelector("[data-hero-grid-canvas]");
  const heroFocusGridCanvas = heroMotion?.querySelector("[data-hero-focus-grid]");
  const heroRevealCanvas = heroMotion?.querySelector("[data-hero-reveal]");

  if (heroMotion && heroWebGLCanvas && heroEventGlowCanvas && heroGridCanvas) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const fullTurn = Math.PI * 2;
    const palette = {
      dark: [166, 174, 169],
      slate: [202, 210, 204],
      blue: [61, 105, 220],
      cyan: [54, 164, 177],
      green: [91, 180, 83],
      white: [255, 255, 252],
    };
    const pointer = { x: 0.72, y: 0.34, targetX: 0.72, targetY: 0.34, active: false, hasEntered: false };
    let gridContext = null;
    let glowContext = null;
    let focusGridContext = null;
    let revealContext = null;
    let webglScene = null;
    let cells = [];
    let activeEvents = [];
    let nextEventAt = 0;
    let nextAccentAt = 0;
    let rareAccentCount = 0;
    let hasOpeningPulse = false;
    let eventSeed = 987654321;
    let gridColumns = 1;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frame = 0;
    let previousTime = 0;
    const eventRandom = () => {
      eventSeed = (eventSeed * 48271) % 2147483647;
      return (eventSeed - 1) / 2147483646;
    };

    try {
      gridContext = heroGridCanvas.getContext("2d", { alpha: true });
    } catch (_error) {
      gridContext = null;
    }
    try {
      glowContext = heroEventGlowCanvas.getContext("2d", { alpha: true });
    } catch (_error) {
      glowContext = null;
    }
    try {
      focusGridContext = heroFocusGridCanvas?.getContext("2d", { alpha: true }) || null;
    } catch (_error) {
      focusGridContext = null;
    }
    try {
      revealContext = heroRevealCanvas?.getContext("2d", { alpha: true }) || null;
    } catch (_error) {
      revealContext = null;
    }

    const compileShader = (gl, type, source) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const createWebGLScene = () => {
      let gl = null;
      try {
        gl = heroWebGLCanvas.getContext("webgl", {
          alpha: false,
          antialias: false,
          depth: false,
          powerPreference: "low-power",
        });
      } catch (_error) {
        gl = null;
      }
      if (!gl) return null;

      const vertexSource = `
        attribute vec2 a_position;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;
      const fragmentSource = `
        precision mediump float;
        uniform vec2 u_resolution;
        uniform float u_time;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 4; i++) {
            value += amplitude * noise(p);
            p = p * 2.03 + vec2(11.7, 7.9);
            amplitude *= 0.5;
          }
          return value;
        }

        float lightField(vec2 p, vec2 center, float radius) {
          float distanceToCenter = length(p - center);
          return 1.0 - smoothstep(radius * 0.18, radius, distanceToCenter);
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          uv.y = 1.0 - uv.y;
          vec2 p = uv - 0.5;
          p.x *= u_resolution.x / max(u_resolution.y, 1.0);

          float driftA = u_time * 6.2831853 / 17.0;
          float driftB = u_time * 6.2831853 / 23.0;
          float driftC = u_time * 6.2831853 / 27.0;
          float driftD = u_time * 6.2831853 / 19.0;
          p.x += sin(p.y * 2.7 + driftA) * 0.055;
          p.y += cos(p.x * 2.2 - driftB) * 0.045;

          float field = fbm(p * 2.2 + vec2(sin(driftA), cos(driftB)) * 0.38);
          vec2 centerA = vec2(-0.56 + sin(driftB) * 0.07, -0.18 + cos(driftA) * 0.05);
          vec2 centerB = vec2(0.43 + cos(driftA) * 0.08, 0.16 + sin(driftB) * 0.06);
          vec2 centerC = vec2(0.02 + sin(driftC + 1.8) * 0.06, -0.34 + cos(driftC) * 0.05);
          vec2 centerD = vec2(0.57 + cos(driftD + 0.7) * 0.05, -0.28 + sin(driftD) * 0.04);
          float blueField = lightField(p, centerA, 0.72) + lightField(p, centerB, 0.58) * 0.62;
          float cyanField = lightField(p, centerC, 0.64) * 0.72;
          float greenField = lightField(p, centerD, 0.58) * 0.58;
          float deformation = (field - 0.5) * 0.16;

          vec3 color = vec3(0.91, 0.925, 0.90);
          float blueMix = clamp(max(0.0, blueField + deformation) * 0.42, 0.0, 0.58);
          float cyanMix = clamp(max(0.0, cyanField - deformation) * 0.34, 0.0, 0.42);
          float greenMix = clamp(max(0.0, greenField + deformation) * 0.28, 0.0, 0.34);
          color = mix(color, vec3(0.44, 0.62, 0.94), blueMix);
          color = mix(color, vec3(0.48, 0.80, 0.81), cyanMix);
          color = mix(color, vec3(0.62, 0.84, 0.57), greenMix);
          color += (hash(gl_FragCoord.xy + u_time * 58.0) - 0.5) * 0.018;

          gl_FragColor = vec4(color, 1.0);
        }
      `;
      const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
      const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
      if (!vertexShader || !fragmentShader) return null;

      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const position = gl.getAttribLocation(program, "a_position");
      const resolution = gl.getUniformLocation(program, "u_resolution");
      const time = gl.getUniformLocation(program, "u_time");
      gl.useProgram(program);
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      return { gl, program, resolution, time };
    };

    webglScene = createWebGLScene();
    if (!webglScene) heroWebGLCanvas.hidden = true;
    if (!gridContext) heroGridCanvas.hidden = true;
    if (!gridContext || !glowContext) heroEventGlowCanvas.hidden = true;
    if (!focusGridContext && heroFocusGridCanvas) heroFocusGridCanvas.hidden = true;
    if (!revealContext && heroRevealCanvas) heroRevealCanvas.hidden = true;

    const createCells = () => {
      if (!gridContext) return;
      let seed = width < 640 ? 271828 : 314159;
      const random = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      const minimumColumns = width < 640 ? 6 : width < 1000 ? 9 : 12;
      const columns = Math.max(minimumColumns, Math.ceil(width / 100));
      gridColumns = columns;
      const size = width / columns;
      const rows = Math.ceil(height / size) + 1;

      cells = Array.from({ length: columns * rows }, (_, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const horizontalPosition = columns > 1 ? column / (columns - 1) : 0;
        const colorRoll = random() - Math.max(0, horizontalPosition - 0.58) * 0.52;
        const color = colorRoll > 0.94
          ? palette.green
          : colorRoll > 0.84
            ? palette.cyan
            : colorRoll > 0.5
              ? palette.blue
              : colorRoll > 0.25
                ? palette.slate
                : palette.dark;
        const colored = color === palette.blue || color === palette.cyan || color === palette.green;
        const contrastTier = (column + row * 2) % 4;
        const baseOpacity = colored
          ? 0.15 + contrastTier * 0.035 + random() * 0.008
          : 0.035 + contrastTier * 0.02 + random() * 0.006;
        return {
          index,
          column,
          row,
          x: column * size,
          y: (row - 0.5) * size,
          width: size,
          height: size,
          phase: random() * fullTurn + index * 0.17,
          revealGate: random(),
          revealPhase: random() * fullTurn,
          breathPeriod: 6000 + random() * 6000,
          blinkPeriod: 1500 + random() * 3100,
          color,
          colored,
          contrastTier,
          base: baseOpacity,
        };
      });
    };

    const resizeHeroCanvases = () => {
      const bounds = heroMotion.getBoundingClientRect();
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);

      if (webglScene) {
        heroWebGLCanvas.width = Math.round(width * pixelRatio);
        heroWebGLCanvas.height = Math.round(height * pixelRatio);
        webglScene.gl.viewport(0, 0, heroWebGLCanvas.width, heroWebGLCanvas.height);
      }
      if (gridContext) {
        heroGridCanvas.width = Math.round(width * pixelRatio);
        heroGridCanvas.height = Math.round(height * pixelRatio);
        gridContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        if (glowContext) {
          heroEventGlowCanvas.width = Math.round(width * pixelRatio);
          heroEventGlowCanvas.height = Math.round(height * pixelRatio);
          glowContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        }
        if (focusGridContext && heroFocusGridCanvas) {
          heroFocusGridCanvas.width = Math.round(width * pixelRatio);
          heroFocusGridCanvas.height = Math.round(height * pixelRatio);
          focusGridContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        }
        createCells();
      }
      if (revealContext && heroRevealCanvas) {
        heroRevealCanvas.width = Math.round(width * pixelRatio);
        heroRevealCanvas.height = Math.round(height * pixelRatio);
        revealContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      }
    };

    const drawWebGL = (time) => {
      if (!webglScene) return;
      const { gl, resolution, time: timeUniform } = webglScene;
      gl.useProgram(webglScene.program);
      gl.uniform2f(resolution, heroWebGLCanvas.width, heroWebGLCanvas.height);
      gl.uniform1f(timeUniform, time / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const eventPalette = {
      blue: [38, 109, 255],
      cyan: [50, 205, 210],
      green: [137, 255, 117],
      white: [255, 255, 255],
    };

    const cyclePalette = {
      dark: [139, 149, 144],
      blue: [36, 88, 232],
      cyan: [31, 172, 188],
      green: [103, 205, 82],
      white: [255, 255, 255],
    };

    const getCellCycleState = (cell, time) => {
      const cyclePosition = time / cell.blinkPeriod + cell.phase * 1.7 / fullTurn;
      const cycleIndex = Math.floor(cyclePosition);
      const cycleProgress = cyclePosition - cycleIndex;
      const randomValue = Math.sin((cell.index + 1) * 12.9898 + (cycleIndex + 1) * 78.233) * 43758.5453;
      const roll = randomValue - Math.floor(randomValue);
      const name = roll < 0.58
        ? "dark"
        : roll < 0.85
          ? "blue"
          : roll < 0.93
            ? "cyan"
            : roll < 0.98
              ? "green"
              : "white";
      return {
        name,
        color: cyclePalette[name],
        colored: name !== "dark",
        blink: (1 - Math.cos(cycleProgress * fullTurn)) / 2,
        roll,
      };
    };

    const cycleColorNames = ["dark", "blue", "cyan", "green", "white"];
    let currentCycleStates = [];
    const buildCellCycleStates = (time) => {
      const states = [];
      cells.forEach((cell, index) => {
        const state = getCellCycleState(cell, time);
        const forbidden = new Set();
        const left = cell.column > 0 ? states[index - 1] : null;
        const leftTwo = cell.column > 1 ? states[index - 2] : null;
        const top = cell.row > 0 ? states[index - gridColumns] : null;
        const topTwo = cell.row > 1 ? states[index - gridColumns * 2] : null;
        const topLeft = cell.column > 0 && cell.row > 0 ? states[index - gridColumns - 1] : null;
        if (left && leftTwo && left.name === leftTwo.name) forbidden.add(left.name);
        if (top && topTwo && top.name === topTwo.name) forbidden.add(top.name);
        if (left && top && left.name === top.name) forbidden.add(left.name);
        if (left && top && topLeft && left.name === top.name && top.name === topLeft.name) forbidden.add(left.name);
        if (forbidden.has(state.name)) {
          const startIndex = Math.floor(state.roll * cycleColorNames.length);
          let replacement = null;
          for (let offset = 1; offset <= cycleColorNames.length; offset += 1) {
            const candidate = cycleColorNames[(startIndex + offset) % cycleColorNames.length];
            if (!forbidden.has(candidate)) {
              replacement = candidate;
              break;
            }
          }
          state.name = replacement || "blue";
          state.color = cyclePalette[state.name];
          state.colored = state.name !== "dark";
        }
        states.push(state);
      });
      return states;
    };

    const chooseEventColor = (cell) => {
      if (cell.color === palette.green) return "green";
      if (cell.color === palette.cyan) return "cyan";
      if (cell.color === palette.blue) return eventRandom() > 0.72 ? "cyan" : "blue";
      const roll = eventRandom();
      return roll > 0.88 ? "green" : roll > 0.63 ? "cyan" : "blue";
    };

    const chooseEventIntensity = () => {
      const roll = eventRandom();
      if (roll < 0.56) return 0.36 + eventRandom() * 0.2;
      if (roll < 0.93) return 0.66 + eventRandom() * 0.2;
      return 0.94 + eventRandom() * 0.06;
    };

    const addCellEvent = (cellIndex, kind, start, colorName = null, intensityScale = 1, forcedIntensity = null) => {
      const duration = kind === "white"
        ? 350 + eventRandom() * 450
        : 800 + eventRandom() * 700;
      const isWhite = kind === "white";
      activeEvents.push({
        cellIndex,
        kind,
        colorName: colorName || chooseEventColor(cells[cellIndex]),
        start,
        duration,
        intensity: forcedIntensity ?? chooseEventIntensity() * intensityScale,
        glowDelay: isWhite ? 100 + eventRandom() * 60 : 120 + eventRandom() * 100,
        glowPeakAt: isWhite ? 380 + eventRandom() * 140 : 600 + eventRandom() * 150,
        glowPeakOpacity: isWhite ? 0.2 + eventRandom() * 0.12 : 0.2 + eventRandom() * 0.15,
        glowInitialBlur: isWhite ? 10 + eventRandom() * 10 : 40 + eventRandom() * 30,
        glowPeakBlur: isWhite ? 26 + eventRandom() * 24 : 80 + eventRandom() * 60,
        glowFinalScale: isWhite ? 1.1 + eventRandom() * 0.05 : 1.25 + eventRandom() * 0.25,
        glowTail: isWhite ? 240 + eventRandom() * 160 : 600 + eventRandom() * 300,
      });
    };

    const getAdjacentCell = (cellIndex, excluded) => {
      const cell = cells[cellIndex];
      const candidates = [];
      if (cell.column > 0) candidates.push(cellIndex - 1);
      if (cell.column < gridColumns - 1) candidates.push(cellIndex + 1);
      if (cell.row > 0) candidates.push(cellIndex - gridColumns);
      if (cellIndex + gridColumns < cells.length) candidates.push(cellIndex + gridColumns);
      const available = candidates.filter((index) => !excluded.includes(index));
      return available.length ? available[Math.floor(eventRandom() * available.length)] : cellIndex;
    };

    const findPointerCell = () => {
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      cells.forEach((cell, index) => {
        const dx = (cell.x + cell.width / 2) / width - pointer.x;
        const dy = (cell.y + cell.height / 2) / height - pointer.y;
        const distance = dx * dx + dy * dy;
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      return closestIndex;
    };

    const spawnGridEvent = (time) => {
      if (!cells.length) return;
      if (!hasOpeningPulse) {
        const openingColumn = Math.min(gridColumns - 1, Math.max(0, Math.round(gridColumns * 0.72)));
        const openingRow = Math.max(1, Math.round((cells.length / gridColumns) * 0.34));
        const openingIndex = Math.min(cells.length - 1, openingRow * gridColumns + openingColumn);
        addCellEvent(openingIndex, "color", time, "cyan", 1, 0.96);
        hasOpeningPulse = true;
        nextEventAt = time + 1500 + eventRandom() * 1800;
        return;
      }
      const baseIndex = pointer.hasEntered && eventRandom() > (pointer.active ? 0.62 : 0.7)
        ? findPointerCell()
        : Math.floor(eventRandom() * cells.length);
      const chainRoll = eventRandom();

      if (chainRoll < 0.3) {
        const sequence = eventRandom() > 0.5
          ? ["color", "white", "dark"]
          : ["dark", "color", "glow"];
        const chainLength = chainRoll < 0.1 ? 3 : 2;
        const selected = [baseIndex];
        let eventTime = time;
        sequence.slice(0, chainLength).forEach((kind, sequenceIndex) => {
          if (sequenceIndex > 0) {
            selected.push(getAdjacentCell(selected[selected.length - 1], selected));
            eventTime += 150 + eventRandom() * 250;
          }
          addCellEvent(selected[sequenceIndex], kind, eventTime, null, sequenceIndex === 2 ? 0.72 : 1);
        });
      } else {
        const singleRoll = eventRandom();
        const kind = singleRoll < 0.1 ? "white" : singleRoll < 0.3 ? "dark" : "color";
        addCellEvent(baseIndex, kind, time);
      }

      nextEventAt = time + 1200 + eventRandom() * 3300;
    };

    const spawnRareAccent = (time) => {
      if (!cells.length) return;
      const baseIndex = findPointerCell();
      const targetIndex = eventRandom() > 0.46
        ? baseIndex
        : getAdjacentCell(baseIndex, [baseIndex]);
      if (rareAccentCount === 0) {
        addCellEvent(targetIndex, "color", time, "green", 1, 0.9);
        const whiteIndex = getAdjacentCell(targetIndex, [targetIndex]);
        addCellEvent(whiteIndex, "white", time + 240 + eventRandom() * 120, "white", 1, 0.94);
      } else if (eventRandom() < 0.34) {
        addCellEvent(targetIndex, "white", time, "white", 1, 0.98);
      } else {
        addCellEvent(targetIndex, "color", time, "green", 1, 0.88);
      }
      rareAccentCount += 1;
      nextAccentAt = time + 9000 + eventRandom() * 13000;
    };

    const eventEnvelope = (event, time) => {
      const progress = (time - event.start) / event.duration;
      if (progress < 0 || progress > 1) return 0;
      if (event.kind === "white") {
        if (progress < 0.18) return progress / 0.18;
        if (progress < 0.42) return 1 - (progress - 0.18) / 0.24;
        return Math.max(0, (1 - progress) * 0.08);
      }
      if (event.kind === "dark") {
        if (progress < 0.12) return progress / 0.12;
        if (progress < 0.38) return 1;
        return 1 - (progress - 0.38) / 0.62;
      }
      const peakProgress = Math.min(0.56, 450 / event.duration);
      if (progress < peakProgress) {
        const attack = progress / peakProgress;
        return 0.12 + attack * attack * 0.88;
      }
      const release = (progress - peakProgress) / (1 - peakProgress);
      if (release < 0.28) return 1 - release / 0.28 * 0.62;
      return 0.38 * (1 - (release - 0.28) / 0.72);
    };

    const glowEnvelope = (event, time) => {
      if (event.kind === "dark") return null;
      const glowStart = event.start + event.glowDelay;
      const glowDuration = event.duration + event.glowTail;
      const localTime = time - glowStart;
      if (localTime < 0 || localTime > glowDuration) return null;

      const peakLocalTime = Math.max(280, event.glowPeakAt - event.glowDelay);
      const peakScale = 1 + (event.glowFinalScale - 1) * 0.72;
      if (localTime <= peakLocalTime) {
        const progress = localTime / peakLocalTime;
        const eased = 1 - Math.pow(1 - progress, 2);
        return {
          opacity: (0.08 + (event.glowPeakOpacity - 0.08) * eased) * event.intensity,
          scale: 1 + (peakScale - 1) * eased,
          blur: event.glowInitialBlur + (event.glowPeakBlur - event.glowInitialBlur) * eased,
        };
      }

      const release = (localTime - peakLocalTime) / (glowDuration - peakLocalTime);
      const opacity = release < 0.62
        ? event.glowPeakOpacity + (0.1 - event.glowPeakOpacity) * (release / 0.62)
        : 0.1 * (1 - (release - 0.62) / 0.38);
      return {
        opacity: Math.max(0, opacity) * event.intensity,
        scale: peakScale + (event.glowFinalScale - peakScale) * Math.pow(release, 0.72),
        blur: event.glowPeakBlur + (event.glowPeakBlur * 0.72 - event.glowPeakBlur) * release,
      };
    };

    const drawEventGlow = (time) => {
      if (!glowContext) return;
      glowContext.filter = "none";
      glowContext.shadowBlur = 0;
      glowContext.shadowColor = "transparent";
      glowContext.clearRect(0, 0, width, height);
      glowContext.globalCompositeOperation = "screen";
      activeEvents.forEach((event) => {
        const glow = glowEnvelope(event, time);
        if (!glow || glow.opacity <= 0) return;
        const cell = cells[event.cellIndex];
        if (!cell) return;
        const color = event.kind === "white" ? eventPalette.white : eventPalette[event.colorName];
        const drawWidth = cell.width * glow.scale;
        const drawHeight = cell.height * glow.scale;
        const centerX = cell.x + cell.width / 2;
        const centerY = cell.y + cell.height / 2;
        const innerRadius = Math.max(drawWidth, drawHeight) * 0.22;
        const outerRadius = Math.max(drawWidth, drawHeight) * 0.7 + glow.blur * 0.72;
        const eventGlowGradient = glowContext.createRadialGradient(
          centerX,
          centerY,
          innerRadius,
          centerX,
          centerY,
          outerRadius,
        );
        eventGlowGradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${glow.opacity * 0.92})`);
        eventGlowGradient.addColorStop(0.3, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${glow.opacity * 0.48})`);
        eventGlowGradient.addColorStop(0.68, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${glow.opacity * 0.14})`);
        eventGlowGradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);
        glowContext.fillStyle = eventGlowGradient;
        glowContext.fillRect(
          centerX - outerRadius,
          centerY - outerRadius,
          outerRadius * 2,
          outerRadius * 2,
        );
      });
      glowContext.filter = "none";
      glowContext.shadowBlur = 0;
      glowContext.shadowColor = "transparent";
      glowContext.globalCompositeOperation = "source-over";
    };

    const drawGrid = (time, elapsed) => {
      if (!gridContext) return;
      gridContext.clearRect(0, 0, width, height);
      const pointerEase = 1 - Math.exp(-elapsed / 210);
      pointer.x += (pointer.targetX - pointer.x) * pointerEase;
      pointer.y += (pointer.targetY - pointer.y) * pointerEase;

      currentCycleStates = buildCellCycleStates(time);
      cells.forEach((cell, index) => {
        const cycleState = currentCycleStates[index];
        const centerX = cell.x + cell.width / 2;
        const centerY = cell.y + cell.height / 2;
        const dx = centerX / width - pointer.x;
        const dy = centerY / height - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const pointerLift = pointer.active ? Math.max(0, 1 - distance / 0.3) : 0;
        const breath = (Math.sin(time / cell.breathPeriod * fullTurn + cell.phase) + 1) / 2;
        const blink = cycleState.blink;
        const breathingBlink = blink * blink * (3 - 2 * blink);
        const waveLift = cycleState.colored ? breath * 0.065 + blink * 0.03 : breath * 0.018 + blink * 0.014;
        const focusPulse = pointerLift * (0.04 + blink * 0.08);
        const pointerBoost = focusPulse * (cycleState.colored ? 0.22 : index % 3 === 0 ? 0.1 : 0.045);
        const flickerGain = cycleState.colored
          ? 0.56 + breathingBlink * 0.44
          : 0.7 + breathingBlink * 0.3;
        const cycleBase = cycleState.name === "dark"
          ? 0.035 + cell.contrastTier * 0.02
          : cycleState.name === "white"
            ? 0.24 + cell.contrastTier * 0.035
            : cycleState.name === "green"
              ? 0.17 + cell.contrastTier * 0.035
              : 0.13 + cell.contrastTier * 0.03;
        const alphaCap = cycleState.name === "dark"
          ? 0.15 + cell.contrastTier * 0.014
          : cycleState.name === "white"
            ? 0.78 + cell.contrastTier * 0.035
            : cycleState.name === "green"
              ? 0.5 + cell.contrastTier * 0.022
              : cycleState.name === "cyan"
                ? 0.44 + cell.contrastTier * 0.02
                : 0.4 + cell.contrastTier * 0.018;
        const alpha = Math.min(
          alphaCap,
          (cycleBase + waveLift + pointerBoost) * flickerGain,
        );
        const [baseRed, baseGreen, baseBlue] = cycleState.color;
        const red = baseRed;
        const green = baseGreen;
        const blue = baseBlue;
        gridContext.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
        gridContext.fillRect(cell.x, cell.y, cell.width, cell.height);

        activeEvents.forEach((event) => {
          if (event.cellIndex !== index) return;
          const strength = eventEnvelope(event, time) * event.intensity;
          if (strength <= 0) return;
          if (event.kind === "dark") {
            gridContext.fillStyle = `rgba(71, 82, 76, ${strength * 0.42})`;
          } else {
            const color = event.kind === "white" ? eventPalette.white : eventPalette[event.colorName];
            const opacity = strength * (event.kind === "white" ? 0.92 : event.kind === "glow" ? 0.52 : 0.68);
            gridContext.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
          }
          gridContext.fillRect(cell.x, cell.y, cell.width, cell.height);
        });
      });
    };

    const drawFocusGrid = (time) => {
      if (!focusGridContext || !heroFocusGridCanvas) return;
      focusGridContext.clearRect(0, 0, width, height);
      if (!finePointer.matches || !pointer.hasEntered || !cells.length) return;

      const presence = pointer.active ? 1 : 0.68;
      cells.forEach((cell, index) => {
        const cycleState = currentCycleStates[index] || getCellCycleState(cell, time);
        const centerX = cell.x + cell.width / 2;
        const centerY = cell.y + cell.height / 2;
        const dx = (centerX - pointer.x * width) / cell.width;
        const dy = (centerY - pointer.y * height) / cell.height;
        const cellDistance = Math.sqrt(dx * dx + dy * dy);
        if (cellDistance >= 2.35 || cell.revealGate < 0.18) return;

        const proximity = Math.pow(1 - cellDistance / 2.35, 1.45) * presence;
        const breath = (Math.sin(time / cell.breathPeriod * fullTurn + cell.phase) + 1) / 2;
        const blink = cycleState.blink;
        const breathingBlink = blink * blink * (3 - 2 * blink);
        const flickerGain = 0.54 + breathingBlink * 0.46;
        const [red, green, blue] = cycleState.color;
        const baseOpacity = ((cycleState.colored ? 0.1 : 0.045) + breath * (cycleState.colored ? 0.045 : 0.018)) * flickerGain;
        let eventOpacity = 0;
        let eventColor = null;
        activeEvents.forEach((event) => {
          if (event.cellIndex !== index || event.kind === "dark") return;
          const strength = eventEnvelope(event, time) * event.intensity;
          if (strength <= eventOpacity) return;
          eventOpacity = strength;
          eventColor = event.kind === "white" ? eventPalette.white : eventPalette[event.colorName];
        });
        const color = eventColor || [red, green, blue];
        const opacityCap = 0.27 + cell.contrastTier * 0.018;
        const opacity = Math.min(opacityCap, proximity * (baseOpacity + eventOpacity * 0.24));
        if (opacity <= 0.008) return;

        focusGridContext.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
        focusGridContext.fillRect(cell.x, cell.y, cell.width, cell.height);
      });
    };

    let revealStrength = finePointer.matches ? 0 : 0.58;
    const drawRevealOverlay = (time, elapsed) => {
      if (!revealContext || !heroRevealCanvas) return;
      const revealEase = 1 - Math.exp(-elapsed / 260);
      const revealTarget = finePointer.matches
        ? pointer.active
          ? 1
          : pointer.hasEntered
            ? 0.72
            : 0
        : 0.58;
      revealStrength += (revealTarget - revealStrength) * revealEase;

      revealContext.globalCompositeOperation = "source-over";
      revealContext.clearRect(0, 0, width, height);
      if (!cells.length) return;
      revealContext.fillStyle = `rgba(246, 247, 242, ${0.88 - revealStrength * 0.1})`;
      revealContext.fillRect(0, 0, width, height);
      if (revealStrength < 0.01) return;

      const centerX = pointer.x * width;
      const centerY = pointer.y * height;
      const baseRadius = width < 640
        ? Math.max(300, width * 0.82)
        : Math.min(1100, Math.max(620, width * 0.55));
      revealContext.globalCompositeOperation = "destination-out";

      cells.forEach((cell, cellIndex) => {
        const cellCenterX = cell.x + cell.width / 2;
        const cellCenterY = cell.y + cell.height / 2;
        const dx = cellCenterX - centerX;
        const dy = cellCenterY - centerY;
        const angle = Math.atan2(dy, dx);
        const irregularRadius = baseRadius * (
          0.88
          + Math.sin(angle * 3 + time / 4300) * 0.08
          + Math.cos(angle * 5 - time / 6100) * 0.06
        );
        const distanceRatio = Math.sqrt(dx * dx + dy * dy) / irregularRadius;
        if (distanceRatio >= 1) return;
        const eventVisibility = activeEvents.reduce((highest, event) => {
          if (event.cellIndex !== cellIndex) return highest;
          const solid = eventEnvelope(event, time) * event.intensity;
          const glow = glowEnvelope(event, time);
          return Math.max(highest, solid, glow?.opacity ? glow.opacity * 2.2 : 0);
        }, 0);
        if (cell.revealGate < 0.18 && eventVisibility < 0.08) return;

        let feather = 0;
        if (distanceRatio <= 0.22) feather = 1;
        else if (distanceRatio <= 0.48) feather = 0.85 - (distanceRatio - 0.22) / 0.26 * 0.45;
        else if (distanceRatio <= 0.72) feather = 0.4 - (distanceRatio - 0.48) / 0.24 * 0.32;
        else feather = 0.08 * (1 - (distanceRatio - 0.72) / 0.28);

        const slowVariation = 0.72 + (
          Math.sin(time / 3100 + cell.revealPhase) + 1
        ) * 0.14;
        const gateStrength = cell.revealGate < 0.32
          ? 0.42
          : cell.revealGate < 0.52
            ? 0.72
            : 0.92 + (cell.revealGate - 0.52) * 0.16;
        const cutout = Math.min(
          1,
          revealStrength * feather * Math.min(1, gateStrength * slowVariation + eventVisibility * 1.05),
        );
        if (cutout <= 0.005) return;

        const overscan = Math.min(18, cell.width * 0.08);
        revealContext.fillStyle = `rgba(0, 0, 0, ${cutout})`;
        revealContext.fillRect(
          cell.x - overscan,
          cell.y - overscan,
          cell.width + overscan * 2,
          cell.height + overscan * 2,
        );
      });
      revealContext.globalCompositeOperation = "source-over";
    };

    const drawHero = (time = 0) => {
      const elapsed = previousTime ? Math.min(50, time - previousTime) : 16.67;
      previousTime = time;
      if (!reduceMotion.matches && time >= nextEventAt) spawnGridEvent(time);
      if (!reduceMotion.matches && time >= nextAccentAt) spawnRareAccent(time);
      activeEvents = activeEvents.filter((event) => time < event.start + event.duration + event.glowDelay + event.glowTail + 80);
      drawWebGL(time);
      drawEventGlow(time);
      drawGrid(time, elapsed);
      drawFocusGrid(time);
      drawRevealOverlay(time, elapsed);
      if (!reduceMotion.matches && !document.hidden) frame = window.requestAnimationFrame(drawHero);
    };

    const startHero = () => {
      window.cancelAnimationFrame(frame);
      previousTime = 0;
      activeEvents = [];
      hasOpeningPulse = false;
      rareAccentCount = 0;
      resizeHeroCanvases();
      nextEventAt = reduceMotion.matches ? Number.POSITIVE_INFINITY : performance.now() + 650 + eventRandom() * 250;
      nextAccentAt = reduceMotion.matches ? Number.POSITIVE_INFINITY : performance.now() + 1400 + eventRandom() * 1400;
      if (webglScene || gridContext) heroMotion.classList.add("hero-motion-ready");
      drawHero(reduceMotion.matches ? 0 : performance.now());
    };

    heroMotion.addEventListener("pointermove", (event) => {
      if (!finePointer.matches || reduceMotion.matches) return;
      const bounds = heroMotion.getBoundingClientRect();
      pointer.targetX = (event.clientX - bounds.left) / bounds.width;
      pointer.targetY = (event.clientY - bounds.top) / bounds.height;
      pointer.active = true;
      pointer.hasEntered = true;
    });

    heroMotion.addEventListener("pointerleave", () => {
      pointer.active = false;
    });

    window.addEventListener("resize", resizeHeroCanvases, { passive: true });
    document.addEventListener("visibilitychange", () => {
      window.cancelAnimationFrame(frame);
      if (!document.hidden) drawHero(reduceMotion.matches ? 0 : performance.now());
    });
    reduceMotion.addEventListener?.("change", startHero);
    startHero();

    if (!reduceMotion.matches && window.gsap) {
      document.documentElement.dataset.heroEntrance = "gsap";
      window.gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".home-content .site-header", { y: -18, opacity: 0, duration: 0.9 })
        .from(".content-hero--home .content-kicker", { y: 18, opacity: 0, duration: 0.8 }, "-=0.52")
        .from(".content-hero--home .hero-title-line", { y: 34, opacity: 0, duration: 1.1, stagger: 0.08 }, "-=0.58")
        .from(".content-hero--home .content-hero__lower", { y: 26, opacity: 0, duration: 0.9 }, "-=0.72");
    } else {
      document.documentElement.dataset.heroEntrance = reduceMotion.matches ? "reduced-motion" : "static-fallback";
    }
  }

  const header = document.querySelector("[data-site-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const primaryNav = document.querySelector("[data-primary-nav]");

  if (header && menuToggle && primaryNav) {
    const navGroups = Array.from(primaryNav.querySelectorAll("details"));
    const desktopHover = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
    let closeTimer = 0;

    const closeGroups = (except = null) => {
      window.clearTimeout(closeTimer);
      navGroups.forEach((item) => {
        if (item !== except) item.removeAttribute("open");
      });
    };

    const openGroup = (item) => {
      window.clearTimeout(closeTimer);
      closeGroups(item);
      item.setAttribute("open", "");
    };

    const queueClose = (item) => {
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        if (!item.matches(":hover") && !item.contains(document.activeElement)) {
          item.removeAttribute("open");
        }
      }, 140);
    };

    const setMenu = (open) => {
      primaryNav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.querySelector("span").textContent = open ? "关闭" : "菜单";
      if (!open) closeGroups();
    };

    navGroups.forEach((item) => {
      const summary = item.querySelector("summary");

      item.addEventListener("toggle", () => {
        if (item.open) closeGroups(item);
      });

      summary?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        if (item.open) {
          item.removeAttribute("open");
        } else {
          openGroup(item);
        }
      });

      item.addEventListener("pointerenter", () => {
        if (desktopHover.matches) openGroup(item);
      });

      item.addEventListener("pointerleave", () => {
        if (desktopHover.matches) queueClose(item);
      });

    });

    menuToggle.addEventListener("click", () => {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const openGroup = navGroups.find((item) => item.open);
        const menuWasOpen = menuToggle.getAttribute("aria-expanded") === "true";
        setMenu(false);

        if (window.innerWidth <= 900 && menuWasOpen) {
          menuToggle.focus();
        } else if (openGroup) {
          openGroup.querySelector("summary")?.focus();
        }
      }
    });

    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) {
        closeGroups();
        if (window.innerWidth <= 900) setMenu(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) setMenu(false);
    });
  }
})();
