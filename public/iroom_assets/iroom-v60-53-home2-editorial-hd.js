(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const A='./iroom_assets/home2_v6050/';
const month=new Date().getMonth()+1;
const season=(month>=3&&month<=5)?'spring':(month>=6&&month<=8)?'summer':(month>=9&&month<=11)?'autumn':'winter';
document.documentElement.dataset.iroomSeason=season;

const products={
 apple:{id:'apple',name:'이지플 사과',short:'사과',origin:'경북',pack:'2.5kg (8~10과)',grade:'프리미엄',price:'32,000원',desc:'아삭한 식감과 은은한 향이 살아 있는 이룸의 대표 사과입니다.',image:A+'apple.webp',badge:'추천'},
 pear:{id:'pear',name:'나주배',short:'나주배',origin:'전남 나주',pack:'3kg (6~8과)',grade:'프리미엄',price:'38,000원',desc:'시원한 과즙과 깨끗한 단맛을 즐길 수 있는 나주배입니다.',image:A+'pear.webp',badge:'인기'},
 shine:{id:'shine',name:'샤인머스캣',short:'샤인머스캣',origin:'경북',pack:'2kg (3~4송이)',grade:'프리미엄',price:'46,000원',desc:'탱글한 알과 향긋한 단맛이 오래 남는 프리미엄 샤인머스캣입니다.',image:A+'shine.webp',badge:'추천'},
 mandarin:{id:'mandarin',name:'제주 감귤',short:'제주 감귤',origin:'제주',pack:'3kg',grade:'프리미엄',price:'28,000원',desc:'제주의 햇살을 머금은 산뜻하고 달콤한 감귤입니다.',image:A+'mandarin.webp',badge:'제철'},
 peach:{id:'peach',name:'복숭아',short:'복숭아',origin:'경북',pack:'2kg (6~8과)',grade:'프리미엄',price:'34,000원',desc:'부드러운 과즙과 향이 풍성한 제철 복숭아입니다.',image:A+'peach.webp',badge:'제철'},
 melon:{id:'melon',name:'멜론',short:'멜론',origin:'국내산',pack:'2수 (3kg 내외)',grade:'프리미엄',price:'42,000원',desc:'깊은 향과 매끄러운 단맛을 지닌 프리미엄 멜론입니다.',image:A+'melon.webp',badge:'엄선'},
 pomegranate:{id:'pomegranate',name:'석류',short:'석류',origin:'엄선 산지',pack:'2kg (4~6과)',grade:'프리미엄',price:'36,000원',desc:'선명한 빛깔과 풍부한 과즙을 지닌 석류입니다.',image:A+'pomegranate.webp',badge:'특선'},
 plum:{id:'plum',name:'자두',short:'자두',origin:'경북',pack:'1.5kg (12~16과)',grade:'프리미엄',price:'24,000원',desc:'새콤달콤한 맛과 향이 살아 있는 제철 자두입니다.',image:A+'plum.webp',badge:'제철'},
 grapefruit:{id:'grapefruit',name:'자몽',short:'자몽',origin:'엄선 수입',pack:'2kg',grade:'프리미엄',price:'29,000원',desc:'산뜻한 산미와 쌉싸름한 향을 즐길 수 있는 자몽입니다.',image:A+'grapefruit.webp',badge:'상큼'},
 giftMix:{id:'giftMix',name:'이룸 혼합 과일 선물세트',short:'혼합 과일세트',origin:'이룸 엄선',pack:'사과 · 배 · 샤인머스캣 · 감귤',grade:'선물용',price:'79,000원~',desc:'좋은 과일만 골라 정갈한 박스에 담는 이룸의 대표 혼합 선물세트입니다.',image:A+'apple.webp',badge:'선물'}
};
const fruitOrder=['apple','pear','shine','mandarin','peach','melon','pomegranate','plum'];
let cartCount=0,current=null,toastTimer=null;
const mega=$('.h250-mega'),dim=$('.h250-menu-dim'),megaTitle=$('[data-mega-title]'),megaKicker=$('[data-mega-kicker]'),megaContent=$('[data-mega-content]');
function fruitCard(id){const p=products[id];return `<button type="button" class="h250-mega-card" data-product="${id}"><span class="h250-mega-photo"><img src="${p.image}" alt="${p.short}"></span><b>${p.short}</b><small>${p.grade} · ${p.origin}</small><em>${p.pack}</em><strong>${p.price}</strong></button>`}
function selectCard(id){const p=products[id];return `<article class="h250-card"><button type="button" class="h250-card-click" data-product="${id}"><span class="h250-card-photo"><img src="${p.image}" alt="${p.short}"></span><span class="h250-card-copy"><h3>${p.short}</h3><p>${p.grade} · ${p.origin}<br>${p.pack}</p><span class="h250-card-price"><strong>${p.price}</strong><span class="h250-cart-circle">↗</span></span></span></button></article>`}
function panelCard(k,t,d,id){const p=id?products[id]:null;return `<button type="button" class="h250-menu-panel${p?' has-img':''}" ${p?`data-product="${id}"`:''}>${p?`<img src="${p.image}" alt="${p.short}">`:''}<span><small>${k}</small><h3>${t}</h3><p>${d}</p></span></button>`}
function renderSelect(){const ids=['apple','pear','shine','mandarin','peach','melon','pomegranate','plum'];$('[data-select-grid]').innerHTML=ids.map(selectCard).join('')}
function renderMega(type){
  if(type==='fruit'){megaKicker.textContent='SEASONAL FRUITS';megaTitle.textContent='과일';megaContent.innerHTML=`<div class="h250-mega-fruits">${fruitOrder.map(fruitCard).join('')}</div>`}
  else if(type==='gift'){megaKicker.textContent='GIFT SELECTION';megaTitle.textContent='선물세트';megaContent.innerHTML=`<div class="h250-mega-panels">${panelCard('PREMIUM GIFT','혼합 과일세트','사과·배·샤인머스캣·감귤을 한 박스에 정갈하게 담습니다.','giftMix')}${panelCard('SEASONAL GIFT','사과 · 배 선물','제철의 안정적인 구성을 중심으로 선물하기 좋은 조합입니다.','pear')}${panelCard('BUSINESS GIFT','기업 · 단체 선물','수량과 예산에 맞춰 깔끔하게 제안하는 단체 선물 구성입니다.','apple')}</div>`}
  else if(type==='curation'){megaKicker.textContent='FRUIT CURATION';megaTitle.textContent='과일 큐레이션';megaContent.innerHTML=`<div class="h250-mega-panels">${panelCard('SWEET','당도 높은 과일','달콤한 맛을 중심으로 고른 과일을 빠르게 만나보세요.','shine')}${panelCard('KIDS','아이 간식','부드럽고 먹기 편한 과일을 중심으로 제안합니다.','peach')}${panelCard('FRESH','상큼한 과일','가볍고 산뜻한 풍미가 필요한 순간의 추천입니다.','mandarin')}</div>`}
  else if(type==='routine'){megaKicker.textContent='IROOM FRUIT ROUTINE';megaTitle.textContent='정기 루틴';megaContent.innerHTML=`<div class="h250-mega-panels">${panelCard('01','가볍게','1~2인이 부담 없이 즐기는 과일 루틴입니다.','apple')}${panelCard('02','가족과 함께','여러 과일을 넉넉하게 즐기는 가족형 구성입니다.','shine')}${panelCard('03','선물처럼','구성과 포장까지 조금 더 특별하게 준비합니다.','giftMix')}</div>`}
  else if(type==='guide'){megaKicker.textContent='FRUIT GUIDE';megaTitle.textContent='과일 가이드';megaContent.innerHTML=`<div class="h250-mega-panels">${panelCard('SELECT','좋은 과일 고르는 법','색과 향, 단단함으로 신선한 과일을 보는 기준입니다.','apple')}${panelCard('STORAGE','오래 보관하는 법','과일별 적정 온도와 보관 위치를 간단하게 알려드립니다.','melon')}${panelCard('SERVE','더 맛있게 먹는 법','과일의 향과 단맛을 더 잘 느끼는 방법입니다.','pomegranate')}</div>`}
  else{megaKicker.textContent='BRAND STORY';megaTitle.textContent='브랜드 스토리';megaContent.innerHTML=`<div class="h250-brand-panel"><div class="art"><img src="${products.pomegranate.image}" alt="수채화 석류"></div><div><small>IROOM STANDARD</small><h3>좋은 과일을<br>보기 쉽게, 고르기 쉽게.</h3><p>이룸홈2는 과일 자체의 색과 질감을 중심으로 보여주는 편집형 스토어입니다. 수채화 컷아웃 이미지로 비주얼 언어를 하나로 통일하고, 클릭 한 번으로 상세 정보를 확인하도록 구성했습니다.</p></div></div>`}
}
function openMega(type){renderMega(type);mega.hidden=false;dim.hidden=false;$$('[data-menu]').forEach(b=>b.classList.toggle('is-active',b.dataset.menu===type))}
function closeMega(){mega.hidden=true;dim.hidden=true;$$('[data-menu]').forEach(b=>b.classList.remove('is-active'));const a=document.activeElement;if(a&&a.matches&&a.matches('[data-menu]'))a.blur()}
function openDetail(id){const p=products[id];if(!p)return;const a=document.activeElement;if(a&&a.blur)a.blur();current=p;$('#detailImage').src=p.image;$('#detailImage').alt=p.name;$('#detailImageA').src=p.image;$('#detailImageA').alt='';$('#detailImageB').src=p.image;$('#detailImageB').alt='';$('#detailKicker').textContent=p.badge.toUpperCase()+' · IROOM SELECT';$('#detailTitle').textContent=p.name;$('#detailDesc').textContent=p.desc;$('#detailOrigin').textContent=p.origin;$('#detailPack').textContent=p.pack;$('#detailGrade').textContent=p.grade;$('#detailPrice').textContent=p.price;$('#detailQty').value='1';$('#detailModal').setAttribute('aria-hidden','false');closeMega()}
function closeDetail(){$('#detailModal').setAttribute('aria-hidden','true');const a=document.activeElement;if(a&&a.blur)a.blur()}
function openInfo(k,t,x){$('#infoKicker').textContent=k;$('#infoTitle').textContent=t;$('#infoText').textContent=x;$('#infoModal').setAttribute('aria-hidden','false')}
function closeInfo(){$('#infoModal').setAttribute('aria-hidden','true')}
function updateCart(){const b=$('[data-cart-count]');b.hidden=cartCount<1;b.textContent=String(cartCount)}
function toast(msg){const t=$('[data-toast]');t.textContent=msg;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.hidden=true,1800)}
renderSelect();updateCart();
document.addEventListener('click',e=>{
 const mb=e.target.closest('[data-menu]');if(mb){openMega(mb.dataset.menu);return}
 if(e.target.closest('[data-close-mega]')||e.target===dim){closeMega();return}
 const p=e.target.closest('[data-product]');if(p){openDetail(p.dataset.product);return}
 if(e.target.closest('[data-close-detail]')||e.target===$('#detailModal')){closeDetail();return}
 if(e.target.closest('[data-close-info]')||e.target===$('#infoModal')){closeInfo();return}
 const q=e.target.closest('[data-qty]');if(q){let i=$('#detailQty'),v=Math.max(1,parseInt(i.value||'1',10)||1);v+=q.dataset.qty==='plus'?1:-1;i.value=String(Math.max(1,v));return}
 if(e.target.closest('[data-cart-add]')){const n=Math.max(1,parseInt($('#detailQty').value||'1',10)||1);cartCount+=n;updateCart();toast(`${current.name} ${n}개를 장바구니에 담았습니다.`);return}
 if(e.target.closest('[data-buy-now]')){const n=Math.max(1,parseInt($('#detailQty').value||'1',10)||1);openInfo('BUY NOW',`${current.name} 바로구매`,`${current.name} ${n}개를 선택했습니다. 기존 주문 흐름과 연결할 수 있도록 Home2의 구매 진입점을 정리했습니다.`);return}
 const inf=e.target.closest('[data-info]');if(inf){if(inf.dataset.info==='search')openInfo('SEARCH','과일 검색','원하는 과일을 상단 ‘과일’ 메뉴에서 한 번에 확인할 수 있습니다.');if(inf.dataset.info==='login')openInfo('MY IROOM','로그인','기존 이룸홈1 계정 기능과 연결할 수 있는 영역입니다.');if(inf.dataset.info==='cart')openInfo('CART',cartCount?`장바구니 ${cartCount}건`:'장바구니',cartCount?'선택한 상품이 장바구니에 담겨 있습니다.':'아직 담긴 상품이 없습니다.');if(inf.dataset.info==='picnic')openInfo('PICNIC ROUTINE','과일과 함께하는 가벼운 주말','제철 과일 한 접시와 가벼운 피크닉을 위한 이룸의 라이프스타일 제안입니다. 과일을 고르고, 차갑게 준비하고, 작은 바구니에 담아 일상의 바깥으로 가져가 보세요.');return}
});
window.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if($('#detailModal').getAttribute('aria-hidden')==='false'){closeDetail();return}if($('#infoModal').getAttribute('aria-hidden')==='false'){closeInfo();return}if(!mega.hidden)closeMega()});
})();
