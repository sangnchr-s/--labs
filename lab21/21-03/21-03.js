const express = require('express');
const fs = require('fs');
const path = require('path');
const cp = require('cookie-parser');
const { formsAuth, loginPost, logout, isAuth } = require('./21-03m.js');

const app = express();

app.use(cp());
app.use(express.urlencoded({ extended: true }));

app.get('/login', (req, res) => {
  if (isAuth(req)) return res.redirect('/resource');
  fs.createReadStream(path.join(__dirname, '21-03.html')).pipe(res);
});

app.post('/login', loginPost);

app.get('/logout', logout);

app.get('/resource', formsAuth, (req, res) => {
  res.send('RESOURCE');
});

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(5003, () => console.log('Start server, port:', 5003));
