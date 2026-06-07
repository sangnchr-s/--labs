const crypto = require('crypto');
const app = require('express')();
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const { getCredential, verPassword } = require('./21-01m.js');

const SESSION_NAME = 'connect.sid.basic';

const session = require('express-session')({
  name: SESSION_NAME,
  genid: () => crypto.randomUUID(),
  resave: false,
  saveUninitialized: false,
  secret: 'basic-secret',
});

passport.use(
  new BasicStrategy((user, password, done) => {
    console.log('passport.use', user, password);
    const cr = getCredential(user); 
    if (!cr) return done(null, false, { message: 'incorrect username' });
    if (!verPassword(cr.password, password)) return done(null, false, { message: 'incorrect password' });
    done(null, user); 
  }),
);

passport.serializeUser((user, done) => {
  console.log('serialize', user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log('deserialize', user);
  done(null, user);
});

app.use(session);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.clearCookie('connect.sid');
  next();
});

const preAuth = (req, res, next) => {
  next();
};

const renewSession = (req, res, next) => {
  if (!req.isAuthenticated()) return next();
  const user = req.user;
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.login(user, (loginErr) => next(loginErr));
  });
};

app.get('/login', preAuth, passport.authenticate('basic', { session: true }), renewSession, (req, res) => {
  res.redirect('/resource');
});

app.get('/logout', (req, res) => {
  const finish = () => {
    res.clearCookie(SESSION_NAME, { path: '/' });
    res.clearCookie('connect.sid', { path: '/' });
    res.set('WWW-Authenticate', 'Basic realm="logout"');
    res.status(401).send('Logged out');
  };
  req.logout(() => {
    if (req.session) req.session.destroy(finish);
    else finish();
  });
});

app.get('/resource', preAuth, renewSession, (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.send('RESOURCE');
});

app.use((req, res) => res.status(404).send('Not Found'));

app.listen(5001, () => console.log('Start server, port:', 5001));
