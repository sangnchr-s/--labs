const creds = require('./21-02cred.json');

const getCredential = (user) =>
  creds.users.find((u) => u.name.toUpperCase() === user.toUpperCase());

const verPassword = (stored, pass) => stored === pass;

module.exports = { getCredential, verPassword };
