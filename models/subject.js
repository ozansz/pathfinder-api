const mongoose = require('mongoose');

const SubjectSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  topics: {
    type: [String],
    required: true
  },
  type: {
    type: String,
    required: true
  }
});

const Subject = mongoose.model('subject', SubjectSchema);

Subject.getSubjectByName = function(name, callback){
  Subject.findOne({name: name}, (err, found) => {
    if(err) callback(err, null);
    callback(null, found);
  });
}

Subject.addSubject = function(newSubject, callback){
  Subject.getSubjectByName(newSubject.name, (err, found_subject) => {
    if(err) callback(err, null);
    if(found_subject){
      callback('Subject already exists (name: ' + newSubject.name + ')', null);
    } else {
      newSubject = new Subject(newSubject);
      newSubject.save((err, ret) => {
        if(err) callback(err, null);
        callback(null, ret);
      });
    }
  });
}

module.exports = {
  Subject: Subject,
  SubjectSchema: SubjectSchema
}
