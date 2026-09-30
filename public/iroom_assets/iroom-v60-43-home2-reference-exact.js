
(()=>{"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const mega=$("[data-mega-panel]"), back=$(".h243-backdrop"), catalog=$("[data-catalog]");
let openName=null;
function closeMega(){if(!mega)return; mega.hidden=true; back.hidden=true; openName=null; $$("[data-mega]").forEach(b=>b.classList.remove("is-active")); $$("[data-mega-view]",mega).forEach(v=>v.hidden=true);}
function openMega(name){if(!mega)return; const v=$(`[data-view="${name}"]`,mega); if(!v)return; $$("[data-mega-view]",mega).forEach(x=>x.hidden=true); v.hidden=false; mega.hidden=false; back.hidden=false; openName=name; $$("[data-mega]").forEach(b=>b.classList.toggle("is-active",b.dataset.mega===name));}
function closeCatalog(){if(catalog){catalog.hidden=true; document.documentElement.style.overflow="";}}
document.addEventListener("click",e=>{
  const menu=e.target.closest("[data-mega]");
  if(menu){e.preventDefault(); const n=menu.dataset.mega; if(!mega.hidden&&openName===n)closeMega();else openMega(n);return;}
  if(e.target.closest("[data-close-mega]")){e.preventDefault();closeMega();return;}
  const cat=e.target.closest("[data-category]");
  if(cat){e.preventDefault();openCatalog(cat.dataset.category);return;}
  if(e.target.closest("[data-close-catalog]")){e.preventDefault();closeCatalog();return;}
},true);
window.addEventListener("keydown",e=>{
  if(e.key!=="Escape")return;
  if(!mega?.hidden){e.preventDefault();e.stopImmediatePropagation();closeMega();return;}
  if(catalog && !catalog.hidden){e.preventDefault();e.stopImmediatePropagation();closeCatalog();}
},true);

const data={
apple:{name:"사과",title:"사과",desc:"아삭한 식감과 풍부한 향, 오래 사랑받는 대표 과일입니다.<br>지금 가장 맛있는 사과를 이룸이 엄선했습니다.",photo:"./iroom_assets/home2_v6043/apple-hero.jpg",tabs:["전체","홍로(이지플)","부사","시나노골드","아오리","기타"],items:[
["이지플 사과","국내산 · 3kg (8~10과)","GRADE 프리미엄 · 당도 14Brix 이상","32,000원","./iroom_assets/home2_v6043/apple1.jpg"],
["부사 사과","국내산 · 5kg (14~18과)","GRADE 프리미엄 · 당도 14Brix 이상","45,000원","./iroom_assets/home2_v6043/apple2.jpg"],
["시나노골드","국내산 · 3kg (8~10과)","GRADE 프리미엄 · 당도 15Brix 이상","35,000원","./iroom_assets/home2_v6043/apple3.jpg"],
["가정용 사과","국내산 · 3kg (10~14과)","GRADE 스탠다드 · 당도 13Brix 이상","25,000원","./iroom_assets/home2_v6043/apple4.jpg"]]},
grape:{name:"포도",title:"포도 · 샤인머스캣",desc:"향이 또렷하고 알이 단단한 포도를 골라 소개합니다.",photo:"./iroom_assets/home2_v6043/shine.jpg",tabs:["전체","샤인머스캣","거봉","캠벨"],items:[["샤인머스캣","국내산 · 2kg","GRADE 프리미엄","46,000원","./iroom_assets/home2_v6043/shine.jpg"]]},
citrus:{name:"감귤",title:"감귤 · 만감류",desc:"제주의 햇살을 머금은 산뜻하고 달콤한 감귤류입니다.",photo:"./iroom_assets/home2_v6043/citrus.jpg",tabs:["전체","감귤","한라봉","천혜향"],items:[["제주 감귤","제주산 · 3kg","GRADE 프리미엄","28,000원","./iroom_assets/home2_v6043/citrus.jpg"]]},
stone:{name:"복숭아",title:"복숭아 · 자두",desc:"부드러운 과즙과 향이 좋은 제철 핵과류입니다.",photo:"./iroom_assets/home2_v6043/peach.jpg",tabs:["전체","백도","황도","자두"],items:[["프리미엄 복숭아","국내산 · 2kg","GRADE 프리미엄","34,000원","./iroom_assets/home2_v6043/peach.jpg"]]},
melon:{name:"멜론",title:"멜론 · 수박",desc:"달콤한 향과 풍부한 과즙을 즐기는 여름 과일입니다.",photo:"./iroom_assets/home2_v6043/melon.jpg",tabs:["전체","멜론","수박"],items:[["프리미엄 멜론","국내산 · 2수","GRADE 프리미엄","42,000원","./iroom_assets/home2_v6043/melon.jpg"]]}
};
function openCatalog(key){
  closeMega();
  const d=data[key]||data.apple;
  $("[data-cat-name]",catalog).textContent=d.name;
  $("[data-cat-title]",catalog).textContent=d.title;
  $("[data-cat-desc]",catalog).innerHTML=d.desc;
  const ph=$("[data-cat-photo]",catalog); ph.style.backgroundImage=`url("${d.photo}")`;
  $("[data-cat-tabs]",catalog).innerHTML=d.tabs.map((t,i)=>`<button class="${i===0?"is-active":""}">${t}</button>`).join("");
  $("[data-cat-products]",catalog).innerHTML=d.items.map(x=>`<article><img src="${x[4]}" alt=""><div><h3>${x[0]}</h3><p>${x[1]}</p><small>${x[2]}</small><strong>${x[3]}</strong></div></article>`).join("");
  catalog.hidden=false; document.documentElement.style.overflow="hidden";
}
})();
