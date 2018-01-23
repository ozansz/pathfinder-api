const jwt = require('jsonwebtoken');
const secret = require('../config/database').secret;
const User = require('../models/user');

module.exports = function(authorizer, specifiedSecret){
  let _secret = typeof specifiedSecret == 'undefined' ? secret : specifiedSecret;
  return function(req, res, next){
    let bearer_token = req.headers.authorization;
    if(typeof bearer_token == 'undefined'){
      return res.status(401).json({
        success: false,
        msg: 'Unauthorized'
      });
    }
    if(!bearer_token.startsWith('JWT ')){
      return res.status(400).json({
        success: false,
        msg: 'Couldn\'t parse header \'authorization\': Header needs to start with \'JWT \''
      });
    }
    jwt.verify(bearer_token.slice(4), _secret, (err, decoded) => {
      if(err){
        return res.status(500).json({
          success: false,
          err: err,
          msg: 'Unexpected error',
          debug: {
            decoded: decoded
          }
        });
      }
      // User.findById(decoded.uid, (err, found_user) => {
      User.findOne({_id: decoded.uid}, (err, found_user) => {
        if(err){
          return res.status(500).json({
            success: false,
            err: err,
            msg: 'Unexpected error',
            debug: {
              decoded: decoded,
              found_user: found_user
            }
          });
        }
        if(found_user){
          req.user = found_user;
          next();
        } else {
          return res.status(401).json({
            success: false,
            msg: 'User not found (uid: ' + decoded.uid + ')',
            debug: {
              decoded: decoded,
              found_user: found_user
            }
          });
        }
      });
    });
  }
}
