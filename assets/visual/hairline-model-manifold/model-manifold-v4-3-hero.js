/** V4.3: one API inlet, a five-channel router and five sockets on three physical edges. */
const {
  Cam, fit, proj, facing, rings, rrect, prism, solid, put, mk, poly, open, place,
  unproj, tween, tset, tval, tdone, disposer, pointer, register,
} = HL;

const CORE={x:-35,y:-32,w:49,d:48},INLET={x:-58,y:8,w:15,d:25,h:11},J={x:-26,y:-3};
const BASE=2.15,PH=6.2;
const PORTS=[
  {x:-39,y:-88.5,w:18,d:17,key:0},{x:-11.5,y:-101,w:18,d:17,key:1},{x:16,y:-113.5,w:18,d:17,key:2},
  {x:66,y:-70.5,w:18,d:17,key:3},{x:11,y:23.5,w:18,d:17,key:4},
];
const ROUTES=[
  {side:"back",exit:[-25,-32],well:[-27.1,-32,4.2,4.1],surface:[[-19,-3,7.35],[-25,-3,7.35],[-25,-32,7.35]],ground:[[-25,-32,BASE],[-25,-65,BASE],[-30,-65,BASE],[-30,-80,BASE]],branch:[]},
  {side:"back",exit:[-5,-32],well:[-7.1,-32,4.2,4.1],surface:[[-16,-3,7.35],[-16,-20,7.35],[-5,-20,7.35],[-5,-32,7.35]],ground:[[-5,-32,BASE],[-5,-70,BASE],[-2.5,-70,BASE],[-2.5,-92.5,BASE]],branch:[[-19,-3,7.35],[-16,-3,7.35]]},
  {side:"back",exit:[13,-32],well:[10.9,-32,3.1,4.1],surface:[[-13,-3,7.35],[-13,-14,7.35],[13,-14,7.35],[13,-32,7.35]],ground:[[13,-32,BASE],[13,-75,BASE],[25,-75,BASE],[25,-105,BASE]],branch:[[-19,-3,7.35],[-13,-3,7.35]]},
  {side:"right",exit:[14,2],well:[9.9,-.1,4.1,4.2],surface:[[-12,2,7.35],[14,2,7.35]],ground:[[14,2,BASE],[14,-28,BASE],[46,-28,BASE],[46,-62,BASE],[75,-62,BASE]],branch:[[-19,-3,7.35],[-12,-3,7.35],[-12,2,7.35]]},
  {side:"front",exit:[-4,16],well:[-6.1,11.9,4.2,4.1],surface:[[-12,10,7.35],[-4,10,7.35],[-4,16,7.35]],ground:[[-4,16,BASE],[-4,32,BASE],[20,32,BASE]],branch:[[-19,-3,7.35],[-12,-3,7.35],[-12,10,7.35]]},
];

function mount({stage,svg,read},value){
  const bag=disposer();let lift=value,active=-1;
  const C=Cam(45,.5,1.82);fit(C,[[-72,-80,0],[106,-80,0],[106,50,0],[-72,50,0],[-72,-80,22],[106,50,22]],200,166);
  const P=proj(C),front=facing(C),root=mk("g",{"data-figure-root":""},svg);
  const line=(coords,cls="nf lo",parent=root,attrs={})=>mk("path",{d:open(coords.map(q=>P(...q))),class:cls,...attrs},parent);
  const dot=(x,y,z,r=1,cls="dot off",parent=root,attrs={})=>{const el=mk("circle",{r,class:cls,...attrs},parent);place(el,P(x,y,z));return el};
  const rim=(x,y,w,d,r,z)=>poly(rrect(x,y,x+w,y+d,r,5).map(q=>P(q.u,q.v,z)));
  const plate=(parent,x,y,w,d,r,z0,z1)=>{const[outer,inner]=rings(x,y,x+w,y+d,r,1.15),body=solid(parent);put(body,prism(P,front,outer,inner,z0,z1));return{body,outer,inner}};
  const hi=(el,on)=>el.classList.toggle("hi",on),accent=(el,on)=>{hi(el,on);el.classList.toggle("lo",!on)};

  const inletEdge=INLET.x+INLET.w;
  const commonGround=line([[inletEdge,20,1.6],[inletEdge+4,20,1.6],[inletEdge+4,J.y,1.6],[CORE.x,J.y,1.6]],"nf",root,{"data-active-common":"ground"});
  dot(inletEdge,20,1.6,1.05,"dot off");
  const grounds=ROUTES.map((r,i)=>line(r.ground,"nf lo",root,{"data-route":i,"data-segment":"ground"}));
  const endDots=ROUTES.map((r,i)=>{const q=r.ground.at(-1);return dot(q[0],q[1],q[2],1,"dot off",root,{"data-route-end":i})});

  const router=mk("g",{"data-router":""},root),routerBody=mk("g",{"data-router-body":""},router);plate(routerBody,CORE.x,CORE.y,CORE.w,CORE.d,5.5,1.6,7.1);
  mk("path",{d:rim(-31,-28,41,40,4.6,7.22),class:"nf lo"},routerBody);
  const commonRise=line([[CORE.x,J.y,1.6],[CORE.x,J.y,7.35],[-30,J.y,7.35]],"nf",router,{"data-active-common":"rise"});
  const junctionWell=mk("path",{d:rim(-30,-7,8,8,2.2,7.42),class:"nf lo","data-routing-junction":"well"},router);
  const junction=dot(J.x,J.y,7.45,1.12,"dot",router,{"data-routing-junction":"node"});
  const commonFeed=line([[-22,J.y,7.35],[-19,J.y,7.35]],"nf",router,{"data-active-common":"feed"});
  line([[-19,-3,7.35],[-12,-3,7.35],[-12,10,7.35]],"nf lo",router,{"data-distributor":""});
  const activeBranch=line([[-19,-3,7.35],[-19,-3,7.35]],"nf",router,{"data-active-branch":""});
  const paths=ROUTES.map((r,i)=>{
    const lane=line(r.surface,"nf lo",router,{"data-route":i,"data-segment":"surface"}),w=r.well;
    const well=mk("path",{d:rim(w[0],w[1],w[2],w[3],1.05,7.43),class:"nf lo","data-route":i,"data-segment":"well"},router);
    const drop=line([[r.exit[0],r.exit[1],7.35],[r.exit[0],r.exit[1],BASE]],"nf lo",router,{"data-route":i,"data-segment":"drop","data-output-side":r.side});
    dot(r.surface[0][0],r.surface[0][1],7.42,.7,"dot off",router);const out=dot(r.exit[0],r.exit[1],BASE,1.05,"dot m",router,{"data-output-node":i,"data-output-side":r.side});
    return{lane,well,drop,out,ground:grounds[i],end:endDots[i]};
  });
  mk("path",{d:rim(-13,-27,4,37,1.4,7.46),class:"nf lo"},router);

  const inlet=mk("g",{"data-api-inlet":""},root);plate(inlet,INLET.x,INLET.y,INLET.w,INLET.d,3.3,1.9,12.9);
  mk("path",{d:rim(-55,12,9,17,2,13.02),class:"nf lo"},inlet);
  const apiKey=line([[-52.5,14,13.14],[-48.5,14,13.14],[-48.5,26,13.14],[-52.5,26,13.14]],"nf",inlet,{"data-api-key":""});

  function detail(p,z){const cx=p.x+p.w/2,cy=p.y+p.d/2;
    if(p.key===0)return{paths:[open([[cx-4,cy-1.2],[cx+4,cy-1.2]].map(q=>P(q[0],q[1],z+.22)))],dots:[[cx,cy+2.8]]};
    if(p.key===1)return{paths:[open([[cx-4,cy+4],[cx+4,cy+4]].map(q=>P(q[0],q[1],z+.21)))],dots:[[cx-3,cy],[cx+3,cy]]};
    if(p.key===2)return{paths:[rim(cx-3.5,cy-3.1,7,6.2,1.1,z+.23)],dots:[]};
    if(p.key===3)return{paths:[-3,1].map(dy=>open([[cx-4,cy+dy],[cx+(dy<0?3:4),cy+dy]].map(q=>P(q[0],q[1],z+.23)))),dots:[]};
    return{paths:[open([[cx-4,cy+4],[cx+4,cy+4]].map(q=>P(q[0],q[1],z+.23)))],dots:[[cx-3.5,cy],[cx,cy],[cx+3.5,cy]]};}
  const ports=[],liftLinks=PORTS.map(p=>line([[p.x+p.w/2,p.y+p.d/2,BASE],[p.x+p.w/2,p.y+p.d/2,BASE]],"nf",root,{"data-lift-link":p.key}));
  [...PORTS].sort((a,b)=>(a.x+a.y)-(b.x+b.y)).forEach(p=>{const g=mk("g",{"data-model-port":p.key},root),[outer,inner]=rings(p.x,p.y,p.x+p.w,p.y+p.d,3,1.15),body=solid(g),top=mk("path",{class:"nf lo"},g),q=detail(p,BASE+PH),marks=q.paths.map(()=>mk("path",{class:"nf lo"},g)),beads=q.dots.map(()=>mk("circle",{r:.82,class:"dot off"},g));ports[p.key]={p,outer,inner,body,top,marks,beads,link:liftLinks[p.key],z:tween(0)}});
  function drawPort(o,dz){const p=o.p,z=BASE+PH+dz,cx=p.x+p.w/2,cy=p.y+p.d/2;put(o.body,prism(P,front,o.outer,o.inner,BASE+dz,z));o.top.setAttribute("d",rim(p.x+3.1,p.y+3,p.w-6.2,p.d-6,1.8,z+.1));const q=detail(p,z);o.marks.forEach((el,i)=>el.setAttribute("d",q.paths[i]));o.beads.forEach((el,i)=>place(el,P(q.dots[i][0],q.dots[i][1],z+.24)));o.link.setAttribute("d",dz?open([P(cx,cy,BASE),P(cx,cy,BASE+dz)]):"")}
  ports.forEach(o=>drawPort(o,0));
  const loop=register(stage,(_dt,now)=>{let moving=false;ports.forEach(o=>{drawPort(o,tval(o.z,now));if(!tdone(o.z,now))moving=true});return moving});bag.add(loop.unregister);

  function hit([sx,sy]){let best=-1,score=Infinity;PORTS.forEach(p=>{const q=unproj(C,sx,sy,BASE+PH),cx=p.x+p.w/2,cy=p.y+p.d/2,nx=Math.abs(q[0]-cx)/(p.w/2+2.2),ny=Math.abs(q[1]-cy)/(p.d/2+2.2),s=nx*nx+ny*ny;if(nx<=1&&ny<=1&&s<score){best=p.key;score=s}});return best}
  function setActive(next,force=false){if(next===active&&!force)return;const now=performance.now();active=next;ports.forEach((o,i)=>{tset(o.z,i===next?lift:0,now,0);hi(o.body.sil,i===next);accent(o.link,i===next);[paths[i].lane,paths[i].well,paths[i].drop,paths[i].ground].forEach(el=>accent(el,i===next));paths[i].out.setAttribute("class",i===next?"dot":"dot m");paths[i].end.setAttribute("class",i===next?"dot":"dot off")});const on=next>=0;[apiKey,commonGround,commonRise,commonFeed].forEach(el=>hi(el,on));accent(junctionWell,on);junction.setAttribute("class",on?"dot":"dot");activeBranch.setAttribute("d",on&&ROUTES[next].branch.length?open(ROUTES[next].branch.map(q=>P(...q))):"");hi(activeBranch,on);read.textContent=on?`model ${String(next+1).padStart(2,"0")}`:"rest";loop.wake()}
  bag.add(pointer(stage,{move:p=>setActive(hit(p)),leave:()=>setActive(-1)}));bag.add(()=>svg.replaceChildren());
  return{set:v=>{lift=v;setActive(active,true)},destroy:bag.dispose};
}

hairline({
  name:"model-manifold-v4-3-interactive",
  means:"One API input reaches five model sockets through three physical router edges; the chosen end-to-end route answers as one.",
  rules:[1,3,4,5,6,7,8,9,10],range:[1.8,2.6,3.1],
  tour:[[326,122],[143,207],[223,103],[335,182],[275,113],null],mount,
});
