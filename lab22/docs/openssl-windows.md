# OpenSSL на Windows

Ошибка `'openssl' не является внутренней или внешней командой` — OpenSSL **не установлен** или **не в PATH**.

Скрипты `.bat` без OpenSSL **не создают** сертификаты, даже если в конце написано «CA создан».

## Установка

1. Скачать **Win64 OpenSSL v3.x Light**:  
   https://slproweb.com/products/Win32OpenSSL.html

2. При установке включить:
   - **Copy OpenSSL DLLs to** → `The Windows system directory`  
     (или добавить `C:\Program Files\OpenSSL-Win64\bin` в PATH вручную)

3. **Закрыть и открыть** PowerShell / CMD заново.

4. Проверка:

```powershell
openssl version
```

Должно вывести что-то вроде `OpenSSL 3.x.x`.

## Запуск скриптов CA (PowerShell)

```powershell
cd C:\Users\New\Desktop\stsr\lab22\ca
$env:XYZ = "GNM"
$env:ABC = "SGA"
.\01-create-ca.bat
.\02-sign-csr.bat
```

`set XYZ=...` в PowerShell **не работает** — только `$env:XYZ = "GNM"`.

## Проверка, что файлы реальные

После успешного запуска:

```powershell
dir out
openssl x509 -in out\ca.crt -noout -subject
openssl x509 -in out\server.crt -noout -subject -ext subjectAltName
```

Файлы `ca.crt` и `server.crt` должны быть **не 0 байт**.

## Альтернатива — Git Bash

Если установлен Git for Windows, в **Git Bash** часто уже есть `openssl`:

```bash
cd /c/Users/New/Desktop/stsr/lab22/ca
export XYZ=GNM
export ABC=SGA
./01-create-ca.sh
./02-sign-csr.sh
```
