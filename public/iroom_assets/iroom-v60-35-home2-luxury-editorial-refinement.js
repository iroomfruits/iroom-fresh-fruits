/* IROOM HOME2 V60.35 — Luxury editorial asset binding. */
(()=>{'use strict';
if(!document.body.classList.contains('home2-mode'))return;
const L='/iroom_assets/luxury_v35/';
const map={
 '이지플':'apple.webp','이지플사과':'apple.webp','사과':'apple.webp',
 '나주배':'pear.webp','배':'pear.webp',
 '샤인머스캣':'shine.webp','샤인머스켓':'shine.webp',
 '제철감':'persimmon.webp','대봉':'persimmon.webp','감':'persimmon.webp',
 '석류':'pomegranate.webp','포도':'grape.webp',
 '바나나':'banana.webp','감귤':'mandarin.webp','제주감귤':'mandarin.webp',
 '키위':'kiwi.webp','딸기':'strawberry.webp','금실딸기':'strawberry.webp','블루베리':'blueberry.webp'
};
const norm=s=>String(s||'').replace(/\s+/g,'').trim();
function srcFor(name){
 const n=norm(name);if(map[n])return L+map[n];
 const k=Object.keys(map).find(k=>n.includes(k)||k.includes(n));return k?L+map[k]:'';
}
function setImg(img,name){
 if(!img)return;const src=srcFor(name);if(!src)return;
 if(img.getAttribute('src')!==src)img.src=src;
 img.style.objectFit='contain';img.style.objectPosition='center';img.decoding='async';
 img.onerror=()=>{img.onerror=null;img.src='/iroom_assets/green_home2/hero_green_still.webp';img.classList.add('is-iroom-fallback')};
}
function bindProducts(){
 document.querySelectorAll('.gs-premium-card').forEach(card=>{
  const name=card.dataset.name||card.querySelector('h3')?.textContent||'';const src=srcFor(name);
  setImg(card.querySelector('.gs-photo img'),name);
  if(src)card.querySelectorAll('[data-visual]').forEach(el=>el.dataset.visual=src);
 });
 document.querySelectorAll('.gs-daily-list button[data-fruit]').forEach(btn=>{
  const name=btn.dataset.fruit||btn.dataset.displayName||btn.querySelector('b')?.textContent||'';const src=srcFor(name);
  setImg(btn.querySelector('img'),name);if(src)btn.dataset.visual=src;
 });
}
function bindSearch(root=document){
 root.querySelectorAll('#searchResults .rich-search-item').forEach(item=>{
  const name=item.dataset.fruit||item.querySelector('b')?.textContent||item.textContent||'';let img=item.querySelector('.fruit-search-thumb');
  if(!img){img=document.createElement('img');img.className='fruit-search-thumb';img.alt='';item.prepend(img)}
  setImg(img,name);const src=srcFor(name);if(src)item.dataset.visual=src;
 });
}
function bindDetail(root=document){
 const title=document.getElementById('modalTitle')?.textContent||'';
 const name=title.replace(/상세설명|상세|FRUIT DETAIL/gi,'').trim();
 const src=srcFor(name);if(!src)return;
 root.querySelectorAll('.fruit-detail-visual img,.lux-detail-stage>img').forEach(img=>setImg(img,name));
 root.querySelectorAll('[data-visual]').forEach(el=>{if(src)el.dataset.visual=src});
}
function run(){bindProducts();bindSearch();bindDetail()}
run();
const modal=document.getElementById('modalBody');
if(modal)new MutationObserver(()=>requestAnimationFrame(()=>{bindSearch(modal);bindDetail(modal)})).observe(modal,{childList:true,subtree:true});
addEventListener('load',run,{once:true});
})();
