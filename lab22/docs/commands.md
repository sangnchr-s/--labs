# Команды OpenSSL

Переменные: **GNM** — CA (Гулевич), **SGA** — Resource (Шершнев).

## Resource — CSR (Mac)

```bash
cd lab22/resource
export ABC=SGA
chmod +x 01-gen-csr.sh
./01-gen-csr.sh
# → out/resource.csr, out/server.key
```

## Resource — CSR (Windows)

```bat
cd lab22\resource
set ABC=SGA
01-gen-csr.bat
```

## CA — создать центр (Mac)

```bash
cd lab22/ca
export XYZ=GNM
./01-create-ca.sh
```

## CA — создать центр (Windows)

### CMD (командная строка)

```bat
cd lab22\ca
set XYZ=GNM
set ABC=SGA
01-create-ca.bat
02-sign-csr.bat
```

### PowerShell

```powershell
cd lab22\ca
$env:XYZ = "GNM"
$env:ABC = "SGA"
.\01-create-ca.bat
.\02-sign-csr.bat
```

Перед `02-sign-csr` положи CSR партнёра в `ca\in\resource.csr`.

## Resource — HTTPS-сервер

```bash
cp resource/out/server.key 22-01/certs/
cp ca/out/server.crt 22-01/certs/
cp ca/out/ca.crt 22-01/certs/

cd lab22/22-01
npm install
npm start
```

## hosts

```
127.0.0.1 LAB22-SGA
127.0.0.1 SGA
```

## Проверка

```bash
curl -v --cacert 22-01/certs/ca.crt https://LAB22-SGA:3443/resource
```

Без `-k` — только если CA в доверенных или передан `--cacert`.
