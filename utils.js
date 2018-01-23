module.exports = {
  clog: (req, msg) => {
    let _auth = typeof req.user == 'undefined' ? '\x1b[1m\x1b[31mUnauthorized\x1b[0m' : '#' + req.user._id + ' \x1b[1m\x1b[36m(' + req.user.name + ')\x1b[0m';
    console.log('\x1b[32m' + '[' + req.baseUrl + req.path + '] ' + '\x1b[0m' + req.method + ' - ' + _auth + ((typeof msg == 'undefined') ? '' : ' <*>\x1b[33m ' + msg + '\x1b[0m'));
  },
  unmatches: (subject, wanted_topic, got_topic, st_en_stat) => {
    //return subject.topics.indexOf(got_topic) - subject.topics.indexOf(wanted_topic);
    let _ret = subject.topics.indexOf(got_topic) - subject.topics.indexOf(wanted_topic);
    if(st_en_stat == 'start' && _ret < 0){
      return 0;
    }
    if(st_en_stat == 'end' && _ret > 0){
      return 0;
    }
    return _ret;
  },
  resSort: (res_array, subject, w_start, w_end, unm_f) => {
    return res_array.sort((a, b) => {
      return unm_f(subject, w_start, a.start_topic, 'start') +
        unm_f(subject, w_end, a.end_topic, 'end') -
        unm_f(subject, w_start, b.start_topic, 'start') -
        unm_f(subject, w_end, b.end_topic, 'end');
    });
  },
  filterRes: (res_array, start_topic, end_topic) => {
    let _ret = [];
    res_array.forEach((elem) => {
      if(!((elem.subject.topics.indexOf(elem.contents[0]) > elem.subject.topics.indexOf(end_topic)) || (elem.subject.topics.indexOf(elem.contents.slice(-1).pop()) < elem.subject.topics.indexOf(start_topic)))){
        _ret.push(elem);
      }
    });
    return _ret;
  },
  ratingAvg: (resource) => {
    if(resource.rating.length == 0){
      return 3;
    }
    return resource.rating.reduce((a, b) => a + b) / resource.rating.length;
  }
}
