/* ---- Lenis smooth scroll ---- */
  if(window.Lenis && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    const lenis=new Lenis({lerp:0.1,smoothWheel:true});window.__lenis=lenis;
    function raf(t){lenis.raf(t);requestAnimationFrame(raf);}
    requestAnimationFrame(raf);
  }

  /* ---- Scroll-reveal ---- */
  (function(){
    const els=[...document.querySelectorAll(".reveal")];
    const ro=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){
      e.target.classList.add("in");ro.unobserve(e.target);}});},
      {threshold:.06,rootMargin:"0px 0px -6% 0px"});
    els.forEach(el=>ro.observe(el));
  })();

  /* ---- preloader + hero intro (compositor CSS) ---- */
  (function(){
    const pl=document.getElementById("preloader");
    const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.classList.add("preloading");
    if(!reduce){
      const h1=document.querySelector(".fhero h1");
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
      document.body.classList.add("hero-in");
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
    function ready(){const wait=Math.max(0,1700-(performance.now()-startT));setTimeout(exit,wait);}
    if(document.readyState==="complete")ready();
    else window.addEventListener("load",ready,{once:true});
    setTimeout(()=>{if(!ended)exit();},4500);
  })();

  /* ---- custom cursor ---- */
  (function(){
    if(!matchMedia("(hover:hover) and (pointer:fine)").matches)return;
    document.documentElement.classList.add("has-cursor");
    const cur=document.createElement("div");cur.className="cursor hidden";document.body.appendChild(cur);
    document.querySelectorAll(".lets-card").forEach(e=>e.dataset.lum="0.08");
    function rgbLum(s){const m=s.match(/[\d.]+/g);if(!m||m.length<3)return null;if(m.length>=4&&parseFloat(m[3])<0.35)return null;return (0.2126*+m[0]+0.7152*+m[1]+0.0722*+m[2])/255;}
    function lumAt(x,y){let node=document.elementFromPoint(x,y);while(node&&node.dataset){if(node.dataset.lum!=null)return parseFloat(node.dataset.lum);const bl=rgbLum(getComputedStyle(node).backgroundColor);if(bl!=null)return bl;node=node.parentElement;}return 1;}
    function ctxLum(el){let node=el;while(node&&node.dataset){if(node.dataset.lum!=null)return parseFloat(node.dataset.lum);const bl=rgbLum(getComputedStyle(node).backgroundColor);if(bl!=null)return bl;node=node.parentElement;}return 1;}
    function setInv(x,y){cur.classList.toggle("inv",lumAt(x,y)<0.55);}
    let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my,seen=false,morphEl=null;
    addEventListener("mousemove",e=>{mx=e.clientX;my=e.clientY;if(!seen){seen=true;cx=mx;cy=my;cur.classList.remove("hidden");}if(!morphEl)setInv(mx,my);},{passive:true});
    addEventListener("mouseleave",()=>cur.classList.add("hidden"));
    (function tick(){
      let tx=mx,ty=my;
      if(morphEl){const r=morphEl.getBoundingClientRect();tx=r.left+r.width/2;ty=r.top+r.height/2;cur.style.width=(r.width+14)+"px";cur.style.height=(r.height+14)+"px";}
      cx+=(tx-cx)*0.22;cy+=(ty-cy)*0.22;
      cur.style.transform="translate("+cx+"px,"+cy+"px) translate(-50%,-50%)";
      requestAnimationFrame(tick);
    })();
    const hot="nav .mail,.c-email,.c-link,.lets-nav a,.lets-social a,.lets-card .email,.m-close,.m-slink";
    document.querySelectorAll(hot).forEach(el=>{
      el.addEventListener("mouseenter",()=>{morphEl=el;cur.classList.add("morph");
        const br=parseFloat(getComputedStyle(el).borderRadius)||8;
        cur.style.borderRadius=Math.min(br+7,40)+"px";cur.classList.toggle("inv",ctxLum(el)<0.55);});
      el.addEventListener("mouseleave",()=>{morphEl=null;cur.classList.remove("morph");cur.style.width="";cur.style.height="";cur.style.borderRadius="";});
    });
  })();

  /* ---- nav magnetic sliding highlight ---- */
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
    document.querySelectorAll(".menu").forEach(btn=>{
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
    ov.querySelectorAll("a").forEach(a=>{a.addEventListener("click",()=>setOpen(false));});
  })();