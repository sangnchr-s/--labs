const http = require('http');
const X2JS = require('x2js');
const builder = require('xmlbuilder');

const root = builder
  .create('request', { version: '1.0', encoding: 'UTF-8' })
  .att('id', '28');
root.ele('x').att('value', '1');
root.ele('x').att('value', '2');
root.ele('m').att('value', 'a');
root.ele('m').att('value', 'b');
root.ele('m').att('value', 'c');

const postData = root.end({ pretty: true }); // формируем наш готовый xml

const options = {
  host: 'localhost',
  port: 5001,
  path: '/xml',
  method: 'POST',
};

const req = http.request(options, (res) => {

  let raw = '';
  res.on('data', (chunk) => {
    raw += chunk.toString('utf8');
  });
  res.on('end', () => {
    console.log('данные тела ответа:', raw);
  });
});

req.on('error', () => {
  console.log('ошибка');
});

req.write(postData);
req.end();
