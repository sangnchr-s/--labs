const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 5001, host: 'localhost' });

let msgSeq = 0;

wss.on('connection', (ws) => {
  ws.isAlive = true;

  ws.on('pong', (data) => {
    console.log('on pong: ', data.toString());
    ws.isAlive = true;
  });

  ws.on('message', (data) => {
    console.log('on message: ', data.toString());
    ws.send(data);
  });
});

setInterval(() => {
  const text = `11-03-server: ${++msgSeq}\n`;
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(text);
    }
  });
}, 15000);

setInterval(() => {
  let alive = 0;
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      ws.terminate();
      return;
    }
    alive++;
    ws.isAlive = false;
  });
  console.log(`работоспособных соединений: ${alive}`);
  console.log('server: ping');

  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping('server: ping'); 
    }
  });
}, 5000);

wss.on('error', (err) => {
  console.error(err);
});

// чтобы проверить, что клиент живой, сервер отправляет ping
// если клиент живой, то он автоматически отправляет pong
// если pong не пришел от клиента, то через некоторое время он закрыл его
