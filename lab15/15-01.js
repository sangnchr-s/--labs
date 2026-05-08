const http = require('http');
const MongoClient = require('mongodb').MongoClient;

const DB_NAME = 'BSTU';
const FACULTY_COLLECTION = 'faculty';
const PULPIT_COLLECTION = 'pulpit';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Set MONGODB_URI before running the server.');
  process.exit(1);
}

const client = new MongoClient(uri);

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(body));
}

function dbErr(res, err) {
  let message;
  if (typeof err === 'string') {
    message = err;
  } else {
    message = String(err);
  }
  console.error(err);
  sendJson(res, 500, { error: 'Ошибка базы данных', message });
}

function reqErr(res) {
  return (err) => sendJson(res, 400, { error: 'Ошибка', message: String(err.message) });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  // GET /api/faculties
  if (req.method === 'GET' && url.pathname === '/api/faculties') {
    client
    .db(DB_NAME)
    .collection(FACULTY_COLLECTION)
    .find({})
    .toArray()
      .then(
        (docs) => {
          sendJson(res, 200, docs);
        },
        (err) => dbErr(res, err)
      );
    return;
  }

  // GET /api/pulpits
  if (req.method === 'GET' && url.pathname === '/api/pulpits') {
    client
    .db(DB_NAME)
    .collection(PULPIT_COLLECTION)
    .find({})
    .toArray()
      .then(
        (docs) => {
          sendJson(res, 200, docs);
        },
        (err) => dbErr(res, err)
      );
    return;
  }

  // POST /api/faculties
  if (req.method === 'POST' && url.pathname === '/api/faculties') {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      let doc;
      try {
        doc = raw.length ? JSON.parse(raw) : {};
      } catch (e) {
        sendJson(res, 400, { error: 'Некорректный JSON', message: String(e.message) });
        return;
      }
      const { faculty, faculty_name } = doc;
      if (typeof faculty !== 'string' || !faculty.trim()) {
        sendJson(res, 400, { error: 'Нужно поле faculty' });
        return;
      }
      if (typeof faculty_name !== 'string' || !faculty_name.trim()) {
        sendJson(res, 400, { error: 'Нужно поле faculty_name' });
        return;
      }
      const row = { faculty: faculty.trim(), faculty_name: faculty_name.trim() };
      client
        .db(DB_NAME)
        .collection(FACULTY_COLLECTION)
        .insertOne(row) 
        .then(
          (result) => {
            return client
              .db(DB_NAME)
              .collection(FACULTY_COLLECTION)
              .findOne({ _id: result.insertedId })
              .then(
                (inserted) => {
                  if (!inserted) {
                    dbErr(res, 'Не удалось прочитать созданную запись');
                    return;
                  }
                  sendJson(res, 201, inserted);
                },
                (err) => dbErr(res, err)
              );
          },
          (err) => dbErr(res, err)
        );
    });
    req.on('error', reqErr(res));
    return;
  }

  // POST /api/pulpits
  if (req.method === 'POST' && url.pathname === '/api/pulpits') {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      let doc;
      try {
        doc = raw.length ? JSON.parse(raw) : {};
      } catch (e) {
        sendJson(res, 400, { error: 'Некорректный JSON', message: String(e.message) });
        return;
      }
      const { pulpit, pulpit_name, faculty } = doc;
      if (typeof faculty !== 'string' || !faculty.trim()) {
        sendJson(res, 400, {
          error: 'Нужно поле faculty',
          message: 'Укажите код факультета',
        });
        return;
      }
      if (typeof pulpit !== 'string' || !pulpit.trim()) {
        sendJson(res, 400, { error: 'Нужно поле pulpit' });
        return;
      }
      if (typeof pulpit_name !== 'string' || !pulpit_name.trim()) {
        sendJson(res, 400, { error: 'Нужно поле pulpit_name' });
        return;
      }
      client
        .db(DB_NAME)
        .collection(FACULTY_COLLECTION)
        .findOne({ faculty: faculty.trim() })
        .then(
          (facDoc) => {
            if (!facDoc) {
              sendJson(res, 400, {
                error: 'Факультет не найден',
                message: `Нет факультета с кодом «${faculty.trim()}». Создайте факультет или укажите существующий код в поле faculty.`,
                faculty: faculty.trim(),
              });
              return;
            }
            const row = {
              pulpit: pulpit.trim(),
              pulpit_name: pulpit_name.trim(),
              faculty: faculty.trim(),
            };
            client
              .db(DB_NAME)
              .collection(PULPIT_COLLECTION)
              .insertOne(row)
              .then(
                (result) => {
                  return client
                    .db(DB_NAME)
                    .collection(PULPIT_COLLECTION)
                    .findOne({ _id: result.insertedId })
                    .then(
                      (inserted) => {
                        if (!inserted) {
                          dbErr(res, 'Не удалось прочитать созданную запись');
                          return;
                        }
                        sendJson(res, 201, inserted);
                      },
                      (err) => dbErr(res, err)
                    );
                },
                (err) => dbErr(res, err)
              );
          },
          (err) => dbErr(res, err)
        );
    });
    req.on('error', reqErr(res));
    return;
  }

  // PUT /api/faculties
  if (req.method === 'PUT' && url.pathname === '/api/faculties') {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      let doc;
      try {
        doc = raw.length ? JSON.parse(raw) : {};
      } catch (e) {
        sendJson(res, 400, { error: 'Некорректный JSON', message: String(e.message) });
        return;
      }
      if (typeof doc.faculty !== 'string' || !doc.faculty.trim()) {
        sendJson(res, 400, {
          error: 'Нужно поле faculty',
          message: 'Код факультета, запись которого нужно изменить (например "ИТ").',
        });
        return;
      }
      const $set = {}; 
      if (typeof doc.faculty_name === 'string' && doc.faculty_name.trim()) {
        $set.faculty_name = doc.faculty_name.trim(); 
      }
      if (Object.keys($set).length === 0) {
        sendJson(res, 400, {
          error: 'Нечего обновлять',
          message: 'Укажите faculty_name – новое полное название факультета.',
        });
        return;
      }
      client
        .db(DB_NAME)
        .collection(FACULTY_COLLECTION)
        .updateOne({ faculty: doc.faculty.trim() }, { $set })
        .then(
          (result) => {
            if (result.matchedCount === 0) {
              sendJson(res, 404, { error: 'Факультет не найден', faculty: doc.faculty.trim() });
              return null;
            }
            return client
              .db(DB_NAME)
              .collection(FACULTY_COLLECTION)
              .findOne({ faculty: doc.faculty.trim() });
          },
          (err) => dbErr(res, err)
        )
        .then(
          (updated) => {
            if (!updated) return;
            sendJson(res, 200, updated);
          },
          (err) => dbErr(res, err)
        );
    });
    req.on('error', reqErr(res));
    return;
  }

  // PUT /api/pulpits
  if (req.method === 'PUT' && url.pathname === '/api/pulpits') {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      let doc;
      try {
        doc = raw.length ? JSON.parse(raw) : {};
      } catch (e) {
        sendJson(res, 400, { error: 'Некорректный JSON', message: String(e.message) });
        return;
      }
      if (typeof doc.pulpit !== 'string' || !doc.pulpit.trim()) {
        sendJson(res, 400, {
          error: 'Нужно поле pulpit',
        });
        return;
      }
      const $set = {};
      if (typeof doc.pulpit_name === 'string' && doc.pulpit_name.trim()) {
        $set.pulpit_name = doc.pulpit_name.trim();
      }
      if (Object.keys($set).length === 0) {
        sendJson(res, 400, {
          error: 'Нечего обновлять',
          message: 'Укажите pulpit_name — новое значение.',
        });
        return;
      }
      const filter = { pulpit: doc.pulpit.trim() }; 
      const runUpdate = () => {
        client
          .db(DB_NAME)
          .collection(PULPIT_COLLECTION)
          .updateOne(filter, { $set })
          .then(
            (result) => {
              if (result.matchedCount === 0) {
                sendJson(res, 404, { error: 'Кафедра не найдена', pulpit: filter.pulpit });
                return null;
              }
              return client
                .db(DB_NAME)
                .collection(PULPIT_COLLECTION)
                .findOne({ pulpit: filter.pulpit });
            },
            (err) => dbErr(res, err)
          )
          .then(
            (updated) => {
              if (!updated) return;
              sendJson(res, 200, updated);
            },
            (err) => dbErr(res, err)
          );
      };
      runUpdate();
    });
    req.on('error', reqErr(res));
    return;
  }

  // DELETE /api/faculties/xyz
  const delFacultyMatch = url.pathname.match(/^\/api\/faculties\/(.+)$/);
  if (req.method === 'DELETE' && delFacultyMatch) {
    const code = decodeURIComponent(delFacultyMatch[1]);
    const coll = client.db(DB_NAME).collection(FACULTY_COLLECTION);
    coll
      .findOne({ faculty: code })
      .then(
        (existing) => {
          if (!existing) {
            sendJson(res, 404, { error: 'Факультет не найден', faculty: code });
            return null;
          }
          return coll.deleteOne({ faculty: code }).then(() => existing);
        },
        (err) => dbErr(res, err)
      )
      .then(
        (deleted) => {
          if (!deleted) return;
          sendJson(res, 200, deleted);
        },
        (err) => dbErr(res, err)
      );
    return;
  }

  // DELETE /api/pulpits/xyz
  const delPulpitMatch = url.pathname.match(/^\/api\/pulpits\/(.+)$/);
  if (req.method === 'DELETE' && delPulpitMatch) {
    const code = decodeURIComponent(delPulpitMatch[1]);
    const coll = client.db(DB_NAME).collection(PULPIT_COLLECTION);
    coll
      .findOne({ pulpit: code })
      .then(
        (existing) => {
          if (!existing) {
            sendJson(res, 404, { error: 'Кафедра не найдена', pulpit: code });
            return null;
          }
          return coll.deleteOne({ pulpit: code }).then(() => existing);
        },
        (err) => dbErr(res, err)
      )
      .then(
        (deleted) => {
          if (!deleted) return;
          sendJson(res, 200, deleted);
        },
        (err) => dbErr(res, err)
      );
    return;
  }

  sendJson(res, 404, {
    error: 'Маршрут не найден',
    method: req.method,
    path: url.pathname,
  });
});

client.connect().then(
  () => {
    console.log('MongoDB: connect succesfull');
    server.listen(5001, () => {
      console.log('HTTP-сервер: http://localhost:5001');
    });
  }
);
