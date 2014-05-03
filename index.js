module.exports = function(subdomain, fn) {
  if(!subdomain || typeof subdomain !== "string") {
    throw new Error("The first parameter must be a string representing the subdomain");
  }

  //check fn handles three params..
  if(!fn || typeof fn !== "function" || fn.length < 3) {
      throw new Error("The second parameter must be a function that handles fn(req, res, next) params.");
  }

  return function (req, res, next) {
    req._subdomainLevel = req._subdomainLevel || 0;

    var subdomainSplit = subdomain.split('.');
    var len = subdomainSplit.length;
    var match = true;

    //url - v2.api.example.dom
    //subdomains == ['api', 'v2']
    //subdomainSplit = ['v2', 'api']
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
