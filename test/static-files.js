var colors = require('colors');
var request = require('request');
var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
var express = require('express');

var subdomain = require('../');
var config = require('./config.json');

var configPath = '/config.json';
var readmePath = '/README.md';
var configFileData = fs.readFileSync(path.join(__dirname, configPath), { encoding: 'utf8' });
var readmePathFileData = fs.readFileSync(path.join(__dirname, readmePath), { encoding: 'utf8' });

//////////////////////////////
//    expected responses    //
//////////////////////////////

var staticResponses = {};
staticResponses[configPath] = configFileData;
staticResponses[readmePath] = readmePathFileData;

var responses = {
  main: {
    '/': 'Simple example homepage!'
  },
  static: staticResponses
};

//////////////////////////////
//       express app        //
//////////////////////////////
var app = express();

app.use(subdomain('static', express.static('test')));

app.get('/', function (req, res) {
  res.send(responses.main['/']);
});

describe('Static files', function () {

  //to be assigned in the 'before' hook (below)
  var server;

  before(function (done) {
    server = app.listen(config.PORT, config.HOSTNAME, done);
  });

  ///////////////////////////////
  //        example.com        //
  ///////////////////////////////

  it('GET ' + config.urls.BASE_URL , function (done) {
    request('http://'+ config.urls.BASE_URL, function (error, res, body) {
      expect(body).to.equal(responses.main['/']);
      done();
    });
  });

  ///////////////////////////////
  //    static.example.com     //
  ///////////////////////////////

  it('GET ' + config.urls.STATIC_URL + configPath , function (done) {
    request('http://' + config.urls.STATIC_URL + configPath, function (error, res, body) {
      expect(body).to.equal(responses.static[configPath]);
      done();
    });
  });

  it('GET ' + config.urls.STATIC_URL + readmePath , function (done) {
    request('http://' + config.urls.STATIC_URL + readmePath, function (error, res, body) {
      expect(body).to.equal(responses.static[readmePath]);
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
