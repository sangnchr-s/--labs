# Импорт CA на macOS

Файл: `ca.crt` (от партнёра-CA).

```bash
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain \
  /path/to/ca.crt
```

Проверка: **Keychain Access** → System → найти `CA-LAB22-…` → **Always Trust**.

Удалить (если нужно):

```bash
sudo security delete-certificate -c "CA-LAB22-GNM" /Library/Keychains/System.keychain
```
