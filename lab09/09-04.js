const http = require('http');

const payload = {
  x: 2,
  y: 5,
  s: 'строка',
  o: { a: 10, b: 20 },
  m: ['a', 'b', 'c'],
};

const postData = JSON.stringify(payload); // преобразуем объект в json

// настройки зароса 
const options = {
  host: 'localhost',
  port: 5001,
  method: 'POST',
};

const req = http.request(options, (res) => {
  console.log('статус ответа:', res.statusCode);

  let raw = '';
  res.on('data', (chunk) => {
    raw += chunk.toString('utf8');
  });
  res.on('end', () => {
    console.log('данные тела ответа:', raw);
    try {
      const parsed = JSON.parse(raw); // преобразуем обратно в объект
      console.log('ответ:', parsed);
    } catch (e) {
      console.log('ошибка');
    }
  });
});

req.on('error', () => {
  console.log('ошибка запроса:');
});

req.write(postData);
req.end();
