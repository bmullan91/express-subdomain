var colors = require('colors');
var request = require('request');
var expect = require('chai').expect;

var express = require('express');
var subdomain = require('../');
var config = require('./config.json');

//////////////////////////////
//    expected responses    //
//////////////////////////////
var responses = {
  error: 'Permission denied.',
  main: {
    '/': 'complex example homepage!'
  },
  api: {
    main: {
      '/': 'Welcome to our API! - please visit either v1.api.example.com or v2.api.example.com',
    },
    v1: {
      '/': 'API - version 1',
      '/users': [{ name: 'Jimmy'}]
    },
    v2: {
      '/': 'API - version 1',
      '/users': [{ name: 'Joe'}]
    }
  }
};

//////////////////////////////
//         routes           //
//////////////////////////////
var router = express.Router(); 
var v1Router = express.Router();
var v2Router = express.Router();

v1Router.get('/', function(req, res) {
  res.send(responses.api.v1['/']);
});

v1Router.get('/users', function(req, res) {
  res.send(responses.api.v1['/users']);
});

v2Router.get('/', function(req, res) {
  res.send(responses.api.v2['/']);
});

v2Router.get('/users', function(req, res) {
  res.send(responses.api.v2['/users']);
});

//chaining our subdomains and middleware
router.use(function (req, res, next) {
  if(req.headers['invalid'] === 'true') {
    return res.end(responses.error);
  } else {
    res.setHeader("valid", "true");
    next();
  }
});
router.use(subdomain('*.v1', v1Router));
router.use(subdomain('*.v2', v2Router));

//basic routing..
router.get('/', function(req, res) {
  res.send(responses.api.main['/']);
});

//////////////////////////////
//       express app        //
//////////////////////////////
var app = express();

app.use(subdomain('api', router));

app.get('/', function (req, res) {
  res.send(responses.main['/']);
});

describe('Divide and Conquer tests', function () {

  //to be assigned in the 'before' hook (below)
  var server;

  before(function (done) {
    server = app.listen(config.PORT, config.HOSTNAME, done);
  });

  ///////////////////////////////
  //        example.com        //
  ///////////////////////////////

  it('GET ' + config.urls.BASE_URL, function (done) {
    request('http://'+ config.urls.BASE_URL, function (error, res, body) {
      expect(body).to.equal(responses.main['/']);
      done();
    });
  });

  ///////////////////////////////
  //      api.example.com      //
  ///////////////////////////////

  it('GET ' + config.urls.API_URL + ' * INVALID USER *', function (done) {
    //custom header for testing purposes
    var opts = {
      url: 'http://' + config.urls.API_URL,
      headers: {
        'invalid': 'true'
      }
    };

    request(opts, function (error, res, body) {
      expect(body).to.equal(responses.error);
      done();
    });

  });

  it('GET ' + config.urls.API_URL, function (done) {
    request('http://' + config.urls.API_URL, function (error, res, body) {
      expect(res.headers['valid']).to.be.equal('true');
      expect(body).to.equal(responses.api.main['/']);
      done();
    });
  });

  ///////////////////////////////
  //    v1.api.example.com     //
  ///////////////////////////////

  it('GET ' + config.urls.V1_API_URL + ' * INVALID USER *', function (done) {
    //custom header for testing purposes
    var opts = {
      url: 'http://' + config.urls.V1_API_URL,
      headers: {
        'invalid': 'true'
      }
    };

    request(opts, function (error, res, body) {
      expect(body).to.equal(responses.error);
      done();
    });

  });

  it('GET ' + config.urls.V1_API_URL, function (done) {
    request('http://' + config.urls.V1_API_URL, function (error, res, body) {
      expect(res.headers['valid']).to.be.equal('true');
      expect(body).to.equal(responses.api.v1['/']);
      done();
    });
  });

  it('GET ' + config.urls.V1_API_URL + '/users', function (done) {
    request('http://' + config.urls.V1_API_URL + '/users', function (error, res, body) {
      expect(res.headers['valid']).to.be.equal('true');
      expect(body).to.equal( JSON.stringify(responses.api.v1['/users']) );
      done();
    });
  });

  //curve ball..
  it('GET c.b.a.' + config.urls.V1_API_URL, function (done) {
    request('http://c.b.a.' + config.urls.V1_API_URL, function (error, res, body) {
      expect(res.headers['valid']).to.be.equal('true');
      expect(body).to.equal(responses.api.v1['/']);
      done();
    });
  });

  ///////////////////////////////
  //    v2.api.example.com     //
  ///////////////////////////////

  it('GET ' + config.urls.V2_API_URL + ' * INVALID USER *', function (done) {
    //custom header for testing purposes
    var opts = {
      url: 'http://' + config.urls.V2_API_URL,
      headers: {
        'invalid': 'true'
      }
    };

    request(opts, function (error, res, body) {
      expect(body).to.equal(responses.error);
      done();
    });

  });

  it('GET ' + config.urls.V2_API_URL, function (done) {
    request('http://' + config.urls.V2_API_URL, function (error, res, body) {
      expect(res.headers['valid']).to.be.equal('true');
      expect(body).to.equal(responses.api.v2['/']);
      done();
    });
  });

  it('GET ' + config.urls.V2_API_URL + '/users', function (done) {
    request('http://' + config.urls.V2_API_URL + '/users', function (error, res, body) {
      expect(res.headers['valid']).to.be.equal('true');
      expect(body).to.equal( JSON.stringify(responses.api.v2['/users']) );
      done();
    });
  });

  //curve ball..
  it('GET c.b.a.' + config.urls.V2_API_URL, function (done) {
    request('http://c.b.a.' + config.urls.V2_API_URL, function (error, res, body) {
      expect(res.headers['valid']).to.be.equal('true');
      expect(body).to.equal(responses.api.v2['/']);
      done();
    });
  });

  after(function(done) {
    server.close(function() {
      console.log('    ♻ server recycled'.cyan);
      done();
    });
  });

});