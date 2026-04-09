// GMAIL_PASS="drmc wbgl aczq fnuf" node 06-04.js
const { send } = require('@sangnchr/m0603-lab06');
send('тест')
  .then(() => console.log('письмо отправлено'))
  .catch(() => console.log('ошибка'));