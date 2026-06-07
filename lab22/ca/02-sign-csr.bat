@echo off
setlocal
cd /d "%~dp0"
call "%~dp0..\scripts\check-openssl.bat" || exit /b 1

if "%ABC%"=="" (
  echo Задай инициалы Resource:
  echo   CMD:  set ABC=SGA
  echo   PowerShell:  $env:ABC = "SGA"
  exit /b 1
)

set CSR=in\resource.csr
if not "%~1"=="" set CSR=%~1

if not exist "%CSR%" (
  echo Нет CSR: %CSR%
  echo Положи запрос партнёра в ca\in\resource.csr
  exit /b 1
)

if not exist out\ca.crt (
  echo Сначала выполни 01-create-ca.bat
  exit /b 1
)

powershell -NoProfile -Command "(Get-Content server.ext.template) -replace '__ABC__','%ABC%' | Set-Content out\server.ext"

openssl x509 -req -in "%CSR%" -CA out\ca.crt -CAkey out\ca.key -CAcreateserial -out out\server.crt -days 365 -sha256 -extfile out\server.ext
if errorlevel 1 exit /b 1

echo Подписан server.crt (SAN: LAB22-%ABC%, %ABC%^)
echo Отправь Resource: out\ca.crt и out\server.crt
