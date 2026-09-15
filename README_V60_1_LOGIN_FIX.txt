IROOM HOME1 V60.1 관리자 로그인 핫픽스

증상
- 관리자 비밀번호를 입력해도 "허용되지 않은 요청입니다." 표시

원인
- PUBLIC_BASE_URL과 실제 접속 중인 Render/커스텀 도메인의 origin이 다르면
  정상적인 관리자 로그인 POST까지 동일출처 검사에서 차단될 수 있었습니다.

수정
- PUBLIC_BASE_URL뿐 아니라 실제 X-Forwarded-Proto + X-Forwarded-Host/Host도 정상 origin으로 인정
- cross-site 요청 차단은 그대로 유지
- 필요할 때만 ALLOWED_ORIGINS에 추가 정상 도메인을 쉼표로 지정 가능

GitHub 적용
1. 이 ZIP을 압축 해제합니다.
2. 저장소 루트의 server.js, package.json, .env.example을 같은 위치에 덮어씁니다.
3. Commit changes 합니다.
4. Render가 자동 배포될 때까지 기다립니다.
5. 관리자 페이지를 Ctrl+F5로 새로고침 후 로그인합니다.

Render 환경변수 확인
- PUBLIC_BASE_URL = 실제 공개 홈페이지 주소 권장
- ADMIN_PASSWORD = 현재 사용할 관리자 비밀번호
- JWT_SECRET = 충분히 긴 임의 문자열
- DATABASE_URL = 현재 PostgreSQL 연결주소
- ALLOWED_ORIGINS = 보통 비워둬도 됩니다. 여러 정상 도메인을 동시에 사용할 때만 설정합니다.

주의
- 이 핫픽스에는 관리자 비밀번호 자체를 코드에 넣지 않았습니다.
