const http = require('http');
const query = require('querystring');

// Числовые параметры x и y
const parms = query.stringify({ x: 3, y: 4 }); // { x: 3, y: 4 } -> x=3&y=4
const path = `/mypath?${parms}`;

console.log('parms', parms);
console.log('path', path);

const options = {
  host: 'localhost',
  port: 5001,
  path,
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log('статус ответа:', res.statusCode);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk.toString('utf8');
  });
  res.on('end', () => {
    console.log('данные тела ответа:', data);
  });
});

req.on('error', () => {
  console.log('ошибка');
});

req.end();
