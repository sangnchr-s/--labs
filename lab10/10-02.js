const WebSocket = require('ws');

let n = 0;

function logLine(msg) {
  process.stdout.write(`${msg}\n`);
}

const socket = new WebSocket('ws://localhost:4010/wsserver');

let sendTimer = null;
let stopTimer = null;

socket.on('open', () => {
  n += 1;
  socket.send(`10-01-client: ${n}`);
  sendTimer = setInterval(() => {
    n += 1;
    socket.send(`10-01-client: ${n}`);
  }, 3000);
  stopTimer = setTimeout(() => {
    if (sendTimer !== null) {
      clearInterval(sendTimer);
      sendTimer = null;
    }
    logLine('соединение закрыто!');
    socket.close();
  }, 25000);
});

socket.on('message', (data) => {
  logLine(String(data));
});

socket.on('close', () => {
  if (sendTimer !== null) {
    clearInterval(sendTimer);
    sendTimer = null;
  }
  if (stopTimer !== null) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }
});

socket.on('error', (err) => {
  console.error(`Ошибка WebSocket`, err.message);
});
