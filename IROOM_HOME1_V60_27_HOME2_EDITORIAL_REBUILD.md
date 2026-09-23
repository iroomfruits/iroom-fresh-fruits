# IROOM HOME1 V60.27 — HOME2 LUXURY STILL-LIFE EDITORIAL REBUILD

## 기준
- V60.26 위에 적용
- 홈페이지1 / DB / 주문 / 장바구니 / 비회원 주문 / 관리자 기능은 유지
- 홈페이지2만 기존 Museum 레이아웃을 폐기하고 새로 제작

## 이번 버전의 단 하나의 방향
**따뜻하고 조용한 럭셔리 스틸라이프 에디토리얼**

이전 Home2에서 혼재하던 요소를 제거했습니다.
- Museum/Exhibition식 영문 제목과 번호 놀이 제거
- 자동 슬라이드 제거
- 반복 사진 제거
- 과도한 검정 프레임 제거
- 받침대형 합성 이미지 제거
- 멜론 이미지 제거
- 상품을 많이 늘어놓는 구조 제거
- 한국어 글자가 좁은 칸에서 잘리던 구조 제거

## 새 구조
1. 정적인 대표 스틸라이프 Hero 1장
2. Home2 철학 소개
3. 오늘의 셀렉션 3개: 이지플 / 나주배 / 샤인머스캣
4. 프리미엄 선물: 타이포그래피 중심의 딥 포레스트 섹션
5. 계절의 테이블: 밤 / 무화과 / 석류 정물 3장
6. 이룸 서비스: 맞춤 추천 / 보관·후숙 / 비회원 주문조회
7. 후기 + 작은 IROOM NOTE
8. 카카오 상담 / 맞춤추천 / 푸터

## 안정성
- Home2 visible 영역에는 carousel/autoplay를 사용하지 않음
- 공용 상품 DB는 화면 밖 hidden data dock에서 한 번 렌더
- DB 렌더 완료 후 이지플/나주배/샤인머스캣 3개만 한 번 복사해 표시
- MutationObserver는 최초 렌더 1회 후 즉시 disconnect
- 반복 재렌더/이미지 src 변경 루프 없음

## 이미지
Home2 전용 `iroom_assets/stilllife27/` 폴더 사용.
- hero.webp
- apple.webp
- pear.webp
- shine.webp
- chestnut.webp
- fig.webp
- pomegranate.webp

같은 이미지가 여러 섹션에 반복되지 않도록 구성했습니다.

## 기능 유지
- 실제 DB 상품 가격/구성 반영
- BUY NOW
- 상품 상세
- 장바구니/주문
- 비회원 주문/주문조회
- 카카오 상담
- 맞춤추천/선물/가이드 모달

## 버전
- package: 60.27.0
- service worker cache: `iroom-v60-27-home2-editorial`
