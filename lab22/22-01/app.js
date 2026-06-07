const fs = require("fs");
const https = require("https");
const path = require("path");
const express = require("express");

const PORT = 3443;
const ABC = process.argv[2] || "GAS";
const HOST = `LAB22-${ABC}`;
const CERTS = path.join(__dirname, "certs");

const app = express();

app.get("/", (_req, res) => {
  res.type("html").send(`
    <h1>22-01 HTTPS (${ABC})</h1>
    <p>GET / — OK</p>
    <p><a href="/resource">/resource</a></p>
  `);
});

app.get("/resource", (_req, res) => {
  res.send("RESOURCE");
});

app.use((_req, res) => {
  res.status(404).send("404 Not Found");
});

const keyPath = path.join(CERTS, "server.key");
const certPath = path.join(CERTS, "server.crt");

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error("Нет сертификатов в 22-01/certs/");
  console.error("Нужны: server.key, server.crt (и ca.crt для импорта в ОС)");
  process.exit(1);
}

https
  .createServer(
    {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    },
    app
  )
  .listen(PORT, () => {
    console.log(`[22-01] HTTPS, порт ${PORT}, Resource ${ABC}`);
    console.log(`Локально:  https://${HOST}:${PORT}/`);
  });
