const redis = require("redis");

const TOTAL = 10000;
const KEY = "incr";
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
  client.set(KEY, 0, (err) => { 
    if (err) {
      console.error(err);
      client.quit();
      return;
    }
    measureBatch((b) => b.incr(KEY), (err, incrMs) => {
      if (err) {
        console.error(err);
        client.quit();
        return;
      }
      measureBatch((b) => b.decr(KEY), (err, decrMs) => {
        if (err) {
          console.error(err);
        } else {
          console.log("incr", incrMs, "ms");
          console.log("decr", decrMs, "ms");
        }
        client.quit();
      });
    });
  });
});
