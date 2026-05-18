const redis = require("redis");

const TOTAL = 10000; 

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
  measureBatch((b, n) => b.set(String(n), `set${n}`), (err, setMs) => {
    if (err) {
      console.error(err);
      client.quit();
      return;
    }
    measureBatch((b, n) => b.get(String(n)), (err, getMs) => {
      if (err) {
        console.error(err);
        client.quit();
        return;
      }
      measureBatch((b, n) => b.del(String(n)), (err, delMs) => {
        if (err) {
          console.error(err);
        } else {
          console.log("set", setMs, "ms");
          console.log("get", getMs, "ms");
          console.log("del", delMs, "ms");
        }
        client.quit();
      });
    });
  });
});
