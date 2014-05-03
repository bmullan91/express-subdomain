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
  main: {
    '/': 'multi-level example homepage!'
  },
  api: {
    '/': 'Welcome to our multi-level API!',
    '/users': [{ name: "Luke" }]
  }
};

//////////////////////////////
//         routes           //
//////////////////////////////
var router = express.Router();

//api specific routes
router.get('/', function(req, res) {
    res.send(responses.api['/']);
});

router.get('/users', function(req, res) {
    res.json(responses.api['/users']);
});

//////////////////////////////
//       express app        //
//////////////////////////////
var app = express();

app.use(subdomain('v1.api', router));

app.get('/', function (req, res) {
  res.send(responses.main['/']);
});

describe('Multi-level tests', function () {

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
  //     v1.api.example.com    //
  ///////////////////////////////

  it('GET ' + config.urls.V1_API_URL, function (done) {
    request('http://' + config.urls.V1_API_URL, function (error, res, body) {
      expect(body).to.equal(responses.api['/']);
      done();
    });
  });

  it('GET ' + config.urls.V1_API_URL + '/users', function (done) {
    request('http://' + config.urls.V1_API_URL + '/users', function (error, res, body) {
      expect(body).to.equal( JSON.stringify(responses.api['/users']) );
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