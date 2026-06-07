# Лабораторная работа 22 — PKI, OpenSSL, HTTPS

Парная работа: роли **CA** и **Resource**. OpenSSL + приложение **22-01** (HTTPS).

## Быстрый старт в паре

**Главная инструкция:** [docs/pair-work.md](docs/pair-work.md) — пошагово для Mac + Windows.

```
Resource → генерирует CSR → отправляет CA
CA       → подписывает → отправляет ca.crt + server.crt
Resource → импорт CA, npm start, браузер https://LAB22-SGA:3443/
```

## Структура

```
lab22/
  ca/              — роль CA (скрипты .sh и .bat)
  resource/        — роль Resource (CSR)
  22-01/           — HTTPS Express-сервер
  docs/
```

## Инициалы

См. **[docs/scenarios.md](docs/scenarios.md)** — два случая: сервер Глеб / сервер Никита, все команды.

## Документация

- [docs/task.md](docs/task.md)
- [docs/pair-work.md](docs/pair-work.md) — работа в паре удалённо
- [docs/commands.md](docs/commands.md)
- [docs/import-ca-mac.md](docs/import-ca-mac.md)
- [docs/openssl-windows.md](docs/openssl-windows.md) — установка OpenSSL на Windows

## Задание 03

Поменяйтесь ролями и повторите с **новыми** инициалами в CN и SAN.
