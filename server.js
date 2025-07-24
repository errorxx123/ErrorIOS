const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'erroriossecret', resave: false, saveUninitialized: true }));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const User = require('./models/User');
const Key = require('./models/Key');

// Routes
app.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  Key.find({}, (err, keys) => {
    res.render('dashboard', { keys: keys });
  });
});

app.get('/login', (req, res) => { res.render('login'); });

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username }, (err, user) => {
    if (!user) return res.send('Invalid login');
    bcrypt.compare(password, user.password, (err, match) => {
      if (match) {
        req.session.user = username;
        res.redirect('/');
      } else {
        res.send('Invalid login');
      }
    });
  });
});

app.post('/addkey', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const newKey = new Key({ key: req.body.key });
  newKey.save(() => res.redirect('/'));
});

app.get('/del/:id', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  Key.deleteOne({ _id: req.params.id }, () => res.redirect('/'));
});

// API endpoint
app.get('/api/check', (req, res) => {
  const key = req.query.key;
  Key.findOne({ key }, (err, found) => {
    if (found) {
      res.json({ status: 'success' });
    } else {
      res.json({ status: 'invalid' });
    }
  });
});

// Initialize default admin user if not exists
User.findOne({ username: 'admin' }, (err, user) => {
  if (!user) {
    bcrypt.hash('admin123', 10, (err, hash) => {
      const admin = new User({ username: 'admin', password: hash });
      admin.save();
    });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
