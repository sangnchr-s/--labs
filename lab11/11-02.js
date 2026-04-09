const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const DOWNLOAD_DIR = path.join(__dirname, 'download');
const SOURCE_FILE = path.join(DOWNLOAD_DIR, 'MyFile.txt');

const wss = new WebSocket.Server({ port: 5001, host: 'localhost' });

wss.on('connection', (ws) => {
  const duplex = WebSocket.createWebSocketStream(ws); 
  const rfile = fs.createReadStream(SOURCE_FILE);
  rfile.pipe(duplex);
});
