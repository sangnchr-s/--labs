# Lab22 — два случая (только команды)

**Глеб = SGA (Mac)** · **Никита = GNM (Windows)**

---

# СЛУЧАЙ 1 — сервер **ГЛЕБ** (раунд 1)

Никита **издаёт**. Глеб **поднимает HTTPS**.

---

## 1. Глеб (Mac) — CSR

```bash
cd ~/Documents/Labs/belstu-nodejs-labs/lab22/resource
export ABC=SGA
chmod +x 01-gen-csr.sh
./01-gen-csr.sh
```

**Отправить Никите:** `resource/out/resource.csr`  
**Не отправлять:** `resource/out/server.key`

---

## 2. Никита (Windows) — CA, подпись

Положить CSR сюда:
```
C:\Users\New\Desktop\stsr\lab22\ca\in\resource.csr
```

PowerShell:
```powershell
cd C:\Users\New\Desktop\stsr\lab22\ca
$env:XYZ = "GNM"
$env:ABC = "SGA"
.\01-create-ca.bat
.\02-sign-csr.bat
```

Проверка:
```powershell
openssl x509 -in out\ca.crt -noout -subject
openssl x509 -in out\server.crt -noout -subject -ext subjectAltName
```

Должно быть:
- CA: `CN=CA-LAB22-GNM`
- Server: `CN=RS-LAB22-SGA`, SAN: `LAB22-SGA`, `SGA`

**Отправить Глебу:** `ca\out\ca.crt` и `ca\out\server.crt`

---

## 3. Глеб (Mac) — сертификаты в проект

```bash
cp ~/Downloads/ca.crt ~/Documents/Labs/belstu-nodejs-labs/lab22/22-01/certs/
cp ~/Downloads/server.crt ~/Documents/Labs/belstu-nodejs-labs/lab22/22-01/certs/
cp ~/Documents/Labs/belstu-nodejs-labs/lab22/resource/out/server.key \
   ~/Documents/Labs/belstu-nodejs-labs/lab22/22-01/certs/
```

---

## 4. Глеб — импорт CA (Mac)

```bash
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain \
  ~/Documents/Labs/belstu-nodejs-labs/lab22/22-01/certs/ca.crt
```

---

## 5. Глеб — hosts (Mac)

```bash
sudo nano /etc/hosts
```

Добавить:
```
127.0.0.1 LAB22-SGA
127.0.0.1 SGA
```

---

## 6. Глеб — **ЗАПУСК СЕРВЕРА**

```bash
cd ~/Documents/Labs/belstu-nodejs-labs/lab22/22-01
npm install
npm start
```

В консоли будет IP (например `10.34.44.87`) — **скинуть Никите**.

---

## 7. Глеб — браузер

```
https://LAB22-SGA:3443/resource
```

Ответ: `RESOURCE`

---

## 8. Никита — подключиться к серверу Глеба

**Импорт CA:** `Win+R` → `certmgr.msc` → Доверенные корневые → Сертификаты → Импорт → `ca.crt`

**hosts** (блокнот от администратора, `C:\Windows\System32\drivers\etc\hosts`):
```
10.34.44.87 LAB22-SGA
10.34.44.87 SGA
```
(IP Mac от Глеба — подставить свой)

**Браузер:**
```
https://LAB22-SGA:3443/resource
```

---

# СЛУЧАЙ 2 — сервер **НИКИТА** (раунд 2)

Глеб **издаёт**. Никита **поднимает HTTPS**.

---

## 1. Никита (Windows) — CSR

```powershell
cd C:\Users\New\Desktop\stsr\lab22\resource
$env:ABC = "GNM"
.\01-gen-csr.bat
```

**Отправить Глебу:** `resource\out\resource.csr`  
**Не отправлять:** `resource\out\server.key`

---

## 2. Глеб (Mac) — CA, подпись

Положить CSR:
```bash
cp ~/Downloads/resource.csr ~/Documents/Labs/belstu-nodejs-labs/lab22/ca/in/resource.csr
```

```bash
cd ~/Documents/Labs/belstu-nodejs-labs/lab22/ca
export XYZ=SGA
export ABC=GNM
./01-create-ca.sh
./02-sign-csr.sh
```

Проверка:
```bash
openssl x509 -in out/ca.crt -noout -subject
openssl x509 -in out/server.crt -noout -subject -ext subjectAltName
```

Должно быть:
- CA: `CN=CA-LAB22-SGA`
- Server: `CN=RS-LAB22-GNM`, SAN: `LAB22-GNM`, `GNM`

**Отправить Никите:** `ca/out/ca.crt` и `ca/out/server.crt`

---

## 3. Никита — сертификаты в проект

Скопировать в `C:\Users\New\Desktop\stsr\lab22\22-01\certs\`:

| Файл | Откуда |
|------|--------|
| `server.key` | `resource\out\server.key` (свой) |
| `server.crt` | от Глеба |
| `ca.crt` | от Глеба |

---

## 4. Никита — импорт CA (Windows)

`Win+R` → `certmgr.msc`  
→ **Доверенные корневые центры сертификации** → **Сертификаты**  
→ ПКМ → **Все задачи** → **Импорт** → выбрать `ca.crt`

---

## 5. Никита — hosts (Windows)

Блокнот **от администратора** → `C:\Windows\System32\drivers\etc\hosts`

Узнать свой IP:
```powershell
ipconfig
```
(IPv4, например `192.168.0.5`)

Добавить:
```
192.168.0.5 LAB22-GNM
192.168.0.5 GNM
```

---

## 6. Никита — **ЗАПУСК СЕРВЕРА**

```powershell
cd C:\Users\New\Desktop\stsr\lab22\22-01
npm install
npm run start:gnm
```

Или:
```powershell
node app-gnm.js
```

**Скинуть Глебу свой IP** из `ipconfig`.

---

## 7. Никита — браузер

```
https://LAB22-GNM:3443/resource
```

Ответ: `RESOURCE`

---

## 8. Глеб — подключиться к серверу Никиты

**Импорт CA (раунд 2):**
```bash
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain \
  ~/Documents/Labs/belstu-nodejs-labs/lab22/ca/out/ca.crt
```

**hosts** (`sudo nano /etc/hosts`):
```
<IP_Windows_Никиты> LAB22-GNM
<IP_Windows_Никиты> GNM
```

**Браузер:**
```
https://LAB22-GNM:3443/resource
```

---

# Таблица одной строкой

| | **Случай 1 — сервер Глеб** | **Случай 2 — сервер Никита** |
|---|---------------------------|------------------------------|
| CSR | Глеб `./01-gen-csr.sh` | Никита `01-gen-csr.bat` |
| CA | Никита `01-create-ca.bat` | Глеб `./01-create-ca.sh` |
| Подпись | Никита `02-sign-csr.bat` | Глеб `./02-sign-csr.sh` |
| Запуск | Глеб `npm start` | Никита `npm run start:gnm` |
| URL | `https://LAB22-SGA:3443/` | `https://LAB22-GNM:3443/` |
| hosts у сервера | `127.0.0.1 LAB22-SGA` | IP_своего_ПК `LAB22-GNM` |
| hosts у клиента | IP_Mac `LAB22-SGA` | IP_Win `LAB22-GNM` |

---

# Секреты — никому не слать

- `server.key` — только у того, кто **сервер**
- `ca.key` — только у того, кто **издаёт**
