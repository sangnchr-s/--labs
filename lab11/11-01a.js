const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:5001');

ws.on('open', () => {
  const duplex = WebSocket.createWebSocketStream(ws);
  const sourcePath = path.join(__dirname, 'MyFile.txt');
  const rfile = fs.createReadStream(sourcePath);
  rfile.pipe(duplex);
});

ws.on('error', (err) => {
  console.error(err.message);
  process.exit(1);
});
