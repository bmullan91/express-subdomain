var expect = require("chai").expect;
var request = require('request');
var app = require('./app');
var subdomain = require('../');

describe('Validation checks', function () {
  
  it('Should throw an error when no params are passed', function () {
    var fn = function() { subdomain(); };
    expect(fn).to.throw(Error);
  });

  it('Should throw an error when the first param is not a string', function () {
    var fn = function() {
      subdomain(23, function(req, res, next) {});
    };
    expect(fn).to.throw(Error);
  });

  it('Should throw an error when only one param is passed', function () {
    var fn = function() {
      subdomain('sub');
    };
    expect(fn).to.throw(Error);

    var fnn = function() {
      subdomain(function(req, res, next) {})
    };
    expect(fnn).to.throw(Error);
  });

  it('Should throw an error when the second param is not a function', function () {
    var fn = function() {
      subdomain('sub', 'abc');
    };
    expect(fn).to.throw(Error);
  });

  it('Should throw an error when the second param doesnt handle 3 params', function () {
    var fn = function() {
      subdomain('sub', function(req, res) {});
    };
    expect(fn).to.throw(Error);

  });

});

var PORT = 3000;

before(function (done) {
  app.start(PORT, done);
});

describe('Testing the api subdomain', function() {

  it('GET api.example.com:'+PORT+'/ returns index body', function (done) {

    request.get('http://api.example.com:'+PORT, function (error, response, body) {
      expect(body).to.equal(app.response['/']);
      done();

      if (!error && response.statusCode == 200) {}

    });


  });

});








