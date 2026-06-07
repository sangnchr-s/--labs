@echo off
where openssl >nul 2>&1
if errorlevel 1 (
  echo.
  echo [ОШИБКА] OpenSSL не найден в PATH.
  echo Установи: https://slproweb.com/products/Win32OpenSSL.html
  echo   ^(Win64 OpenSSL v3.x Light^) — галочка "Copy OpenSSL DLLs to Windows system directory"
  echo Перезапусти терминал и проверь: openssl version
  echo Подробнее: docs\openssl-windows.md
  echo.
  exit /b 1
)
