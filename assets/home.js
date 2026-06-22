const io=new IntersectionObserver((es)=>{es.forEach((e)=>{if(e.isIntersecting){const el=e.target;const i=[...el.parentNode.children].indexOf(el);el.style.transitionDelay=(i*90)+"ms";el.classList.add("in");io.unobserve(el);}});},{threshold:.2});
  document.querySelectorAll(".card").forEach((c)=>io.observe(c));

  /* ---- WHO I WORK WITH: pinned scroll-sequencer ---- */
  (function(){
    const track=document.querySelector(".who-track");if(!track)return;
    const imgs=document.querySelectorAll(".who-bg img");
    const blocks=document.querySelectorAll(".who-block");
    const btns=document.querySelectorAll(".who-index button");
    const counter=document.querySelector(".who-head .c");
    const STEPS=3;let cur=-1,ticking=false;
    const mqWho=window.matchMedia("(max-width:860px)");   /* mobile: tap-to-switch, no scroll-driven steps */
    function apply(s){
      if(s===cur)return;cur=s;
      imgs.forEach(el=>el.classList.toggle("on",+el.dataset.step===s));
      blocks.forEach(el=>el.classList.toggle("on",+el.dataset.step===s));
      btns.forEach(el=>el.classList.toggle("on",+el.dataset.go===s));
      if(counter)counter.textContent="0"+(s+1)+" / 0"+STEPS;
    }
    function onScroll(){
      if(mqWho.matches){return;}   /* mobile: changing a block re-flows height -> scroll math jumps & skips steps; switch via index taps instead */
      const total=track.offsetHeight-window.innerHeight;
      if(total<=0){return;}
      let p=(-track.getBoundingClientRect().top)/total;
      p=Math.max(0,Math.min(0.9999,p));
      apply(Math.min(STEPS-1,Math.floor(p*STEPS)));
    }
    function loop(){onScroll();ticking=false;}
    window.addEventListener("scroll",()=>{if(!ticking){ticking=true;requestAnimationFrame(loop);}},{passive:true});
    window.addEventListener("resize",onScroll);
    btns.forEach(b=>b.addEventListener("click",()=>{
      const s=+b.dataset.go;
      const total=track.offsetHeight-window.innerHeight;
      if(mqWho.matches||total<=0){apply(s);return;}   /* mobile: just switch the block */
      const top=track.getBoundingClientRect().top+window.scrollY;
      window.scrollTo({top:top+((s+0.5)/STEPS)*total,behavior:"smooth"});
    }));
    apply(0);onScroll();
  })();

  /* ---- HOW TO WORK WITH ME: pinned horizontal scroll ---- */
  (function(){
    const track=document.querySelector(".work-track");if(!track)return;
    const rail=document.querySelector(".work-rail");
    const vp=document.querySelector(".work-viewport");
    const fill=document.querySelector(".work-progress span");
    const mq=window.matchMedia("(max-width:860px)");
    let travel=0,ticking=false;
    function measure(){
      if(mq.matches){track.style.height="";rail.style.transform="";if(fill)fill.style.width="";travel=0;return;}
      travel=Math.max(0,rail.scrollWidth-vp.clientWidth);
      track.style.height=(window.innerHeight+travel*1.15)+"px";
    }
    function onScroll(){
      if(mq.matches)return;
      const total=track.offsetHeight-window.innerHeight;
      if(total<=0)return;
      let p=(-track.getBoundingClientRect().top)/total;
      p=Math.max(0,Math.min(1,p));
      rail.style.transform="translate3d("+(-travel*p)+"px,0,0)";
      if(fill)fill.style.width=(p*100)+"%";
    }
    function loop(){onScroll();ticking=false;}
    window.addEventListener("scroll",()=>{if(!ticking){ticking=true;requestAnimationFrame(loop);}},{passive:true});
    window.addEventListener("resize",()=>{measure();onScroll();});
    measure();onScroll();
  })();

  /* ---- Lenis smooth scroll (matteofabbiani-style) ---- */
  if(window.Lenis && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    const lenis=new Lenis({lerp:0.1,smoothWheel:true});window.__lenis=lenis;
    function raf(t){lenis.raf(t);requestAnimationFrame(raf);}
    requestAnimationFrame(raf);
  }

  /* ---- full-info popups (book + philosophy) ---- */
  (function(){
    function setup(btnId, modalId){
      const modal=document.getElementById(modalId); if(!modal)return;
      const btn=document.getElementById(btnId);
      const closeBtn=modal.querySelector('.bmodal-x');
      function open(){ modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('bmodal-open'); if(window.__lenis)window.__lenis.stop(); const sc=modal.querySelector('.bmodal-scroll'); if(sc)sc.scrollTop=0; }
      function close(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.classList.remove('bmodal-open'); if(window.__lenis)window.__lenis.start(); }
      if(btn) btn.addEventListener('click',function(e){ e.preventDefault(); open(); });
      if(closeBtn) closeBtn.addEventListener('click',close);
      modal.addEventListener('click',function(e){ if(e.target===modal) close(); });
      document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&modal.classList.contains('open')) close(); });
    }
    setup('bookBtn','bookModal');
    setup('philoBtn','philoModal');
  })();

  /* ---- Scroll-reveal with stagger ---- */
  (function(){
    const sel=".meet-left>*,.bio-lead,.bio-sub,.sec-tag,.work-head>*,.contact .eyebrow,.contact h2,.contact .reassure,.contact .row,.fwd-card,.ep,.sec-title,.build-head .intro,.bcard,.tile,.book-inner h2,.book-inner .coming,.book-inner p,.sub-card h2,.sub-card .lead,.sub-pill,.lets-top>*,.lets-bottom";
    const els=[...document.querySelectorAll(sel)].filter(el=>!el.closest(".who"));
    els.forEach(el=>el.classList.add("reveal"));
    const ro=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){
      const el=e.target,sibs=[...el.parentNode.children].filter(c=>c.classList.contains("reveal"));
      el.style.transitionDelay=(Math.max(0,sibs.indexOf(el))*80)+"ms";el.classList.add("in");ro.unobserve(el);}});},
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
      const h1=document.querySelector(".hero-top h1");
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
    document.querySelectorAll(".hero-card,.who-stage,.fwd-card,.fwd-platforms,.ep,.sub-card,.lets-card,.wcard-contact").forEach(e=>e.dataset.lum="0.08");
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
    const hot=".ctile,.bcard,nav .mail,.btn-dark,.who-index button,.who-mail,.wcard-contact .email,.wcard-contact .cases,.fwd-card .guest-cta,.fwd-platforms a,.ep .acts a,.sub-pill,.sub-read,.lets-nav a,.lets-social a,.lets-card .email,.m-close,.m-slink,.m-sublink,[data-go]";
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
    document.querySelectorAll(".btn-dark,.menu,.sub-read,.guest-cta,.wcard-contact .cases").forEach(btn=>{
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
    // (browser hash nav + scroll-behavior:smooth + scroll-margin-top), which is
    // reliable here since Lenis is desynced and the page scrolls natively.
    ov.querySelectorAll("a").forEach(a=>{a.addEventListener("click",()=>setOpen(false));});
  })();