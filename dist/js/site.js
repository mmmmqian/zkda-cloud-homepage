(() => {
  document.documentElement.classList.add("js");
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(year);
  });

  const metricPanels = Array.from(document.querySelectorAll("[data-metric-panel]"));
  const metricMobile = window.matchMedia("(max-width: 720px)");
  if (metricPanels.length) {
    const setMetricPanel = (selected) => {
      metricPanels.forEach((panel) => {
        const active = panel === selected;
        panel.classList.toggle("is-active", active);
        panel.querySelector("[data-metric-toggle]")?.setAttribute("aria-expanded", String(metricMobile.matches ? active : true));
      });
    };
    const syncMetricPanels = () => {
      if (metricMobile.matches) {
        setMetricPanel(metricPanels.find((panel) => panel.classList.contains("is-active")) || metricPanels[0]);
      } else {
        metricPanels.forEach((panel) => panel.querySelector("[data-metric-toggle]")?.setAttribute("aria-expanded", "true"));
      }
    };
    metricPanels.forEach((panel) => {
      panel.querySelector("[data-metric-toggle]")?.addEventListener("click", () => {
        if (metricMobile.matches) setMetricPanel(panel);
      });
    });
    metricMobile.addEventListener?.("change", syncMetricPanels);
    syncMetricPanels();
  }

  const productCarousel = document.querySelector("[data-product-carousel]");
  if (productCarousel) {
    const productSlides = Array.from(productCarousel.querySelectorAll("[data-product-slide]"));
    const previousProduct = productCarousel.querySelector("[data-product-previous]");
    const nextProduct = productCarousel.querySelector("[data-product-next]");
    let productIndex = Math.max(0, productSlides.findIndex((slide) => slide.classList.contains("is-active")));

    const showProduct = (index) => {
      productIndex = (index + productSlides.length) % productSlides.length;
      productSlides.forEach((slide, slideIndex) => {
        const active = slideIndex === productIndex;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });
    };

    previousProduct?.addEventListener("click", () => showProduct(productIndex - 1));
    nextProduct?.addEventListener("click", () => showProduct(productIndex + 1));
    productCarousel.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      showProduct(productIndex + (event.key === "ArrowRight" ? 1 : -1));
    });
    showProduct(productIndex);
  }

  const capabilities = document.querySelector("[data-capabilities]");
  if (capabilities) {
    const capabilityScroll = capabilities.querySelector(".platform-capabilities__scroll");
    const capabilityStage = capabilities.querySelector(".platform-capabilities__stage");
    const capabilityHeader = document.querySelector("[data-site-header]") || document.querySelector(".site-header");
    const capabilityCards = Array.from(capabilities.querySelectorAll("[data-capability-card]"));
    // Desktop and tablet share the same staged capability interaction. Mobile
    // keeps its separate sticky reading composition below the component cutoff.
    const capabilityDesktop = window.matchMedia("(min-width: 721px)");
    const capabilityReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let capabilityIndex = 0;
    let capabilityFrame = 0;
    let capabilityHeaderHeight = 62;
    let capabilityMinimumStageHeight = 646;
    let capabilityStickyTop = 62;
    let capabilityStageOverflow = 0;
    let capabilityProgress = 0;
    let capabilityCollapsedHeight = 76;
    let capabilityGeometryKey = "";
    let capabilityWasDesktop = capabilityDesktop.matches;
    const capabilityScrollStepRatio = 1.05;

    const showCapability = (index) => {
      capabilityIndex = Math.max(0, Math.min(capabilityCards.length - 1, index));
      const stackedDesktopMode = capabilityDesktop.matches && !capabilityReduceMotion.matches;
      capabilityCards.forEach((card, cardIndex) => {
        const active = cardIndex === capabilityIndex;
        const past = stackedDesktopMode && cardIndex < capabilityIndex;
        const future = stackedDesktopMode && cardIndex > capabilityIndex;
        const trigger = card.querySelector("[data-capability-trigger]");
        card.classList.toggle("is-active", active);
        card.classList.toggle("is-past", past);
        card.classList.toggle("is-future", future);
        trigger?.setAttribute("aria-expanded", String(stackedDesktopMode ? active : true));
        if (trigger) trigger.tabIndex = future ? -1 : 0;
      });
    };

    const renderCapabilityPositions = (virtualIndex) => {
      if (!capabilityStage) return;
      const stageHeight = capabilityStage.getBoundingClientRect().height;
      capabilityCards.forEach((card, cardIndex) => {
        if (cardIndex === 0) {
          card.style.setProperty("--capability-top", "0px");
          return;
        }
        const transitionStart = cardIndex - 0.5;
        const transitionProgress = Math.max(0, Math.min(1, (virtualIndex - transitionStart) * 2));
        const easedProgress = transitionProgress * transitionProgress * (3 - 2 * transitionProgress);
        const settledTop = cardIndex * capabilityCollapsedHeight;
        const top = stageHeight + (settledTop - stageHeight) * easedProgress;
        card.style.setProperty("--capability-top", `${top}px`);
      });
    };

    const updateCapabilityFromScroll = () => {
      capabilityFrame = 0;
      if (!capabilityDesktop.matches || capabilityReduceMotion.matches || !capabilityScroll || !capabilityStage) {
        showCapability(0);
        return;
      }
      const bounds = capabilityScroll.getBoundingClientRect();
      const scrollRange = Math.max(1, bounds.height - capabilityStage.getBoundingClientRect().height);
      capabilityProgress = Math.max(0, Math.min(1, (capabilityStickyTop - bounds.top) / scrollRange));
      const virtualIndex = capabilityProgress * (capabilityCards.length - 1);
      renderCapabilityPositions(virtualIndex);
      showCapability(Math.round(virtualIndex));
    };

    const queueCapabilityUpdate = () => {
      if (!capabilityFrame) capabilityFrame = window.requestAnimationFrame(updateCapabilityFromScroll);
    };

    const syncCapabilityGeometry = () => {
      const number = (value) => Number.parseFloat(value) || 0;
      const measuredHeaderHeight = capabilityHeader?.getBoundingClientRect().height;
      if (measuredHeaderHeight) capabilityHeaderHeight = measuredHeaderHeight;

      const capabilityStyle = window.getComputedStyle(capabilities);
      const collapsedHeight = number(capabilityStyle.getPropertyValue("--capability-collapsed-height")) || 76;
      capabilityCollapsedHeight = collapsedHeight;
      const summary = capabilities.querySelector(".platform-capabilities__summary");
      const summaryStyle = summary ? window.getComputedStyle(summary) : null;
      const summaryHeading = summary?.querySelector("h2");
      const summaryList = summary?.querySelector("ul");
      const leftRequiredHeight = summaryStyle
        ? number(summaryStyle.paddingTop)
          + (summaryHeading?.scrollHeight || 0)
          + (summaryList?.scrollHeight || 0)
          + number(summaryStyle.paddingBottom)
        : 0;
      const minimumExpandedHeight = capabilityCards.reduce((requiredHeight, card) => {
        const trigger = card.querySelector("[data-capability-trigger]");
        const body = card.querySelector(".platform-capability-card__body");
        const copy = body?.querySelector("p");
        const visual = body?.querySelector("img");
        const bodyStyle = body ? window.getComputedStyle(body) : null;
        const headerHeight = Math.max(collapsedHeight, trigger?.scrollHeight || 0);
        const bodyHeight = bodyStyle
          ? Math.max(copy?.scrollHeight || 0, visual?.getBoundingClientRect().height || 0)
            + number(bodyStyle.paddingTop)
            + number(bodyStyle.paddingBottom)
          : 0;
        return Math.max(requiredHeight, headerHeight + bodyHeight);
      }, 0);
      const collapsedStackHeight = Math.max(0, capabilityCards.length - 1) * collapsedHeight;
      const cardRequiredHeight = Math.max(
        0,
        collapsedStackHeight + minimumExpandedHeight
      );

      capabilityMinimumStageHeight = Math.ceil(Math.max(leftRequiredHeight, cardRequiredHeight));
      capabilityStickyTop = capabilityHeaderHeight;
      const availableStageHeight = Math.max(0, window.innerHeight - capabilityHeaderHeight);
      const capabilityStageHeight = Math.max(availableStageHeight, capabilityMinimumStageHeight);
      const capabilityScrollStep = capabilityStageHeight * capabilityScrollStepRatio;
      const capabilityScrollTrackHeight = capabilityStageHeight
        + Math.max(0, capabilityCards.length - 1) * capabilityScrollStep;
      capabilityStageOverflow = Math.max(
        0,
        capabilityMinimumStageHeight - availableStageHeight
      );

      const nextGeometryKey = [
        window.innerWidth,
        window.innerHeight,
        capabilityHeaderHeight,
        capabilityMinimumStageHeight,
        capabilityStickyTop,
        capabilityStageOverflow,
        capabilityScrollStep,
        capabilityScrollTrackHeight,
      ].join(":");
      const geometryChanged = capabilityGeometryKey !== nextGeometryKey;
      const preserveProgress = geometryChanged
        && Boolean(capabilityGeometryKey)
        && capabilityWasDesktop
        && capabilityDesktop.matches
        && capabilityProgress > 0
        && capabilityProgress < 1;
      capabilityGeometryKey = nextGeometryKey;
      capabilityWasDesktop = capabilityDesktop.matches;

      capabilities.style.setProperty("--capabilities-header-height", `${capabilityHeaderHeight}px`);
      capabilities.style.setProperty("--capabilities-stage-min-height", `${capabilityMinimumStageHeight}px`);
      capabilities.style.setProperty("--capabilities-sticky-top", `${capabilityStickyTop}px`);
      capabilities.style.setProperty("--capabilities-stage-overflow", `${capabilityStageOverflow}px`);
      capabilities.style.setProperty("--capabilities-scroll-step", `${capabilityScrollStep}px`);
      capabilities.style.setProperty("--capabilities-scroll-track-height", `${capabilityScrollTrackHeight}px`);
      capabilities.style.setProperty(
        "--capability-expanded-height",
        `calc(100% - ${collapsedStackHeight}px)`
      );

      if (preserveProgress && capabilityScroll && capabilityStage) {
        window.requestAnimationFrame(() => {
          const scrollRange = Math.max(1, capabilityScroll.offsetHeight - capabilityStage.offsetHeight);
          const destination = window.scrollY + capabilityScroll.getBoundingClientRect().top
            - capabilityStickyTop
            + (scrollRange * capabilityProgress);
          window.scrollTo({ top: destination, behavior: "auto" });
          queueCapabilityUpdate();
        });
        return;
      }
      queueCapabilityUpdate();
    };

    capabilityCards.forEach((card, cardIndex) => {
      card.querySelector("[data-capability-trigger]")?.addEventListener("click", () => {
        if (!capabilityDesktop.matches || capabilityReduceMotion.matches || !capabilityScroll || !capabilityStage) return;
        const scrollRange = capabilityScroll.offsetHeight - capabilityStage.offsetHeight;
        const destination = window.scrollY + capabilityScroll.getBoundingClientRect().top - capabilityStickyTop
          + (scrollRange * cardIndex) / Math.max(1, capabilityCards.length - 1);
        window.scrollTo({ top: destination, behavior: "smooth" });
      });
    });

    window.addEventListener("scroll", queueCapabilityUpdate, { passive: true });
    window.addEventListener("resize", syncCapabilityGeometry, { passive: true });
    capabilityDesktop.addEventListener?.("change", queueCapabilityUpdate);
    capabilityReduceMotion.addEventListener?.("change", queueCapabilityUpdate);
    const capabilityResizeObserver = typeof ResizeObserver === "function"
      ? new ResizeObserver(syncCapabilityGeometry)
      : null;
    if (capabilityHeader) capabilityResizeObserver?.observe(capabilityHeader);
    capabilityResizeObserver?.observe(capabilityStage);
    syncCapabilityGeometry();
  }

  const coreAdvantages = document.querySelector("[data-core-advantages]");
  if (coreAdvantages) {
    const tabs = Array.from(coreAdvantages.querySelectorAll("[data-advantage-tab]"));
    const panel = coreAdvantages.querySelector("[data-advantage-panel]");
    const advantageHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const advantageIllustrations = [
      "assets/images/core-advantages-20261009/01_multi_chip.svg?v=20261009-isometric-v83",
      "assets/images/core-advantages-20261009/02_smooth_migration.svg?v=20261009-isometric-v83",
      "assets/images/core-advantages-20261009/03_cost_optimization.svg?v=20261012-cost-perspective-v98",
      "assets/images/core-advantages-20261009/04_security_control.svg?v=20261009-isometric-v83",
      "assets/images/core-advantages-20261009/05_intelligent_operations.svg?v=20261009-isometric-v83",
      "assets/images/core-advantages-20261009/06_industry_knowledge.svg?v=20261009-isometric-v83",
    ];
    let activeAdvantage = -1;
    let advantageRenderer = null;
    let requestedAdvantage = 0;

    const showAdvantageIllustration = (index) => {
      requestedAdvantage = index;
      advantageRenderer?.show(index).catch((error) => console.error("ADVANTAGES illustration:", error));
    };

    import("./safe-advantage-svg.js?v=20261009-advantages-transparent-v82")
      .then(({ createAdvantageSVGRenderer }) => {
        advantageRenderer = createAdvantageSVGRenderer(panel, advantageIllustrations, { fit: "contain" });
        return advantageRenderer.show(requestedAdvantage);
      })
      .catch((error) => console.error("ADVANTAGES renderer:", error));

    const setActiveAdvantage = (index, moveFocus = false) => {
      const nextIndex = (index + tabs.length) % tabs.length;
      if (nextIndex === activeAdvantage) {
        if (moveFocus) tabs[nextIndex].focus();
        return;
      }
      activeAdvantage = nextIndex;
      tabs.forEach((tab, tabIndex) => {
        const active = tabIndex === nextIndex;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      showAdvantageIllustration(nextIndex);
      if (panel) {
        panel.setAttribute("aria-labelledby", tabs[nextIndex].id);
        panel.dataset.activeAdvantage = String(nextIndex + 1);
      }
      if (moveFocus) tabs[nextIndex].focus();
    };

    tabs.forEach((tab, tabIndex) => {
      tab.addEventListener("mouseenter", () => {
        if (advantageHover.matches) setActiveAdvantage(tabIndex);
      });
      tab.addEventListener("click", () => setActiveAdvantage(tabIndex));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "Home") setActiveAdvantage(0, true);
        else if (event.key === "End") setActiveAdvantage(tabs.length - 1, true);
        else setActiveAdvantage(tabIndex + (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1), true);
      });
    });
    setActiveAdvantage(Math.max(0, tabs.findIndex((tab) => tab.classList.contains("is-active"))));
  }

  const solutionStack = document.querySelector(".solution-stack");
  if (solutionStack) {
    const solutionRoot = solutionStack.closest(".home-solutions");
    const solutionCards = Array.from(solutionStack.querySelectorAll(".solution-card"));
    const solutionStage = document.createElement("div");
    const solutionVisual = document.createElement("div");
    solutionStage.className = "solution-stack__stage";
    solutionVisual.className = "solution-stack__visual";
    solutionCards.forEach((card) => solutionVisual.appendChild(card));
    solutionStage.appendChild(solutionVisual);
    solutionStack.appendChild(solutionStage);
    const solutionPhone = window.matchMedia("(max-width: 767px)");
    const solutionReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let solutionFrame = 0;
    let solutionMetrics = null;

    const clamp01 = (value) => Math.min(1, Math.max(0, value));
    const readSolutionDistance = (styles, name) => Number.parseFloat(styles.getPropertyValue(name));
    const mixNeutral = (from, to, progress) => `rgb(${from.map((value, index) => Math.round(value + ((to[index] - value) * progress))).join(" ")})`;
    const setSolutionLayer = (card, y, inset, surface, contentOpacity, contentScale) => {
      card.style.setProperty("--solution-y", `${y.toFixed(3)}px`);
      card.style.setProperty("--solution-inset", `${inset.toFixed(3)}px`);
      card.style.setProperty("--solution-surface", surface);
      card.style.setProperty("--solution-content-opacity", contentOpacity.toFixed(3));
      card.style.setProperty("--solution-content-scale", contentScale.toFixed(4));
    };

    const resetSolutionMotion = () => {
      solutionMetrics = null;
      solutionStack.classList.remove("has-continuous-motion");
      solutionStack.removeAttribute("data-active-solution");
      solutionStack.removeAttribute("data-release-progress");
      solutionRoot?.classList.remove("is-final-release");
      solutionCards.forEach((card) => {
        card.removeAttribute("style");
        card.classList.remove("is-current", "is-previous-1", "is-previous-2");
      });
    };

    const measurePhoneCardHeight = () => {
      // Phone cards start in their natural reading layout. Capture the tallest
      // complete card before pinning, so the sticky handoff happens only after
      // its bottom can meet the available viewport rather than at an arbitrary
      // fixed top offset.
      solutionStack.classList.remove("has-continuous-motion");
      solutionCards.forEach((card) => card.removeAttribute("style"));
      return Math.ceil(Math.max(...solutionCards.map((card) => card.getBoundingClientRect().height)));
    };

    const renderSolutionMotion = () => {
      solutionFrame = 0;
      if (!solutionMetrics) return;
      const distance = Math.max(0, window.scrollY - solutionMetrics.start);
      const transitionA = clamp01((distance - solutionMetrics.entryHold) / solutionMetrics.transition);
      const transitionB = clamp01((distance - solutionMetrics.entryHold - solutionMetrics.transition - solutionMetrics.betweenHold) / solutionMetrics.transition);
      const { cardHeight, cardGap, futureDepth, stepX, stepY } = solutionMetrics;

      // The outgoing card itself retreats: surface, number, copy, tags and
      // Figma visual are driven by the same continuous scroll state. No
      // substitute shadow or backplate is introduced during either takeover.
      const dark = [2, 8, 1];
      const near = [189, 189, 195];
      const far = [224, 224, 226];
      // Ease the surface colour in, so the outgoing card is still legible as
      // one retreating surface at mid-scroll rather than a replacement plate.
      // Its child content layer also scales down: 1 → .965 at the first
      // previous level and .965 → .93 at the rear level. The active card is
      // always scale 1 / opacity 1.
      const retreatA = transitionA * transitionA;
      const retreatB = transitionB * transitionB;
      const firstSurface = transitionB > 0
        ? mixNeutral(near, far, retreatB)
        : mixNeutral(dark, near, retreatA);
      const secondSurface = mixNeutral(dark, near, retreatB);
      const contentOpacityA = 1 - (transitionA * 0.48) - (transitionB * 0.24);
      const contentOpacityB = 1 - (transitionB * 0.48);
      const contentScaleA = 1 - (transitionA * 0.035) - (transitionB * 0.035);
      const contentScaleB = 1 - (transitionB * 0.035);
      setSolutionLayer(solutionCards[0], -stepY * (transitionA + transitionB), stepX * (transitionA + transitionB), firstSurface, contentOpacityA, contentScaleA);
      // The next card begins below a tokenized approach gap. Its Y position
      // continuously resolves to zero during takeover, so the gap is visible
      // in reading flow but naturally disappears in the final stack.
      // 01 → 02 must use the same approach runway as 02 → 03. Previously
      // only card 03 included futureDepth, letting card 02 enter the viewport
      // while card 01 was still arriving at its sticky reading position.
      const nextCardApproach = cardHeight + cardGap + futureDepth;
      setSolutionLayer(solutionCards[1], (nextCardApproach * (1 - transitionA)) - (stepY * transitionB), stepX * transitionB, secondSurface, contentOpacityB, contentScaleB);
      setSolutionLayer(solutionCards[2], nextCardApproach * (1 - transitionB), 0, "#020801", 1, 1);
      setSolutionLayer(solutionCards[2], (cardHeight + cardGap + futureDepth) * (1 - transitionB), 0, "#020801", 1, 1);
      solutionStack.dataset.activeSolution = transitionB > 0 ? "2" : transitionA > 0 ? "1" : "0";
      // Native sticky release starts only once the stage reaches the end of
      // its track. Map progress to that actual Y-only departure, not to the
      // earlier logical final-hold segment. It completes when Card 03's full
      // visible bottom has cleared the viewport (including visual offset).
      const releaseStart = solutionMetrics.trackHeight - cardHeight;
      const releaseTravel = cardHeight + solutionMetrics.currentTop + solutionMetrics.visualOffset;
      const releaseProgress = clamp01((distance - releaseStart) / Math.max(1, releaseTravel));
      solutionStack.dataset.releaseProgress = releaseProgress.toFixed(4);
      // The visual group is offset below the sticky stage. The following
      // surface therefore reaches Card 03's bottom by exactly that offset
      // before native sticky release. Raise Solutions at first overlap, not
      // one frame later, so the full rectangle remains visible throughout.
      const handoffLayerStart = releaseStart - solutionMetrics.visualOffset;
      solutionRoot?.classList.toggle("is-final-release", distance >= handoffLayerStart);
    };

    const measureSolutionMotion = () => {
      solutionFrame = 0;
      if (solutionReduceMotion.matches) {
        resetSolutionMotion();
        return;
      }
      if (solutionPhone.matches) {
        const cardHeight = measurePhoneCardHeight();
        const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height || 64;
        const bottomGap = 16;
        const availableHeight = window.innerHeight - headerHeight - bottomGap;
        // A shorter card pins beneath the header. A taller card receives a
        // negative sticky offset, so readers scroll through it naturally until
        // its lower edge reaches the viewport before the stack takes over.
        const currentTop = cardHeight <= availableHeight
          ? headerHeight + 16
          : window.innerHeight - cardHeight - bottomGap;
        solutionStack.style.setProperty("--solution-card-height", `${cardHeight}px`);
        solutionStack.style.setProperty("--solution-current-top", `${Math.round(currentTop)}px`);
      } else {
        solutionStack.style.removeProperty("--solution-card-height");
        solutionStack.style.removeProperty("--solution-current-top");
      }
      const styles = getComputedStyle(solutionStack);
      const stackRect = solutionStack.getBoundingClientRect();
      const cardHeight = readSolutionDistance(styles, "--solution-card-height");
      const entryHold = readSolutionDistance(styles, "--solution-entry-hold-distance");
      const transition = readSolutionDistance(styles, "--solution-transition-distance");
      const betweenHold = readSolutionDistance(styles, "--solution-between-hold-distance");
      solutionMetrics = {
        cardHeight,
        cardGap: readSolutionDistance(styles, "--solutions-card-gap"),
        futureDepth: readSolutionDistance(styles, "--solution-future-card-depth"),
        stepX: readSolutionDistance(styles, "--solution-stack-step-x"),
        stepY: readSolutionDistance(styles, "--solution-stack-step-y"),
        entryHold,
        transition,
        betweenHold,
        trackHeight: stackRect.height,
        currentTop: readSolutionDistance(styles, "--solution-current-top"),
        visualOffset: readSolutionDistance(styles, "--solutions-stack-visual-offset-y"),
        start: window.scrollY + stackRect.top - readSolutionDistance(styles, "--solution-current-top"),
      };
      solutionStack.classList.add("has-continuous-motion");
      renderSolutionMotion();
    };

    const queueSolutionRender = () => {
      if (!solutionFrame) solutionFrame = window.requestAnimationFrame(renderSolutionMotion);
    };

    window.addEventListener("scroll", queueSolutionRender, { passive: true });
    window.addEventListener("resize", measureSolutionMotion, { passive: true });
    solutionPhone.addEventListener?.("change", measureSolutionMotion);
    solutionReduceMotion.addEventListener?.("change", measureSolutionMotion);
    measureSolutionMotion();
  }

  // Solutions → CTA is a single continuous handoff: the compact mosaic seam
  // sits directly above the real dark CTA surface. One scroll progress drives
  // its fixed-seed canvas frontier, so it can stop at any tile state and
  // retrace exactly when scrolling upward.
  const mosaicTransition = document.querySelector("[data-mosaic-transition]");
  if (mosaicTransition) {
    const mosaicCanvas = mosaicTransition.querySelector(".mosaic-transition__canvas");
    const mosaicHost = mosaicTransition.closest(".home-final-cta");
    const mosaicHeader = document.querySelector("[data-site-header]");
    const mosaicReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mosaicProofRed = new URLSearchParams(window.location.search).get("mosaicproof") === "red";
    const mosaicDebugPanel = mosaicProofRed ? document.createElement("output") : null;
    let mosaicContext = null;
    let mosaicFrame = 0;
    let mosaicWidth = 0;
    let mosaicHeight = 0;
    let mosaicPixelRatio = 1;
    let mosaicCell = 40;
    let mosaicColumns = 1;
    let mosaicRows = 3;
    let mosaicPattern = [];
    let mosaicResizeFrame = 0;
    let mosaicResizeReleaseTimer = 0;
    let mosaicProgressBeforeResize = null;
    let mosaicResizeInProgress = false;
    let mosaicLastProgress = 0;

    if (mosaicDebugPanel) {
      mosaicDebugPanel.className = "mosaic-runtime-debug";
      mosaicDebugPanel.setAttribute("aria-live", "off");
      document.body.append(mosaicDebugPanel);
    }

    try {
      mosaicContext = mosaicCanvas?.getContext("2d", { alpha: false }) || null;
    } catch (_error) {
      mosaicContext = null;
    }

    const clampMosaic = (value) => Math.min(1, Math.max(0, value));
    const createMosaicRandom = (seed) => () => {
      seed = (seed * 48271) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const buildMosaicPattern = () => {
      const random = createMosaicRandom(24092026);
      // Every tile owns a fixed square coordinate and a deterministic state
      // timeline. The grid stays regular; only its cell states evolve.
      mosaicPattern = Array.from({ length: mosaicColumns * mosaicRows }, (_, index) => {
        const row = Math.floor(index / mosaicColumns);
        const column = index % mosaicColumns;
        const colourRoll = random();
        return {
          row,
          column,
          // Bottom cells generally turn first, while the fixed seed offsets
          // preserve light notches and dark protrusions in the aligned grid.
          activationStart: clampMosaic(0.07 + ((1 - (row / Math.max(1, mosaicRows - 1))) * 0.36) + (random() * 0.26)),
          activationSpan: 0.34 + (random() * 0.15),
          // Active-state occupancy: dark 50%, light/white 30%, green 10%,
          // blue 10%. Accents are generated by this state map, not overlaid.
          role: colourRoll < 0.15 ? "white" : colourRoll < 0.25 ? "green" : colourRoll < 0.35 ? "blue" : colourRoll < 0.5 ? "light" : "dark",
        };
      });
    };

    const resizeMosaic = () => {
      if (!mosaicCanvas || !mosaicContext) return;
      const bounds = mosaicTransition.getBoundingClientRect();
      mosaicWidth = Math.max(1, Math.round(bounds.width));
      const narrow = mosaicWidth < 768;
      const tablet = mosaicWidth >= 768 && mosaicWidth < 992;
      const targetCell = narrow
        ? Math.min(56, Math.max(36, mosaicWidth * 0.12))
        : tablet
          ? Math.min(80, Math.max(56, mosaicWidth * 0.075))
          : Math.min(110, Math.max(72, mosaicWidth * 0.05));
      // Large, graphic cells: at the 1651px desktop reference this resolves
      // to roughly 20 columns rather than the prior 35+ fine zig-zag.
      const requestedColumns = Math.floor(mosaicWidth / targetCell);
      mosaicColumns = narrow
        ? Math.min(14, Math.max(7, requestedColumns))
        : tablet
          ? Math.min(16, Math.max(10, requestedColumns))
          : Math.min(24, Math.max(12, requestedColumns));
      mosaicCell = mosaicWidth / mosaicColumns;
      // The CTA seam is exactly three complete square rows at every width.
      // Its height comes only from the shared cell geometry, never from a
      // separate vh/clamp container measurement.
      mosaicRows = 3;
      mosaicHeight = mosaicRows * mosaicCell;
      mosaicTransition.style.setProperty("--mosaic-grid-height", `${mosaicHeight}px`);
      mosaicTransition.dataset.mosaicColumns = String(mosaicColumns);
      mosaicTransition.dataset.mosaicRows = String(mosaicRows);
      mosaicTransition.dataset.mosaicCell = mosaicCell.toFixed(4);
      mosaicTransition.dataset.mosaicGridWidth = mosaicWidth.toFixed(2);
      mosaicTransition.dataset.mosaicGridHeight = mosaicHeight.toFixed(4);
      mosaicPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      mosaicCanvas.width = Math.round(mosaicWidth * mosaicPixelRatio);
      mosaicCanvas.height = Math.round(mosaicHeight * mosaicPixelRatio);
      mosaicContext.setTransform(1, 0, 0, 1, 0, 0);
      mosaicContext.imageSmoothingEnabled = false;
      buildMosaicPattern();
    };

    const drawMosaic = (progress) => {
      if (!mosaicContext || !mosaicWidth || !mosaicHeight) return;
      const context = mosaicContext;
      const light = "#f7f7f5";
      const white = "#ffffff";
      const dark = "#020801";
      const green = "#a2fa8e";
      const blue = "#1b58f4";
      const canvasWidth = mosaicCanvas.width;
      const canvasHeight = mosaicCanvas.height;
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      // A compact 3–4 row grid travels with the CTA while every cell computes
      // its visual state from the same scroll progress. No state is stored per
      // frame, so the exact 0→1 path reverses as 1→0.
      mosaicPattern.forEach((tile) => {
        const state = clampMosaic((progress - tile.activationStart) / tile.activationSpan);
        let fill = light;
        if (mosaicProofRed) {
          // Proof mode deliberately makes every aligned cell unmistakable.
          fill = "#ff3b30";
        } else if (state <= 0) {
          fill = light;
        } else if (state >= 1) {
          fill = dark;
        } else if (tile.role === "white") {
          fill = state > 0.18 && state < 0.88 ? white : light;
        } else if (tile.role === "green") {
          fill = state < 0.82 ? green : dark;
        } else if (tile.role === "blue") {
          fill = state < 0.82 ? blue : dark;
        } else if (tile.role === "light") {
          fill = light;
        } else {
          fill = dark;
        }
        // Adjacent rectangles share the exact same rounded backing-pixel
        // boundary. This preserves the CSS square geometry while preventing
        // fractional Canvas raster seams from revealing the light surface.
        const left = Math.round((tile.column * canvasWidth) / mosaicColumns);
        const right = Math.round(((tile.column + 1) * canvasWidth) / mosaicColumns);
        const top = Math.round((tile.row * canvasHeight) / mosaicRows);
        const bottom = Math.round(((tile.row + 1) * canvasHeight) / mosaicRows);
        context.fillStyle = fill;
        context.fillRect(left, top, right - left, bottom - top);
      });
    };

    const inspectMosaicLayer = (label, element) => {
      if (!element) return `${label}: unavailable`;
      const styles = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return `${label}: position=${styles.position}; z=${styles.zIndex}; overflow=${styles.overflow}; opacity=${styles.opacity}; visibility=${styles.visibility}; transform=${styles.transform}; rect=${rect.top.toFixed(1)},${rect.bottom.toFixed(1)},${rect.height.toFixed(1)}`;
    };

    const renderMosaicDebug = (progress, rawProgress, bounds, mosaicStart, mosaicEnd, visibleTop, mosaicTravel) => {
      if (!mosaicDebugPanel) return;
      const releaseProgress = solutionStack?.dataset.releaseProgress || "0.0000";
      const ctaBounds = mosaicHost?.getBoundingClientRect();
      const content = mosaicHost?.querySelector(".home-final-cta__stage");
      mosaicDebugPanel.textContent = [
        "MOSAIC RUNTIME PROOF",
        `scrollY: ${window.scrollY.toFixed(1)}`,
        `solutionsReleaseProgress: ${releaseProgress}`,
        `mosaicStart: ${mosaicStart.toFixed(1)}`,
        `mosaicEnd: ${mosaicEnd.toFixed(1)}`,
        `mosaicTravel: ${mosaicTravel.toFixed(1)}`,
        `rawProgress: ${rawProgress.toFixed(4)}`,
        `mosaicProgress: ${progress.toFixed(4)}`,
        `ctaTop: ${ctaBounds?.top.toFixed(1) ?? "n/a"}`,
        `mosaicTop: ${bounds.top.toFixed(1)}`,
        `mosaicBottom: ${bounds.bottom.toFixed(1)}`,
        `effectiveViewportTop: ${visibleTop.toFixed(1)}`,
        `viewportHeight: ${window.innerHeight}`,
        "",
        inspectMosaicLayer("Solutions stack", solutionStack),
        inspectMosaicLayer("CTA surface", mosaicHost),
        inspectMosaicLayer("Mosaic frontier", mosaicTransition),
        inspectMosaicLayer("CTA content", content),
      ].join("\n");
    };

    const renderMosaic = () => {
      mosaicFrame = 0;
      // The CTA-owned frontier has one direction-agnostic, normal-flow mapping:
      // 0 when its top touches viewport bottom, 1 only when its last row goes
      // behind the live sticky-header boundary. Every visible cell can thus
      // remain scroll-driven all the way through the viewport.
      const bounds = mosaicTransition.getBoundingClientRect();
      const headerBounds = mosaicHeader?.getBoundingClientRect();
      const visibleTop = headerBounds
        ? Math.max(0, Math.min(window.innerHeight, headerBounds.bottom))
        : 0;
      const mosaicStart = window.scrollY + bounds.top - window.innerHeight;
      const mosaicEnd = window.scrollY + bounds.bottom - visibleTop;
      const mosaicTravel = Math.max(1, mosaicEnd - mosaicStart);
      const rawProgress = (window.scrollY - mosaicStart) / mosaicTravel;
      const computedProgress = clampMosaic(rawProgress);
      const mosaicProgress = mosaicReduceMotion.matches
        ? 0.82
        : mosaicProgressBeforeResize ?? computedProgress;
      if (!mosaicResizeInProgress) mosaicProgressBeforeResize = null;
      mosaicLastProgress = mosaicProgress;
      mosaicTransition.style.setProperty("--mosaic-progress", mosaicProgress.toFixed(4));
      mosaicTransition.dataset.mosaicProgress = mosaicProgress.toFixed(4);
      if (mosaicHost) mosaicHost.dataset.mosaicProgress = mosaicProgress.toFixed(4);
      drawMosaic(mosaicProgress);
      renderMosaicDebug(mosaicProgress, rawProgress, bounds, mosaicStart, mosaicEnd, visibleTop, mosaicTravel);
    };

    const queueMosaicRender = () => {
      if (!mosaicFrame) mosaicFrame = window.requestAnimationFrame(renderMosaic);
    };

    const queueMosaicResize = ({ preserveProgress = false } = {}) => {
      if (preserveProgress && mosaicProgressBeforeResize === null) {
        mosaicProgressBeforeResize = mosaicLastProgress;
      }
      if (preserveProgress) {
        mosaicResizeInProgress = true;
        window.clearTimeout(mosaicResizeReleaseTimer);
        mosaicResizeReleaseTimer = window.setTimeout(() => {
          mosaicResizeReleaseTimer = 0;
          mosaicResizeInProgress = false;
          mosaicProgressBeforeResize = null;
          queueMosaicRender();
        }, 480);
      }
      if (mosaicResizeFrame) return;
      mosaicResizeFrame = window.requestAnimationFrame(() => {
        mosaicResizeFrame = 0;
        resizeMosaic();
        if (!mosaicResizeReleaseTimer) mosaicResizeInProgress = false;
        queueMosaicRender();
      });
    };

    if (mosaicContext) {
      window.addEventListener("scroll", queueMosaicRender, { passive: true });
      if ("ResizeObserver" in window) {
        const mosaicResizeObserver = new ResizeObserver(queueMosaicResize);
        mosaicResizeObserver.observe(mosaicTransition);
      }
      // Capture progress at the start of a viewport resize. ResizeObserver then
      // supplies the settled width/height without allowing browser anchoring to
      // reset the visible scroll-linked state in between.
      window.addEventListener("resize", () => queueMosaicResize({ preserveProgress: true }), { passive: true });
      mosaicReduceMotion.addEventListener?.("change", queueMosaicRender);
      resizeMosaic();
      renderMosaic();
    } else if (mosaicCanvas) {
      mosaicCanvas.hidden = true;
      mosaicTransition.classList.add("is-mosaic-fallback");
    }
  }

  const heroMotion = document.querySelector("[data-hero-motion]");
  const heroWebGLCanvas = heroMotion?.querySelector("[data-hero-webgl]");
  const heroEventGlowCanvas = heroMotion?.querySelector("[data-hero-event-glow]");
  const heroGridCanvas = heroMotion?.querySelector("[data-hero-grid-canvas]");
  const heroDepthBlur = heroMotion?.querySelector("[data-hero-depth-blur]");
  const heroFocusGridCanvas = heroMotion?.querySelector("[data-hero-focus-grid]");
  const heroRevealCanvas = heroMotion?.querySelector("[data-hero-reveal]");

  if (heroMotion && heroWebGLCanvas && heroEventGlowCanvas && heroGridCanvas) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const heroHeader = document.querySelector("[data-site-header]") || document.querySelector(".site-header");
    const fullTurn = Math.PI * 2;
    const palette = {
      dark: [249, 250, 252],
      slate: [184, 200, 255],
      blue: [22, 138, 226],
      cyan: [102, 189, 255],
      green: [162, 250, 142],
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
    let heroLightsOutProgress = 0;
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

          vec3 color = vec3(0.976, 0.980, 0.988);
          float blueMix = clamp(max(0.0, blueField + deformation) * 0.42, 0.0, 0.58);
          float cyanMix = clamp(max(0.0, cyanField - deformation) * 0.34, 0.0, 0.42);
          float greenMix = clamp(max(0.0, greenField + deformation) * 0.28, 0.0, 0.34);
          color = mix(color, vec3(0.086, 0.541, 0.886), blueMix);
          color = mix(color, vec3(0.400, 0.741, 1.000), cyanMix);
          color = mix(color, vec3(0.635, 0.980, 0.557), greenMix);
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
      // Keep the pixel field on the same responsive scale as the Hero stage.
      // Figma 64:34956 uses a 120px cell at a 1651px-wide reference stage.
      // Let cells grow with large screens, but cap them so ultra-wide layouts do
      // not become sparse. Component-specific minimum column counts preserve
      // the existing tablet/mobile density.
      const targetCellSize = Math.min(160, Math.max(88, width * (120 / 1651)));
      const minimumColumns = width < 768 ? 6 : width < 992 ? 9 : 12;
      const columns = Math.max(minimumColumns, Math.round(width / targetCellSize));
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

    const syncHeroLayout = () => {
      const headerHeight = heroHeader?.getBoundingClientRect().height;
      if (headerHeight) heroMotion.style.setProperty("--hero-header-height", `${headerHeight}px`);
    };

    const syncHeroLightsOut = () => {
      if (reduceMotion.matches) {
        heroLightsOutProgress = 0;
        heroMotion.dataset.lightsOutProgress = "0.0000";
        return;
      }
      const bounds = heroMotion.getBoundingClientRect();
      const headerBottom = heroHeader?.getBoundingClientRect().bottom || 0;
      const rawProgress = bounds.height > 0 ? (headerBottom - bounds.top) / bounds.height : 1;
      heroLightsOutProgress = Math.min(1, Math.max(0, rawProgress));
      heroMotion.dataset.lightsOutProgress = heroLightsOutProgress.toFixed(4);
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
      const lightsOn = Math.pow(1 - heroLightsOutProgress, 1.35);
      glowContext.filter = "none";
      glowContext.shadowBlur = 0;
      glowContext.shadowColor = "transparent";
      glowContext.clearRect(0, 0, width, height);
      glowContext.globalCompositeOperation = "screen";
      activeEvents.forEach((event) => {
        const glow = glowEnvelope(event, time);
        if (!glow || glow.opacity <= 0 || lightsOn <= 0.002) return;
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
        eventGlowGradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${glow.opacity * lightsOn * 0.92})`);
        eventGlowGradient.addColorStop(0.3, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${glow.opacity * lightsOn * 0.48})`);
        eventGlowGradient.addColorStop(0.68, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${glow.opacity * lightsOn * 0.14})`);
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
      const lightsOn = Math.pow(1 - heroLightsOutProgress, 1.35);
      gridContext.clearRect(0, 0, width, height);
      const pointerEase = 1 - Math.exp(-elapsed / 210);
      pointer.x += (pointer.targetX - pointer.x) * pointerEase;
      pointer.y += (pointer.targetY - pointer.y) * pointerEase;
      if (heroDepthBlur) {
        heroDepthBlur.style.setProperty("--hero-focus-x", `${(pointer.x * 100).toFixed(3)}%`);
        heroDepthBlur.style.setProperty("--hero-focus-y", `${(pointer.y * 100).toFixed(3)}%`);
      }

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
        ) * lightsOn;
        const [baseRed, baseGreen, baseBlue] = cycleState.color;
        const red = baseRed;
        const green = baseGreen;
        const blue = baseBlue;
        gridContext.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
        gridContext.fillRect(cell.x, cell.y, cell.width, cell.height);

        activeEvents.forEach((event) => {
          if (event.cellIndex !== index) return;
          const strength = eventEnvelope(event, time) * event.intensity * lightsOn;
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
      const lightsOn = Math.pow(1 - heroLightsOutProgress, 1.35);
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
        const baseOpacity = ((cycleState.colored ? 0.16 : 0.055) + breath * (cycleState.colored ? 0.07 : 0.024)) * flickerGain;
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
        const isWhitePeak = Boolean(eventColor && eventColor === eventPalette.white);
        const opacityCap = isWhitePeak
          ? 0.9
          : cycleState.name === "green"
            ? 0.58
            : cycleState.colored
              ? 0.5 + cell.contrastTier * 0.018
              : 0.22 + cell.contrastTier * 0.012;
        const eventGain = isWhitePeak ? 0.86 : 0.48;
        const opacity = Math.min(opacityCap, proximity * (baseOpacity + eventOpacity * eventGain)) * lightsOn;
        if (opacity <= 0.008) return;

        focusGridContext.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
        focusGridContext.fillRect(cell.x, cell.y, cell.width, cell.height);
      });
    };

    let revealStrength = finePointer.matches ? 0 : 0.58;
    let heroInView = true;
    const clearHeroCanvases = () => {
      [gridContext, glowContext, focusGridContext, revealContext].forEach((context) => {
        if (context) context.clearRect(0, 0, width, height);
      });
      if (webglScene) webglScene.gl.clear(webglScene.gl.COLOR_BUFFER_BIT);
    };
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
      revealStrength += ((revealTarget * (1 - heroLightsOutProgress)) - revealStrength) * revealEase;

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
        const coreReveal = distanceRatio <= 0.22 ? 1 : 0;
        const cellReveal = Math.max(
          coreReveal,
          Math.min(1, gateStrength * slowVariation + eventVisibility * 1.05),
        );
        const cutout = Math.min(1, revealStrength * feather * cellReveal);
        if (cutout <= 0.005) return;

        revealContext.fillStyle = `rgba(0, 0, 0, ${cutout})`;
        revealContext.fillRect(
          cell.x,
          cell.y,
          cell.width,
          cell.height,
        );
      });
      revealContext.globalCompositeOperation = "source-over";
    };

    const drawHero = (time = 0) => {
      if (!heroInView) return;
      const elapsed = previousTime ? Math.min(50, time - previousTime) : 16.67;
      previousTime = time;
      if (!reduceMotion.matches && heroLightsOutProgress < 0.9 && time >= nextEventAt) spawnGridEvent(time);
      if (!reduceMotion.matches && heroLightsOutProgress < 0.9 && time >= nextAccentAt) spawnRareAccent(time);
      activeEvents = activeEvents.filter((event) => time < event.start + event.duration + event.glowDelay + event.glowTail + 80);
      drawWebGL(time);
      drawEventGlow(time);
      drawGrid(time, elapsed);
      drawFocusGrid(time);
      drawRevealOverlay(time, elapsed);
      if (!reduceMotion.matches && !document.hidden) frame = window.requestAnimationFrame(drawHero);
    };

    if ("IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(([entry]) => {
        heroInView = entry.isIntersecting && entry.intersectionRatio > 0.04;
        heroMotion.classList.toggle("hero-motion-offscreen", !heroInView);
        window.cancelAnimationFrame(frame);
        if (heroInView) drawHero(reduceMotion.matches ? 0 : performance.now());
        else clearHeroCanvases();
      }, { threshold: [0, 0.04] });
      heroObserver.observe(heroMotion);
    }
    const syncHeroViewportState = () => {
      syncHeroLightsOut();
      const bounds = heroMotion.getBoundingClientRect();
      const visible = bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.height > 0
        && Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0) > bounds.height * 0.04;
      if (visible === heroInView) return;
      heroInView = visible;
      heroMotion.classList.toggle("hero-motion-offscreen", !heroInView);
      window.cancelAnimationFrame(frame);
      if (heroInView) drawHero(reduceMotion.matches ? 0 : performance.now());
      else clearHeroCanvases();
    };
    window.addEventListener("scroll", syncHeroViewportState, { passive: true });
    syncHeroViewportState();

    const startHero = () => {
      window.cancelAnimationFrame(frame);
      previousTime = 0;
      activeEvents = [];
      hasOpeningPulse = false;
      rareAccentCount = 0;
      syncHeroLayout();
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

    window.addEventListener("resize", () => {
      syncHeroLayout();
      resizeHeroCanvases();
      syncHeroViewportState();
    }, { passive: true });
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
        .from(".content-hero--home h1", { y: 34, opacity: 0, duration: 1.1 }, "-=0.58")
        .from(".content-hero--home .content-hero__lower", { y: 26, opacity: 0, duration: 0.9 }, "-=0.72");
    } else {
      document.documentElement.dataset.heroEntrance = reduceMotion.matches ? "reduced-motion" : "static-fallback";
    }
  }

  const header = document.querySelector("[data-site-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const primaryNav = document.querySelector("[data-primary-nav]");

  if (header) {
    const headerThemeZones = Array.from(document.querySelectorAll("[data-header-theme]"));
    let headerThemeFrame = 0;

    const applyHeaderTheme = (theme) => {
      const nextTheme = theme === "dark" ? "dark" : "light";
      if (header.dataset.headerTheme === nextTheme) return;
      header.dataset.headerTheme = nextTheme;
      document.documentElement.dataset.headerTheme = nextTheme;
    };

    const syncHeaderTheme = () => {
      headerThemeFrame = 0;
      const probeY = Math.min(window.innerHeight - 1, Math.ceil(header.getBoundingClientRect().bottom) + 1);
      let activeZone = null;

      headerThemeZones.forEach((zone) => {
        const rect = zone.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom > probeY) activeZone = zone;
      });

      applyHeaderTheme(activeZone?.dataset.headerTheme || "light");
    };

    const scheduleHeaderThemeSync = () => {
      if (headerThemeFrame) return;
      headerThemeFrame = window.requestAnimationFrame(syncHeaderTheme);
    };

    window.addEventListener("scroll", scheduleHeaderThemeSync, { passive: true });
    window.addEventListener("resize", scheduleHeaderThemeSync, { passive: true });
    window.addEventListener("hashchange", scheduleHeaderThemeSync);
    window.addEventListener("load", scheduleHeaderThemeSync, { once: true });
    window.visualViewport?.addEventListener("resize", scheduleHeaderThemeSync, { passive: true });
    syncHeaderTheme();
  }

  if (header && menuToggle && primaryNav) {
    const navGroups = Array.from(primaryNav.querySelectorAll("details"));
    const plainNavItems = [
      ...primaryNav.querySelectorAll(":scope > a"),
      ...header.querySelectorAll(".header-account > a")
    ];
    const desktopNav = window.matchMedia("(min-width: 901px)");
    const desktopHover = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
    let closeTimer = 0;

    const setGroupOpen = (item, open) => {
      item.toggleAttribute("open", open);
      item.querySelector("summary")?.setAttribute("aria-expanded", String(open));
    };

    const closeGroups = (except = null) => {
      window.clearTimeout(closeTimer);
      navGroups.forEach((item) => {
        if (item !== except) setGroupOpen(item, false);
      });
    };

    const openGroup = (item) => {
      window.clearTimeout(closeTimer);
      closeGroups(item);
      setGroupOpen(item, true);
    };

    const queueClose = (item) => {
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        if (!item.matches(":hover") && !item.contains(document.activeElement)) {
          setGroupOpen(item, false);
        }
      }, 180);
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
      summary?.setAttribute("aria-expanded", String(item.open));

      item.addEventListener("toggle", () => {
        summary?.setAttribute("aria-expanded", String(item.open));
        if (item.open) closeGroups(item);
      });

      summary?.addEventListener("click", (event) => {
        if (!desktopHover.matches) return;
        event.preventDefault();
        openGroup(item);
      });

      summary?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        if (item.open) {
          setGroupOpen(item, false);
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

      item.addEventListener("focusin", () => {
        if (desktopNav.matches) openGroup(item);
      });

      item.addEventListener("focusout", () => {
        if (desktopNav.matches) queueClose(item);
      });
    });

    plainNavItems.forEach((item) => {
      item.addEventListener("pointerenter", () => {
        if (desktopHover.matches) closeGroups();
      });
      item.addEventListener("focusin", () => {
        if (desktopNav.matches) closeGroups();
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
