# IROOM HOME1 V60.17 DUAL HOME — Home2 전면 재설계

## 핵심 변경
- Homepage 1 (`/home1`): 기존 V60.15 운영형 디자인과 기능을 유지하고 하단에 작은 `IROOM NOTE` 운영자 선화만 배치합니다.
- Homepage 2 (`/home2`): 기존 홈페이지를 CSS로 조금 바꾼 화면이 아니라 별도 Premium Editorial 프런트로 다시 구성했습니다.
- 공개 루트(`/`): 관리자 `사이트·결제·알림`에서 선택한 Homepage 1/2를 표시합니다. 선택값이 없거나 DB 조회가 실패하면 Homepage 1로 안전하게 돌아갑니다.
- 상품·가격·재고·회원·장바구니·주문·비회원 주문조회·관리자·DB/API는 두 홈페이지가 동일하게 공유합니다.

## Homepage 2 데스크톱
- 웜 아이보리 + 딥그린의 별도 헤더
- 왼쪽 카피 / 오른쪽 프리미엄 과일 선물박스 사진의 대형 히어로
- 과일 카테고리 스트립
- 실제 상품 DB를 사용하는 4열 시즌 셀렉션
- 하단 작은 `IROOM NOTE` 운영자 선화
- 기존 운영 기능은 모달/API를 그대로 사용

## Homepage 2 모바일
- 데스크톱 축소형을 사용하지 않고 760px 이하에서 전용 레이아웃으로 전환
- 로고 + 장바구니 + 햄버거 헤더
- 좌측 카피 / 우측 과일 히어로 비주얼
- 예산·용도 맞춤추천 카드
- 카카오 상담 + 앱 설치 버튼
- 모바일용 컴팩트 시즌 상품 카드
- 작은 운영자 `IROOM NOTE`
- 이용약관 / 개인정보 / 배송·교환·환불 / 비회원 주문조회 / 고객센터 바로가기
- 모바일 전용 간결 푸터

## 관리자
- Homepage 1 Original / Homepage 2 Premium Editorial 미리보기
- `메인으로 사용` 버튼으로 `/` 공개 디자인 전환
- `site_settings.public_home_style`에 선택값 저장

## 버전
- package: `60.17.0`
- Service Worker cache: `iroom-v60-17-home2-mobile-corrected`
- Home2 CSS: `iroom-v60-17-home2.css`
- Home2 JS: `iroom-v60-17-dual.js`

## 확인 상태
- Node 문법검사 통과
- HTML 중복 ID 검사 통과
- 로컬 CSS/JS/이미지 참조 검사 통과
- ZIP 무결성 검사 통과
- 실제 Render DB 및 실기기 주문 테스트는 배포 후 최종 확인이 필요합니다.
