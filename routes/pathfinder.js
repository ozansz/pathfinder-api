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
  pathfinder(req.body.request, (err, ret) => {
    if(err){
      return res.status(500).json({
        success: false,
        err: err,
        msg: 'Unexpected error',
        debug: {
          'ret': ret,
          'req.body': req.body
        }
      });
    }
    if(ret){
      _clog(req, req.body.request.subject + ' | ' + req.body.request.start_topic + ' => ' + req.body.request.end_topic + ' | ' + ((ret._path.length > 0) ? ret._path.length : 'No') + ' matches');
      if(ret._path.length == 0){
        return res.status(404).json({
          success: false,
          msg: 'No resources found for specified shit'
        });
      }
      if(ret._path.length == 1){
        return res.status(200).json({
          success: true,
          resource: ret._path[0],
          n_path: ret._path.length,
          fullfillment: ret.fullfilled,
          req: typeof ret.req == 'undefined' ? []: ret.req
        });
      }
      return res.status(200).json({
        success: true,
        path: ret._path,
        n_path: ret._path.length,
        fullfillment: ret.fullfilled,
        req: typeof ret.req == 'undefined' ? []: ret.req
      });
    } else {
      return res.json({
        success: false,
        msg: 'Couldn\'t create a path',
        debug: {
          ret: ret,
          path: ret._path
        }
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
