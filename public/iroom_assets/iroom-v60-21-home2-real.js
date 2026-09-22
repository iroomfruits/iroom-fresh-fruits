/* IROOM HOME2 V60.21 — REAL PHOTO LAYER */
(()=>{
  if(!document.body.classList.contains('home2-mode'))return;
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const U=(id,w=1200)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=82`;
  const P={
    apple:U('photo-1593723563143-6cd13ebde03b'),
    grape:U('photo-1595938688117-8af7b8da9fca'),
    pear:U('photo-1695654673328-8b676a9e6545'),
    peach:U('photo-1692071096134-4e5e0a85bef0'),
    persimmon:U('photo-1762980623062-37264ca56f04'),
    orange:U('photo-1706295234704-c5783a4cbe63'),
    cherry:U('photo-1633338380828-527956cb6efc'),
    strawberry:U('photo-1750515513407-b47eea213a7f'),
    market:U('photo-1762474453560-5cf30f20bc8e',1600),
    gift:U('photo-1773450970959-cef81e9b1053',1600),
    orchard:U('photo-1518567283970-1be575199348',1600),
    mixed:U('photo-1772384406941-68ec1f568de5',1800),
    melon:U('photo-1563288525-8f1ee0f874a8'),
    chestnut:U('photo-1758107957614-67c266119a1d'),
    kiwi:U('photo-1552265129-2ac1a82da59e'),
    pomegranate:U('photo-1574709755755-1699988a9c82')
  };
  const byName=n=>{
    n=String(n||'');
    if(/샤인|청포도|포도/.test(n))return P.grape;
    if(/사과|홍로|부사/.test(n))return P.apple;
    if(/배|나주/.test(n))return P.pear;
    if(/복숭아|자두/.test(n))return P.peach;
    if(/대봉|단감|감/.test(n))return P.persimmon;
    if(/감귤|오렌지|한라봉|레드향/.test(n))return P.orange;
    if(/딸기/.test(n))return P.strawberry;
    if(/체리/.test(n))return P.cherry;
    if(/멜론|참외/.test(n))return P.melon;
    if(/밤/.test(n))return P.chestnut;
    if(/키위/.test(n))return P.kiwi;
    if(/석류/.test(n))return P.pomegranate;
    return P.market;
  };
  const set=(img,src)=>{if(!img||!src)return;if(img.src!==src){img.src=src;img.referrerPolicy='no-referrer';img.decoding='async'}};
  function apply(){
    const slides=$$('[data-h2-slide]');
    if(slides[0])set(slides[0].querySelector('.h2-hero-media>img'),P.mixed);
    if(slides[1]){
      set(slides[1].querySelector('.h2-collage-main img'),P.apple);
      const s=slides[1].querySelectorAll('.h2-collage-side img');set(s[0],P.grape);set(s[1],P.pear);
    }
    if(slides[2])set(slides[2].querySelector('.h2-hero-media>img'),P.gift);

    const cats={'사과':P.apple,'샤인머스캣':P.grape,'제주감귤':P.orange,'복숭아':P.peach,'배':P.pear,'딸기':P.strawberry,'멜론':P.melon};
    $$('.h2-category-strip button[data-fruit]').forEach(b=>set(b.querySelector('img'),cats[b.dataset.fruit]||byName(b.dataset.fruit)));

    $$('#todayGrid [data-card-fruit]').forEach(card=>set(card.querySelector('img'),byName(card.dataset.cardFruit||card.dataset.cardDisplay)));
    $$('#seasonalGrid [data-card-fruit]').forEach(card=>set(card.querySelector('img'),byName(card.dataset.cardFruit||card.dataset.cardDisplay)));

    set($('#curationArt'),P.orchard);set($('#giftArt'),P.gift);
    const guide=$('.service-card.guide img');if(guide)set(guide,P.melon);

    const reviewPicks=[P.apple,P.grape,P.orange,P.strawberry];
    $$('#reviewGrid .review-card img').forEach((img,i)=>set(img,reviewPicks[i%reviewPicks.length]));
  }
  let t=0; const queue=()=>{clearTimeout(t);t=setTimeout(apply,30)};
  ['todayGrid','seasonalGrid','reviewGrid'].forEach(id=>{const el=document.getElementById(id);if(el&&window.MutationObserver)new MutationObserver(queue).observe(el,{childList:true,subtree:true})});
  window.addEventListener('load',()=>{apply();setTimeout(apply,180);setTimeout(apply,750)});
  apply();
})();
