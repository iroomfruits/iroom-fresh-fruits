(()=>{
  if(!document.body.classList.contains('home2-mode'))return;
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const root=$('#iroomApp');
  const seasonName={spring:'봄',summer:'여름',autumn:'가을',winter:'겨울'};
  const currentSeason=()=>root?.dataset?.season||'autumn';

  const seasonalMedia={
    spring:{
      collage:['premium_editorial/spring_01_strawberry.jpg','premium_editorial/spring_02_korean_melon.jpg','premium_editorial/spring_04_shine.jpg'],
      gift:'premium_box_v53/spring_01.webp',
      today:{'딸기':'premium_editorial/spring_01_strawberry.jpg','금실딸기':'premium_editorial/spring_01_strawberry.jpg','성주참외':'premium_editorial/spring_02_korean_melon.jpg','참외':'premium_editorial/spring_02_korean_melon.jpg','대저토마토':'premium_editorial/spring_03_tomato.jpg','토마토':'premium_editorial/spring_03_tomato.jpg','샤인머스캣':'premium_editorial/spring_04_shine.jpg','프리미엄 샤인머스캣':'premium_editorial/spring_04_shine.jpg'},
      seasonal:{'딸기':'premium_editorial/spring_01_strawberry.jpg','참외':'premium_editorial/spring_02_korean_melon.jpg','토마토':'premium_editorial/spring_03_tomato.jpg','샤인머스캣':'premium_editorial/spring_04_shine.jpg'}
    },
    summer:{
      collage:['premium_editorial/summer_01_peach.jpg','premium_editorial/summer_02_watermelon.jpg','premium_editorial/summer_03_shine.jpg'],
      gift:'premium_box_v53/summer_01.webp',
      today:{'복숭아':'premium_editorial/summer_01_peach.jpg','백도복숭아':'premium_editorial/summer_01_peach.jpg','고당도수박':'premium_editorial/summer_02_watermelon.jpg','수박':'premium_editorial/summer_02_watermelon.jpg','샤인머스캣':'premium_editorial/summer_03_shine.jpg','머스크멜론':'premium_editorial/summer_04_melon.jpg','멜론':'premium_editorial/summer_04_melon.jpg'},
      seasonal:{'복숭아':'premium_editorial/summer_01_peach.jpg','수박':'premium_editorial/summer_02_watermelon.jpg','샤인머스캣':'premium_editorial/summer_03_shine.jpg','멜론':'premium_editorial/summer_04_melon.jpg'}
    },
    autumn:{
      collage:['luxury_photos/autumn_apple.webp','luxury_photos/autumn_shine.webp','luxury_photos/autumn_pear.webp'],
      gift:'premium_box_v53/autumn_01.webp',
      today:{'홍로사과':'luxury_photos/autumn_apple.webp','사과':'luxury_photos/autumn_apple.webp','나주배':'luxury_photos/autumn_pear.webp','배':'luxury_photos/autumn_pear.webp','샤인머스캣':'luxury_photos/autumn_shine.webp','프리미엄 샤인머스캣':'luxury_photos/autumn_shine.webp','대봉':'luxury_photos/season_persimmon.webp','감':'luxury_photos/season_persimmon.webp','복숭아':'luxury_photos/autumn_peach.webp'},
      seasonal:{'제주감귤':'luxury_photos/season_mandarin.webp','오렌지':'luxury_photos/season_mandarin.webp','딸기':'luxury_photos/season_strawberry.webp','포도':'luxury_photos/season_grape.webp','샤인머스캣':'luxury_photos/autumn_shine.webp','한라봉':'luxury_photos/season_hallabong.webp','체리':'luxury_photos/season_cherry.webp','대봉':'luxury_photos/season_persimmon.webp','감':'luxury_photos/season_persimmon.webp'}
    },
    winter:{
      collage:['premium_editorial/winter_01_mandarin.jpg','premium_editorial/winter_03_strawberry.jpg','premium_editorial/winter_04_apple.jpg'],
      gift:'premium_box_v53/winter_01.webp',
      today:{'제주감귤':'premium_editorial/winter_01_mandarin.jpg','한라봉':'premium_editorial/winter_02_hallabong.jpg','금실딸기':'premium_editorial/winter_03_strawberry.jpg','딸기':'premium_editorial/winter_03_strawberry.jpg','부사사과':'premium_editorial/winter_04_apple.jpg','사과':'premium_editorial/winter_04_apple.jpg'},
      seasonal:{'제주감귤':'premium_editorial/winter_01_mandarin.jpg','한라봉':'premium_editorial/winter_02_hallabong.jpg','딸기':'premium_editorial/winter_03_strawberry.jpg','사과':'premium_editorial/winter_04_apple.jpg'}
    }
  };
  const A='./iroom_assets/';
  const safeSrc=p=>p?(p.startsWith('http')||p.startsWith('data:')||p.startsWith('/')?p:A+p):'';

  // Luxury hero slider
  const slider=$('[data-home2-hero-slider]');
  if(slider){
    const slides=$$('[data-h2-slide]',slider),dots=$$('[data-h2-dot]',slider),current=$('[data-h2-current]',slider);
    let idx=0,timer=0,startX=null;
    const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const stop=()=>{if(timer){clearInterval(timer);timer=0}};
    const start=()=>{if(reduce||slides.length<2)return;stop();timer=setInterval(()=>show(idx+1),6200)};
    const show=(n,user=false)=>{
      if(!slides.length)return;
      idx=(n+slides.length)%slides.length;
      slides.forEach((s,i)=>{const on=i===idx;s.classList.toggle('is-active',on);s.setAttribute('aria-hidden',on?'false':'true')});
      dots.forEach((d,i)=>d.classList.toggle('is-active',i===idx));
      if(current)current.textContent=String(idx+1).padStart(2,'0');
      if(user){stop();setTimeout(start,150)}
    };
    $('[data-h2-prev]',slider)?.addEventListener('click',()=>show(idx-1,true));
    $('[data-h2-next]',slider)?.addEventListener('click',()=>show(idx+1,true));
    dots.forEach((d,i)=>d.addEventListener('click',()=>show(i,true)));
    slider.addEventListener('pointerenter',stop); slider.addEventListener('pointerleave',start);
    slider.addEventListener('touchstart',e=>{startX=e.touches?.[0]?.clientX??null},{passive:true});
    slider.addEventListener('touchend',e=>{if(startX==null)return;const x=e.changedTouches?.[0]?.clientX??startX,dx=x-startX;startX=null;if(Math.abs(dx)>42)show(idx+(dx<0?1:-1),true)},{passive:true});
    document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
    show(0); start();
  }

  // Mobile navigation (kept independent from old dual-home scripts).
  const menu=$('[data-home2-mobile-nav]'),menuBtn=$('[data-home2-menu]');
  const closeMenu=()=>{if(!menu)return;menu.hidden=true;menuBtn?.setAttribute('aria-expanded','false');document.body.style.overflow=''};
  const openMenu=()=>{if(!menu)return;menu.hidden=false;menuBtn?.setAttribute('aria-expanded','true');document.body.style.overflow='hidden'};
  menuBtn?.addEventListener('click',()=>menu?.hidden?openMenu():closeMenu());
  $('[data-home2-menu-close]')?.addEventListener('click',closeMenu);
  menu?.addEventListener('click',e=>{if(e.target===menu)closeMenu();else if(e.target.closest('button'))setTimeout(closeMenu,40)});
  window.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});

  // Carousel arrows, even though mobile also supports native horizontal swipe.
  $$('[data-h2-carousel-prev],[data-h2-carousel-next]').forEach(btn=>btn.addEventListener('click',()=>{
    const isPrev=btn.hasAttribute('data-h2-carousel-prev');
    const sel=btn.getAttribute(isPrev?'data-h2-carousel-prev':'data-h2-carousel-next');
    const rail=$(sel);if(!rail)return;
    const card=rail.firstElementChild;
    const amount=(card?.getBoundingClientRect().width||250)+10;
    rail.scrollBy({left:isPrev?-amount:amount,behavior:'smooth'});
  }));

  function setImg(img,path){
    if(!img||!path)return;
    const src=safeSrc(path);
    if(img.getAttribute('src')!==src)img.setAttribute('src',src);
  }
  function cardName(card){return card?.dataset?.cardFruit||card?.dataset?.cardDisplay||card?.querySelector('h3,b')?.textContent?.trim()||''}
  function baseName(name=''){
    return String(name).replace(/^프리미엄\s*/,'').replace(/^명품\s*/,'').replace(/\s*세트$/,'').trim();
  }
  function choosePhoto(map,name){
    const n=baseName(name);
    if(map[name])return map[name]; if(map[n])return map[n];
    for(const [k,v] of Object.entries(map)){if(name.includes(k)||n.includes(k))return v}
    return '';
  }

  function applyLuxuryContent(){
    const season=currentSeason();
    const data=seasonalMedia[season]||seasonalMedia.autumn;
    const label=seasonName[season]||'계절';

    // Titles: keep the luxury house identity regardless of shared season renderer.
    const assign=(sel,txt)=>{const el=$(sel);if(el&&el.textContent!==txt)el.textContent=txt};
    assign('[data-today-title]','오늘 이룸이 고른 프리미엄 셀렉션');
    assign('[data-today-copy]',`지금 가장 맛있는 ${label} 과일을 이룸의 기준으로 직접 선별해 담았습니다.`);
    assign('[data-premium-title]','마음을 전하는 프리미엄 선물');
    assign('[data-premium-copy]','감사와 축하, 부모님과 거래처 선물까지. 받는 분과 예산에 맞춰 정성스럽게 제안합니다.');
    assign('[data-premium-button]','선물세트 전체보기');
    assign('[data-seasonal-title]','오늘 더 만나볼 과일');
    assign('[data-seasonal-copy]',`${label}의 맛을 더 다양하게, 오늘 좋은 상태의 과일을 만나보세요.`);
    assign('[data-seasonal-button]','전체보기');

    const premiumEye=$('.lux-premium .eyebrow'); if(premiumEye)premiumEye.textContent='PREMIUM GIFT';
    const seasonalEye=$('.lux-seasonal .eyebrow'); if(seasonalEye)seasonalEye.textContent='SEASONAL TABLE';

    // Hero seasonal editorial/gift panels.
    const cmain=$('.h2-photo-collage .h2-collage-main img');
    const csides=$$('.h2-photo-collage .h2-collage-side img');
    if(data.collage?.[0])setImg(cmain,data.collage[0]);
    if(data.collage?.[1])setImg(csides[0],data.collage[1]);
    if(data.collage?.[2])setImg(csides[1],data.collage[2]);
    setImg($('.h2-media-gift>img'),data.gift);

    // Today cards: luxury photography where we have a matching photo.
    $$('#todayGrid .today-card').forEach(card=>{
      const p=choosePhoto(data.today,cardName(card));
      if(p)setImg($('img',card),p);
    });
    // Seasonal cards: photo if available, otherwise keep shared product visual.
    $$('#seasonalGrid .product-card').forEach(card=>{
      const p=choosePhoto(data.seasonal,cardName(card));
      if(p)setImg($('img',card),p);
    });

    // Service art is already season-aware in the shared engine. Autumn gets the approved luxury mock crops.
    if(season==='autumn'){
      setImg($('#curationArt'),'luxury_photos/service_curation.webp');
      setImg($('#giftArt'),'luxury_photos/service_gift.webp');
      const guide=$('.service-card.guide');
      if(guide&&!guide.querySelector('img')){
        const img=document.createElement('img');img.alt='이룸 제철 가이드';img.loading='lazy';img.decoding='async';img.src=safeSrc('luxury_photos/service_guide.webp');guide.prepend(img);
      }else if(guide?.querySelector('img'))setImg(guide.querySelector('img'),'luxury_photos/service_guide.webp');
    }

    // Keep image failures graceful and compact.
    $$('img').forEach(img=>{
      if(img.dataset.luxFallbackBound)return;img.dataset.luxFallbackBound='1';
      img.addEventListener('error',()=>{
        if(img.dataset.luxFailed)return;img.dataset.luxFailed='1';
        const alt=(img.alt||'');
        let f='fruits/09_사과_apple.png';
        if(alt.includes('배'))f='fruits/10_배_pear.png';
        else if(alt.includes('포도')||alt.includes('샤인'))f='fruits/12_샤인머스캣_shine_muscat.png';
        else if(alt.includes('딸기'))f='fruits/01_딸기_strawberry.png';
        else if(alt.includes('복숭아'))f='fruits/06_복숭아_peach.png';
        else if(alt.includes('감'))f='fruits/11_감_persimmon.png';
        img.src=safeSrc(f);
      });
    });
  }

  // The shared app may repaint cards after product/config API responses; keep the luxury layer on top.
  let luxuryTimer=0;
  const queueLuxury=()=>{clearTimeout(luxuryTimer);luxuryTimer=setTimeout(applyLuxuryContent,30)};
  ['todayGrid','premiumGrid','seasonalGrid','reviewGrid'].forEach(id=>{
    const el=document.getElementById(id);if(el&&'MutationObserver'in window)new MutationObserver(queueLuxury).observe(el,{childList:true,subtree:true});
  });
  if(root&&'MutationObserver'in window)new MutationObserver(queueLuxury).observe(root,{attributes:true,attributeFilter:['data-season']});
  window.addEventListener('load',()=>{applyLuxuryContent();setTimeout(applyLuxuryContent,220);setTimeout(applyLuxuryContent,900)});
  applyLuxuryContent();
})();
