const rpcWSC = require('rpc-websockets').Client;

const ws = new rpcWSC('ws://localhost:5001');

ws.on('open', () => {
  ws.on('B', (p) => {
    console.log('B:', p);
  });
  ws.subscribe('B').catch((e) => console.error(e));
});

ws.on('error', (e) => {
  console.log('error = ', e);
});
