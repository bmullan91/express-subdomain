module.exports = function(subdomain, fn) {

  //check fn handles three params..
  if(!fn || fn.length < 3) {
      throw new Error("The fn function passed to subdomain must handle req, res, and next params.");
  }

  return function (req, res, next) {
    req._subdomainLevel = req._subdomainLevel || 0;

    var subdomainSplit = subdomain.split('.');
    var len = subdomainSplit.length;
    var match = true;

    //url - 2.api.example.dom
    //subdomains == ['api', '2']
    //subdomainSplit = ['2', 'api']
    for(var i = 0; i < len; i++) {
      var expected = subdomainSplit[len - (i+1)];
      var actual = req.subdomains[i+req._subdomainLevel];

      if(expected === '*') { continue; }

      if(actual !== expected) {
          match = false;
          break;
      }
    }

    if(match) {
      req._subdomainLevel++;//enables chaining
      return fn(req, res, next);
    }
    next();
  };

};
