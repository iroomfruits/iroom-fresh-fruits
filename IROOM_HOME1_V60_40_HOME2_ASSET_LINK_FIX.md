# IROOM HOME1 V60.40 – HOME2 asset link fix

- 원인: home2.html이 `iroom-v60-39-home2-mega-overlay-fix.css/js`를 참조했지만 ZIP에는 `iroom-v60-39-home2-minimal-selectshop.css/js`만 포함되어 있어 Home2 전용 CSS/JS가 404가 됨.
- 수정: 실제 포함된 Home2 CSS/JS를 V60.40 이름으로 통일하고 HTML/Service Worker 참조를 정확히 연결.
- 결과: 거대 로고, 기본 HTML 버튼/텍스트, 세로로 풀린 상품 이미지 문제를 막고 원래 미니멀 시안 레이아웃을 복원.
