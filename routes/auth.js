const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const config = require('../config/database');
const validate = require('../middleware/validate');

const vF = validate.validateFields;
const validateUser = validate.validateUser;

router.post('/local', vF(['email', 'password']), (req, res, next) => {
  User.getUserByEmail(req.body.email, (err, found_user) => {
    if(err){
      return res.status(500).json({
        success: false,
        err: err,
        msg: 'Unexpected error'
      });
    }
    if(found_user){
      validateUser(req.body.password, found_user.password, (err, match) => {
        if(err){
          return res.status(500).json({
            success: false,
            msg: 'Unexpected error',
            err: err
          });
        }
        if(match){
          let token = jwt.sign({
            authorization: 'user',
            uid: found_user._id
          }, config.secret,
          {
            algorithm: 'HS256',
            expiresIn: '24000h'
          });
          console.log('\n[/auth/local] User #' + found_user._id + ' (' + found_user.name + ') has logged in');
          console.log('[/auth/local] JWT token: ' + token);
          return res.status(200).json({
            success: true,
            token: 'JWT ' + token,
            name: found_user.name
          });
        } else {
          return res.status(401).json({
            success: false,
            msg: 'Wrong password'
          });
        }
      });
    } else {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }
  });
});

module.exports = router;
