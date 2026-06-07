# Лабораторная работа 22 — ПСКП, ПОИТ-3

Работа **в паре**, роли **CA** и **Resource**. OpenSSL. Инициалы **XYZ**, **ABC**.

## Задание 01 — CA

4. Сертификат CA, CN = `CA-LAB22-XYZ`.
5. Получить CSR от Resource.
6. Подписать CSR; SAN: `LAB22-ABC`, `ABC`.
7. Передать Resource `server.crt` и `ca.crt`.

## Задание 02 — Resource

8. CSR, CN = `RS-LAB22-ABC` → CA.
9. Получить `server.crt` и `ca.crt`.
10. Импорт CA в доверенные корневые.
11. Приложение **22-01**, GET по **HTTPS**, тест в браузере.

## Задание 03

12. Поменяться ролями и повторить.

## Пара Mac + Windows

[pair-work.md](pair-work.md)
