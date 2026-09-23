/* IROOM HOME2 V60.22 — ATELIER LOCAL REAL PHOTO LAYER */
(()=>{
  if(!document.body.classList.contains('home2-mode'))return;
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const A='./iroom_assets/luxury_photos/';
  const P={
    apple:A+'autumn_apple.webp',
    pear:A+'autumn_pear.webp',
    grape:A+'autumn_shine.webp',
    peach:A+'autumn_peach.webp',
    persimmon:A+'season_persimmon.webp',
    orange:A+'season_mandarin.webp',
    strawberry:A+'season_strawberry.webp',
    cherry:A+'season_cherry.webp',
    purpleGrape:A+'season_grape.webp',
    hallabong:A+'season_hallabong.webp',
    melon:A+'gift_melon.webp',
    mixed:A+'gift_mix.webp',
    berryGift:A+'gift_strawberry.webp'
  };
  const mapName=name=>{
    const n=String(name||'');
    if(/샤인/.test(n))return P.grape;
    if(/포도/.test(n))return P.purpleGrape;
    if(/사과|홍로|부사/.test(n))return P.apple;
    if(/배|나주/.test(n))return P.pear;
    if(/복숭아|자두/.test(n))return P.peach;
    if(/대봉|단감|감/.test(n))return P.persimmon;
    if(/감귤|오렌지/.test(n))return P.orange;
    if(/한라봉|레드향/.test(n))return P.hallabong;
    if(/딸기/.test(n))return P.strawberry;
    if(/체리/.test(n))return P.cherry;
    if(/멜론|참외/.test(n))return P.melon;
    return null;
  };
  const set=(img,src)=>{if(!img||!src)return; if((img.getAttribute('src')||'')!==src){img.setAttribute('src',src);img.removeAttribute('referrerpolicy');img.decoding='async'}};
  function applyAtelier(){
    // quick category: always local real-photo crops
    const cats={'사과':P.apple,'샤인머스캣':P.grape,'제주감귤':P.orange,'복숭아':P.peach,'배':P.pear,'딸기':P.strawberry,'멜론':P.melon};
    $$('.h2-category-strip button[data-fruit]').forEach(b=>set($('img',b),cats[b.dataset.fruit]||mapName(b.dataset.fruit)));

    // today products: exact local actual-photo crops where available
    $$('#todayGrid [data-card-fruit]').forEach(card=>{const src=mapName(card.dataset.cardFruit||card.dataset.cardDisplay); if(src)set($('img',card),src)});

    // gift curation — visually consistent, no Home1 premium artwork
    const gifts=$$('#home2GiftGrid .home2-gift-card img');
    set(gifts[0],P.mixed); set(gifts[1],P.melon); set(gifts[2],P.berryGift);

    // service cards — use clean fruit photographs, never the old baked-text service crops
    set($('#curationArt'),P.orange); set($('#giftArt'),P.mixed); const guide=$('.service-card.guide img'); set(guide,P.melon);

    // seasonal: local exact matches only; leave unmatched remote real photos intact
    $$('#seasonalGrid [data-card-fruit]').forEach(card=>{const src=mapName(card.dataset.cardFruit||card.dataset.cardDisplay); if(src)set($('img',card),src)});

    // reviews, if available, use the same atelier family
    const review=[P.apple,P.grape,P.pear,P.orange];
    $$('#reviewGrid .review-card img').forEach((img,i)=>set(img,review[i%review.length]));
  }
  let timer=0; const queue=()=>{clearTimeout(timer);timer=setTimeout(applyAtelier,40)};
  ['todayGrid','home2GiftGrid','seasonalGrid','reviewGrid'].forEach(id=>{const el=document.getElementById(id);if(el&&window.MutationObserver)new MutationObserver(queue).observe(el,{childList:true,subtree:true})});
  window.addEventListener('load',()=>{applyAtelier();setTimeout(applyAtelier,180);setTimeout(applyAtelier,800)});
  applyAtelier();
})();
