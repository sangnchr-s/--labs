var http = require("http");
var url = require("url");
var DB = require("./db").DB;

var db = new DB();

var stat = {
  collecting: false, 
  start: null,
  finish: null,
  requestCount: 0,
  commitCount: 0,
};

var statTimer, commitInterval, shutdownTimer; 


function fmt(d) {
  if (!d) return "";
  var z = function (n) {
    return (n < 10 ? "0" : "") + n; 
  };
  return (
    d.getFullYear() +
    "-" +
    z(d.getMonth() + 1) + 
    "-" +
    z(d.getDate()) +
    " " +
    z(d.getHours()) +
    ":" +
    z(d.getMinutes()) +
    ":" +
    z(d.getSeconds())
  );
}

db.on("COMMIT", function () {
  if (stat.collecting) stat.commitCount++;
});

var server = http.createServer(function (req, res) {

    var parsedUrl = url.parse(req.url, true);
    var pathname = parsedUrl.pathname;
    var query = parsedUrl.query;

    if (req.method === "GET" && pathname === "/api/ss") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          start: fmt(stat.start),
          finish: fmt(stat.finish),
          request: stat.requestCount,
          commit: stat.commitCount,
        }),
      );
      return;
    }

    if (req.method === "GET") {
      if (stat.collecting) stat.requestCount++;
      db.select(function (_, rows) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(rows));
      });
      return;
    }

    if (req.method === "POST") {
      if (stat.collecting) stat.requestCount++;
      var body = "";
      req.on("data", function (chunk) {
        body += chunk;
      });
      req.on("end", function () {
        var row = body ? JSON.parse(body) : null;
        db.insert(row, function (_, inserted) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(inserted));
        });
      });
      return;
    }

    if (req.method === "PUT") {
      if (stat.collecting) stat.requestCount++;
      var bodyPut = "";
      req.on("data", function (chunk) {
        bodyPut += chunk;
      });
      req.on("end", function () {
        var row = bodyPut ? JSON.parse(bodyPut) : null;
        db.update(row, function (_, updated) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(updated));
        });
      });
      return;
    }

    if (req.method === "DELETE") {
      if (stat.collecting) stat.requestCount++;
      var id = query.id;
      db.delete(id, function (_, deleted) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(deleted));
      });
      return;
    }

    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "ne tot method" }));
  })
  .listen(5001, function () {
    console.log("05-01: http://localhost:" + 5001 + "/");
  });

function handleLine(line) {
  var parts = line.trim().split(/\s+/); 
  var cmd = (parts[0] || "").toLowerCase(); 
  var arg = parts[1]; 

  if (cmd === "sd") {
    clearTimeout(shutdownTimer);
    shutdownTimer = null; 
    if (arg !== undefined) {  
      var x = parseInt(arg, 10);
      if (!isNaN(x) && x >= 0) { 
        shutdownTimer = setTimeout(function () {
          server.close();
          process.exit(0);
        }, x * 1000); 
        shutdownTimer.ref();
      }
    }
    return;
  }
  if (cmd === "sc") {
    clearInterval(commitInterval);
    commitInterval = null;
    if (arg !== undefined) {
      var x = parseInt(arg, 10);
      if (!isNaN(x) && x > 0) {
        commitInterval = setInterval(function () {
          db.commit();
          console.log("commit");
        }, x * 1000);
        commitInterval.unref();
        console.log("sc: commit каждые " + x + " сек");
      }
    }
    return;
  }
  if (cmd === "ss") {
    clearTimeout(statTimer);
    statTimer = null;
    stat.collecting = false;
    if (stat.start !== null) stat.finish = new Date();
    if (arg !== undefined) {
      var x = parseInt(arg, 10);
      if (!isNaN(x) && x > 0) {
        stat.collecting = true;
        stat.start = new Date();
        stat.finish = null;
        stat.requestCount = 0;
        stat.commitCount = 0;
        statTimer = setTimeout(function () {
          stat.collecting = false;
          stat.finish = new Date();
          statTimer = null;
          console.log("ss: сбор завершён");
        }, x * 1000);
        statTimer.unref();
        console.log("ss: сбор на " + x + " сек");
      }
    }
    return;
  }
}

process.stdin.setEncoding("utf8");
var inputBuffer = ""; 
process.stdin.on("readable", function () {
  var chunk; 
  while ((chunk = process.stdin.read()) !== null) { 
    inputBuffer += chunk;
    var lines = inputBuffer.split("\n"); 
    inputBuffer = lines.pop(); 
    for (var i = 0; i < lines.length; i++) {
      handleLine(lines[i]); 
    }
  }
});


// setInterval setTimeout - функции, которые позволяют нам отложить время выполнения
// setTimeout откладывает выполнение функции на какое-то кол-во времени потом. ее оодин раз выполняет и все
// setInterval - позволяет выполнять функцию через какое то время каждый раз 


// ref unref управляют тем, должен ли таймер(setTimeout, setInterval) держать процесс активным
// unref позволяет завершить программу даже если таймер еще активен 
// ref работает наоборот возвращает таймеру способность удерживать процесс активным 