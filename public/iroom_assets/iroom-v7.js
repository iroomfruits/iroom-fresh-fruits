(function(){
 const root=document.getElementById('iroomV4'); if(!root)return;
 const valid=['spring','summer','autumn','winter'];
 const autoSeason=()=>{const m=new Date().getMonth()+1;return m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'autumn':'winter'};
 const params=new URLSearchParams(location.search);
 const forced=params.get('season');
 const active=valid.includes(forced)?forced:autoSeason();
 root.querySelectorAll('[data-v7-season]').forEach(btn=>{
   const key=btn.dataset.v7Season;
   if(key===active && key!=='auto') btn.classList.add('is-active');
   btn.addEventListener('click',e=>{
     e.preventDefault();
     const next=new URL(location.href);
     if(key==='auto') next.searchParams.delete('season');
     else next.searchParams.set('season',key);
     location.href=next.pathname+(next.search?next.search:'')+(next.hash||'');
   });
 });
 // 클릭은 시안/배너 자체만 살짝 반응하고 기본 회색/검정 버튼 피드백은 사용하지 않음
 root.addEventListener('pointerdown',e=>{
   const nav=e.target.closest('.v4-hot-nav button,.v4-hot-icons button,.v4-logo-hot');
   if(!nav)return;
   const band=nav.closest('.v6-hero-band'); if(!band)return;
   band.classList.remove('v6-tap'); void band.offsetWidth; band.classList.add('v6-tap');
   setTimeout(()=>band.classList.remove('v6-tap'),260);
 });
})();
