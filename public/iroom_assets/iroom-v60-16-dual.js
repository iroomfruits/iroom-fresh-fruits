(()=>{
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  if(document.body.classList.contains('home2-mode')){
    const adaptHome2=()=>{const t=$('[data-premium-title]'),p=$('[data-premium-copy]'),b=$('[data-premium-button]'),e=$('.premium-section .eyebrow');if(t)t.textContent='지금, 이 계절의 맛';if(p)p.textContent='가장 맛있는 순간을, 가장 좋은 상태로 골라 소개합니다.';if(b)b.textContent='전체보기';if(e)e.textContent='SEASON VIEW'};
    setTimeout(adaptHome2,80);const app=$('#iroomApp');if(app&&'MutationObserver'in window)new MutationObserver(adaptHome2).observe(app,{attributes:true,attributeFilter:['data-season']});
    const menu=$('[data-home2-mobile-nav]'), open=$('[data-home2-menu]');
    const close=()=>{if(!menu)return;menu.hidden=true;open?.setAttribute('aria-expanded','false');document.body.style.overflow=''};
    const show=()=>{if(!menu)return;menu.hidden=false;open?.setAttribute('aria-expanded','true');document.body.style.overflow='hidden'};
    open?.addEventListener('click',()=>menu?.hidden?show():close());
    $('[data-home2-menu-close]')?.addEventListener('click',close);
    menu?.addEventListener('click',e=>{if(e.target===menu)close();else if(e.target.closest('button'))setTimeout(close,30)});
    window.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }
})();
