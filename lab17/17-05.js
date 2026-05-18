const redis = require("redis");

const CHANNEL = "channel-01";
const sub = redis.createClient();
const pub = redis.createClient();

sub.on("error", (e) => console.error("sub:", e));
pub.on("error", (e) => console.error("pub:", e));

sub.on("subscribe", (channel, count) => { 
  console.log("subscribe:", channel, "count:", count);
  pub.publish(CHANNEL, "from pub_client message 1");
  pub.publish(CHANNEL, "from pub_client message 2");
  setTimeout(() => pub.publish(CHANNEL, "from pub_client message 3"), 300);
  setTimeout(() => pub.publish(CHANNEL, "from pub_client message 4"), 600);
  setTimeout(() => {
    sub.unsubscribe(CHANNEL, () => {
      sub.quit();
      pub.quit();
    });
  }, 1000);
});

sub.on("message", (channel, message) => { 
  console.log("message:", channel, message);
});

sub.subscribe(CHANNEL);
