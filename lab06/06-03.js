// GMAIL_PASS="drmc wbgl aczq fnuf" node 06-03.js
const { send } = require('./m0603');

send('письмо отправлено')
  .then(() => console.log('письмо отправлено'))
  .catch(() => console.log('ошибка'));