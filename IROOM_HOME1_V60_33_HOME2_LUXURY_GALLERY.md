# IROOM HOME1 V60.33 — HOME2 LUXURY GALLERY

기준: V60.32 위에 적용하는 홈페이지2 전용 보완 패치.

## 핵심 보완
- 프리미엄 과일 사진을 `contain` 중심으로 표시해 과일이 잘리지 않도록 재정리.
- 장식용 잎사귀는 추가하지 않고 기존 사진 속 자연스러운 잎만 사용.
- 과일 찾기 결과를 큰 썸네일 + 과일명 + 산지/구성 + 가격의 이미지 중심 카탈로그로 강화.
- 상품 상세 모달을 대형 대표 이미지 + 4개 썸네일 뷰 + 이미지가 포함된 설명 카드로 강화.
- 상세의 `맛과 식감 / 고르는 기준 / 보관 방법 / 맛있게 즐기기`에 과일 이미지를 배치.
- PC와 모바일 모두 대표 이미지가 잘리지 않도록 조정.
- 홈페이지1 / 상품DB / 가격 / 재고 / 회원 / 주문 / 장바구니 / 관리자 기능은 변경하지 않음.

## 적용 파일
- `public/home2.html`
- `public/iroom_assets/iroom-v60-33-home2-luxury-gallery.css`
- `public/iroom_assets/iroom-v60-33-home2-luxury-gallery.js`
- `public/sw.js`
- `package.json`

## 적용 방법
현재 V60.32가 적용된 GitHub 저장소 루트에 이 ZIP의 내용만 덮어씁니다. 기존 파일 전체를 삭제하지 않습니다.
Render 재배포 후 `/home2`를 확인하고, 이전 화면이 보이면 Ctrl+Shift+R로 강력 새로고침합니다.
