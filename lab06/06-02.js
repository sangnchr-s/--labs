const http = require("http");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", 
  port: 465,
  secure: true,  
  auth: {
    user: "sangnchr@gmail.com",
    pass: "drmc wbgl aczq fnuf",
  },
});

const html = /* html */ `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>06-02</title>
</head>
<body>
  <form method="POST" action="/send">
    <p>Отправитель: <input name="from" type="email" required></p>
    <p>Получатель: <input name="to" type="email" required></p>
    <p>Сообщение:</p>
    <p><textarea name="message" rows="8" cols="60" required></textarea></p>
    <button type="submit">Отправить</button>
  </form>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html;" });
    res.end(html);
    return;
  }

  if (req.method === "POST" && req.url === "/send") { 
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const params = new URLSearchParams(body); // from=sangnchr@gmail.com&to=b@mail.com&message=hello
      const from = params.get("from") || ""; 
      const to = params.get("to") || "";
      const message = params.get("message") || "";

      transporter
        .sendMail({
          from,
          to,
          subject: "06-02 message",
          text: message,
        })
        .then(() => {
          res.writeHead(200, { "Content-Type": "text/plain;" });
          res.end("ok");
        })
        .catch(() => {
          res.writeHead(500, { "Content-Type": "text/plain;" });
          res.end("err");
        });
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain;" });
  res.end("not found");
});

server.listen(5001, () => {
  console.log("Server is running: http://localhost:5001/");
});