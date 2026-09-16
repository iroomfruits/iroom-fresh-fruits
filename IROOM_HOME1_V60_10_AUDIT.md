# IROOM HOME1 V60.10 앱 설치 UX 점검

## 변경
- 홈페이지 설치 영역을 대형 이미지 배너에서 컴팩트 가로형 설치 스트립으로 변경.
- PC 최대 폭 920px / 약 104px 높이, 모바일 약 78px 높이로 축소.
- 화면에는 브랜드 로고 + `이룸 앱 설치`만 표시.
- Chrome / Edge / Android에서 설치 프롬프트가 준비된 경우 한 번 클릭으로 시스템 설치창 실행.
- 자동 설치 프롬프트가 준비되지 않은 경우 실패 문구를 제거하고 해당 브라우저에서 가장 짧은 설치 방법만 안내.
- iPhone/iPad Safari는 `공유 → 홈 화면에 추가 → 추가`만 안내.
- 카카오/네이버/인스타 등 인앱 브라우저는 외부 Chrome/Safari로 이동하도록 안내.
- 앱 아이콘은 V60.9에서 확정한 이룸 fresh fruits 브랜드 로고 디자인을 유지하고 V60.10 파일명으로 갱신해 캐시를 분리.

## 브라우저 정책상 제한
웹페이지가 사용자 동의 없이 앱을 자동 설치하거나 Windows/모바일 바탕화면 바로가기를 강제로 생성할 수는 없습니다. 시스템 PWA 설치 프롬프트가 제공되는 환경에서는 설치 버튼 한 번으로 프롬프트를 실행합니다.

## 정적 검사
- server.js 문법 검사
- public/iroom_assets/iroom-v60-10.js 문법 검사
- public/sw.js 문법 검사
- manifest.webmanifest JSON 검사
- package.json JSON 검사
- index.html ID 중복 검사
- ZIP 무결성 검사

실제 Render 배포 후 Windows Edge/Chrome, Android Chrome, iPhone Safari 실기기 확인이 필요합니다.
