const http = require('http');
const query = require('querystring');


const server = http.createServer((req, res) => {
  let body = ''; // принимаем данные от клиента 
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {  // событие end которое означает, что все данные полученны
    const params = query.parse(body); // превращаем нашу строку в объект
    const x = params.x; // достаем значения
    const y = params.y;
    const s = params.s;

    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`сервер получил: x=${Number(x)}, y=${Number(y)}, s=${s}`);
  });
});

server.listen(5001, () => {
  console.log('http://localhost:5001');
});
