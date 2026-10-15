(function () {
  "use strict";

  const stage = document.querySelector("[data-autodev-hero]");
  const readout = document.querySelector("[data-autodev-readout]");
  if (!stage || !readout || typeof HL === "undefined") return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const tourEnabled = new URLSearchParams(window.location.search).get("tour") === "1";
  let figureDefinition = null;
  let handle = null;
  let tourHandle = null;

  const stopTour = () => {
    tourHandle?.stop();
    tourHandle = null;
    delete stage.dataset.tourStop;
  };

  const leave = () => {
    stage.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true, pointerType: "mouse" }));
  };

  const startTour = () => {
    stopTour();
    if (!tourEnabled || reduceMotion.matches || !handle || !figureDefinition?.tour?.length) return;
    tourHandle = HL.tour(stage, figureDefinition.tour, (index) => {
      stage.dataset.tourStop = String(index);
    });
  };

  const mount = () => {
    if (!figureDefinition || handle) return;
    stage.replaceChildren();
    stage.dataset.hairline = figureDefinition.name;
    stage.dataset.state = "rest";
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", figureDefinition.means);

    const svg = HL.mk("svg", {
      viewBox: "0 0 400 320",
      preserveAspectRatio: "xMidYMid meet",
      "aria-hidden": "true",
    }, stage);

    const read = {
      get textContent() { return readout.textContent; },
      set textContent(value) {
        const state = value == null || value === "" ? "rest" : String(value);
        readout.textContent = state;
        stage.dataset.state = state;
      },
    };

    handle = figureDefinition.mount({ stage, svg, read }, figureDefinition.range[1]);
    read.textContent = read.textContent || "rest";
    startTour();
  };

  window.hairline = (figure) => {
    HL.inject(document);
    figureDefinition = figure;
    mount();
  };

  const onMotionChange = () => {
    if (reduceMotion.matches) {
      stopTour();
      leave();
    } else {
      startTour();
    }
  };

  reduceMotion.addEventListener?.("change", onMotionChange);
  window.addEventListener("pagehide", () => {
    reduceMotion.removeEventListener?.("change", onMotionChange);
    stopTour();
    handle?.destroy();
    handle = null;
    figureDefinition = null;
  }, { once: true });
})();
