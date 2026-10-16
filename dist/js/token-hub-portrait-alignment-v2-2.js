(() => {
  'use strict';
  const hero=document.querySelector('.portrait-preview .product-hero');
  if(!hero)return;
  const owner=hero.querySelector('.product-hero__visual'),inner=hero.querySelector('.product-hero__inner');
  const product=hero.classList.contains('product-hero--compute')?'compute':hero.classList.contains('product-hero--token')?'token':'autodev';
  const profiles={compute:{width:.94,height:.45,min:240,pad:14},token:{width:.96,height:.36,min:200,pad:14},autodev:{width:.90,height:.49,min:290,pad:16}};
  const profile=profiles[product],marker=document.createComment('original Figure Owner position');owner.before(marker);
  const wrap=document.createElement('div');wrap.className='portrait-figure-stage';
  let geometry=null,frame=0,active=false;
  const rects=()=>[...owner.querySelectorAll('[data-hairline] svg :is(path,circle,ellipse,line,polygon)')].filter(e=>!e.closest('defs')).map(e=>e.getBoundingClientRect()).filter(r=>r.width||r.height);
  function measure(){const rs=rects(),o=owner.getBoundingClientRect();if(!rs.length||!o.width)return false;const left=Math.min(...rs.map(r=>r.left)),top=Math.min(...rs.map(r=>r.top)),right=Math.max(...rs.map(r=>r.right)),bottom=Math.max(...rs.map(r=>r.bottom));geometry={left:(left-o.left)/o.width,top:(top-o.top)/o.width,right:(right-o.left)/o.width,bottom:(bottom-o.top)/o.width};geometry.width=geometry.right-geometry.left;geometry.height=geometry.bottom-geometry.top;
    // Compute's unchanged 22-unit lift needs 22*1.84/400 of extra headroom.
    geometry.safeTop=geometry.top-(product==='compute'?22*1.84/400:product==='token'?.02:0);return true;
  }
  function layout(){frame=0;if(!geometry&&!measure()){requestAnimationFrame(schedule);return;}
    const w=hero.clientWidth,h=innerHeight,portrait=w<900||(w<=1100&&h>w);
    if(portrait!==active){active=portrait;hero.classList.toggle('is-portrait',active);if(active){inner.insertBefore(wrap,owner);wrap.append(owner)}else{marker.after(owner);wrap.remove()}}
    if(!active){window.__PORTRAIT_LAYOUT__={product,active:false,geometry};return;}
    const s=getComputedStyle(inner),stageWidth=wrap.clientWidth,available=Math.max(1,innerHeight-document.querySelector('[data-site-header]').getBoundingClientRect().height);
    const targetHeight=Math.max(profile.min,available*profile.height),pad=profile.pad;
    const innerWidth=inner.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight);
    const baselineWidth=Math.min(w-8,innerWidth*profile.width/geometry.width,(targetHeight-2*pad)/(geometry.bottom-geometry.safeTop));
    // Scale real ink, not its empty SVG viewport. Preserve headroom for the original lift.
    const ownerWidth=Math.min(baselineWidth*1.12,(stageWidth-32)/geometry.width,(stageWidth-18)/(1-geometry.left));
    let stageHeight=(geometry.bottom-geometry.safeTop)*ownerWidth+2*pad;
    const wr=wrap.getBoundingClientRect();
    const desired=(stageWidth-geometry.width*ownerWidth)/2-geometry.left*ownerWidth;
    // Empty Owner padding may extend to the negative side; all actual ink stays in Stage.
    const left=Math.min(desired,w-wr.left-ownerWidth-4);
    const top=pad-geometry.safeTop*ownerWidth;
    owner.style.setProperty('--portrait-owner-width',ownerWidth+'px');owner.style.setProperty('--portrait-owner-left',left+'px');owner.style.setProperty('--portrait-owner-top',top+'px');wrap.style.setProperty('--portrait-stage-height',stageHeight+'px');
    const grid=owner.querySelector('.compute-hero__grid');if(grid){const gr=grid.getBoundingClientRect(),sr=wrap.getBoundingClientRect(),a=sr.top-gr.top,b=sr.bottom-gr.top;grid.style.setProperty('--portrait-grid-mask',`linear-gradient(to bottom, transparent ${a}px, #000 ${a+28}px, #000 ${b-32}px, transparent ${b}px)`)}
    const content=hero.querySelector('.product-hero__content'),meta=hero.querySelector('.product-hero__aside'),index=hero.querySelector('.product-hero__topline'),foot=hero.querySelector('.product-hero__foot');
    const gap=parseFloat(getComputedStyle(content).marginTop)||18;
    const contentHeight=content.getBoundingClientRect().height,metaHeight=meta.getBoundingClientRect().height,indexHeight=index.getBoundingClientRect().height;
    const padding=parseFloat(s.paddingTop)+parseFloat(s.paddingBottom);
    const innerAvailable=Math.max(0,available-foot.getBoundingClientRect().height);
    // Shared reference solver: product bounds + existing Stage profiles, never viewport Y patches.
    // These normalized Rest bounds were measured from the unchanged reference Figures.
    const refs=[{width:.94,height:.45,min:240,pad:14,inkWidth:.85695,safeHeight:.606575},{width:.90,height:.49,min:290,pad:16,inkWidth:.7904,safeHeight:.705775}];
    const referenceStage=ref=>Math.min(w-8,innerWidth*ref.width/ref.inkWidth,(Math.max(ref.min,available*ref.height)-2*ref.pad)/ref.safeHeight)*ref.safeHeight+2*ref.pad;
    const contentOffset=sh=>sh+Math.max(0,innerAvailable-padding-indexHeight-sh-contentHeight-metaHeight-3*gap)*.6;
    const referenceStages=refs.map(referenceStage);
    const alignedOffset=referenceStages.reduce((a,sh)=>a+contentOffset(sh),0)/refs.length;
    const initialFree=Math.max(0,innerAvailable-padding-indexHeight-stageHeight-contentHeight-metaHeight-3*gap);
    // A flatter Figure needs a taller Stage, not extra margin on the copy. This places
    // its enlarged ink toward the upper Stage while the shared copy anchor stays fixed.
    stageHeight+=Math.min(initialFree*.5,Math.max(0,referenceStages.reduce((a,v)=>a+v,0)/refs.length*.85-stageHeight));
    wrap.style.setProperty('--portrait-stage-height',stageHeight+'px');
    const free=Math.max(0,innerAvailable-padding-indexHeight-stageHeight-contentHeight-metaHeight-3*gap);
    const beforeStage=Math.min(free,Math.max(0,alignedOffset-stageHeight));
    inner.style.setProperty('--portrait-alignment-space',beforeStage+'px');
    window.__PORTRAIT_LAYOUT__={product,active:true,profile,geometry,available,owner:{width:ownerWidth,left,top},stage:{width:stageWidth,height:stageHeight},gap,alignment:{beforeStage,free,alignedOffset,referenceStages,baselineWidth,scale:ownerWidth/baselineWidth}};
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(layout)}
  addEventListener('resize',schedule,{passive:true});new ResizeObserver(schedule).observe(hero);document.fonts?.ready.then(schedule);requestAnimationFrame(schedule);
})();
