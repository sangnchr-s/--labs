const rpcWSC = require('rpc-websockets').Client;

const ws = new rpcWSC('ws://localhost:5001');

ws.on('open', () => {
  ws.on('A', (p) => {
    console.log('A:', p);
  });
  ws.subscribe('A').catch((e) => console.error(e));
});

ws.on('error', (e) => {
  console.log('error = ', e);
});
