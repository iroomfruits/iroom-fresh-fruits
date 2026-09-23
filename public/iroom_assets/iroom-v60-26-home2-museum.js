/* IROOM HOME2 V60.26 — STILL LIFE MUSEUM INTERACTIONS */
(()=>{
  if(!document.body.classList.contains('home2-mode')) return;
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const root=$('#iroomApp');
  const A='./iroom_assets/stilllife25/';
  document.body.classList.add('home2-museum-mode');

  // Gallery hero: manual only. No autoplay = no jitter.
  const exhibits=[
    {src:A+'hero_01.webp',label:'STILL LIFE 01',title:'Seasonal Quiet',copy:'과일과 계절의 빛이 가장 자연스럽게 만나는 순간.'},
    {src:A+'hero_02.webp',label:'STILL LIFE 02',title:'Golden Pear',copy:'배의 표면과 빛, 여백을 천천히 바라보는 정물.'},
    {src:A+'hero_03.webp',label:'STILL LIFE 03',title:'Deep Red',copy:'가을의 깊은 색을 담은 석류 정물.'}
  ];
  const heroImg=$('[data-museum-hero-image]');
  const heroLabel=$('[data-museum-exhibit-label]');
  const heroTitle=$('[data-museum-exhibit-title]');
  const heroCopy=$('[data-museum-exhibit-copy]');
  function showExhibit(i){
    const x=exhibits[i]; if(!x||!heroImg)return;
    heroImg.style.opacity='.15';
    const preload=new Image(); preload.onload=()=>{heroImg.src=x.src;heroImg.alt=x.title;heroLabel.textContent=x.label;heroTitle.textContent=x.title;heroCopy.textContent=x.copy;requestAnimationFrame(()=>heroImg.style.opacity='1')}; preload.src=x.src;
    $$('[data-museum-exhibit]').forEach((b,n)=>b.classList.toggle('is-active',n===i));
  }
  $$('[data-museum-exhibit]').forEach(b=>b.addEventListener('click',()=>showExhibit(Number(b.dataset.museumExhibit)||0)));

  // Mobile menu, now independent from the removed legacy Home2 script.
  const menuBtn=$('[data-home2-menu]'), menu=$('[data-home2-mobile-nav]'), closeBtn=$('[data-home2-menu-close]');
  const setMenu=open=>{if(!menu)return;menu.hidden=!open;menuBtn?.setAttribute('aria-expanded',String(open));document.body.classList.toggle('home2-menu-open',open)};
  menuBtn?.addEventListener('click',()=>setMenu(menu?.hidden!==false));
  closeBtn?.addEventListener('click',()=>setMenu(false));
  menu?.addEventListener('click',e=>{if(e.target===menu||e.target.closest('button:not([data-home2-menu-close])'))setTimeout(()=>setMenu(false),20)});

  $$('[data-scroll]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.scroll)?.scrollIntoView({behavior:'smooth',block:'start'})));

  const norm=v=>String(v||'').replace(/\s+/g,'');
  const imageFor=name=>{
    const n=norm(name);
    if(/이지플|사과|부사|홍로/.test(n)) return A+'card_apple.webp';
    if(/나주배|배/.test(n)) return A+'card_pear.webp';
    if(/샤인머스캣|청포도/.test(n)) return A+'card_shine.webp';
    if(/포도|거봉/.test(n)) return A+'card_grape.webp';
    if(/대봉|단감|감/.test(n)) return A+'card_persimmon.webp';
    if(/석류/.test(n)) return A+'card_pomegranate.webp';
    if(/밤/.test(n)) return A+'card_chestnut.webp';
    if(/키위/.test(n)) return A+'card_kiwi.webp';
    if(/복숭아/.test(n)) return A+'card_peach.webp';
    if(/딸기/.test(n)) return A+'card_strawberry.webp';
    if(/감귤|오렌지|한라봉|금귤/.test(n)) return A+'card_citrus.webp';
    if(/멜론|참외/.test(n)) return A+'card_melon.webp';
    return '';
  };
  const preferred={
    spring:{today:['금실딸기','성주참외','대저토마토','샤인머스캣'],seasonal:['사과','배','청포도','키위']},
    summer:{today:['백도복숭아','고당도수박','샤인머스캣','자두'],seasonal:['자두','포도','블루베리','키위']},
    autumn:{today:['이지플','나주배','샤인머스캣','대봉'],seasonal:['포도','밤','키위','석류']},
    winter:{today:['제주감귤','한라봉','금실딸기','부사사과'],seasonal:['금귤','자몽','블루베리','레몬']}
  };
  function cardName(card){return card?.dataset?.cardDisplay||card?.dataset?.cardFruit||$('h3',card)?.textContent||''}
  function curateGrid(grid, wanted){
    if(!grid)return;
    const cards=[...grid.children].filter(x=>x.matches('article'));
    const selected=[];
    wanted.forEach((name,order)=>{
      const c=cards.find(x=>!selected.includes(x)&&norm(cardName(x)).includes(norm(name)));
      if(c){selected.push(c);c.style.order=String(order);c.classList.remove('museum-hidden')}
    });
    cards.forEach(c=>{if(!selected.includes(c))c.classList.add('museum-hidden')});
    selected.forEach(c=>{const img=$('img',c),src=imageFor(cardName(c));if(img&&src&&img.getAttribute('src')!==src){img.src=src;img.removeAttribute('loading');img.decoding='async'}});
  }
  function applyGallery(){
    const season=root?.dataset?.season||'autumn',cfg=preferred[season]||preferred.autumn;
    curateGrid($('#todayGrid'),cfg.today);
    curateGrid($('#seasonalGrid'),cfg.seasonal);
  }
  let applying=false,ready=false,mutationSeen=false;
  const schedule=(reveal=true)=>{if(applying)return;applying=true;requestAnimationFrame(()=>{applyGallery();if(reveal){ready=true;document.body.classList.add('home2-products-ready')}applying=false})};
  ['todayGrid','seasonalGrid'].forEach(id=>{const el=document.getElementById(id);if(el&&window.MutationObserver)new MutationObserver(()=>{mutationSeen=true;schedule(true)}).observe(el,{childList:true})});
  // Keep product areas hidden until the shared DB renderer has finished, preventing flash/jitter.
  window.addEventListener('load',()=>{setTimeout(()=>{if(!ready)schedule(true)},850);setTimeout(()=>schedule(true),1500)},{once:true});
})();
