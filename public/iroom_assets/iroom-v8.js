(function(){
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const root=$('#iroomFinalBase'); if(!root)return;
  const assets='./iroom_assets/';
  const seasons={
    spring:{label:'봄',art:'seasonal_clean/spring.jpg',fruits:['딸기','참외','체리','토마토']},
    summer:{label:'여름',art:'seasonal_clean/summer.jpg',fruits:['수박','청포도','자두','천도복숭아']},
    autumn:{label:'가을',art:'seasonal_clean/autumn.jpg',fruits:['사과','배','샤인머스캣','감']},
    winter:{label:'겨울',art:'seasonal_clean/winter.jpg',fruits:['한라봉','딸기','키위','사과']}
  };
  const fruitMeta={
    '딸기':['fruits/01_딸기_strawberry.png','향긋하고 산뜻한 단맛'],
    '참외':['fruits/02_참외_korean_melon.png','아삭하고 맑은 달콤함'],
    '청포도':['fruits/03_청포도_green_grape.png','청량하고 향긋한 단맛'],
    '체리':['fruits/04_체리_cherry.png','상큼하고 진한 과즙'],
    '수박':['fruits/05_수박_watermelon.png','시원하고 풍부한 과즙'],
    '천도복숭아':['fruits/06_복숭아_peach.png','부드럽고 향긋한 여름 맛'],
    '사과':['fruits/09_사과_apple.png','아삭하고 선명한 달콤함'],
    '배':['fruits/10_배_pear.png','시원하고 풍부한 과즙'],
    '감':['fruits/11_감_persimmon.png','깊고 진한 계절의 단맛'],
    '샤인머스캣':['fruits/12_샤인머스캣_shine_muscat.png','향긋하고 맑은 달콤함'],
    '한라봉':['fruits/13_한라봉_hallabong.png','진한 향과 산뜻한 단맛'],
    '키위':['fruits/19_키위_kiwi.png','상큼하고 깊은 달콤함'],
    '자두':['fruits/27_자두_plum.png','새콤달콤한 여름 과즙'],
    '토마토':['fruits/37_토마토_tomato.png','신선하고 산뜻한 자연의 맛']
  };
  const allFruitNames=Object.keys(fruitMeta);
  const autoSeason=()=>{const m=new Date().getMonth()+1;return m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'autumn':'winter'};
  const params=new URLSearchParams(location.search);
  const forced=params.get('season');
  const valid=['spring','summer','autumn','winter'];
  let current=valid.includes(forced)?forced:autoSeason();
  const artwork=$('#seasonArtwork'), visual=$('#seasonVisual');
  function applySeason(key){
    current=key; visual.classList.add('is-changing');
    const data=seasons[key]; artwork.alt=`이룸 ${data.label} 계절 메인 시안`;
    const preload=new Image();
    preload.onload=()=>{artwork.src=preload.src; requestAnimationFrame(()=>visual.classList.remove('is-changing'))};
    preload.src=assets+data.art;
    $$('.season-buttons button').forEach(b=>b.classList.toggle('is-active',b.dataset.season===key || (b.dataset.season==='auto'&&!valid.includes(forced)&&key===autoSeason())));
  }
  applySeason(current);

  $('[data-home]')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  $$('.season-buttons button').forEach(btn=>btn.addEventListener('click',()=>{
    const key=btn.dataset.season; const url=new URL(location.href);
    if(key==='auto') url.searchParams.delete('season'); else url.searchParams.set('season',key);
    location.href=url.pathname+(url.search||'');
  }));

  const overlay=$('#modalBackdrop'), kicker=$('#modalKicker'), title=$('#modalTitle'), intro=$('#modalIntro'), body=$('#modalBody');
  let lastFocus=null;
  const setModal=(k,t,i,h)=>{kicker.textContent=k;title.textContent=t;intro.innerHTML=i||'';body.innerHTML=h||''};
  function openModal(type){
    lastFocus=document.activeElement;
    if(type==='seasonal')renderSeasonal();
    else if(type==='curation')renderCuration();
    else if(type==='gift')renderGift();
    else if(type==='brand')renderBrand();
    else if(type==='search')renderSearch();
    else if(type==='mypage')renderMyPage();
    else if(type==='cart')renderCart();
    overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
    setTimeout(()=>$('button,select,input',overlay)?.focus(),20);
  }
  function closeModal(){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.body.style.overflow='';try{lastFocus?.focus()}catch(e){}}
  function renderSeasonal(){
    const d=seasons[current];
    const cards=d.fruits.map(n=>{const m=fruitMeta[n]||['','오늘 상태가 좋은 과일'];return `<button class="fruit-card" type="button" data-fruit="${n}"><img src="${assets+m[0]}" alt="${n}"><span><b>${n}</b><small>${m[1]}</small></span></button>`}).join('');
    setModal('SEASONAL PICKS',`${d.label}, 지금 가장 맛있는 과일`,`메인 시안의 계절감은 그대로 두고, 실제 선택은 이 창에서 간결하게 이어집니다.`,`<div class="modal-grid">${cards}</div>`);
  }
  function renderCuration(){
    setModal('FRUIT CURATION','당신에게 맞는 과일을 골라드려요','예산 · 용도 · 취향만 알려주시면 그날 상태가 좋은 과일을 기준으로 추천합니다.',`
      <div class="modal-form">
        <div class="choice"><label>01 · BUDGET</label><select id="budget"><option>3만원 이하</option><option selected>3~5만원</option><option>5~8만원</option><option>8~12만원</option><option>12만원 이상</option></select></div>
        <div class="choice"><label>02 · PURPOSE</label><select id="purpose"><option>가정용</option><option selected>감사 선물</option><option>가족 · 건강 선물</option><option>기업 · 단체 선물</option></select></div>
        <div class="choice"><label>03 · TASTE</label><select id="taste"><option>아주 달콤하게</option><option selected>달콤하고 부드럽게</option><option>달콤·새콤 균형</option><option>상큼하게</option></select></div>
      </div>
      <div class="mini-panel" style="margin-top:18px"><p><b>이룸 추천 방식</b><br>많이 보여드리기보다 예산과 상황에 맞는 과일을 골라 구성합니다. 실제 상담 연결은 다음 기능 작업에서 이룸3 상담 시스템과 최종 연결합니다.</p></div>
      <div class="modal-actions"><button class="primary-btn" type="button" data-demo="curation">선택 내용 확인하기 →</button><button class="secondary-btn" type="button" data-close>닫기</button></div>`);
  }
  function renderGift(){
    setModal('GIFT SELECTION','마음을 전하는 과일 선물','과일보다 먼저 받는 분과 전하고 싶은 마음을 생각해 구성합니다.',`
      <div class="gift-list">
        <button class="gift-option" type="button" data-demo="gift"><b>감사 선물</b><span>고마운 마음을 정갈하게 전하고 싶을 때</span></button>
        <button class="gift-option" type="button" data-demo="gift"><b>가족 · 건강 선물</b><span>여럿이 함께 즐기기 좋은 균형 구성</span></button>
        <button class="gift-option" type="button" data-demo="gift"><b>기업 · 단체 선물</b><span>예산 · 수량 · 포장 조건까지 맞춤 제안</span></button>
      </div>`);
  }
  function renderBrand(){
    setModal('BRAND STORY','이룸이 과일을 고르는 기준','화려한 설명보다 매일 지키는 기본을 중요하게 생각합니다.',`
      <div class="story-grid">
        <article class="story-card"><b>01 · SOURCE</b><h3>산지</h3><p>제철과 산지의 특성을 살펴 지금 맛이 좋은 과일을 선택합니다.</p></article>
        <article class="story-card"><b>02 · SELECT</b><h3>선별</h3><p>모양뿐 아니라 향 · 숙도 · 단단함과 용도를 함께 확인합니다.</p></article>
        <article class="story-card"><b>03 · PACK</b><h3>포장</h3><p>과일이 눌리거나 흔들리지 않도록 구성에 맞춰 정성스럽게 포장합니다.</p></article>
        <article class="story-card"><b>04 · DELIVERY</b><h3>배송</h3><p>받는 순간까지 좋은 상태가 이어지도록 주문과 배송 흐름을 관리합니다.</p></article>
      </div>`);
  }
  function renderSearch(){
    setModal('SEARCH','과일 찾기','과일 이름을 입력하면 빠르게 찾을 수 있습니다.',`<div class="search-row"><input id="searchInput" placeholder="예: 사과, 딸기, 샤인머스캣"><button type="button" data-search>검색</button></div><div class="search-results" id="searchResults"></div>`);
    setTimeout(()=>fillSearch(''),0);
  }
  function fillSearch(q){const box=$('#searchResults');if(!box)return;q=(q||'').trim();const list=allFruitNames.filter(n=>!q||n.includes(q));box.innerHTML=list.map(n=>`<button type="button" data-fruit="${n}">${n}</button>`).join('')||'<span style="color:#81786e">검색 결과가 없습니다.</span>'}
  function renderMyPage(){setModal('MY PAGE','마이페이지','주문조회 · 회원정보 · 상담내역을 연결할 자리입니다.',`<div class="mini-panel"><p>최종 디자인 베이스에서는 위치와 동작만 확정했습니다. 다음 기능 작업에서 기존 이룸3 로그인/주문조회 시스템을 이 창에 연결합니다.</p></div>`)}
  function renderCart(){setModal('CART','장바구니','고른 상품과 선물 구성을 확인하는 창입니다.',`<div class="mini-panel"><p>현재는 디자인 베이스 단계입니다. 다음 작업에서 기존 이룸3 장바구니 데이터를 그대로 연결합니다.</p></div>`)}
  function showFruit(n){const m=fruitMeta[n]||['','오늘 상태가 좋은 과일'];setModal('FRUIT',n,m[1],`<div class="fruit-card" style="max-width:420px"><img src="${assets+m[0]}" alt="${n}"><span><b>${n}</b><small>상품 상세 연결은 다음 기능 작업에서 이룸3 상품 데이터와 연결합니다.</small></span></div>`)}

  root.addEventListener('click',e=>{
    const m=e.target.closest('[data-modal]'); if(m){e.preventDefault();openModal(m.dataset.modal);return}
  });
  overlay.addEventListener('click',e=>{
    if(e.target===overlay||e.target.closest('[data-close]')){closeModal();return}
    const f=e.target.closest('[data-fruit]'); if(f){showFruit(f.dataset.fruit);return}
    if(e.target.closest('[data-search]')){fillSearch($('#searchInput')?.value||'');return}
    const demo=e.target.closest('[data-demo]'); if(demo){const box=demo.closest('.modal-panel'); if(box){demo.textContent='다음 기능 작업에서 이룸3 시스템과 연결';demo.disabled=true;setTimeout(()=>{demo.disabled=false;demo.textContent=demo.dataset.demo==='curation'?'선택 내용 확인하기 →':'상담 연결 예정'},1700)} }
  });
  overlay.addEventListener('input',e=>{if(e.target.id==='searchInput')fillSearch(e.target.value)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))closeModal()});
})();
