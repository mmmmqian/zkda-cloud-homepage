/** Token Hub V5.4 | V5.3a geometry, five complete interactive model routes. */
const {
  Cam,fit,proj,unproj,facing,rings,rrect,prism,solid,put,mk,poly,open,place,
  tween,tset,tval,tdone,disposer,pointer,register,
}=HL;
const INPUT={x:-76,y:11,w:18,d:23,h:9.2};
const PORTS=[
  {x:-56,y:-40,w:17,d:17,h:5.5,key:0},{x:0,y:-58,w:19,d:18,h:7.2,key:1},
  {x:42,y:-39,w:19,d:18,h:6.4,key:2},{x:46,y:11,w:19,d:19,h:8.3,key:3},
  {x:-5,y:43,w:19,d:18,h:6.1,key:4},
];
const EXITS=[[-14,-19],[0,-19],[21,-11],[21,11],[-5,19]];
const SOCKETS=[[-39,-31.5],[9.5,-40],[42,-30],[46,20.5],[4.5,43]];
const INNER=[
  [[-5,-1.5],[-14,-1.5],EXITS[0]],[[-3.5,-3],[-3.5,-19],EXITS[1]],
  [[-.5,-3],[13,-3],[13,-11],EXITS[2]],[[1.5,1.5],[14,1.5],[14,11],EXITS[3]],
  [[-1,3],[-1,19],EXITS[4]],
];
const OUTER=[
  [EXITS[0],[-14,-26],[-39,-26],SOCKETS[0]],[EXITS[1],[0,-33],[9.5,-33],SOCKETS[1]],
  [EXITS[2],[32,-11],[32,-30],SOCKETS[2]],[EXITS[3],[36,11],[36,20.5],SOCKETS[3]],
  [EXITS[4],[-5,34],[4.5,34],SOCKETS[4]],
];

function mount({stage,svg,read},value){
  const bag=disposer();let lift=value,active=-1;
  const C=Cam(45,.5,1.88);
  fit(C,[[-86,-82,0],[83,-82,0],[83,74,0],[-86,74,0],[-86,-82,30],[83,74,30]],200,165);
  const P=proj(C),F=facing(C),root=mk('g',{'data-figure-root':'v5-4'},svg);
  const path=(xyz,cls='nf lo',parent=root,attrs={})=>mk('path',{d:open(xyz.map(q=>P(...q))),class:cls,...attrs},parent);
  const rim=(x,y,w,d,r,z)=>poly(rrect(x,y,x+w,y+d,r,8).map(q=>P(q.u,q.v,z)));
  const outline=(x,y,w,d,r,z,cls='nf lo',parent=root,attrs={})=>mk('path',{d:rim(x,y,w,d,r,z),class:cls,...attrs},parent);
  const plate=(parent,x,y,w,d,r,z0,z1,part)=>{const[ring,inside]=rings(x,y,x+w,y+d,r,1.15),shape=solid(parent);if(part)shape.g.setAttribute('data-part',part);put(shape,prism(P,F,ring,inside,z0,z1));return{shape,ring,inside}};
  const dot=(x,y,z,r=1,cls='dot off',parent=root,attrs={})=>{const el=mk('circle',{r,class:cls,...attrs},parent);place(el,P(x,y,z));return el};
  const hi=(el,on)=>el.classList.toggle('hi',on),accent=(el,on)=>{hi(el,on);el.classList.toggle('lo',!on)};

  const ground=mk('g',{'data-part':'ground-routing'},root);
  const commonGround=path([[-58,22.5,2],[-43,22.5,2],[-43,7,2],[-27,7,2]],'nf',ground,{'data-active-common':'ground'});
  const grounds=OUTER.map((route,key)=>path(route.map(([x,y])=>[x,y,2]),'nf',ground,{
    'data-route':key,'data-segment':'ground','data-exit-x':EXITS[key][0],'data-exit-y':EXITS[key][1]
  }));

  const hub=mk('g',{'data-part':'minimal-routing-hub'},root);
  plate(hub,-27,-27,56,54,8.5,1.5,4.8,'base-frame');
  plate(hub,-21,-20,43,40,6.8,4.8,6.2,'routing-plane');
  const z=6.38,routes=mk('g',{'data-part':'five-routing-channels'},hub);
  const channels=INNER.map((route,key)=>path(route.map(([x,y])=>[x,y,z]),'nf lo',routes,{'data-route':key,'data-segment':'plane'}));
  const socketGroup=mk('g',{'data-part':'edge-sockets'},hub),edgeSockets=[];
  EXITS.forEach(([x,y],key)=>{const side=Math.abs(x-21)<.01;edgeSockets[key]=outline(side?20:x-1,side?y-1:(y<0?-20:18),2,2,.45,z+.06,'nf lo',socketGroup,{'data-route':key,'data-segment':'edge-socket','data-exit-x':x,'data-exit-y':y})});
  const inputSocket=outline(-22,6,2,2,.45,z+.06,'nf lo',socketGroup,{'data-segment':'input-socket'});
  const feed=path([[-21,7,z],[-14,7,z],[-14,1.5,z],[-5,1.5,z]],'nf',routes,{'data-active-common':'feed'});
  const junction=mk('g',{'data-part':'routing-junction'},hub);
  const junctionOutline=outline(-5,-3,6.5,6,2.1,z+.1,'nf lo',junction,{'data-routing-junction':'outline'});
  const junctionDot=dot(-2,0,z+.2,1.35,'dot hi',junction,{'data-routing-junction':'node'});

  const inlet=mk('g',{'data-part':'api-inlet'},root);
  plate(inlet,INPUT.x,INPUT.y,INPUT.w,INPUT.d,3.9,2,2+INPUT.h);
  outline(-72,15,10,16,2.6,11.34,'nf lo',inlet);
  const apiKey=path([[-70,17,11.45],[-67,17,11.45],[-67,28,11.45]],'nf lo',inlet,{'data-api-key':''});
  [0,1,2].forEach(i=>dot(-71+i*3.2,29.8,11.45,.72,'dot off',inlet));

  const liftLinks=SOCKETS.map(([x,y],key)=>path([[x,y,2],[x,y,2]],'nf lo',root,{'data-route':key,'data-segment':'lift-link'}));
  const ports=[];
  PORTS.forEach(p=>{const g=mk('g',{'data-endpoint':p.key+1},root),made=plate(g,p.x,p.y,p.w,p.d,3.7,2,2+p.h),top=mk('path',{class:'nf lo'},g),mark=mk('path',{class:'nf lo'},g),beads=[];for(let i=0;i<(p.key%3)+1;i++)beads.push(mk('circle',{r:.85,class:'dot off'},g));ports[p.key]={p,body:made.shape,ring:made.ring,inside:made.inside,top,mark,beads,z:tween(0)}});
  function drawPort(o,dz){const p=o.p,top=2+p.h+dz;put(o.body,prism(P,F,o.ring,o.inside,2+dz,top));o.top.setAttribute('d',rim(p.x+3.5,p.y+3.5,p.w-7,p.d-7,2.5,top+.12));o.mark.setAttribute('d',open([[p.x+5,p.y+6,top+.2],[p.x+p.w-5-(p.key%2)*2,p.y+6,top+.2]].map(q=>P(...q))));o.beads.forEach((el,i)=>place(el,P(p.x+5+i*3.05,p.y+p.d-5,top+.2)));const s=SOCKETS[p.key];liftLinks[p.key].setAttribute('d',dz?open([P(s[0],s[1],2),P(s[0],s[1],2+dz)]):'')}
  ports.forEach(o=>drawPort(o,0));
  const clock=register(stage,(_dt,now)=>{let moving=false;ports.forEach(o=>{drawPort(o,tval(o.z,now));if(!tdone(o.z,now))moving=true});return moving});bag.add(clock.unregister);

  function hit([sx,sy]){let best=-1,score=Infinity;PORTS.forEach(p=>{const q=unproj(C,sx,sy,2+p.h+.2),cx=p.x+p.w/2,cy=p.y+p.d/2,nx=Math.abs(q[0]-cx)/(p.w/2+2),ny=Math.abs(q[1]-cy)/(p.d/2+2),s=nx*nx+ny*ny;if(nx<=1&&ny<=1&&s<score){best=p.key;score=s}});return best}
  function setActive(next,force=false){if(next===active&&!force)return;const now=performance.now();active=next;ports.forEach((o,i)=>{tset(o.z,i===next?lift:0,now,0);hi(o.body.sil,i===next);accent(channels[i],i===next);accent(edgeSockets[i],i===next);hi(grounds[i],i===next);accent(liftLinks[i],i===next)});const on=next>=0;hi(commonGround,on);accent(inputSocket,on);hi(feed,on);accent(apiKey,on);accent(junctionOutline,on);junctionDot.setAttribute('class','dot hi');read.textContent=on?`model ${String(next+1).padStart(2,'0')}`:'rest';clock.wake()}
  bag.add(pointer(stage,{move:p=>setActive(hit(p)),leave:()=>setActive(-1)}));bag.add(()=>svg.replaceChildren());
  return{set:v=>{lift=v;setActive(active,true)},destroy:bag.dispose};
}

hairline({
  name:'hub-v54-routing',
  means:'One API inlet reaches five model couplers; the chosen coupler lifts with its complete route.',
  rules:[1,3,4,5,6,7,8,9,10],range:[3.5,5.2,7],
  tour:[[175,133],[305,199],[134,222],[274,158],[243,234],null],mount,
});
