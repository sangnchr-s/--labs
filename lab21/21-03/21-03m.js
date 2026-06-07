const crypto = require('crypto');
const creds = require('./21-03cred.json');

const COOKIE = 'connect.sid.forms';
const sessions = new Set();

const createSessionId = () => crypto.randomUUID();

const checkUser = (name, pass) => {
  const user = creds.users.find((u) => u.name.toUpperCase() === String(name).toUpperCase());
  return user && user.password === pass;
};

const isAuth = (req) => {
  const sid = req.cookies && req.cookies[COOKIE];
  return sid && sessions.has(sid);
};

const formsAuth = (req, res, next) => {
  if (isAuth(req)) return next();
  res.redirect('/login');
};

const loginPost = (req, res) => {
  if (checkUser(req.body.name, req.body.password)) {
    const sid = createSessionId();
    sessions.add(sid);
    res.cookie(COOKIE, sid);
    return res.redirect('/resource');
  }
  res.redirect('/login');
};

const logout = (req, res) => {
  const sid = req.cookies && req.cookies[COOKIE];
  if (sid) sessions.delete(sid);
  res.clearCookie(COOKIE);
  res.redirect('/login');
};

module.exports = { formsAuth, loginPost, logout, isAuth };
