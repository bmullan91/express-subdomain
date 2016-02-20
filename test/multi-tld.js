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
    '/': 'Simple example homepage!'
  },
  api: {
    '/': 'Welcome to our simple API!',
    '/users': [{ name: "Brian" }]
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

//note because the TLD is .co.uk
//express will treat both api and example as subdomains
app.use(subdomain('api.example', router));

app.get('/', function (req, res) {
  res.send(responses.main['/']);
});

describe('Multi TLD tests', function () {

  //to be assigned in the 'before' hook (below)
  var server;

  before(function (done) {
    server = app.listen(config.PORT, config.urls.MULTI_TLD.HOSTNAME, done);
  });

  ///////////////////////////////
  //        example.com        //
  ///////////////////////////////

  it('GET ' + config.urls.MULTI_TLD.BASE_URL, function (done) {
    request('http://'+ config.urls.BASE_URL, function (error, res, body) {
      expect(body).to.equal(responses.main['/']);
      done();
    });
  });

  ///////////////////////////////
  //      api.example.com      //
  ///////////////////////////////

  it('GET ' + config.urls.MULTI_TLD.API_URL, function (done) {
    request('http://' + config.urls.MULTI_TLD.API_URL, function (error, res, body) {
      expect(body).to.equal(responses.api['/']);
      done();
    });
  });

  it('GET ' + config.urls.MULTI_TLD.API_URL + '/users', function (done) {
    request('http://' + config.urls.MULTI_TLD.API_URL + '/users', function (error, res, body) {
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