const Resource = require('./models/resource').Resource;
const Subject = require('./models/subject').Subject;

const ratingAvg = require('./utils').ratingAvg;

module.exports = (request, callback) => {
  ['subject', 'start_topic', 'end_topic', 'one_fits_all', 'pref_type'].forEach((field) => {
    if(typeof request[field] == 'undefined'){
      callback('request.' + field + ' needs to be set', null);
      return false;
    }
  });
  Subject.getSubjectByName(request.subject, (err, subj) => {
    if(err){
      callback(err, null);
      return false;
    }
    if(subj){
      if(request.start_topic == null){
        request.start_topic = subj.topics[0];
      }
      if(request.end_topic == null){
        request.end_topic = subj.topics.slice(-1)[0];
      }
      Resource.getNClosest({'subject.name': request.subject}, 3,
        {start_topic: request.start_topic, end_topic: request.end_topic, pref_type: request.pref_type},
        {__v: 0, 'requirements._id': 0, 'subject._id': 0, 'subject.__v': 0},
        (err, resources) => {
        if(err){
          callback(err, null);
          return false;
        }
        if(resources.length == 0){
          callback(null, {_path: [], fullfilled: false, req: 'all'});
          return true;
        } else {
          let fullfills = [];
          resources.forEach((res) => {
            if(res.contents.includes(request.end_topic)){
              fullfills.push(res);
            }
          });
          if(!request.one_fits_all){
              fullfills = [];
          }
          if(fullfills.length == 0){
            let selected_one = resources.sort((a, b) => {
              return a.subject.topics.indexOf(b.end_topic) - a.subject.topics.indexOf(a.end_topic);
            })[0];
            Resource.find({'subject.name': request.subject}, (err, _savior) => {
              let found_path = Resource._sgetOptimal([selected_one], {
                'start_topic': selected_one.end_topic,
                'end_topic': request.end_topic
              }, _savior);
              if(found_path.err){
                callback(found_path.err, null);
                return false;
              } else {
                callback(found_path.err, {_path: found_path.ret, fullfilled: found_path.fullfilled, req: found_path.req});
                return true;
              }
            });
          } else if (fullfills.length == 1){ // One resource fullfills client's wishes
            callback(null, {_path: fullfills, fullfilled: true, req: null});
            return true;
          } else { // But first, let me sort 'em!
            callback(null, {
              _path: resSortBPrefType([fullfills.sort((a, b) =>  ratingAvg(b) - ratingAvg(a))], request.pref_type)[0],
              fullfilled: true,
              req: null
            });
            return true;
          }
        }
      });
    } else {
      callback('Subject ' + request.subject + ' not found', null);
      return false;
    }
  });
}
