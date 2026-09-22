(()=>{
  if(!document.body.classList.contains('home2-mode'))return;
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const slider=$('[data-home2-hero-slider]');
  if(slider){
    const slides=$$('[data-h2-slide]',slider),dots=$$('[data-h2-dot]',slider),current=$('[data-h2-current]',slider);
    let index=0,timer=0,startX=null;
    const reduce=matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const show=(n,user=false)=>{
      if(!slides.length)return; index=(n+slides.length)%slides.length;
      slides.forEach((s,i)=>{const on=i===index;s.classList.toggle('is-active',on);s.setAttribute('aria-hidden',on?'false':'true')});
      dots.forEach((d,i)=>d.classList.toggle('is-active',i===index)); if(current)current.textContent=String(index+1).padStart(2,'0');
      if(user)restart();
    };
    const stop=()=>{if(timer){clearInterval(timer);timer=0}};
    const start=()=>{if(reduce||slides.length<2)return;stop();timer=setInterval(()=>show(index+1),5600)};
    const restart=()=>{stop();setTimeout(start,120)};
    $('[data-h2-prev]',slider)?.addEventListener('click',()=>show(index-1,true));
    $('[data-h2-next]',slider)?.addEventListener('click',()=>show(index+1,true));
    dots.forEach((d,i)=>d.addEventListener('click',()=>show(i,true)));
    slider.addEventListener('pointerenter',stop);slider.addEventListener('pointerleave',start);
    slider.addEventListener('touchstart',e=>{startX=e.touches?.[0]?.clientX??null},{passive:true});
    slider.addEventListener('touchend',e=>{if(startX==null)return;const dx=(e.changedTouches?.[0]?.clientX??startX)-startX;startX=null;if(Math.abs(dx)>42)show(index+(dx<0?1:-1),true)},{passive:true});
    document.addEventListener('visibilitychange',()=>document.hidden?stop():start()); show(0);start();
  }
  $$('[data-h2-carousel-prev],[data-h2-carousel-next]').forEach(btn=>btn.addEventListener('click',()=>{
    const sel=btn.getAttribute(btn.hasAttribute('data-h2-carousel-prev')?'data-h2-carousel-prev':'data-h2-carousel-next');
    const rail=$(sel);if(!rail)return;const card=rail.firstElementChild;const amount=(card?.getBoundingClientRect().width||280)+16;rail.scrollBy({left:btn.hasAttribute('data-h2-carousel-prev')?-amount:amount,behavior:'smooth'});
  }));
  const restyle=()=>{
    const t=$('[data-premium-title]'),p=$('[data-premium-copy]'),b=$('[data-premium-button]');
    if(t)t.textContent='이룸 시그니처 셀렉션';if(p)p.textContent='산지와 품질, 당일 상태를 한 번 더 살펴 고른 프리미엄 과일입니다.';if(b)b.textContent='프리미엄 전체보기';
    const st=$('[data-seasonal-title]'),sp=$('[data-seasonal-copy]');if(st)st.textContent='지금, 가장 맛있는 제철 과일';if(sp&&!sp.textContent.includes('계절이 선택'))sp.textContent='계절이 선택하는 가장 맛있는 순간. 오늘의 제철 과일을 만나보세요.';
  };
  setTimeout(restyle,120);const app=$('#iroomApp');if(app&&'MutationObserver'in window)new MutationObserver(restyle).observe(app,{attributes:true,attributeFilter:['data-season']});

  // V60.19: never leave a blank image card. If an optional image path is missing,
  // use a verified fruit image already shipped with Home1.
  const imageFallback=(img)=>{
    if(!img||img.dataset.imgFallbackBound)return;
    img.dataset.imgFallbackBound='1';
    img.addEventListener('error',()=>{
      if(img.dataset.imgFailed==='1')return;
      img.dataset.imgFailed='1';
      const alt=(img.alt||'').toLowerCase();
      let fallback='./iroom_assets/fruits/09_사과_apple.png';
      if(alt.includes('배'))fallback='./iroom_assets/fruits/10_배_pear.png';
      else if(alt.includes('샤인')||alt.includes('포도'))fallback='./iroom_assets/fruits/12_샤인머스캣_shine_muscat.png';
      else if(alt.includes('감')||alt.includes('대봉'))fallback='./iroom_assets/fruits/11_감_persimmon.png';
      else if(alt.includes('복숭아'))fallback='./iroom_assets/fruits/06_복숭아_peach.png';
      else if(alt.includes('감귤')||alt.includes('오렌지'))fallback='./iroom_assets/fruits/21_오렌지_orange.png';
      img.src=fallback;
    },{once:false});
  };
  const bindImageFallbacks=()=>$$('img',document).forEach(imageFallback);
  bindImageFallbacks();
  if('MutationObserver' in window)new MutationObserver(bindImageFallbacks).observe(document.body,{childList:true,subtree:true});

  // If an old saved homepage config contains an empty section array, the shared
  // renderer may clear a rail. Restore the static cards from this HTML snapshot.
  const railSnapshots={};['todayGrid','premiumGrid','seasonalGrid','libraryGrid'].forEach(id=>{const el=document.getElementById(id);if(el)railSnapshots[id]=el.innerHTML});
  const restoreEmptyRails=()=>Object.entries(railSnapshots).forEach(([id,markup])=>{const el=document.getElementById(id);if(el&&!el.children.length&&markup){el.innerHTML=markup;bindImageFallbacks();}});
  setTimeout(restoreEmptyRails,250);setTimeout(restoreEmptyRails,900);setTimeout(restoreEmptyRails,1800);
})();
