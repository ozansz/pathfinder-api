const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ResourceSchema = require('./resource').ResourceSchema;

const PathSchema = mongoose.Schema({
  path: {
    type: [ResourceSchema],
    default: []
  },
  date_created: {
    type: String,
    default: new Date().toJSON()
  },
  estimated_finish_time: {
    type: Number,
    required: true
  }
});

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  paths: {
    type: [PathSchema],
    default: []
  }
});

module.exports = User = mongoose.model('user', UserSchema);

module.exports.addUser = function(newUser, callback){
  bcrypt.genSalt(10, (err, salt) => {
    if(err) callback(err, null);
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if(err) callback(err, null);
      newUser.password = hash;
      newUser = new User(newUser);
      newUser.save((err, ret) => {
        if(err) callback(err, null);
        callback(null, ret);
      });
    });
  });
}

module.exports.getUserByEmail = function(email, callback){
  User.findOne({email: email}, callback);
}

module.exports.getUserPathsOfUID = function(uid, callback){
  User.findOne({_id: uid}, (err, user) => {
    if(err) callback(err, null);
    if(user) callback(null, user.paths);
    callback('User not found (uid: ' + uid + ')', null);
  });
}

module.exports.getUserPathByPIDOfUID = function(uid, pid, callback){
  User.findOne({_id: uid, 'paths._id' : pid}, (err, path) => {
    if(err) callback(err, null);
    if(path) callback(null, path);
    callback('Path not found (pid: ' + pid + ')', null);
  });
}
