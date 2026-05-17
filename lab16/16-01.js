const http = require("http");
const fs = require("fs");
const path = require("path");
const { graphql, buildSchema } = require("graphql");
const { connectDB, resolver } = require("./16-01db");


const schema = buildSchema(
  fs.readFileSync(path.join(__dirname, "16-01.gql"), "utf8")
);

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

connectDB((err, pool) => {
  if (err) {
    console.log(err);
    return;
  }

  const server = http.createServer((req, res) => {
    if (req.method !== "POST" || req.url !== "/graphql") {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("POST /graphql");
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      let obj;
      try {
        obj = body ? JSON.parse(body) : {};
      } catch {
        sendJson(res, 400, { errors: [{ message: "Тело запроса должно быть JSON" }] });
        return;
      }

      const source = obj.query || obj.mutation; 
      if (!source || typeof source !== "string") {
        sendJson(res, 400, {
          errors: [{ message: "Укажите непустое поле query или mutation" }],
        });
        return;
      }

      graphql({
        schema, 
        source, 
        rootValue: resolver, 
        contextValue: pool, 
        variableValues: obj.variables && typeof obj.variables === "object" ? obj.variables : {},
      })
        .then((result) => { 
          if (result.data) sendJson(res, 200, result);
          else sendJson(res, 400, result);
        })
        .catch((e) => {
          console.log("graphql catch:", e);
          sendJson(res, 500, { errors: [{ message: String(e.message) }] });
        });
    });
  });

  server.listen(5001, () => {
    console.log("БД открыта. http://localhost:5001/graphql");
  });
});
