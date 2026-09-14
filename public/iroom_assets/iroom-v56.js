(()=>{
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const root=$('#iroomApp'); if(!root)return;
const A='./iroom_assets/';
const KAKAO='https://open.kakao.com/o/sd7wnrKi';
let paymentBank={name:'우리은행',account:'1005-203-135891',holder:'한효철'};
let publicSite={representative:'한효철',phone:'070-7762-3651',email:'iroom4562@naver.com',shippingFee:4000,freeShippingFrom:50000,jejuShippingExtra:4000,remoteShippingExtra:5000,courier:''};
const CART_KEY='iroom_cart_v40';
const won=n=>Number(n||0).toLocaleString('ko-KR')+'원';
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

const fruits={
'딸기':['fruits/01_딸기_strawberry.png','향긋하고 산뜻한 단맛'],'참외':['fruits/02_참외_korean_melon.png','아삭하고 맑은 달콤함'],'청포도':['fruits/03_청포도_green_grape.png','청량하고 향긋한 단맛'],'체리':['fruits/04_체리_cherry.png','상큼하고 진한 과즙'],'수박':['fruits/05_수박_watermelon.png','시원하고 풍부한 과즙'],'복숭아':['fruits/06_복숭아_peach.png','부드럽고 향긋한 여름 단맛'],'망고':['fruits/07_망고_mango.png','부드럽고 진한 열대의 달콤함'],'포도':['fruits/08_포도_purple_grape.png','풍부한 향과 진한 단맛'],'사과':['fruits/09_사과_apple.png','아삭하고 선명한 달콤함'],'배':['fruits/10_배_pear.png','시원하고 풍부한 과즙'],'감':['fruits/11_감_persimmon.png','깊고 진한 계절의 단맛'],'대봉':['fruits/11_감_persimmon.png','후숙할수록 부드럽고 깊어지는 단맛'],'샤인머스캣':['fruits/12_샤인머스캣_shine_muscat.png','향긋하고 맑은 달콤함'],'한라봉':['fruits/13_한라봉_hallabong.png','진한 향과 산뜻한 단맛'],'레몬':['fruits/14_레몬_lemon.png','깨끗하고 산뜻한 시트러스 향'],'자몽':['fruits/15_자몽_grapefruit.png','상큼하고 깨끗한 균형'],'블루베리':['fruits/16_블루베리_blueberry.png','작지만 깊고 산뜻한 맛'],'라즈베리':['fruits/17_라즈베리_raspberry.png','화사한 산미와 부드러운 향'],'파인애플':['fruits/18_파인애플_pineapple.png','상큼하고 풍부한 과즙'],'키위':['fruits/19_키위_kiwi.png','상큼하고 깊은 달콤함'],'오렌지':['fruits/21_오렌지_orange.png','풍부한 과즙과 산뜻한 향'],'제주감귤':['fruits/21_오렌지_orange.png','새콤달콤하고 산뜻한 겨울 맛'],'아보카도':['fruits/22_아보카도_avocado.png','고소하고 부드러운 식감'],'용과':['fruits/23_용과_dragonfruit.png','담백하고 청량한 열대의 맛'],'석류':['fruits/24_석류_pomegranate.png','선명하고 진한 가을빛'],'무화과':['fruits/25_무화과_fig.png','부드럽고 은은한 단맛'],'밤':['fruits/26_밤_chestnut.png','포근하고 고소한 가을 풍미'],'자두':['fruits/27_자두_plum.png','새콤달콤한 과즙'],'멜론':['fruits/28_멜론_melon.png','부드럽고 은은한 달콤함'],'바나나':['fruits/29_바나나_banana.png','부드럽고 편안한 달콤함'],'라임':['fruits/30_라임_lime.png','또렷하고 상쾌한 시트러스 향'],'패션후르츠':['fruits/31_패션후르츠_passionfruit.png','향긋하고 선명한 새콤달콤함'],'망고스틴':['fruits/32_망고스틴_mangosteen.png','부드럽고 깨끗한 열대의 단맛'],'리치':['fruits/33_리치_lychee.png','은은한 꽃향과 맑은 단맛'],'블랙베리':['fruits/34_블랙베리_blackberry.png','짙은 향과 산뜻한 균형'],'금귤':['fruits/35_금귤_kumquat.png','작고 향긋한 상큼함'],'토마토':['fruits/37_토마토_tomato.png','신선하고 산뜻한 자연의 맛']};
const alias={'금실딸기':'딸기','성주참외':'참외','대저토마토':'토마토','백도복숭아':'복숭아','고당도수박':'수박','머스크멜론':'멜론','홍로사과':'사과','나주배':'배','부사사과':'사과','샤인머스켓':'샤인머스캣','프리미엄 딸기':'딸기','봄향기 백도 복숭아':'복숭아','프리미엄 백도 복숭아':'복숭아','성주 참외':'참외','하우스 자두':'자두','프리미엄 샤인머스캣':'샤인머스캣','햇감':'감','제주 한라봉':'한라봉','천혜향':'한라봉','프리미엄 후지 사과':'사과'};
const imported=new Set(['체리','망고','자몽','블루베리','라즈베리','파인애플','키위','아보카도','용과','바나나','라임','패션후르츠','망고스틴','리치','레몬','오렌지','블랙베리']);
const origins={
'금실딸기':'국내 산지','딸기':'국내 산지','성주참외':'경북 성주','참외':'경북 성주','대저토마토':'부산 대저','토마토':'국내 산지','샤인머스캣':'국내 산지','백도복숭아':'국내 산지','복숭아':'국내 산지','고당도수박':'국내 산지','수박':'국내 산지','머스크멜론':'국내 산지','멜론':'국내 산지','자두':'국내 산지','포도':'국내 산지','홍로사과':'경북 청송 등','사과':'국내 산지','나주배':'전남 나주','배':'전남 나주','대봉':'경남·전남 산지','감':'국내 산지','석류':'입고별 안내','제주감귤':'제주','한라봉':'제주','부사사과':'국내 산지','금귤':'제주·국내 산지','청포도':'국내 산지','밤':'국내 산지','무화과':'국내 산지',
'체리':'미국·뉴질랜드 등','망고':'태국·페루 등','자몽':'미국·이스라엘 등','블루베리':'국내·칠레·페루 등','라즈베리':'미국·멕시코 등','파인애플':'필리핀·코스타리카 등','키위':'국내·뉴질랜드 등','아보카도':'멕시코·페루 등','용과':'베트남 등','바나나':'필리핀·에콰도르 등','라임':'멕시코 등','패션후르츠':'베트남 등','망고스틴':'태국 등','리치':'태국·중국 등','레몬':'미국·칠레 등','오렌지':'미국·호주 등','블랙베리':'멕시코·미국 등','프리미엄 딸기':'국내 산지','봄향기 백도 복숭아':'국내 산지','프리미엄 백도 복숭아':'국내 산지','성주 참외':'경북 성주','하우스 자두':'국내 산지','프리미엄 샤인머스캣':'국내 산지','햇감':'경남·전남 산지','제주 한라봉':'제주','천혜향':'제주','프리미엄 후지 사과':'국내 산지'};
const starter={
'금실딸기':[25000,'1kg 내외'],'딸기':[22000,'1kg 내외'],'성주참외':[24000,'2kg'],'참외':[22000,'2kg'],'대저토마토':[18000,'2kg'],'토마토':[16000,'2kg'],'샤인머스캣':[28000,'2kg (3~4송이)'],'체리':[32000,'1kg'],'백도복숭아':[29000,'4kg'],'복숭아':[29000,'4kg'],'고당도수박':[25000,'1통'],'수박':[25000,'1통'],'머스크멜론':[26000,'2수'],'멜론':[24000,'2수'],'자두':[19000,'2kg'],'포도':[26000,'2kg'],'홍로사과':[32000,'3kg'],'사과':[32000,'3kg'],'나주배':[38000,'5kg (7~9과)'],'배':[38000,'5kg (7~9과)'],'대봉':[26000,'3kg'],'감':[24000,'3kg'],'석류':[28000,'2kg'],'제주감귤':[25000,'5kg'],'한라봉':[28000,'3kg'],'부사사과':[32000,'3kg'],'키위':[22000,'2kg'],'블루베리':[24000,'500g'],'자몽':[22000,'6과'],'망고':[29000,'2~3과'],'파인애플':[18000,'2수'],'블랙베리':[26000,'500g'],'금귤':[23000,'2kg'],'청포도':[24000,'2kg'],'아보카도':[23000,'5~6과'],'용과':[26000,'3~4과'],'바나나':[12000,'1.5kg 내외'],'라임':[16000,'8~10과'],'패션후르츠':[24000,'1kg'],'망고스틴':[35000,'1kg'],'리치':[26000,'1kg'],'레몬':[15000,'8~10과'],'오렌지':[18000,'8~10과'],'라즈베리':[28000,'500g'],'밤':[22000,'2kg'],'무화과':[26000,'1kg'],'프리미엄 딸기':[32000,'500g 내외'],'봄향기 백도 복숭아':[38000,'2kg'],'프리미엄 백도 복숭아':[38000,'2kg'],'성주 참외':[24000,'2kg'],'하우스 자두':[26000,'2kg'],'프리미엄 샤인머스캣':[36000,'2kg'],'햇감':[28000,'2.5kg (8~12과)'],'제주 한라봉':[28000,'2kg'],'천혜향':[26000,'2kg'],'프리미엄 후지 사과':[24000,'2kg']};

const seasons={
 spring:{label:'봄',heroCopy:'봄의 싱그러움을 가장 좋은 상태로 골라 산뜻하게 전합니다.',hero:['딸기','참외','청포도','토마토','체리'],heroImg:[null,null,null,'hero_elements/spring_tomato.png',null],today:[['금실딸기','국내 산지','당일 선별'],['성주참외','경북 성주','입고 상태 확인'],['대저토마토','부산 대저','당일 상태 확인'],['샤인머스캣','국내 산지','당일 상태 확인'],['체리','미국·뉴질랜드 등','당일 선별'],['망고','태국·페루 등','숙도 확인'],['자몽','미국·이스라엘 등','입고 상태 확인'],['아보카도','멕시코·페루 등','숙도 확인'],['블루베리','국내·칠레·페루 등','당일 선별'],['오렌지','미국·호주 등','입고 상태 확인']],premium:['프리미엄 딸기','성주 참외','대저토마토','프리미엄 샤인머스캣'],premiumImg:['premium_box_v53/spring_01.webp','premium_box_v53/spring_02.webp','premium_box_v53/spring_03.webp','premium_box_v53/spring_04.webp'],seasonal:['사과','배','청포도','키위','파인애플','블루베리','오렌지','레몬'],library:['홍로사과','나주배','샤인머스캣','대봉','석류','제주감귤','키위','자몽','포도','블랙베리','망고','아보카도'],curation:'feature_art/spring_curation.jpg',gift:'feature_art/spring_gift.jpg'},
 summer:{label:'여름',heroCopy:'햇살이 더 달콤하게 만든 여름 과일을 시원하고 풍성하게 골라드립니다.',hero:['수박','복숭아','샤인머스캣','자두','멜론'],today:[['백도복숭아','국내 산지','숙도 확인'],['고당도수박','국내 산지','당일 선별'],['샤인머스캣','국내 산지','입고 상태 확인'],['머스크멜론','국내 산지','숙도 확인'],['자두','국내 산지','당일 상태 확인'],['망고','태국·페루 등','숙도 확인'],['체리','미국·뉴질랜드 등','당일 선별'],['파인애플','필리핀·코스타리카 등','숙도 확인'],['용과','베트남 등','입고 상태 확인'],['리치','태국·중국 등','당일 선별']],premium:['프리미엄 백도 복숭아','고당도수박','하우스 자두','프리미엄 샤인머스캣'],premiumImg:['premium_box_v53/summer_01.webp','premium_box_v53/summer_02.webp','premium_box_v53/summer_03.webp','premium_box_v53/summer_04.webp'],seasonal:['자두','포도','블루베리','키위','리치','패션후르츠','망고스틴','바나나'],library:['블루베리','파인애플','망고','자몽','체리','멜론','포도','키위','석류','샤인머스캣','용과','리치'],curation:'feature_art/summer_curation.jpg',gift:'feature_art/summer_gift.jpg'},
 autumn:{label:'가을',heroCopy:'깊어가는 계절이 전하는 가장 특별한 맛을 오늘의 상태로 골라드립니다.',hero:['홍로사과','나주배','샤인머스캣','대봉','석류'],today:[['홍로사과','경북 청송 등','당일 선별'],['나주배','전남 나주','입고 상태 확인'],['샤인머스캣','국내 산지','당일 상태 확인'],['대봉','경남·전남 산지','후숙 상태 확인'],['석류','입고별 안내','당일 선별'],['망고','태국·페루 등','숙도 확인'],['자몽','미국·이스라엘 등','입고 상태 확인'],['아보카도','멕시코·페루 등','숙도 확인'],['망고스틴','태국 등','입고 상태 확인'],['패션후르츠','베트남 등','당일 선별']],premium:['홍로사과','나주배','프리미엄 샤인머스캣','하우스 자두'],premiumImg:['premium_box_v53/autumn_01.webp','premium_box_v53/autumn_02.webp','premium_box_v53/autumn_03.webp','premium_box_v53/autumn_04.webp'],seasonal:['포도','밤','블랙베리','키위','파인애플','용과','망고스틴','패션후르츠'],library:['석류','포도','블랙베리','자몽','샤인머스캣','사과','배','키위','블루베리','제주감귤','망고','아보카도'],curation:'feature_art/autumn_curation.jpg',gift:'feature_art/autumn_gift.jpg'},
 winter:{label:'겨울',heroCopy:'차가운 계절에 더 빛나는 자연의 달콤함을 신선하게 골라 전합니다.',hero:['제주감귤','부사사과','금실딸기','한라봉','키위'],today:[['제주감귤','제주','당일 입고 확인'],['한라봉','제주','숙도 확인'],['금실딸기','국내 산지','당일 선별'],['부사사과','국내 산지','입고 상태 확인'],['나주배','전남 나주','입고 상태 확인'],['키위','국내·뉴질랜드 등','숙도 확인'],['자몽','미국·이스라엘 등','입고 상태 확인'],['블루베리','국내·칠레·페루 등','당일 선별'],['오렌지','미국·호주 등','입고 상태 확인'],['망고','태국·페루 등','숙도 확인']],premium:['프리미엄 딸기','제주 한라봉','나주배','프리미엄 후지 사과'],premiumImg:['premium_box_v53/winter_01.webp','premium_box_v53/winter_02.webp','premium_box_v53/winter_03.webp','premium_box_v53/winter_04.webp'],seasonal:['금귤','자몽','블루베리','레몬','오렌지','바나나','아보카도','망고'],library:['키위','금귤','배','블루베리','자몽','제주감귤','사과','딸기','한라봉','석류','오렌지','레몬'],curation:'feature_art/winter_curation.jpg',gift:'feature_art/winter_gift.jpg'}
};
const details={choose:'표면과 탄력, 향, 무게감과 숙도를 함께 살펴 좋은 상태의 과일을 고릅니다.',keep:'과일의 숙도에 맞춰 실온 또는 냉장 보관하고, 드시기 전에 상태를 확인해 주세요.',enjoy:'향과 식감이 가장 좋은 상태에서 신선하게 즐겨보세요.'};
const autoSeason=()=>{const m=new Date().getMonth()+1;return m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'autumn':'winter'};
let mode='auto',current=autoSeason(),storeProducts=[],homepageConfig={};
const qs=new URLSearchParams(location.search);const previewMode=qs.get('adminPreview')==='1';const forcedSeason=qs.get('season');if(['spring','summer','autumn','winter'].includes(forcedSeason)){mode=forcedSeason;current=forcedSeason}
function slotOverride(section,index){return homepageConfig?.productEditor?.[current]?.[section]?.[index]||{}}
function slotView(section,index,baseName,fallbackVisual=''){const o=slotOverride(section,index);return {baseName,displayName:String(o.name||baseName),visual:String(o.image||fallbackVisual||meta(baseName)[0]),editKey:`${current}|${section}|${index}`}}
function absoluteVisual(visual=''){const v=String(visual||'');if(/^data:image\//i.test(v)||/^https?:\/\//i.test(v)||v.startsWith('/'))return v;return A+v}
async function loadHomepageConfig(){try{const r=await fetch('/api/site/homepage-config',{cache:'no-store'});if(r.ok){const d=await r.json();homepageConfig=d.config||{}}}catch(_){homepageConfig={}}}
function previewAttrs(v){return previewMode?` data-edit-key="${esc(v.editKey)}" data-base-name="${esc(v.baseName)}" data-display-name="${esc(v.displayName)}" data-edit-visual="${esc(v.visual)}"`:''}
function previewSelect(el){if(!previewMode)return false;const t=el?.closest?.('[data-edit-key]');if(!t)return false;parent.postMessage({type:'iroom-product-select',editKey:t.dataset.editKey,baseName:t.dataset.baseName,displayName:t.dataset.displayName,visual:t.dataset.editVisual,season:current},location.origin);document.querySelectorAll('.admin-preview-selected').forEach(x=>x.classList.remove('admin-preview-selected'));t.classList.add('admin-preview-selected');return true}

let cart=[];try{cart=JSON.parse(localStorage.getItem(CART_KEY)||'[]');if(!Array.isArray(cart))cart=[]}catch(_){cart=[]}

function meta(name){return fruits[name]||fruits[alias[name]]||['fruits/09_사과_apple.png','오늘 상태가 좋은 과일']}
function norm(s){return String(s||'').replace(/\s+/g,'').replace(/샤인머스켓/g,'샤인머스캣').replace(/경북|전남|제주|특선|프리미엄|신고/g,'')}
function productFor(name){
 const candidates=[name,alias[name]].filter(Boolean).map(norm);
 let p=storeProducts.find(x=>candidates.includes(norm(x.name)));
 if(!p)p=storeProducts.find(x=>candidates.some(n=>norm(x.name).includes(n)||n.includes(norm(x.name))));
 if(p)return {...p,origin:origins[name]||origins[alias[name]]||'입고별 안내'};
 const st=starter[name]||starter[alias[name]]||[0,'구성 상담'];
 return {id:null,name,price:st[0],unit:st[1],stock:99,origin:origins[name]||origins[alias[name]]||'입고별 안내',description:meta(name)[1]};
}
function saveCart(){try{localStorage.setItem(CART_KEY,JSON.stringify(cart))}catch(_){}updateCartCount()}
function updateCartCount(){const n=cart.reduce((s,x)=>s+Number(x.qty||0),0);$$('[data-cart-count]').forEach(x=>{x.textContent=n;x.hidden=!n})}
function displayPrice(p){return p?.price>0?won(p.price):'오늘 시세 확인'}
function productVisual(name,visual=''){return absoluteVisual(visual||meta(name)[0])}

function heroCard(name,i,visual=''){const v=slotView('hero',i,name,visual||meta(name)[0]);return `<div class="hero-fruit f${i+1}"${previewAttrs(v)}><img src="${absoluteVisual(v.visual)}" alt="${esc(v.displayName)}"><span>${esc(v.displayName)}</span></div>`}
function commerceButtons(name,visual='',compact=false,displayName=''){const p=productFor(name),sold=Number(p.stock||0)<=0,label=displayName||name;return `<div class="commerce-actions ${compact?'compact':''}"><button type="button" class="buy-btn" data-buy-now data-name="${esc(name)}" data-display-name="${esc(label)}" data-visual="${esc(visual)}" ${sold?'disabled':''}>${sold?'입고 확인':'BUY NOW'}</button><button type="button" class="cart-btn" data-cart-add data-name="${esc(name)}" data-display-name="${esc(label)}" data-visual="${esc(visual)}" ${sold?'disabled':''}>장바구니</button></div>`}
function todayCard([name,origin,state],index=0){const m=meta(name),p=productFor(name),v=slotView('today',index,name,m[0]);return `<article class="today-card clickable-product" data-card-fruit="${esc(name)}" data-card-display="${esc(v.displayName)}" data-card-visual="${esc(v.visual)}"${previewAttrs(v)}><div class="today-visual"><img src="${absoluteVisual(v.visual)}" alt="${esc(v.displayName)}"></div><div class="today-body"><div class="today-topline"><small>오늘의 이룸 PICK</small><span>${esc(state)}</span></div><h3>${esc(v.displayName)}</h3><p>${m[1]}. 오늘 맛과 상태를 확인해 안내합니다.</p><div class="product-meta"><button type="button" data-info-type="origin" data-info-name="${esc(name)}" data-info-value="${esc(origin)}">산지 · ${esc(origin)}</button><button type="button" data-info-type="config" data-info-name="${esc(name)}">구성 · ${esc(p.unit||'상담 확인')}</button></div><div class="sale-price"><small>오늘 판매가</small><b>${displayPrice(p)}</b></div>${commerceButtons(name,v.visual,true,v.displayName)}</div></article>`}
function productCard(name,img,premium=false,index=0,section='seasonal'){const m=meta(name),p=productFor(name),baseVisual=img||m[0],v=slotView(section,index,name,baseVisual);const base=alias[name]||name;const premiumArt=premium&&/(premium_watercolor_v49|premium_box_v53)/.test(v.visual);const badge=premium&&!premiumArt?`<span class="badge ${imported.has(base)?'imported-badge':''}">${imported.has(base)?'수입 프리미엄':'국산 프리미엄'}</span>`:'';const signature=premium&&!premiumArt?`<span class="premium-card-no">IROOM ${String(index+1).padStart(2,'0')}</span>`:'';return `<article class="product-card commerce-card clickable-product ${premium?'premium-signature-card':''} ${premiumArt?'premium-watercolor-card premium-box-card':''}" data-card-fruit="${esc(name)}" data-card-display="${esc(v.displayName)}" data-card-visual="${esc(v.visual)}"${previewAttrs(v)}>${signature}${badge}<button type="button" class="image-wrap product-image-button ${premium?'premium-image-button':''}" data-fruit="${esc(name)}" data-display-name="${esc(v.displayName)}" data-visual="${esc(v.visual)}" aria-label="${esc(v.displayName)} 상세보기"><img src="${absoluteVisual(v.visual)}" alt="${esc(v.displayName)}"></button><h3>${esc(v.displayName)}</h3><p>${m[1]}</p><div class="mini-sale"><span>${esc(p.unit||'구성 상담')}</span><b>${displayPrice(p)}</b></div>${commerceButtons(name,v.visual,true,v.displayName)}</article>`}
function libraryCard(name,index=0){const m=meta(name),p=productFor(name),v=slotView('library',index,name,m[0]);return `<article class="library-card commerce-library clickable-product" data-card-fruit="${esc(name)}" data-card-display="${esc(v.displayName)}" data-card-visual="${esc(v.visual)}"${previewAttrs(v)}><img src="${absoluteVisual(v.visual)}" alt="${esc(v.displayName)}"><b>${esc(v.displayName)}</b><small>${m[1]}</small><div class="library-price">${displayPrice(p)}</div>${commerceButtons(name,v.visual,true,v.displayName)}</article>`}

function applySeason(key){
 current=key;const d=seasons[key];root.dataset.season=key;
 $('#heroFruitStage').innerHTML=d.hero.map((n,i)=>heroCard(n,i,d.heroImg?.[i]||'')).join('');
 $('[data-hero-title]').innerHTML=`${d.label} 프리미엄<br>과일`;
 $('[data-hero-copy]').textContent=d.heroCopy;
 $('#todayGrid').innerHTML=d.today.map((x,i)=>todayCard(x,i)).join('');
 $('#premiumGrid').innerHTML=d.premium.slice(0,4).map((n,i)=>productCard(n,d.premiumImg?.[i]||'',true,i,'premium')).join('');
 $('#seasonalGrid').innerHTML=d.seasonal.map((n,i)=>productCard(n,'',false,i,'seasonal')).join('');
 $('#libraryGrid').innerHTML=d.library.slice(0,4).map((n,i)=>libraryCard(n,i)).join('');
 $('#curationArt').src=A+d.curation;$('#giftArt').src=A+d.gift;
 requestAnimationFrame(setupAllCarousels);
 $$('[data-season-label]').forEach(x=>x.textContent=d.label);$$('[data-season-status]').forEach(x=>x.textContent=d.label+(mode==='auto'?' · 자동':''));$$('[data-season-side]').forEach(x=>x.innerHTML=`${d.label}이<br>더<br>맛있어지는<br>순간`);$$('[data-season]').forEach(b=>b.classList.toggle('active',b.dataset.season===mode));
}
async function loadProducts(){try{const r=await fetch('/api/products',{credentials:'same-origin'});if(r.ok){const d=await r.json();storeProducts=Array.isArray(d.products)?d.products:[]}}catch(_){storeProducts=[]}}

$$('[data-home]').forEach(b=>b.onclick=()=>scrollTo({top:0,behavior:'smooth'}));
$$('[data-scroll]').forEach(b=>b.onclick=()=>{const el=document.getElementById(b.dataset.scroll);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})});
$$('[data-season]').forEach(b=>b.onclick=()=>{mode=b.dataset.season;applySeason(mode==='auto'?autoSeason():mode)});

/* V43: stable UI layers. Modals no longer alter browser history; cart opens/closes directly. */
const noticeTrack=$('[data-notice-track]');
if(noticeTrack&&noticeTrack.children.length>1&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 let noticeIndex=0;
 setInterval(()=>{noticeIndex=(noticeIndex+1)%noticeTrack.children.length;noticeTrack.style.transform=`translateY(-${noticeIndex*100}%)`},5200);
}
const pop=$('[data-account-popover]'),accountToggle=$('[data-account-toggle]');
const overlay=$('#modalBackdrop'),panel=$('.modal-panel',overlay),k=$('#modalKicker'),title=$('#modalTitle'),intro=$('#modalIntro'),body=$('#modalBody');
function hideAccountDirect(){if(pop)pop.hidden=true}
function showAccount(){if(pop&&pop.hidden)pop.hidden=false}
function closeAccount(){hideAccountDirect()}
if(accountToggle)accountToggle.onclick=e=>{e.preventDefault();e.stopPropagation();pop.hidden?showAccount():closeAccount()};
document.addEventListener('click',e=>{if(pop&&!pop.hidden&&!e.target.closest('.account-wrap'))closeAccount()});
function setModal(kk,t,i,h){k.textContent=kk;title.textContent=t;intro.innerHTML=i||'';body.innerHTML=h||'';if(panel)panel.scrollTop=0}
function hideOverlayDirect(){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');overlay.removeAttribute('data-kind');document.body.style.overflow=''}
function showOverlay(kind='modal'){
 overlay.dataset.kind=kind||overlay.dataset.kind||'modal';
 overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
 hideAccountDirect();if(panel)panel.scrollTop=0;
}
function openModal(type){
 if(type==='premium')renderPremium();else if(type==='seasonal')renderSeasonal();else if(type==='library')renderLibrary();else if(type==='promise')renderPromise();else if(type==='curation')renderCuration();else if(type==='gift')renderGift();else if(type==='brand')renderBrand();else if(type==='guide')renderGuide();else if(type==='search')renderSearch();else if(type==='login')renderLogin();else if(type==='signup')renderSignup();else if(type==='mypage')renderMyPage();else if(type==='cart')renderCart();else if(type==='terms')renderTerms();else if(type==='privacy')renderPrivacy();else return;
 showOverlay(type);
}
function closeModal(){if(overlay.classList.contains('open'))hideOverlayDirect()}
$('[data-close]').onclick=closeModal;
overlay.onclick=e=>{if(e.target===overlay)closeModal()};
document.addEventListener('keydown',e=>{
 if(e.key!=='Escape')return;
 if(overlay.classList.contains('open')){e.preventDefault();closeModal();return}
 if(pop&&!pop.hidden){e.preventDefault();closeAccount()}
});


function modalCommerceCard(name,visual='',section='',index=0){const m=meta(name),p=productFor(name),sv=section?slotView(section,index,name,visual||m[0]):{displayName:name,visual:visual||m[0]},premiumWatercolor=/(premium_watercolor_v49|premium_box_v53)/.test(sv.visual);return `<article class="modal-shop-card clickable-product ${premiumWatercolor?'premium-modal-card':''}" data-card-fruit="${esc(name)}" data-card-display="${esc(sv.displayName)}" data-card-visual="${esc(sv.visual)}">${premiumWatercolor?'<span class="premium-modal-label">IROOM SELECTED</span>':''}<img src="${absoluteVisual(sv.visual)}" alt="${esc(sv.displayName)}"><div><b>${esc(sv.displayName)}</b><small>${m[1]}</small><span>${esc(p.unit||'구성 상담')} · <strong>${displayPrice(p)}</strong></span>${commerceButtons(name,sv.visual,true,sv.displayName)}</div></article>`}
function renderPremium(){const d=seasons[current];setModal('IROOM PREMIUM SELECTION',`${d.label} 프리미엄 과일`,`이룸이 계절의 맛과 상태를 보고 고른 프리미엄 셀렉션입니다. 이미지와 상품 구성을 확인하고 원하는 수량으로 바로 구매하거나 장바구니에 담아보세요.`,`<div class="premium-modal-intro"><span>${d.label} SELECTION</span><b>Seasonal Premium Collection</b><small>수채화 감성과 실제 과일의 생생함을 함께 담은 이룸의 프리미엄 셀렉션</small></div><div class="modal-shop-grid premium-modal-grid">${d.premium.map((n,i)=>modalCommerceCard(n,d.premiumImg?.[i]||'','premium',i)).join('')}</div>`)}
function renderSeasonal(){const d=seasons[current];setModal('SEASONAL FRUITS',`${d.label}, 지금 가장 맛있는 과일`,`계절과 당일 상태를 함께 보고 고른 제철 과일입니다.`,`<div class="modal-shop-grid">${d.seasonal.map((n,i)=>modalCommerceCard(n,'','seasonal',i)).join('')}</div>`)}
function renderLibrary(){const d=seasons[current];setModal('IROOM FRUIT LIBRARY',`${d.label}, 오늘 만나볼 전체 과일`,`메인에는 4가지만 간결하게 보여드리고, 이곳에서 오늘 준비한 전체 과일을 한눈에 확인할 수 있습니다.`,`<div class="modal-shop-grid">${d.library.map((n,i)=>modalCommerceCard(n,'','library',i)).join('')}</div>`)}
function renderPromise(){setModal('IROOM FRESH PROMISE','맛과 상태를 끝까지 살핍니다.','이룸은 오늘 상태가 기준에 맞지 않으면 무리하게 권하지 않습니다.',`<div class="guide-grid"><div class="guide-box"><b>당일 품질 확인</b><p>향 · 숙도 · 탄력과 선물 목적을 함께 살핍니다.</p></div><div class="guide-box"><b>시세·입고 반영</b><p>산지 시세와 입고 상태를 반영해 판매가와 구성이 달라질 수 있습니다.</p></div><div class="guide-box"><b>빠른 상담</b><p>가격·구성·배송이 궁금하면 카카오 상담으로 바로 연결됩니다.</p></div><div class="guide-box"><b>정성스러운 안내</b><p>받은 과일의 맛이나 상태가 기대와 다르면 상담 후 도와드립니다.</p></div></div>`)}
function renderCuration(){setModal('FRUIT CURATION','맞춤 과일 큐레이션','예산 · 용도 · 취향을 알려주시면 오늘 상태 좋은 과일을 기준으로 추천합니다.',`<div class="guide-grid"><div class="guide-box"><b>01 · 예산</b><p>원하는 금액 안에서 가장 좋은 구성을 찾습니다.</p></div><div class="guide-box"><b>02 · 용도</b><p>가정용 · 선물용 · 단체 주문 목적을 반영합니다.</p></div><div class="guide-box"><b>03 · 취향</b><p>달콤함 · 산뜻함 · 식감 등 선호를 확인합니다.</p></div><div class="guide-box"><b>04 · 오늘의 상태</b><p>기준에 못 미치는 과일은 억지로 권하지 않습니다.</p></div></div><p><button class="primary" data-kakao-chat>카카오로 맞춤 상담</button></p>`)}
function renderGift(){setModal('GIFT SELECTION','마음을 전하는 과일 선물','과일보다 먼저 받는 분과 전하고 싶은 마음을 생각해 정성스럽게 구성합니다.',`<div class="gift-options"><button class="gift-option" data-kakao-chat><b>감사 선물</b><span>고마운 마음을 정갈하게 전하고 싶을 때</span></button><button class="gift-option" data-kakao-chat><b>가족 · 건강 선물</b><span>여럿이 함께 즐기기 좋은 균형 구성</span></button><button class="gift-option" data-kakao-chat><b>기업 · 단체 선물</b><span>예산 · 수량 · 포장 조건까지 맞춤 제안</span></button></div>`)}
function renderBrand(){setModal('BRAND STORY','좋은 과일로 마음을 전합니다.','이룸은 보여주기보다 맛과 상태를 먼저 봅니다.',`<div class="guide-grid"><div class="guide-box"><b>산지와 제철</b><p>지금 맛이 좋은 시기와 산지를 살핍니다.</p></div><div class="guide-box"><b>당일 선별</b><p>향 · 숙도 · 단단함과 용도를 함께 확인합니다.</p></div><div class="guide-box"><b>정성스러운 포장</b><p>받는 순간까지 좋은 상태가 이어지도록 준비합니다.</p></div><div class="guide-box"><b>맛 우선 원칙</b><p>오늘 맛이 부족하면 무리하게 권하기보다 더 좋은 날을 안내합니다.</p></div></div>`)}
function renderGuide(){setModal('CUSTOMER CENTER','이룸 고객센터','가격 · 주문 · 배송 · 보관까지 필요한 내용을 편하게 확인하세요.',`<div class="guide-grid"><div class="guide-box"><b>가격 · 구성 문의</b><p>매일 시세를 반영하므로 상품 페이지와 카카오 상담에서 최신 구성을 확인해 주세요.</p></div><div class="guide-box"><b>배송 안내</b><p>상품과 지역에 따라 배송 일정이 달라질 수 있습니다.</p></div><div class="guide-box"><b>보관 방법</b><p>과일의 숙도에 맞춰 실온 또는 냉장 보관합니다.</p></div><div class="guide-box"><b>카카오 상담</b><p>빠른 상담이 필요하면 오픈채팅으로 문의하세요.</p></div></div><p><button class="primary" data-kakao-chat>카카오 상담</button></p>`)}
function renderSearch(){setModal('SEARCH','과일 찾기','과일 이름을 입력하면 빠르게 찾을 수 있습니다.',`<div class="search-row"><input id="fruitSearch" placeholder="예: 사과, 딸기, 샤인머스캣"><button id="fruitSearchBtn">검색</button></div><div class="search-results" id="searchResults"></div>`);const draw=q=>{$('#searchResults').innerHTML=Object.keys(fruits).filter(n=>!q||n.includes(q)).slice(0,28).map(n=>`<button data-fruit="${esc(n)}">${esc(n)}</button>`).join('')};draw('');$('#fruitSearchBtn').onclick=()=>draw($('#fruitSearch').value.trim());$('#fruitSearch').onkeydown=e=>{if(e.key==='Enter')draw(e.target.value.trim())}}
function renderLogin(){setModal('MEMBER','로그인','주문과 상담 기록을 편하게 확인하세요.',`<form class="form-grid" id="loginForm"><input name="account" placeholder="아이디 또는 이메일" required><input name="password" type="password" placeholder="비밀번호" required><div class="form-actions"><button class="primary">로그인</button><button type="button" class="secondary" data-open="signup">회원가입</button></div></form>`);$('#loginForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);try{const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:fd.get('account'),password:fd.get('password')})});if(!r.ok)throw 0;closeModal();await updateAccount()}catch(_){alert('로그인 서버 연결을 확인해 주세요.')}}}
function renderSignup(){setModal('MEMBER','회원가입','이룸의 주문과 상담을 더 편하게 이용하세요.',`<form class="form-grid" id="signupForm"><input name="username" placeholder="아이디" required><input name="name" placeholder="이름" required><input name="phone" placeholder="연락처"><input name="password" type="password" placeholder="비밀번호" required><div class="form-actions"><button class="primary">가입하기</button></div></form>`);$('#signupForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);try{const r=await fetch('/api/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(fd.entries()))});if(!r.ok)throw 0;closeModal();await updateAccount()}catch(_){alert('회원가입 서버 연결을 확인해 주세요.')}}}
function renderMyPage(){setModal('MY IROOM','MY IROOM','로그인 상태와 주문 관련 기능을 확인할 수 있습니다.',`<div class="guide-grid"><div class="guide-box"><b>주문 확인</b><p>주문 및 상담 내역을 확인합니다.</p></div><div class="guide-box"><b>맞춤 상담</b><p>카카오 오픈채팅에서 빠르게 상담할 수 있습니다.</p></div></div><p><button class="primary" data-kakao-chat>카카오 상담</button></p>`)}
function renderTerms(){setModal('TERMS','이용약관','이룸 fresh fruits 서비스 이용을 위한 기본 안내입니다.',`<div class="guide-box"><p>상품의 구성과 가격, 배송 일정은 계절과 산지 상황에 따라 달라질 수 있습니다. 주문 전 최종 상품 정보와 결제 안내를 확인해 주세요.</p></div>`)}
function renderPrivacy(){setModal('PRIVACY','개인정보처리방침','상담과 주문 처리를 위해 필요한 최소한의 정보만 사용합니다.',`<div class="guide-box"><p>주문·배송·상담을 위한 정보는 관련 법령과 내부 운영 기준에 따라 안전하게 관리합니다.</p></div>`)}

function showTodayInfo(name,type,value=''){const m=meta(name),p=productFor(name);if(type==='origin'){setModal('TODAY PICK',`${name} 산지 안내`,`${name}의 산지는 당일 입고와 품질 상태에 따라 달라질 수 있습니다.`,`<div class="today-info"><div><b>오늘 안내 산지</b><p>${esc(value||p.origin||'입고별 안내')}</p></div><div><b>이룸의 확인 기준</b><p>산지명만 보지 않고 숙도·향·탄력·당일 상태까지 함께 확인합니다.</p></div></div><p><button class="primary" data-kakao-chat>오늘 입고 산지 문의</button></p>`)}else{setModal('TODAY PICK',`${name} 구성 안내`,`${m[1]}. 현재 판매 구성과 중량을 확인하세요.`,`<div class="today-info"><div><b>현재 구성</b><p>${esc(p.unit||'구성 상담')}</p></div><div><b>선물 · 가정용</b><p>받는 분과 예산에 맞춰 포장과 구성을 제안할 수 있습니다.</p></div></div><p><button class="primary" data-kakao-chat>구성 상담하기</button></p>`)}showOverlay('detail')}
function showFruit(name,visual='',displayName=''){const m=meta(name),p=productFor(name),label=displayName||name;setModal('FRUIT DETAIL',label,`${m[1]} · ${seasons[current].label} 추천`,`<div class="fruit-detail commerce-detail"><div class="fruit-detail-visual"><img src="${productVisual(name,visual)}" alt="${esc(label)}"></div><div class="fruit-detail-content"><h3>${esc(label)} 상세설명</h3><p>${m[1]}. 이룸은 계절과 당일 상태를 함께 살펴 좋은 과일을 골라드립니다.</p><div class="product-facts"><span><small>판매가</small><b>${displayPrice(p)}</b></span><span><small>구성</small><b>${esc(p.unit||'구성 상담')}</b></span><span><small>산지</small><b>${esc(p.origin||'입고별 안내')}</b></span><span><small>재고</small><b>${p.stock>0?'판매중':'입고 확인'}</b></span></div><div class="detail-grid"><div><b>맛과 식감</b><span>${m[1]}</span></div><div><b>고르는 기준</b><span>${details.choose}</span></div><div><b>보관 방법</b><span>${details.keep}</span></div><div><b>맛있게 즐기기</b><span>${details.enjoy}</span></div></div><div class="qty-buy"><label>수량 <input type="number" min="1" max="20" value="1" id="detailQty"></label><button class="primary" data-buy-now data-name="${esc(name)}" data-display-name="${esc(label)}" data-visual="${esc(visual)}" data-qty-source="detailQty">BUY NOW</button><button class="secondary" data-cart-add data-name="${esc(name)}" data-display-name="${esc(label)}" data-visual="${esc(visual)}" data-qty-source="detailQty">ADD TO CART</button></div></div></div>`);showOverlay('fruit')}

function quickQtyMarkup(id='quickQty'){
 return `<div class="quick-qty" aria-label="수량 선택"><button type="button" data-quick-qty-step="-1" data-qty-target="${esc(id)}" aria-label="수량 줄이기">−</button><input id="${esc(id)}" type="number" min="1" max="20" value="1" inputmode="numeric" aria-label="수량"><button type="button" data-quick-qty-step="1" data-qty-target="${esc(id)}" aria-label="수량 늘리기">＋</button></div>`
}
function updateQuickTotal(){const input=$('#quickQty');const total=$('[data-quick-total]');if(!input||!total)return;const qty=Math.max(1,Math.min(20,Number(input.value)||1));input.value=qty;total.textContent=won(Number(total.dataset.unitPrice||0)*qty)}
function renderQuickAction(name,visual='',mode='cart',displayName=''){
 const p=productFor(name),m=meta(name),label=displayName||name,isBuy=mode==='buy';
 const action=isBuy?'바로 구매':'장바구니 담기';
 setModal(isBuy?'BUY NOW':'ADD TO BAG',`${label} ${action}`,isBuy?'이 상품의 수량만 선택한 뒤 바로 주문합니다. 장바구니 상품과는 섞이지 않습니다.':'이 상품의 수량만 선택해 장바구니에 추가합니다. 전체 장바구니는 상단 장바구니에서 확인하세요.',`<div class="quick-action-card"><div class="quick-action-visual"><img src="${productVisual(name,visual)}" alt="${esc(label)}"></div><div class="quick-action-info"><span class="quick-action-label">${isBuy?'SINGLE ITEM ORDER':'ADD ONE ITEM'}</span><h3>${esc(label)}</h3><p>${esc(m[1])}</p><div class="quick-action-meta"><span>${esc(p.unit||'구성 상담')}</span><b>${displayPrice(p)}</b></div><div class="quick-action-row"><div><small>수량</small>${quickQtyMarkup('quickQty')}</div><div class="quick-action-total"><small>상품금액</small><b data-quick-total data-unit-price="${Number(p.price||0)}">${p.price>0?won(p.price):'가격 확인'}</b></div></div><button type="button" class="primary quick-action-submit" ${isBuy?'data-quick-buy-confirm':'data-quick-cart-confirm'} data-name="${esc(name)}" data-display-name="${esc(label)}" data-visual="${esc(visual)}">${isBuy?'이 수량으로 바로 구매':'이 수량을 장바구니에 담기'}</button></div></div>`);
 showOverlay(isBuy?'quick-buy':'quick-cart');
 updateQuickTotal();
}
function showToast(message){let t=document.getElementById('iroomToast');if(!t){t=document.createElement('div');t.id='iroomToast';t.className='iroom-toast';t.setAttribute('role','status');t.setAttribute('aria-live','polite');document.body.appendChild(t)}t.textContent=message;t.classList.remove('show');requestAnimationFrame(()=>t.classList.add('show'));clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),2200)}

function makeCartItem(name,qty=1,visual='',displayName=''){const p=productFor(name);qty=Math.max(1,Math.min(20,Number(qty)||1));return {id:p.id||null,name,displayName:displayName||name,price:Number(p.price||0),unit:p.unit||'구성 상담',qty,visual:visual||meta(name)[0]}}
function addToCart(name,qty=1,visual='',displayName=''){const item=makeCartItem(name,qty,visual,displayName),p=productFor(name);const existing=cart.find(x=>(item.id&&x.id===item.id)||(!item.id&&x.name===name));if(existing)existing.qty=Math.min(20,Number(existing.qty||0)+item.qty);else cart.push(item);saveCart();return p}
function renderCart(){overlay.dataset.kind='cart';const subtotal=cart.reduce((s,x)=>s+(Number(x.price||0)*Number(x.qty||0)),0),baseShipping=Math.max(0,Number(publicSite.shippingFee??4000)||0),freeFrom=Math.max(0,Number(publicSite.freeShippingFrom??50000)||0),shipping=(freeFrom>0&&subtotal>=freeFrom)?0:baseShipping,total=subtotal+shipping;setModal('SHOPPING BAG','장바구니',cart.length?'선택한 과일과 수량을 확인하세요.':'아직 장바구니가 비어 있습니다.',cart.length?`<div class="cart-list">${cart.map((x,i)=>`<div class="cart-item"><img src="${productVisual(x.name,x.visual)}" alt="${esc(x.name)}"><div><b>${esc(x.displayName||x.name)}</b><small>${esc(x.unit||'')}</small><strong>${x.price?won(x.price):'가격 확인'}</strong></div><div class="cart-qty"><button data-cart-step="-1" data-index="${i}">−</button><span>${x.qty}</span><button data-cart-step="1" data-index="${i}">＋</button><button class="cart-remove" data-cart-remove data-index="${i}">삭제</button></div></div>`).join('')}</div><div class="cart-total cart-total-breakdown"><span>상품 합계 <b>${won(subtotal)}</b></span><span>배송비 <b>${shipping?won(shipping):'무료'}</b></span><strong>예상 결제금액 <b>${won(total)}</b></strong>${freeFrom>0&&subtotal<freeFrom?`<small>${won(freeFrom-subtotal)} 더 담으면 무료배송</small>`:''}</div><div class="cart-bottom"><button class="secondary" data-kakao-chat>가격·구성 상담</button><button class="primary" data-checkout>주문하기</button></div>`:`<div class="empty-cart"><p>판매 과일에서 장바구니 버튼을 눌러 담아보세요.</p><button class="primary" data-close-modal>계속 쇼핑하기</button></div>`)}
function renderCheckout(items=cart,source='cart'){
  overlay.dataset.kind='checkout';
  const orderItems=(Array.isArray(items)?items:[]).map(x=>({...x,qty:Math.max(1,Math.min(20,Number(x.qty)||1))}));
  if(!orderItems.length){renderCart();showOverlay('cart');return}
  const isBuyNow=source==='buy-now';
  const subtotal=orderItems.reduce((s,x)=>s+Number(x.price||0)*Number(x.qty||0),0);
  const baseShipping=Math.max(0,Number(publicSite.shippingFee??4000)||0);
  const freeFrom=Math.max(0,Number(publicSite.freeShippingFrom??50000)||0);
  const jejuExtra=Math.max(0,Number(publicSite.jejuShippingExtra??4000)||0);
  const remoteExtra=Math.max(0,Number(publicSite.remoteShippingExtra??5000)||0);
  const baseFee=(freeFrom>0&&subtotal>=freeFrom)?0:baseShipping;
  const calcShipping=(region='normal')=>baseFee+(region==='jeju'?jejuExtra:region==='remote'?remoteExtra:0);
  const shipping=calcShipping('normal'),total=subtotal+shipping;
  setModal(isBuyNow?'BUY NOW':'CHECKOUT',isBuyNow?'바로 구매':'주문 정보 입력',isBuyNow?'선택한 상품만 바로 주문합니다. 기존 장바구니 상품은 그대로 유지됩니다.':'장바구니 상품의 주문 정보를 입력해 주세요.',`<div class="checkout-summary">${orderItems.map(x=>`<div><span>${esc(x.displayName||x.name)} × ${x.qty}</span><b>${won(Number(x.price||0)*Number(x.qty||0))}</b></div>`).join('')}<div><span>상품금액</span><b>${won(subtotal)}</b></div><div><span>배송비</span><b id="checkoutShippingFee">${shipping?won(shipping):'무료'}</b></div><strong><span>최종 결제예정금액</span><b id="checkoutGrandTotal">${won(total)}</b></strong>${freeFrom>0&&subtotal<freeFrom?`<small class="free-shipping-note">${won(freeFrom-subtotal)} 더 주문하면 일반지역 기본배송비가 무료입니다.</small>`:''}</div><form id="checkoutForm" class="checkout-form"><div class="form-grid"><input name="customer_name" placeholder="주문자명" required><input name="phone" placeholder="연락처" required><input name="email" type="email" placeholder="이메일 (선택)"><input name="postcode" placeholder="우편번호 (선택)"><input class="full" name="address1" placeholder="배송지 주소" required><input class="full" name="address2" placeholder="상세주소"><label class="full shipping-region-field"><span>배송지역</span><select name="shipping_region" id="shippingRegion"><option value="normal">일반지역</option><option value="jeju">제주도 (+${won(jejuExtra)})</option><option value="remote">제주 외 도서산간 (+${won(remoteExtra)})</option></select></label><textarea class="full" name="memo" placeholder="배송 메모"></textarea></div><div class="checkout-notice">${isBuyNow?'바로 구매는 현재 선택한 상품만 주문됩니다.':'매일 시세와 입고 상태를 반영합니다.'} 기본 배송비 ${won(baseShipping)} · ${won(freeFrom)} 이상 일반지역 무료배송 · 제주 추가 ${won(jejuExtra)} · 제주 외 도서산간 추가 ${won(remoteExtra)}입니다. 지역 추가운임은 무료배송과 별도로 적용됩니다.${publicSite.courier?` 택배사: ${esc(publicSite.courier)}.`:' 택배사는 확정 후 안내합니다.'}</div><div class="payment-bank-box"><div><small>현재 결제방법 · 무통장입금</small><strong>${esc(paymentBank.name)} ${esc(paymentBank.account)}</strong><span>예금주 ${esc(paymentBank.holder)} · 토스결제는 준비 중입니다.</span></div><button type="button" class="secondary" data-copy-bank>계좌 복사</button></div><button class="primary checkout-submit">주문 접수하기</button></form>`);
  showOverlay('checkout');
  const form=$('#checkoutForm'),regionSelect=$('#shippingRegion'),shippingEl=$('#checkoutShippingFee'),totalEl=$('#checkoutGrandTotal');
  const updateShipping=()=>{const fee=calcShipping(regionSelect?.value||'normal');if(shippingEl)shippingEl.textContent=fee?won(fee):'무료';if(totalEl)totalEl.textContent=won(subtotal+fee)};
  if(regionSelect)regionSelect.onchange=updateShipping;
  form.onsubmit=async e=>{
    e.preventDefault();
    const missing=orderItems.some(x=>!x.id);
    if(missing){alert('일부 상품은 관리자 상품정보 연결이 필요합니다. 카카오 상담으로 빠르게 주문을 도와드릴게요.');window.open(KAKAO,'_blank','noopener');return}
    const fd=new FormData(form);const payload=Object.fromEntries(fd.entries());
    payload.items=orderItems.map(x=>({product_id:x.id,qty:x.qty}));payload.payment_method='무통장입금';
    try{
      const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)throw new Error(d.error||'주문 처리 오류');if(!isBuyNow){cart=[];saveCart()}
      const regionLabel=d.shipping_region_label||({'normal':'일반지역','jeju':'제주도','remote':'제주 외 도서산간'}[payload.shipping_region]||'일반지역');
      setModal('ORDER COMPLETE','주문이 접수되었습니다.',`주문번호 <b>${esc(d.order_no||'')}</b>`, `<div class="order-complete"><p>배송지역 <b>${esc(regionLabel)}</b><br>상품금액 <b>${won(d.subtotal??subtotal)}</b><br>배송비 <b>${Number(d.shipping_fee??shipping)===0?'무료':won(d.shipping_fee??shipping)}</b><br>총 결제 예정 금액 <b>${won(d.total_amount||0)}</b></p><p>${esc(d.bank?.name||'')} ${esc(d.bank?.account||'')}<br>예금주 ${esc(d.bank?.holder||'')}</p><div class="order-complete-actions"><button class="secondary" data-copy-bank>계좌 복사</button><button class="primary" data-close-modal>확인</button></div></div>`)
    }catch(err){alert(err.message||'주문 처리 중 오류가 발생했습니다.')}
  }
}
function qtyFrom(el){const id=el.dataset.qtySource;return id?Number(document.getElementById(id)?.value||1):1}
document.addEventListener('click',e=>{
 if(previewMode&&previewSelect(e.target)){e.preventDefault();e.stopPropagation();return}
 const cb=e.target.closest('[data-copy-bank]');if(cb){e.preventDefault();const text=`${paymentBank.name} ${paymentBank.account} 예금주 ${paymentBank.holder}`;navigator.clipboard?.writeText(text).then(()=>showToast('입금계좌를 복사했습니다.')).catch(()=>prompt('입금계좌를 복사해 주세요.',text));return}
 const kc=e.target.closest('[data-kakao-chat]');if(kc){e.preventDefault();window.open(KAKAO,'_blank','noopener');return}
 const qstep=e.target.closest('[data-quick-qty-step]');if(qstep){e.preventDefault();const input=document.getElementById(qstep.dataset.qtyTarget||'quickQty');if(input){input.value=Math.max(1,Math.min(20,(Number(input.value)||1)+Number(qstep.dataset.quickQtyStep||0)));updateQuickTotal()}return}
 const qbuy=e.target.closest('[data-quick-buy-confirm]');if(qbuy){e.preventDefault();const item=makeCartItem(qbuy.dataset.name,Number($('#quickQty')?.value||1),qbuy.dataset.visual||'',qbuy.dataset.displayName||'');renderCheckout([item],'buy-now');return}
 const qcart=e.target.closest('[data-quick-cart-confirm]');if(qcart){e.preventDefault();const qty=Math.max(1,Math.min(20,Number($('#quickQty')?.value)||1));addToCart(qcart.dataset.name,qty,qcart.dataset.visual||'',qcart.dataset.displayName||'');closeModal();showToast(`${qcart.dataset.name} ${qty}개를 장바구니에 담았습니다.`);return}
 const buy=e.target.closest('[data-buy-now]');if(buy){e.preventDefault();e.stopPropagation();const src=buy.dataset.qtySource;if(src){const item=makeCartItem(buy.dataset.name,qtyFrom(buy),buy.dataset.visual||'',buy.dataset.displayName||'');renderCheckout([item],'buy-now')}else renderQuickAction(buy.dataset.name,buy.dataset.visual||'','buy',buy.dataset.displayName||'');return}
 const add=e.target.closest('[data-cart-add]');if(add){e.preventDefault();e.stopPropagation();const src=add.dataset.qtySource;if(src){const qty=qtyFrom(add);addToCart(add.dataset.name,qty,add.dataset.visual||'',add.dataset.displayName||'');showToast(`${add.dataset.name} ${qty}개를 장바구니에 담았습니다.`)}else renderQuickAction(add.dataset.name,add.dataset.visual||'','cart',add.dataset.displayName||'');return}
 const modal=e.target.closest('[data-modal]');if(modal){e.preventDefault();e.stopPropagation();hideAccountDirect();openModal(modal.dataset.modal);return}
 const step=e.target.closest('[data-cart-step]');if(step){e.preventDefault();const i=Number(step.dataset.index),delta=Number(step.dataset.cartStep);if(cart[i])cart[i].qty=Math.max(1,Math.min(20,cart[i].qty+delta));saveCart();renderCart();return}
 const rem=e.target.closest('[data-cart-remove]');if(rem){e.preventDefault();cart.splice(Number(rem.dataset.index),1);saveCart();renderCart();return}
 const checkout=e.target.closest('[data-checkout]');if(checkout){e.preventDefault();renderCheckout(cart,'cart');return}
 const cm=e.target.closest('[data-close-modal]');if(cm){closeModal();return}
 const info=e.target.closest('[data-info-type]');if(info){e.preventDefault();showTodayInfo(info.dataset.infoName,info.dataset.infoType,info.dataset.infoValue||'');return}
 const f=e.target.closest('[data-fruit]');if(f){e.preventDefault();showFruit(f.dataset.fruit,f.dataset.visual||'',f.dataset.displayName||'');return}
 const card=e.target.closest('[data-card-fruit]');if(card&&!e.target.closest('button,a,input,select,textarea,label')){e.preventDefault();showFruit(card.dataset.cardFruit,card.dataset.cardVisual||'',card.dataset.cardDisplay||'');return}
 const o=e.target.closest('[data-open]');if(o){openModal(o.dataset.open);return}
});

document.addEventListener('input',e=>{if(e.target?.id==='quickQty')updateQuickTotal()});

const band=$('[data-band]');if(band)band.onclick=()=>window.open('https://band.us/@iroomfruits','_blank','noopener');const share=$('[data-share]');if(share)share.onclick=async()=>{try{if(navigator.share)await navigator.share({title:'이룸 fresh fruits',url:location.href});else{await navigator.clipboard.writeText(location.href);alert('주소를 복사했습니다.')}}catch(_){}};
let deferredPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e});const install=$('[data-install]');if(install)install.onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null}else alert('브라우저 메뉴에서 “앱 설치” 또는 “홈 화면에 추가”를 이용해 주세요.')};
async function loadPaymentInfo(){try{const r=await fetch('/api/site/payment-info',{cache:'no-store'});if(r.ok){const d=await r.json();if(d.bank)paymentBank={...paymentBank,...d.bank}}}catch(_){}}
async function loadPublicConfig(){try{const r=await fetch('/api/site/footer-config',{cache:'no-store'});if(!r.ok)return;const d=await r.json();publicSite={...publicSite,...(d.site||{})};const set=(sel,text,hideEmpty=false)=>{const el=$(sel);if(!el)return;if(hideEmpty&&!text){el.hidden=true;return}el.hidden=false;el.textContent=text};set('[data-footer-site]',publicSite.siteName||'이룸 fresh fruits');set('[data-footer-representative]',publicSite.representative?`대표자 ${publicSite.representative}`:'',true);set('[data-footer-business]',`사업자등록번호 ${publicSite.businessNo||'775-97-00292'}`);set('[data-footer-mailorder]',`통신판매업 신고 ${publicSite.mailOrderNo||'제 2025-서울 송파 -1052호'}`);set('[data-footer-address]',publicSite.address||'서울특별시 송파구 송이로15길 33, 상가동 B-103호');set('[data-footer-phone]',publicSite.phone?`고객센터 ${publicSite.phone}`:'',true);set('[data-footer-email]',publicSite.email?`이메일 ${publicSite.email}`:'',true);set('[data-footer-hosting]',`호스팅서비스 제공자 ${publicSite.hostingProvider||'Render'}`);}catch(_){}}
async function updateAccount(){let user=null;try{const r=await fetch('/api/me',{credentials:'same-origin'});if(r.ok){const d=await r.json();user=d.user||d}}catch(_){}$('[data-account-status]').textContent=user?.name||user?.username||'로그인이 필요합니다.';$$('[data-guest-only]').forEach(x=>x.hidden=!!user);$$('[data-user-only]').forEach(x=>x.hidden=!user)}
const logout=$('[data-logout]');if(logout)logout.onclick=async()=>{try{await fetch('/api/logout',{method:'POST'})}catch(_){}await updateAccount();closeAccount()};
const carouselTimers=new Map();
function stopCarousel(sel){
 const state=carouselTimers.get(sel);
 if(state?.raf)cancelAnimationFrame(state.raf);
 if(state?.resumeTimer)clearTimeout(state.resumeTimer);
 state?.abort?.abort();
 state?.observer?.disconnect();
 carouselTimers.delete(sel);
}
function setupSeamlessCarousel(sel,speed=.55){
 const el=$(sel);if(!el)return;stopCarousel(sel);
 el.querySelectorAll('[data-loop-clone]').forEach(n=>n.remove());
 const originals=[...el.children];if(originals.length<2)return;
 const before=originals.map(n=>{const c=n.cloneNode(true);c.dataset.loopClone='before';c.setAttribute('aria-hidden','true');return c});
 const after=originals.map(n=>{const c=n.cloneNode(true);c.dataset.loopClone='after';c.setAttribute('aria-hidden','true');return c});
 const bf=document.createDocumentFragment(),af=document.createDocumentFragment();
 before.forEach(n=>bf.appendChild(n));after.forEach(n=>af.appendChild(n));
 el.prepend(bf);el.append(af);

 let paused=false,hoverPaused=false,interactionPaused=false,resumeTimer=0,raf=0,loopWidth=0,startX=0,last=performance.now(),measured=false;
 const abort=new AbortController();
 const signal=abort.signal;
 const contentX=node=>node.getBoundingClientRect().left-el.getBoundingClientRect().left+el.scrollLeft;
 const measure=()=>{
   if(!document.body.contains(el))return;
   startX=contentX(originals[0]);
   const nextX=contentX(after[0]);
   loopWidth=Math.max(1,nextX-startX);
   if(!measured||el.scrollLeft<2||el.scrollLeft>startX+loopWidth*1.25)el.scrollLeft=startX;
   measured=true;
 };
 const normalize=()=>{
   if(!measured||loopWidth<2)return;
   while(el.scrollLeft>=startX+loopWidth)el.scrollLeft-=loopWidth;
   while(el.scrollLeft<=startX-loopWidth+2)el.scrollLeft+=loopWidth;
 };
 const frame=now=>{
   const dt=Math.min(48,Math.max(0,now-last));last=now;
   if(measured&&!paused&&!document.hidden&&!overlay?.classList.contains('open')){
     el.scrollLeft+=speed*(dt/16.67);
     normalize();
   }
   raf=requestAnimationFrame(frame);
 };
 const syncPaused=()=>{paused=hoverPaused||interactionPaused};
 const pauseInteraction=()=>{interactionPaused=true;clearTimeout(resumeTimer);syncPaused()};
 const resumeInteractionSoon=(delay=900)=>{clearTimeout(resumeTimer);resumeTimer=setTimeout(()=>{normalize();interactionPaused=false;syncPaused();last=performance.now()},delay)};
 const pauseHover=()=>{hoverPaused=true;clearTimeout(resumeTimer);syncPaused()};
 const resumeHover=()=>{hoverPaused=false;syncPaused();last=performance.now()};

 // Desktop: pause immediately while the mouse pointer is over the slider, resume on leave.
 el.addEventListener('mouseenter',pauseHover,{signal});
 el.addEventListener('mouseleave',resumeHover,{signal});
 // Touch/drag/wheel/focus interactions also pause without breaking the hover rule.
 el.addEventListener('pointerdown',pauseInteraction,{signal});
 el.addEventListener('pointerup',()=>resumeInteractionSoon(),{signal});
 el.addEventListener('pointercancel',()=>resumeInteractionSoon(),{signal});
 el.addEventListener('touchstart',pauseInteraction,{passive:true,signal});
 el.addEventListener('touchend',()=>resumeInteractionSoon(),{passive:true,signal});
 el.addEventListener('wheel',()=>{pauseInteraction();resumeInteractionSoon(700)},{passive:true,signal});
 el.addEventListener('focusin',pauseInteraction,{signal});
 el.addEventListener('focusout',()=>resumeInteractionSoon(),{signal});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){last=performance.now();requestAnimationFrame(measure)}},{signal});

 const observer='ResizeObserver' in window?new ResizeObserver(()=>requestAnimationFrame(measure)):null;
 if(observer)observer.observe(el);
 window.addEventListener('resize',()=>requestAnimationFrame(measure),{passive:true,signal});
 requestAnimationFrame(()=>requestAnimationFrame(measure));
 raf=requestAnimationFrame(frame);
 carouselTimers.set(sel,{get raf(){return raf},get resumeTimer(){return resumeTimer},abort,observer});
}
function setupManualCarousel(sel){
 const el=$(sel);if(!el)return;stopCarousel(sel);
 el.querySelectorAll('[data-loop-clone]').forEach(n=>n.remove());
 const abort=new AbortController(),signal=abort.signal;
 let dragging=false,startX=0,startScroll=0,moved=false;
 const endDrag=e=>{if(!dragging)return;dragging=false;el.classList.remove('is-dragging');try{if(e?.pointerId!=null&&el.hasPointerCapture?.(e.pointerId))el.releasePointerCapture(e.pointerId)}catch(_){};setTimeout(()=>{moved=false},0)};
 el.addEventListener('pointerdown',e=>{
   if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('button,a,input,select,textarea,label'))return;
   dragging=true;moved=false;startX=e.clientX;startScroll=el.scrollLeft;el.classList.add('is-dragging');try{el.setPointerCapture(e.pointerId)}catch(_){}
 },{signal});
 el.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-startX;if(Math.abs(dx)>4)moved=true;el.scrollLeft=startScroll-dx},{signal});
 el.addEventListener('pointerup',endDrag,{signal});el.addEventListener('pointercancel',endDrag,{signal});
 el.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false}},{capture:true,signal});
 el.tabIndex=0;
 el.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();el.scrollBy({left:(e.key==='ArrowRight'?1:-1)*Math.max(280,el.clientWidth*.72),behavior:'smooth'})}},{signal});
 carouselTimers.set(sel,{abort});
}
function setupAllCarousels(){
 if(previewMode){stopCarousel('#todayGrid');stopCarousel('#premiumGrid');stopCarousel('#seasonalGrid');stopCarousel('#libraryGrid');return}
 // Keep motion focused: only Today's IROOM PICK auto-plays.
 setupSeamlessCarousel('#todayGrid',.50);
 setupManualCarousel('#premiumGrid');
 setupManualCarousel('#seasonalGrid');
 stopCarousel('#libraryGrid');
 $('#libraryGrid')?.querySelectorAll('[data-loop-clone]').forEach(n=>n.remove());
}

(async()=>{if(previewMode)document.body.classList.add('admin-preview-mode');await Promise.all([loadProducts(),loadHomepageConfig()]);applySeason(current);updateCartCount();updateAccount();try{if(!previewMode&&'serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js?v=53').catch(()=>{})}catch(_){}})();
})();
