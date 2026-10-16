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
    const ownerWidth=Math.min(w-8,stageWidth*profile.width/geometry.width,(targetHeight-2*pad)/(geometry.bottom-geometry.safeTop));
    const stageHeight=(geometry.bottom-geometry.safeTop)*ownerWidth+2*pad;
    const wr=wrap.getBoundingClientRect();
    const desired=(stageWidth-geometry.width*ownerWidth)/2-geometry.left*ownerWidth;
    const left=Math.max(-wr.left+4,Math.min(desired,w-wr.left-ownerWidth-4));
    const top=pad-geometry.safeTop*ownerWidth;
    owner.style.setProperty('--portrait-owner-width',ownerWidth+'px');owner.style.setProperty('--portrait-owner-left',left+'px');owner.style.setProperty('--portrait-owner-top',top+'px');wrap.style.setProperty('--portrait-stage-height',stageHeight+'px');
    const grid=owner.querySelector('.compute-hero__grid');if(grid){const gr=grid.getBoundingClientRect(),sr=wrap.getBoundingClientRect(),a=sr.top-gr.top,b=sr.bottom-gr.top;grid.style.setProperty('--portrait-grid-mask',`linear-gradient(to bottom, transparent ${a}px, #000 ${a+28}px, #000 ${b-32}px, transparent ${b}px)`)}
    window.__PORTRAIT_LAYOUT__={product,active:true,profile,geometry,available,owner:{width:ownerWidth,left,top},stage:{width:stageWidth,height:stageHeight},gap:parseFloat(s.rowGap)};
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(layout)}
  addEventListener('resize',schedule,{passive:true});new ResizeObserver(schedule).observe(hero);document.fonts?.ready.then(schedule);requestAnimationFrame(schedule);
})();
