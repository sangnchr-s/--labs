const { Server } = require('rpc-websockets');

const server = new Server({ port: 5001, host: 'localhost' });

server.setAuth(() => {
  return true;
});

function normalizeParams(params) {
  if (params == null) return [];
  return Array.isArray(params) ? params : Object.values(params);
}

server
  .register('square', (params) => {
    const p = normalizeParams(params);
    if (p.length === 1) {
      const r = Number(p[0]);
      return Math.PI * r * r;
    }
    if (p.length === 2) {
      return Number(p[0]) * Number(p[1]);
    }
  })
  .public();

server
  .register('sum', (params) => {
    const p = normalizeParams(params);
    return p.reduce((acc, x) => acc + Number(x), 0);
  })
  .public();

server
  .register('mul', (params) => {
    const p = normalizeParams(params);
    if (p.length === 0) return 1;
    return p.reduce((acc, x) => acc * Number(x), 1);
  })
  .public();

server
  .register('fib', (params) => {
    const p = normalizeParams(params);
    const n = Math.floor(Number(p[0]));
    const out = [];
    let a = 0;
    let b = 1;
    for (let i = 0; i < n; i++) {
      out.push(a);
      const next = a + b;
      a = b;
      b = next;
    }
    return out;
  })
  .protected();

server
  .register('fact', (params) => {
    const p = normalizeParams(params);
    const n = Math.floor(Number(p[0]));
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  })
  .protected();

server.on('listening', () => {
  console.log('RPC-сервер ws://localhost:5001');
});

server.on('error', (err) => {
  console.error(err);
});
