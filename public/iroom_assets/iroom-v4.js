
(function(){
 const root=document.getElementById('iroomV4'); if(!root)return;
 const $=s=>root.querySelector(s), $$=s=>[...root.querySelectorAll(s)];
 const base='./iroom_assets/';
 const seasons={
  spring:{img:'seasonal_exact/spring.png',accent:'#a85f67', fruits:['딸기','참외','체리','토마토'], explore:[['16_블루베리_blueberry.png','블루베리','산뜻한 베리 향'],['17_라즈베리_raspberry.png','라즈베리','상큼한 달콤함'],['22_아보카도_avocado.png','아보카도','부드러운 식감'],['07_망고_mango.png','망고','풍부한 달콤함'],['18_파인애플_pineapple.png','파인애플','상쾌한 과즙'],['15_자몽_grapefruit.png','자몽','산뜻한 균형']]},
  summer:{img:'seasonal_exact/summer.png',accent:'#678c61', fruits:['수박','청포도','자두','천도복숭아'], explore:[['07_망고_mango.png','망고','여름의 진한 단맛'],['18_파인애플_pineapple.png','파인애플','시원한 열대 향'],['19_키위_kiwi.png','키위','상큼하고 산뜻한'],['23_용과_dragonfruit.png','용과','깔끔한 단맛'],['30_라임_lime.png','라임','선명한 향'],['31_패션후르츠_passionfruit.png','패션후르츠','새콤한 열대향']]},
  autumn:{img:'seasonal_exact/autumn.png',accent:'#8d5037', fruits:['사과','배','샤인머스캣','감'], explore:[['24_석류_pomegranate.png','석류','진한 가을빛'],['25_무화과_fig.png','무화과','부드럽고 깊은 맛'],['26_밤_chestnut.png','밤','고소한 계절의 맛'],['08_포도_purple_grape.png','포도','진한 향과 당도'],['34_블랙베리_blackberry.png','블랙베리','짙은 베리 향'],['15_자몽_grapefruit.png','자몽','상큼한 균형']]},
  winter:{img:'seasonal_exact/winter.png',accent:'#4f7357', fruits:['한라봉','딸기','키위','사과'], explore:[['21_오렌지_orange.png','오렌지','겨울의 산뜻함'],['35_금귤_kumquat.png','금귤','작고 진한 향'],['14_레몬_lemon.png','레몬','맑은 산미'],['15_자몽_grapefruit.png','자몽','상큼한 과즙'],['33_리치_lychee.png','리치','부드러운 향'],['16_블루베리_blueberry.png','블루베리','깔끔한 베리 맛']]}
 };
 function autoSeason(){const m=new Date().getMonth()+1;return m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'autumn':'winter'}
 function currentSeason(){const q=new URLSearchParams(location.search).get('season');return seasons[q]?q:autoSeason()}
 const key=currentSeason(), c=seasons[key]; document.documentElement.style.setProperty('--v4-accent',c.accent);
 $('.v4-artboard').src=base+c.img; $('.v4-curation-img').src=base+'seasonal_exact/'+key+'_curation.png'; $('.v4-gift-img').src=base+'seasonal_exact/'+key+'_gift.png'; $('.v4-premium-img').src=base+'seasonal_exact/'+key+'_premium.png';
 $$('.v4-hot-recos button').forEach((b,i)=>b.dataset.fruit=c.fruits[i]);
 $('.v4-fruit-grid').innerHTML=c.explore.map(([im,n,d])=>`<article class="v4-fruit-card" data-fruit="${n}" tabindex="0"><img src="${base}fruits/${im}" alt="${n}"><h3>${n}</h3><p>${d}</p></article>`).join('');
 function modal(id){const m=document.getElementById(id);if(!m)return false;document.querySelectorAll('.modal.open').forEach(x=>{if(x!==m){x.classList.remove('open');x.setAttribute('aria-hidden','true')}});m.classList.add('open');m.setAttribute('aria-hidden','false');return true}
 function doSearch(){modal('searchModal');setTimeout(()=>document.getElementById('searchInput')?.focus(),80)}
 function doMy(){try{if(typeof currentUser!=='undefined'&&currentUser){modal('myOrdersModal');if(typeof loadMyOrders==='function')loadMyOrders()}else modal('loginModal')}catch(e){modal('loginModal')}}
 function doCart(){try{if(typeof drawCartModal==='function')drawCartModal()}catch(e){} modal('cartModal')}
 function consult(type){if(typeof openConsultation==='function'){openConsultation(type||'gift');return true}return modal('consultModal')}
 function fruitToCatalog(n){return {'사과':'경북 홍사과','배':'나주 신고배 특선','샤인머스캣':'샤인머스켓','청포도':'샤인머스켓','한라봉':'제주 한라봉','복숭아':'복숭아','천도복숭아':'복숭아','딸기':'딸기','망고':'제주 애플망고','포도':'캠벨 포도'}[n]||n}
 function openFruit(n){const target=fruitToCatalog(n);try{if(typeof productCatalog!=='undefined'&&productCatalog[target]&&typeof showProduct==='function'){showProduct(target);return}}catch(e){} consult('fresh');setTimeout(()=>{const x=document.getElementById('consultExtraFruit');if(x)x.value=n},100)}
 function action(a){if(a==='search')return doSearch(); if(a==='mypage')return doMy(); if(a==='cart')return doCart(); if(a==='custom')return consult('family'); if(a==='gift')return consult('gift')}
 root.addEventListener('click',e=>{const sc=e.target.closest('[data-scroll]');if(sc){e.preventDefault();document.getElementById(sc.dataset.scroll)?.scrollIntoView({behavior:'smooth',block:'start'});return}const f=e.target.closest('[data-fruit]');if(f){e.preventDefault();openFruit(f.dataset.fruit);return}const a=e.target.closest('[data-action]');if(a){e.preventDefault();action(a.dataset.action)}});
 root.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.v4-fruit-card')){e.preventDefault();openFruit(e.target.dataset.fruit)}});
 // Make search results connect to the original IROOM3 product catalog.
 setTimeout(()=>{const input=document.getElementById('searchInput'),results=document.getElementById('searchResults');if(input&&results){input.oninput=e=>{const s=e.target.value.trim();let keys=[];try{keys=typeof productCatalog!=='undefined'?Object.keys(productCatalog):[]}catch(err){}results.innerHTML=keys.filter(x=>!s||x.includes(s)).map(x=>`<button data-v4-search="${x}" style="display:block;width:100%;padding:12px;border:0;border-bottom:1px solid #eee;background:#fff;text-align:left;cursor:pointer">${x}</button>`).join('');results.querySelectorAll('[data-v4-search]').forEach(b=>b.onclick=()=>{document.getElementById('searchModal')?.classList.remove('open');try{if(typeof showProduct==='function')showProduct(b.dataset.v4Search)}catch(err){}})}}},120);
})();
