# Объяснение 03-04.js и 03-05.js

Оба файла идентичны по структуре. Единственное отличие — механизм
откладывания рекурсивного шага: `process.nextTick` (03-04) и `setImmediate` (03-05).

---

## 1. Функция factorial(n, callback)

```js
function factorial(n, callback) {
    if (n <= 1) {        // базовый случай: factorial(1) = 1
        callback(1);     // передаём результат 1 в callback и выходим
        return;
    }
    process.nextTick(() => {        // <-- в 03-05 здесь setImmediate
        factorial(n - 1, (result) => {   // рекурсивный вызов на шаг меньше
            callback(n * result);         // когда получили result — умножаем и передаём наверх
        });
    });
}
```

Вместо того чтобы вызвать `factorial(n-1)` напрямую (синхронно),
функция откладывает этот вызов через `nextTick` / `setImmediate`.
Это позволяет Node.js не "застревать" на одном вычислении.

Пример разворачивания для factorial(3):

```
factorial(3, cb)
  └─ nextTick → factorial(2, (result) => cb(3 * result))
                  └─ nextTick → factorial(1, (result) => cb(2 * result))
                                  └─ callback(1)         // базовый случай
                                cb(2 * 1) → result = 2
                cb(3 * 2) → result = 6
```

---

## 2. HTML-страница (константа page)

```js
const page = /* html */`...`;
```

Шаблонная строка с HTML-кодом страницы. Комментарий `/* html */`
включает подсветку синтаксиса в VS Code (расширение es6-string-html).

Страница содержит клиентский JS-скрипт, который:

```js
const start  = Date.now();          // фиксируем момент старта
const output = document.getElementById('output'); // элемент для вывода
let i = 0, completed = 0;           // i — порядок прихода, completed — счётчик завершённых
const total = 21;                   // всего запросов (k от 0 до 20)

for (let k = 0; k <= 20; k++) {     // запускаем все 21 запрос параллельно
    fetch('/fact?k=' + k)           // GET /fact?k=0, /fact?k=1, ..., /fact?k=20
        .then(res => res.json())    // парсим JSON ответ { k: 3, fact: 6 }
        .then(data => {
            const t = Date.now() - start;   // время с момента старта в мс
            output.innerHTML += (i++) + '.Результат: ' + t + '-' + data.k + '/' + data.fact + '<br>';
            completed++;
            if (completed === total) {      // все 21 ответ получены
                const duration = Date.now() - start;
                output.innerHTML += '<p>Общая продолжительность: ' + duration + ' мс</p>';
            }
        });
}
```

Запросы отправляются **параллельно** (цикл не ждёт ответа перед следующей итерацией),
поэтому ответы могут приходить в произвольном порядке — k=5 может прийти раньше k=2.
Счётчик `i` отражает порядок прихода ответов, а не порядок k.
Когда `completed === total` — все ответы получены, выводим итоговое время.

---

## 3. HTTP-сервер

```js
http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    // url.parse('/fact?k=3', true) → { pathname: '/fact', query: { k: '3' } }

    if (parsedUrl.pathname == '/fact') {
        const k = parseInt(parsedUrl.query.k);  // '3' → 3
        factorial(k, (fact) => {                // асинхронно считаем факториал
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ k, fact })); // отправляем { "k": 3, "fact": 6 }
        });

    } else if (parsedUrl.pathname == '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(page);                          // отдаём HTML-страницу

    } else {
        res.writeHead(404, { 'Content-Type': 'plain/text' });
        res.end('Not Found');
    }
}).listen(5001, () => {
    console.log('Server running at http://localhost:5001');
});
```

Сервер обрабатывает два маршрута:

- `GET /`        → отдаёт HTML-страницу со скриптом
- `GET /fact?k=N` → асинхронно считает factorial(N) и отвечает JSON

---

## 4. Разница между 03-04 и 03-05

|                                                    | process.nextTick (03-04)                                                                             | setImmediate (03-05)                                                                  |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Когда выполняется                  | сразу после текущей операции, ДО I/O                                      | после I/O, в следующей итерации event loop                     |
| При 1 вкладке                            | быстрее                                                                                       | чуть медленнее                                                           |
| При 3 вкладках одновременно | первый запрос досчитывается полностью, остальные ждут | все запросы чередуются, время у каждого больше |
| Блокирует ли I/O                        | да (при глубокой рекурсии)                                                      | нет                                                                                |
