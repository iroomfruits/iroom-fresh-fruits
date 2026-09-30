
(()=>{"use strict";
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

const mega=$("[data-mega-panel]");
const shade=$(".h244-shade");
const catalog=$("[data-catalog-panel]");
let activeMega="";

const catalogSets={
  season:{title:"제철 과일",tabs:["전체","사과","배","포도","감귤","딸기","석류"],keys:["apple","pear","shine","mandarin","strawberry","pomegranate"]},
  applepear:{title:"사과 · 배",tabs:["전체","사과","배"],keys:["apple","pear"]},
  grape:{title:"포도 · 샤인머스캣",tabs:["전체","샤인머스캣","포도"],keys:["shine","grape"]},
  citrus:{title:"감귤 · 만감류",tabs:["전체","감귤"],keys:["mandarin"]},
  berry:{title:"딸기 · 베리류",tabs:["전체","딸기","블루베리"],keys:["strawberry","blueberry"]},
  red:{title:"석류 · 감",tabs:["전체","석류","감"],keys:["pomegranate","persimmon"]},
  other:{title:"기타 과일",tabs:["전체","키위"],keys:["kiwi"]},
  value:{title:"3만원대 추천",tabs:["전체"],keys:["apple","mandarin","strawberry","pomegranate"]},
  premium:{title:"이룸 상위 선별",tabs:["전체"],keys:["pear","shine","pomegranate","grape"]},
  "gift-mix":{title:"혼합 과일세트",tabs:["전체"],keys:["gift"]},
  "gift-applepear":{title:"사과 · 배 선물",tabs:["전체","사과","배"],keys:["apple","pear"]},
  "gift-premium":{title:"프리미엄 단품",tabs:["전체"],keys:["shine","pomegranate","pear"]},
  "gift-business":{title:"기업 · 단체 선물",tabs:["전체"],keys:["gift"]}
};
const products={
  apple:{name:"사과",fruit:"사과",origin:"국내산",pack:"3kg",price:"32,000원",image:"./iroom_assets/home2_v6044/apple.webp"},
  pear:{name:"나주배",fruit:"배",origin:"전남 나주",pack:"5kg",price:"38,000원",image:"./iroom_assets/home2_v6044/pear.webp"},
  shine:{name:"샤인머스캣",fruit:"샤인머스캣",origin:"국내산",pack:"2kg",price:"46,000원",image:"./iroom_assets/home2_v6044/shine.webp"},
  mandarin:{name:"제주 감귤",fruit:"감귤",origin:"제주",pack:"3kg",price:"28,000원",image:"./iroom_assets/home2_v6044/mandarin.webp"},
  strawberry:{name:"설향 딸기",fruit:"딸기",origin:"국내산",pack:"1kg 내외",price:"25,000원",image:"./iroom_assets/home2_v6044/strawberry.webp"},
  pomegranate:{name:"석류",fruit:"석류",origin:"엄선",pack:"2kg",price:"28,000원",image:"./iroom_assets/home2_v6044/pomegranate.webp"},
  grape:{name:"포도",fruit:"포도",origin:"국내산",pack:"2kg",price:"26,000원",image:"./iroom_assets/home2_v6044/grape.webp"},
  persimmon:{name:"제철 감",fruit:"감",origin:"국내산",pack:"3kg",price:"26,000원",image:"./iroom_assets/home2_v6044/persimmon.webp"},
  blueberry:{name:"블루베리",fruit:"블루베리",origin:"국내산",pack:"500g",price:"24,000원",image:"./iroom_assets/home2_v6044/blueberry.webp"},
  kiwi:{name:"키위",fruit:"키위",origin:"엄선",pack:"1kg",price:"26,000원",image:"./iroom_assets/home2_v6044/kiwi.webp"},
  gift:{name:"이룸 프리미엄 선물세트",fruit:"선물세트",origin:"이룸 엄선",pack:"제철 구성",price:"상담",image:"./iroom_assets/home2_v6044/gift.webp"}
};

function closeMega(){
  if(!mega)return;
  mega.hidden=true;
  if(shade)shade.hidden=true;
  activeMega="";
  $$("[data-mega-view]",mega).forEach(v=>v.hidden=true);
  $$("[data-mega]").forEach(b=>b.classList.remove("is-active"));
}
function openMega(name){
  if(!mega)return;
  const view=$(`[data-mega-view="${name}"]`,mega);
  if(!view)return;
  $$("[data-mega-view]",mega).forEach(v=>v.hidden=true);
  view.hidden=false;
  mega.hidden=false;
  if(shade)shade.hidden=false;
  activeMega=name;
  $$("[data-mega]").forEach(b=>b.classList.toggle("is-active",b.dataset.mega===name));
}
function closeCatalog(){
  if(!catalog)return;
  catalog.hidden=true;
  document.documentElement.style.overflow="";
}
function openCatalog(key){
  const set=catalogSets[key]||catalogSets.season;
  closeMega();
  const title=$("[data-catalog-title]",catalog);
  const tabs=$("[data-catalog-tabs]",catalog);
  const grid=$("[data-catalog-grid]",catalog);
  if(title)title.textContent=set.title;
  if(tabs)tabs.innerHTML=set.tabs.map((t,i)=>`<button type="button" class="${i===0?"is-active":""}">${t}</button>`).join("");
  if(grid)grid.innerHTML=set.keys.map(k=>{
    const p=products[k];
    return `<button type="button" class="h244-catalog-card" data-fruit="${p.fruit}">
      <span class="h244-catalog-photo"><img src="${p.image}" alt="${p.name}"></span>
      <span class="h244-catalog-info"><b>${p.name}</b><small>${p.origin}</small><em>${p.pack}</em><strong>${p.price}</strong></span>
    </button>`;
  }).join("");
  catalog.hidden=false;
  document.documentElement.style.overflow="hidden";
}

function closeSharedModal(){
  const back=$("#modalBackdrop");
  if(!back || back.getAttribute("aria-hidden")!=="false")return false;
  const close=back.querySelector("[data-close],.modal-close");
  if(close){close.click();return true}
  back.setAttribute("aria-hidden","true");
  return true;
}

document.addEventListener("click",e=>{
  const menu=e.target.closest("[data-mega]");
  if(menu){
    e.preventDefault();
    const name=menu.dataset.mega;
    if(!mega.hidden && activeMega===name)closeMega(); else openMega(name);
    return;
  }
  if(e.target.closest("[data-close-mega]")){e.preventDefault();closeMega();return}
  const cat=e.target.closest("[data-catalog]");
  if(cat){e.preventDefault();openCatalog(cat.dataset.catalog);return}
  if(e.target.closest("[data-catalog-close]")){e.preventDefault();closeCatalog();return}

  // Important: fruit cards themselves open the Home1 product detail modal.
  // We only close our navigation layer and leave the click untouched for iroom-v60-15.js.
  if(e.target.closest("[data-fruit]") && !mega.hidden)closeMega();
},true);

window.addEventListener("keydown",e=>{
  if(e.key!=="Escape")return;
  if(!mega?.hidden){e.preventDefault();e.stopImmediatePropagation();closeMega();return}
  if(catalog && !catalog.hidden){e.preventDefault();e.stopImmediatePropagation();closeCatalog();return}
  if(closeSharedModal()){e.preventDefault();e.stopImmediatePropagation()}
},true);

// Clicking the glass backdrop closes Home1's shared modal as well.
document.addEventListener("click",e=>{
  const back=$("#modalBackdrop");
  if(back && e.target===back && back.getAttribute("aria-hidden")==="false"){
    const close=back.querySelector("[data-close],.modal-close");
    if(close)close.click();
  }
});
})();
