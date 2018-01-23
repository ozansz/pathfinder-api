const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const fs = require('fs');
const morgan = require('morgan');

const _clog = require('./utils').clog;

const API_VER = '0.5.3-alpha';

mongoose.Promise = global.Promise;

mongoose.connect(config.database);

mongoose.connection.on('connected', () => {
  console.log('[APP] Connected to database ' + config.database);
});

mongoose.connection.on('error', (err) => {
  console.log('[ERROR] Database error: ' + err);
});

const app = express();

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));

const users = require('./routes/users');
const pathfinder = require('./routes/pathfinder');
const auth = require('./routes/auth');
const admin = require('./routes/admin');

const port = 3000;

app.use(cors());

app.use(bodyParser.json());
//app.use(passport.initialize());
//app.use(passport.session());

/*
app.use((req, res, next) => {
  let _auth = typeof req.user == 'undefined' ? 'Unauthorized' : req.user._id;
  console.log('[APP] ' + req.method + ' ' + req.path + ' (' + _auth + ')');
  next();
});
*/

app.use('/users', users);
app.use('/pf', pathfinder);
app.use('/auth', auth);
app.use('/admin', admin);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api', (req, res) => {
  return res.redirect(307, '/');
});

app.use('/api/:path', (req, res) => {
  return res.redirect(307, '/' + req.params.path);
});

app.get('/', (req, res) => {
  res.status(200).json({
    api_version: API_VER
  });
});

app.use('*', (req, res) => {
  _clog(req, 'invalid api call');
  return res.status(404).json({
    success: false,
    msg: 'Invalid or unimplemented api call: ' + req.path
  });
});

app.listen(port, () => {
  console.log("[APP] Server started on " + port);
});
