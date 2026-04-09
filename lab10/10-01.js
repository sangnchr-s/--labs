const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');



const htmlPath = path.join(__dirname, '10-01.html');
const httpserver = http.createServer((req, res) => {
  if (req.url === '/start') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(htmlPath));
  } else {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400');
  }
});

httpserver.listen(3010, () => {
  console.log('HTTP server: 3010');
});

const wsserver = new WebSocket.Server({ 
  port: 4010, 
  host: 'localhost', 
  path: '/wsserver', 
});

wsserver.on('connection', (ws) => {
  let lastClientN = 0; 
  let k = 0; 

  const tick = setInterval(() => {
    k += 1;
    ws.send(`10-01-server: ${lastClientN}->${k}`); 
  }, 5000);

  ws.on('message', (message) => { 
    const text = message.toString(); 
    console.log('received from client =>', text);

    const parts = text.split(':'); 
    const n = Number(parts[1]); 
    if (!Number.isNaN(n)) lastClientN = n;
  });

  ws.on('close', () => { 
    clearInterval(tick);
  });

  ws.on('error', (e) => {
    console.log('ws connection error', e);
    clearInterval(tick);
  });
});

wsserver.on('error', (e) => {
  console.log('ws server error', e);
});

console.log(
  `WS server: host:${wsserver.options.host}, port:${wsserver.options.port}, path:${wsserver.options.path}`,
);
