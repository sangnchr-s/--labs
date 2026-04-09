const http = require('http');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'MyFile.txt');
const rs = fs.createReadStream(filePath);

const options = {
  host: 'localhost',
  port: 5001,
  method: 'POST',
};

const req = http.request(options, (res) => {
  console.log('cтатус ответа:', res.statusCode);

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

rs.on('data', (chunk) => {
  req.write(chunk);
});
rs.on('end', () => {
  req.end();
});
