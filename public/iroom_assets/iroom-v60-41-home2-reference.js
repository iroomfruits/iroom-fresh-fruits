
(()=>{"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const panel=$("[data-mega-panel]"), dim=$(".h241-dim");
function closeMega(){if(!panel)return; panel.hidden=true; if(dim)dim.hidden=true; $$("[data-mega-view]",panel).forEach(v=>v.hidden=true); $$("[data-mega]").forEach(b=>b.classList.remove("is-active"));}
function openMega(name){if(!panel)return; const v=$(`[data-mega-view="${name}"]`,panel); if(!v)return; $$("[data-mega-view]",panel).forEach(x=>x.hidden=true); v.hidden=false; panel.hidden=false; if(dim)dim.hidden=false; $$("[data-mega]").forEach(b=>b.classList.toggle("is-active",b.dataset.mega===name));}
document.addEventListener("click",e=>{const m=e.target.closest("[data-mega]"); if(m){e.preventDefault(); const n=m.dataset.mega; if(!panel.hidden && $(`[data-mega-view="${n}"]`,panel)?.hidden===false) closeMega(); else openMega(n); return;} if(e.target.closest("[data-mega-close]")){e.preventDefault();closeMega();}});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMega();});

const catalog=$("[data-catalog-panel]");
const catalogData={
"apple-pear":{parent:"제철 과일",title:"사과",heading:"사과",desc:"아삭한 식감과 풍부한 향, 오래 사랑받는 대표 과일입니다.<br>지금 가장 맛있는 사과를 이룸이 엄선했습니다.",img:"/iroom_assets/home2_v6041/apple-hero.jpg",tabs:["전체","홍로(이지플)","부사","시나노골드","아오리","기타"],items:[
["이지플 사과","국내산 · 3kg (8~10과)","GRADE 프리미엄 · 당도 14Brix 이상","32,000원","/iroom_assets/home2_v6041/apple-card-1.jpg"],
["부사 사과","국내산 · 5kg (14~18과)","GRADE 프리미엄 · 당도 14Brix 이상","45,000원","/iroom_assets/home2_v6041/apple-card-2.jpg"],
["시나노골드","국내산 · 3kg (8~10과)","GRADE 프리미엄 · 당도 15Brix 이상","35,000원","/iroom_assets/home2_v6041/apple-card-3.jpg"],
["가정용 사과","국내산 · 3kg (10~14과)","GRADE 스탠다드 · 당도 13Brix 이상","25,000원","/iroom_assets/home2_v6041/apple-card-4.jpg"]]},
"grape":{parent:"제철 과일",title:"포도",heading:"포도 · 샤인머스캣",desc:"알이 단단하고 향이 또렷한 포도만 골라 소개합니다.",img:"/iroom_assets/home2_v6041/shine.jpg",tabs:["전체","샤인머스캣","거봉","캠벨"],items:[
["샤인머스캣","국내산 · 2kg","GRADE 프리미엄 · 18Brix 전후","46,000원","/iroom_assets/home2_v6041/shine.jpg"],
["샤인머스캣 실속","국내산 · 1.5kg","GRADE 스탠다드","32,000원","/iroom_assets/home2_v6041/shine.jpg"]]},
"citrus":{parent:"제철 과일",title:"감귤",heading:"감귤 · 만감류",desc:"제주의 햇살을 머금은 산뜻하고 달콤한 감귤류입니다.",img:"/iroom_assets/home2_v6041/citrus.jpg",tabs:["전체","감귤","한라봉","천혜향"],items:[
["제주 감귤","제주산 · 3kg","GRADE 프리미엄","28,000원","/iroom_assets/home2_v6041/citrus.jpg"]]},
"stone":{parent:"제철 과일",title:"복숭아",heading:"복숭아 · 자두",desc:"부드러운 과즙과 향이 좋은 제철 핵과류입니다.",img:"/iroom_assets/home2_v6041/peach.jpg",tabs:["전체","백도","황도","자두"],items:[
["프리미엄 복숭아","국내산 · 2kg","GRADE 프리미엄","34,000원","/iroom_assets/home2_v6041/peach.jpg"]]},
"melon":{parent:"제철 과일",title:"멜론",heading:"멜론 · 수박",desc:"달콤한 향과 풍부한 과즙을 즐기는 여름 과일입니다.",img:"/iroom_assets/home2_v6041/melon.jpg",tabs:["전체","멜론","수박"],items:[
["프리미엄 멜론","국내산 · 2수","GRADE 프리미엄","42,000원","/iroom_assets/home2_v6041/melon.jpg"]]},
"season":null,"other":null
};
function openCatalog(key){closeMega(); if(!catalog)return; let d=catalogData[key]||catalogData["apple-pear"]; if(!d)d=catalogData["apple-pear"]; $("[data-catalog-parent]",catalog).textContent=d.parent; $("[data-catalog-title]",catalog).textContent=d.title; $("[data-catalog-heading]",catalog).textContent=d.heading; $("[data-catalog-desc]",catalog).innerHTML=d.desc; $("[data-catalog-hero-img]",catalog).src=d.img; const tabs=$("[data-catalog-tabs]",catalog); tabs.innerHTML=d.tabs.map((t,i)=>`<button class="${i===0?"is-active":""}">${t}</button>`).join(""); const grid=$("[data-catalog-grid]",catalog); grid.innerHTML=d.items.map(x=>`<article><img src="${x[4]}" alt="${x[0]}"><div><h3>${x[0]}</h3><p>${x[1]}</p><small>${x[2]}</small><strong>${x[3]}</strong></div></article>`).join(""); catalog.hidden=false; document.documentElement.style.overflow="hidden";}
document.addEventListener("click",e=>{const c=e.target.closest("[data-catalog]"); if(c){e.preventDefault();openCatalog(c.dataset.catalog);return;} if(e.target.closest("[data-catalog-close]")){catalog.hidden=true;document.documentElement.style.overflow="";}});
})();
