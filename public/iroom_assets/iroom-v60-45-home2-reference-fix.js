
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const products={
  apple:{id:'apple',name:'이지플 사과',short:'사과',origin:'국내산',pack:'3kg (8~10과)',grade:'프리미엄',price:'32,000원',kicker:'PREMIUM APPLE',desc:'아삭한 식감과 풍부한 향이 살아 있는 대표 사과입니다. 메가패널과 메인 카드 모두 사진을 누르면 바로 상세보기가 열립니다.',image:'./iroom_assets/home2_v6045/apple.webp',badge:'추천'},
  pear:{id:'pear',name:'나주배',short:'배',origin:'전남 나주',pack:'5kg (6~8과)',grade:'프리미엄',price:'38,000원',kicker:'PREMIUM PEAR',desc:'시원한 과즙과 은은한 단맛이 조화로운 나주배입니다.',image:'./iroom_assets/home2_v6045/pear.webp',badge:'인기'},
  shine:{id:'shine',name:'샤인머스캣',short:'샤인머스캣',origin:'국내산',pack:'2kg (3~4송이)',grade:'프리미엄',price:'46,000원',kicker:'PREMIUM SHINE MUSCAT',desc:'청포도의 향긋함과 탱글한 식감을 담은 프리미엄 포도입니다.',image:'./iroom_assets/home2_v6045/shine.webp',badge:'추천'},
  mandarin:{id:'mandarin',name:'제주 감귤',short:'감귤',origin:'제주',pack:'3kg',grade:'프리미엄',price:'28,000원',kicker:'JEJU CITRUS',desc:'제주의 햇살을 머금은 산뜻하고 달콤한 감귤입니다.',image:'./iroom_assets/home2_v6045/mandarin.webp',badge:'제철'},
  strawberry:{id:'strawberry',name:'설향 딸기',short:'딸기',origin:'국내산',pack:'1kg 내외',grade:'프리미엄',price:'25,000원',kicker:'KOREAN STRAWBERRY',desc:'향긋하고 상큼하게 즐기기 좋은 설향 딸기입니다.',image:'./iroom_assets/home2_v6045/strawberry.webp',badge:'달콤'},
  pomegranate:{id:'pomegranate',name:'석류',short:'석류',origin:'엄선',pack:'2kg',grade:'프리미엄',price:'28,000원',kicker:'PREMIUM POMEGRANATE',desc:'선명한 색감과 깊은 풍미를 지닌 석류입니다.',image:'./iroom_assets/home2_v6045/pomegranate.webp',badge:'특선'},
  grape:{id:'grape',name:'포도',short:'포도',origin:'국내산',pack:'2kg',grade:'프리미엄',price:'26,000원',kicker:'DAILY GRAPE',desc:'가볍게 즐기기 좋은 풍부한 단맛의 포도입니다.',image:'./iroom_assets/home2_v6045/grape.webp',badge:'데일리'},
  kiwi:{id:'kiwi',name:'키위',short:'키위',origin:'엄선',pack:'1kg',grade:'프리미엄',price:'26,000원',kicker:'MORNING KIWI',desc:'산뜻한 산미와 상큼한 향이 돋보이는 키위입니다.',image:'./iroom_assets/home2_v6045/kiwi.webp',badge:'가벼운'},
  giftMix:{id:'giftMix',name:'혼합 과일세트',short:'혼합 과일세트',origin:'이룸 엄선',pack:'제철 구성',grade:'선물용',price:'59,000원',kicker:'PREMIUM GIFT',desc:'사과, 배, 샤인머스캣을 정갈하게 담아 감사한 마음을 전하는 혼합 선물세트입니다.',image:'./iroom_assets/home2_v6045/gift.webp',badge:'선물'},
  giftApplePear:{id:'giftApplePear',name:'사과 · 배 선물세트',short:'사과 · 배 선물',origin:'국내산 / 나주',pack:'2종 구성',grade:'선물용',price:'69,000원',kicker:'APPLE & PEAR GIFT',desc:'아삭한 사과와 시원한 나주배를 함께 담은 실속형 선물세트입니다.',image:'./iroom_assets/home2_v6045/gift.webp',badge:'추천'},
  giftBusiness:{id:'giftBusiness',name:'기업 · 단체 선물',short:'기업 · 단체 선물',origin:'이룸 상담',pack:'수량 맞춤',grade:'비즈니스',price:'상담',kicker:'BUSINESS GIFT',desc:'수량과 예산에 맞춘 기업·단체용 과일 선물세트 제안입니다.',image:'./iroom_assets/home2_v6045/gift.webp',badge:'B2B'}
};
const menus={
  fruit:{title:'과일',filters:[['all','제철 과일'],['applepear','사과 · 배'],['grape','포도 · 샤인머스캣'],['citrus','감귤 · 만감류'],['berry','딸기 · 베리류'],['red','석류 · 특선'],['other','기타 과일']],items:{all:['apple','pear','shine','mandarin','strawberry','pomegranate'],applepear:['apple','pear'],grape:['shine','grape'],citrus:['mandarin'],berry:['strawberry'],red:['pomegranate'],other:['kiwi']}},
  gift:{title:'선물세트',filters:[['all','혼합 과일세트'],['applepear','사과 · 배 선물'],['business','기업 · 단체 선물']],items:{all:['giftMix','giftApplePear','giftBusiness'],applepear:['giftApplePear'],business:['giftBusiness']},layout:'panel'},
  curation:{title:'과일 큐레이션',filters:[['all','추천 큐레이션']],items:{all:['shine','strawberry','kiwi']},layout:'panel',copy:[['SWEET','당도 높은 과일','단맛이 풍부한 과일만 모아 간결하게 골라보세요.'],['KIDS','아이 간식','부담 없이 즐기기 좋은 달콤한 과일 추천입니다.'],['MORNING','가볍게 즐기기','아침이나 간식으로 좋은 상큼한 과일 구성입니다.']]},
  routine:{title:'정기 루틴',filters:[['all','루틴 구성']],items:{all:['apple','shine','giftMix']},layout:'panel',copy:[['01','가볍게','1~2인이 부담 없이 즐기는 구성'],['02','가족과 함께','여러 과일을 넉넉하게 즐기는 구성'],['03','선물처럼','구성과 포장까지 조금 더 특별하게']]},
  guide:{title:'과일 가이드',filters:[['all','가이드']],items:{all:['apple','shine','mandarin']},layout:'panel',copy:[['GUIDE','좋은 과일 고르는 법','신선한 과일을 쉽게 고르는 기준을 정리했습니다.'],['STORAGE','오래 보관하는 법','맛과 식감을 오래 살리는 보관 팁입니다.'],['SERVE','더 맛있게 먹는 법','과일을 더 맛있게 즐기는 간단한 방법입니다.']]},
  brand:{title:'브랜드 스토리',filters:[['all','이룸 이야기']],items:{all:['apple']},layout:'brand'}
};
let activeMenu=''; let activeFilter='all'; let cartCount=0; let currentProduct=null;
const dim=$('.h245-dim'); const mega=$('.h245-mega'); const filtersWrap=$('[data-panel-filters]'); const panelMain=$('[data-panel-main]'); const panelTitle=$('[data-panel-title]');
const homeGrid=$('[data-home-grid]'); const homeGifts=$('[data-home-gifts]');

function cardMarkup(p, compact=false){
  return `<article class="h245-product-card"><button type="button" data-open-product="${p.id}"><span class="h245-product-photo"><img src="${p.image}" alt="${p.name}"></span></button><div class="h245-product-info"><span class="h245-badge">${p.badge}</span><h3>${p.name}</h3><div class="h245-meta">${p.origin} / ${p.pack}<br>GRADE ${p.grade}</div><div class="h245-price-row"><div class="h245-price">지금 가격<strong>${p.price}</strong></div><button type="button" class="h245-icon-btn" data-open-product="${p.id}" aria-label="${p.name} 상세보기">⌁</button></div></div></article>`;
}
function giftMarkup(p,label,desc){
  return `<article class="h245-gift-card"><button type="button" data-open-product="${p.id}"><img src="${p.image}" alt="${p.name}"><small>${label}</small><h3>${p.name}</h3><p>${desc}</p></button></article>`;
}
function stripMarkup(ids){
  return `<div class="h245-strip">${ids.map(id=>{const p=products[id];return `<button type="button" class="h245-strip-card" data-open-product="${p.id}"><span class="h245-strip-photo"><img src="${p.image}" alt="${p.name}"></span><b>${p.short}</b><small>${p.grade} · ${p.origin}</small><em>${p.pack}</em><strong>${p.price}</strong></button>`}).join('')}</div>`;
}
function panelMarkup(menuKey, ids){
  const menu=menus[menuKey];
  if(menu.layout==='brand'){
    return `<div class="h245-brand-box"><img src="./iroom_assets/home2_v6045/hero_stage.png" alt="이룸 브랜드 스토리"><div class="h245-brand-copy"><small>IROOM STANDARD</small><h3>좋은 과일을<br>보기 쉽게, 고르기 쉽게.</h3><p>메인에서 바로 과일을 보고, 상단 메뉴에서는 한 창 안에서 카테고리별로 볼 수 있도록 구조를 다시 정리했습니다.</p></div></div>`;
  }
  const copy=menu.copy||[];
  return `<div class="h245-panel-grid">${ids.map((id,i)=>{const p=products[id]; const c=copy[i]||['ITEM',p.name,p.desc]; return `<button type="button" class="h245-panel-card" data-open-product="${p.id}"><img src="${p.image}" alt="${p.name}"><small>${c[0]}</small><b>${c[1]}</b><em>${c[2]}</em></button>`}).join('')}</div>`;
}
function renderHome(){
  const featured=['apple','pear','shine','mandarin'];
  homeGrid.innerHTML=featured.map(id=>cardMarkup(products[id])).join('');
  homeGifts.innerHTML=[
    giftMarkup(products.giftMix,'PREMIUM GIFT','정갈한 구성과 포장으로 감사한 마음을 전합니다.'),
    giftMarkup(products.giftApplePear,'SEASONAL GIFT','사과와 배를 중심으로 안정감 있게 구성한 세트입니다.'),
    giftMarkup(products.giftBusiness,'BUSINESS GIFT','수량과 예산에 맞춰 깔끔하게 제안합니다.')
  ].join('');
}
function openMega(menuKey){
  const menu=menus[menuKey]; if(!menu) return;
  activeMenu=menuKey; activeFilter=menu.filters[0][0];
  panelTitle.textContent=menu.title;
  filtersWrap.innerHTML=menu.filters.map(([k,label],i)=>`<button type="button" data-filter="${k}" class="${i===0?'is-active':''}">${label}</button>`).join('');
  renderPanel();
  mega.hidden=false; dim.hidden=false;
  $$('[data-menu]').forEach(b=>b.classList.toggle('is-active', b.dataset.menu===menuKey));
}
function renderPanel(){
  const menu=menus[activeMenu]; if(!menu) return;
  const ids=(menu.items[activeFilter]||menu.items[menu.filters[0][0]]||[]);
  panelMain.innerHTML=(menu.layout==='panel' || menu.layout==='brand') ? panelMarkup(activeMenu, ids) : stripMarkup(ids);
}
function closeMega(){ mega.hidden=true; dim.hidden=true; activeMenu=''; activeFilter='all'; $$('[data-menu]').forEach(b=>b.classList.remove('is-active')); }
function openProduct(id){
  const p=products[id]; if(!p) return; currentProduct=p;
  $('#productImage').src=p.image; $('#productImage').alt=p.name; $('#productKicker').textContent=p.kicker; $('#productTitle').textContent=p.name; $('#productDesc').textContent=p.desc; $('#productOrigin').textContent=p.origin; $('#productPack').textContent=p.pack; $('#productGrade').textContent=p.grade; $('#productPrice').textContent=p.price; $('#productQty').value='1'; $('#productModal').setAttribute('aria-hidden','false');
}
function closeProduct(){ $('#productModal').setAttribute('aria-hidden','true'); }
function openInfo(kicker,title,text){ $('#infoKicker').textContent=kicker; $('#infoTitle').textContent=title; $('#infoText').textContent=text; $('#infoModal').setAttribute('aria-hidden','false'); }
function closeInfo(){ $('#infoModal').setAttribute('aria-hidden','true'); }
function updateCartBadge(){ const b=$('[data-cart-badge]'); if(!b) return; if(cartCount>0){b.hidden=false;b.textContent=String(cartCount)} else b.hidden=true; }

renderHome(); updateCartBadge();

document.addEventListener('click',e=>{
  const menuBtn=e.target.closest('[data-menu]');
  if(menuBtn){const m=menuBtn.dataset.menu; if(!mega.hidden && activeMenu===m) closeMega(); else openMega(m); return;}
  if(e.target.closest('[data-close-mega]') || e.target===dim){closeMega(); return;}
  const f=e.target.closest('[data-filter]');
  if(f){activeFilter=f.dataset.filter; $$('[data-filter]',filtersWrap).forEach(b=>b.classList.toggle('is-active', b===f)); renderPanel(); return;}
  const p=e.target.closest('[data-open-product]');
  if(p){openProduct(p.dataset.openProduct); return;}
  const util=e.target.closest('[data-utility]');
  if(util){
    const kind=util.dataset.utility;
    if(kind==='search') openInfo('SEARCH','검색','검색 기능은 유지하면서도 Home2에서는 우선 상품 접근성을 먼저 정리했습니다. 원하는 과일을 상단 메뉴 또는 메인 카드에서 바로 선택해보세요.');
    if(kind==='login') openInfo('ACCOUNT','로그인','로그인/마이페이지 연결은 기존 홈1 계정 흐름과 함께 이어서 붙일 수 있게 남겨두었습니다.');
    if(kind==='cart') openInfo('CART', cartCount ? `장바구니 ${cartCount}건` : '장바구니', cartCount ? '현재 담긴 상품이 있습니다.' : '아직 담긴 상품이 없습니다. 과일 상세창에서 바로 장바구니에 담을 수 있습니다.');
    return;
  }
  if(e.target.closest('[data-close-product]') || e.target=== $('#productModal')){closeProduct(); return;}
  if(e.target.closest('[data-close-info]') || e.target=== $('#infoModal')){closeInfo(); return;}
  const qty=e.target.closest('[data-qty]');
  if(qty){ const input=$('#productQty'); let v=Math.max(1, parseInt(input.value||'1',10)||1); v += qty.dataset.qty==='plus' ? 1 : -1; if(v<1) v=1; input.value=String(v); return; }
  if(e.target.closest('[data-add-cart]')){ const n=Math.max(1, parseInt($('#productQty').value||'1',10)||1); cartCount += n; updateCartBadge(); closeProduct(); openInfo('CART','장바구니에 담았습니다', `${currentProduct ? currentProduct.name : '상품'} ${n}개를 장바구니에 담았습니다.`); return; }
});

window.addEventListener('keydown',e=>{ if(e.key!=='Escape') return; if($('#productModal').getAttribute('aria-hidden')==='false'){closeProduct(); return;} if($('#infoModal').getAttribute('aria-hidden')==='false'){closeInfo(); return;} if(!mega.hidden){closeMega();} });
})();
