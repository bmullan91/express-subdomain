var colors = require('colors');
var request = require('request');
var expect = require('chai').expect;

var composableMiddleware = require('composable-middleware');
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
    '/': 'Welcome to our simple API!'
  }
};

//////////////////////////////
//         routes           //
//////////////////////////////
var router = express.Router();

//see https://github.com/bmullan91/express-subdomain/pull/14
router.use(composableMiddleware(
  function(req, res, next) {
    res.additionalInfo = 'Congratulations';
    next();
  },
  function(req, res, next) {
    res.additionalInfo += '! ';
    next();
  }
));

//api specific routes
router.get('/', function(req, res) {
  res.send(res.additionalInfo + responses.api['/']);
});

//////////////////////////////
//       express app        //
//////////////////////////////
var app = express();

app.use(subdomain('api', router));

app.get('/', function (req, res) {
  res.send(responses.main['/']);
});

describe('Composable Middleware tests', function () {

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

  it('GET ' + config.urls.API_URL, function (done) {
    request('http://' + config.urls.API_URL, function (error, res, body) {
      expect(body).to.equal('Congratulations! ' + responses.api['/']);
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