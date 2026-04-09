const WebSocket = require('ws');

const PORT = 5000;
const PATH = '/broadcast';

const wss = new WebSocket.Server({
  port: PORT,
  host: 'localhost',
  path: PATH,
});

wss.on('connection', (ws) => {
  console.log('клиент подключён, всего:', wss.clients.size);

  ws.on('message', (data) => { 
    wss.clients.forEach((client) => { 
      if (client.readyState === WebSocket.OPEN) {
        client.send('server: ' + data);
      }
    });
  });

  ws.on('close', () => {
    console.log('клиент отключён, всего:', wss.clients.size);
  });

  ws.on('error', (e) => {
    console.log('ошибка соединения:', e.message);
  });
});

wss.on('error', (e) => {
  console.log('ошибка сервера:', e.message);
});

console.log(`широковещательный WS: ws://localhost:${PORT}${PATH}`);
