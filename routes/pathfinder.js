const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Subject = require('../models/subject').Subject;

const jwtAuthenticate = require('../middleware/jwt');
const validate = require('../middleware/validate');
const pathfinder = require('../pathfinder');

const vF = validate.validateFields;

const _clog = require('../utils').clog;

router.post('/', jwtAuthenticate('user'), vF(['request']), (req, res, next) => {
  _clog(req, 'new post');
  pathfinder(req.body.request, (err, _path) => {
    if(err){
      return res.status(500).json({
        success: false,
        err: err,
        msg: 'Unexpected error',
        debug: {
          '_path': _path,
          'req.body': req.body
        }
      });
    }
    if(_path){
      console.log('PATH:', _path);
      console.log('\nPATH_LENGTH:', _path.length);
      _clog(req, req.body.request.subject + ' | ' + req.body.request.start_topic + ' => ' + req.body.request.end_topic + ' | ' + ((_path.length > 0) ? _path.length : 'No') + ' matches');
      if(_path.length == 1){
        return res.status(200).json({
          success: true,
          resource: _path[0],
          n_path: _path.length
        });
      }
      return res.status(200).json({
        success: true,
        path: _path,
        n_path: _path.length
      });
    } else {
      return res.json({
        success: false,
        msg: 'Couldn\'t create a path'
      });
    }
  });
});

router.get('/paths', jwtAuthenticate('user'), (req, res, next) => {
  User.getUserPathsOfUID(req.user._id, (err, paths) => {
    if(err){
      return res.status(500).json({
        success: false,
        err: err,
        msg: 'Unexpected error',
        debug: {
          'paths': paths
        }
      });
    }
    if(paths){
      return res.status(200).json({
        success: true,
        paths: paths
      });
    } else {
      return res.status(404).json({
        success: false,
        msg: 'No paths found'
      });
    }
  });
});

router.get('/paths/:pid', jwtAuthenticate('user'), (req, res, next) => {
  User.getUserPathByPIDOfUID(req.user._id, req.params.pid, (err, path) => {
    if(err){
      return res.status(500).json({
        success: false,
        err: err,
        msg: 'Unexpected error',
        debug: {
          'path': path
        }
      });
    }
    if(path){
      return res.status(200).json({
        success: true,
        path: path
      });
    } else {
      return res.status(404).json({
        success: false,
        msg: 'Specified path not found (pid: ' + req.params.pid + ')'
      });
    }
  });
});

router.get('/subjects', jwtAuthenticate('user'), (req, res, next) => {
  Subject.find({}, {_id: 0, __v: 0}, (err, subjects) => {
    if(err){
      return res.status(500).json({
        success: false,
        err: err,
        msg: 'Unexpected error',
        debug: {
          'subjects': subjects
        }
      });
    }
    if(subjects.length == 0){
      return res.status(404).json({
        success: false,
        msg: 'No subjects found'
      });
    } else {
      _clog(req, subjects.length + ' documents transmitted');
      return res.status(200).json({
        success: true,
        subjects: subjects
      });
    }
  });
});

module.exports = router;
