@echo off
setlocal
cd /d "%~dp0"

where npx >nul 2>nul
if %errorlevel% neq 0 (
  echo npx was not found. Install Node.js LTS from https://nodejs.org/
  pause
  exit /b 1
)

start "" http://127.0.0.1:4183
npx --yes http-server@14.1.1 -p 4183 -a 127.0.0.1
