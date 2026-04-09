const http = require('http');

const server = http.createServer((req, res) => {

  let body = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => { // мы делаем это в end потому что заранее не извесно или тело запроса будет полностью получено только тогда уже безопастно разбивать json и формировать ответ 
    let data;
    try {
      data = JSON.parse(body); // тут мы получили наш JSON и уже парсим в объект
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('неверный JSON');
      return;
    }

    const x = Number(data.x ?? 0); // если к не в json то берем 0
    const y = Number(data.y ?? 0);
    const s = String(data.s ?? ''); // если s не в json то берем пустую строку
    const o = data.o && typeof data.o === 'object' ? data.o : {}; // проверям что дата это объект иначе тоже пустым будет
    const m = Array.isArray(data.m) ? data.m : []; // проверям что m это массив иначе пустой
    const objectValuesText = Object.values(o).map(String).join(', ');
    const out = {
      __comment: 'Ответ.Лабораторная работа 8/10',
      x_plus_y: x + y,
      Concatination_s_o: objectValuesText ? `${s}: ${objectValuesText}` : s,
      Length_m: m.length,
    };

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(out));
  });
});

server.listen(5001, () => {
  console.log('http://localhost:5004');
});
