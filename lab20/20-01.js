const express = require('express');
const { engine } = require('express-handlebars');
const fs = require('fs');
const path = require('path');

const PORT = 5001;
const DATA_FILE = path.join(__dirname, 'phonebook.json');

const app = express();

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: {
    cancelButton(href) {
      return `<a class="btn-wide" href="${href}">Отказаться</a>`;
    },
  },
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded()); 
app.use(express.static(path.join(__dirname, 'public')));

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function showMain(res) {
  res.render('index', { entries: readData().entries });
}

app.get('/', (req, res) => showMain(res));

app.get('/Add', (req, res) => {
  res.render('add', { entries: readData().entries });
});

app.get('/Update', (req, res) => {
  const data = readData();
  const i = Number(req.query.index);
  if (!data.entries[i]) return res.redirect('/');

  const row = data.entries[i];
  res.render('update', {
    entries: data.entries,
    selectedIndex: i,
    selectedName: row.name,
    selectedPhone: row.phone,
  });
});

app.post('/Add', (req, res) => {
  const name = (req.body.name || '').trim();
  const phone = (req.body.phone || '').trim();
  if (!name || !phone) return res.redirect('/Add');

  const data = readData();
  data.entries.push({ name, phone });
  saveData(data);
  showMain(res);
});

app.post('/Update', (req, res) => {
  const i = Number(req.body.index);
  const name = (req.body.name || '').trim();
  const phone = (req.body.phone || '').trim();
  const data = readData();
  if (!name || !phone || !data.entries[i]) return res.redirect('/');

  data.entries[i] = { name, phone };
  saveData(data);
  showMain(res);
});

app.post('/Delete', (req, res) => {
  const i = Number(req.body.index);
  const data = readData();
  if (!data.entries[i]) return res.redirect('/');

  data.entries.splice(i, 1);
  saveData(data);
  showMain(res);
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
