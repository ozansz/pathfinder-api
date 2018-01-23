const Resource = require('./models/resource').Resource;
const ratingAvg = require('./utils').ratingAvg;

module.exports = (request, callback) => {
  ['subject', 'known_topics', 'start_topic', 'end_topic'].forEach((field) => {
    if(typeof request[field] == 'undefined'){
      callback('request.' + field + ' needs to be set', null);
    }
  });
  Resource.getNClosest({'subject.name': request.subject}, 3,
    {start_topic: request.start_topic, end_topic: request.end_topic},
    {_id: 0, __v: 0, 'requirements._id': 0, 'subject._id': 0, 'subject.__v': 0},
    (err, resources) => {
    if(err) callback(err, null);
    if(resources.length == 0){
      //callback('No resources found for the specified subject: ' + request.subject, null);
      callback(null, []);
    } else {
      // Test
      //callback(null, resources);
      let fullfills = [];
      resources.forEach((res) => {
        if(res.contents.includes(request.end_topic)){
          fullfills.push(res);
        }
      });
      // Start path finding
      if(fullfills.length == 0){
        let selected_one = resources.sort((a, b) => {
          return a.subject.topics.indexOf(b.end_topic) - a.subject.topics.indexOf(a.end_topic);
        })[0];
        let found_path = Resource._sgetOptimal([selected_one], {
          'subject.name': request.subject,
          start_topic: selected_one.end_topic,
          end_topic: request.end_topic
        });
        if(found_path.err){
          callback(found_path.err, null);
        } else {
          callback(found_path.err, found_path.ret);
        }
      } else if (fullfills.length == 1){ // One resource fullfills client's wishes
        callback(null, fullfills);
      } else { // But first, let me sort 'em!
        callback(null, [fullfills.sort((a, b) => {
          return ratingAvg(b) - ratingAvg(a);
        })[0]]);
      }
    }
  });
}
