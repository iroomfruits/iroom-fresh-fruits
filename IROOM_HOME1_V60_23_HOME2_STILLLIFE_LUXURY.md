# IROOM HOME1 V60.23 — HOME2 STILL-LIFE LUXURY

기준: V60.22 → V60.23

## 이번 수정 핵심
- 홈페이지1 / 공용 DB / 상품·가격·재고 / 회원 / 장바구니 / 주문 / 비회원 주문조회 / 관리자 기능은 변경하지 않음.
- 홈페이지2(`/home2`)의 사진 언어를 전부 **스틸라이프 럭셔리 에디토리얼**로 통일.
- 사용자가 가장 선호한 1번 메인 스틸라이프 톤(저채도·저명도·따뜻한 타우프/브라운·측면광)을 Home2 전체 기준으로 사용.
- 메인 히어로 3장, Today PICK, Gift, Service, Seasonal, Review 썸네일까지 동일한 무드의 로컬 WebP 자산 사용.
- V60.21/V60.22의 Home2 사진 재매핑 레이어를 Home2에서 제거하여 서로 다른 JS가 이미지 src를 번갈아 바꾸는 충돌 가능성을 제거.
- 히어로를 약 420px로 낮추고 사진이 과도하게 확대되지 않도록 16:9 스틸라이프 구도 자산 자체를 새로 정리.
- Today PICK: PC 4열, 이미지 약 112px. 상품 이미지가 카드보다 커 보이지 않게 정리.
- Gift: 3카드, 이미지 약 118px. 큰 선물 사진과 카드 하단 빈 공간 문제 완화.
- Service: 사진 위 + 텍스트 아래 구조로 고정하여 글자 겹침 제거.
- Seasonal: 이미지 약 82px, 카드 높이 자동. 불필요한 빈 공간 제거.
- Journey / Review / Owner Note도 높이와 줄바꿈 재정리.
- 모바일은 Today / Gift / Service를 가로 스와이프 카드로 유지하면서 이미지 높이와 텍스트 영역을 분리.
- 봄/여름/가을/겨울 자동 전환 시 동일한 스틸라이프 디자인 언어를 유지하도록 시즌별 Hero 3장 + Product 4장 자산 준비.

## 새 파일
- `public/iroom_assets/iroom-v60-23-home2-stilllife.css`
- `public/iroom_assets/iroom-v60-23-home2-stilllife.js`
- `public/iroom_assets/stilllife/*.webp`

## 적용
현재 V60.22가 적용된 GitHub 저장소 루트에 V60.23 패치 ZIP의 내용을 그대로 덮어쓰기합니다.
기존 저장소를 삭제하지 않습니다.
Render 재배포 후 `/home2`를 확인합니다.

## 검증
- `npm run check` 통과
- HTML 중복 ID 0
- Home2 로컬 CSS/JS/이미지 참조 누락 0
- CSS 중괄호 균형 0
- Hero 3 / Today 4 / Gift 3 / Service 3 / Seasonal 4 존재 확인
- 시즌별 Hero/Still-life 예상 자산 누락 0
- 패치 ZIP 무결성 검사 예정

※ Chromium headless는 현재 실행 환경에서 종료되지 않는 문제가 있어 자동 렌더 스크린샷 검증은 완료하지 못했습니다. 실제 Render 배포 후 PC/모바일 화면 최종 확인이 필요합니다.
