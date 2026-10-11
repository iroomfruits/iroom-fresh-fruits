(()=>{
const A='./assets/home2-v91/';
const G='./assets/home2-v93/';
const V95='./assets/home2-v95/';
const V95_CARD=new Set(['autumn-chestnut','autumn-jujube','autumn-daebong','autumn-easypple','spring-apricot','summer-plum','summer-nectarine','winter-hallabong','winter-redhyang','winter-cheonhyehyang','winter-kiwi']);
const V95_HERO=new Set(['autumn-chestnut','spring-apricot','summer-plum','winter-hallabong','winter-redhyang','winter-cheonhyehyang']);
const IMPORT_ASSET_PATH='./assets/home2-v102/';
const IMPORT_CARD_ASSETS={
 'world-cherry':'world-cherry.png',
 'world-orange':'world-orange.png',
 'world-mango':'world-mango.png',
 'world-grapefruit':'world-grapefruit.png',
 'world-lemon':'world-lemon.png',
 'world-blueberry':'world-blueberry.png',
 'world-kiwi':'world-kiwi.png',
 'world-pineapple':'world-pineapple.png',
 'world-avocado':'world-avocado.png',
 'world-dragonfruit':'world-dragonfruit.png',
 'world-banana':'world-banana.png',
 'world-green-grape':'world-green-grape.png',
 'world-red-grape':'world-red-grape.png',
 'world-papaya':'world-papaya.png',
 'world-coconut':'world-coconut.png',
 'world-lime':'world-lime.png',
 'world-pomegranate':'world-pomegranate.png',
 'world-passionfruit':'world-passionfruit.png',
 'world-lychee':'world-lychee.png',
 'world-mangosteen':'world-mangosteen.png',
 'world-pomelo':'world-pomelo.png',
 'world-fig':'world-fig.png'
};
const KAKAO_OPEN_CHAT='https://open.kakao.com/o/sd7wnrKi';
const NOTICE=['IROOM NOTICE','오늘 받은 과일의 맛이나 상태가 기대에 미치지 않으면 상담 후 정성껏 다시 도와드립니다.','지금 가장 맛있는 과일을 엄선해 소개합니다.','신선한 과일은 상태에 맞춰 안전하게 포장해 보내드립니다.'];
const DATA={
 autumn:[
  {id:'autumn-shine',name:'샤인머스켓',origin:'국내산',pack:'2kg (3~4송이)',price:46000,asset:'card-approved-shine.png',heroAsset:'hero-approved-shine.png',grade:'GRADE AA'},
  {id:'autumn-pear',name:'신고배',origin:'국내산',pack:'3kg (6~8과)',price:38000,asset:'card-approved-pear.png',grade:'GRADE AA'},
  {id:'autumn-apple',name:'감홍 사과',origin:'국내산',pack:'2.5kg (8~10과)',price:32000,asset:'card-approved-apple.png',grade:'GRADE AA'},
  {id:'autumn-sweet-persimmon',name:'단감',origin:'국내산',pack:'3kg',price:28000,asset:'card-approved-persimmon.png',grade:'GRADE AA'},
  {id:'autumn-chestnut',name:'밤',origin:'국내산',pack:'1kg',price:42000,asset:'card-approved-chestnut.png',grade:'GRADE AA'},
  {id:'autumn-jujube',name:'사과대추',origin:'국내산',pack:'1kg',price:24000,asset:'card-approved-jujube.png',grade:'GRADE AA'},
  {id:'autumn-daebong',name:'대봉감',origin:'국내산',pack:'3kg (4~6과)',price:34000,asset:'soft-autumn-daebong.webp',grade:'GRADE AA'},
  {id:'autumn-easypple',name:'부사',origin:'국내산',pack:'1.2kg (12~16과)',price:36000,asset:'soft-autumn-easypple.webp',grade:'GRADE AA'}
 ],
 spring:[
  {id:'spring-strawberry',name:'딸기',origin:'국내산',pack:'500g',price:24000,asset:'soft-spring-strawberry.webp',grade:'GRADE AA'},
  {id:'spring-chamoe',name:'참외',origin:'국내산',pack:'2kg',price:28000,asset:'soft-spring-chamoe.webp',grade:'GRADE AA'},
  {id:'spring-shine',name:'샤인머스켓',origin:'국내산',pack:'2kg',price:46000,asset:'soft-spring-shine.webp',grade:'GRADE AA'},
  {id:'spring-apricot',name:'살구',origin:'국내산',pack:'1kg',price:36000,asset:'soft-spring-apricot.webp',grade:'GRADE AA'},
  {id:'spring-peach',name:'복숭아',origin:'국내산',pack:'2kg',price:34000,asset:'soft-spring-peach.webp',grade:'GRADE AA'}
 ],
 summer:[
  {id:'summer-watermelon',name:'수박',origin:'국내산',pack:'6~8kg',price:32000,asset:'soft-summer-watermelon.webp',grade:'GRADE AA'},
  {id:'summer-peach',name:'복숭아',origin:'국내산',pack:'2kg',price:34000,asset:'soft-summer-peach.webp',grade:'GRADE AA'},
  {id:'summer-melon',name:'멜론',origin:'국내산',pack:'2수',price:42000,asset:'soft-summer-melon.webp',grade:'GRADE AA'},
  {id:'summer-shine',name:'샤인머스켓',origin:'국내산',pack:'2kg',price:46000,asset:'soft-summer-shine.webp',grade:'GRADE AA'},
  {id:'summer-plum',name:'자두',origin:'국내산',pack:'1.5kg',price:24000,asset:'soft-summer-plum.webp',grade:'GRADE AA'},
  {id:'summer-nectarine',name:'천도복숭아',origin:'국내산',pack:'2kg',price:32000,asset:'soft-summer-nectarine.webp',grade:'GRADE AA'}
 ],
 winter:[
  {id:'winter-strawberry',name:'딸기',origin:'국내산',pack:'500g',price:24000,asset:'soft-winter-strawberry.webp',grade:'GRADE AA'},
  {id:'winter-hallabong',name:'한라봉',origin:'국내산',pack:'2kg',price:28000,asset:'soft-winter-hallabong.webp',grade:'GRADE AA'},
  {id:'winter-redhyang',name:'레드향',origin:'국내산',pack:'2kg',price:46000,asset:'soft-winter-redhyang.webp',grade:'GRADE AA'},
  {id:'winter-cheonhyehyang',name:'천혜향',origin:'국내산',pack:'2kg',price:42000,asset:'soft-winter-cheonhyehyang.webp',grade:'GRADE AA'},
  {id:'winter-apple',name:'사과',origin:'국내산',pack:'1.5kg',price:36000,asset:'soft-winter-apple.webp',grade:'GRADE AA'},
  {id:'winter-pear',name:'신고배',origin:'국내산',pack:'2kg',price:34000,asset:'soft-winter-pear.webp',grade:'GRADE AA'},
  {id:'winter-kiwi',name:'키위',origin:'국내산',pack:'1kg',price:34000,asset:'soft-winter-kiwi.webp',grade:'GRADE AA'}
 ]
 };
const GIFTS=[
 {id:'gift-premium',isGift:true,name:'프리미엄 제철 선물',origin:'이룸 셀렉트',pack:'샤인머스켓 · 신고배',price:76000,asset:'gift-premium.webp',grade:'PREMIUM GIFT'},
 {id:'gift-apple-pear',isGift:true,name:'사과·신고배 정성 선물',origin:'이룸 셀렉트',pack:'감홍 사과 · 신고배',price:62000,asset:'gift-apple-pear.webp',grade:'PREMIUM GIFT'},
 {id:'gift-corporate',isGift:true,name:'기업·단체 선물',origin:'이룸 비즈니스 셀렉트',pack:'샤인머스켓 · 신고배 · 한라봉',price:68000,asset:'gift-corporate.webp',grade:'PREMIUM GIFT'},
 {id:'gift-family',isGift:true,name:'가족 과일 선물',origin:'이룸 셀렉트',pack:'감홍 사과 · 샤인머스켓 · 신고배',price:54000,asset:'gift-family.webp',grade:'PREMIUM GIFT'},
 {id:'gift-select',isGift:true,name:'이룸 셀렉트 선물',origin:'이룸 프리미엄',pack:'샤인머스켓 · 감홍 사과 · 신고배 · 한라봉',price:89000,asset:'gift-select.webp',grade:'PREMIUM GIFT'},
 {id:'gift-thanks',isGift:true,name:'마음 담은 과일 선물',origin:'이룸 셀렉트',pack:'감홍 사과 · 신고배 · 샤인머스켓 · 한라봉',price:69000,asset:'gift-thanks.webp',grade:'PREMIUM GIFT'}
];
const WORLD_FRUITS=[
 {id:'world-cherry',name:'체리',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-cherry'],grade:'WORLD SELECT',imported:true},
 {id:'world-orange',name:'오렌지',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-orange'],grade:'WORLD SELECT',imported:true},
 {id:'world-mango',name:'망고',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-mango'],grade:'WORLD SELECT',imported:true},
 {id:'world-grapefruit',name:'자몽',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-grapefruit'],grade:'WORLD SELECT',imported:true},
 {id:'world-banana',name:'바나나',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-banana'],grade:'WORLD SELECT',imported:true},
 {id:'world-pineapple',name:'파인애플',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-pineapple'],grade:'WORLD SELECT',imported:true},
 {id:'world-avocado',name:'아보카도',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-avocado'],grade:'WORLD SELECT',imported:true},
 {id:'world-blueberry',name:'블루베리',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-blueberry'],grade:'WORLD SELECT',imported:true},
 {id:'world-lemon',name:'레몬',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-lemon'],grade:'WORLD SELECT',imported:true},
 {id:'world-kiwi',name:'그린키위',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-kiwi'],grade:'WORLD SELECT',imported:true},
 {id:'world-dragonfruit',name:'용과',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-dragonfruit'],grade:'WORLD SELECT',imported:true},
 {id:'world-green-grape',name:'청포도',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-green-grape'],grade:'WORLD SELECT',imported:true},
 {id:'world-red-grape',name:'적포도',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-red-grape'],grade:'WORLD SELECT',imported:true},
 {id:'world-papaya',name:'파파야',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-papaya'],grade:'WORLD SELECT',imported:true},
 {id:'world-coconut',name:'코코넛',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-coconut'],grade:'WORLD SELECT',imported:true},
 {id:'world-lime',name:'라임',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-lime'],grade:'WORLD SELECT',imported:true},
 {id:'world-pomegranate',name:'석류',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-pomegranate'],grade:'WORLD SELECT',imported:true},
 {id:'world-passionfruit',name:'패션프루트',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-passionfruit'],grade:'WORLD SELECT',imported:true},
 {id:'world-lychee',name:'리치',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-lychee'],grade:'WORLD SELECT',imported:true},
 {id:'world-mangosteen',name:'망고스틴',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-mangosteen'],grade:'WORLD SELECT',imported:true},
 {id:'world-pomelo',name:'포멜로',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-pomelo'],grade:'WORLD SELECT',imported:true},
 {id:'world-fig',name:'무화과',origin:'원산지 입고별 안내',pack:'입고 규격별',price:0,asset:IMPORT_CARD_ASSETS['world-fig'],grade:'WORLD SELECT',imported:true}
];
const month=(new Date()).getMonth()+1;
const CURRENT_SEASON=month>=3&&month<=5?'spring':month>=6&&month<=8?'summer':month>=9&&month<=11?'autumn':'winter';
const labels={spring:'봄',summer:'여름',autumn:'가을',winter:'겨울',import:'해외 셀렉트'};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=n=>n.toLocaleString('ko-KR')+'원';
const displayPrice=p=>p.imported&&!p.serverLinked?'입고 시세':fmt(p.price);
const importSelection=()=>{
 const ids=Array.isArray(home2Ux.worldFeaturedIds)?home2Ux.worldFeaturedIds:[];
 const ordered=ids.map(find).filter(p=>p&&p.imported);
 const fallback=WORLD_FRUITS.filter(p=>!ordered.some(x=>x.id===p.id));
 const count=Math.max(0,Math.min(8,Number(home2Ux.worldFeaturedCount)||4));
 return [...ordered,...fallback].slice(0,count);
};
const img=(p,kind='canvas')=>{
 if(p.isGift)return G+p.asset;
 if(kind!=='hero'&&IMPORT_CARD_ASSETS[p.id])return IMPORT_ASSET_PATH+IMPORT_CARD_ASSETS[p.id]+'?v=61.13.0';
 if(kind==='hero'&&V95_HERO.has(p.id))return V95+'hero-'+p.id+'.webp?v=61.13.0';
 if(kind!=='hero'&&V95_CARD.has(p.id))return V95+p.id+'.webp?v=61.13.0';
 return A+(kind==='hero'?'hero-':'')+p.id+'.webp';
};
const domesticProducts=()=>Object.values(DATA).flat();
const products=()=>[...domesticProducts(),...WORLD_FRUITS];
const all=()=>[...products(),...GIFTS]; const find=id=>all().find(p=>p.id===id);
const homeProducts=()=>DATA[CURRENT_SEASON];
let route='home',season=CURRENT_SEASON,heroIndex=0,slideIndex=0,slideDir=1,cart=[],lastFocus=null,timer=null,heroTimer=null,slideTimer=null,slideDragStart=null;
let authUser=null,siteConfig=null,paymentConfig=null,csrfToken='',csrfChecked=false,backendReady=false;
const curationSelected=new Set();

const HOME2_UX_DEFAULTS={
 showHomeSearch:true,
 searchAutocomplete:true,
 showFilterBar:true,
 showTrustBar:true,
 showMobileDock:true,
 guestCheckoutHint:true,
 showWorldSection:true,
 showWorldTab:true,
 worldFeaturedCount:4,
 worldFeaturedIds:['world-cherry','world-orange','world-mango','world-grapefruit'],
 searchPlaceholder:'과일 이름·품종을 검색하세요',
 trust1:'비회원도 바로 주문',
 trust2:'당일 상태 확인',
 trust3:'5만원 이상 기본배송 무료',
 trust4:'카카오 빠른 상담',
 weeklyEnabled:true,
 showWeeklyTeaser:true,
 weeklyTitle:'이번 주 맛있는 과일을 조금씩',
 weeklySubtitle:'많이 사지 않아도 여러 과일을 맛볼 수 있게, 이번 주 좋은 과일만 조금씩 골라드립니다.',
 weeklyDeadline:'화요일 밤 주문 마감',
 weeklyShipDate:'목~금 순차 발송',
 weeklyLimit:20,
 weeklyFruitNames:'',
 weeklyMiniEnabled:true,
 weeklyMiniName:'MINI',
 weeklyMiniLabel:'혼자 가볍게',
 weeklyMiniPrice:19900,
 weeklyMiniComposition:'3~4종 소분 구성',
 weeklyRegularEnabled:true,
 weeklyRegularName:'REGULAR',
 weeklyRegularLabel:'둘이 골고루',
 weeklyRegularPrice:29900,
 weeklyRegularComposition:'4~5종 소분 구성',
 weeklyFamilyEnabled:true,
 weeklyFamilyName:'FAMILY',
 weeklyFamilyLabel:'가족과 넉넉하게',
 weeklyFamilyPrice:39900,
 weeklyFamilyComposition:'5~6종 넉넉한 구성'
};
let home2Ux={...HOME2_UX_DEFAULTS};
let fruitQuery='',fruitAvailability='all',fruitSort='recommended';
const weeklyPreferred=new Set();
let recentViewed=[];


const esc=v=>String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
const nl2br=v=>esc(v).replace(/\n/g,'<br>');
const normalizeName=v=>String(v||'').toLowerCase().replace(/\s+/g,'').replace(/[·ㆍ.\-_/()]/g,'');
const SERVER_NAME_ALIASES={
 '샤인머스켓':['샤인머스켓'], '신고배':['신고배','나주배','배'], '감홍사과':['감홍사과','사과'], '단감':['단감'],
 '밤':['밤','공주밤'], '사과대추':['사과대추','경북대추','대추'], '대봉감':['대봉감'], '부사':['부사','이지플','이지플사과'],
 '딸기':['딸기'], '참외':['참외'], '체리':['체리'], '살구':['살구'], '복숭아':['복숭아'], '수박':['수박'], '멜론':['멜론'],
 '자두':['자두'], '천도복숭아':['천도복숭아'], '한라봉':['한라봉'], '레드향':['레드향'], '천혜향':['천혜향'], '키위':['키위'],
 '오렌지':['오렌지'], '망고':['망고'], '자몽':['자몽'], '체리':['체리'],
 '바나나':['바나나'], '파인애플':['파인애플'], '아보카도':['아보카도'], '블루베리':['블루베리'],
 '레몬':['레몬'], '그린키위':['그린키위'], '용과':['용과','드래곤프루트'], '청포도':['청포도'], '적포도':['적포도'],
 '파파야':['파파야'], '코코넛':['코코넛'], '라임':['라임'], '석류':['석류'], '패션프루트':['패션프루트'],
 '리치':['리치','여지'], '망고스틴':['망고스틴'], '포멜로':['포멜로'], '무화과':['무화과']
};
async function ensureCsrf(){
 if(csrfChecked)return csrfToken;
 csrfChecked=true;
 try{
  const r=await fetch('/api/security/csrf',{credentials:'same-origin',headers:{'Accept':'application/json','X-Iroom-Client':'home2-v61-world-fruit'}});
  if(r.ok){const d=await r.json();csrfToken=String(d.token||'')}
 }catch(_){csrfToken=''}
 return csrfToken;
}
async function api(path,{method='GET',body=null,headers={}}={}){
 method=method.toUpperCase();
 const h={'Accept':'application/json',...headers};
 if(!['GET','HEAD','OPTIONS'].includes(method)){
  const token=await ensureCsrf();
  if(token){h['X-Iroom-Client']='home2-v61-world-fruit';h['X-CSRF-Token']=token}
  if(body!==null && !(body instanceof FormData) && !h['Content-Type'])h['Content-Type']='application/json';
 }
 const r=await fetch(path,{method,body,headers:h,credentials:'same-origin'});
 let d={};try{d=await r.json()}catch(_){d={}}
 if(!r.ok){const err=new Error(d.error||`요청 처리 중 오류가 발생했습니다. (${r.status})`);err.status=r.status;throw err}
 return d;
}
function serverMatchFor(local,rows){
 const slugHit=rows.find(x=>String(x.slug||'')===local.id);if(slugHit)return slugHit;
 const key=normalizeName(local.name),aliases=SERVER_NAME_ALIASES[key]||[local.name];
 return rows.find(x=>aliases.some(a=>normalizeName(x.name)===normalizeName(a)))||null;
}
async function loadServerProducts(){
 try{
  const d=await api('/api/site/products');const rows=Array.isArray(d.products)?d.products:[];
  all().forEach(p=>{const hit=serverMatchFor(p,rows);if(!hit)return;p.serverId=Number(hit.id);p.serverSlug=String(hit.slug||'');p.serverLinked=true;p.stock=Math.max(0,Number(hit.stock)||0);p.price=Math.max(0,Number(hit.price)||0);if(hit.unit)p.serverUnit=String(hit.unit)});
  backendReady=true;
 }catch(e){console.warn('[HOME2 products]',e.message)}
}
async function loadSiteConfig(){
 try{const d=await api('/api/site/footer-config');if(d&&d.ok)siteConfig=d}catch(e){console.warn('[HOME2 footer]',e.message)}
}
async function loadHome2Ux(){
 try{
  const d=await api('/api/site/homepage-config');
  const saved=d?.config?.home2Ux&&typeof d.config.home2Ux==='object'?d.config.home2Ux:{};
  home2Ux={...HOME2_UX_DEFAULTS,...saved};
  if(!Array.isArray(home2Ux.worldFeaturedIds))home2Ux.worldFeaturedIds=[...HOME2_UX_DEFAULTS.worldFeaturedIds];
 }catch(e){console.warn('[HOME2 UX]',e.message);home2Ux={...HOME2_UX_DEFAULTS}}
}
function loadRecentViewed(){
 try{const x=JSON.parse(localStorage.getItem('iroom-home2-recent')||'[]');recentViewed=Array.isArray(x)?x.filter(id=>find(id)).slice(0,8):[]}catch{recentViewed=[]}
}
function rememberViewed(id){
 if(!find(id))return;
 recentViewed=[id,...recentViewed.filter(x=>x!==id)].slice(0,8);
 try{localStorage.setItem('iroom-home2-recent',JSON.stringify(recentViewed))}catch{}
}
function recentProducts(){return recentViewed.map(find).filter(Boolean)}
async function loadPaymentConfig(){try{paymentConfig=await api('/api/payment/config')}catch(_){paymentConfig={toss_enabled:false}}}
async function loadMe(){try{const d=await api('/api/me');authUser=d.user||null}catch(_){authUser=null}}
function orderable(p){return !!p?.serverLinked && Number(p.stock)!==0}
function stockLabel(p){if(!p?.serverLinked)return '';if(Number(p.stock)<=0)return '품절';if(Number(p.stock)<=3)return `잔여 ${p.stock}`;return ''}
function itemForServer(id,qty=1){const p=find(id);if(!p||!p.serverLinked)return null;return {product_id:p.serverId,qty:Math.max(1,Math.min(Number(p.stock)||20,Number(qty)||1))}}
function currentKakao(){return siteConfig?.site?.kakaoEnabled&&siteConfig?.site?.kakaoUrl?siteConfig.site.kakaoUrl:KAKAO_OPEN_CHAT}

function setNotice(){const slides=$('#noticeSlides');if(!slides)return;let second=false;setInterval(()=>{second=!second;slides.classList.toggle('showSecond',second)},4600)}
function card(p,compact=false){const sold=p.serverLinked&&Number(p.stock)<=0;const pending=p.imported&&!p.serverLinked;const badge=stockLabel(p);return `<article class="productCard ${p.imported?'worldProductCard ':''}${sold?'soldOut':''}"><button type="button" class="productImgBtn" data-product="${p.id}" aria-label="${p.name} 상세보기"><img src="${img(p)}" alt="${p.name}" decoding="async"></button><div class="productName">${p.name}${p.imported?'<small class="worldBadge">WORLD SELECT</small>':''}${badge?`<small class="stockBadge">${badge}</small>`:''}</div><div class="productSpec">${p.grade}<br>${p.pack} · ${p.origin}</div><div class="productPrice">${displayPrice(p)}</div>${pending?`<button class="cartBar worldInquiry" data-kakao><span>입고 · 시세 문의</span><span>→</span></button>`:`<button class="cartBar" data-add="${p.id}" ${sold?'disabled':''}><span>${sold?'SOLD OUT':'ADD TO CART'}</span><span>${sold?'':'＋'}</span></button>`}</article>`}
function playFruitSmile(el){const host=el?.closest?.('.productImgBtn,.weeklyFruitView,.pickFruitVisual,[data-weekly-choice],.weeklyMiniFruits button')||el;if(!host)return;host.classList.remove('smilePulse');void host.offsetWidth;host.classList.add('smilePulse');const prev=host.querySelector('.fruitSmileFx');if(prev)prev.remove();const fx=document.createElement('span');fx.className='fruitSmileFx';fx.setAttribute('aria-hidden','true');fx.innerHTML='<i class="eye left"></i><i class="eye right"></i><i class="cheek left"></i><i class="cheek right"></i><i class="mouth"></i>';host.appendChild(fx);setTimeout(()=>host.classList.remove('smilePulse'),820);setTimeout(()=>fx.remove(),1050)}
function openFruitDetailWithSmile(host,id){if(!id)return;playFruitSmile(host);setTimeout(()=>openDetail(id),420)}


function ensureTopNav(){
 const nav=$('.nav');if(!nav)return;
 nav.innerHTML=`<button class="navItem" data-route="fruits"><span class="navIcon">⌁</span><span class="navText"><b>Seasonal Picks</b><small>제철 과일</small></span></button>
 <button class="navItem" data-route="weekly"><span class="navIcon">◌</span><span class="navText"><b>Weekly Pick</b><small>이번 주 과일</small></span></button>
 <button class="navItem" data-route="curation"><span class="navIcon">⌘</span><span class="navText"><b>Fruit Curation</b><small>맞춤 과일</small></span></button>
 <button class="navItem" data-route="gifts"><span class="navIcon">▣</span><span class="navText"><b>Gift Selection</b><small>선물세트</small></span></button>
 <button class="navItem" data-route="story"><span class="navIcon">▤</span><span class="navText"><b>Brand Story</b><small>이룸 이야기</small></span></button>`;
 $$('.navItem').forEach(n=>n.classList.toggle('active',n.dataset.route===route));
}

function weeklyFruitNameList(){
 const manual=String(home2Ux.weeklyFruitNames||'').split(',').map(x=>x.trim()).filter(Boolean);
 if(manual.length)return manual;
 return weeklyChoicePool().map(p=>p.name);
}
function weeklyChoicePool(){
 const domestic=[...(DATA[CURRENT_SEASON]||[])];
 const imported=[...WORLD_FRUITS].slice(0,8);
 const seen=new Set(),out=[];
 [...domestic,...imported].forEach(p=>{const k=normalizeName(p.name);if(!seen.has(k)){seen.add(k);out.push(p)}});
 return out;
}
function weeklyFruitEntries(){
 return weeklyChoicePool().map(p=>({name:p.name,p}));
}
function weeklyPlans(){
 return [
  {key:'mini',enabled:home2Ux.weeklyMiniEnabled!==false,name:home2Ux.weeklyMiniName||'MINI',label:home2Ux.weeklyMiniLabel||'혼자 가볍게',price:Number(home2Ux.weeklyMiniPrice)||0,composition:home2Ux.weeklyMiniComposition||'3~4종 소분 구성'},
  {key:'regular',enabled:home2Ux.weeklyRegularEnabled!==false,name:home2Ux.weeklyRegularName||'REGULAR',label:home2Ux.weeklyRegularLabel||'둘이 골고루',price:Number(home2Ux.weeklyRegularPrice)||0,composition:home2Ux.weeklyRegularComposition||'4~5종 소분 구성'},
  {key:'family',enabled:home2Ux.weeklyFamilyEnabled!==false,name:home2Ux.weeklyFamilyName||'FAMILY',label:home2Ux.weeklyFamilyLabel||'가족과 넉넉하게',price:Number(home2Ux.weeklyFamilyPrice)||0,composition:home2Ux.weeklyFamilyComposition||'5~6종 넉넉한 구성'}
 ].filter(x=>x.enabled);
}
function weeklyPrice(v){return Number(v)>0?fmt(Number(v)):'가격 문의'}
function weeklyTeaser(){
 if(!home2Ux.weeklyEnabled||!home2Ux.showWeeklyTeaser)return '';
 const fruits=weeklyFruitEntries().slice(0,4),plans=weeklyPlans();
 return `<section class="weeklyTeaserV12 homeSection">
  <div class="weeklyTeaserLead"><span class="eyebrow">WEEKLY PICK · 이번 주 과일</span><h2>${esc(home2Ux.weeklyTitle||'이번 주 맛있는 과일을 조금씩')}</h2><p>${esc(home2Ux.weeklySubtitle||'이번 주 좋은 과일만 조금씩 골라드립니다.')}</p><div class="weeklyPlanMini">${plans.map(x=>`<span><b>${esc(x.name)}</b>${weeklyPrice(x.price)}</span>`).join('')}</div><button class="weeklyPrimaryCta" data-route="weekly">이번 주 구성 자세히 보기 →</button></div>
  <div class="weeklyTeaserVisual"><div class="weeklyMiniFruits">${fruits.map(x=>x.p?`<button data-product="${x.p.id}" aria-label="${esc(x.name)} 상세보기"><img src="${img(x.p)}" alt="${esc(x.name)}"><b>${esc(x.name)}</b></button>`:`<span><b>${esc(x.name)}</b></span>`).join('')}</div><div class="weeklyMiniFlow" aria-label="Weekly Pick 이용 흐름"><div><i>①</i><b>과일 고르기</b></div><span>→</span><div><i>②</i><b>박스 선택</b></div><span>→</span><div><i>③</i><b>예약 접수</b></div><span>→</span><div><i>④</i><b>주간 수령</b></div></div></div>
 </section>`;
}

function weeklySelectedProducts(){return [...weeklyPreferred].map(find).filter(Boolean)}
function weeklySelectionSummary(){
 const selected=weeklySelectedProducts(),plans=weeklyPlans();
 if(!selected.length)return `<div class="weeklySelectionSummary" id="weeklySelectionSummary"><div class="weeklySelectionEmpty"><b>과일을 고르면 여기에 모입니다.</b><span>선택한 과일은 예약 신청서의 <strong>선호 과일</strong>에 자동으로 들어갑니다.</span></div><div class="weeklySelectionActions">${plans.map(x=>`<button data-weekly-plan="${x.key}">${esc(x.name)} 예약</button>`).join('')}</div></div>`;
 return `<div class="weeklySelectionSummary hasSelection" id="weeklySelectionSummary"><div><span class="eyebrow">MY WEEKLY PICK</span><h3>내가 고른 선호 과일 <b>${selected.length}/5</b></h3><p>아래 과일이 예약 신청서에 자동으로 반영됩니다. 다시 누르면 선택을 해제할 수 있어요.</p><div class="weeklySelectedChips">${selected.map(p=>`<button type="button" data-weekly-choice="${p.id}" title="${esc(p.name)} 선택 해제"><img src="${img(p)}" alt=""><span>${esc(p.name)}</span><i>×</i></button>`).join('')}</div></div><div class="weeklySelectionActions"><small>플랜을 고르면 이 선택으로 예약을 이어갑니다.</small>${plans.map(x=>`<button data-weekly-plan="${x.key}">${esc(x.name)} 예약</button>`).join('')}</div></div>`;
}
function refreshWeeklySelectionUI(){
 const c=$('#weeklyChoiceCount');if(c)c.textContent=weeklyPreferred.size;
 $$('#weeklyFruitGrid [data-weekly-choice-card]').forEach(card=>{
  const id=card.dataset.weeklyChoiceCard,on=weeklyPreferred.has(id);
  card.classList.toggle('selected',on);
  const btn=card.querySelector('[data-weekly-choice]');if(btn)btn.setAttribute('aria-pressed',on?'true':'false');
  const mark=card.querySelector('.weeklyChoiceMark');if(mark)mark.textContent=on?'✓':'+';
 });
 const box=$('#weeklySelectionSummary');if(box)box.outerHTML=weeklySelectionSummary();
}
function weeklyModalFruitGrid(){
 return weeklyChoicePool().map(p=>{
  const on=weeklyPreferred.has(p.id);
  return `<button type="button" class="weeklyModalFruit ${on?'selected':''}" data-weekly-modal-prefer="${p.id}"><span class="weeklyModalImg"><img src="${img(p)}" alt="${esc(p.name)}"><i>${on?'✓':'+'}</i></span><b>${esc(p.name)}</b><small>${p.imported?'해외':'제철'}</small></button>`;
 }).join('');
}
function refreshWeeklyModalUI(){
 const pg=$('#weeklyModalPreferGrid');
 if(pg)pg.innerHTML=weeklyModalFruitGrid();
 const pc=$('#weeklyModalPreferCount');if(pc)pc.textContent=weeklyPreferred.size;
}

function weeklyFruitGrid(){
 return weeklyChoicePool().map(p=>`<article class="weeklyFruit weeklyChoice ${weeklyPreferred.has(p.id)?'selected':''}" data-weekly-choice-card="${p.id}"><button type="button" class="weeklyFruitView" data-fruit-detail="${p.id}" aria-label="${esc(p.name)} 상세보기"><img src="${img(p)}" alt="${esc(p.name)}"></button><button type="button" class="weeklyChoiceToggle" data-weekly-choice="${p.id}" aria-pressed="${weeklyPreferred.has(p.id)?'true':'false'}"><span class="weeklyChoiceMark">${weeklyPreferred.has(p.id)?'✓':'+'}</span><span class="weeklyChoiceLabel">${weeklyPreferred.has(p.id)?'선택됨':'선택'}</span></button><b>${esc(p.name)}</b><small>${p.imported?'해외 셀렉트':labels[CURRENT_SEASON]+' 제철'} · ${esc(p.origin||'입고 기준')}</small></article>`).join('');
}
function weeklyPage(){
 if(!home2Ux.weeklyEnabled)return `<section class="routePage"><div class="routeHero"><div><span class="eyebrow">WEEKLY PICK</span><h1>이번 주 과일</h1></div><p>현재 이번 주 과일 예약을 준비하고 있습니다.</p></div><div class="weeklyClosed"><b>이번 주 PICK 준비 중</b><span>구성이 확정되면 다시 열어드릴게요.</span><button data-kakao>카카오로 문의</button></div></section>`;
 const plans=weeklyPlans();
 return `<section class="routePage weeklyPage weeklyPageV12">
  <div class="weeklyStoryHero"><div class="weeklyStoryCopy"><span class="eyebrow">WEEKLY PICK · 이번 주 과일</span><h1>${esc(home2Ux.weeklyTitle||'이번 주 맛있는 과일을 조금씩')}</h1><p>${esc(home2Ux.weeklySubtitle||'이번 주 좋은 과일만 조금씩 골라드립니다.')}</p><div class="weeklyStatus"><span><b>주문 마감</b>${esc(home2Ux.weeklyDeadline||'화요일 밤')}</span><span><b>발송 예정</b>${esc(home2Ux.weeklyShipDate||'목~금')}</span><span><b>한정 수량</b>${Math.max(1,Number(home2Ux.weeklyLimit)||20)}세트</span></div></div><div class="weeklyStoryIllustration"><div class="weeklySketchCard fruit"><span>🍎</span><b>좋아하는 과일</b><small>최대 5개 선택</small></div><div class="weeklySketchArrow">→</div><div class="weeklySketchCard box"><span>▣</span><b>먹을 만큼</b><small>MINI · REGULAR · FAMILY</small></div></div></div>

  <section class="weeklyStoryFlow"><div class="weeklyFlowItem"><span class="weeklyFlowIcon">①</span><div><b>과일을 고릅니다</b><p>국산 제철과일과 해외 셀렉트에서 마음에 드는 과일을 이미지로 고르세요.</p></div></div><div class="weeklyFlowLine"></div><div class="weeklyFlowItem"><span class="weeklyFlowIcon">②</span><div><b>상자 크기를 고릅니다</b><p>혼자 먹기 좋은 MINI부터 가족용 FAMILY까지 필요한 만큼만 선택합니다.</p></div></div><div class="weeklyFlowLine"></div><div class="weeklyFlowItem"><span class="weeklyFlowIcon">③</span><div><b>예약을 접수합니다</b><p>자동 정기결제가 아니라 이번 주 1회 예약입니다.</p></div></div><div class="weeklyFlowLine"></div><div class="weeklyFlowItem"><span class="weeklyFlowIcon">④</span><div><b>좋은 과일을 받아봅니다</b><p>주문 수량을 확인한 뒤 경매·선별·소분해 안내한 일정에 보내드립니다.</p></div></div></section>

  <section class="weeklyPlanSection"><div class="weeklySectionLead"><span class="eyebrow">CHOOSE YOUR BOX</span><h2>이번 주 상자 선택</h2><p>처음이라면 MINI부터 가볍게 체험해 보세요.</p></div><div class="weeklyPlanGrid">${plans.map((x,i)=>`<article class="weeklyPlan ${i===1?'featured':''}"><span class="weeklyPlanNo">0${i+1}</span><small>${esc(x.label)}</small><h2>${esc(x.name)}</h2><p>${esc(x.composition)}</p><strong>${weeklyPrice(x.price)}</strong><button data-weekly-plan="${x.key}">이번 주 1회 예약 신청</button></article>`).join('')}</div></section>

  <section class="weeklyFruitSection weeklyFruitSectionV12"><div class="sectionHead"><div><span class="eyebrow">PICK YOUR FAVORITES</span><h2>이번 주 선택 가능 과일</h2><p>마음에 드는 과일을 최대 5개까지 고르세요. 아래 선택 상자에 모이고 예약 신청서로 바로 이어집니다.</p></div><div class="weeklyChoiceCounter"><b id="weeklyChoiceCount">${weeklyPreferred.size}</b>/5 선택</div></div><div class="weeklyFruitGrid" id="weeklyFruitGrid">${weeklyFruitGrid()}</div>${weeklySelectionSummary()}</section>

  <section class="weeklyBehind"><div class="weeklyBehindCopy"><span class="eyebrow">HOW IROOM PREPARES</span><h2>주문받고 준비하니까<br>재고 부담을 줄일 수 있어요.</h2><p>예약 수량을 먼저 확인한 뒤 그 주 경매와 입고 상태를 보고 좋은 과일을 고릅니다. 그래서 매주 똑같은 구성보다 그 주 맛있는 과일을 더 유연하게 담을 수 있습니다.</p></div><div class="weeklyBehindSteps"><div><span>01</span><b>예약 수량 확인</b></div><div><span>02</span><b>경매 · 매입</b></div><div><span>03</span><b>선별 · 소분</b></div><div><span>04</span><b>포장 · 발송</b></div></div></section>

  <section class="weeklyBottom weeklyBottomV12"><div><span class="eyebrow">START SMALL</span><h2>많이 사지 않아도 괜찮아요.</h2><p>이번 주 한 번만 받아보고, 마음에 들면 다음 주에 다시 고르세요. 정기결제 없이 가볍게 시작합니다.</p></div><button data-weekly-plan="${plans[0]?.key||'mini'}">이번 주 맛보기 예약 →</button></section>
 </section>`;
}
function openWeeklyReserve(key){
 const plan=weeklyPlans().find(x=>x.key===key)||weeklyPlans()[0];if(!plan)return;
 openUtility('이번 주 과일 예약',`<div class="weeklyReserveIntro"><span>WEEKLY PICK · ${esc(plan.name)}</span><b>${esc(plan.label)} · ${weeklyPrice(plan.price)}</b><p>자동결제가 아닌 이번 주 1회 예약입니다.</p></div><form class="formGrid" id="weeklyReserveForm" data-plan="${esc(plan.key)}"><label>이름<input id="weeklyName" required autocomplete="name" value="${esc(authUser?.name||'')}"></label><label>연락처<input id="weeklyPhone" required inputmode="tel" autocomplete="tel" value="${esc(authUser?.phone||'')}"></label><label>이메일 <small>(선택)</small><input id="weeklyEmail" type="email" autocomplete="email" value="${esc(authUser?.email||'')}"></label><label>맛 취향<select id="weeklyTaste"><option>골고루</option><option>달콤한 과일 위주</option><option>새콤달콤</option><option>부드러운 과일 위주</option></select></label>
 <section class="weeklyModalChoiceSection full"><div class="weeklyModalChoiceHead"><div><b>넣고 싶은 과일</b><span>이미지를 눌러 최대 5개까지 골라주세요.</span></div><strong><i id="weeklyModalPreferCount">${weeklyPreferred.size}</i>/5</strong></div><div class="weeklyModalFruitGrid" id="weeklyModalPreferGrid">${weeklyModalFruitGrid()}</div></section>
 <label class="full">요청사항 <small>(선택)</small><textarea id="weeklyMemo" rows="3" maxlength="1000" placeholder="알레르기, 수령 관련 요청 등을 적어주세요."></textarea></label><button class="primaryFormBtn full" type="submit">선택 내용으로 이번 주 1회 예약 신청</button></form>`);
}
async function submitWeeklyReserve(form){
 const plan=weeklyPlans().find(x=>x.key===form.dataset.plan)||weeklyPlans()[0];if(!plan)return;
 try{
  const taste=$('#weeklyTaste').value,memo=$('#weeklyMemo').value.trim();
  const preferred=weeklySelectedProducts().map(p=>p.name).join(', ');
  const message=[`플랜: ${plan.name}`,preferred?`선호 과일: ${preferred}`:'선호 과일: 선택 없음',`취향: ${taste}`,memo?`추가 요청: ${memo}`:''].filter(Boolean).join('\n');
  const d=await api('/api/consultations',{method:'POST',body:JSON.stringify({guide_type:'이룸홈2 Weekly Pick 예약',customer_name:$('#weeklyName').value,phone:$('#weeklyPhone').value,email:$('#weeklyEmail').value,budget:weeklyPrice(plan.price),preferred_fruits:preferred||'선택 없음',message})});
  openUtility('이번 주 예약이 접수되었습니다',`<div class="orderSuccess"><span>예약 상담번호</span><b>${esc(d.consult_no)}</b><p>주문 마감 후 수량과 입고 상태를 확인해 연락드리겠습니다.</p></div><div class="utilityActions"><button class="dark" data-kakao>카카오로 이어서 상담</button></div>`);
 }catch(e){toast(e.message)}
}

function trustBar(){
 if(!home2Ux.showTrustBar)return '';
 const free=Number(siteConfig?.site?.freeShippingFrom||50000).toLocaleString('ko-KR')+'원 이상 기본배송 무료';
 const items=[home2Ux.trust1||'비회원도 바로 주문',home2Ux.trust2||'당일 상태 확인',home2Ux.trust3||free,home2Ux.trust4||'카카오 빠른 상담'];
 return `<div class="homeTrustBar">${items.map((x,i)=>`<button type="button" ${i===3?'data-kakao':i===0?'data-route="fruits"':'data-footer-info="delivery"'}><span>${['✓','◎','🚚','K'][i]}</span><b>${esc(x)}</b></button>`).join('')}</div>`;
}
function homeSearchBlock(){
 if(!home2Ux.showHomeSearch)return '';
 return `<div class="homeSearchWrap"><div class="homeSearchBar"><input id="homeQuickSearch" type="search" autocomplete="off" placeholder="${esc(home2Ux.searchPlaceholder||HOME2_UX_DEFAULTS.searchPlaceholder)}"><button type="button" data-home-search-go>검색</button></div><div class="homeSearchSuggest" id="homeSearchSuggest" hidden></div></div>`;
}
function recentSection(){
 if(!home2Ux.showRecent)return '';
 const ps=recentProducts().slice(0,4);
 if(!ps.length)return '';
 return `<section class="section homeSection recentSection"><div class="sectionHead"><div><h2>최근 본 과일 <span>RECENTLY VIEWED</span></h2></div><button class="textLink" data-clear-recent>기록 지우기</button></div><div class="recentGrid">${ps.map(p=>card(p,true)).join('')}</div></section>`;
}
function productPoolForFruitPage(){
 return season==='all'?products():season==='import'?WORLD_FRUITS:(DATA[season]||[]);
}
function filteredFruitProducts(){
 let ps=[...productPoolForFruitPage()];
 const q=normalizeName(fruitQuery);
 if(q)ps=ps.filter(p=>[p.name,p.origin,p.pack,p.grade].some(v=>normalizeName(v).includes(q)));
 if(fruitAvailability==='available')ps=ps.filter(p=>p.serverLinked&&Number(p.stock)>0);
 if(fruitAvailability==='inquiry')ps=ps.filter(p=>p.imported&&!p.serverLinked);
 if(fruitSort==='priceAsc')ps.sort((a,b)=>(a.serverLinked?a.price:Number.MAX_SAFE_INTEGER)-(b.serverLinked?b.price:Number.MAX_SAFE_INTEGER));
 else if(fruitSort==='priceDesc')ps.sort((a,b)=>(b.serverLinked?b.price:-1)-(a.serverLinked?a.price:-1));
 else if(fruitSort==='name')ps.sort((a,b)=>a.name.localeCompare(b.name,'ko'));
 return ps;
}
function fruitSuggestionRows(q,limit=6){
 const k=normalizeName(q);if(!k)return [];
 return all().filter(p=>normalizeName(p.name).includes(k)||normalizeName(p.origin).includes(k)).slice(0,limit);
}
function renderFruitGrid(){
 const grid=$('#fruitCatalogGrid'),count=$('#fruitResultCount');if(!grid)return;
 const ps=filteredFruitProducts();
 grid.innerHTML=ps.length?ps.map(p=>card(p)).join(''):`<div class="fruitEmpty"><b>조건에 맞는 과일이 없습니다.</b><span>검색어를 줄이거나 필터를 초기화해 보세요.</span><div><button data-fruit-reset>필터 초기화</button><button class="dark" data-kakao>카카오로 문의</button></div></div>`;
 if(count)count.textContent=`${ps.length}개 상품`;
}
function renderFruitSuggestions(q){
 const box=$('#fruitSearchSuggest');if(!box)return;
 const rows=home2Ux.searchAutocomplete?fruitSuggestionRows(q):[];
 box.innerHTML=rows.map(p=>`<button type="button" data-suggest-product="${p.id}"><img src="${img(p)}" alt=""><span><b>${esc(p.name)}</b><small>${esc(p.origin)} · ${displayPrice(p)}</small></span></button>`).join('');
 box.hidden=!rows.length;
}
function renderHomeSearchSuggestions(q){
 const box=$('#homeSearchSuggest');if(!box)return;
 const rows=home2Ux.searchAutocomplete?fruitSuggestionRows(q,5):[];
 box.innerHTML=rows.map(p=>`<button type="button" data-suggest-product="${p.id}"><img src="${img(p)}" alt=""><span><b>${esc(p.name)}</b><small>${esc(p.origin)}</small></span></button>`).join('');
 box.hidden=!rows.length;
}
function quickDock(){
 let el=$('#home2QuickDock');
 if(!home2Ux.showMobileDock){if(el)el.remove();return}
 if(!el){el=document.createElement('nav');el.id='home2QuickDock';el.className='home2QuickDock';document.body.appendChild(el)}
 el.innerHTML=`<button data-search><span>⌕</span><b>검색</b></button><button data-route="fruits"><span>◫</span><b>제철</b></button><button data-route="weekly"><span>W</span><b>이번 주</b></button><button data-cart><span>▱</span><b>장바구니</b><i>${cart.reduce((s,x)=>s+x.qty,0)||''}</i></button><button data-kakao><span>K</span><b>상담</b></button>`;
}
function curation(i,title,sub,items){const ps=Array.isArray(items)?items:[items];const ids=ps.map(p=>p.id).join(',');return `<article class="curationCard"><div class="curationText"><h3>${title}</h3><p>${sub}</p><button class="smallArrow" data-curation="${ids}" aria-label="${title} 맞춤 구성 보기">→</button></div><button class="curationImg multi" data-curation="${ids}" aria-label="${title} 맞춤 구성 보기">${ps.slice(0,4).map(p=>`<img src="${img(p)}" alt="${p.name}" decoding="async">`).join('')}</button></article>`}
function home(){const ps=homeProducts();const h=ps[heroIndex%Math.min(ps.length,5)];const imports=importSelection();return `<div class="shell">
<section class="hero homeSection"><div class="heroCopy"><span class="eyebrow">SEASONAL FRUITS</span><h1>햇살 아래,<br>싱그러운 일상</h1><p>계절이 건네는 가장 좋은 과일을<br>이룸이 정성껏 전해드립니다.</p><button class="outlineBtn" id="heroCta" data-product="${h.id}">지금, ${h.name} 만나보기 →</button><div class="heroDots">${ps.slice(0,5).map((p,i)=>`<button class="dotBtn ${i===heroIndex?'active':''}" data-hero="${i}">${String(i+1).padStart(2,'0')}</button>`).join('')}</div></div><div class="heroVisual"><img id="heroImage" data-product="${h.id}" src="${img(h,'hero')}" alt="${h.name}" fetchpriority="high" decoding="async"><div class="heroMeta">이번 계절의 특별함<br><b id="heroMetaName">${h.name}</b></div></div><div class="heroArrows"><button class="circleArrow" data-hero-prev>‹</button><button class="circleArrow" data-hero-next>›</button></div></section>
<section class="section homeSection seasonalFeatureSection"><div class="seasonalFeatureIntro"><div><span class="eyebrow">SEASONAL PICKS</span><h2>지금, 가장 맛있는 제철 과일</h2><p>이룸이 가장 먼저 보여드리는 중심 셀렉트입니다.<br>지금 계절에 좋은 국산 과일을 한눈에 만나보세요.</p></div><button class="textLink" data-route="fruits">전체 상품 보기 →</button></div><div class="sliderWrap"><button class="sliderBtn prev" data-slide-prev aria-label="이전 제철과일">‹</button><div class="cardsViewport" id="cardsViewport"><div class="cardsTrack" id="cardsTrack">${ps.map(p=>card(p)).join('')}</div></div><button class="sliderBtn next" data-slide-next aria-label="다음 제철과일">›</button><div class="sliderDots" id="sliderDots" aria-label="제철과일 슬라이드 위치"></div></div></section>
${home2Ux.showWorldSection?`<section class="section homeSection worldSimpleSection"><div class="sectionHead"><div><h2>해외 과일 셀렉트 <span>WORLD FRUIT SELECT</span></h2></div>${home2Ux.showWorldTab?'<button class="textLink" data-open-import>해외 셀렉트 전체 보기 →</button>':''}</div><div class="worldGrid">${imports.map(p=>card(p)).join('')}</div><p class="worldNote">해외 과일은 입고 시기와 원산지가 달라질 수 있어 실제 판매 시 원산지·가격·규격을 다시 안내합니다.</p></section>`:''}
${weeklyTeaser()}
<section class="section homeSection"><div class="sectionHead"><div><h2>맞춤 과일 <span>FRUIT CURATION</span></h2></div><button class="textLink" data-route="curation">나에게 맞는 과일 찾기 →</button></div><div class="curationGrid">${curation(0,'아침을 여는 과일','상쾌하게 골라 담는 3가지 구성',[ps[2%ps.length],ps[1%ps.length],ps[0]])}${curation(1,'정성을 전하는 구성','마음을 담아 여러 과일을 함께',[ps[0],ps[1%ps.length],ps[2%ps.length]])}${curation(2,'가족을 위한 한 상자','부드럽고 편안한 과일을 골고루',[ps[3%ps.length],ps[2%ps.length],ps[1%ps.length]])}</div></section>
<section class="homeSection"><div class="storyStrip"><span class="eyebrow">BRAND STORY</span><h3>좋은 과일이 만드는<br>더 나은 일상, 이룸</h3><p>제철의 신선함을 쉽게 고르고 편하게 받을 수 있도록,<br>이룸은 좋은 과일을 정성껏 선별합니다.</p><button class="storyBtn" data-route="story">이룸의 이야기 보기 →</button></div></section>
<section class="homeBottomGuide"><div class="homeBottomGuideHead"><span class="eyebrow">SHOPPING GUIDE</span><b>편하게 주문하세요</b></div>${trustBar()}</section>
</div>`}
function fruitsPage(){const ps=filteredFruitProducts();return `<section class="routePage fruitsRoutePage"><div class="routeHero routeHeroTheme seasonalRouteHero"><div><span class="eyebrow">FRUIT SELECT</span><h1>과일 셀렉트</h1></div><p>국산 제철 과일과 해외 과일을 구분해 보고, 검색·필터·정렬로 원하는 과일을 빠르게 찾을 수 있습니다.</p></div>
${home2Ux.showFilterBar?`<div class="fruitFinder"><div class="fruitSearch"><input id="fruitSearchInput" type="search" value="${esc(fruitQuery)}" placeholder="${esc(home2Ux.searchPlaceholder||HOME2_UX_DEFAULTS.searchPlaceholder)}" autocomplete="off"><button type="button" data-fruit-search-clear>지우기</button><div class="fruitSearchSuggest" id="fruitSearchSuggest" hidden></div></div><div class="fruitFinderRow"><select id="fruitAvailability"><option value="all" ${fruitAvailability==='all'?'selected':''}>전체 상태</option><option value="available" ${fruitAvailability==='available'?'selected':''}>바로 주문 가능</option><option value="inquiry" ${fruitAvailability==='inquiry'?'selected':''}>입고 문의</option></select><select id="fruitSort"><option value="recommended" ${fruitSort==='recommended'?'selected':''}>추천순</option><option value="priceAsc" ${fruitSort==='priceAsc'?'selected':''}>가격 낮은순</option><option value="priceDesc" ${fruitSort==='priceDesc'?'selected':''}>가격 높은순</option><option value="name" ${fruitSort==='name'?'selected':''}>이름순</option></select><span id="fruitResultCount">${ps.length}개 상품</span><button type="button" data-fruit-reset>필터 초기화</button></div></div>`:''}
<div class="seasonTabs"><button class="seasonTab ${season==='all'?'active':''}" data-season="all">전체</button>${Object.keys(DATA).map(s=>`<button class="seasonTab ${s===season?'active':''}" data-season="${s}">${labels[s]}</button>`).join('')}${home2Ux.showWorldTab?`<button class="seasonTab ${season==='import'?'active':''}" data-season="import">해외 셀렉트</button>`:''}</div><div class="catalogGrid" id="fruitCatalogGrid">${ps.length?ps.map(p=>card(p)).join(''):`<div class="fruitEmpty"><b>조건에 맞는 과일이 없습니다.</b><span>검색어를 줄이거나 필터를 초기화해 보세요.</span><div><button data-fruit-reset>필터 초기화</button><button class="dark" data-kakao>카카오로 문의</button></div></div>`}</div></section>`}
function curationPage(){const ps=homeProducts().concat(DATA.winter,DATA.spring,DATA.summer).filter((p,i,a)=>a.findIndex(x=>x.id===p.id)===i).slice(0,15);return `<section class="routePage curationRoutePage"><div class="routeHero routeHeroTheme curationRouteHero"><div><span class="eyebrow">FRUIT CURATION</span><h1>맞춤 과일</h1></div><p>한 가지 과일만 고르는 대신, 원하는 과일을 여러 가지 골라 나만의 구성을 만들 수 있습니다.</p></div><div class="curationBuilder"><div class="pickPanel"><h2>원하는 과일을 골라보세요</h2><p class="pickPanelLead">최대 6종까지 자유롭게 선택할 수 있어요. 선택한 과일은 오른쪽 구성표에 바로 담깁니다.</p><div class="pickGrid">${ps.map(p=>`<article class="pickFruit ${curationSelected.has(p.id)?'selected':''}" data-pick-card="${p.id}"><button type="button" class="pickFruitVisual" data-fruit-detail="${p.id}" aria-label="${p.name} 상세보기"><img src="${img(p)}" alt="${p.name}" decoding="async"></button><span class="pickFruitMeta"><b>${p.name}</b><small>${p.origin} · ${displayPrice(p)}</small></span><button type="button" class="pickFruitToggle" data-pick="${p.id}" aria-pressed="${curationSelected.has(p.id)}" aria-label="${p.name} 선택">${curationSelected.has(p.id)?'✓':'+'}</button></article>`).join('')}</div></div><aside class="pickSummary"><h2>나만의 과일 구성</h2><p class="pickSummaryLead">선택한 과일을 한 번에 장바구니에 담거나 카카오로 구성 상담을 받을 수 있습니다.</p><div class="selectedList" id="selectedList"></div><div class="pickTotal"><span>선택 합계</span><strong id="pickTotal">0원</strong></div><div class="pickActions"><button data-clear-picks>비우기</button><button class="dark" data-add-picks>선택 과일 담기</button><button data-consult class="wideAction">카카오로 맞춤 상담</button></div><p class="pickHint">실제 선물 포장·중량·예산별 구성은 상담 과정에서 조정할 수 있습니다.</p></aside></div><div class="sectionHead sectionHeadSpaced"><h2>추천 조합</h2></div><div class="curationGrid">${curation(0,'아침을 여는 구성','사과·신고배·샤인머스켓처럼 산뜻하게',[ps[0],ps[1],ps[2]])}${curation(1,'가족과 함께','서로 다른 맛을 골고루',[ps[1],ps[3],ps[4]])}${curation(2,'마음을 전하는 구성','선물하기 좋은 과일을 함께',[ps[0],ps[2],ps[5]])}</div></section>`}
function giftsPage(){return `<section class="routePage giftsRoutePage"><div class="routeHero routeHeroTheme giftsRouteHero"><div><span class="eyebrow">GIFT SELECTION</span><h1>선물세트</h1></div><p>받는 분과 예산에 맞춰 사과·배·샤인머스켓·한라봉 등 선물에 어울리는 과일을 정갈하게 구성합니다.</p></div><div class="giftGrid giftGridSpaced">${GIFTS.map(g=>`<article class="giftCard"><button class="giftVisual" data-product="${g.id}" aria-label="${g.name} 상세보기"><img src="${img(g)}" alt="${g.name}" decoding="async"></button><div><h3>${g.name}</h3><p>${g.pack} · ${fmt(g.price)}</p><button class="outlineBtn" data-product="${g.id}">선물 보기 →</button></div></article>`).join('')}</div></section>`}
function storyPage(){return `<section class="routePage storyRoutePage"><div class="routeHero routeHeroTheme storyRouteHero"><div><span class="eyebrow">BRAND STORY</span><h1>좋은 과일을 더 잘 고르고,<br>더 쉽게 전합니다.</h1></div><p>이룸은 계절에 가장 좋은 과일을 고르고, 이해하기 쉽게 보여주고, 편하게 주문할 수 있도록 만듭니다.</p></div><div class="storyPageGrid"><div class="storyBlock"><span class="eyebrow">OUR STANDARD</span><h3>이룸의 기준</h3><p>신선함, 선별, 일상. 세 가지 기준으로 지금 가장 좋은 과일을 고릅니다.</p></div><div class="storyBlock"><span class="eyebrow">01</span><h3>신선함</h3><p>입고와 선도를 우선해 설명합니다.</p></div><div class="storyBlock"><span class="eyebrow">02</span><h3>선별</h3><p>크기보다 맛과 균형을 함께 봅니다.</p></div><div class="storyBlock"><span class="eyebrow">03</span><h3>일상</h3><p>쉽게 비교하고 바로 주문할 수 있게 만듭니다.</p></div></div></section>`}
function heroCount(){return Math.min(homeProducts().length,5)}
function syncHero(){if(route!=='home')return;const ps=homeProducts();const h=ps[heroIndex%heroCount()];const im=$('#heroImage');if(!im)return;im.classList.add('changing');setTimeout(()=>{im.src=img(h,'hero');im.alt=h.name;im.dataset.product=h.id;const c=$('#heroCta');if(c){c.dataset.product=h.id;c.textContent=`지금, ${h.name} 만나보기 →`}const m=$('#heroMetaName');if(m)m.textContent=h.name;$$('.dotBtn').forEach((b,i)=>b.classList.toggle('active',i===heroIndex));requestAnimationFrame(()=>im.classList.remove('changing'))},110)}
function startHeroTimer(){clearInterval(heroTimer);if(route==='home'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)heroTimer=setInterval(()=>{heroIndex=(heroIndex+1)%heroCount();syncHero()},5200)}
function startSlideTimer(){clearInterval(slideTimer);if(route!=='home'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;slideTimer=setInterval(()=>{const max=sliderMax();if(max<1)return;if(slideIndex>=max)slideDir=-1;else if(slideIndex<=0)slideDir=1;slideIndex+=slideDir;updateSlider()},4700)}
function bindHomeMotion(){const sw=$('.sliderWrap');if(!sw)return;sw.addEventListener('mouseenter',()=>clearInterval(slideTimer));sw.addEventListener('mouseleave',startSlideTimer);sw.addEventListener('focusin',()=>clearInterval(slideTimer));sw.addEventListener('focusout',e=>{if(!sw.contains(e.relatedTarget))startSlideTimer()})}
function renderCurationSelected(){const list=$('#selectedList'),total=$('#pickTotal');if(!list||!total)return;const selected=[...curationSelected].map(find).filter(Boolean);list.innerHTML=selected.length?selected.map(p=>`<div class="selectedRow"><img src="${img(p)}" alt=""><span><b>${p.name}</b><small>${p.origin} · ${displayPrice(p)}</small></span><button class="selectedRemove" data-remove-pick="${p.id}" aria-label="${p.name} 선택 해제">×</button></div>`).join(''):`<div class="selectedEmpty">아직 고른 과일이 없습니다.</div>`;total.textContent=fmt(selected.reduce((sum,p)=>sum+p.price,0));$$('[data-pick-card]').forEach(card=>{const id=card.dataset.pickCard,on=curationSelected.has(id);card.classList.toggle('selected',on);const b=card.querySelector('[data-pick]');if(b){b.setAttribute('aria-pressed',String(on));b.textContent=on?'✓':'+'}})}
function setCurationPreset(ids){curationSelected.clear();ids.filter(Boolean).slice(0,6).forEach(id=>curationSelected.add(id));route='curation';history.pushState(null,'','#curation');render();requestAnimationFrame(()=>{renderCurationSelected();document.querySelector('.curationBuilder')?.scrollIntoView({behavior:'smooth',block:'start'})})}
function render(){clearInterval(heroTimer);clearInterval(slideTimer);document.body.setAttribute('data-route',route);ensureTopNav();$$('.navItem').forEach(n=>n.classList.toggle('active',n.dataset.route===route));$('#app').innerHTML=route==='home'?home():route==='fruits'?fruitsPage():route==='weekly'?weeklyPage():route==='curation'?curationPage():route==='gifts'?giftsPage():storyPage();if(route==='home'){updateSlider();startHeroTimer();startSlideTimer();bindHomeMotion()}if(route==='curation')renderCurationSelected();quickDock()}
function go(r){route=r;if(r==='fruits')season='all';history.pushState({},'',r==='home'?'#':'#'+r);closeDetail();closeCart();render();scrollTo({top:0,behavior:'smooth'})}
function sliderVisible(){return innerWidth<=760?1:innerWidth<=1100?2:4}
function sliderMax(){return Math.max(0,homeProducts().length-sliderVisible())}
function updateSlider(){const track=$('#cardsTrack');if(!track)return;const max=sliderMax();slideIndex=Math.max(0,Math.min(slideIndex,max));const gap=16;const card=track.querySelector('.productCard');const step=(card?.getBoundingClientRect().width||0)+gap;track.style.transform=`translate3d(${-slideIndex*step}px,0,0)`;const prev=$('[data-slide-prev]'),next=$('[data-slide-next]');if(prev)prev.disabled=slideIndex<=0;if(next)next.disabled=slideIndex>=max;const dots=$('#sliderDots');if(dots)dots.innerHTML=Array.from({length:max+1},(_,i)=>`<button class="sliderDot ${i===slideIndex?'active':''}" data-slide-dot="${i}" aria-label="제철과일 ${i+1}번째 보기"></button>`).join('')}
function slideBy(delta){slideIndex=Math.max(0,Math.min(sliderMax(),slideIndex+delta));slideDir=delta>=0?1:-1;updateSlider();startSlideTimer()}
function saveCart(){try{localStorage.setItem('iroom-v92-cart',JSON.stringify(cart))}catch{}const n=cart.reduce((s,x)=>s+x.qty,0);$('#badge').textContent=n;$('#badge').hidden=!n;if(!$('#drawer').hidden)drawCart();const qi=$('#home2QuickDock i');if(qi)qi.textContent=n||''}
function loadCart(){try{cart=JSON.parse(localStorage.getItem('iroom-v92-cart')||localStorage.getItem('iroom-v91-cart')||localStorage.getItem('iroom-v90-cart')||'[]')}catch{cart=[]}if(!Array.isArray(cart))cart=[];saveCart()}
function add(id,qty=1,silent=false){const p=find(id);if(!p)return;if(p.serverLinked&&Number(p.stock)<=0){toast(`${p.name}은 현재 품절입니다.`);return}const limit=p.serverLinked?Math.max(1,Number(p.stock)||1):20;const x=cart.find(v=>v.id===id);if(x)x.qty=Math.min(limit,x.qty+qty);else cart.push({id,qty:Math.min(limit,Math.max(1,qty))});saveCart();if(!silent)toast((p.name||'상품')+'을 담았습니다.')}
function drawCart(){if(!cart.length){$('#cartBody').innerHTML='<p class="emptyCart">장바구니가 비어 있습니다.</p>';$('#cartTotal').textContent='0원';return}$('#cartBody').innerHTML=cart.map((x,i)=>{const p=find(x.id);if(!p)return'';const state=p.serverLinked?(Number(p.stock)>0?'':' · 품절'):' · 온라인 주문 연결 확인 필요';return `<div class="cartLine"><img src="${img(p)}" alt="${p.name}" decoding="async"><div><h4>${p.name}</h4><small>${fmt(p.price)}${state}</small><div class="cartQty"><button data-cqty="${i}:-1">−</button><b>${x.qty}</b><button data-cqty="${i}:1">＋</button></div></div><button class="remove" data-remove="${i}">삭제</button></div>`}).join('');$('#cartTotal').textContent=fmt(cart.reduce((s,x)=>s+(find(x.id)?.price||0)*x.qty,0))}
function openCart(){drawCart();$('#scrim').hidden=false;$('#drawer').hidden=false;document.body.classList.add('lock')}function closeCart(){$('#scrim').hidden=true;$('#drawer').hidden=true;if($('#detailOverlay').hidden&&$('#utilityOverlay').hidden)document.body.classList.remove('lock')}
function openDetail(id){const p=find(id);if(!p)return;rememberViewed(id);lastFocus=document.activeElement;const gift=p.isGift,sold=p.serverLinked&&Number(p.stock)<=0,pending=p.imported&&!p.serverLinked;$('#detailSheet').innerHTML=`<button class="detailClose" data-detail-close>×</button><div class="detailTop"><div class="detailVisual ${gift?'giftVisualDetail':''}"><img src="${img(p)}" alt="${p.name}" decoding="async"></div><div class="detailInfo"><span class="eyebrow">${gift?'GIFT SELECTION':'IROOM SELECT'}</span><h1>${p.name}</h1><div class="detailPrice">${displayPrice(p)}</div><div class="infoRows"><div class="infoRow"><span>${gift?'분류':'등급'}</span><b>${p.grade}</b></div><div class="infoRow"><span>${gift?'선별':'산지'}</span><b>${p.origin}</b></div><div class="infoRow"><span>구성</span><b>${p.pack}</b></div><div class="infoRow"><span>재고</span><b>${pending?'입고 확인 후 안내':p.serverLinked?(sold?'품절':`${p.stock}개`):'온라인 판매 연결 확인 중'}</b></div><div class="infoRow"><span>배송</span><b>신선식품 전용 포장 · 출고 안내</b></div></div><div class="qtyLine"><div class="qty"><button data-qty="-1">−</button><input id="qty" value="1" inputmode="numeric" aria-label="수량"><button data-qty="1">＋</button></div><strong id="sum">${fmt(p.price)}</strong></div><div class="detailActions">${pending?`<button data-kakao>입고 · 시세 문의</button><button class="dark" data-kakao>카카오 상담</button>`:`<button data-detail-add="${p.id}" ${sold?'disabled':''}>${sold?'품절':'장바구니 담기'}</button><button class="dark" data-buy-now="${p.id}" ${sold?'disabled':''}>BUY NOW</button>`}</div></div></div><div class="detailNotes"><div><span class="eyebrow">PRODUCT</span><h3>${gift?'선물 구성':'상품 안내'}</h3><p>${gift?'과일의 입고 상태에 따라 같은 품질 범위에서 구성이 조정될 수 있습니다.':'입고 상태에 따라 크기와 색감에는 자연스러운 차이가 있습니다.'}</p></div><div><span class="eyebrow">STORAGE</span><h3>보관 가이드</h3><p>수령 후 상태와 후숙 여부에 맞춰 보관하세요.</p></div><div><span class="eyebrow">DELIVERY</span><h3>배송 안내</h3><p>신선식품 특성에 맞춰 안전하게 포장해 출고합니다.</p></div></div>`;$('#detailOverlay').dataset.id=id;$('#detailOverlay').hidden=false;document.body.classList.add('lock');requestAnimationFrame(()=>$('#detailSheet .detailClose')?.focus())}
function closeDetail(){if($('#detailOverlay').hidden)return;$('#detailOverlay').hidden=true;$('#detailSheet').innerHTML='';if($('#utilityOverlay').hidden&&$('#drawer').hidden)document.body.classList.remove('lock');if(lastFocus&&lastFocus.focus){const f=lastFocus;requestAnimationFrame(()=>f.focus());}lastFocus=null}

let utilityLastFocus=null,installPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});
function openUtility(title,body){utilityLastFocus=document.activeElement;$('#utilitySheet').innerHTML=`<button class="utilityClose" data-utility-close aria-label="닫기">×</button><h2 class="utilityTitle">${title}</h2>${body}`;$('#utilityOverlay').hidden=false;document.body.classList.add('lock');requestAnimationFrame(()=>$('#utilitySheet .utilityClose')?.focus())}
function closeUtility(){if($('#utilityOverlay').hidden)return;$('#utilityOverlay').hidden=true;$('#utilitySheet').innerHTML='';if($('#detailOverlay').hidden&&$('#drawer').hidden)document.body.classList.remove('lock');if(utilityLastFocus&&utilityLastFocus.focus){const f=utilityLastFocus;requestAnimationFrame(()=>f.focus())}utilityLastFocus=null}
function footerInfo(kind){if(kind==='guest'){openGuestLookup();return}if(kind==='admin'){location.href='/home2-control.html';return}const policies=siteConfig?.policies||{};const map={terms:['이용약관',policies.termsText||'이용약관 정보를 불러오는 중입니다.'],privacy:['개인정보처리방침',policies.privacyText||'개인정보처리방침 정보를 불러오는 중입니다.'],delivery:['배송·교환·환불',policies.shippingPolicyText||'배송·교환·환불 안내를 불러오는 중입니다.']};const [t,b]=map[kind]||['안내','준비 중입니다.'];openUtility(t,`<div class="policyText">${nl2br(b)}</div><div class="utilityActions"><a href="mailto:${esc(siteConfig?.site?.email||'iroom4562@naver.com')}">이메일 문의</a><a href="tel:${esc(siteConfig?.site?.phone||'070-7762-3651')}">고객센터 전화</a><button class="dark" data-kakao>카카오 오픈채팅</button></div>`)}
function openGuestLookup(){openUtility('비회원 주문조회',`<p class="utilityText">주문번호와 주문 시 입력한 연락처로 안전하게 조회합니다.</p><form class="formGrid" id="guestLookupForm"><label>주문번호<input id="guestOrderNo" autocomplete="off" required placeholder="예: IR20261008-XXXXXX"></label><label>연락처<input id="guestPhone" inputmode="tel" autocomplete="tel" required placeholder="010-0000-0000"></label><button class="primaryFormBtn full" type="submit">주문 조회</button></form><div id="guestLookupResult"></div>`)}
function openAccount(){if(authUser){openUtility('MY IROOM',`<div class="accountWelcome"><b>${esc(authUser.name||authUser.username||'고객')}님</b><span>${esc(authUser.email||'')}</span></div><div class="utilityActions"><button class="dark" data-my-orders>내 주문 보기</button><button data-footer-info="guest">비회원 주문조회</button><button data-kakao>카카오 상담</button><button data-logout>로그아웃</button></div>`);return}openUtility('MY IROOM',`<p class="utilityText">로그인하면 주문내역과 배송 상태를 한곳에서 확인할 수 있습니다.</p><div class="utilityActions"><button class="dark" data-open-login>로그인</button><button data-open-signup>회원가입</button><button data-kakao-login>카카오 로그인</button><button data-footer-info="guest">비회원 주문조회</button><button data-kakao>카카오 상담</button></div>`)}

function openLogin(){openUtility('로그인',`<form class="formGrid one" id="loginForm"><label>아이디 또는 이메일<input id="loginAccount" autocomplete="username" required></label><label>비밀번호<input id="loginPassword" type="password" autocomplete="current-password" required></label><button class="primaryFormBtn" type="submit">로그인</button><button type="button" class="secondaryFormBtn" data-open-signup>회원가입</button></form>`)}
function openSignup(){openUtility('회원가입',`<form class="formGrid" id="signupForm"><label>아이디<input id="signupUsername" autocomplete="username" minlength="4" maxlength="20" required></label><label>이름<input id="signupName" autocomplete="name" required></label><label>이메일<input id="signupEmail" type="email" autocomplete="email"></label><label>연락처<input id="signupPhone" inputmode="tel" autocomplete="tel"></label><label class="full">비밀번호<input id="signupPassword" type="password" autocomplete="new-password" minlength="10" required><small>10자 이상으로 설정해 주세요.</small></label><button class="primaryFormBtn full" type="submit">회원가입</button></form>`)}
async function submitLogin(){try{const d=await api('/api/login',{method:'POST',body:JSON.stringify({username:$('#loginAccount').value,password:$('#loginPassword').value})});authUser=d.user||null;toast('로그인되었습니다.');openAccount()}catch(e){toast(e.message)}}
async function submitSignup(){try{const d=await api('/api/signup',{method:'POST',body:JSON.stringify({username:$('#signupUsername').value,name:$('#signupName').value,email:$('#signupEmail').value,phone:$('#signupPhone').value,password:$('#signupPassword').value})});authUser=d.user||null;toast('회원가입이 완료되었습니다.');openAccount()}catch(e){toast(e.message)}}
async function logout(){try{await api('/api/logout',{method:'POST',body:'{}'})}catch(_){}authUser=null;toast('로그아웃되었습니다.');openAccount()}
async function openMyOrders(){openUtility('내 주문',`<p class="utilityText">주문내역을 불러오는 중입니다.</p><div id="myOrders"></div>`);try{const d=await api('/api/my/orders');const rows=Array.isArray(d.orders)?d.orders:[];const box=$('#myOrders');box.innerHTML=rows.length?rows.map(o=>`<article class="orderCard"><div><b>${esc(o.order_no)}</b><span>${esc(o.status||'주문접수')} · ${esc(o.payment_status||'')}</span></div><strong>${fmt(Number(o.total_amount)||0)}</strong><small>${new Date(o.created_at).toLocaleString('ko-KR')}</small><ul>${(o.items||[]).map(i=>`<li>${esc(i.product_name)} × ${Number(i.qty)||1}</li>`).join('')}</ul></article>`).join(''):'<p class="utilityText">아직 주문내역이 없습니다.</p>'}catch(e){$('#myOrders').innerHTML=`<p class="formError">${esc(e.message)}</p>`}}
async function submitGuestLookup(){const box=$('#guestLookupResult');box.innerHTML='<p class="utilityText">조회 중입니다.</p>';try{const d=await api('/api/orders/lookup',{method:'POST',body:JSON.stringify({order_no:$('#guestOrderNo').value,phone:$('#guestPhone').value})});const o=d.order;box.innerHTML=`<article class="orderCard"><div><b>${esc(o.order_no)}</b><span>${esc(o.status)} · ${esc(o.payment_status)}</span></div><strong>${fmt(Number(o.total_amount)||0)}</strong><small>${new Date(o.created_at).toLocaleString('ko-KR')}</small><ul>${(o.items||[]).map(i=>`<li>${esc(i.product_name)} × ${Number(i.qty)||1}</li>`).join('')}</ul></article>`}catch(e){box.innerHTML=`<p class="formError">${esc(e.message)}</p>`}}
function checkoutSource(singleId=null,singleQty=1){return singleId?[{id:singleId,qty:singleQty}]:cart.map(x=>({...x}))}
function openCheckout(singleId=null,singleQty=1){const items=checkoutSource(singleId,singleQty).filter(x=>find(x.id));if(!items.length){toast('주문할 상품을 먼저 담아주세요.');return}const missing=items.map(x=>find(x.id)).filter(p=>!p.serverLinked);const sold=items.map(x=>find(x.id)).filter(p=>p.serverLinked&&Number(p.stock)<=0);if(missing.length||sold.length){const names=[...missing,...sold].map(p=>p.name).join(', ');openUtility('온라인 주문 확인',`<p class="utilityText">${esc(names)} 상품은 현재 서버 상품/재고 연결을 확인해야 합니다. 관리자 상품 연결 후 주문하거나 카카오로 바로 상담해 주세요.</p><div class="utilityActions"><button class="dark" data-kakao>카카오 상담</button></div>`);return}const total=items.reduce((s,x)=>s+(find(x.id)?.price||0)*x.qty,0);const user=authUser||{};const guestHint=!authUser&&home2Ux.guestCheckoutHint?'<div class="guestCheckoutHint"><b>회원가입 없이 바로 주문할 수 있습니다.</b><span>주문번호와 연락처로 비회원 주문조회도 가능합니다.</span></div>':'';openUtility('주문서',`${guestHint}<div class="checkoutSummary">${items.map(x=>{const p=find(x.id);return `<div><span>${esc(p.name)} × ${x.qty}</span><b>${fmt(p.price*x.qty)}</b></div>`}).join('')}<strong><span>상품 합계</span><b>${fmt(total)}</b></strong></div><form class="formGrid" id="checkoutForm" data-single-id="${singleId||''}" data-single-qty="${singleQty}"><label>받는 분<input id="orderName" autocomplete="name" required value="${esc(user.name||'')}"></label><label>연락처 <small>배송 연락에 사용</small><input id="orderPhone" inputmode="tel" autocomplete="tel" required value="${esc(user.phone||'')}"></label><label>이메일 <small>(선택)</small><input id="orderEmail" type="email" autocomplete="email" value="${esc(user.email||'')}"></label><label>우편번호 <small>(선택)</small><input id="orderPostcode" autocomplete="postal-code" value="${esc(user.postcode||'')}"></label><label class="full">주소<input id="orderAddress1" autocomplete="street-address" required value="${esc(user.address1||'')}"></label><label class="full">상세주소 <small>(선택)</small><input id="orderAddress2" autocomplete="address-line2" value="${esc(user.address2||'')}"></label><label>배송지역<select id="orderRegion"><option value="normal">일반지역</option><option value="jeju">제주도</option><option value="remote">제주 외 도서산간</option></select></label><label>결제방법<select id="orderPayment"><option value="무통장입금">무통장입금</option></select></label><label class="full">배송 메모 <small>(선택)</small><textarea id="orderMemo" rows="3" maxlength="500"></textarea></label><label class="checkLabel full"><input id="orderPrivacy" type="checkbox" required><span>개인정보 수집·이용에 동의합니다.</span></label><label class="checkLabel full"><input id="orderTerms" type="checkbox" required><span>상품·배송·환불 조건을 확인했습니다.</span></label><button class="primaryFormBtn full" type="submit">${authUser?'주문 접수하기':'회원가입 없이 주문 접수하기'}</button></form><p class="formHint">결제금액과 재고는 주문 접수 시 서버에서 다시 확인합니다.</p>`)}
async function submitCheckout(form){const singleId=form.dataset.singleId||null,singleQty=Number(form.dataset.singleQty)||1;const src=checkoutSource(singleId,singleQty);const items=src.map(x=>itemForServer(x.id,x.qty)).filter(Boolean);if(items.length!==src.length){toast('일부 상품의 서버 연결을 확인해 주세요.');return}const payload={items,customer_name:$('#orderName').value,phone:$('#orderPhone').value,email:$('#orderEmail').value,postcode:$('#orderPostcode').value,address1:$('#orderAddress1').value,address2:$('#orderAddress2').value,memo:$('#orderMemo').value,payment_method:$('#orderPayment').value,shipping_region:$('#orderRegion').value,privacy_consent:$('#orderPrivacy').checked,terms_consent:$('#orderTerms').checked};try{const d=await api('/api/orders',{method:'POST',body:JSON.stringify(payload)});if(singleId){const idx=cart.findIndex(x=>x.id===singleId);if(idx>=0)cart.splice(idx,1)}else cart=[];saveCart();const bank=d.bank||{};openUtility('주문이 접수되었습니다',`<div class="orderSuccess"><span>주문번호</span><b>${esc(d.order_no)}</b><p>총 결제금액 <strong>${fmt(Number(d.total_amount)||0)}</strong></p><p>${esc(bank.name||'')} ${esc(bank.account||'')}<br>예금주 ${esc(bank.holder||'')}</p><small>입금 확인 후 선별·포장해 출고합니다.</small></div><div class="utilityActions"><button class="dark" data-my-orders>주문내역 보기</button><button data-kakao>카카오 문의</button></div>`)}catch(e){toast(e.message)}}
function openConsultation(){const selected=[...curationSelected].map(find).filter(Boolean);const fruits=selected.map(p=>p.name).join(', ');openUtility('맞춤 과일 상담',`<p class="utilityText">고른 과일과 예산·용도를 남기면 상담 내용을 서버에 안전하게 저장합니다.</p><form class="formGrid" id="consultForm"><label>이름<input id="consultName" autocomplete="name" required value="${esc(authUser?.name||'')}"></label><label>연락처<input id="consultPhone" autocomplete="tel" inputmode="tel" required value="${esc(authUser?.phone||'')}"></label><label>이메일<input id="consultEmail" type="email" autocomplete="email" value="${esc(authUser?.email||'')}"></label><label>예산<input id="consultBudget" placeholder="예: 5만원대"></label><label class="full">선택 과일<input id="consultFruits" value="${esc(fruits)}"></label><label class="full">용도·요청사항<textarea id="consultMessage" rows="4" maxlength="1800" placeholder="선물용, 가족용, 선호하는 맛 등을 적어주세요."></textarea></label><button class="primaryFormBtn full" type="submit">상담 요청 저장</button></form>`)}
async function submitConsult(){try{const d=await api('/api/consultations',{method:'POST',body:JSON.stringify({guide_type:'이룸홈2 맞춤과일',customer_name:$('#consultName').value,phone:$('#consultPhone').value,email:$('#consultEmail').value,budget:$('#consultBudget').value,preferred_fruits:$('#consultFruits').value,message:$('#consultMessage').value})});openUtility('상담 요청이 접수되었습니다',`<div class="orderSuccess"><span>상담번호</span><b>${esc(d.consult_no)}</b><p>확인 후 연락드리겠습니다.</p></div><div class="utilityActions"><button class="dark" data-kakao>카카오로 이어서 상담</button></div>`)}catch(e){toast(e.message)}}
function renderSearch(q=''){const box=$('#searchResults');if(!box)return;const term=q.trim().toLowerCase();const rows=all().filter(p=>!term||p.name.toLowerCase().includes(term)||p.origin.toLowerCase().includes(term)||p.pack.toLowerCase().includes(term)).slice(0,12);box.innerHTML=rows.length?rows.map(p=>`<button class="searchResult" data-product="${p.id}"><img src="${img(p)}" alt=""><span><b>${p.name}</b><small>${p.origin} · ${displayPrice(p)}</small></span></button>`).join(''):`<div class="searchEmpty"><b>검색 결과가 없습니다.</b><span>과일 이름을 짧게 입력하거나 전체 과일을 둘러보세요.</span><div><button data-route="fruits">전체 과일 보기</button><button class="dark" data-kakao>카카오 문의</button></div></div>`}
function openSearch(){openUtility('과일 찾기',`<div class="topSearchGuide"><p>상단 검색 하나로 제철·해외·Weekly Pick 과일을 모두 찾을 수 있습니다.</p><div><button data-search-shortcut="fruits">제철 과일 보기</button><button data-search-shortcut="weekly">이번 주 과일 보기</button><button data-search-shortcut="import">해외 과일 보기</button></div></div><div class="searchBox searchBoxWide"><input id="siteSearch" type="search" placeholder="${esc(home2Ux.searchPlaceholder||'과일 이름·품종을 검색하세요')}" autocomplete="off"><button data-search-go>검색</button></div><div class="searchResults" id="searchResults"></div>`);renderSearch('');requestAnimationFrame(()=>$('#siteSearch')?.focus())}
async function copyText(v){try{await navigator.clipboard.writeText(v);return true}catch{}try{const ta=document.createElement('textarea');ta.value=v;ta.className='clipboardHelper';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok}catch{return false}}
function kakaoAction(){const url=currentKakao();const w=window.open(url,'_blank','noopener,noreferrer');if(w){try{w.opener=null}catch{}}else{location.href=url}}
async function shareAction(){try{if(navigator.share){await navigator.share({title:'이룸 fresh fruits',text:'좋은 과일로 마음을 전합니다.',url:location.href});return}}catch{}const ok=await copyText(location.href);toast(ok?'현재 페이지 주소를 복사했습니다.':'주소 복사를 지원하지 않는 브라우저입니다.')}
async function installAction(){if(installPrompt){installPrompt.prompt();try{await installPrompt.userChoice}catch{}installPrompt=null;return}if('serviceWorker' in navigator&&location.protocol!=='file:'){try{await navigator.serviceWorker.register('/sw.js?v=61.17.0')}catch(_){}}toast('브라우저 메뉴의 홈 화면에 추가/앱 설치 기능을 이용해 주세요.')}
function toast(t){const el=$('#toast');el.textContent=t;el.hidden=false;clearTimeout(timer);timer=setTimeout(()=>el.hidden=true,1600)}
function qty(){return Math.max(1,parseInt($('#qty')?.value||'1'))}
document.addEventListener('click',e=>{const fd=e.target.closest('[data-fruit-detail]');if(fd){e.preventDefault();e.stopPropagation();openFruitDetailWithSmile(fd,fd.dataset.fruitDetail);return}const productTarget=e.target.closest('[data-product]');if(productTarget){e.preventDefault();e.stopPropagation();if(!$('#utilityOverlay').hidden)closeUtility();const id=productTarget.dataset.product;if(route==='fruits'||productTarget.closest('.weeklyMiniFruits')){openFruitDetailWithSmile(productTarget,id);return}openDetail(id);return}const r=e.target.closest('[data-route]');if(r){if(!$('#utilityOverlay').hidden)closeUtility();go(r.dataset.route);return}const cp=e.target.closest('[data-curation]');if(cp){setCurationPreset(cp.dataset.curation.split(','));return}const pick=e.target.closest('[data-pick]');if(pick){e.preventDefault();playFruitSmile(pick.closest('.pickFruit')?.querySelector('.pickFruitVisual')||pick);const id=pick.dataset.pick;if(curationSelected.has(id))curationSelected.delete(id);else if(curationSelected.size<6)curationSelected.add(id);else{toast('맞춤 구성은 최대 6종까지 선택할 수 있어요.');return}renderCurationSelected();return}const rp=e.target.closest('[data-remove-pick]');if(rp){curationSelected.delete(rp.dataset.removePick);renderCurationSelected();return}if(e.target.closest('[data-clear-picks]')){curationSelected.clear();renderCurationSelected();return}if(e.target.closest('[data-add-picks]')){if(!curationSelected.size){toast('먼저 과일을 골라주세요.');return}[...curationSelected].forEach(id=>add(id,1,true));saveCart();toast(`${curationSelected.size}가지 과일을 장바구니에 담았습니다.`);return}if(e.target.closest('[data-consult]')){openConsultation();return}if(e.target.closest('[data-search]')){openSearch();return}if(e.target.closest('[data-account]')){openAccount();return}if(e.target.closest('[data-open-login]')){openLogin();return}if(e.target.closest('[data-open-signup]')){openSignup();return}if(e.target.closest('[data-open-import]')){route='fruits';season='import';history.pushState({},'','#fruits');render();scrollTo({top:0,behavior:'smooth'});return}if(e.target.closest('[data-my-orders]')){openMyOrders();return}if(e.target.closest('[data-logout]')){logout();return}if(e.target.closest('[data-kakao-login]')){location.href='/api/auth/kakao/start?next='+encodeURIComponent('/home2.html');return}if(e.target.closest('[data-utility-close]')||e.target.id==='utilityOverlay'){closeUtility();return}const fi=e.target.closest('[data-footer-info]');if(fi){footerInfo(fi.dataset.footerInfo);return}if(e.target.closest('[data-kakao]')){kakaoAction();return}if(e.target.closest('[data-share]')){shareAction();return}if(e.target.closest('[data-install]')){installAction();return}if(e.target.closest('[data-search-go]')){renderSearch($('#siteSearch')?.value||'');return}
const sc=e.target.closest('[data-search-shortcut]');if(sc){
 const v=sc.dataset.searchShortcut;if(!$('#utilityOverlay').hidden)closeUtility();
 if(v==='weekly'){go('weekly');return}
 if(v==='import'){route='fruits';season='import';history.pushState({},'','#fruits');render();scrollTo({top:0,behavior:'smooth'});return}
 go('fruits');return
}
const wmp=e.target.closest('[data-weekly-modal-prefer]');if(wmp){
 const id=wmp.dataset.weeklyModalPrefer;
 if(weeklyPreferred.has(id))weeklyPreferred.delete(id);else{if(weeklyPreferred.size>=5){toast('선호 과일은 최대 5개까지 고를 수 있어요.');return}weeklyPreferred.add(id)}
 refreshWeeklyModalUI();refreshWeeklySelectionUI();return
}
if(e.target.closest('[data-home-search-go]')){const q=$('#homeQuickSearch')?.value||'';fruitQuery=q;route='fruits';season='all';history.pushState({},'','#fruits');render();scrollTo({top:0,behavior:'smooth'});return}
const sp=e.target.closest('[data-suggest-product]');if(sp){openDetail(sp.dataset.suggestProduct);return}
if(e.target.closest('[data-fruit-search-clear]')){fruitQuery='';const i=$('#fruitSearchInput');if(i)i.value='';renderFruitGrid();renderFruitSuggestions('');return}
if(e.target.closest('[data-fruit-reset]')){fruitQuery='';fruitAvailability='all';fruitSort='recommended';render();return}
const wp=e.target.closest('[data-weekly-plan]');if(wp){openWeeklyReserve(wp.dataset.weeklyPlan);return}
const wc=e.target.closest('[data-weekly-choice]');if(wc){
 e.preventDefault();const card=wc.closest('[data-weekly-choice-card]');playFruitSmile(card?.querySelector('.weeklyFruitView')||wc);
 const id=wc.dataset.weeklyChoice;
 if(weeklyPreferred.has(id))weeklyPreferred.delete(id);
 else{if(weeklyPreferred.size>=5){toast('선호 과일은 최대 5개까지 고를 수 있어요.');return}weeklyPreferred.add(id)}
 refreshWeeklySelectionUI();refreshWeeklyModalUI();return
}const a=e.target.closest('[data-add]');if(a){if(route==='fruits'){playFruitSmile(a.closest('.productCard')?.querySelector('.productImgBtn'))}add(a.dataset.add);return}if(e.target.closest('[data-cart]')){openCart();return}if(e.target.closest('[data-checkout]')){closeCart();openCheckout();return}if(e.target.closest('[data-close-cart]')||e.target.id==='scrim'){closeCart();return}if(e.target.closest('[data-detail-close]')||e.target.id==='detailOverlay'){closeDetail();return}const da=e.target.closest('[data-detail-add]');if(da){add(da.dataset.detailAdd,qty());return}const buy=e.target.closest('[data-buy-now]');if(buy){const id=buy.dataset.buyNow,q=qty();closeDetail();openCheckout(id,q);return}const q=e.target.closest('[data-qty]');if(q){const i=$('#qty'),p=find($('#detailOverlay').dataset.id);const limit=p?.serverLinked?Math.max(1,Number(p.stock)||1):20;i.value=Math.min(limit,Math.max(1,qty()+Number(q.dataset.qty)));$('#sum').textContent=fmt(p.price*qty());return}const cq=e.target.closest('[data-cqty]');if(cq){const [i,d]=cq.dataset.cqty.split(':').map(Number),p=find(cart[i]?.id);const limit=p?.serverLinked?Math.max(1,Number(p.stock)||1):20;cart[i].qty=Math.min(limit,Math.max(1,cart[i].qty+d));saveCart();return}const rm=e.target.closest('[data-remove]');if(rm){cart.splice(Number(rm.dataset.remove),1);saveCart();return}const ss=e.target.closest('[data-season]');if(ss){season=ss.dataset.season;render();return}const hb=e.target.closest('[data-hero]');if(hb){heroIndex=Number(hb.dataset.hero);syncHero();startHeroTimer();return}if(e.target.closest('[data-hero-next]')){heroIndex=(heroIndex+1)%heroCount();syncHero();startHeroTimer();return}if(e.target.closest('[data-hero-prev]')){heroIndex=(heroIndex-1+heroCount())%heroCount();syncHero();startHeroTimer();return}if(e.target.closest('[data-slide-next]')){slideBy(1);return}if(e.target.closest('[data-slide-prev]')){slideBy(-1);return}const sd=e.target.closest('[data-slide-dot]');if(sd){slideIndex=Number(sd.dataset.slideDot);updateSlider();startSlideTimer();return}})
document.addEventListener('submit',e=>{if(e.target.id==='loginForm'){e.preventDefault();submitLogin();return}if(e.target.id==='signupForm'){e.preventDefault();submitSignup();return}if(e.target.id==='guestLookupForm'){e.preventDefault();submitGuestLookup();return}if(e.target.id==='checkoutForm'){e.preventDefault();submitCheckout(e.target);return}if(e.target.id==='consultForm'){e.preventDefault();submitConsult();return}if(e.target.id==='weeklyReserveForm'){e.preventDefault();submitWeeklyReserve(e.target);return}})
document.addEventListener('pointerdown',e=>{const v=e.target.closest('#cardsViewport');if(!v)return;slideDragStart={x:e.clientX,y:e.clientY,id:e.pointerId}})
document.addEventListener('pointerup',e=>{if(!slideDragStart)return;const dx=e.clientX-slideDragStart.x,dy=e.clientY-slideDragStart.y;slideDragStart=null;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.2)slideBy(dx<0?1:-1)})
document.addEventListener('pointercancel',()=>{slideDragStart=null})
document.addEventListener('input',e=>{
 if(e.target.id==='qty')$('#sum').textContent=fmt(find($('#detailOverlay').dataset.id).price*qty());
 if(e.target.id==='siteSearch')renderSearch(e.target.value);
 if(e.target.id==='fruitSearchInput'){fruitQuery=e.target.value;renderFruitGrid();renderFruitSuggestions(e.target.value)}
 if(e.target.id==='homeQuickSearch')renderHomeSearchSuggestions(e.target.value)
})

document.addEventListener('change',e=>{
 if(e.target.id==='fruitAvailability'){fruitAvailability=e.target.value;renderFruitGrid()}
 if(e.target.id==='fruitSort'){fruitSort=e.target.value;renderFruitGrid()}
})

window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#detailOverlay').hidden){e.preventDefault();closeDetail();return}if(!$('#utilityOverlay').hidden){e.preventDefault();closeUtility();return}if(!$('#drawer').hidden){e.preventDefault();closeCart();return}if(route!=='home'){e.preventDefault();route='home';history.replaceState({},'',location.pathname);render();scrollTo({top:0,behavior:'smooth'});return}}if(e.key==='Tab')document.body.classList.add('keyboardNav')},true);document.addEventListener('pointerdown',()=>document.body.classList.remove('keyboardNav'),true);window.addEventListener('resize',updateSlider);window.addEventListener('popstate',()=>{const h=location.hash.slice(1);route=['fruits','weekly','curation','gifts','story'].includes(h)?h:'home';render()});
function preloadCurrent(){homeProducts().slice(0,5).forEach(p=>{const h=new Image();h.src=img(p,'hero')});homeProducts().forEach(p=>{const i=new Image();i.src=img(p)})}
async function bootstrapBackend(){
 await Promise.allSettled([ensureCsrf(),loadServerProducts(),loadSiteConfig(),loadHome2Ux(),loadPaymentConfig(),loadMe()]);
 render();
 if('serviceWorker' in navigator&&location.protocol!=='file:'){navigator.serviceWorker.register('/sw.js?v=61.17.0').catch(()=>{})}
 const q=new URLSearchParams(location.search);if(q.get('kakao')==='success'){toast('카카오 로그인이 완료되었습니다.');history.replaceState({},'',location.pathname+location.hash)}else if(q.get('kakao')==='error'){toast('카카오 로그인에 실패했습니다.');history.replaceState({},'',location.pathname+location.hash)}
}
preloadCurrent();setNotice();loadCart();ensureTopNav();const h=location.hash.slice(1);route=['fruits','weekly','curation','gifts','story'].includes(h)?h:'home';render();bootstrapBackend();
// IROOM HOME2 V61.13.0 — world fruit select section + imported fruit assets
})();
