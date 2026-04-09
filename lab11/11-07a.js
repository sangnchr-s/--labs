const rpcWSC = require('rpc-websockets').Client;

const ws = new rpcWSC('ws://localhost:5001');

ws.on('open', () => {
  console.log('A, B, C');
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (data) => {
    for (const ch of data) {
      if (ch === 'A' || ch === 'B' || ch === 'C') {
        ws.notify(ch)
          .then(() => {
            console.log(`отправлено уведомление ${ch}`);
          })
          .catch((e) => console.error(e));
      }
    }
  });
});

ws.on('error', (err) => {
  console.error(err.message);
  process.exit(1);
});
