const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 5001, host: 'localhost' });

let n = 0;

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      console.log('on message: ', msg);
      const x = msg.client;
      const t = msg.timestamp;
      const reply = {
        server: ++n,
        client: x,
        timestamp: t,
      };
      ws.send(JSON.stringify(reply));
    } catch (e) {
      console.error('invalid json', e.message);
    }
  });
});

wss.on('error', (err) => {
  console.error(err);
});
