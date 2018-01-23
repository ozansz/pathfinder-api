const express = require('express');
const router = express.Router();

const md5 = require('blueimp-md5');

const validate = require('../middleware/validate');
const Subject = require('../models/subject').Subject;
const Resource = require('../models/resource').Resource;

const vF = validate.validateFields;

const resource_rf = ['name', 'type', 'link', 'price', 'duration',
  'start_topic', 'end_topic', 'requirements', 'contents', 'ptr', 'subject'];

function ysnPass(hash){
  return function(req, res, next){
    if((typeof req.body._pp != 'undefined' && hash == md5(req.body._pp)) || (typeof req.headers.ysnpass != 'undefined' && hash == md5(req.headers.ysnpass))){
      req.body._pp = undefined;
      next();
    } else {
      return res.status(401).json({
        success: false,
        msg: 'You shall not pass!'
      });
    }
  }
}

const _clog = require('../utils').clog;

router.get('/subjects', (req, res, next) => {
  Subject.find({}, (err, subjects) => {
    if(err){
      return res.status(500).json({
        success: false,
        err: err,
        msg: 'Unexpected error',
        debug: {
          subjects: subjects,
          'req.body': req.body
        }
      });
    }
    if(subjects.length == 0){
      return res.status(404).json({
        success: false,
        msg: 'No subjects found'
      });
    } else {
      _clog(req);
      return res.status(200).json({
        success: true,
        n_subjects: subjects.length,
        subjects: subjects
      });
    }
  });
});

router.post('/subjects', vF(['name', 'topics', 'type']), (req, res, next) => {
  /*
  return res.status(403).json({
    success: false,
    msg: 'This API call has not been implemented yet'
  });
  */
  let newSubject = {
    name: req.body.name,
    topics: req.body.topics,
    type: req.body.type
  }
  Subject.addSubject(newSubject, (err, done) => {
    if(err){
      return res.status(500).json({
        success: false,
        err: err,
        msg: 'Unexpected error',
        debug: {
          done: done,
          'req.body': req.body
        }
      });
    } else {
      _clog(req ,'added subject ' + req.body.name);
      return res.status(201).json({
        success: true,
        subject: done
      });
    }
  });
});

router.get('/resources', (req, res, next) => {
  Resource.find({}, {_id: 0, __v: 0, 'requirements._id': 0, 'subject._id': 0, 'subject.__v': 0}, (err, resources) => {
    if(err){
      return res.status(500).json({
        success: false,
        err: err,
        msg: 'Unexpected error',
        debug: {
          resources: resources
        }
      });
    }
    if(resources.length == 0){
      return res.status(404).json({
        success: false,
        msg: 'No resources found'
      });
    } else {
      _clog(req, resources.length + ' documents transmitted');
      return res.status(200).json({
        success: true,
        n_resources: resources.length,
        resources: resources
      });
    }
  });
});

router.post('/resources', vF(resource_rf), (req, res, next) => {
  let newRes = {};
  for(let i = 0; i < resource_rf.length; i++){
    newRes[resource_rf[i]] = req.body[resource_rf[i]];
  }
  Resource.addResource(newRes, (err, done) => {
    if(err){
      return res.status(500).json({
        success: false,
        err: err,
        msg: 'Unexpected error',
        debug: {
          done: done,
          'req.body': req.body
        }
      });
    } else {
      _clog(req, 'added resource ' + req.body.name);
      return res.status(201).json({
        success: true,
        resource: done
      });
    }
  });
});

router.delete('/resources/:rid', ysnPass('29f189b3bd9abacc3239cd96e82b1409'), (req, res, next) => {
  Resource.removeResByRID(req.params.rid, (err, ret) => {
    if(err){
      return res.status(500).json({
        success: false,
        err: err,
        msg: 'Unexpected error',
        debug: {
          ret: ret,
          'req.body': req.body
        }
      });
    } else {
      _clog(req);
      return res.status(200).json({
        success: true,
        msg: 'Resource has been removed (rid: ' + req.params.rid + ')',
        ret: ret
      });
    }
  });
});

router.use('*', (req, res, next) => {
  _clog(req, 'invalid api call')
  return res.status(403).json({
    success: false,
    msg: 'This API call has not been implemented yet'
  });
});

module.exports = router;
