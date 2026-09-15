# IROOM HOME1 V60 — 운영·관리·보안 검토

## 판정
V60은 기존 V57을 기준으로 관리자 편집 범위, 저장 검증, 세션 보안, 입력 검증, DB 연결 방식, PWA 아이콘을 보강한 **배포 후보(Release Candidate)** 입니다.
정적 문법 검사와 관리자 화면 ID 검사는 통과했습니다. 다만 실제 Render 배포, 실제 PostgreSQL, 실제 메일/카카오/Toss 키를 사용한 통합 테스트와 외부 침투 테스트 전에는 '완벽한 보안' 또는 '무결점 운영'을 보장할 수 없습니다.

## 관리자에서 가능한 핵심 운영
- 상품 등록/수정, 가격/재고/판매단위 관리
- 상품 카드 이미지/표시명/설명 편집
- 상세 실제 이미지 및 상세 설명(산지·맛/식감·고르는 기준·보관·즐기는 방법·추가 안내) 편집
- 계절별 메인/오늘의 PICK/프리미엄/제철/더보기 구성 편집
- 상품 추가/삭제/순서 변경/기본값 복원
- 공통 이미지(로고/맞춤과일/선물 영역) 편집
- 초안 미리보기/상세 미리보기/공개 홈페이지 저장 검증
- 주문/배송 상태 관리, 회원/리뷰/문의/배너/설정 화면
- 사업자/연락처/입금계좌/배송 정책 설정
- 이미지 보관함 및 관리자 설정 카드 바로가기
- 보안 이벤트/운영 상태 확인 및 수동 JSON 백업

## V60에서 추가 보강한 사항
- 관리자 저장 후 공개 설정 revision을 다시 조회하여 실제 반영 여부 확인
- 관리자 세션 버전 도입: 관리자 비밀번호 변경 시 기존 관리자 세션 일괄 무효화
- 관리자 API 인증 검사 강화
- 홈페이지 설정/관리자 설정 재귀 입력 정화 및 크기 제한
- 주문 상태/결제 상태 allowlist 적용
- 로그인 계정 식별자 콘솔 출력 제거
- DB 풀 최대 연결/idle/connect timeout 설정
- Render 내부 DB 연결에 불필요한 TLS 강제를 제거하고 외부 DB에서 sslmode=require일 때 SSL 사용
- 오류 응답 처리 및 오래된 보안 이벤트 정리
- V59 프런트의 줄바꿈 정규식 문법 오류 수정
- 동적 상품 설명의 HTML escape 강화
- PWA 아이콘을 이룸 로고 기반 64/192/512로 구성
- Express 4.22.3 / pg 8.23.0으로 의존성 갱신

## 배포 전 필수 환경변수
- NODE_ENV=production
- DATABASE_URL
- JWT_SECRET (충분히 길고 무작위)
- ADMIN_PASSWORD
- PUBLIC_BASE_URL
- BREVO_* (메일 사용 시)
- KAKAO_* (연동 사용 시)
- TOSS_CLIENT_KEY / TOSS_SECRET_KEY (실결제 전)

## 아직 반드시 확인해야 하는 운영 항목
1. Render 실제 배포 후 회원가입/로그인/관리자로그인
2. 상품 편집 → 저장 → 공개 홈페이지 즉시 반영
3. 카드 이미지/상세 이미지 업로드 및 모바일 표시
4. 장바구니, 단일 BUY NOW 수량 흐름, 주문 생성, 재고 차감
5. 주문 상태/배송 상태 변경
6. 메일 발송, 카카오 연결
7. PWA 설치 및 바탕화면 아이콘
8. 모바일 Safari/Chrome/PC Chrome/Edge 기본 동작
9. 개인정보처리방침/이용약관/전자상거래 고지의 최종 사업자·법률 검토
10. Toss 계약/키 발급 후 서버 승인·결제 검증·웹훅 검증

## 추가 보완 권장
- 관리자 2단계 인증(2FA)
- 다중 인스턴스 운영 시 Redis 기반 공용 rate-limit/session 보조 저장소
- 이미지 증가 시 S3/R2 등 Object Storage + CDN
- 자동/외부 DB 백업 및 복구훈련
- CSP의 unsafe-inline 제거(관리자 inline CSS/JS를 외부 파일로 분리하고 nonce/hash 적용)
- 정기 dependency audit, 취약점 스캔, 외부 침투 테스트

## 테스트 결과
- server.js: node --check 통과
- public/iroom_assets/iroom-v60.js: node --check 통과
- band-admin.html inline script: node --check 통과
- 관리자 HTML ID 212개 / 중복 0개
- 정적 selector ID 참조 누락 0개


## V60.1 관리자 로그인 Origin 핫픽스
- 증상: 관리자 로그인 POST가 비밀번호 검증 전에 `허용되지 않은 요청입니다.`로 403 차단될 수 있었음.
- 원인: `PUBLIC_BASE_URL`의 origin만 신뢰해 Render 기본 도메인/커스텀 도메인/변경된 배포 URL과 실제 접속 origin이 다를 때 동일 사이트 요청까지 거부함.
- 수정: 설정된 `PUBLIC_BASE_URL`에 더해 실제 요청의 `X-Forwarded-Proto` + `X-Forwarded-Host`(또는 Host)를 정상 origin으로 인정. 필요 시 `ALLOWED_ORIGINS`에 추가 정상 도메인 지정 가능.
- `Sec-Fetch-Site: cross-site` 차단 및 출처 검증은 유지하여 CSRF 방어 의도는 보존함.
