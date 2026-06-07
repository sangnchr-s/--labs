const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");
const express = require("express");

const PORT = 3443;
const HOST = "LAB22-GNM";
const CERTS = path.join(__dirname, "certs");

const app = express();

app.get("/", (_req, res) => {
  res.type("html").send(`
    <h1>22-01 HTTPS (GNM)</h1>
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
    console.log(`[22-01] HTTPS, порт ${PORT}, Resource GNM`);
    console.log(`Локально:  https://${HOST}:${PORT}/`);
    const ips = [];
    for (const ifaces of Object.values(os.networkInterfaces())) {
      for (const iface of ifaces || []) {
        if (iface.family === "IPv4" && !iface.internal) ips.push(iface.address);
      }
    }
    if (ips.length) {
      console.log("В LAN (в hosts укажи IP этого ПК):");
      for (const ip of ips) console.log(`  ${ip}  →  https://${HOST}:${PORT}/`);
    }
  });
