const WebSocket = require('ws');

const x = process.argv[2];
if (!x) {
  console.error('введите имя клиента');
  process.exit(1);
}

const ws = new WebSocket('ws://localhost:5001');

function send() {
  ws.send(
    JSON.stringify({
      client: x,
      timestamp: new Date(),
    })
  );
}

ws.on('open', () => {
  console.log(`подключено, клиент: ${x}`);

  ws.on('message', (data) => {
    console.log('on message: ', JSON.parse(data.toString()));
  });

  send();
});

ws.on('error', (err) => {
  console.error(err.message);
  process.exit(1);
});
