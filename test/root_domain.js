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
    '/': 'Simple example homepage!',
  },
  api: {
    '/users': [{ name: "Brian" }]
  }
};

//////////////////////////////
//         routes           //
//////////////////////////////
var apiRouter = express.Router();
var mainRouter = express.Router();

//api specific routes
apiRouter.get('/users', function(req, res) {
    res.json(responses.api['/users']);
});


//main specific routes
mainRouter.get('/', function(req, res) {
    res.send(responses.main['/']);
});

//////////////////////////////
//       express app        //
//////////////////////////////
var app = express();

app.use(subdomain('api', apiRouter));
app.use(subdomain('@', mainRouter));

describe('root domain test', function () {

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
      expect(error).to.be.an('error');
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
