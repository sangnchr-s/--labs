const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {

  const parsed = url.parse(req.url, true); // путь которйы отправил клиент true говорит парсить квери

  // преобразуем в числа 
  const x = Number(parsed.query.x);
  const y = Number(parsed.query.y);

  if (Number.isNaN(x) || Number.isNaN(y)) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('укажите числа');
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(`x=${x}, y=${y}, сумма=${x + y}`);
});

server.listen(5001, () => {
  console.log('http://localhost:5001');
});
