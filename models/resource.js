const mongoose = require('mongoose');
const _ = require('lodash');

const SubjectSchema = require('./subject').SubjectSchema;
const Subject = require('./subject').Subject;

const resSort = require('../utils').resSort;
const unmatches = require('../utils').unmatches;
const filterRes = require('../utils').filterRes;
const ratingAvg = require('../utils').ratingAvg;
const searchJson = require('../utils').searchJson;

const ReqSchema = mongoose.Schema({
  any: {
    type: [String],
    default: []
  },
  this: {
    type: [String],
    default: []
  }
});

const ResourceSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  start_topic: {
    type: String,
    required: true
  },
  end_topic: {
    type: String,
    required: true
  },
  requirements: {
    type: ReqSchema,
    required: true
  },
  rating: {
    type: [Number],
    default: []
  },
  ptr: {
    type: Number,
    required: true
  },
  contents: {
    type: [String],
    required: true
  },
  subject: {
    type: SubjectSchema,
    required: true
  }
});

const Resource = mongoose.model('resource', ResourceSchema);

Resource.addResource = function(newRes, callback){
  Subject.getSubjectByName(newRes.subject, (err, found_subject) => {
    if(err) callback(err, null);
    if(found_subject){
      newRes.subject = found_subject;
      newRes = new Resource(newRes);
      newRes.save((err, ret) => {
        if(err) callback(err, null);
        callback(null, ret);
      });
    } else {
      callback('Subject \'' + newRes.subject + '\' not found', null);
    }
  });
}

Resource.removeResByRID = function(rid, callback){
  Resource.remove({_id: rid}, callback);
}

Resource.getNClosest = (query, N, optimize, _opt, callback) => {
  console.log('[+] IN GET_N_CLOSEST');
  if(typeof _opt == 'function'){
    callback = _opt;
    _opt = {__v: 0, 'subject.__v': 0};
  }
  Resource.find(query, _opt, (err, found_res) => {
    if(err){
      console.log('[+] OUT GET_N_CLOSEST ERR');
      callback(err, []);
      return false;
    }
    if(found_res.length == 0){
      console.log('[+] OUT GET_N_CLOSEST 0');
      callback('No resources found for query: ' + query, []);
    } else {
      found_res = filterRes(found_res, optimize.start_topic, optimize.end_topic);
      if(found_res.length == 0){
        console.log('[+] OUT GET_N_CLOSEST 0 0');
        callback(null, []);
      } else {
        console.log('[+] OUT GET_N_CLOSEST 0 !0');
        callback(null, resSort(found_res, found_res[0].subject, optimize.start_topic, optimize.end_topic, unmatches).slice(0, N));
      }
    }
  });
}

Resource._sgetOptimal = (path_, query, savior) => {
  try {
    //let found_res = searchJson(query, savior);
    let found_res = _.filter(savior, query);
  } catch (e) {
    return {err: e, ret: null};
  }
  if(found_res.length == 0){
    if(path_[0].subject.topics.indexOf(query.start_topic) > path_[0].subject.topics.indexOf(path_[0].end_topic)){
      query.start_topic = path_[0].subject.topics[path_[0].subject.topics.indexOf(query.start_topic) - 1];
      return Resource._sgetOptimal(path_, query, _opt);
    } else {
      return {err: false, ret: null};
    }
  } else {
    found_res = found_res.sort((a, b) => {
      return ratingAvg(b) - ratingAvg(a);
    })[0];
    return {err: false, ret: path_.concat(found_res)};
  }
}

module.exports = {
  Resource: Resource,
  ResourceSchema: ResourceSchema
}
