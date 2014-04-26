module.exports = function(hostname, router) {

  //check router handles three params..
  if(!router || router.length < 3) {
      throw new Error("The router function passed to subdomain must handle req, res, and next params.");
  }

  return function (req, res, next) {
    req._subdomainLevel = req._subdomainLevel || 0;

    var hostnameSplit = hostname.split('.');
    var len = hostnameSplit.length;
    var match = true;

    //url - 2.api.example.dom
    //subdomains == ['api', '2']
    //hostnameSplit = ['2', 'api']
    for(var i = 0; i < len; i++) {
      var expected = hostnameSplit[len - (i+1)];
      var actual = req.subdomains[i+req._subdomainLevel];

      if(expected === '*') { continue; }

      if(actual !== expected) {
          match = false;
          break;
      }
    }

    if(match) {
      //modify the request object, to enabling chaining
      req._subdomainLevel++;
      return router(req, res, next);
    }
    next();
  };

};
