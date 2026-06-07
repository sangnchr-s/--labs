# Как сделать лабу в паре (Mac + Windows)

Работаете **удалённо**: файлы передаёте через Telegram, Discord, почту или общую папку.

## Роли и инициалы

| Обозначение | Кто | Пример |
|-------------|-----|--------|
| **XYZ** | студент в роли **CA** | Гулевич Никита Максимович → **GNM** |
| **ABC** | студент в роли **Resource** | Шершнев Глеб Андреевич → **SGA** |

См. [pair.local.md](../pair.local.md).

## Раунд 1

### Шаг 1 — Resource (например Mac)

```bash
cd lab22/resource
export ABC=SGA          # Шершнев Глеб Андреевич
./01-gen-csr.sh         # Mac
# или 01-gen-csr.bat    # Windows
```

**Отправить CA** один файл: `out/resource.csr`

### Шаг 2 — CA (например Windows)

Положить `resource.csr` в `lab22/ca/in/resource.csr`

**CMD:**

```bat
cd lab22\ca
set XYZ=GNM
set ABC=SGA
01-create-ca.bat
02-sign-csr.bat
```

**PowerShell:**

```powershell
cd C:\Users\New\Desktop\stsr\lab22\ca
$env:XYZ = "GNM"
$env:ABC = "SGA"
.\01-create-ca.bat
.\02-sign-csr.bat
```

> В PowerShell: `$env:XYZ`, не `set XYZ`. Запуск: `.\01-create-ca.bat`, не `01-create-ca.bat`.

**Отправить Resource** два файла из `ca/out/`:
- `ca.crt`
- `server.crt`

### Шаг 3 — Resource

Скопировать в `22-01/certs/`:
- `server.key` (свой, из `resource/out/`)
- `server.crt` (от CA)
- `ca.crt` (от CA)

Импорт CA — [import-ca-mac.md](import-ca-mac.md) или [import-ca-windows.md](import-ca-windows.md).

Добавить в **hosts** (оба ПК, где тестируете браузер):

```
127.0.0.1 LAB22-SGA
127.0.0.1 SGA
```

Mac: `sudo nano /etc/hosts`  
Windows: `C:\Windows\System32\drivers\etc\hosts` (от администратора)

```bash
cd lab22/22-01
npm install
npm start
```

Браузер: **https://LAB22-SGA:3443/** (или `https://SGA:3443/`)

### Шаг 4 — CA

Может проверить у себя тем же способом (импорт `ca.crt`, hosts, браузер), если Resource прислал IP и открыл порт — для сдачи достаточно скриншота у Resource.

## Раунд 2 (Задание 03)

Поменяйтесь ролями: кто был CA — делает Resource, и наоборот. Новые инициалы в CN:

| Роль | CN |
|------|-----|
| CA | `CA-LAB22-<новый_XYZ>` |
| Resource | `RS-LAB22-<новый_ABC>` |
| SAN | `LAB22-<новый_ABC>`, `<новый_ABC>` |

Повторите шаги 1–3 в **новых** каталогах или перезапишите `out/` (не смешивайте ключи раунда 1 и 2).

## Что сдать / показать

- `ca.crt`, CSR, подписанный `server.crt`
- скриншот браузера: **https://…** без предупреждения о недоверенном CA (после импорта)
- ответ страницы 22-01

## Частые проблемы

| Проблема | Решение |
|----------|---------|
| «Недоверенный сертификат» | CA не импортирован в **доверенные корневые** |
| `ERR_CERT_COMMON_NAME_INVALID` | в hosts должен быть домен из SAN (`LAB22-ABC`), не `localhost` |
| CSR не подписывается | CSR от другого ключа / другой раунд |
| Mac не даёт записать hosts | `sudo` |
