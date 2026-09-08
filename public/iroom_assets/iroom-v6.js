
(function(){
 const root=document.getElementById('iroomV4'); if(!root)return;
 const seasonMap={spring:'봄',summer:'여름',autumn:'가을',winter:'겨울'};
 function autoSeason(){const m=new Date().getMonth()+1;return m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'autumn':'winter'}
 function currentSeason(){const q=new URLSearchParams(location.search).get('season');return seasonMap[q]?q:autoSeason()}
 const s=currentSeason();
 root.querySelectorAll('[data-v6-season-part]').forEach(img=>{
   const part=img.getAttribute('data-v6-season-part');
   img.src=`./iroom_assets/seasonal_bands/${s}_${part}.jpg`;
   img.alt=`이룸 ${seasonMap[s]} ${part==='hero'?'프리미엄 과일 메인':part==='reco'?'추천과일':part.startsWith('feature')?'서비스 카드':'Premium Gift Selection'}`;
 });
 // 클릭 시 검은 사각형 대신 해당 배너/행만 살짝 움직임
 root.addEventListener('pointerdown',e=>{
   const feature=e.target.closest('.v6-feature-card');
   const premium=e.target.closest('.v6-premium-band');
   const reco=e.target.closest('.v6-reco-band .v4-hot-recos button');
   const visual=feature||premium||(reco&&reco.closest('.v6-reco-band'));
   if(!visual)return;
   visual.classList.remove('v6-tap'); void visual.offsetWidth; visual.classList.add('v6-tap');
   setTimeout(()=>visual.classList.remove('v6-tap'),260);
 });
})();
