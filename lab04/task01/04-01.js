const http = require("http");
const url = require("url");
const DB = require("./db").DB;

var db = new DB();

http
  .createServer((req, res) => {
    var parsedUrl = url.parse(req.url, true);

    var query = parsedUrl.query;

    if (req.method === "GET") {
      db.select((_, rows) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(rows));
      });
      return;
    }

    if (req.method === "POST") {
      var body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        var row;
        if (body) {
          row = JSON.parse(body);
        } else {
          row = null;
        }

        db.insert(row, function (_, inserted) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(inserted));
        });
      });
      return;
    }

    if (req.method === "PUT") {
      var bodyPut = "";
      req.on("data", (chunk) => {
        bodyPut += chunk;
      });
      req.on("end", () => {
        var row;
        if (bodyPut) {
          row = JSON.parse(bodyPut);
        } else {
          row = null;
        }

        db.update(row, function (_, updated) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(updated));
        });
      });
      return;
    }

    if (req.method === "DELETE") {
      var id = query.id;

      db.delete(id, (_, deleted) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(deleted));
      });
      return;
    }
  })
  .listen(5001, function () {
    console.log("serv: http://localhost:5001/api/db");
  });
