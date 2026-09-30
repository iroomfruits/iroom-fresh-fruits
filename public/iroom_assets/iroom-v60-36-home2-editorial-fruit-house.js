(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
function scrollToId(id){const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}
$$('[data-scroll-to]').forEach(b=>b.addEventListener('click',()=>scrollToId(b.dataset.scrollTo)));
const menu=$('[data-h2e-menu]'), mobile=$('[data-h2e-mobile]'); if(menu&&mobile){menu.addEventListener('click',()=>{mobile.hidden=!mobile.hidden});mobile.addEventListener('click',e=>{if(e.target.closest('button'))mobile.hidden=true});}
const aliases={이지플:['이지플','이지플 사과','홍로사과','사과'],나주배:['나주배','나주 신고배 특선','배'],샤인머스캣:['샤인머스캣','샤인머스켓'],대봉:['대봉','햇감','감'],석류:['석류'],포도:['포도']};
function norm(s){return String(s||'').replace(/\s+/g,'').toLowerCase()}
async function syncProducts(){try{const r=await fetch('/api/products',{cache:'no-store'});if(!r.ok)return;const data=await r.json();const rows=Array.isArray(data)?data:(data.products||data.items||[]);if(!Array.isArray(rows))return;$$('[data-gs-product]').forEach(card=>{const key=card.dataset.name;const names=aliases[key]||[key];const p=rows.find(x=>names.some(n=>norm(x.name||x.title||x.product_name)===norm(n)));if(!p)return;const price=Number(p.price??p.sale_price??p.amount);if(Number.isFinite(price)){const el=$('[data-gs-price]',card);if(el)el.textContent=price.toLocaleString('ko-KR')+'원';} const unit=p.unit||p.weight||p.composition; if(unit){const t=$('.h2e-product-copy p',card); if(t&&!t.dataset.dbUnit){t.textContent=(p.origin||p.region||'국내 산지')+' · '+unit;t.dataset.dbUnit='1';}}});}catch(e){}}
syncProducts();
const fruitMap={
  '이지플':'/iroom_assets/editorial_v36/apple.webp','사과':'/iroom_assets/editorial_v36/apple.webp','홍로사과':'/iroom_assets/editorial_v36/apple.webp',
  '나주배':'/iroom_assets/editorial_v36/pear.webp','배':'/iroom_assets/editorial_v36/pear.webp',
  '샤인머스캣':'/iroom_assets/editorial_v36/shine.webp','샤인머스켓':'/iroom_assets/editorial_v36/shine.webp',
  '대봉':'/iroom_assets/editorial_v36/persimmon.webp','감':'/iroom_assets/editorial_v36/persimmon.webp',
  '석류':'/iroom_assets/editorial_v36/pomegranate.webp','포도':'/iroom_assets/editorial_v36/grape.webp',
  '딸기':'/iroom_assets/editorial_v36/strawberry.webp','감귤':'/iroom_assets/editorial_v36/mandarin.webp','제주감귤':'/iroom_assets/editorial_v36/mandarin.webp',
  '키위':'/iroom_assets/editorial_v36/kiwi.webp','블루베리':'/iroom_assets/editorial_v36/blueberry.webp','바나나':'/iroom_assets/editorial_v36/banana.webp'
};
function imageFor(title){const n=norm(title);for(const [k,v] of Object.entries(fruitMap))if(n.includes(norm(k)))return v;return'';}
function repairModal(){const body=$('#modalBody');if(!body)return;const title=$('#modalTitle')?.textContent||'';const src=imageFor(title);if(!src)return;$$('.fruit-detail-visual img,.fruit-detail-thumb img,.fruit-detail-card img,.fruit-detail-gallery img',body).forEach(img=>{img.src=src;img.alt=title;img.style.objectFit='contain';});}
const mb=$('#modalBody');if(mb)new MutationObserver(()=>setTimeout(repairModal,0)).observe(mb,{childList:true,subtree:true});
addEventListener('error',e=>{const img=e.target;if(!(img instanceof HTMLImageElement))return;const owner=img.closest('[data-fruit],[data-gs-product]');const name=owner?.dataset?.fruit||owner?.dataset?.name||img.alt;const src=imageFor(name);if(src&&img.src!==location.origin+src)img.src=src;},true);
})();
