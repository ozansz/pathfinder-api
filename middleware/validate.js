const bcrypt = require('bcryptjs');

module.exports = {
  validateFields: function(fields){
    return function(req, res, next){
      for(let i = 0; i < fields.length; i++){
        if(typeof req.body[fields[i]] == 'undefined'){
          return res.status(409).json({
            success: false,
            msg: 'Define req.body.' + fields[i] + ' to make this request great again!',
            debug: {
              'req.body': req.body,
              'fields': fields
            }
          });
        }
      }
      next();
    }
  },
  validateUser: function(pass, hash, callback){
    bcrypt.compare(pass, hash, (err, match) => {
      if(err) callback(err, null);
      callback(null, match);
    });
  }
}
