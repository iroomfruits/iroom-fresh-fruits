/* IROOM HOME2 V60.25 — STILL-LIFE GALLERY CURATION */
(()=>{
  if(!document.body.classList.contains('home2-mode')) return;
  document.body.classList.add('home2-gallery-luxury');
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const A='./iroom_assets/stilllife25/';
  const norm=v=>String(v||'').replace(/\s+/g,'');
  const imageFor=name=>{
    const n=norm(name);
    if(/이지플|사과|부사|홍로/.test(n)) return A+'card_apple.webp';
    if(/나주배|배/.test(n)) return A+'card_pear.webp';
    if(/샤인머스캣/.test(n)) return A+'card_shine.webp';
    if(/포도|거봉/.test(n)) return A+'card_grape.webp';
    if(/대봉|단감|감/.test(n)) return A+'card_persimmon.webp';
    if(/석류/.test(n)) return A+'card_pomegranate.webp';
    if(/밤/.test(n)) return A+'card_chestnut.webp';
    if(/키위/.test(n)) return A+'card_kiwi.webp';
    if(/무화과/.test(n)) return A+'card_fig.webp';
    if(/복숭아/.test(n)) return A+'card_peach.webp';
    if(/딸기/.test(n)) return A+'card_strawberry.webp';
    if(/멜론/.test(n)) return A+'card_melon.webp';
    if(/감귤|오렌지|한라봉|레드향/.test(n)) return A+'card_citrus.webp';
    return A+'hero_01.webp';
  };
  const set=(img,src)=>{if(!img||!src)return;if(img.getAttribute('src')!==src){img.src=src;img.decoding='async';img.removeAttribute('referrerpolicy')}};
  function reorder(grid, preferred, limit){
    if(!grid) return;
    const cards=[...grid.children].filter(el=>el.matches('article'));
    cards.forEach(c=>c.classList.remove('home2-curation-hidden'));
    const chosen=[];
    preferred.forEach(key=>{
      const c=cards.find(x=>!chosen.includes(x)&&norm(x.dataset.cardDisplay||x.dataset.cardFruit||x.textContent).includes(norm(key)));
      if(c) chosen.push(c);
    });
    for(const c of cards){if(chosen.length>=limit)break;if(!chosen.includes(c))chosen.push(c)}
    chosen.forEach(c=>grid.appendChild(c));
    [...grid.children].filter(el=>el.matches('article')).forEach((c,i)=>c.classList.toggle('home2-curation-hidden',i>=limit));
  }
  function apply(){
    const heroes=$$('.h2-hero-slide .h2-hero-media img');
    ['hero_01.webp','hero_02.webp','hero_03.webp'].forEach((f,i)=>set(heroes[i],A+f));
    $$('.h2-category-strip button[data-fruit]').forEach(b=>set($('img',b),imageFor(b.dataset.fruit)));
    reorder($('#todayGrid'),['이지플','나주배','샤인머스캣','대봉'],4);
    $$('#todayGrid article').forEach(c=>set($('img',c),imageFor(c.dataset.cardDisplay||c.dataset.cardFruit||$('h3',c)?.textContent)));
    const gifts=$$('#home2GiftGrid .home2-gift-card img');['gift_01.webp','gift_02.webp','gift_03.webp'].forEach((f,i)=>set(gifts[i],A+f));
    const services=$$('.h2-service-grid .service-card img');['service_01.webp','service_02.webp','service_03.webp'].forEach((f,i)=>set(services[i],A+f));
    reorder($('#seasonalGrid'),['포도','밤','키위','석류'],4);
    $$('#seasonalGrid article').forEach(c=>set($('img',c),imageFor(c.dataset.cardDisplay||c.dataset.cardFruit||$('h3',c)?.textContent)));
    $$('#reviewGrid .review-card img').forEach((img,i)=>set(img,A+(i%2?'card_shine.webp':'card_apple.webp')));
  }
  let timer=0;const queue=()=>{clearTimeout(timer);timer=setTimeout(apply,80)};
  ['todayGrid','home2GiftGrid','seasonalGrid','reviewGrid'].forEach(id=>{const el=document.getElementById(id);if(el&&window.MutationObserver)new MutationObserver(queue).observe(el,{childList:true,subtree:true})});
  window.addEventListener('load',()=>{apply();setTimeout(apply,260);setTimeout(apply,1000)});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)queue()});
  apply();
})();
