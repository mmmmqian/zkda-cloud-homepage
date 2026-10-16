(function () {
  "use strict";

  const owner = document.querySelector(".product-hero__visual--token");
  const hero = document.querySelector(".product-hero");
  if (!owner || !hero) return;

  const WIDTH_RATIO_STOPS = [
    [1024, 0.57],
    [1280, 0.63],
    [1600, 0.68],
    [1920, 0.715],
    [2048, 0.727],
    [2560, 0.70],
  ];

  const HUB_X_RATIO_STOPS = [
    [1024, 0.68],
    [1280, 0.665],
    [1600, 0.65],
    [1920, 0.642],
    [2048, 0.636],
    [2560, 0.635],
  ];

  const HUB_Y_RATIO_STOPS = [
    [1024, 0.38],
    [1280, 0.40],
    [1600, 0.45],
    [1920, 0.47],
    [2048, 0.479],
    [2560, 0.46],
  ];

  const clamp = (min, value, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sample = (stops, value) => {
    if (value <= stops[0][0]) return stops[0][1];
    for (let index = 1; index < stops.length; index += 1) {
      const [rightX, rightY] = stops[index];
      const [leftX, leftY] = stops[index - 1];
      if (value <= rightX) return lerp(leftY, rightY, (value - leftX) / (rightX - leftX));
    }
    return stops.at(-1)[1];
  };

  const visibleRects = (selector) => [...owner.querySelectorAll(selector)]
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width || rect.height);

  const union = (rects) => ({
    left: Math.min(...rects.map((rect) => rect.left)),
    top: Math.min(...rects.map((rect) => rect.top)),
    right: Math.max(...rects.map((rect) => rect.right)),
    bottom: Math.max(...rects.map((rect) => rect.bottom)),
  });

  let geometry = null;
  let frame = 0;

  const measureGeometry = () => {
    const root = owner.querySelector("[data-figure-root]");
    const hub = owner.querySelector('[data-part="minimal-routing-hub"]');
    if (!root || !hub) return false;
    const ownerRect = owner.getBoundingClientRect();
    const ink = union(visibleRects("[data-figure-root] path,[data-figure-root] circle"));
    const hubInk = union([...hub.querySelectorAll("path,circle")]
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width || rect.height));
    if (!Number.isFinite(ink.left) || !ownerRect.width) return false;
    geometry = {
      aspect: ownerRect.height / ownerRect.width,
      inkLeft: (ink.left - ownerRect.left) / ownerRect.width,
      inkTop: (ink.top - ownerRect.top) / ownerRect.width,
      inkWidth: (ink.right - ink.left) / ownerRect.width,
      inkHeight: (ink.bottom - ink.top) / ownerRect.width,
      hubCenterX: ((hubInk.left + hubInk.right) / 2 - ownerRect.left) / ownerRect.width,
      hubCenterY: ((hubInk.top + hubInk.bottom) / 2 - ownerRect.top) / ownerRect.width,
    };
    return true;
  };

  const layout = () => {
    frame = 0;
    if (!geometry && !measureGeometry()) {
      requestAnimationFrame(schedule);
      return;
    }

    const viewportWidth = innerWidth;
    const headerBottom = document.querySelector("[data-site-header]")?.getBoundingClientRect().bottom || 0;
    const footTop = document.querySelector(".product-hero__foot")?.getBoundingClientRect().top || innerHeight;
    const metadata = document.querySelector(".product-hero__aside");
    const metadataRect = metadata?.getBoundingClientRect();
    const metadataVisible = metadata && getComputedStyle(metadata).display !== "none";
    const availableHeight = Math.max(1, footTop - headerBottom);
    const viewportAspect = availableHeight / viewportWidth;
    const shortness = clamp(0, (0.42 - viewportAspect) / 0.11, 1);
    const widthGoal = viewportWidth * sample(WIDTH_RATIO_STOPS, viewportWidth);
    const heightRatio = lerp(0.802, 0.76, shortness);
    const heightGoal = availableHeight * heightRatio;
    const inkAspect = geometry.inkWidth / geometry.inkHeight;
    const targetInkWidth = Math.min(widthGoal, heightGoal * inkAspect);
    const ownerWidth = targetInkWidth / geometry.inkWidth;

    const gutter = clamp(28, viewportWidth * 0.0218, 56);
    const topLimit = headerBottom + clamp(28, viewportWidth * 0.022, 56);
    const rightLimit = viewportWidth - gutter;
    const metadataLimit = metadataVisible ? metadataRect.top - 18 : footTop - 24;
    const bottomLimit = Math.min(footTop - 24, metadataLimit);

    const baseHubX = viewportWidth * sample(HUB_X_RATIO_STOPS, viewportWidth);
    const rightAlignedHubX = rightLimit - (geometry.inkWidth - (geometry.hubCenterX - geometry.inkLeft)) * ownerWidth;
    const hubX = lerp(baseHubX, rightAlignedHubX, shortness);
    const hubYRatio = lerp(sample(HUB_Y_RATIO_STOPS, viewportWidth), 0.47, shortness);
    const hubY = headerBottom + availableHeight * hubYRatio;

    let ownerLeft = hubX - geometry.hubCenterX * ownerWidth;
    let ownerTop = hubY - geometry.hubCenterY * ownerWidth;
    let ink = {
      left: ownerLeft + geometry.inkLeft * ownerWidth,
      top: ownerTop + geometry.inkTop * ownerWidth,
      right: ownerLeft + (geometry.inkLeft + geometry.inkWidth) * ownerWidth,
      bottom: ownerTop + (geometry.inkTop + geometry.inkHeight) * ownerWidth,
    };

    if (ink.right > rightLimit) ownerLeft -= ink.right - rightLimit;
    if (ink.left < 16) ownerLeft += 16 - ink.left;
    if (ink.top < topLimit) ownerTop += topLimit - ink.top;
    if (ink.bottom > bottomLimit) ownerTop -= ink.bottom - bottomLimit;

    ink = {
      left: ownerLeft + geometry.inkLeft * ownerWidth,
      top: ownerTop + geometry.inkTop * ownerWidth,
      right: ownerLeft + (geometry.inkLeft + geometry.inkWidth) * ownerWidth,
      bottom: ownerTop + (geometry.inkTop + geometry.inkHeight) * ownerWidth,
    };

    owner.style.setProperty("--token-owner-width", `${ownerWidth.toFixed(3)}px`);
    owner.style.setProperty("--token-owner-left", `${ownerLeft.toFixed(3)}px`);
    owner.style.setProperty("--token-owner-top", `${(ownerTop - hero.getBoundingClientRect().top).toFixed(3)}px`);
    owner.classList.add("is-responsive-ready");

    window.__TOKEN_HERO_LAYOUT__ = {
      viewport: { width: viewportWidth, height: innerHeight },
      available: { top: headerBottom, bottom: footTop, height: availableHeight },
      limits: { top: topLimit, right: rightLimit, bottom: bottomLimit },
      target: { widthRatio: widthGoal / viewportWidth, heightRatio, shortness },
      owner: { width: ownerWidth, left: ownerLeft, top: ownerTop },
      predictedInk: ink,
      geometry: { ...geometry },
    };
    dispatchEvent(new CustomEvent("tokenherolayout", { detail: window.__TOKEN_HERO_LAYOUT__ }));
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(layout);
  };

  addEventListener("resize", schedule, { passive: true });
  new ResizeObserver(schedule).observe(hero);
  requestAnimationFrame(schedule);
}());

