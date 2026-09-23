(()=>{
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const menu=$('[data-v28-mobile-menu]');
  $('[data-v28-menu]')?.addEventListener('click',()=>{if(menu)menu.hidden=!menu.hidden});
  $$('[data-v28-scroll]').forEach(btn=>btn.addEventListener('click',()=>{document.getElementById(btn.dataset.v28Scroll)?.scrollIntoView({behavior:'smooth',block:'start'});if(menu)menu.hidden=true}));

  const sceneData={
    chestnut:{no:'SCENE 01',title:'밤',image:'/iroom_assets/stilllife28/chestnut.webp',text:'고소한 향과 포근한 질감. 가을의 시작을 가장 담백하게 보여주는 장면입니다.',body:'윤기가 살아 있고 속이 충실한 밤은 가을의 온도를 가장 편안하게 전합니다. 삶거나 구워 먹기 좋고, 차분한 단맛과 고소한 향이 특징입니다.',facts:['계절 · 가을','추천 · 간식, 가족용','포인트 · 고소한 향과 포근한 질감']},
    fig:{no:'SCENE 02',title:'무화과',image:'/iroom_assets/stilllife28/fig.webp',text:'부드러운 과육과 깊은 단맛. 익을수록 향이 풍부해지는 짧은 계절의 과일입니다.',body:'무화과는 후숙 상태에 따라 향과 질감이 크게 달라집니다. 이룸은 너무 단단하거나 지나치게 무른 과실보다 바로 즐기기 좋은 상태를 우선합니다.',facts:['계절 · 늦여름~가을','추천 · 디저트, 치즈 페어링','포인트 · 부드러운 과육과 깊은 단맛']},
    pomegranate:{no:'SCENE 03',title:'석류',image:'/iroom_assets/stilllife28/pomegranate.webp',text:'선명한 색과 산뜻한 과즙. 정물처럼 아름답고 식탁에서는 또렷한 포인트가 됩니다.',body:'석류는 알알이 터지는 산뜻한 과즙과 선명한 색이 매력입니다. 그대로 먹거나 샐러드와 요거트에 곁들이면 계절의 색이 더 또렷해집니다.',facts:['계절 · 가을','추천 · 샐러드, 요거트','포인트 · 산뜻한 과즙과 선명한 색']}
  };
  let currentScene='chestnut';
  const setScene=(key)=>{const s=sceneData[key];if(!s)return;currentScene=key;const img=$('#v28SceneImage');if(img){img.style.opacity='.25';setTimeout(()=>{img.src=s.image;img.alt=s.title+' 정물';img.style.opacity='1'},120)}$('#v28SceneNo').textContent=s.no;$('#v28SceneTitle').textContent=s.title;$('#v28SceneText').textContent=s.text;$$('[data-v28-scene]').forEach(b=>b.classList.toggle('active',b.dataset.v28Scene===key));};
  $$('[data-v28-scene]').forEach(b=>b.addEventListener('click',()=>setScene(b.dataset.v28Scene)));

  const story=$('#v28StoryModal');
  const openStory=key=>{const s=sceneData[key];if(!s||!story)return;$('#v28StoryImage').src=s.image;$('#v28StoryImage').alt=s.title;$('#v28StoryKicker').textContent=s.no+' · SEASONAL NOTE';$('#v28StoryTitle').textContent=s.title;$('#v28StoryBody').textContent=s.body;$('#v28StoryFacts').innerHTML=s.facts.map(x=>`<div>${x}</div>`).join('');story.hidden=false;document.body.style.overflow='hidden'};
  $('#v28SceneDetail')?.addEventListener('click',()=>openStory(currentScene));
  $$('[data-v28-story-close]').forEach(b=>b.addEventListener('click',()=>{if(story){story.hidden=true;document.body.style.overflow=''}}));
  addEventListener('keydown',e=>{if(e.key==='Escape'&&story&&!story.hidden){story.hidden=true;document.body.style.overflow=''}});

  const configs={
    apple:{keys:['이지플','홍로사과','경북 홍사과','사과']},
    pear:{keys:['나주배','배']},
    shine:{keys:['샤인머스캣','샤인머스켓']}
  };
  const norm=v=>String(v||'').replace(/\s+/g,'');
  function hiddenName(card){return card?.dataset?.cardDisplay||card?.dataset?.cardFruit||$('h3',card)?.textContent||''}
  function syncOne(key){
    const root=$(`[data-v28-product="${key}"]`), cfg=configs[key]; if(!root||!cfg)return;
    const cards=$$('#todayGrid > article'); const src=cards.find(c=>cfg.keys.some(k=>norm(hiddenName(c)).includes(norm(k))||norm(k).includes(norm(hiddenName(c))))); if(!src)return;
    const display=src.dataset.cardDisplay||$('h3',src)?.textContent?.trim(); const name=src.dataset.cardFruit||display; const price=$('.sale-price b',src)?.textContent?.trim(); const config=$('[data-info-type="config"]',src)?.textContent?.replace(/^구성\s*·?\s*/,'').trim();
    if(display) $$('[data-v28-name]',root).forEach(n=>n.textContent=display);
    if(price) $$('[data-v28-price]',root).forEach(n=>n.textContent=price);
    if(config) $$('[data-v28-unit]',root).forEach(n=>n.textContent=config);
    $$('[data-buy-now]',root).forEach(b=>{b.dataset.name=name;b.dataset.displayName=display||name});
    $$('[data-fruit]',root).forEach(b=>{b.dataset.fruit=name;b.dataset.displayName=display||name});
  }
  function syncAll(){Object.keys(configs).forEach(syncOne)}
  const dock=$('#todayGrid'); if(dock&&'MutationObserver' in window){const mo=new MutationObserver(()=>{if(dock.children.length){syncAll();mo.disconnect()}});mo.observe(dock,{childList:true})}
  addEventListener('load',()=>setTimeout(syncAll,700),{once:true});setTimeout(syncAll,1400);
})();
