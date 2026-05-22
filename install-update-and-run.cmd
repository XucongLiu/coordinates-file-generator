@echo off
setlocal

set "REPO_URL=https://github.com/XucongLiu/coordinates-file-generator.git"
set "INSTALL_DIR=%USERPROFILE%\coordinates-file-generator"
set "APP_URL=http://127.0.0.1:4183"

title SensoSCAN Coordinate Generator
echo.
echo SensoSCAN Coordinate Generator
echo =============================
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
  echo Git was not found. Trying to install Git with winget...
  where winget >nul 2>nul
  if %errorlevel% neq 0 (
    echo winget was not found. Install Git manually from https://git-scm.com/download/win
    pause
    exit /b 1
  )
  winget install --id Git.Git --exact --source winget --accept-source-agreements --accept-package-agreements
  set "PATH=%PATH%;%ProgramFiles%\Git\cmd;%ProgramFiles(x86)%\Git\cmd"
)

where npx >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js / npx was not found. Trying to install Node.js LTS with winget...
  where winget >nul 2>nul
  if %errorlevel% neq 0 (
    echo winget was not found. Install Node.js LTS manually from https://nodejs.org/
    pause
    exit /b 1
  )
  winget install --id OpenJS.NodeJS.LTS --exact --source winget --accept-source-agreements --accept-package-agreements
  set "PATH=%PATH%;%ProgramFiles%\nodejs;%APPDATA%\npm"
)

if not exist "%INSTALL_DIR%\.git" (
  if exist "%INSTALL_DIR%" (
    echo The install folder already exists but is not a Git repository:
    echo %INSTALL_DIR%
    echo Move or rename it, then run this file again.
    pause
    exit /b 1
  )
  git clone "%REPO_URL%" "%INSTALL_DIR%"
) else (
  cd /d "%INSTALL_DIR%"
  git pull --ff-only
)

cd /d "%INSTALL_DIR%"
start "" "%APP_URL%"
npx --yes http-server@14.1.1 -p 4183 -a 127.0.0.1
