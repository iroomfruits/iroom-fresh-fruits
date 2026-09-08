(function(){
 const root=document.getElementById('iroomV4'); if(!root)return;
 const $=s=>root.querySelector(s), $$=s=>[...root.querySelectorAll(s)];
 const base='./iroom_assets/';
 const seasons={
  spring:{img:'seasonal_exact/spring.png',accent:'#a85f67',label:'봄', fruits:['딸기','참외','체리','토마토']},
  summer:{img:'seasonal_exact/summer.png',accent:'#678c61',label:'여름', fruits:['수박','청포도','자두','천도복숭아']},
  autumn:{img:'seasonal_exact/autumn.png',accent:'#8d5037',label:'가을', fruits:['사과','배','샤인머스캣','감']},
  winter:{img:'seasonal_exact/winter.png',accent:'#4f7357',label:'겨울', fruits:['한라봉','딸기','키위','사과']}
 };
 const fruitMeta={
  '딸기':['fruits/01_딸기_strawberry.png','향긋하고 산뜻한 단맛'],
  '참외':['fruits/02_참외_korean_melon.png','아삭하고 맑은 달콤함'],
  '청포도':['fruits/03_청포도_green_grape.png','청량하고 향긋한 단맛'],
  '체리':['fruits/04_체리_cherry.png','상큼하고 진한 과즙'],
  '수박':['fruits/05_수박_watermelon.png','시원하고 풍부한 과즙'],
  '천도복숭아':['fruits/06_복숭아_peach.png','부드럽고 향긋한 여름 맛'],
  '복숭아':['fruits/06_복숭아_peach.png','부드럽고 향긋한 여름 맛'],
  '사과':['fruits/09_사과_apple.png','아삭하고 선명한 달콤함'],
  '배':['fruits/10_배_pear.png','시원하고 풍부한 과즙'],
  '감':['fruits/11_감_persimmon.png','깊고 진한 계절의 단맛'],
  '샤인머스캣':['fruits/12_샤인머스캣_shine_muscat.png','향긋하고 맑은 달콤함'],
  '한라봉':['fruits/13_한라봉_hallabong.png','진한 향과 산뜻한 단맛'],
  '키위':['fruits/19_키위_kiwi.png','상큼하고 깊은 달콤함'],
  '자두':['fruits/27_자두_plum.png','새콤달콤한 여름 과즙'],
  '토마토':['fruits/37_토마토_tomato.png','신선하고 산뜻한 자연의 맛']
 };
 function autoSeason(){const m=new Date().getMonth()+1;return m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'autumn':'winter'}
 function currentSeason(){const q=new URLSearchParams(location.search).get('season');return seasons[q]?q:autoSeason()}
 const key=currentSeason(), c=seasons[key];
 document.documentElement.style.setProperty('--v4-accent',c.accent);
 $('.v4-artboard').src=base+c.img;
 $$('.v4-hot-recos button').forEach((b,i)=>b.dataset.fruit=c.fruits[i]);

 function legacyModal(id){const m=document.getElementById(id);if(!m)return false;document.querySelectorAll('.modal.open').forEach(x=>{if(x!==m){x.classList.remove('open');x.setAttribute('aria-hidden','true')}});m.classList.add('open');m.setAttribute('aria-hidden','false');return true}
 function doMy(){try{if(typeof currentUser!=='undefined'&&currentUser){legacyModal('myOrdersModal');if(typeof loadMyOrders==='function')loadMyOrders()}else legacyModal('loginModal')}catch(e){legacyModal('loginModal')}}
 function doCart(){try{if(typeof drawCartModal==='function')drawCartModal()}catch(e){} legacyModal('cartModal')}
 function consult(type){if(typeof openConsultation==='function'){openConsultation(type||'gift');return true}return legacyModal('consultModal')}
 function fruitToCatalog(n){return {'사과':'경북 홍사과','배':'나주 신고배 특선','샤인머스캣':'샤인머스켓','청포도':'샤인머스켓','한라봉':'제주 한라봉','복숭아':'복숭아','천도복숭아':'복숭아','딸기':'딸기','망고':'제주 애플망고','포도':'캠벨 포도'}[n]||n}
 function openFruit(n){const target=fruitToCatalog(n);closeV5();try{if(typeof productCatalog!=='undefined'&&productCatalog[target]&&typeof showProduct==='function'){showProduct(target);return}}catch(e){}consult('fresh');setTimeout(()=>{const x=document.getElementById('consultExtraFruit');if(x)x.value=n},140)}
 function action(a){if(a==='mypage')return doMy(); if(a==='cart')return doCart()}

 const overlay=$('#v5Overlay'), dialog=overlay?.querySelector('.v5-dialog'), title=$('#v5DialogTitle'), kicker=$('#v5DialogKicker'), intro=$('#v5DialogIntro'), body=$('#v5DialogBody');
 let lastFocus=null;
 function setDialog(k,t,i,html){kicker.textContent=k;title.textContent=t;intro.innerHTML=i||'';body.innerHTML=html||''}
 function openV5(type){if(!overlay)return;lastFocus=document.activeElement;
   if(type==='seasonal')renderSeasonal();
   else if(type==='curation')renderCuration();
   else if(type==='gift')renderGift();
   else if(type==='brand')renderBrand();
   else if(type==='search')renderSearch();
   overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';setTimeout(()=>overlay.querySelector('button,select,input')?.focus(),20);
 }
 function closeV5(){if(!overlay)return;overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.body.style.overflow='';try{lastFocus?.focus()}catch(e){}}

 function renderSeasonal(){
   const cards=c.fruits.map(n=>{const m=fruitMeta[n]||['','오늘 상태가 좋은 과일'];return `<button class="v5-card" data-v5-fruit="${n}">${m[0]?`<img src="${base+m[0]}" alt="${n}">`:''}<h3>${n}</h3><p>${m[1]}</p></button>`}).join('');
   setDialog('SEASONAL PICKS',`${c.label}, 지금 가장 맛있는 과일`,`계절 이름을 반복해서 보여주기보다 <b>지금 실제로 추천하고 싶은 과일 4가지</b>를 바로 고를 수 있게 구성했습니다.`,`<div class="v5-card-grid">${cards}</div><div class="v5-note">과일을 누르면 이룸3 상품 상세가 열리고, 등록되지 않은 과일은 맞춤 상담으로 연결됩니다.</div>`);
 }
 function renderCuration(){
   setDialog('FRUIT CURATION','당신에게 맞는 과일을 골라드려요','예산 · 용도 · 취향만 알려주시면 그날 상태가 좋은 과일을 기준으로 추천합니다.',`
    <div class="v5-process-grid">
      <div class="v5-choice"><label>01 · BUDGET</label><select id="v5Budget"><option>3만원 이하</option><option selected>3~5만원</option><option>5~8만원</option><option>8~12만원</option><option>12만원 이상</option><option>상담 후 결정</option></select></div>
      <div class="v5-choice"><label>02 · PURPOSE</label><select id="v5Purpose"><option selected>가정용</option><option>감사 선물</option><option>가족 · 건강 선물</option><option>기업 · 단체 선물</option><option>기타</option></select></div>
      <div class="v5-choice"><label>03 · TASTE</label><select id="v5Taste"><option>아주 달콤하게</option><option selected>달콤하고 부드럽게</option><option>달콤·새콤 균형</option><option>상큼하게</option><option>추천해주세요</option></select></div>
    </div>
    <div class="v5-note"><b>이룸 추천</b><br>많이 보여드리는 대신, 예산과 상황에 맞는 과일을 골라 구성합니다. 아래 버튼을 누르면 기존 이룸3 상담창으로 이어집니다.</div>
    <div class="v5-actions"><button class="v5-primary" data-v5-consult>맞춤 과일 상담 시작하기 →</button><button class="v5-secondary" data-v5-close>닫기</button></div>`);
 }
 function renderGift(){
   setDialog('GIFT SELECTION','마음을 전하는 과일 선물','과일 자체보다 <b>누구에게, 어떤 마음으로 전하는지</b>에 맞춰 패키지와 구성을 제안합니다.',`
    <div class="v5-gift-grid">
      <button class="v5-gift-option" data-v5-gift="감사 선물"><b>감사 선물</b><span>고마운 마음을 정갈하게 전하고 싶을 때</span></button>
      <button class="v5-gift-option" data-v5-gift="가족 · 건강 선물"><b>가족 · 건강 선물</b><span>여럿이 함께 즐기기 좋은 균형 구성</span></button>
      <button class="v5-gift-option" data-v5-gift="기업 · 단체 선물"><b>기업 · 단체 선물</b><span>예산 · 수량 · 포장 조건까지 맞춤 제안</span></button>
    </div>
    <div class="v5-note">Premium Gift Selection의 화살표와 ‘선물 제안’ 카드도 이 창으로 연결됩니다.</div>`);
 }
 function renderBrand(){
   setDialog('BRAND STORY','이룸이 과일을 고르는 기준','화려한 설명보다 매일 지키는 기본을 중요하게 생각합니다.',`
    <div class="v5-story-grid">
      <article class="v5-story-card"><b>01 · SOURCE</b><h3>산지</h3><p>제철과 산지의 특성을 살펴 지금 맛이 좋은 과일을 선택합니다.</p></article>
      <article class="v5-story-card"><b>02 · SELECT</b><h3>선별</h3><p>모양뿐 아니라 향 · 숙도 · 단단함과 용도를 함께 확인합니다.</p></article>
      <article class="v5-story-card"><b>03 · PACK</b><h3>포장</h3><p>과일이 눌리거나 흔들리지 않도록 구성에 맞춰 정성스럽게 포장합니다.</p></article>
      <article class="v5-story-card"><b>04 · DELIVERY</b><h3>배송</h3><p>받는 순간까지 좋은 상태가 이어지도록 주문과 배송 흐름을 관리합니다.</p></article>
    </div>`);
 }
 function renderSearch(){
   setDialog('SEARCH','과일 찾기','상품명이나 과일 이름을 입력해 주세요.',`<div class="v5-searchbox"><input id="v5SearchInput" placeholder="예: 사과, 샤인머스켓, 선물세트"><button data-v5-run-search>검색</button></div><div class="v5-search-results" id="v5SearchResults"></div>`);
   setTimeout(()=>{const input=$('#v5SearchInput');if(input){input.focus();input.addEventListener('input',()=>fillSearch(input.value));fillSearch('')}},0)
 }
 function fillSearch(q){const box=$('#v5SearchResults');if(!box)return;let keys=[];try{keys=typeof productCatalog!=='undefined'?Object.keys(productCatalog):[]}catch(e){}q=(q||'').trim();const list=keys.filter(x=>!q||x.includes(q)).slice(0,40);box.innerHTML=list.length?list.map(x=>`<button data-v5-product="${x}">${x}</button>`).join(''):'<div style="padding:18px 4px;color:#777">검색 결과가 없습니다. 맞춤 과일 상담을 이용해 주세요.</div>'}

 root.addEventListener('click',e=>{
   const home=e.target.closest('[data-home]');if(home){e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});return}
   const m=e.target.closest('[data-v5-modal]');if(m){e.preventDefault();openV5(m.dataset.v5Modal);return}
   const f=e.target.closest('[data-fruit]');if(f){e.preventDefault();openFruit(f.dataset.fruit);return}
   const a=e.target.closest('[data-action]');if(a){e.preventDefault();action(a.dataset.action);return}
   const vf=e.target.closest('[data-v5-fruit]');if(vf){e.preventDefault();openFruit(vf.dataset.v5Fruit);return}
   if(e.target.closest('[data-v5-close]')){e.preventDefault();closeV5();return}
   if(e.target.closest('[data-v5-consult]')){e.preventDefault();const budget=$('#v5Budget')?.value||'',purpose=$('#v5Purpose')?.value||'',taste=$('#v5Taste')?.value||'';closeV5();consult(purpose.includes('선물')||purpose.includes('기업')?'gift':'family');setTimeout(()=>{const b=document.getElementById('consultBudget'),t=document.getElementById('consultTaste'),r=document.getElementById('consultRecipient'),msg=document.getElementById('consultMessage');if(b)b.value=budget;if(t)t.value=taste;if(r)r.value=purpose;if(msg&&!msg.value)msg.value=`홈페이지 Fruit Curation에서 선택: ${budget} / ${purpose} / ${taste}`},220);return}
   const g=e.target.closest('[data-v5-gift]');if(g){e.preventDefault();const val=g.dataset.v5Gift;closeV5();consult('gift');setTimeout(()=>{const r=document.getElementById('consultRecipient'),p=document.getElementById('consultPackaging'),msg=document.getElementById('consultMessage');if(r)r.value=val;if(p)p.value=val.includes('기업')?'기업·단체 포장':'고급 선물 포장';if(msg&&!msg.value)msg.value=`홈페이지 Gift Selection: ${val}`},220);return}
   const prod=e.target.closest('[data-v5-product]');if(prod){e.preventDefault();closeV5();try{if(typeof showProduct==='function')showProduct(prod.dataset.v5Product)}catch(err){}return}
   if(e.target.closest('[data-v5-run-search]')){e.preventDefault();fillSearch($('#v5SearchInput')?.value||'');return}
 });
 overlay?.addEventListener('click',e=>{if(e.target===overlay||e.target.closest('.v5-close'))closeV5()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay?.classList.contains('open'))closeV5()});
})();
