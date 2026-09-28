/* IROOM HOME2 V60.33 — image-rich search/detail enhancement. Commerce logic stays in the shared V60.15 script. */
(()=>{'use strict';
if(!document.body.classList.contains('home2-mode'))return;
const A='/iroom_assets/green_home2/';
const O='/iroom_assets/fruit_originals_v32/';
const premium={
 '이지플':[A+'apple.webp',O+'fruit-03.webp'], '이지플 사과':[A+'apple.webp',O+'fruit-03.webp'],
 '나주배':[A+'pear.webp',O+'catalog-10.webp'], '배':[A+'pear.webp',O+'catalog-10.webp'],
 '샤인머스캣':[A+'shine.webp',O+'catalog-12.webp'], '샤인머스켓':[A+'shine.webp',O+'catalog-12.webp'],
 '대봉':[A+'persimmon.webp',O+'fruit-24.webp'], '제철 감':[A+'persimmon.webp',O+'fruit-24.webp'], '감':[A+'persimmon.webp',O+'fruit-24.webp'],
 '석류':[A+'pomegranate.webp',O+'catalog-24.webp'],
 '포도':[A+'grape.webp',O+'catalog-08.webp']
};
function key(){return (document.getElementById('modalTitle')?.textContent||'').trim()}
function sources(title,main){const found=premium[title]||Object.entries(premium).find(([k])=>title.includes(k))?.[1]||[];return [...new Set([main,...found].filter(Boolean))]}
function enhanceDetail(root){
 const detail=root.querySelector('.fruit-detail.commerce-detail');if(!detail||detail.dataset.lux==='1')return;
 const visual=detail.querySelector('.fruit-detail-visual');const img=visual?.querySelector('img');if(!visual||!img)return;
 detail.dataset.lux='1';const srcs=sources(key(),img.getAttribute('src'));
 const stage=document.createElement('div');stage.className='lux-detail-stage';img.parentNode.insertBefore(stage,img);stage.appendChild(img);
 const views=[
  {src:srcs[0],fit:'contain',pos:'center',zoom:'1'},
  {src:srcs[1]||srcs[0],fit:'contain',pos:'center',zoom:'1'},
  {src:srcs[0],fit:'cover',pos:'center 34%',zoom:'1.02'},
  {src:srcs[1]||srcs[0],fit:'cover',pos:'center 62%',zoom:'1.03'}
 ];
 const thumbs=document.createElement('div');thumbs.className='lux-detail-thumbs';
 views.forEach((v,i)=>{const b=document.createElement('button');b.type='button';b.className='lux-detail-thumb'+(i===0?' is-active':'');b.innerHTML=`<img src="${v.src}" alt="${key()} 이미지 ${i+1}" loading="lazy">`;b.addEventListener('click',()=>{img.src=v.src;img.style.setProperty('object-fit',v.fit,'important');img.style.setProperty('object-position',v.pos,'important');img.style.setProperty('transform',`scale(${v.zoom})`,'important');thumbs.querySelectorAll('.lux-detail-thumb').forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active')});thumbs.appendChild(b)});
 visual.appendChild(thumbs);
 const cards=[...detail.querySelectorAll('.detail-grid>div')];cards.forEach((card,i)=>{if(card.querySelector('.lux-detail-card-image'))return;const s=document.createElement('span');s.className='lux-detail-card-image';const src=views[(i+1)%views.length].src;s.innerHTML=`<img src="${src}" alt="" loading="lazy">`;card.appendChild(s)});
}
function enhanceSearch(root){root.querySelectorAll('#searchResults .rich-search-item').forEach(x=>{x.setAttribute('aria-label',(x.textContent||'과일')+' 상세보기')})}
function bind(){const root=document.getElementById('modalBody');if(!root)return;enhanceDetail(root);enhanceSearch(root)}
bind();const root=document.getElementById('modalBody');if(root)new MutationObserver(bind).observe(root,{childList:true,subtree:true});
})();
