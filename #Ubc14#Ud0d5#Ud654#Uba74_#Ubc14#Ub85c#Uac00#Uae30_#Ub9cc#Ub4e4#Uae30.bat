@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0바탕화면_바로가기_만들기.ps1"
if errorlevel 1 (
  echo.
  echo Shortcut creation failed.
  pause
)
endlocal
