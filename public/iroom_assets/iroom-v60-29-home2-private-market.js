(()=>{
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const root=$('#iroomApp'); if(!root)return;
  const won=n=>Number(n||0).toLocaleString('ko-KR')+'원';
  const aliases={
    '이지플':['이지플','홍로사과','경북 홍사과','사과'],
    '나주배':['나주배','배'],
    '샤인머스캣':['샤인머스캣','샤인머스켓','프리미엄 샤인머스캣'],
    '대봉':['대봉','햇감','감'],
    '석류':['석류'], '포도':['포도'], '복숭아':['복숭아','백도복숭아','프리미엄 백도 복숭아'],
    '딸기':['딸기','금실딸기','죽향딸기','설향딸기','프리미엄 딸기'], '체리':['체리'],
    '한라봉':['한라봉','제주 한라봉'], '제주감귤':['제주감귤','감귤']
  };
  const norm=s=>String(s||'').replace(/\s+/g,'').replace(/샤인머스켓/g,'샤인머스캣').replace(/경북|전남|제주|특선|프리미엄|신고/g,'').toLowerCase();
  const fallback={
    '이지플':[32000,'3kg'],'나주배':[38000,'5kg (7~9과)'],'샤인머스캣':[28100,'2kg (3~4송이)'],'대봉':[26000,'3kg'],'석류':[28000,'2kg'],'포도':[26000,'2kg'],
    '복숭아':[29000,'4kg'],'딸기':[22000,'1kg 내외'],'체리':[32000,'1kg'],'한라봉':[28000,'3kg'],'제주감귤':[25000,'5kg']
  };
  let products=[];
  function matchProduct(name){
    const names=(aliases[name]||[name]).map(norm);
    let p=products.find(x=>names.includes(norm(x.name)));
    if(!p)p=products.find(x=>names.some(n=>norm(x.name).includes(n)||n.includes(norm(x.name))));
    if(p)return p;
    const [price,unit]=fallback[name]||[0,'구성 상담']; return {name,price,unit,stock:99};
  }
  function syncProducts(){
    $$('[data-pm-product]').forEach(card=>{
      const name=card.dataset.name; if(!name)return; const p=matchProduct(name);
      const price=card.querySelector('[data-pm-price]'),unit=card.querySelector('[data-pm-unit]');
      if(price)price.textContent=Number(p.price||0)>0?won(p.price):'오늘 시세 확인';
      if(unit)unit.textContent=p.unit||'구성 상담';
      const sold=Number(p.stock??99)<=0;
      card.classList.toggle('is-soldout',sold);
      $$('[data-buy-now],[data-cart-add]',card).forEach(btn=>{btn.disabled=sold;if(sold&&btn.hasAttribute('data-buy-now'))btn.textContent='입고 확인'});
    });
  }
  async function loadProducts(){
    try{const r=await fetch('/api/products',{credentials:'same-origin',cache:'no-store'});if(r.ok){const d=await r.json();products=Array.isArray(d.products)?d.products:[];syncProducts()}}catch(_){syncProducts()}
  }
  function scrollToId(id){const el=document.getElementById(id);if(!el)return;el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}
  $$('[data-pm-scroll]').forEach(btn=>btn.addEventListener('click',()=>{scrollToId(btn.dataset.pmScroll);const m=$('[data-pm-mobile-menu]');if(m)m.hidden=true}));
  const menu=$('[data-pm-mobile-menu]'),menuBtn=$('[data-pm-menu]');
  if(menuBtn&&menu)menuBtn.addEventListener('click',()=>{menu.hidden=!menu.hidden});
  document.addEventListener('click',e=>{if(!menu||menu.hidden)return;if(e.target.closest('[data-pm-menu]')||e.target.closest('[data-pm-mobile-menu]'))return;menu.hidden=true});
  const season=(()=>{const m=new Date().getMonth()+1;return m>=3&&m<=5?'SPRING':m>=6&&m<=8?'SUMMER':m>=9&&m<=11?'AUTUMN':'WINTER'})();
  const eye=$('.pm-eyebrow');if(eye)eye.textContent=`IROOM PRIVATE MARKET · ${season}`;
  loadProducts();
})();
