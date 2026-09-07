
(function(){
 const cfg=window.IROOM_SEASON_CONFIG_V3,root=document.getElementById('iroomV3');if(!root||!cfg)return;
 const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
 const assetBase='./iroom_assets/fruits/';
 function imgPath(n){return assetBase+n}
 function autoSeason(){const m=new Date().getMonth()+1;return m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'autumn':'winter'}
 function currentSeason(){const q=new URLSearchParams(location.search).get('season');return ['spring','summer','autumn','winter'].includes(q)?q:autoSeason()}
 const aux={spring:['22_아보카도_avocado.png','31_패션후르츠_passionfruit.png','07_망고_mango.png'],summer:['18_파인애플_pineapple.png','23_용과_dragonfruit.png','30_라임_lime.png'],autumn:['24_석류_pomegranate.png','25_무화과_fig.png','26_밤_chestnut.png'],winter:['15_자몽_grapefruit.png','33_리치_lychee.png','35_금귤_kumquat.png']};
 function renderSeason(key){const c=cfg[key];root.dataset.season=key;document.documentElement.style.setProperty('--iv3-accent',c.accent);document.documentElement.style.setProperty('--iv3-soft',c.soft);root.style.setProperty('--iv3-blur-fruit',`url("${imgPath(c.hero[0][0])}")`);
  $('.iv3-kicker').textContent=c.label;$('.iv3-title').textContent=c.title;$('.iv3-sub').textContent=c.sub;$('.iv3-premium').innerHTML='PREMIUM<br>FRESH FRUITS<br>'+c.premium;
  $('.iv3-hero-art').innerHTML=c.hero.map(([im,label])=>`<div class="iv3-hero-item"><img src="${imgPath(im)}" alt="${label}"><div class="iv3-hero-label">${label}</div></div>`).join('');
  $('.iv3-reco-list').innerHTML=c.recommend.map(([im,n,d])=>`<article class="iv3-reco-card" data-fruit="${n}"><img src="${imgPath(im)}" alt="${n}"><div><h3>${n}</h3><p>${d}</p><button class="iv3-round" aria-label="${n} 보기">→</button></div></article>`).join('');
  $('.iv3-reco-season').textContent=key==='spring'?'봄 추천 4가지':key==='summer'?'여름 추천 4가지':key==='autumn'?'가을 추천 4가지':'겨울 추천 4가지';
  const s=c.seasonal;$('.iv3-seasonal-img').src=imgPath(s[0]);$('.iv3-seasonal-title').textContent=s[1];$('.iv3-seasonal-desc').textContent=s[2];
  $('.iv3-curation-fruits').innerHTML=aux[key].map(im=>`<img src="${imgPath(im)}" alt="">`).join('');
  $('.iv3-premium-fruits').innerHTML=c.premium.map(im=>`<img src="${imgPath(im)}" alt="">`).join('');
  $('.iv3-explore-grid').innerHTML=c.explore.map(([im,n,d])=>`<article class="iv3-explore-card" data-fruit="${n}"><img loading="lazy" src="${imgPath(im)}" alt="${n}"><h3>${n}</h3><p>${d}</p></article>`).join('');
  $('.iv3-curation-large-fruits').innerHTML=aux[key].map(im=>`<img loading="lazy" src="${imgPath(im)}" alt="">`).join('');
  $('.iv3-gift-stage-fruits').innerHTML=c.premium.map(im=>`<img loading="lazy" src="${imgPath(im)}" alt="">`).join('');
 }
 function modal(id){const m=document.getElementById(id);if(!m)return false;document.querySelectorAll('.modal.open').forEach(x=>{if(x!==m){x.classList.remove('open');x.setAttribute('aria-hidden','true')}});m.classList.add('open');m.setAttribute('aria-hidden','false');return true}
 function doSearch(){modal('searchModal');setTimeout(()=>document.getElementById('searchInput')?.focus(),60)}
 function doMy(){try{if(typeof currentUser!=='undefined'&&currentUser){modal('myOrdersModal');if(typeof loadMyOrders==='function')loadMyOrders()}else modal('loginModal')}catch(e){modal('loginModal')}}
 function doCart(){try{if(typeof drawCartModal==='function')drawCartModal()}catch(e){}modal('cartModal')}
 function consult(type){if(typeof openConsultation==='function'){openConsultation(type||'gift');return true}return modal('consultModal')}
 function fruitToCatalog(n){return {'사과':'경북 홍사과','배':'나주 신고배 특선','샤인머스캣':'샤인머스켓','샤인머스켓':'샤인머스켓','한라봉':'제주 한라봉','복숭아':'복숭아','천도복숭아':'복숭아','딸기':'딸기','망고':'제주 애플망고','포도':'캠벨 포도','청포도':'샤인머스켓'}[n]||n}
 function openFruit(n){const target=fruitToCatalog(n);try{if(typeof productCatalog!=='undefined'&&productCatalog[target]&&typeof showProduct==='function'){showProduct(target);return}}catch(e){}consult('fresh');setTimeout(()=>{const x=document.getElementById('consultExtraFruit');if(x)x.value=n},120)}
 function action(a){if(a==='home'){document.getElementById('homeV3')?.scrollIntoView({behavior:'smooth'});return}if(a==='search')return doSearch();if(a==='mypage')return doMy();if(a==='cart')return doCart();if(a==='custom')return consult('family');if(a==='gift')return consult('gift')}
 root.addEventListener('click',e=>{const sc=e.target.closest('[data-scroll]');if(sc){e.preventDefault();document.getElementById(sc.dataset.scroll)?.scrollIntoView({behavior:'smooth',block:'start'});return}const f=e.target.closest('[data-fruit]');if(f){e.preventDefault();openFruit(f.dataset.fruit);return}const a=e.target.closest('[data-action]');if(a){e.preventDefault();action(a.dataset.action)}});
 // Make original search useful even while old product grids are hidden.
 setTimeout(()=>{const input=document.getElementById('searchInput'),results=document.getElementById('searchResults');if(input&&results){input.oninput=e=>{const s=e.target.value.trim();let keys=[];try{keys=typeof productCatalog!=='undefined'?Object.keys(productCatalog):[]}catch(err){}results.innerHTML=keys.filter(x=>!s||x.includes(s)).map(x=>`<button class="searchHit iv3-search-hit" data-v3-search="${x}" style="display:block;width:100%;padding:12px;border:0;border-bottom:1px solid #eee;background:#fff;text-align:left;cursor:pointer">${x}</button>`).join('');results.querySelectorAll('[data-v3-search]').forEach(b=>b.onclick=()=>{document.getElementById('searchModal')?.classList.remove('open');try{if(typeof showProduct==='function')showProduct(b.dataset.v3Search)}catch(err){}})}}},100);
 renderSeason(currentSeason());
})();
