const rpcWSS = require('rpc-websockets').Server;

const server = new rpcWSS({ port: 5001, host: 'localhost' });

server.event('A');
server.event('B');
server.event('C');

let k = 0;

server.on('listening', () => {
  console.log('WS-сервер ws://localhost:5001');
  console.log('введите A, B или C');
});

process.stdin.setEncoding('utf8');
process.stdin.on('data', (data) => {
  for (const ch of data) {
    if (ch === 'A') {
      const payload = { n: ++k, event: 'A' };
      server.emit('A', payload);
      console.log('[сервер] emit A', payload);
    } else if (ch === 'B') {
      const payload = { n: ++k, event: 'B' };
      server.emit('B', payload);
      console.log('[сервер] emit B', payload);
    } else if (ch === 'C') {
      const payload = { n: ++k, event: 'C' };
      server.emit('C', payload);
      console.log('[сервер] emit C', payload);
    }
  }
});

server.on('error', (err) => {
  console.error(err);
});
