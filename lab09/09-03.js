const http = require('http');
const query = require('querystring');

const postData = query.stringify({ x: 5, y: 7, s: 'тест' }); // объект в строку

const options = {
  host: 'localhost',
  port: 5001,
  method: 'POST',
};

const req = http.request(options, (res) => { // в res приходит ответ от сервера
  console.log('статус ответа:', res.statusCode);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk.toString('utf8');
  });
  res.on('end', () => { // отправляем запрос на сервер 
    console.log('данные тела ответа:', data);
  });
});

req.on('error', () => {
  console.log('ошибка запроса:');
});

req.write(postData); // отправить тело запроса
req.end();
