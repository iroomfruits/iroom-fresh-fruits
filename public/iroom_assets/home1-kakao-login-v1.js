(()=>{
'use strict';

const START='/api/auth/kakao/start?next='+encodeURIComponent('/home1');

function addKakaoLoginButton(){
  const form=document.querySelector('#loginForm');
  if(!form || document.getElementById('kakaoLoginHome1')) return;

  const button=document.createElement('button');
  button.type='button';
  button.id='kakaoLoginHome1';
  button.setAttribute('aria-label','카카오로 로그인');
  button.textContent='카카오로 로그인';

  Object.assign(button.style,{
    width:'100%',
    marginTop:'12px',
    minHeight:'48px',
    border:'1px solid #FEE500',
    borderRadius:'14px',
    background:'#FEE500',
    color:'#191919',
    fontWeight:'800',
    fontSize:'15px',
    cursor:'pointer'
  });

  button.addEventListener('click',()=>{ location.href=START; });
  form.appendChild(button);
}

function watchLoginModal(){
  addKakaoLoginButton();
  const body=document.getElementById('modalBody');
  if(!body) return;
  new MutationObserver(addKakaoLoginButton).observe(body,{childList:true,subtree:true});
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',watchLoginModal,{once:true});
}else{
  watchLoginModal();
}

// Remove only the OAuth status query after Home1 has loaded.
// The auth cookie remains untouched and /api/me continues to drive UI state.
try{
  const u=new URL(location.href);
  if(u.searchParams.has('kakao')){
    u.searchParams.delete('kakao');
    history.replaceState({},'',u.pathname+(u.search?u.search:'')+u.hash);
  }
}catch(_){}
})();
