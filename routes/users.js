const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

const config = require('../config/database');
const User = require('../models/user');
const jwtAuthenticate = require('../middleware/jwt');
const pathfinder = require('../pathfinder');
const validate = require('../middleware/validate');

const vF = validate.validateFields;

const _clog = require('../utils').clog;

router.post('/register', vF(['email', 'password', 'name']), (req, res, next) => {
  User.getUserByEmail(req.body.email, (err, found_user) => {
    if(err){
      return res.status(500).json({
        success: false,
        err: err,
        msg: 'Unexpected error',
        debug: {
          found_user: found_user,
          'req.body': req.body
        }
      });
    }
    if(found_user){
      return res.status(409).json({
        success: false,
        msg: 'A user with this email (' + req.body.email + ') has already been registered'
      });
    } else {
      User.addUser({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      }, (err, ret) => {
        if(err){
          return res.status(500).json({
            success: false,
            err: err,
            msg: 'Unexpected error'
          });
        } else {
          console.log('\n[/users/register] New user registered');
          console.log('[/users/register] user: ' + ret);
          return res.status(201).json({
            success: true,
            msg: 'Created new user',
            debug: {
              ret: ret
            }
          });
        }
      });
    }
  });
});

router.get('/profile', jwtAuthenticate('user'), (req, res, next) => {
  _clog(req);
  return res.status(200).json({
    success: true,
    user: req.user
  });
});

module.exports = router;
