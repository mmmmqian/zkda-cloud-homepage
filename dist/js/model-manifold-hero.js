(function () {
  "use strict";

  const stage = document.querySelector("[data-model-manifold-hero]");
  const readout = document.querySelector("[data-model-manifold-readout]");

  if (!stage || !readout || typeof HL === "undefined") return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let handle = null;
  let tourHandle = null;
  let figureDefinition = null;
  let isVisible = true;

  const stopTour = () => {
    tourHandle?.stop();
    tourHandle = null;
    delete stage.dataset.tourStop;
  };

  const unmountFigure = () => {
    stopTour();
    handle?.destroy();
    handle = null;
    stage.replaceChildren();
    readout.textContent = "rest";
    stage.dataset.state = "rest";
  };

  const startTour = () => {
    stopTour();
    if (!handle || reduceMotion.matches || !figureDefinition?.tour?.length) return;
    tourHandle = HL.tour(stage, figureDefinition.tour, (index) => {
      stage.dataset.tourStop = String(index);
    });
  };

  const mountFigure = () => {
    if (!figureDefinition || !isVisible || handle) return;

    stage.replaceChildren();
    stage.setAttribute("data-hairline", figureDefinition.name);
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", figureDefinition.means);

    const svg = HL.mk("svg", {
      viewBox: "0 0 400 320",
      preserveAspectRatio: "xMidYMid meet",
      "aria-hidden": "true",
    }, stage);

    const read = {
      get textContent() {
        return readout.textContent;
      },
      set textContent(value) {
        const state = value == null ? "" : String(value);
        readout.textContent = state;
        stage.dataset.state = state || "rest";
      },
    };

    handle = figureDefinition.mount({ stage, svg, read }, figureDefinition.range[1]);
    if (!read.textContent) read.textContent = "rest";
    stage.dataset.state = read.textContent || "rest";
    startTour();
  };

  const onMotionChange = () => {
    if (reduceMotion.matches) {
      stopTour();
      stage.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true, pointerType: "mouse" }));
    } else {
      startTour();
    }
  };

  window.hairline = (figure) => {
    HL.inject(document);
    figureDefinition = figure;
    mountFigure();
  };

  reduceMotion.addEventListener?.("change", onMotionChange);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) mountFigure();
      else unmountFigure();
    });
    observer.observe(stage);
    window.addEventListener("pagehide", () => observer.disconnect(), { once: true });
  }

  window.addEventListener("pagehide", () => {
    reduceMotion.removeEventListener?.("change", onMotionChange);
    unmountFigure();
    figureDefinition = null;
  }, { once: true });
})();
