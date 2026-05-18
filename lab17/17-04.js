const redis = require("redis");

const TOTAL = 10000;
const FIELD = "data";
const client = redis.createClient();

client.on("error", (err) => console.error(err));

function measureBatch(setupBatch, callback) {
  const batch = client.batch();
  for (let n = 1; n <= TOTAL; n++) {
    setupBatch(batch, n);
  }
  const t0 = Date.now();
  batch.exec((err) => {
    if (err) {
      callback(err);
    } else {
      callback(null, Date.now() - t0);
    }
  });
}

client.on("ready", () => {
  measureBatch(
    (b, n) =>
      b.hset(String(n), FIELD, JSON.stringify({ id: n, val: `val-${n}` })),
    (err, hsetMs) => {
      if (err) {
        console.error(err);
        client.quit();
        return;
      }
      measureBatch((b, n) => b.hget(String(n), FIELD), (err, hgetMs) => {
        if (err) {
          console.error(err);
          client.quit();
          return;
        }
        console.log("hset", hsetMs, "ms");
        console.log("hget", hgetMs, "ms");
        measureBatch((b, n) => b.del(String(n)), (e) => {
          if (e) {
            console.error(e);
          }
          client.quit();
        });
      });
    }
  );
});
