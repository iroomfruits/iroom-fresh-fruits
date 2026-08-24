@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title IROOM Fresh Fruits V35

where node.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js LTS is required.
  echo https://nodejs.org/
  pause
  exit /b 1
)

if not exist "data" mkdir "data"
if not exist "backup" mkdir "backup"
if not exist "public\uploads\library" mkdir "public\uploads\library"
if exist "data\store.json" copy /Y "data\store.json" "backup\store_latest_backup.json" >nul

set PORT=3000
netstat -ano | findstr /R /C:":3000 .*LISTENING" >nul 2>nul
if not errorlevel 1 set PORT=3001
netstat -ano | findstr /R /C:":3001 .*LISTENING" >nul 2>nul
if "%PORT%"=="3001" if not errorlevel 1 set PORT=3002

start "IROOM V35 SERVER" cmd /k "cd /d ""%~dp0"" && set PORT=%PORT% && node server.js"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:%PORT%/?v35=1"
timeout /t 3 /nobreak >nul
exit /b 0
