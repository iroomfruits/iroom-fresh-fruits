/* IROOM HOME2 V60.27 — LUXURY STILL-LIFE EDITORIAL
   Static, stable, one art direction. No carousel/autoplay/mutation loop. */
(()=>{
  if(!document.body.classList.contains('home2-mode')) return;
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  document.body.classList.add('home2-editorial-mode');

  // Mobile menu independent from older Home2 layers.
  const menuBtn=$('[data-home2-menu]'), menu=$('[data-home2-mobile-nav]'), closeBtn=$('[data-home2-menu-close]');
  const setMenu=open=>{ if(!menu)return; menu.hidden=!open; menuBtn?.setAttribute('aria-expanded',String(open)); document.body.classList.toggle('home2-menu-open',open); };
  menuBtn?.addEventListener('click',()=>setMenu(menu?.hidden!==false));
  closeBtn?.addEventListener('click',()=>setMenu(false));
  menu?.addEventListener('click',e=>{ if(e.target===menu||e.target.closest('button:not([data-home2-menu-close])')) setTimeout(()=>setMenu(false),10); });

  $$('[data-scroll]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.scroll)?.scrollIntoView({behavior:'smooth',block:'start'})));

  const A='./iroom_assets/stilllife27/';
  const picks=[
    {keys:['이지플','홍로사과','경북홍사과','사과'],label:'이지플',image:A+'apple.webp',unit:'3kg',price:'32,000원',copy:'단맛과 산미가 또렷한 가을 사과',micro:'APPLE · AUTUMN'},
    {keys:['나주배','배'],label:'나주배',image:A+'pear.webp',unit:'5kg',price:'38,000원',copy:'시원하고 풍부한 과즙',micro:'PEAR · SELECTED'},
    {keys:['샤인머스캣','샤인머스켓','청포도'],label:'샤인머스캣',image:A+'shine.webp',unit:'2kg',price:'28,100원',copy:'향긋하고 맑은 달콤함',micro:'GRAPE · PREMIUM'}
  ];
  const norm=v=>String(v||'').replace(/\s+/g,'');
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const hiddenName=card=>card?.dataset?.cardDisplay||card?.dataset?.cardFruit||$('h3',card)?.textContent||'';
  function findCard(keys){
    const cards=$$('#todayGrid > article');
    return cards.find(c=>keys.some(k=>norm(hiddenName(c)).includes(norm(k))||norm(k).includes(norm(hiddenName(c)))));
  }
  function readCard(cfg){
    const source=findCard(cfg.keys);
    if(!source) return {...cfg,name:cfg.label,display:cfg.label,visual:cfg.image,state:'당일 상태 확인'};
    const buy=$('[data-buy-now]',source), detail=$('[data-fruit]',source);
    const price=$('.sale-price b',source)?.textContent?.trim()||cfg.price;
    const desc=$('.today-body p',source)?.textContent?.trim()||cfg.copy;
    const configText=$('[data-info-type="config"]',source)?.textContent||'';
    const unit=configText.replace(/^구성\s*·?\s*/,'').trim()||cfg.unit;
    return {
      ...cfg,
      name:buy?.dataset?.name||source.dataset.cardFruit||cfg.label,
      display:source.dataset.cardDisplay||$('h3',source)?.textContent?.trim()||cfg.label,
      visual:cfg.image,
      price,unit,copy:desc,
      state:$('.today-topline span',source)?.textContent?.trim()||'당일 상태 확인',
      detailName:detail?.dataset?.fruit||source.dataset.cardFruit||cfg.label
    };
  }
  function renderProducts(){
    const grid=$('#editorialProductGrid'); if(!grid||grid.dataset.built==='1') return;
    const items=picks.map(readCard);
    grid.innerHTML=items.map(x=>`<article class="editorial-product">
      <img src="${esc(x.image)}" alt="${esc(x.display)}" decoding="async" loading="lazy">
      <div><small>${esc(x.micro)}</small><h3>${esc(x.display)}</h3><p>${esc(x.copy)}</p>
      <div class="editorial-price"><span>${esc(x.unit)}</span><b>${esc(x.price)}</b></div>
      <div class="editorial-product-actions">
        <button class="buy" type="button" data-buy-now data-name="${esc(x.name)}" data-display-name="${esc(x.display)}" data-visual="${esc(x.visual)}">구매하기</button>
        <button class="detail" type="button" data-fruit="${esc(x.detailName||x.name)}" data-display-name="${esc(x.display)}" data-visual="${esc(x.visual)}">상세</button>
      </div></div></article>`).join('');
    grid.dataset.built='1';
  }

  // Build visible cards once after the shared DB renderer fills the hidden data dock.
  const dock=$('#todayGrid');
  let observer=null;
  const finish=()=>{ if($('#editorialProductGrid')?.dataset.built==='1'){ observer?.disconnect(); observer=null; } };
  if(dock){
    if(dock.children.length){ renderProducts(); finish(); }
    else if('MutationObserver' in window){
      observer=new MutationObserver(()=>{ if(dock.children.length){ renderProducts(); finish(); }});
      observer.observe(dock,{childList:true});
    }
  }
  window.addEventListener('load',()=>setTimeout(()=>{renderProducts();finish()},900),{once:true});
  setTimeout(()=>{renderProducts();finish()},1800);
})();
