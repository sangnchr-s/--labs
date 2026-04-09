const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const UPLOAD_DIR = path.join(__dirname, 'upload');

const wss = new WebSocket.Server({ port: 5001, host: 'localhost' });
let k = 0;

wss.on('connection', (ws) => {
  const duplex = WebSocket.createWebSocketStream(ws);
  const wfile = fs.createWriteStream(
    path.join(UPLOAD_DIR, `file${++k}.txt`)
  );
  duplex.pipe(wfile);
});
