/* IROOM HOME2 V60.23 — ALL STILL-LIFE LUXURY LAYER */
(()=>{
  if(!document.body.classList.contains('home2-mode')) return;
  document.body.classList.add('home2-stilllife');
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const A='./iroom_assets/stilllife/';
  const seasons=['spring','summer','autumn','winter'];
  const currentSeason=()=>{
    const s=$('#iroomApp')?.dataset?.season;
    if(seasons.includes(s)) return s;
    const m=new Date().getMonth()+1;
    return m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'autumn':'winter';
  };
  const indexMap={
    spring:{'딸기':1,'금실딸기':1,'참외':2,'성주참외':2,'체리':3,'샤인머스캣':4},
    summer:{'복숭아':1,'백도복숭아':1,'샤인머스캣':2,'멜론':3,'머스크멜론':3,'포도':4,'거봉':4},
    autumn:{'사과':1,'홍로사과':1,'이지플':1,'부사':1,'배':2,'나주배':2,'샤인머스캣':3,'대봉':4,'단감':4,'감':4},
    winter:{'감귤':1,'제주감귤':1,'오렌지':1,'한라봉':2,'레드향':2,'딸기':3,'금실딸기':3,'사과':4,'부사':4}
  };
  const exact={
    '사과':'fruit_apple.webp','홍로사과':'fruit_apple.webp','이지플':'fruit_apple.webp','부사':'fruit_apple.webp',
    '배':'fruit_pear.webp','나주배':'fruit_pear.webp',
    '샤인머스캣':'fruit_shine.webp','포도':'fruit_grape.webp','거봉':'fruit_grape.webp',
    '대봉':'fruit_persimmon.webp','단감':'fruit_persimmon.webp','감':'fruit_persimmon.webp',
    '밤':'fruit_chestnut.webp','키위':'fruit_kiwi.webp','석류':'fruit_pomegranate.webp',
    '복숭아':'fruit_peach.webp','백도복숭아':'fruit_peach.webp','딸기':'fruit_strawberry.webp','금실딸기':'fruit_strawberry.webp'
  };
  const set=(img,src)=>{if(!img||!src)return; if((img.getAttribute('src')||'')!==src){img.src=src;img.removeAttribute('referrerpolicy');img.decoding='async';}};
  const stageFor=(name,season=currentSeason(),fallback=1)=>{
    name=String(name||'').replace(/\s+/g,'');
    for(const [k,file] of Object.entries(exact)) if(name.includes(k)) return A+file;
    const map=indexMap[season]||{};
    for(const [k,i] of Object.entries(map)) if(name.includes(k)) return A+season+'_'+String(i).padStart(2,'0')+'.webp';
    return A+season+'_'+String(fallback).padStart(2,'0')+'.webp';
  };
  function applyStillLife(){
    const season=currentSeason();
    $$('.h2-hero-slide').forEach((slide,i)=>set($('img',slide),A+`hero_${season}_${String(i+1).padStart(2,'0')}.webp`));
    $$('.h2-category-strip button[data-fruit]').forEach((b,i)=>set($('img',b),stageFor(b.dataset.fruit,season,(i%4)+1)));
    $$('#todayGrid [data-card-fruit]').forEach((card,i)=>set($('img',card),stageFor(card.dataset.cardFruit||card.dataset.cardDisplay,season,(i%4)+1)));
    const gifts=$$('#home2GiftGrid .home2-gift-card img'); gifts.forEach((img,i)=>set(img,A+`gift_0${(i%3)+1}.webp`));
    const services=$$('.h2-service-grid .service-card img'); services.forEach((img,i)=>set(img,A+`service_0${(i%3)+1}.webp`));
    $$('#seasonalGrid [data-card-fruit]').forEach((card,i)=>set($('img',card),stageFor(card.dataset.cardFruit||card.dataset.cardDisplay,season,(i%4)+1)));
    $$('#reviewGrid .review-card img').forEach((img,i)=>set(img,A+season+'_'+String((i%4)+1).padStart(2,'0')+'.webp'));
  }
  let t=0; const queue=()=>{clearTimeout(t);t=setTimeout(applyStillLife,60)};
  ['todayGrid','home2GiftGrid','seasonalGrid','reviewGrid'].forEach(id=>{const el=document.getElementById(id); if(el&&window.MutationObserver)new MutationObserver(queue).observe(el,{childList:true,subtree:true});});
  const app=$('#iroomApp'); if(app&&window.MutationObserver)new MutationObserver(queue).observe(app,{attributes:true,attributeFilter:['data-season']});
  window.addEventListener('load',()=>{applyStillLife();setTimeout(applyStillLife,220);setTimeout(applyStillLife,900)});
  applyStillLife();
})();
