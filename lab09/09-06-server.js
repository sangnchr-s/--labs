const http = require('http');

const server = http.createServer((req, res) => {

  let body = '';
  req.setEncoding('utf8');

  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(
      `файл принят\n` +
        `${body}`,
    );
  });
});

server.listen(5001, () => {
  console.log('http://localhost:5001');
});
