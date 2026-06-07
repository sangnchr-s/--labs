# Сертификаты Resource

Положи сюда после обмена с CA:

| Файл | Откуда |
|------|--------|
| `server.key` | `resource/out/server.key` (секретный, только у тебя) |
| `server.crt` | от CA (`ca/out/server.crt`) |
| `ca.crt` | от CA (`ca/out/ca.crt`) — импорт в доверенные корневые |

`server.key` и `server.crt` нужны приложению **22-01**.  
`ca.crt` — для браузера (доверие к CA).
