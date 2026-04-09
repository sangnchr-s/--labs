const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end('сервер 09-01');
    return;
  }

  res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8',});
  res.end('маршрут не найден');
});

server.listen(5001, () => {
  console.log('Сервер запущен: http://localhost:5001');
});


// Почему на сервере есть req «запрос же клиент отправляет» Но сервер его принимает, и этот принятый запрос становится: req
// А где res у клиента? На клиенте тоже есть res. res — это ответ от сервера, который клиент получил

// клиент отправляет req → сервер получает req
// сервер отправляет res → клиент получает res