(function () {
  "use strict";

  const stage = document.querySelector("[data-compute-array-hero]");
  const readout = document.querySelector("[data-compute-array-readout]");

  if (!stage || !readout || typeof HL === "undefined") return;

  let handle = null;
  let figureDefinition = null;
  let isVisible = true;

  const unmountFigure = () => {
    handle?.destroy();
    handle = null;
    stage.replaceChildren();
    readout.textContent = "rest";
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
        readout.textContent = value == null ? "" : String(value);
      },
    };

    handle = figureDefinition.mount({ stage, svg, read }, figureDefinition.range[1]);
    if (!read.textContent) read.textContent = "rest";
  };

  window.hairline = (figure) => {
    HL.inject(document);
    figureDefinition = figure;
    mountFigure();
  };

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
    unmountFigure();
    figureDefinition = null;
  }, { once: true });
})();
