(() => {
  'use strict';
  const hero=document.querySelector('.portrait-preview .product-hero');
  const header=document.querySelector('[data-site-header]');
  if(!hero||!header)return;
  let frame=0;
  const update=()=>{frame=0;hero.style.setProperty('--portrait-header-height',header.getBoundingClientRect().height+'px')};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  new ResizeObserver(schedule).observe(header);
  addEventListener('resize',schedule,{passive:true});
  document.fonts?.ready.then(schedule);
  schedule();
})();
