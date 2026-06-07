@echo off
setlocal
cd /d "%~dp0"
call "%~dp0..\scripts\check-openssl.bat" || exit /b 1

if "%XYZ%"=="" (
  echo Задай инициалы CA:
  echo   CMD:  set XYZ=GNM
  echo   PowerShell:  $env:XYZ = "GNM"
  exit /b 1
)

if not exist out mkdir out
if not exist in mkdir in

openssl genrsa -out out\ca.key 2048
if errorlevel 1 exit /b 1
openssl req -x509 -new -nodes -key out\ca.key -sha256 -days 3650 -out out\ca.crt -subj "/CN=CA-LAB22-%XYZ%"
if errorlevel 1 exit /b 1

echo CA создан: out\ca.crt (CN=CA-LAB22-%XYZ%)
