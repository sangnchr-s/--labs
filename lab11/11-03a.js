const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:5001');

const duplex = WebSocket.createWebSocketStream(ws, { encoding: 'utf8' }); // превращают в поток

duplex.pipe(process.stdout);

process.stdin.pipe(duplex);

// ws.on('ping', (data) => {
//   console.log('on ping: ', data.toString());
// }); // можно ловить; pong на ping библиотека шлёт сама
