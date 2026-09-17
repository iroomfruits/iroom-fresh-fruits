# IROOM HOME1 V60.13 통합 UX · 신뢰 · 전환 · 보안 점검

작성일: 2026-09-18
기준: IROOM HOME1 V60.12 → V60.13

## 종합 판단

이룸홈1은 현재 따뜻한 아이보리·딥그린·오렌지 포인트, 계절 자동전환, 프리미엄/제철/오늘의 PICK의 명확한 시각 계층, 카드형 상품 구조, 단일상품 바로구매와 장바구니 분리, 관리자 시각 편집 기능이 잘 결합되어 있어 소규모 프리미엄 과일 전문점의 브랜드 사이트와 실구매 쇼핑몰 사이의 균형이 좋은 편입니다.

디자인은 과장된 할인몰보다 브랜드 감성과 선물 수요에 적합하고, 실용성은 상품·재고·가격·주문·회원·관리자 기능까지 상당히 갖춰져 있습니다. 다만 V60.12 기준으로는 구매자가 결정을 내리는 순간에 필요한 신뢰 정보, 검색, 실제 후기 검증, 체크아웃 입력 편의, SEO/검색 노출, 모바일 접근성·성능에 보완 여지가 있었습니다.

## V60.13에서 반영한 개선

1. 메인 상단 구매안심 스트립
   - 당일 품질 확인
   - 무료배송 기준
   - 비회원 주문 가능
   - 품질 상담
   구매자가 상품을 보기 전에 핵심 신뢰 정보를 짧게 확인할 수 있도록 추가했습니다.

2. 관리자 저장 공개설정 실제 적용
   - 기존 JS에 함수는 있었지만 초기화에서 `loadPublicConfig()`와 `loadPaymentInfo()`가 호출되지 않던 문제를 수정했습니다.
   - 관리자에서 저장한 연락처, 배송비, 무료배송 기준, 정책, 계좌정보가 공개 홈페이지에 실제 반영되도록 했습니다.

3. 실제 후기 중심으로 변경
   - HTML에 고정되어 있던 예시형 후기 3개를 제거했습니다.
   - 관리자에서 등록하고 공개한 후기만 홈페이지에 노출합니다.
   - 별점은 선택사항으로 변경했습니다.
   - 실제 구매/상담 기록을 확인한 경우에만 관리자가 `구매·상담 확인 완료` 배지를 켤 수 있습니다.

4. 검색 기능 확대
   - 상품명뿐 아니라 산지, 판매단위, 상품 설명, 맛 특징, 국산/수입, 계절 관련어까지 검색합니다.
   - 입력 중 자동으로 결과가 갱신되고 가격·산지·구성을 함께 보여줍니다.

5. 상품 상세 구매안심 정보
   - 비회원 주문 가능
   - 기본 배송비 및 무료배송 기준
   - 품질 문제 상담 안내
   - 배송/교환/환불 상세 안내 연결
   을 상품 상세에서 바로 확인할 수 있도록 했습니다.

6. 체크아웃 편의성
   - `비회원 주문 가능`을 주문 입력 전에 명확히 표시했습니다.
   - 필수/선택 항목을 구분했습니다.
   - 이름, 전화, 이메일, 주소에 브라우저 자동완성 속성을 추가했습니다.
   - 전화번호/우편번호 입력에 모바일 키보드 힌트를 추가했습니다.

7. SEO 기본 보강
   - canonical
   - Open Graph
   - robots 메타
   - OnlineStore JSON-LD 기본 정보
   - robots.txt
   - sitemap.xml
   을 추가했습니다.

8. 성능·접근성
   - 첫 화면 핵심 이미지는 우선 로딩 신호를 사용하고 하단 상품 이미지는 lazy loading을 적용했습니다.
   - 키보드 `focus-visible` 표시를 강화했습니다.
   - `prefers-reduced-motion` 사용자의 애니메이션/부드러운 스크롤을 최소화했습니다.

## 외부 조사에서 중요하게 본 기준

- Baymard 2026 Mobile Ecommerce UX: 모바일 쇼핑 UX는 여전히 다수 사이트가 보통 이하이며, 모바일 탐색과 구매 흐름 최적화가 핵심입니다.
  https://baymard.com/research-articles/mobile-ux-ecommerce

- Baymard 2026 Online Grocery UX: 온라인 식품 구매는 일반 이커머스보다 산지·상태·검색·배송·상품 정보의 명확성이 더 중요합니다.
  https://baymard.com/research-articles/online-grocery-ecommerce-ux-2026

- Baymard 2026 Search UX: 많은 이용자가 검색을 주요 상품 탐색 수단으로 사용하며, 단순 상품명 일치보다 특징/조건 검색 지원이 중요합니다.
  https://baymard.com/research-articles/ecommerce-search-query-types

- Baymard Checkout / Payment UX: 최종 결제 금액, 배송비, 반품/환불, 결제 신뢰 정보가 결제 단계의 불안을 줄입니다.
  https://baymard.com/blog/payment-ux
  https://baymard.com/research-articles/current-state-of-checkout-ux

- Google Search Central: Product/Offer, 배송, 반품 정책 구조화 데이터와 Merchant Center를 함께 사용할 때 검색·쇼핑 노출 기회를 넓힐 수 있습니다.
  https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
  https://developers.google.com/search/docs/appearance/structured-data/shipping-policy
  https://developers.google.com/search/docs/appearance/structured-data/return-policy

- web.dev: 상단 LCP 이미지의 불필요한 lazy loading을 피하고 우선순위를 주는 것이 로딩 성능에 중요합니다.
  https://web.dev/case-studies/nuvemshop

- WCAG 2.2: 키보드 포커스 가시성 및 모바일 터치 타깃 크기/간격이 중요합니다.
  https://www.w3.org/TR/WCAG22/

- OWASP: 세션 쿠키의 Secure/HttpOnly/SameSite, 서버측 권한 검사, CSP, CSRF 방어, 재인증/2FA 등이 중요합니다.
  https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
  https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html

- 공정거래위원회: 온라인 거래의 청약철회와 소비자 권리, 상품 하자/계약 불일치, 제한 사유의 명확한 사전 고지가 중요합니다.
  https://www.ftc.go.kr/www/contents.do?key=703

## 아직 남은 최우선 과제

### 1. 토스 실제 결제
현재 무통장입금은 동작하지만, 구매 전환 관점에서 카드/간편결제는 매우 중요합니다. 실제 Toss Payments 계약과 Client Key/Secret Key를 연결하고, 서버 승인·금액 검증·결제 실패/취소·웹훅 처리를 구현해야 합니다.

### 2. 주소 검색 + 배송 예정일
현재 주소는 직접 입력 방식입니다. 카카오/도로명 주소 검색과, 주문 시점 기준 예상 출고일 또는 배송 예정 범위를 보여주면 체크아웃 신뢰가 더 좋아집니다.

### 3. 상품별 고유 URL
현재 상품 상세가 모달 방식이어서 Google Product/Offer 구조화 데이터와 개별 상품 검색 노출을 제대로 활용하기 어렵습니다. `/product/상품-slug` 형태의 실제 URL을 만드는 것이 다음 SEO 단계입니다.

### 4. Search Console / Merchant Center
robots.txt와 sitemap.xml은 준비했지만 실제 Search Console 등록, sitemap 제출, Merchant Center 설정, 배송·반품 정책 등록은 운영자가 계정에서 진행해야 합니다.

### 5. 이미지 CDN / Object Storage
관리자 이미지가 data URL 또는 서버 설정 데이터에 많이 쌓이면 DB·응답 크기와 백업 크기가 커질 수 있습니다. Cloudinary/S3/R2 같은 이미지 스토리지와 CDN으로 분리하는 것이 장기 운영에 유리합니다.

### 6. 관리자 2단계 인증과 CSRF 토큰
현재 관리자 로그인 rate limit, bcrypt, JWT, HttpOnly/Secure/SameSite 쿠키, origin 검사, CSP/보안헤더가 적용되어 있습니다. 더 높은 수준을 원하면 관리자 2FA와 명시적 CSRF 토큰을 추가하는 것이 좋습니다.

### 7. CSP의 `unsafe-inline` 제거
현재 기존 관리자/프런트 구조 때문에 CSP에서 inline script/style을 일부 허용합니다. 장기적으로 inline 코드를 외부 파일로 분리하고 nonce/hash 기반 CSP로 바꾸면 XSS 방어가 더 강해집니다.

### 8. 실제 Core Web Vitals 측정
코드 수준 최적화만으로는 충분하지 않습니다. Render 실배포 후 Chrome UX Report / PageSpeed Insights로 LCP, INP, CLS를 실제 모바일 네트워크에서 측정해야 합니다.

### 9. 약관·반품 정책 법률 최종 검토
신선식품은 청약철회 제한 가능성이 있지만 조건과 사전 고지가 중요합니다. 현재 문구는 과도한 일괄 반품 금지가 아니라 관련 법령 및 상품 상태를 기준으로 처리하도록 작성되어 있으나, 실제 영업정책 확정 후 전문가 또는 관할 기관 기준으로 최종 확인하는 것을 권장합니다.

## 최종 평가

브랜드 디자인과 쇼핑 실용성은 상당히 잘 어우러져 있습니다. 특히 프리미엄 이미지와 계절감, 과일 중심 카드, 과도한 자동 슬라이드 제거, 단일상품 바로구매, 관리자 시각편집은 강점입니다.

현재 가장 큰 남은 차이는 디자인이 아니라 `결제·배송예정·상품별 URL/SEO·실제 리뷰 데이터·운영 인프라`입니다. 이 부분이 채워지면 단순히 예쁜 홈페이지가 아니라 신뢰하고 반복 구매할 수 있는 운영형 과일 쇼핑몰에 가까워집니다.
