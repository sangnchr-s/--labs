const async = require('async');
const rpcWSC = require('rpc-websockets').Client;

const ws = new rpcWSC('ws://localhost:5001');

function call(cb, method, args) {
  ws.call(method, args)
    .then((r) => cb(null, r))
    .catch((e) => cb(e));
}

function finish(err) {
  if (err) console.error(err);
  ws.close();
}

ws.on('open', () => {
  ws
    .login({})
    .then(() => {
      async.parallel(
        {
          s3: (cb) => call(cb, 'square', [3]),
          s54: (cb) => call(cb, 'square', [5, 4]),
          m1: (cb) => call(cb, 'mul', [3, 5, 7, 9, 11, 13]),
        },
        (e, r) => {
          if (e) return finish(e);
          call((e2, sumPart) => {
            if (e2) return finish(e2);
            console.log(
              'sum(square(3), square(5,4), mul(3,5,7,9,11,13)) =',
              sumPart
            );
            async.parallel(
              {
                fibArr: (cb) => call(cb, 'fib', [7]),
                mulPart: (cb) => call(cb, 'mul', [2, 4, 6]),
              },
              (e3, r2) => {
                if (e3) return finish(e3);
                console.log('fib(7) =', r2.fibArr);
                call((e4, fibAsSum) => {
                  if (e4) return finish(e4);
                  console.log(
                    'sum(fib(7)) — скаляр для формулы (fib(7) с сервера — массив) =',
                    fibAsSum
                  );
                  console.log('mul(2,4,6) =', r2.mulPart);
                  const result = sumPart + fibAsSum * r2.mulPart;
                  console.log(
                    'sum(...) + sum(fib(7)) * mul(2,4,6) =',
                    sumPart,
                    '+',
                    fibAsSum,
                    '*',
                    r2.mulPart,
                    '=',
                    result
                  );
                  finish();
                }, 'sum', r2.fibArr);
              }
            );
          }, 'sum', [r.s3, r.s54, r.m1]);
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
