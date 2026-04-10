const { Client } = require("rpc-websockets");

const url = process.env.WS_URL || "ws://localhost:5001/";

const ws = new Client(url);

ws.on("open", () => {
  console.log("подключено к", url);
  ws.subscribe("studentListFileChanged").then(() => {
    console.log(
      "подписка на событие studentListFileChanged\n",
    );
  });
});

ws.on("studentListFileChanged", (payload) => {
  console.log(
    JSON.stringify({ type: "studentListFileChanged", ...payload }, null, 2),
  );
});


ws.on("close", () => {
  console.log("\nсоединение закрыто");
});
