# Lab22 — кто что делает (Глеб + Никита)

| | **Глеб (SGA)** | **Никита (GNM)** |
|---|----------------|------------------|
| Mac / Windows | Mac | Windows |
| Раунд 1 | **Resource** (сервер) | **CA** (выдаёт сертификаты) |
| Раунд 2 | **CA** (выдаёт сертификаты) | **Resource** (сервер) |

---

# Раунд 1

## Никита **ИЗДАЁТ** (роль CA)

**1.** Получить от Глеба файл `resource.csr`

**2.** Положить в `lab22\ca\in\resource.csr`

**3.** PowerShell:
```powershell
cd C:\Users\New\Desktop\stsr\lab22\ca
$env:XYZ = "GNM"
$env:ABC = "SGA"
.\01-create-ca.bat
.\02-sign-csr.bat
```

**4.** Проверка:
```powershell
openssl x509 -in out\server.crt -noout -subject -ext subjectAltName
```
→ `RS-LAB22-SGA`, SAN: `LAB22-SGA`, `SGA`

**5.** Отправить Глебу: **`ca.crt`** + **`server.crt`**

**6.** У себя: импорт `ca.crt` (certmgr.msc), hosts:
```
10.34.44.87 LAB22-SGA
10.34.44.87 SGA
```

**7.** Когда Глеб запустит сервер — браузер: **https://LAB22-SGA:3443/resource**

---

## Глеб **ПОЛУЧАЕТ и ПОДНИМАЕТ сервер** (роль Resource)

**1.** CSR:
```bash
cd lab22/resource
export ABC=SGA
./01-gen-csr.sh
```
→ отправить Никите **`out/resource.csr`**

**2.** Получить от Никиты `ca.crt`, `server.crt` → в `22-01/certs/`:
```bash
cp ~/Downloads/ca.crt ~/Downloads/server.crt lab22/22-01/certs/
cp lab22/resource/out/server.key lab22/22-01/certs/
```

**3.** Импорт CA:
```bash
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain \
  ~/Documents/Labs/belstu-nodejs-labs/lab22/22-01/certs/ca.crt
```

**4.** hosts (Mac):
```
127.0.0.1 LAB22-SGA
127.0.0.1 SGA
```

**5.** Запуск:
```bash
cd lab22/22-01
npm start
```

**6.** Браузер: **https://LAB22-SGA:3443/resource**

**7.** Скинуть Никите IP из консоли (для его hosts).

---

# Раунд 2 (поменялись ролями)

## Глеб **ИЗДАЁТ** (роль CA)

**1.** Получить от Никиты `resource.csr` (CN=`RS-LAB22-GNM`)

**2.** Положить в `lab22/ca/in/resource.csr`

**3.** Mac:
```bash
cd lab22/ca
export XYZ=SGA
export ABC=GNM
./01-create-ca.sh
./02-sign-csr.sh
```

**4.** Проверка:
```bash
openssl x509 -in out/server.crt -noout -subject -ext subjectAltName
```
→ `RS-LAB22-GNM`, SAN: `LAB22-GNM`, `GNM`

**5.** Отправить Никите: **`ca.crt`** + **`server.crt`**

**6.** Когда Никита запустит сервер — в hosts на Mac (IP **его** Windows):
```
<IP_Никиты> LAB22-GNM
<IP_Никиты> GNM
```
Импорт CA (раунд 2):
```bash
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain \
  lab22/ca/out/ca.crt
```
Браузер: **https://LAB22-GNM:3443/resource**

---

## Никита **ПОЛУЧАЕТ и ПОДНИМАЕТ сервер** (роль Resource)

**1.** CSR:
```powershell
cd C:\Users\New\Desktop\stsr\lab22\resource
$env:ABC = "GNM"
.\01-gen-csr.bat
```
→ отправить Глебу **`out\resource.csr`**

**2.** Получить от Глеба `ca.crt`, `server.crt` → в `22-01\certs\`:
- `server.key` — свой из `resource\out\`
- `server.crt`, `ca.crt` — от Глеба

**3.** Импорт `ca.crt` → certmgr.msc → доверенные корневые

**4.** hosts (IP **своего** ПК):
```
<IP_своего_ПК> LAB22-GNM
<IP_своего_ПК> GNM
```

**5.** Запуск:
```powershell
cd C:\Users\New\Desktop\stsr\lab22\22-01
npm run start:gnm
```
(или `node app-gnm.js`)

**6.** Браузер: **https://LAB22-GNM:3443/resource**

**7.** Скинуть Глебу свой IP (для проверки с Mac).

---

# Шпаргалка «кто издаёт»

| Раунд | **Кто издаёт (CA)** | **Кто сервер (Resource)** |
|-------|---------------------|---------------------------|
| 1 | **Никита** GNM | **Глеб** SGA → `npm start` / `app.js` |
| 2 | **Глеб** SGA | **Никита** GNM → `npm run start:gnm` / `app-gnm.js` |

**Издаёт** = `01-create-ca` + `02-sign-csr` → отдаёт `ca.crt` + `server.crt`  
**Resource** = `01-gen-csr` + `npm start` + браузер

---

# Что не передавать

| Файл | Почему |
|------|--------|
| `server.key` | секрет Resource, только у того, кто поднимает сервер |
| `ca.key` | секрет CA, только у того, кто издаёт |

---

# Что показать преподу

- оба раунда: CSR, ca.crt, server.crt
- скрин раунд 1: `https://LAB22-SGA:3443/`
- скрин раунд 2: `https://LAB22-GNM:3443/`
- кто в каком раунде был CA / Resource
