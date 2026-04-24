const http = require("http");
const fs = require("fs");
const path = require("path");
const sql = require("mssql");

const PORT = 5001;
const INDEX_FILE = path.join(__dirname, "index.html");
let config = {
  user: "sa",
  password: "GasLab14!Pass",
  server: "127.0.0.1",
  port: 14330,
  database: "GAS",
  pool: {
    max: 10, 
    min: 0, 
    idleTimeoutMillis: 10000,
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const pool = new sql.ConnectionPool(config); 

let sendError = (res, statusCode = 500) => {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error: "Ошибка" }));
};

let processing_result = (res, err, result) => {
  if (err) {
    console.log("processing_result error:", err.code, err.originalError?.info?.message || err.message);
    sendError(res);
  } else {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(result.recordset));
  }
};


pool.connect((err) => {
  if (err) {
    console.log("Ошибка соединения с БД:", err.code, err.message);
    return;
  }

  console.log("Соединение с БД установлено");

  http.createServer((req, res) => {

    // 1. статический файл html
    if (req.method === "GET" && req.url === "/") {
      fs.readFile(INDEX_FILE, (_, data) => {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      });
      return;
    }

    // 2. список факультетов
    if (req.method === "GET" && req.url === "/api/faculties") {
      pool.request().query(
        "select faculty, faculty_name from FACULTY order by faculty",
        (err, result) => processing_result(res, err, result)
      );
      return;
    }

    // 3. список кафедр
    if (req.method === "GET" && req.url === "/api/pulpits") {
      pool.request().query(
        "select pulpit, pulpit_name, faculty from PULPIT order by pulpit",
        (err, result) => processing_result(res, err, result)
      );
      return;
    }

    // 4. список всех учебных дисциплин
    if (req.method === "GET" && req.url === "/api/subjects") {
      pool.request().query(
        "select subject, subject_name, pulpit from SUBJECT order by subject",
        (err, result) => processing_result(res, err, result)
      );
      return;
    }

    // 5. список всех типов учебных аудиторий
    if (req.method === "GET" && req.url === "/api/auditoriumstypes") {
      pool.request().query(
        "select auditorium_type, auditorium_typename from AUDITORIUM_TYPE order by auditorium_type",
        (err, result) => processing_result(res, err, result)
      );
      return;
    }

    // 6. список всех учебных аудиторий
    if (req.method === "GET" && req.url === "/api/auditorims") {
      pool.request().query(
        "select auditorium, auditorium_name, auditorium_capacity, auditorium_type from AUDITORIUM order by auditorium",
        (err, result) => processing_result(res, err, result)
      );
      return;
    }

    // 7. добавить новый факультет
    if (req.method === "POST" && req.url === "/api/faculties") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        let data;
        try {
          data = JSON.parse(body);
        } catch (e) {
          sendError(res, 400);
          return;
        }

        let request = pool.request();
        request.input("faculty", sql.VarChar(20), data.faculty); 
        request.input("faculty_name", sql.VarChar(100), data.faculty_name);
        request.query(
          "insert FACULTY(faculty, faculty_name) output inserted.* values (@faculty, @faculty_name)",
          (err, result) => {
            if (err) {
              sendError(res);
              return;
            }
            res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(result.recordset[0]));
          }
        );
      });
      return;
    }


    // 8. добавить новую кафедру
    if (req.method === "POST" && req.url === "/api/pulpits") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        let data;
        try {
          data = JSON.parse(body);
        } catch (e) {
          sendError(res, 400);
          return;
        }

        let request = pool.request();
        request.input("pulpit", sql.VarChar(20), data.pulpit);
        request.input("pulpit_name", sql.VarChar(100), data.pulpit_name);
        request.input("faculty", sql.VarChar(20), data.faculty);
        request.query(
          "insert PULPIT(pulpit, pulpit_name, faculty) output inserted.* values (@pulpit, @pulpit_name, @faculty)",
          (err, result) => {
            if (err) {
              sendError(res);
              return;
            }

            res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(result.recordset[0]));
          }
        );
      });
      return;
    }


    // 9. добавить новую учебную дисциплину
    if (req.method === "POST" && req.url === "/api/subjects") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        let data;
        try {
          data = JSON.parse(body);
        } catch (e) {
          sendError(res, 400);
          return;
        }

        let request = pool.request();
        request.input("subject", sql.VarChar(20), data.subject);
        request.input("subject_name", sql.VarChar(100), data.subject_name);
        request.input("pulpit", sql.VarChar(20), data.pulpit);
        request.query(
          "insert SUBJECT(subject, subject_name, pulpit) output inserted.* values (@subject, @subject_name, @pulpit)",
          (err, result) => {
            if (err) {
              sendError(res);
              return;
            }

            res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(result.recordset[0]));
          }
        );
      });
      return;
    }

    // 10. добавить новый тип учебной аудитории
    if (req.method === "POST" && req.url === "/api/auditoriumstypes") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        let data;
        try {
          data = JSON.parse(body);
        } catch (e) {
          sendError(res, 400);
          return;
        }

        let request = pool.request();
        request.input("auditorium_type", sql.VarChar(20), data.auditorium_type);
        request.input("auditorium_typename", sql.VarChar(100), data.auditorium_typename);
        request.query(
          "insert AUDITORIUM_TYPE(auditorium_type, auditorium_typename) output inserted.* values (@auditorium_type, @auditorium_typename)",
          (err, result) => {
            if (err) {
              sendError(res);
              return;
            }

            res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(result.recordset[0]));
          }
        );
      });
      return;
    }

    // 11. добавить новую учебную аудиторию
    if (req.method === "POST" && req.url === "/api/auditoriums") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        let data;
        try {
          data = JSON.parse(body);
        } catch (e) {
          sendError(res, 400);
          return;
        }

        let request = pool.request();
        request.input("auditorium", sql.VarChar(20), data.auditorium);
        request.input("auditorium_name", sql.VarChar(100), data.auditorium_name);
        request.input("auditorium_capacity", sql.Int, Number(data.auditorium_capacity));
        request.input("auditorium_type", sql.VarChar(20), data.auditorium_type);
        request.query(
          "insert AUDITORIUM(auditorium, auditorium_name, auditorium_capacity, auditorium_type) output inserted.* values (@auditorium, @auditorium_name, @auditorium_capacity, @auditorium_type)",
          (err, result) => {
            if (err) {
              sendError(res);
              return;
            }

            res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(result.recordset[0]));
          }
        );
      });
      return;
    }

    // 12. корректировать информацию о факультете
    if (req.method === "PUT" && req.url === "/api/faculties") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        let data;
        try {
          data = JSON.parse(body);
        } catch (e) {
          sendError(res, 400);
          return;
        }

        let request = pool.request();
        request.input("faculty", sql.VarChar(20), data.faculty);
        request.input("faculty_name", sql.VarChar(100), data.faculty_name);
        request.query(
          "update FACULTY set faculty_name = @faculty_name output inserted.* where faculty = @faculty",
          (err, result) => {
            if (err) {
              sendError(res);
              return;
            }
            if (!result.recordset[0]) {
              sendError(res, 404);
              return;
            }

            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(result.recordset[0]));
          }
        );
      });
      return;
    }

    // 13. корректировать информацию о кафедре
    if (req.method === "PUT" && req.url === "/api/pulpits") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        let data;
        try {
          data = JSON.parse(body);
        } catch (e) {
          sendError(res, 400);
          return;
        }

        let request = pool.request();
        request.input("pulpit", sql.VarChar(20), data.pulpit);
        request.input("pulpit_name", sql.VarChar(100), data.pulpit_name);
        request.input("faculty", sql.VarChar(20), data.faculty);
        request.query(
          "update PULPIT set pulpit_name = @pulpit_name, faculty = @faculty output inserted.* where pulpit = @pulpit",
          (err, result) => {
            if (err) {
              sendError(res);
              return;
            }
            if (!result.recordset[0]) {
              sendError(res, 404);
              return;
            }

            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(result.recordset[0]));
          }
        );
      });
      return;
    }

    // 14. корректировать информацию об учебной дисциплине
    if (req.method === "PUT" && req.url === "/api/subjects") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        let data;
        try {
          data = JSON.parse(body);
        } catch (e) {
          sendError(res, 400);
          return;
        }

        let request = pool.request();
        request.input("subject", sql.VarChar(20), data.subject);
        request.input("subject_name", sql.VarChar(100), data.subject_name);
        request.input("pulpit", sql.VarChar(20), data.pulpit);
        request.query(
          "update SUBJECT set subject_name = @subject_name, pulpit = @pulpit output inserted.* where subject = @subject",
          (err, result) => {
            if (err) {
              sendError(res);
              return;
            }
            if (!result.recordset[0]) {
              sendError(res, 404);
              return;
            }

            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(result.recordset[0]));
          }
        );
      });
      return;
    }

    // 15. корректировать информацию о типе учебной аудитории
    if (req.method === "PUT" && req.url === "/api/auditoriumstypes") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        let data;
        try {
          data = JSON.parse(body);
        } catch (e) {
          sendError(res, 400);
          return;
        }

        let request = pool.request();
        request.input("auditorium_type", sql.VarChar(20), data.auditorium_type);
        request.input("auditorium_typename", sql.VarChar(100), data.auditorium_typename);
        request.query(
          "update AUDITORIUM_TYPE set auditorium_typename = @auditorium_typename output inserted.* where auditorium_type = @auditorium_type",
          (err, result) => {
            if (err) {
              sendError(res);
              return;
            }
            if (!result.recordset[0]) {
              sendError(res, 404);
              return;
            }

            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(result.recordset[0]));
          }
        );
      });
      return;
    }


    // 16. корректировать информацию об учебной аудитории
    if (req.method === "PUT" && req.url === "/auditorims") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        let data;
        try {
          data = JSON.parse(body);
        } catch (e) {
          sendError(res, 400);
          return;
        }

        let request = pool.request();
        request.input("auditorium", sql.VarChar(20), data.auditorium);
        request.input("auditorium_name", sql.VarChar(100), data.auditorium_name);
        request.input("auditorium_capacity", sql.Int, Number(data.auditorium_capacity));
        request.input("auditorium_type", sql.VarChar(20), data.auditorium_type);
        request.query(
          "update AUDITORIUM set auditorium_name = @auditorium_name, auditorium_capacity = @auditorium_capacity, auditorium_type = @auditorium_type output inserted.* where auditorium = @auditorium",
          (err, result) => {
            if (err) {
              sendError(res);
              return;
            }
            if (!result.recordset[0]) {
              sendError(res, 404);
              return;
            }

            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(result.recordset[0]));
          }
        );
      });
      return;
    }

    // 17. удалить факультет по коду
    let facultyMatch = req.url.match(/^\/api\/faculties\/([^/]+)$/);
    if (req.method === "DELETE" && facultyMatch) {
      let faculty = decodeURIComponent(facultyMatch[1]);
      if (!faculty) {
        sendError(res, 400);
        return;
      }
      let request = pool.request();
      request.input("faculty", sql.VarChar(20), faculty);
      request.query("delete FACULTY output deleted.* where faculty = @faculty", (err, result) => {
        if (err) {
          sendError(res);
          return;
        }
        if (!result.recordset[0]) {
          sendError(res, 404);
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(result.recordset[0]));
      });
      return;
    }

    // 18. удалить кафедру по коду
    let pulpitMatch = req.url.match(/^\/api\/pulpits\/([^/]+)$/);
    if (req.method === "DELETE" && pulpitMatch) {
      let pulpit = decodeURIComponent(pulpitMatch[1]);
      if (!pulpit) {
        sendError(res, 400);
        return;
      }
      let request = pool.request();
      request.input("pulpit", sql.VarChar(20), pulpit);
      request.query("delete PULPIT output deleted.* where pulpit = @pulpit", (err, result) => {
        if (err) {
          sendError(res);
          return;
        }
        if (!result.recordset[0]) {
          sendError(res, 404);
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(result.recordset[0]));
      });
      return;
    }

    // 19. удалить дисциплину по коду
    let subjectMatch = req.url.match(/^\/api\/subjects\/([^/]+)$/);
    if (req.method === "DELETE" && subjectMatch) {
      let subject = decodeURIComponent(subjectMatch[1]);
      if (!subject) {
        sendError(res, 400);
        return;
      }
      let request = pool.request();
      request.input("subject", sql.VarChar(20), subject);
      request.query("delete SUBJECT output deleted.* where subject = @subject", (err, result) => {
        if (err) {
          sendError(res);
          return;
        }
        if (!result.recordset[0]) {
          sendError(res, 404);
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(result.recordset[0]));
      });
      return;
    }

    // 20. удалить тип аудитории по коду
    let auditoriumTypeMatch = req.url.match(/^\/api\/auditoriums?types\/([^/]+)$/);
    if (req.method === "DELETE" && auditoriumTypeMatch) {
      let auditorium_type = decodeURIComponent(auditoriumTypeMatch[1]);
      if (!auditorium_type) {
        sendError(res, 400);
        return;
      }
      let request = pool.request();
      request.input("auditorium_type", sql.VarChar(20), auditorium_type);
      request.query("delete AUDITORIUM_TYPE output deleted.* where auditorium_type = @auditorium_type", (err, result) => {
        if (err) {
          sendError(res);
          return;
        }
        if (!result.recordset[0]) {
          sendError(res, 404);
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(result.recordset[0]));
      });
      return;
    }

    // 21. удалить аудиторию по коду
    let auditoriumMatch = req.url.match(/^\/api\/auditorims\/([^/]+)$/);
    if (req.method === "DELETE" && auditoriumMatch) {
      let auditorium = decodeURIComponent(auditoriumMatch[1]);
      if (!auditorium) {
        sendError(res, 400);
        return;
      }
      let request = pool.request();
      request.input("auditorium", sql.VarChar(20), auditorium);
      request.query("delete AUDITORIUM output deleted.* where auditorium = @auditorium", (err, result) => {
        if (err) {
          sendError(res);
          return;
        }
        if (!result.recordset[0]) {
          sendError(res, 404);
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(result.recordset[0]));
      });
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }).listen(PORT, () => {
    console.log(`HTTP-сервер запущен: http://localhost:${PORT}/`);
  });
});
