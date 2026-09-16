# IROOM HOME1 V60.9 — 설치 배너/앱 아이콘 적용 점검

## 적용 내용
- 홈페이지 앱 설치 영역을 사용자가 선택한 2번 가로형 배너 디자인으로 교체.
- 배너 전체를 실제 `data-install` 버튼으로 동작하게 해 클릭 영역을 크게 확보.
- 화면상 설치 문구는 배너 안의 `이룸 앱 설치`만 보이도록 정리.
- 설치 후 앱 아이콘은 사용자가 지정한 1번 `이룸 fresh fruits` 로고를 여백을 줄여 크게 보이도록 재가공.
- 앱 아이콘: 32 / 64 / 180 / 192 / 512 / maskable 512 및 favicon.ico.
- manifest / apple-touch-icon / favicon / service worker 캐시를 V60.9 자산으로 연결.
- PWA로 실제 실행 중일 때 설치 배너는 숨김.
- Chrome/Edge/Android는 `beforeinstallprompt` 제공 시 시스템 설치창 사용, iPhone/iPad는 Safari 홈 화면 추가 안내 유지.

## 점검
- server.js 문법 검사 통과.
- iroom-v60-9.js 문법 검사 통과.
- sw.js 문법 검사 통과.
- manifest.webmanifest / package.json JSON 검사 통과.
- index.html 로컬 정적 자산 참조 누락 없음.
- index.html ID 중복 없음.
- manifest 아이콘 파일 존재 확인.

## 배포 후 확인 필요
- Render 배포 후 새 서비스워커가 활성화되는지 확인.
- 기존 설치 앱/바로가기에는 OS 아이콘 캐시가 남을 수 있으므로 삭제 후 재설치 권장.
- Edge/Chrome이 설치 프롬프트를 제공하지 않는 환경에서는 웹사이트가 시스템 설치창을 강제로 만들 수 없으므로 브라우저 설치 가능 상태 확인 필요.
