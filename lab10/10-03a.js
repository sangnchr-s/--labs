const WebSocket = require('ws');

let k = 0;
const ws = new WebSocket('ws://localhost:5000/broadcast');

let sendTimer = null;

ws.on('open', () => {
  sendTimer = setInterval(() => {
    ws.send(`client: ${++k}`);
  }, 1000);

  setTimeout(() => {
    if (sendTimer !== null) {
      clearInterval(sendTimer);
      sendTimer = null;
    }
    ws.close();
  }, 25000);
});

ws.on('message', (message) => {
  console.log(`received message => ${message}`);
});

ws.on('close', () => {
  if (sendTimer !== null) {
    clearInterval(sendTimer);
    sendTimer = null;
  }
});

ws.on('error', (err) => {
  console.error('ошибка WebSocket:', err.message);
});
