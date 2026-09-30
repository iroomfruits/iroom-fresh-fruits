(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const P={
 apple:{name:'이지플 사과',short:'사과',origin:'국내산',pack:'3kg (8~10과)',grade:'프리미엄',price:'32,000원',img:'./iroom_assets/home2_v6049/apple.webp',kick:'PREMIUM APPLE',desc:'아삭한 식감과 풍부한 향이 살아 있는 사과입니다.'},
 pear:{name:'나주배',short:'나주배',origin:'전남 나주',pack:'5kg (6~8과)',grade:'프리미엄',price:'38,000원',img:'./iroom_assets/home2_v6049/pear.webp',kick:'PREMIUM PEAR',desc:'시원한 과즙과 은은한 단맛이 조화로운 나주배입니다.'},
 shine:{name:'샤인머스캣',short:'샤인머스캣',origin:'국내산',pack:'2kg (3~4송이)',grade:'프리미엄',price:'46,000원',img:'./iroom_assets/home2_v6049/shine.webp',kick:'SHINE MUSCAT',desc:'청포도의 향긋함과 탱글한 식감을 담은 프리미엄 샤인머스캣입니다.'},
 mandarin:{name:'제주 감귤',short:'제주 감귤',origin:'제주',pack:'3kg',grade:'프리미엄',price:'28,000원',img:'./iroom_assets/home2_v6049/mandarin.webp',kick:'JEJU CITRUS',desc:'제주의 햇살을 머금은 산뜻하고 달콤한 감귤입니다.'},
 strawberry:{name:'설향 딸기',short:'설향 딸기',origin:'국내산',pack:'1kg 내외',grade:'프리미엄',price:'25,000원',img:'./iroom_assets/home2_v6049/strawberry.webp',kick:'KOREAN STRAWBERRY',desc:'향긋하고 상큼하게 즐기기 좋은 설향 딸기입니다.'},
 pomegranate:{name:'석류',short:'석류',origin:'엄선',pack:'2kg',grade:'프리미엄',price:'28,000원',img:'./iroom_assets/home2_v6049/pomegranate.webp',kick:'POMEGRANATE',desc:'선명한 색감과 깊은 풍미를 지닌 석류입니다.'},
 grape:{name:'포도',short:'포도',origin:'국내산',pack:'2kg',grade:'프리미엄',price:'26,000원',img:'./iroom_assets/home2_v6049/grape.webp',kick:'GRAPE',desc:'부드러운 단맛과 풍부한 향이 좋은 포도입니다.'},
 blueberry:{name:'블루베리',short:'블루베리',origin:'국내산',pack:'500g',grade:'프리미엄',price:'24,000원',img:'./iroom_assets/home2_v6049/blueberry.webp',kick:'BLUEBERRY',desc:'한입에 즐기기 좋은 산뜻하고 달콤한 블루베리입니다.'},
 persimmon:{name:'제철 감',short:'제철 감',origin:'국내산',pack:'3kg',grade:'프리미엄',price:'26,000원',img:'./iroom_assets/home2_v6049/persimmon.webp',kick:'PERSIMMON',desc:'부드러운 식감과 차분한 단맛을 즐길 수 있는 제철 감입니다.'},
 kiwi:{name:'키위',short:'키위',origin:'엄선',pack:'1kg',grade:'프리미엄',price:'26,000원',img:'./iroom_assets/home2_v6049/kiwi.webp',kick:'KIWI',desc:'산뜻한 산미와 상큼한 향이 돋보이는 키위입니다.'},
 giftMix:{name:'프리미엄 혼합 과일세트',short:'혼합 과일세트',origin:'이룸 엄선',pack:'제철 구성',grade:'선물용',price:'59,000원~',img:'./iroom_assets/home2_v6049/gift.webp',kick:'PREMIUM GIFT',desc:'가장 좋은 제철 과일을 정갈하게 담아 전하는 이룸 선물세트입니다.'},
 giftApple:{name:'프리미엄 사과 선물세트',short:'사과 선물세트',origin:'국내산',pack:'선물 구성',grade:'선물용',price:'65,000원~',img:'./iroom_assets/home2_v6049/apple.webp',kick:'APPLE GIFT',desc:'아삭한 사과를 중심으로 정갈하게 구성한 선물세트입니다.'},
 giftPear:{name:'명품 나주배 선물세트',short:'나주배 선물세트',origin:'전남 나주',pack:'선물 구성',grade:'선물용',price:'68,000원~',img:'./iroom_assets/home2_v6049/pear.webp',kick:'PEAR GIFT',desc:'시원한 과즙의 나주배를 깔끔하게 구성한 선물세트입니다.'}
};
const ALL=['apple','pear','shine','mandarin','strawberry','pomegranate','grape','blueberry','persimmon','kiwi'];
const MENUS={
 fruit:{title:'과일',side:['제철 과일','사과 · 배','포도 · 샤인머스캣','감귤 · 만감류','딸기 · 베리류','석류 · 감','기타 과일'],kind:'all'},
 gift:{title:'선물세트',side:['혼합 과일세트','사과 선물세트','배 선물세트','프리미엄 단품','기업 · 단체 선물'],kind:'gift'},
 curation:{title:'과일 큐레이션',side:['당도 높은 과일','아이 간식','아침 과일','부담 없는 선택','프리미엄 선별'],kind:'curation'},
 routine:{title:'정기 루틴',side:['가볍게','가족과 함께','선물처럼'],kind:'routine'},
 guide:{title:'과일 가이드',side:['좋은 과일 고르는 법','오래 보관하는 법','더 맛있게 먹는 법'],kind:'guide'},
 brand:{title:'브랜드 스토리',side:['이룸 이야기','이룸의 기준','산지와 선별','포장과 배송'],kind:'brand'}
};
let activeMenu='',cart=0,current=null;
const mega=$('.h248-mega'),dim=$('.h248-dim'),megaTitle=$('[data-mega-title]'),megaSide=$('[data-mega-side]'),megaContent=$('[data-mega-content]');
function productCard(id,cls='h248-mega-card'){const p=P[id];return `<button class="${cls}" type="button" data-product="${id}"><figure><img src="${p.img}" alt="${p.name}"></figure><b>${p.short}</b><small>${p.grade} · ${p.origin}</small><em>${p.pack}</em><strong>${p.price}</strong></button>`}
function renderMega(kind){
 if(kind==='all') return `<div class="h248-all-fruits">${ALL.map(id=>productCard(id)).join('')}</div>`;
 if(kind==='gift') return `<div class="h248-panel-grid">${[['giftMix','PREMIUM GIFT','감사의 마음','정갈한 구성과 포장으로 마음을 전합니다.'],['giftApple','APPLE GIFT','프리미엄 사과 선물','아삭한 사과를 중심으로 구성합니다.'],['giftPear','PEAR GIFT','명품 나주배 선물','시원한 과즙의 나주배를 정갈하게 담습니다.']].map(x=>panelCard(...x)).join('')}</div>`;
 if(kind==='curation') return `<div class="h248-panel-grid">${[['shine','SWEET','당도 높은 과일','달콤한 과일을 중심으로 골라드립니다.'],['strawberry','KIDS','아이 간식','부담 없이 즐기기 좋은 향긋한 과일입니다.'],['kiwi','MORNING','가볍게 즐기는 과일','아침이나 간식으로 어울리는 산뜻한 구성입니다.']].map(x=>panelCard(...x)).join('')}</div>`;
 if(kind==='routine') return `<div class="h248-panel-grid">${[['apple','01','가볍게','1~2인이 부담 없이 즐기는 구성'],['shine','02','가족과 함께','여러 과일을 넉넉하게 즐기는 구성'],['giftMix','03','선물처럼','구성과 포장까지 조금 더 특별하게']].map(x=>panelCard(...x)).join('')}</div>`;
 if(kind==='guide') return `<div class="h248-panel-grid">${[['apple','GUIDE','좋은 과일 고르는 법','신선한 과일을 고르는 기준을 정리했습니다.'],['shine','STORAGE','오래 보관하는 법','맛과 식감을 오래 살리는 보관 팁입니다.'],['mandarin','SERVE','더 맛있게 먹는 법','과일을 더 맛있게 즐기는 방법입니다.']].map(x=>panelCard(...x)).join('')}</div>`;
 return `<div class="h248-brand"><img src="./iroom_assets/home2_v6049/hero-clean.jpg" alt="이룸 fresh fruits"><div><small>IROOM STANDARD</small><h3>좋은 과일을<br>보기 쉽고 고르기 쉽게.</h3><p>이룸은 산지와 선별, 포장과 배송까지 좋은 과일의 기준을 지키고 소비자가 바로 고를 수 있는 경험을 중요하게 생각합니다.</p></div></div>`;
}
function panelCard(id,kicker,title,desc){const p=P[id];return `<button class="h248-panel-card" type="button" data-product="${id}"><img src="${p.img}" alt="${p.name}"><small>${kicker}</small><b>${title}</b><em>${desc}</em></button>`}
function openMega(k){const m=MENUS[k];if(!m)return;activeMenu=k;megaTitle.textContent=m.title;megaSide.innerHTML=m.side.map(t=>`<span>${t}</span>`).join('');megaContent.innerHTML=renderMega(m.kind);mega.hidden=false;dim.hidden=false;$$('[data-menu]').forEach(b=>b.classList.toggle('active',b.dataset.menu===k));}
function closeMega(){mega.hidden=true;dim.hidden=true;activeMenu='';$$('[data-menu]').forEach(b=>b.classList.remove('active'))}
function openDetail(id){const p=P[id];if(!p)return;current=p;$('#detailImage').src=p.img;$('#detailImage').alt=p.name;$('#detailKicker').textContent=p.kick;$('#detailTitle').textContent=p.name;$('#detailDesc').textContent=p.desc;$('#detailOrigin').textContent=p.origin;$('#detailPack').textContent=p.pack;$('#detailGrade').textContent=p.grade;$('#detailPrice').textContent=p.price;$('#detailQty').value='1';closeMega();$('#detailModal').setAttribute('aria-hidden','false')}
function closeDetail(){$('#detailModal').setAttribute('aria-hidden','true')}
function openInfo(kind){const map={search:['SEARCH','과일 검색','상단의 과일 메뉴에서 열 가지 과일을 한 번에 보고 바로 상세보기를 열 수 있습니다.'],login:['ACCOUNT','로그인','기존 이룸 계정 기능과 연결되는 영역입니다.'],cart:['CART',cart?`장바구니 ${cart}건`:'장바구니',cart?'상세보기에서 담은 상품이 있습니다.':'아직 담긴 상품이 없습니다.']};const x=map[kind];$('#infoKicker').textContent=x[0];$('#infoTitle').textContent=x[1];$('#infoText').textContent=x[2];$('#infoModal').setAttribute('aria-hidden','false')}
function closeInfo(){$('#infoModal').setAttribute('aria-hidden','true')}
function updateBadge(){const b=$('[data-cart-count]');if(cart>0){b.hidden=false;b.textContent=String(cart)}else b.hidden=true}
function renderSelect(){const ids=['apple','pear','shine','mandarin','strawberry','pomegranate'];$('[data-select-grid]').innerHTML=ids.map(id=>productCard(id,'h248-product-card').replace('<figure>','<span class="h248-product-photo">').replace('</figure>','</span>').replace(`<b>${P[id].short}</b>`,`<span class="h248-product-body"><b>${P[id].short}</b>`).replace(`<strong>${P[id].price}</strong>`,`<strong>${P[id].price}</strong></span>`)).join('')}
renderSelect();updateBadge();
document.addEventListener('click',e=>{const mb=e.target.closest('[data-menu]');if(mb){const k=mb.dataset.menu;(!mega.hidden&&activeMenu===k)?closeMega():openMega(k);return}if(e.target.closest('[data-close-mega]')||e.target===dim){closeMega();return}const pb=e.target.closest('[data-product]');if(pb){openDetail(pb.dataset.product);return}const ib=e.target.closest('[data-info]');if(ib){openInfo(ib.dataset.info);return}if(e.target.closest('[data-close-detail]')||e.target===$('#detailModal')){closeDetail();return}if(e.target.closest('[data-close-info]')||e.target===$('#infoModal')){closeInfo();return}const q=e.target.closest('[data-qty]');if(q){const i=$('#detailQty');let v=Math.max(1,parseInt(i.value||'1',10)||1);v+=q.dataset.qty==='plus'?1:-1;i.value=String(Math.max(1,v));return}if(e.target.closest('[data-cart-add]')){cart+=Math.max(1,parseInt($('#detailQty').value||'1',10)||1);updateBadge();closeDetail();openInfo('cart')}});
window.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if($('#detailModal').getAttribute('aria-hidden')==='false'){closeDetail();return}if($('#infoModal').getAttribute('aria-hidden')==='false'){closeInfo();return}if(!mega.hidden)closeMega()});
})();
