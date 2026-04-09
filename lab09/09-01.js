const http = require('http');

// объект, который формирует параметры запроса.
// то, куда и как клиент будет обращаться 
const options = { 
  host: 'localhost', // указываю сервер к которому клиент будет подключаться 
  port: 5001, // порт, на котором будет слушать сервер 
  path: '/', // путь на сервер 
  method: 'GET', // метод HTTP запроса
};

const req = http.request(options, (res) => { // создаем http.request, который будет предаставлять запрос к серверу. второй аргумент – это обработчик ответа, он бдует вызван, когда сервер присылает данные 
  console.log('статус ответа:', res.statusCode);
  console.log('сообщение к статусу:', res.statusMessage);
  console.log('IP сервера:', res.socket.remoteAddress);
  console.log('порт удаленного сервера:', res.socket.remotePort);

  let body = '';

  res.on('data', (chunk) => {
    body += chunk.toString('utf8');
  });

  res.on('end', () => {
    console.log('данные тела ответа:', body);
  });
});

req.on('error', () => {
  console.log('ошибка');
});

req.end();

// 1. Клиент создаёт запрос с options.
// 2. Node.js открывает TCP-соединение с сервером (host + port).
// 3. Клиент отправляет HTTP-запрос:
// 4. Сервер принимает запрос, формирует ответ (статус, заголовки, тело).
// 5. Сервер отправляет ответ обратно по TCP.
// 6. Node.js вызывает обработчик (res) на клиенте, и клиент читает данные через события data и end.
