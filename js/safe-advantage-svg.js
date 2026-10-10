/**
 * ZKDACloud ADVANTAGES artwork renderer.
 * Keeps SVG at its native 441x818 layout size and scales its *wrapper*.
 * Prevents pathLength/stroke-dasharray trace gaps after viewport resizing.
 * Import in your EXISTING advantage-switch handler; do not replace it.
 */
export function createAdvantageSVGRenderer(host, urls, { fit = 'cover' } = {}) {
  if (!(host instanceof HTMLElement)) throw new TypeError('host must be an HTMLElement');
  const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });
  const styles = `
    :host { display:block; width:100%; height:100%; overflow:hidden; }
    .frame { width:100%; height:100%; overflow:hidden; position:relative; }
    .native { width:441px; height:818px; position:absolute; left:50%; top:50%;
      transform-origin:center center; transform:translate(-50%,-50%) scale(var(--art-scale,1)); }
    .native > svg { display:block !important; width:441px !important; height:818px !important;
      min-width:441px !important; min-height:818px !important; max-width:none !important;
      max-height:none !important; }
  `;
  shadow.innerHTML = `<style>${styles}</style><div class="frame"><div class="native"></div></div>`;
  const native = shadow.querySelector('.native');
  const cache = new Map();
  let generation = 0;
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    const scale = fit === 'contain' ? Math.min(width / 441, height / 818) : Math.max(width / 441, height / 818);
    native.style.setProperty('--art-scale', String(scale));
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  return {
    async show(index) {
      const id = ++generation;
      const url = urls[index];
      if (!url) throw new RangeError(`unknown advantage index: ${index}`);
      if (!cache.has(url)) {
        cache.set(url, fetch(url).then(r => {
          if (!r.ok) throw new Error(`Cannot load SVG: ${url}, status ${r.status}`);
          return r.text();
        }));
      }
      let source;
      try { source = await cache.get(url); }
      catch (error) { cache.delete(url); throw error; }
      if (id !== generation) return;
      const svgDocument = new DOMParser().parseFromString(source, 'image/svg+xml');
      const svg = svgDocument.documentElement;
      if (svg.nodeName.toLowerCase() !== 'svg') throw new Error(`Invalid SVG: ${url}`);
      // Replacing this node resets the SVG's own motion timeline, as in FigmaPreview.
      native.replaceChildren(document.importNode(svg, true));
      resize();
    },
    destroy() { generation++; observer.disconnect(); shadow.replaceChildren(); },
  };
}
