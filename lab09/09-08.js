// rpc web 
const fs = require('fs');
const http = require('http');
const multiparty = require('multiparty');
const path = require('path');

const PORT = 7006;
const uploadDir = path.join(__dirname, 'clientReceivingFiles');

fs.mkdirSync(uploadDir, { recursive: true });

const options = {
  hostname: 'localhost',
  port: PORT,
  path: '/',
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log('Статус ответа:', res.statusCode);

  const form = new multiparty.Form({ uploadDir });

  form.parse(res, (err, _fields, files) => {
    if (err) {
      console.error('Ошибка разбора multipart:', err.message);
      return;
    }
    if (!files.file || !files.file[0]) {
      console.error('В ответе нет части с полем file');
      return;
    }

    const part = files.file[0];
    const dest = path.join(uploadDir, part.originalFilename);

    fs.rename(part.path, dest, (renameErr) => {
      if (renameErr) {
        console.error('Не удалось сохранить файл:', renameErr.message);
        return;
      }
      console.log('Файл из ответа сохранён:', dest);
    });
  });
});

req.on('error', (e) => {
  console.error(
    'Ошибка запроса (запущен ли сервер 09-08-server.js?):',
    e.message
  );
});

req.end();
