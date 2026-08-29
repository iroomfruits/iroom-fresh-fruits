$securePassword = Read-Host '관리자 비밀번호를 입력하세요' -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
  $env:ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  if ([string]::IsNullOrWhiteSpace($env:ADMIN_PASSWORD)) {
    Write-Host '비밀번호가 비어 있어 실행을 중단합니다.'
    Read-Host 'Enter 키를 누르세요'
    exit 1
  }
  $env:PORT = '3000'
  Start-Process 'http://localhost:3000/band-admin.html'
  Write-Host '이룸 홈페이지가 실행되었습니다. 이 창은 홈페이지를 사용하는 동안 닫지 마세요.'
  node server.js
} finally {
  if ($passwordPointer -ne [IntPtr]::Zero) {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)}
  Remove-Item Env:ADMIN_PASSWORD -ErrorAction SilentlyContinue
}
