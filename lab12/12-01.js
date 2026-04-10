// 22 лаба сертификаты показывать в паре есть ресурс и есть тот кто выдает показываем что есть сертефикат семена и у семена есть сертефикат егора 
// 1 запрашифает второй генерирует показывается в паре если не в паре то на виртуалке 
// есть процедура рукопожатия и с ней на пк выполняем 
// есть туториал где-то 
// 


const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server: RPCServer } = require("rpc-websockets");

const STUDENTS_FILE = path.join(__dirname, "StudentList.json");

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;

  const jsonHeader = { "Content-Type": "application/json; charset=utf-8" };

  if (pathname === "/" && req.method === "GET") {
    fs.readFile(STUDENTS_FILE, "utf8", (_, data) => {
      res.writeHead(200, jsonHeader);
      res.end(data);
    });
    return;
  }

  if (req.method === "GET" && /^\/\d+$/.test(pathname)) {
    const id = Number(pathname.slice(1));
    fs.readFile(STUDENTS_FILE, "utf8", (_, raw) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      const students = JSON.parse(raw);
      const student = students.find((s) => s.id === id);
      if (student) {
        res.writeHead(200);
        res.end(JSON.stringify(student));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "студент с таким id не найден" }));
      }
    });
    return;
  }

  if (pathname === "/" && req.method === "POST") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      let newStudent;
      try {
        newStudent = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Некорректный JSON" }));
        return;
      }
      fs.readFile(STUDENTS_FILE, "utf8", (_, raw) => {
        const students = JSON.parse(raw);
        if (students.some((s) => s.id === newStudent.id)) {
          res.writeHead(409);
          res.end(JSON.stringify({ error: "студент с таким id уже существует" }));
          return;
        }
        students.push(newStudent);
        fs.writeFile(
          STUDENTS_FILE,
          JSON.stringify(students, null, 2) + "\n",
          "utf8",
          () => {
            res.writeHead(201);
            res.end(JSON.stringify(newStudent));
          },
        );
      });
    });
    return;
  }

  if (pathname === "/" && req.method === "PUT") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      let student;
      try {
        student = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Некорректный JSON" }));
        return;
      }
      fs.readFile(STUDENTS_FILE, "utf8", (_, raw) => {
        const students = JSON.parse(raw);
        const i = students.findIndex((s) => s.id === student.id);
        if (i === -1) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: "студент с таким id не найден" }));
          return;
        }
        students[i] = student;
        fs.writeFile(
          STUDENTS_FILE,
          JSON.stringify(students, null, 2) + "\n",
          "utf8",
          () => {
            res.writeHead(200);
            res.end(JSON.stringify(student));
          }
        );
      });
    });
    return;
  }

  if (req.method === "DELETE" && /^\/\d+$/.test(pathname)) {
    const id = Number(pathname.slice(1));
    fs.readFile(STUDENTS_FILE, "utf8", (_, raw) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      const students = JSON.parse(raw);
      const i = students.findIndex((s) => s.id === id);
      if (i === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "студент с таким id не найден" }));
        return;
      }
      const removed = students.splice(i, 1)[0];
      fs.writeFile(
        STUDENTS_FILE,
        JSON.stringify(students, null, 2) + "\n",
        "utf8",
        () => {
          res.writeHead(200);
          res.end(JSON.stringify(removed));
        }
      );
    });
    return;
  }

  if (req.method === "POST" && pathname === "/backup")
    {
    req.on("data", () => {});
    req.on("end", () => {
      setTimeout(() => {
        const pad = (n) => String(n).padStart(2, "0"); 
        const d = new Date();
        const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
        const dest = path.join(__dirname, `${stamp}_StudentList.json`);
        const copyName = `${stamp}_StudentList.json`;
        fs.copyFile(STUDENTS_FILE, dest, () => {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.writeHead(200);
          res.end(JSON.stringify({ file: copyName }));
        });
      }, 2000);
    });
    return;
  }

  if (req.method === "DELETE" && /^\/backup\/\d{8}$/.test(pathname)) {
    const cutoff = pathname.match(/^\/backup\/(\d{8})$/)[1];
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    fs.readdir(__dirname, (_, files) => { 
      const toUnlink = []; 
      for (const file of files) { 
        const fm = file.match(/^(\d+)_StudentList\.json$/);
        // fm = [
        // "20260401123045_StudentList.json",
        // "20260401123045"]
        if (fm) {
          const stamp = fm[1];
          if (stamp.length >= 8) {
            const fileDate = stamp.slice(0, 8);
            if (fileDate < cutoff) {
              toUnlink.push(file);
            }
          }
        }
      }
      if (toUnlink.length === 0) {
        res.writeHead(200);
        res.end(JSON.stringify({ deleted: [] }));
        return;
      }
      const deleted = []; 
      let pending = toUnlink.length;
      for (const file of toUnlink) {
        fs.unlink(path.join(__dirname, file), (uErr) => {
          if (!uErr) deleted.push(file);
          pending -= 1;
          if (pending === 0) {
            res.writeHead(200);
            res.end(JSON.stringify({ deleted }));
          }
        });
      }
    });
    return;
  }

  if (req.method === "GET" && (pathname === "/backup" || pathname === "/backup/")
  ) {
    fs.readdir(__dirname, (err, files) => {
      if (err) {
        res.writeHead(500, jsonHeader);
        res.end(JSON.stringify({ error: "Не удалось прочитать каталог" }));
        return;
      }
      const copies = files
        .filter((f) => /^\d+_StudentList\.json$/.test(f))
        .sort();
      res.writeHead(200, jsonHeader);
      res.end(JSON.stringify(copies));
    });
    return;
  }

  res.writeHead(404, jsonHeader);
  res.end(JSON.stringify({ error: "Не найдено" }));
});

const rpcServer = new RPCServer({ server });

rpcServer.event("studentListFileChanged");

function notifyStudentListFileChanged(eventType, filename) {
  rpcServer.emit("studentListFileChanged", {
    changes: [{ fsEvent: eventType, file: filename }],
    at: new Date().toISOString(),
  });
}

fs.watch(__dirname, (eventType, filename) => {
  if (filename == null) return;
  const name = Buffer.isBuffer(filename)
    ? filename.toString("utf8")
    : filename;
  if (!/^\d+_StudentList\.json$/.test(name)) return;
  notifyStudentListFileChanged(eventType, name);
});

server.listen(5001, () => {
  console.log("12-01: http://localhost:5001/");
  console.log("WebSocket: ws://localhost:5001/");
});
