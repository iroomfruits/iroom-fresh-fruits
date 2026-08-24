@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
where node.exe >nul 2>nul
if errorlevel 1 (
 echo Node.js LTS가 필요합니다.
 pause
 exit /b 1
)
if not exist ".env" copy ".env.example" ".env" >nul
set NODE_ENV=development
set HOST=127.0.0.1
set PORT=3000
start "IROOM V35 ONLINE TEST" cmd /k "cd /d ""%~dp0"" && node start-online.js"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:3000"
exit /b
