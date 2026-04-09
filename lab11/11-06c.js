const rpcWSC = require('rpc-websockets').Client;

const ws = new rpcWSC('ws://localhost:5001');

ws.on('open', () => {
  ws.on('C', (p) => {
    console.log('C:', p);
  });
  ws.subscribe('C').catch((e) => console.error(e));
});

ws.on('error', (e) => {
  console.log('error = ', e);
});
