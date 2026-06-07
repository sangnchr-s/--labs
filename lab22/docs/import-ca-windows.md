# Импорт CA на Windows

Файл: `ca.crt` (от партнёра-CA).

## Через GUI

1. `Win + R` → `certmgr.msc`
2. **Доверенные корневые центры сертификации** → **Сертификаты**
3. ПКМ → **Все задачи** → **Импорт**
4. Выбрать `ca.crt` → **Локальный компьютер** (если спросит — запустить `certmgr.msc` от администратора через `certlm.msc` для всей машины)

Для текущего пользователя достаточно `certmgr.msc`.

## PowerShell (от администратора)

```powershell
Import-Certificate -FilePath "C:\path\to\ca.crt" -CertStoreLocation Cert:\LocalMachine\Root
```

## hosts

`C:\Windows\System32\drivers\etc\hosts` — блокнот **от администратора**:

```
127.0.0.1 LAB22-SGA
127.0.0.1 SGA
```

Подставьте инициалы Resource вместо `ABC`.
