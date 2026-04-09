const http = require('http');
const X2JS = require('x2js');
const builder = require('xmlbuilder');

const server = http.createServer((req, res) => {

  // Событие data срабатывает на каждый кусок данных, а end — когда весь XML полностью пришёл.
  let body = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    const x2js = new X2JS(); 
    const js = x2js.xml2js(body); // // превращает xml в объект js 
    const reqXml = js.request;
    const requestId = String(reqXml._id);
    const xs = Array.isArray(reqXml.x) ? reqXml.x : [reqXml.x];
    const ms = Array.isArray(reqXml.m) ? reqXml.m : [reqXml.m];

    let sumX = 0;
    for (const el of xs) sumX += Number(el._value);
    let concatM = '';
    for (const el of ms) concatM += String(el._value);

    const respId = requestId;
    const root = builder
      .create('response', { version: '1.0', encoding: 'UTF-8' })
      .att('id', respId)
      .att('request', requestId);
    root.ele('sum', { element: 'x', result: String(sumX) });
    root.ele('concat', { element: 'm', result: concatM });
    const out = root.end({ pretty: true });

    res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
    res.end(out);
  });
});

server.listen(5001, () => {
  console.log('http://localhost:5001');
});
