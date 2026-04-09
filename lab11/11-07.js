const { Server } = require('rpc-websockets');

const server = new Server({ port: 5001, host: 'localhost' });

server.register('A', () => {
  console.log('получено уведомление A');
});

server.register('B', () => {
  console.log('получено уведомление B');
});

server.register('C', () => {
  console.log('получено уведомление C');
});

server.on('error', (err) => {
  console.error(err);
});
