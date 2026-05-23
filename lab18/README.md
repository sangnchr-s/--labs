# Лабораторная работа 18: БД GAS

Проект поднимает Microsoft SQL Server в Docker, создает базу данных `GAS`, таблицы по схеме из задания и заполняет каждую таблицу 6 строками данных. Проверка подключения выполнена через Node.js, Sequelize и драйвер `tedious`.

## Данные подключения

- DB name: `GAS`
- Host: `localhost`
- Port: `1433`
- User: `gas_user`
- Password: `GasPass!2026`
- SA user: `sa`
- SA password: `YourStrong!Passw0rd`

## Запуск

```bash
docker compose up -d
npm install
node 18-01.js
```

После запуска HTML-страница доступна по адресу `http://localhost:3001/`.

Можно также запустить проверку через npm:

```bash
npm start
```

## Проверка синтаксиса JavaScript

```bash
npm run check
```

## Что создается в БД

- `FACULTY(FACULTY, FACULTY_NAME)`
- `PULPIT(PULPIT, PULPIT_NAME, FACULTY)`
- `TEACHER(TEACHER, TEACHER_NAME, PULPIT)`
- `SUBJECT(SUBJECT, SUBJECT_NAME, PULPIT)`
- `AUDITORIUM_TYPE(AUDITORIUM_TYPE, AUDITORIUM_TYPENAME)`
- `AUDITORIUM(AUDITORIUM, AUDITORIUM_NAME, AUDITORIUM_CAPACITY, AUDITORIUM_TYPE)`

SQL-скрипт находится в `db/init.sql`. Он идемпотентный: повторный запуск не должен создавать дубли строк.

> На Apple Silicon контейнер MSSQL запускается через эмуляцию `linux/amd64`, поэтому первый старт может быть долгим.
