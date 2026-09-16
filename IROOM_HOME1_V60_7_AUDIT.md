# IROOM HOME1 V60.7 Mobile App Install Fix

- 일반 모바일 브라우저 방문만으로 `설치됨`으로 오판하던 로직 수정
- Android/Chrome/Edge: `beforeinstallprompt`가 실제 발생한 경우에만 원클릭 설치창 실행
- iPhone/iPad: Safari의 공유 → 홈 화면에 추가 → Open as Web App 안내
- 카카오/네이버/인스타 등 인앱 브라우저 감지: 설치됨으로 표시하지 않고 외부 Chrome/Safari 안내
- Android 인앱 브라우저: Chrome으로 열기 버튼 제공
- 실제 설치 확인은 PWA start_url `?source=pwa`, `appinstalled`, iOS standalone 상태를 기준으로 판정
- 설치된 앱 실행 시에만 `이룸 앱 홈으로 가기` 표시
- manifest id/scope/start_url 절대경로 정리, display는 standalone 단일화

## 플랫폼 제한
- iOS는 웹페이지가 시스템 설치창을 강제로 띄울 수 없으며 Safari의 홈 화면 추가 절차가 필요함.
- Android Chromium은 브라우저가 installability를 인정해 `beforeinstallprompt`를 발생시켜야 사이트 버튼에서 시스템 설치창을 열 수 있음.
