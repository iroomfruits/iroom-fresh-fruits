$ErrorActionPreference="Stop"
Set-Location -LiteralPath $PSScriptRoot

$desktop=[Environment]::GetFolderPath("Desktop")
$shortcutPath=Join-Path $desktop "이룸 fresh fruits.lnk"
$target=Join-Path $PSScriptRoot "IROOM_HOME.bat"

$ws=New-Object -ComObject WScript.Shell
$s=$ws.CreateShortcut($shortcutPath)
$s.TargetPath=$target
$s.WorkingDirectory=$PSScriptRoot
$s.Description="이룸 fresh fruits 홈페이지 실행"
$s.WindowStyle=1
$s.Save()

Write-Host ""
Write-Host "바탕화면 바로가기 생성 완료!" -ForegroundColor Green
Write-Host $shortcutPath -ForegroundColor Cyan
Write-Host ""
Write-Host "이제 바탕화면의 '이룸 fresh fruits' 아이콘을 더블클릭하면 홈페이지가 실행됩니다." -ForegroundColor Yellow
Start-Sleep -Seconds 3
