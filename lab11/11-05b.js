const async = require('async');
const rpcWSC = require('rpc-websockets').Client;

const ws = new rpcWSC('ws://localhost:5001');

function call(cb, method, args) {
  ws.call(method, args) // Отправляет на сервер сообщение с запросом выполнить метод method с аргументами args
    .then((r) => cb(null, r)) // возвращает результат
    .catch((e) => cb(e));
}

ws.on('open', () => {
  ws
    .login({})
    .then(() => {
      async.parallel(
        {
          square3: (cb) => call(cb, 'square', [3]),
          square54: (cb) => call(cb, 'square', [5, 4]),
          sum2: (cb) => call(cb, 'sum', [2]),
          sum246810: (cb) => call(cb, 'sum', [2, 4, 6, 8, 10]),
          mul3: (cb) => call(cb, 'mul', [3]),
          mulSeq: (cb) => call(cb, 'mul', [3, 5, 7, 9, 11, 13]),
          fib1: (cb) => call(cb, 'fib', [1]),
          fib2: (cb) => call(cb, 'fib', [2]),
          fib7: (cb) => call(cb, 'fib', [7]),
          fact0: (cb) => call(cb, 'fact', [0]),
          fact5: (cb) => call(cb, 'fact', [5]),
          fact10: (cb) => call(cb, 'fact', [10]),
        },
        (e, r) => {
          if (e) {
            console.error(e);
          } else {
            console.log('square(3) =', r.square3);
            console.log('square(5,4) =', r.square54);
            console.log('sum(2) =', r.sum2);
            console.log('sum(2,4,6,8,10) =', r.sum246810);
            console.log('mul(3) =', r.mul3);
            console.log('mul(3,5,7,9,11,13) =', r.mulSeq);
            console.log('fib(1) =', r.fib1);
            console.log('fib(2) =', r.fib2);
            console.log('fib(7) =', r.fib7);
            console.log('fact(0) =', r.fact0);
            console.log('fact(5) =', r.fact5);
            console.log('fact(10) =', r.fact10);
          }
          ws.close();
        }
      );
    })
    .catch((err) => {
      console.error(err);
      ws.close();
    });
});

ws.on('error', (e) => {
  console.log('error = ', e);
});
