const { Sequelize } = require('sequelize');
const http = require('http');
const fs = require('fs');
const path = require('path');

const sequelize = new Sequelize('GAS', 'gas_user', 'GasPass!2026', { 
  host: 'localhost',
  port: 1433,
  dialect: 'mssql',
  pool: {
    max: 10,
    min: 0,
    idle: 10000,
  },
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  },
});


const Faculty = sequelize.define('Faculty', {
  FACULTY: {
    type: Sequelize.STRING, 
    allowNull: false, 
    primaryKey: true, 
  },
  FACULTY_NAME: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, {
  tableName: 'FACULTY', 
  timestamps: false,
});

const Pulpit = sequelize.define('Pulpit', {
  PULPIT: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  PULPIT_NAME: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  FACULTY: {
    type: Sequelize.STRING,
    allowNull: false,
    references: {
      model: Faculty,
      key: 'FACULTY',
    },
  },
}, {
  tableName: 'PULPIT',
  timestamps: false,
});

const Teacher = sequelize.define('Teacher', {
  TEACHER: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  TEACHER_NAME: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  PULPIT: {
    type: Sequelize.STRING,
    allowNull: false,
    references: {
      model: Pulpit,
      key: 'PULPIT',
    },
  },
}, {
  tableName: 'TEACHER',
  timestamps: false,
});

const Subject = sequelize.define('Subject', {
  SUBJECT: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  SUBJECT_NAME: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  PULPIT: {
    type: Sequelize.STRING,
    allowNull: false,
    references: {
      model: Pulpit,
      key: 'PULPIT',
    },
  },
}, {
  tableName: 'SUBJECT',
  timestamps: false,
});

const AuditoriumType = sequelize.define('AuditoriumType', {
  AUDITORIUM_TYPE: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  AUDITORIUM_TYPENAME: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, {
  tableName: 'AUDITORIUM_TYPE',
  timestamps: false,
});

const Auditorium = sequelize.define('Auditorium', {
  AUDITORIUM: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  AUDITORIUM_NAME: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  AUDITORIUM_CAPACITY: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  AUDITORIUM_TYPE: {
    type: Sequelize.STRING,
    allowNull: false,
    references: {
      model: AuditoriumType,
      key: 'AUDITORIUM_TYPE',
    },
  },
}, {
  tableName: 'AUDITORIUM',
  timestamps: false,
});


Faculty.hasMany(Pulpit, { foreignKey: 'FACULTY' });
Pulpit.belongsTo(Faculty, { foreignKey: 'FACULTY' });

Pulpit.hasMany(Teacher, { foreignKey: 'PULPIT' });
Teacher.belongsTo(Pulpit, { foreignKey: 'PULPIT' });

Pulpit.hasMany(Subject, { foreignKey: 'PULPIT' });
Subject.belongsTo(Pulpit, { foreignKey: 'PULPIT' });

AuditoriumType.hasMany(Auditorium, { foreignKey: 'AUDITORIUM_TYPE' });
Auditorium.belongsTo(AuditoriumType, { foreignKey: 'AUDITORIUM_TYPE' });

function sendJson(response, promise) {
  promise
    .then((data) => {
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify(data));
    })
    .catch((error) => {
      response.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ error: error.message }));
    });
}

function readJson(request, callback) {
  let body = '';

  request.on('data', (chunk) => {
    body += chunk;
  });

  request.on('end', () => {
    try {
      callback(null, JSON.parse(body));
    } catch (error) {
      callback(error);
    }
  });
}

function createRecord(request, response, model) {
  readJson(request, (error, data) => {
    if (error) {
      response.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ error: 'Некорректный JSON' }));
      return;
    }

    model.create(data)
      .then((record) => {
        response.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify(record));
      })
      .catch((createError) => {
        response.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify({ error: createError.message }));
      });
  });
}

function updateRecord(request, response, model, keyName) {
  readJson(request, (error, data) => {
    if (error) {
      response.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ error: 'Некорректный JSON' }));
      return;
    }

    if (!data[keyName]) {
      response.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ error: `Не указано поле ${keyName}` }));
      return;
    }

    const where = { [keyName]: data[keyName] };

    model.update(data, { where })
      .then((result) => {
        if (result[0] === 0) {
          response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
          response.end(JSON.stringify({ error: 'Запись не найдена' }));
          return null;
        }

        return model.findOne({ where });
      })
      .then((record) => {
        if (record) {
          response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          response.end(JSON.stringify(record));
        }
      })
      .catch((updateError) => {
        response.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify({ error: updateError.message }));
      });
  });
}

function deleteRecord(response, model, keyName, keyValue) {
  const where = { [keyName]: decodeURIComponent(keyValue) };
  let deletedRecord = null;

  model.findOne({ where })
    .then((record) => {
      if (!record) {
        response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify({ error: 'Запись не найдена' }));
        return null;
      }

      deletedRecord = record;
      return model.destroy({ where }); 
    })
    .then((deleted) => {
      if (deleted) {
        response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify(deletedRecord, null, 2));
      }
    })
    .catch((deleteError) => {
      response.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ error: deleteError.message }));
    });
}

const server = http.createServer((request, response) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === 'GET' && pathname === '/') {
    fs.readFile(path.join(__dirname, 'index.html'), (error, data) => {
      if (error) {
        response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Ошибка чтения HTML-файла');
        return;
      }

      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(data);
    });
    return;
  }

  if (request.method === 'GET' && pathname === '/api/faculties') {
    sendJson(response, Faculty.findAll());
    return;
  }

  if (request.method === 'POST' && pathname === '/api/faculties') {
    createRecord(request, response, Faculty);
    return;
  }

  if (request.method === 'PUT' && pathname === '/api/faculties') {
    updateRecord(request, response, Faculty, 'FACULTY');
    return;
  }

  if (request.method === 'DELETE' && pathname.startsWith('/api/faculties/')) { 
    deleteRecord(response, Faculty, 'FACULTY', pathname.split('/').pop());
    return;
  }

  if (request.method === 'GET' && pathname === '/api/pulpits') {
    sendJson(response, Pulpit.findAll());
    return;
  }

  if (request.method === 'POST' && pathname === '/api/pulpits') {
    createRecord(request, response, Pulpit);
    return;
  }

  if (request.method === 'PUT' && pathname === '/api/pulpits') {
    updateRecord(request, response, Pulpit, 'PULPIT');
    return;
  }

  if (request.method === 'DELETE' && pathname.startsWith('/api/pulpits/')) {
    deleteRecord(response, Pulpit, 'PULPIT', pathname.split('/').pop());
    return;
  }

  if (request.method === 'GET' && pathname === '/api/subjects') {
    sendJson(response, Subject.findAll());
    return;
  }

  if (request.method === 'POST' && pathname === '/api/subjects') {
    createRecord(request, response, Subject);
    return;
  }

  if (request.method === 'PUT' && pathname === '/api/subjects') {
    updateRecord(request, response, Subject, 'SUBJECT');
    return;
  }

  if (request.method === 'DELETE' && pathname.startsWith('/api/subjects/')) {
    deleteRecord(response, Subject, 'SUBJECT', pathname.split('/').pop());
    return;
  }

  if (request.method === 'GET' && pathname === '/api/auditoriumstypes') {
    sendJson(response, AuditoriumType.findAll());
    return;
  }

  if (request.method === 'POST' && pathname === '/api/auditoriumstypes') {
    createRecord(request, response, AuditoriumType);
    return;
  }

  if (request.method === 'PUT' && pathname === '/api/auditoriumstypes') {
    updateRecord(request, response, AuditoriumType, 'AUDITORIUM_TYPE');
    return;
  }

  if (
    request.method === 'DELETE'
    && (pathname.startsWith('/api/auditoriumtypes/') || pathname.startsWith('/api/auditoriumstypes/'))
  ) {
    deleteRecord(response, AuditoriumType, 'AUDITORIUM_TYPE', pathname.split('/').pop());
    return;
  }

  if (request.method === 'GET' && pathname === '/api/auditorims') {
    sendJson(response, Auditorium.findAll());
    return;
  }

  if (request.method === 'POST' && pathname === '/api/auditoriums') {
    createRecord(request, response, Auditorium);
    return;
  }

  if (
    request.method === 'PUT'
    && (pathname === '/auditorims' || pathname === '/api/auditorims' || pathname === '/api/auditoriums')
  ) {
    updateRecord(request, response, Auditorium, 'AUDITORIUM');
    return;
  }

  if (request.method === 'DELETE' && pathname.startsWith('/api/auditorims/')) {
    deleteRecord(response, Auditorium, 'AUDITORIUM', pathname.split('/').pop());
    return;
  }

  response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify({ error: 'Страница не найдена' }));
});

function main() {
  sequelize.authenticate()
    .then(() => {
    console.log('Соединение с БД GAS успешно установлено.');

    server.listen(5001, () => {
      console.log('Сервер запущен: http://localhost:5001');
    });
    })
    .catch((error) => {
      console.error('Ошибка соединения с БД GAS:', error.message);
      sequelize.close();
    });
}

main();
