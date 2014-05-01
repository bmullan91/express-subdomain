var express = require('express');
var request = require('request');
var expect = require('chai').expect;

var server = require('./server');
var subdomain = require('../');

var PORT          = 3000;
var API_SUBDOMAIN = 'api';
var BASE          = 'example.com';
var HOSTNAME      = API_SUBDOMAIN + '.' +BASE;      // api.example.com
var BASE_URL      = BASE + ':' +PORT;               // example.com:3000
var API_URL       = API_SUBDOMAIN + '.' + BASE_URL; // api.example.com:3000
var V1_API_URL    = 'v1.' + API_URL;                // v1.api.example.com:3000
var V2_API_URL    = 'v2.' + API_URL;                // v2.api.example.com:3000

var app;      // to be assigned in tests
var response; // same here...

describe('Validation checks - They should ALL throw Error\'s', function () {
  
  it('No params are passed', function () {
    var fn = function() { subdomain(); };
    expect(fn).to.throw(Error);
  });

  it('First param is not a string', function () {
    var fn = function () {
      subdomain(23, function (req, res, next) {});
    };
    expect(fn).to.throw(Error);
  });

  it('Only one param is passed', function () {
    var fn = function () {
      subdomain('sub');
    };
    expect(fn).to.throw(Error);

    var fnn = function () {
      subdomain(function (req, res, next) {})
    };
    expect(fnn).to.throw(Error);
  });

  it('Second param is not a function', function () {
    var fn = function () {
      subdomain('sub', 'abc');
    };
    expect(fn).to.throw(Error);
  });

  it('Second param doesnt handle 3 params', function () {
    var fn = function () {
      subdomain('sub', function (req, res) {});
    };
    expect(fn).to.throw(Error);
  });

});


before(function (done) {

  ////////////////////////////////
  // test setup
  ////////////////////////////////
  var router = express.Router(); //api router
  var v1Router = express.Router();
  var v2Router = express.Router();

  response = {
    root: 'Homepage!',
    api: {
      error: 'Permission denied.',
      root: {
        '/': 'Welcome to our API!',
        '/users': [{ name: 'Brian'}]
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

  v1Router.get('/', function(req, res) {
    res.send(response.api.v1['/']);
  });

  v1Router.get('/users', function(req, res) {
    res.send(response.api.v1['/users']);
  });

  v2Router.get('/', function(req, res) {
    res.send(response.api.v2['/']);
  });

  v2Router.get('/users', function(req, res) {
    res.send(response.api.v2['/users']);
  });

  //chaining our subdomains and middleware
  router.use(function (req, res, next) {
    if(req.headers['invalid'] === 'true') {
      return res.end(response.api.error);
    } else {
      res.setHeader("valid", "true");
      next();
    }
  });
  router.use(subdomain('*.v1', v1Router));
  router.use(subdomain('*.v2', v2Router));

  //basic routing..
  router.get('/', function(req, res) {
    res.send(response.api.root['/']);
  });

  router.get('/users', function(req, res) {
    res.send(response.api.root['/users']);
  });

  app = server.create({
    root: response.root,
    subdomains: [{
      path: 'api',
      router: router
    }],
    mw: []
  });

  app.listen(PORT, HOSTNAME, done);

});

describe('Testing the api subdomain', function() {

  ///////////////////////////////
  //        example.com        //
  ///////////////////////////////

  it('GET ' + BASE_URL, function (done) {
    request('http://'+ BASE_URL, function (error, res, body) {
      expect(body).to.equal(response.root);
      done();
    });
  });

  ///////////////////////////////
  //      api.example.com      //
  ///////////////////////////////

  it('GET ' + API_URL + ' * INVALID USER *', function (done) {
    //custom header for testing purposes
    var opts = {
      url: 'http://' + API_URL,
      headers: {
        'invalid': 'true'
      }
    };

    request(opts, function (error, res, body) {
      expect(body).to.equal(response.api.error);
      done();
    });

  });

  it('GET ' + API_URL, function (done) {
    request('http://' + API_URL, function (error, res, body) {
      expect(res.headers['valid']).to.be.equal('true');
      expect(body).to.equal(response.api.root['/']);
      done();
    });
  });

  it('GET ' + API_URL + '/users', function (done) {
    request('http://' + API_URL + '/users', function (error, res, body) {
      expect(res.headers['valid']).to.be.equal('true');
      expect(body).to.equal( JSON.stringify(response.api.root['/users']) );
      done();
    });
  });

  ///////////////////////////////
  //    v1.api.example.com     //
  ///////////////////////////////

  it('GET ' + V1_API_URL + ' * INVALID USER *', function (done) {
    //custom header for testing purposes
    var opts = {
      url: 'http://' + V1_API_URL,
      headers: {
        'invalid': 'true'
      }
    };

    request(opts, function (error, res, body) {
      expect(body).to.equal(response.api.error);
      done();
    });

  });

  it('GET ' + V1_API_URL, function (done) {
    request('http://' + V1_API_URL, function (error, res, body) {
      expect(res.headers['valid']).to.be.equal('true');
      expect(body).to.equal(response.api.v1['/']);
      done();
    });
  });

  it('GET ' + V1_API_URL + '/users', function (done) {
    request('http://' + V1_API_URL + '/users', function (error, res, body) {
      expect(res.headers['valid']).to.be.equal('true');
      expect(body).to.equal( JSON.stringify(response.api.v1['/users']) );
      done();
    });
  });

  //curve ball..
  it('GET abc.' + V1_API_URL, function (done) {
    request('http://abc.' + V1_API_URL, function (error, res, body) {
      expect(res.headers['valid']).to.be.equal('true');
      expect(body).to.equal(response.api.v1['/']);
      done();
    });
  });

  ///////////////////////////////
  //    v2.api.example.com     //
  ///////////////////////////////

  it('GET ' + V2_API_URL + ' * INVALID USER *', function (done) {
    //custom header for testing purposes
    var opts = {
      url: 'http://' + V2_API_URL,
      headers: {
        'invalid': 'true'
      }
    };

    request(opts, function (error, res, body) {
      expect(body).to.equal(response.api.error);
      done();
    });

  });

  it('GET ' + V2_API_URL, function (done) {
    request('http://' + V2_API_URL, function (error, res, body) {
      expect(res.headers['valid']).to.be.equal('true');
      expect(body).to.equal(response.api.v2['/']);
      done();
    });
  });

  it('GET ' + V2_API_URL + '/users', function (done) {
    request('http://' + V2_API_URL + '/users', function (error, res, body) {
      expect(res.headers['valid']).to.be.equal('true');
      expect(body).to.equal( JSON.stringify(response.api.v2['/users']) );
      done();
    });
  });

  //curve ball..
  it('GET abc.' + V2_API_URL, function (done) {
    request('http://abc.' + V2_API_URL, function (error, res, body) {
      expect(res.headers['valid']).to.be.equal('true');
      expect(body).to.equal(response.api.v2['/']);
      done();
    });
  });

});
