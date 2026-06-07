const crypto = require('crypto');
const app = require('express')();
const passport = require('passport');
const DigestStrategy = require('passport-http').DigestStrategy;
const { getCredential } = require('./21-02m.js');

const SESSION_NAME = 'connect.sid.digest';

const session = require('express-session')({
  name: SESSION_NAME,
  genid: () => crypto.randomUUID(),
  resave: false,
  saveUninitialized: false,
  secret: 'digest-secret',
});

passport.use(
  new DigestStrategy({ qop: 'auth' }, (user, done) => {
    console.log('passport.use', user);
    const cr = getCredential(user);
    if (!cr) return done(null, false);
    done(null, cr.name, cr.password);
  }, (params, done) => {
    done(null, true);
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
  if (req.query.logout === '1' && req.headers.authorization) {
    delete req.headers.authorization;
    return res.redirect('/login');
  }
  next();
};

app.get('/login', preAuth, passport.authenticate('digest', { session: true }), (req, res) => {
  res.redirect('/resource');
});

app.get('/logout', (req, res) => {
  const finish = () => {
    res.clearCookie(SESSION_NAME, { path: '/' });
    res.clearCookie('connect.sid', { path: '/' });
    res.redirect('/login?logout=1');
  };
  req.logout(() => {
    if (req.session) req.session.destroy(finish);
    else finish();
  });
});

app.get('/resource', preAuth, (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.send('RESOURCE');
});

app.use((req, res) => res.status(404).send('Not Found'));

app.listen(5002, () => console.log('Start server, port:', 5002));

// чистить постоянно и создавать новую
// выбрать версию и рассказать