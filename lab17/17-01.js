// brew services stop redis
// brew services start redis

const redis = require("redis");

const client = redis.createClient();

client.on("connect", () => {
  console.log("connect: TCP-соединение открылось");
});

client.on("ready", () => { 
  console.log("ready: соединение установлено, можно отправлять команды");
  client.ping((err, reply) => {
    if (err) {
      console.error("Ошибка PING:", err.message);
      client.quit();
      return;
    }
    console.log("PING успешен, ответ сервера:", reply);
    client.quit();
  });
});

client.on("error", (err) => {
  console.error("Ошибка клиента Redis:", err.message);
});

client.on("end", () => {
  console.log("end: соединение закрыто");
});
