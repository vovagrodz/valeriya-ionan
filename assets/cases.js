/* ---- Lenis smooth scroll (matteofabbiani-style) ---- */
  if(window.Lenis && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    const lenis=new Lenis({lerp:0.1,smoothWheel:true});window.__lenis=lenis;
    function raf(t){lenis.raf(t);requestAnimationFrame(raf);}
    requestAnimationFrame(raf);
  }

  /* ---- interactive arc showcase (drag to rotate · click to open) ---- */
  (function(){
    const stage=document.getElementById('cstage'), ring=document.getElementById('cring');
    if(!stage||!ring) return;
    const cards=[...ring.querySelectorAll('.crd')], N=cards.length, STEP=360/N;
    const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const numEl=document.getElementById('csNum'), nameEl=document.getElementById('csName'), viewEl=document.getElementById('csView');
    let R=320, rot=0, target=0, dragging=false, lastX=0, vel=0, frontIdx=-1, introT=reduce?1:0, hovering=false, lastT=0, lastAdv=0;
    function size(){ R=Math.max(186, Math.min(stage.clientWidth*0.33, 420)); }
    size(); addEventListener('resize',size);
    const norm=a=>{a=((a%360)+360)%360; return a>180?a-360:a;};
    function setFront(i){ const c=cards[i]; if(numEl)numEl.textContent=c.dataset.num;
      if(nameEl){nameEl.style.opacity=0; setTimeout(()=>{nameEl.textContent=c.dataset.name;nameEl.style.opacity=1;},150);}
      if(viewEl)viewEl.setAttribute('href',c.dataset.href); }
    function frame(){
      if(document.body.classList.contains('hero-in') && introT<1) introT=Math.min(1,introT+0.04);
      if(!dragging && !reduce) target+=0.04;
      rot+=(target-rot)*0.085;
      let bI=0,bD=-2;
      cards.forEach((c,i)=>{
        const na=norm(i*STEP+rot), rad=na*Math.PI/180;
        const x=Math.sin(rad)*R, y=-Math.cos(rad)*R*0.6, depth=(Math.cos(rad)+1)/2;
        const sc=(0.6+depth*0.52)*(0.84+0.16*introT), op=(0.14+depth*0.86)*introT;
        c.style.transform=`translate(-50%,-50%) translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(na*0.4).toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        c.style.opacity=op.toFixed(3); c.style.zIndex=Math.round(depth*100);
        if(depth>bD){bD=depth;bI=i;}
      });
      if(bI!==frontIdx){ cards.forEach(c=>c.classList.remove('is-front')); cards[bI].classList.add('is-front'); setFront(bI); frontIdx=bI; }
      requestAnimationFrame(frame);
    }
    stage.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;vel=0;lastT=performance.now();stage.classList.add('grab');try{stage.setPointerCapture(e.pointerId)}catch(_){}});
    stage.addEventListener('pointermove',e=>{ if(dragging){const dx=e.clientX-lastX;lastX=e.clientX;target+=dx*0.4;vel=dx;lastT=performance.now();} });
    const up=()=>{ if(!dragging)return; dragging=false; stage.classList.remove('grab'); target+=vel*4; };
    stage.addEventListener('pointerup',up); stage.addEventListener('pointercancel',up);
    stage.addEventListener('pointerenter',()=>hovering=true); stage.addEventListener('pointerleave',()=>{hovering=false;up();});
    cards.forEach((c,i)=>{ c.addEventListener('click',()=>{ if(Math.abs(vel)>3) return;
      if(c.classList.contains('is-front')){ location.hash=c.dataset.href; }
      else { target+=norm(-i*STEP-target); lastT=performance.now(); } }); });
    requestAnimationFrame(frame);
  })();

  /* ---- Scroll-reveal with stagger ---- */
  (function(){
    /* also reveal closing-block children */
    document.querySelectorAll(".more-head>div,.more-head>p,.cta-panel").forEach(el=>el.classList.add("reveal"));
    const els=[...document.querySelectorAll(".reveal")];
    const ro=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){
      const el=e.target;el.classList.add("in");ro.unobserve(el);}});},
      {threshold:.12,rootMargin:"0px 0px -8% 0px"});
    els.forEach(el=>ro.observe(el));
  })();

  /* ---- preloader + cinematic hero intro (compositor CSS) ---- */
  (function(){
    const pl=document.getElementById("preloader");
    const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.classList.add("preloading");

    /* split hero headline into masked words, then arm the intro */
    if(!reduce){
      const h1=document.querySelector(".chero-top h1");
      if(h1 && !h1.classList.contains("split")){
        const ws=h1.textContent.trim().split(/\s+/);
        h1.textContent="";h1.classList.add("split");
        ws.forEach((w,i)=>{
          const m=document.createElement("span");m.className="wmask";
          const r=document.createElement("span");r.className="wrise";
          r.style.setProperty("--wi",i);r.textContent=w;
          m.appendChild(r);h1.appendChild(m);
          if(i<ws.length-1)h1.appendChild(document.createTextNode(" "));
        });
      }
      document.documentElement.classList.add("js-intro");
    }

    function reveal(){
      document.body.classList.remove("preloading");
      document.body.classList.add("hero-in");   // triggers compositor CSS intro
      if(window.__lenis)window.__lenis.start();
    }

    if(!pl||reduce){ if(pl)pl.remove(); reveal(); return; }
    if(window.__lenis)window.__lenis.stop();

    requestAnimationFrame(()=>requestAnimationFrame(()=>pl.classList.add("in")));

    const fill=pl.querySelector(".pl-bar i");
    const startT=performance.now();
    let prog=0,target=0,ended=false;
    (function paint(){
      prog+=(target-prog)*0.09;
      if(fill)fill.style.transform="scaleX("+Math.min(prog,1).toFixed(4)+")";
      if(!ended)requestAnimationFrame(paint);
    })();
    const ramp=setInterval(()=>{target=Math.min(target+0.05,0.92);},90);

    function exit(){
      if(ended)return;ended=true;
      clearInterval(ramp);
      if(fill)fill.style.transform="scaleX(1)";
      pl.classList.add("leaving");
      setTimeout(()=>{pl.classList.add("done");reveal();},300);
      setTimeout(()=>{pl.remove();},300+1000);
    }
    function ready(){
      const wait=Math.max(0,1700-(performance.now()-startT)); // min on-screen time
      setTimeout(exit,wait);
    }
    if(document.readyState==="complete")ready();
    else window.addEventListener("load",ready,{once:true});
    setTimeout(()=>{if(!ended)exit();},4500);             // hard safety cap
  })();

  /* ---- custom cursor: lerped follow + grow-on-hover (matteofabbiani-style) ---- */
  (function(){
    if(!matchMedia("(hover:hover) and (pointer:fine)").matches)return;
    document.documentElement.classList.add("has-cursor");
    const cur=document.createElement("div");cur.className="cursor hidden";document.body.appendChild(cur);
    document.querySelectorAll(".case-media,.cta-panel,.lets-card").forEach(e=>e.dataset.lum="0.08");
    function avgLum(img){try{const c=document.createElement("canvas");c.width=12;c.height=12;const x=c.getContext("2d");x.drawImage(img,0,0,12,12);const d=x.getImageData(0,0,12,12).data;let s=0,n=0;for(let i=0;i<d.length;i+=4){if(d[i+3]<40)continue;s+=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];n++;}return n?(s/n)/255:null;}catch(e){return null;}}
    function setLum(img){const v=avgLum(img);if(v!=null)img.dataset.lum=v.toFixed(3);}
    document.querySelectorAll("img").forEach(img=>{if(img.complete&&img.naturalWidth)setLum(img);else img.addEventListener("load",()=>setLum(img),{once:true});});
    function rgbLum(s){const m=s.match(/[\d.]+/g);if(!m||m.length<3)return null;if(m.length>=4&&parseFloat(m[3])<0.35)return null;return (0.2126*+m[0]+0.7152*+m[1]+0.0722*+m[2])/255;}
    function lumAt(x,y){let node=document.elementFromPoint(x,y);while(node&&node.dataset){if(node.tagName==="IMG"&&node.dataset.lum==null&&node.complete&&node.naturalWidth)setLum(node);if(node.dataset.lum!=null)return parseFloat(node.dataset.lum);const bl=rgbLum(getComputedStyle(node).backgroundColor);if(bl!=null)return bl;node=node.parentElement;}return 1;}
    function ctxLum(el){let node=el.parentElement;while(node&&node.dataset){if(node.dataset.lum!=null)return parseFloat(node.dataset.lum);const bl=rgbLum(getComputedStyle(node).backgroundColor);if(bl!=null)return bl;node=node.parentElement;}return 1;}
    function setInv(x,y){cur.classList.toggle("inv",lumAt(x,y)<0.55);}
    let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my,seen=false,morphEl=null;
    addEventListener("mousemove",e=>{mx=e.clientX;my=e.clientY;if(!seen){seen=true;cx=mx;cy=my;cur.classList.remove("hidden");}
      if(!morphEl)setInv(mx,my);},{passive:true});
    addEventListener("mouseleave",()=>cur.classList.add("hidden"));
    (function tick(){
      let tx=mx,ty=my;
      if(morphEl){const r=morphEl.getBoundingClientRect();tx=r.left+r.width/2;ty=r.top+r.height/2;
        cur.style.width=(r.width+14)+"px";cur.style.height=(r.height+14)+"px";}
      cx+=(tx-cx)*0.22;cy+=(ty-cy)*0.22;
      cur.style.transform="translate("+cx+"px,"+cy+"px) translate(-50%,-50%)";
      requestAnimationFrame(tick);
    })();
    const hot="nav .mail,.btn-dark,.glass-mail,.cta-bio,.cindex a,.lets-nav a,.lets-social a,.lets-card .email,.m-close,.m-slink";
    document.querySelectorAll(hot).forEach(el=>{
      el.addEventListener("mouseenter",()=>{morphEl=el;cur.classList.add("morph");
        const br=parseFloat(getComputedStyle(el).borderRadius)||8;
        cur.style.borderRadius=Math.min(br+7,40)+"px";cur.classList.toggle("inv",ctxLum(el)<0.55);});
      el.addEventListener("mouseleave",()=>{morphEl=null;cur.classList.remove("morph");cur.style.width="";cur.style.height="";cur.style.borderRadius="";});
    });
  })();

  /* ---- nav magnetic sliding highlight (matteofabbiani-style) ---- */
  (function(){
    const links=document.querySelector("nav .links");if(!links)return;
    const hl=document.createElement("span");hl.className="nav-hl";links.appendChild(hl);
    links.querySelectorAll("a").forEach(a=>{
      a.addEventListener("mouseenter",()=>{hl.style.opacity="1";hl.style.width=a.offsetWidth+"px";hl.style.height=a.offsetHeight+"px";hl.style.transform="translate("+a.offsetLeft+"px,"+a.offsetTop+"px)";});
    });
    links.addEventListener("mouseleave",()=>{hl.style.opacity="0";});
  })();

  /* ---- magnetic buttons ---- */
  (function(){
    if(!matchMedia("(hover:hover) and (pointer:fine)").matches)return;
    document.querySelectorAll(".btn-dark,.menu,.glass-mail,.cta-bio").forEach(btn=>{
      btn.style.willChange="transform";
      btn.addEventListener("mousemove",e=>{const r=btn.getBoundingClientRect();const x=(e.clientX-r.left-r.width/2)*0.25;const y=(e.clientY-r.top-r.height/2)*0.25;btn.style.transform="translate("+x+"px,"+y+"px)";});
      btn.addEventListener("mouseleave",()=>{btn.style.transform="";});
    });
  })();

  /* ---- fullscreen menu ---- */
  (function(){
    const ov=document.getElementById("menu-overlay");
    const openBtn=document.querySelector("nav .menu");
    if(!ov||!openBtn)return;
    const closeBtn=ov.querySelector(".m-close");
    let open=false;
    function setOpen(v){
      open=v;
      ov.classList.toggle("open",v);
      ov.setAttribute("aria-hidden",v?"false":"true");
      document.body.classList.toggle("menu-open",v);
      if(window.__lenis){v?window.__lenis.stop():window.__lenis.start();}
    }
    openBtn.addEventListener("click",()=>setOpen(true));
    if(closeBtn)closeBtn.addEventListener("click",()=>setOpen(false));
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&open)setOpen(false);});
    // Every link just closes the menu; in-page "#" links scroll natively
    ov.querySelectorAll("a").forEach(a=>{a.addEventListener("click",()=>setOpen(false));});
  })();