var composableMiddlewares = require('composable-middleware');

module.exports = function(subdomain) {
  var length = arguments.length;
  if(!subdomain || typeof subdomain !== "string") {
    throw new Error("The first parameter must be a string representing the subdomain");
  }

  //check fn handles three params..
  if(length < 2 || !arguments[length - 1] || typeof arguments[length - 1] !== "function"
    || arguments[length - 1].length < 3
  ) {
      throw new Error("The second parameter must be a function that handles fn(req, res, next) params.");
  }

  var middlewares = composableMiddlewares();
  if(length > 2) {
    for(var i = 1; i <= length - 2; i++) {
      middlewares.use(arguments[i]);
    }
  }

  var fn = arguments[length - 1];

  middlewares.use(function (req, res, next) {
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
  });

  return middlewares;
};
