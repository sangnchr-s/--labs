const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 7006;
const boundary = 'sending-file';

const server = http.createServer((req, res) => {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  const filePath = path.join(__dirname, 'MyFile.txt');
  const dataFromFile = fs.readFileSync(filePath);

  res.writeHead(200, {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
  });

  res.write(`--${boundary}\r\n`);
  res.write(
    'Content-Disposition: form-data; name="file"; filename="MyFile.txt"\r\n'
  );
  res.write('Content-Type: text/plain; charset=utf-8\r\n\r\n');
  res.write(dataFromFile);
  res.write(`\r\n--${boundary}--\r\n`);
  res.end();
});

server.listen(PORT, () => {
  console.log(`Сервер: GET http://localhost:${PORT}/`);
});
