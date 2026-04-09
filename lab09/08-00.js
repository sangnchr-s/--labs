const http = require("http");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");
const X2JS = require("x2js");
const builder = require("xmlbuilder");
const multiparty = require("multiparty");


function isNumericString(s) {
  if (s === "" || s === undefined || s === null) return false;
  return !Number.isNaN(Number(s)) && String(Number(s)) === String(s).trim();
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url || "/", "http://localhost");
  const pathname = (u.pathname || "/").replace(/\/$/, "") || "/";
  const q = Object.fromEntries(u.searchParams);

  // 1
  if (req.method === "GET" && pathname === "/connection") {
    if (q.set !== undefined && q.set !== "") {
      const ms = Number(q.set);
      if (!Number.isNaN(ms) && ms >= 0) {
        server.keepAliveTimeout = ms;
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(`новое значение праметра KeepAliveTimeout = ${ms}`);
        return;
      }
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("некорректное значение set");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`текущее значение KeepAliveTimeout = ${server.keepAliveTimeout} мс`,
    );
    return;
  }

  // 2
  if (req.method === "GET" && pathname === "/headers") {
    const reqLines = Object.entries(req.headers).map(([k, v]) => {
      const value = Array.isArray(v) ? v.join(", ") : String(v);
      return `${k}: ${value}`;
    });
    res.setHeader("lab", "08-00");
    const resLines = Object.entries(res.getHeaders()).map(([k, v]) => {
      const value = Array.isArray(v) ? v.join(", ") : String(v);
      return `${k}: ${value}`;
    });
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(
      `headers req:\n${reqLines.join("\n")}\n\n` +
        `headers res:\n${resLines.join("\n")}\n`,
    );
    return;
  }

  // 3
  if (req.method === "GET" && pathname === "/parameter") {
    const x = q.x;
    const y = q.y;
    if (isNumericString(x) && isNumericString(y)) {
      const a = Number(x);
      const b = Number(y);
      const div = b === 0 ? "деление на ноль" : String(a / b);
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(
        `сумма: ${a + b}\nразность: ${a - b}\nпроизведение: ${a * b}\nчастное: ${div}`,
      );
      return;
    }
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("x и y должны быть числами");
    return;
  }

  // 4
  if (req.method === "GET" && pathname.startsWith("/parameter/")) {
    const parts = pathname.split("/");
    if (parts[1] === "parameter" && parts.length === 4) {
      const x = parts[2];
      const y = parts[3];
      if (isNumericString(x) && isNumericString(y)) {
        const a = Number(x);
        const b = Number(y);
        const div = b === 0 ? "деление на ноль" : String(a / b);
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(
          `cумма: ${a + b}\nразность: ${a - b}\nпроизведение: ${a * b}\nчастное: ${div}`,
        );
        return;
      }
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`URI запроса: ${req.url}`);
      return;
    }
  }

  // 5
  if (req.method === "GET" && pathname === "/close") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("сервер остановится через 2 секунды!");
    setTimeout(() => {
      server.close(() => process.exit(0));
    }, 2000);
    return;
  }

  // 6
  if (req.method === "GET" && pathname === "/socket") {
    const sock = req.socket;
    const clientIp = sock.remoteAddress || "";
    const clientPort = sock.remotePort;
    const serverIp = sock.localAddress || "";
    const serverPort = sock.localPort;
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(
      `клиент: ${clientIp}:${clientPort}\nсервер: ${serverIp}:${serverPort}`,
    );
    return;
  }

  // 7
  if (pathname === "/req-data") {
    if (req.method === "POST") {
      let body = "";
      const sizes = [];
      req.setEncoding("utf8");
      req.on("data", (chunk) => {
        body += chunk;
        sizes.push(chunk.length);
      });
      req.on("end", () => {
        const total = Buffer.byteLength(body, "utf8");
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(
          `число чанков: ${sizes.length}\nразмеры порций: ${sizes.join(", ")}\nвсего байт: ${total}`,
        );
      });
      return;
    }
  }

  // 8
  if (req.method === "GET" && pathname === "/resp-status") {
    const code = Number(q.code);
    const mess = q.mess != null ? String(q.mess) : "";
    res.statusCode = code;
    res.statusMessage = mess.slice(0, 200) || http.STATUS_CODES[code] || ""; 
    return res.end(`статус: ${code}\nпояснение: ${mess || res.statusMessage}`);
  }

  // 9
  if (pathname === "/formparameter") {
    if (req.method === "GET") {
      const form = /*html */ `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>форма</title>
</head>
<body>
  <form method="POST" action="/formparameter">
    <p>текст: <input type="text" name="текст" value="какой-то текст"></p>
    <p>число: <input type="number" name="число" value="67"></p>
    <p>дата: <input type="date" name="дата"></p>
    <p><label><input type="checkbox" name="галочка" value="yes"> галочка</label></p>
    <p>
      выбор:
      <label><input type="radio" name="выбор" value="да">да</label>
      <label><input type="radio" name="выбор" value="не">нет</label>
    </p>
    <p>textarea: <textarea name="area" rows="3" cols="40">многострочный текст</textarea></p>
    <p>
      <input type="submit" name="action" value="Сохранить">
      <input type="submit" name="action" value="Отправить">
    </p>
  </form>
</body>
</html>`;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(form);
      return;
    }
    if (req.method === "POST") {
      let body = "";
      req.setEncoding("utf8");
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        const data = querystring.parse(body); 
        const lines = Object.entries(data).map(([k, v]) => `${k} = ${v}`);
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`<div>${lines.join("<br>")}</div>`);
        return;
      });
      return;
    }
  }

  // 10
  if (req.method === "POST" && pathname === "/json") {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      let data;
      try {
        data = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("неверный JSON");
        return;
      }
      const x = Number(data.x ?? 0);
      const y = Number(data.y ?? 0);
      const s = String(data.s ?? "");
      const o = data.o && typeof data.o === "object" ? data.o : {}; 
      const m = Array.isArray(data.m) ? data.m : [];
      const objectValuesText = Object.values(o).map(String).join(", "); 
      const out = {
        __comment: "Ответ.Лабораторная работа 8/10",
        x_plus_y: x + y,
        Concatination_s_o: objectValuesText ? `${s}: ${objectValuesText}` : s,
        Length_m: m.length,
      };
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(out)); 
      return;
    });
    return;
  }

  // 11
  if (req.method === "POST" && pathname === "/xml") {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const x2js = new X2JS(); 
      const js = x2js.xml2js(body); 
      const reqXml = js.request;
      const requestId = String(reqXml._id);
      const xs = Array.isArray(reqXml.x) ? reqXml.x : [reqXml.x];
      const ms = Array.isArray(reqXml.m) ? reqXml.m : [reqXml.m];
      let sumX = 0;
      for (const el of xs) sumX += Number(el._value);
      let concatM = "";
      for (const el of ms) concatM += String(el._value);

      const respId = requestId;
      const root = builder
        .create("response", { version: "1.0", encoding: "UTF-8" })
        .att("id", respId) 
        .att("request", requestId);
      root.ele("sum", { element: "x", result: String(sumX) }); 
      root.ele("concat", { element: "m", result: concatM });
      const out = root.end({ pretty: true });
      res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
      res.end(out);
      return;
    });
    return;
  }

  // 12
  if (req.method === "GET" && pathname === "/files") {
    const staticDir = path.join(__dirname, "static");
    fs.readdir(staticDir, (_, names) => {
      const list = names.map(
        (n) =>
        
          /*html */ `<li><a href="/files/${n}">${n}</a></li>`,
      );
      const html =
        /*html */ `<!DOCTYPE html>
        <html>
    <head>
  <meta charset="utf-8">
  <title>файлы</title>
    </head>
    <body>
   <h1>файлы</h1>
  <ul>
    ${names.length}
    ${list.join("")}
  </ul>
    </body>
        </html>`;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    });
    return;
  }

  // 13
  if (req.method === "GET" && pathname.startsWith("/files/")) {
    const name = pathname.slice("/files/".length);

    const staticDir = path.join(__dirname, "static");
    const filePath = path.join(staticDir, name);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("файл не найден");
        return;
      }
      res.writeHead(200, { "Content-Type": "application/octet-stream" }); 
      return res.end(data);
    });
    return;
  }

// 14
  if (pathname === "/upload") {
    if (req.method === "GET") {
      const page =
        /*html */ `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Загрузка файла</title>
</head>
<body>
  <h1>Загрузка файла</h1>
  <form method="POST" action="/upload" enctype="multipart/form-data">
    <p>
      <input type="file" name="upload">
    </p>
    <p>
      <input type="submit" value="Загрузить">
    </p>
  </form>
</body>
</html>`;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(page);
      return;
    }
    if (req.method === "POST") {
      const staticDir = path.join(__dirname, "static");
      const form = new multiparty.Form({ uploadDir: staticDir }); 
    
      form.parse(req, (err, _fields, files) => {
        if (err) {
          res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Ошибка разбора формы: " + err.message);
          return;
        }
        const part = files.upload[0]; 
        const safeName = path.basename(part.originalFilename || "upload.bin");
        const finalPath = path.join(staticDir, safeName);
        fs.rename(part.path, finalPath, (renameErr) => {
          if (renameErr) {
            res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Ошибка сохранения: " + renameErr.message);
            return;
          }
          res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
          res.end(`Сохранено: ${safeName}`);
        });
      });
      return;
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Не найдено: " + pathname);
});

server.listen(5010, () => {
  console.log(`Сервер http://localhost:5010`);
});

// form data 
// websocket процедура рукопожатия вебсокет со всеми заголовками приходит запрос там такие заголовкпи ответ с заголовками 

