
/* IROOM HOME2 V60.34 — guaranteed image recovery + luxury asset binding. */
(()=>{'use strict';
if(!document.body.classList.contains('home2-mode'))return;

const G='/iroom_assets/green_home2/';
const F='/iroom_assets/fruit_originals_v32/';
const fallback=G+'hero_green_still.webp';

const exact={
  '이지플':G+'apple.webp','이지플사과':G+'apple.webp','사과':G+'apple.webp',
  '나주배':G+'pear.webp','배':G+'pear.webp',
  '샤인머스캣':G+'shine.webp','샤인머스켓':G+'shine.webp',
  '대봉':G+'persimmon.webp','제철감':G+'persimmon.webp','감':G+'persimmon.webp',
  '석류':G+'pomegranate.webp','포도':G+'grape.webp',
  '바나나':G+'daily_banana.webp','제주감귤':G+'daily_mandarin.webp','감귤':G+'daily_mandarin.webp',
  '키위':G+'daily_kiwi.webp','딸기':G+'daily_strawberry.webp','블루베리':G+'daily_blueberry.webp'
};
const catalogue={
  '망고':F+'fruit-01.webp','파인애플':F+'fruit-02.webp','복숭아':F+'fruit-04.webp',
  '체리':F+'fruit-07.webp','무화과':F+'fruit-08.webp','망고스틴':F+'fruit-09.webp',
  '리치':F+'fruit-17.webp','라임':F+'catalog-30.webp','레몬':F+'catalog-14.webp',
  '라즈베리':F+'catalog-17.webp','멜론':F+'catalog-28.webp','수박':F+'fruit-28.webp',
  '참외':F+'fruit-27.webp','토마토':F+'catalog-37.webp','대저토마토':F+'catalog-37.webp'
};
const norm=s=>String(s||'').replace(/\s+/g,'').trim();
function asset(name){
  const n=norm(name);
  if(exact[n])return exact[n];
  const ek=Object.keys(exact).find(k=>n.includes(k)||k.includes(n));if(ek)return exact[ek];
  const ck=Object.keys(catalogue).find(k=>n.includes(k)||k.includes(n));return ck?catalogue[ck]:'';
}
function recover(img,name,preferred){
  if(!img)return;
  const wanted=preferred||asset(name);
  if(wanted && img.getAttribute('src')!==wanted) img.src=wanted;
  img.decoding='async';
  img.addEventListener('error',()=>{
    const next=asset(name);
    if(next && img.src.indexOf(next)<0){img.src=next;img.classList.add('is-iroom-fallback');return;}
    if(img.src.indexOf(fallback)<0){img.src=fallback;img.classList.add('is-iroom-fallback');}
  },{once:false});
}
function bindCards(){
 document.querySelectorAll('.gs-premium-card[data-name]').forEach(card=>{
   const name=card.dataset.name||card.querySelector('h3')?.textContent||'';
   const src=asset(name);const photo=card.querySelector('.gs-photo');const img=photo?.querySelector('img');
   if(src){
     recover(img,name,src);photo?.classList.add('image-recovered');
     card.querySelectorAll('[data-visual]').forEach(el=>el.dataset.visual=src);
   }
 });
 document.querySelectorAll('.gs-daily-list button[data-fruit]').forEach(btn=>{
   const name=btn.dataset.fruit||btn.dataset.displayName||'';const src=asset(name);const img=btn.querySelector('img');
   if(src){recover(img,name,src);btn.dataset.visual=src;}
 });
}
function bindModal(){
 const title=document.getElementById('modalTitle')?.textContent||'';
 const root=document.getElementById('modalBody');if(!root)return;
 root.querySelectorAll('img').forEach(img=>{
   const hint=img.alt||title;
   if(!img.complete || img.naturalWidth===0) recover(img,hint,asset(hint)||asset(title));
 });
 root.querySelectorAll('#searchResults .rich-search-item').forEach(item=>{
   const name=item.dataset.fruit||item.querySelector('b')?.textContent||item.textContent||'';
   let img=item.querySelector('.fruit-search-thumb');
   if(!img){img=document.createElement('img');img.className='fruit-search-thumb';img.alt='';item.prepend(img);}
   recover(img,name,asset(name));
   const src=asset(name);if(src)item.dataset.visual=src;
 });
}
function run(){bindCards();bindModal();}
run();
const modal=document.getElementById('modalBody');
if(modal)new MutationObserver(()=>requestAnimationFrame(bindModal)).observe(modal,{childList:true,subtree:true});
window.addEventListener('load',run,{once:true});
})();
