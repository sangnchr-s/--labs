@echo off
setlocal
cd /d "%~dp0"
call "%~dp0..\scripts\check-openssl.bat" || exit /b 1

if "%ABC%"=="" (
  echo Задай свои инициалы:
  echo   CMD:  set ABC=SGA
  echo   PowerShell:  $env:ABC = "SGA"
  exit /b 1
)

if not exist out mkdir out

openssl genrsa -out out\server.key 2048
if errorlevel 1 exit /b 1
openssl req -new -key out\server.key -out out\resource.csr -subj "/CN=RS-LAB22-%ABC%"
if errorlevel 1 exit /b 1

echo CSR: out\resource.csr (CN=RS-LAB22-%ABC%^)
echo Отправь CA файл out\resource.csr
echo Сохрани out\server.key — не передавай никому!
