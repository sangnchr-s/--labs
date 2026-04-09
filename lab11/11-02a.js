const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:5001');
let k = 0;

ws.on('open', () => {
  const duplex = WebSocket.createWebSocketStream(ws);
  const wfile = fs.createWriteStream(
    path.join(__dirname, `MyFile${++k}.txt`)
  );
  duplex.pipe(wfile);
});

ws.on('error', (err) => {
  console.error(err.message);
  process.exit(1);
});
