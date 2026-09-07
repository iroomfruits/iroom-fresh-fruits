
(function(){
 const cfg=window.IROOM_SEASON_CONFIG; const root=document.getElementById('iroomV2'); if(!root||!cfg)return;
 const $=s=>root.querySelector(s), $$=s=>[...root.querySelectorAll(s)];
 function autoSeason(){const m=new Date().getMonth()+1;return m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'autumn':'winter'}
 function imgPath(name){return '/iroom_assets/fruits/'+name}
 function renderSeason(key,mode){const c=cfg[key];root.dataset.season=key;document.documentElement.style.setProperty('--iroom-accent',c.accent);document.documentElement.style.setProperty('--iroom-soft',c.soft);
   $('.hero-kicker').textContent=c.label; $('.hero-title').textContent=c.title; $('.hero-sub').textContent=c.sub; $('.hero-premium').innerHTML='PREMIUM<br>FRESH FRUITS<br>'+c.premium;
   root.style.setProperty('--blur-fruit',`url("${imgPath(c.hero[0][0])}")`);
   $('.hero-art').innerHTML=c.hero.map(([im,label])=>`<div class="hero-item"><img src="${imgPath(im)}" alt="${label}"><div class="hero-label">${label}</div></div>`).join('');
   $('.reco-list').innerHTML=c.recommend.map(([im,n,d])=>`<article class="reco-card" data-action="products"><img src="${imgPath(im)}" alt="${n}"><div><h3>${n}</h3><p>${d}</p><button class="round-arrow" aria-label="${n} 보기">→</button></div></article>`).join('');
   const s=c.seasonal; $('.seasonal-img').src=imgPath(s[0]); $('.seasonal-title').textContent=s[1]; $('.seasonal-desc').textContent=s[2];
   $('.premium-fruits').innerHTML=c.premium.map(im=>`<img src="${imgPath(im)}" alt="">`).join('');
   // curation uses intentionally different auxiliary fruits to avoid repetition with recommendation row
   const aux={spring:['22_아보카도_avocado.png','31_패션후르츠_passionfruit.png','07_망고_mango.png'],summer:['18_파인애플_pineapple.png','23_용과_dragonfruit.png','30_라임_lime.png'],autumn:['24_석류_pomegranate.png','25_무화과_fig.png','26_밤_chestnut.png'],winter:['15_자몽_grapefruit.png','33_리치_lychee.png','35_금귤_kumquat.png']}[key];
   $('.curation-fruits').innerHTML=aux.map(im=>`<img src="${imgPath(im)}" alt="">`).join('');
   $('.reco-season').textContent=key==='spring'?'봄 추천 4가지':key==='summer'?'여름 추천 4가지':key==='autumn'?'가을 추천 4가지':'겨울 추천 4가지';
   $$('.season-switcher button').forEach(b=>b.classList.toggle('active',b.dataset.season===mode));
 }
 function proxy(id){const e=document.getElementById(id);if(e){e.click();return true}return false}
 function openModal(id){const m=document.getElementById(id);if(!m)return false;m.classList.add('open');m.setAttribute('aria-hidden','false');return true}
 function hiddenK7(action){const e=document.querySelector('#KEEP9_EXACT [data-k7="'+action+'"]');if(e){e.click();return true}return false}
 function consult(type){if(typeof window.openConsultation==='function'){window.openConsultation(type||'gift');return true}return openModal('consultModal')}
 function act(a){if(a==='home'){location.href='/';return} if(a==='products')return hiddenK7('products')||proxy('searchBtn')||openModal('searchModal');if(a==='custom')return consult('custom');if(a==='gift')return consult('gift');if(a==='brand')return hiddenK7('brand')||consult('gift');if(a==='search')return proxy('searchBtn')||openModal('searchModal');if(a==='mypage')return proxy('myTopBtn')||openModal('loginModal');if(a==='cart')return proxy('cartBtn')||openModal('cartModal')}
 root.addEventListener('click',e=>{const t=e.target.closest('[data-action]');if(t){e.preventDefault();act(t.dataset.action)}});
 const saved=localStorage.getItem('iroomV2SeasonMode'); const mode=['auto','spring','summer','autumn','winter'].includes(saved)?saved:'auto'; renderSeason(mode==='auto'?autoSeason():mode,mode);
 $$('.season-switcher button').forEach(b=>b.onclick=()=>{const m=b.dataset.season;localStorage.setItem('iroomV2SeasonMode',m);renderSeason(m==='auto'?autoSeason():m,m)});
})();
