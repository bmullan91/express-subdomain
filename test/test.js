var colors = require('colors');
var request = require('request');
var expect = require('chai').expect;

var server = require('./server');
var subdomain = require('../');

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

describe('Testing the api subdoain, and its various levels', function() {
  var PORT          = 3000;
  var API_SUBDOMAIN = 'api';
  var BASE          = 'example.com';
  var HOSTNAME      = API_SUBDOMAIN + '.' +BASE;      // api.example.com
  var BASE_URL      = BASE + ':' +PORT;               // example.com:3000
  var API_URL       = API_SUBDOMAIN + '.' + BASE_URL; // api.example.com:3000
  var V1_API_URL    = 'v1.' + API_URL;                // v1.api.example.com:3000
  var V2_API_URL    = 'v2.' + API_URL;                // v2.api.example.com:3000

  describe('Simple example', function () {

    //to be assigned in the 'before' hook (below)
    var appServer; 
    var responses;

    before(function (done) {

      ////////////////////////////////
      // test setup
      ////////////////////////////////
      var simpleExample = require('./examples/simple');
      var rootResp = 'Simple example homepage!';
      var app = server.create({
        mw: [simpleExample.subdomain],
        root:[{
          path: '/',
          method: 'get',
          response: rootResp
        }]
      });

      responses = simpleExample.responses;
      responses.rootResp = rootResp;
      appServer = app.listen(PORT, HOSTNAME, done);

    });

    ///////////////////////////////
    //        example.com        //
    ///////////////////////////////

    it('GET ' + BASE_URL, function (done) {
      request('http://'+ BASE_URL, function (error, res, body) {
        expect(body).to.equal(responses.rootResp);
        done();
      });
    });

    ///////////////////////////////
    //      api.example.com      //
    ///////////////////////////////

    it('GET ' + API_URL, function (done) {
      request('http://' + API_URL, function (error, res, body) {
        expect(body).to.equal(responses['/']);
        done();
      });
    });

    it('GET ' + API_URL + '/users', function (done) {
      request('http://' + API_URL + '/users', function (error, res, body) {
        expect(body).to.equal( JSON.stringify(responses['/users']) );
        done();
      });
    });

    after(function(done) {
      appServer.close(function() {
        console.log('\t ♻ server recycled'.cyan);
        done();
      });
    });

  });


  describe('Divide and Conquer example', function () {

    //to be assigned in the 'before' hook (below)
    var appServer; 
    var responses;

    before(function (done) {

      ////////////////////////////////
      // test setup
      ////////////////////////////////
      var api = require('./examples/divideAndConquer');
      var rootResp = 'Divide and conquer homepage!';
      var app = server.create({
        mw: [api.mw],
        root:[{
          path: '/',
          method: 'get',
          response: rootResp
        }]
      });

      responses = api.responses;
      responses.rootResp = rootResp;
      appServer = app.listen(PORT, HOSTNAME, done);

    });

    ///////////////////////////////
    //        example.com        //
    ///////////////////////////////

    it('GET ' + BASE_URL, function (done) {
      request('http://'+ BASE_URL, function (error, res, body) {
        expect(body).to.equal(responses.rootResp);
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
        expect(body).to.equal(responses.error);
        done();
      });

    });

    it('GET ' + API_URL, function (done) {
      request('http://' + API_URL, function (error, res, body) {
        expect(res.headers['valid']).to.be.equal('true');
        expect(body).to.equal(responses.root['/']);
        done();
      });
    });

    it('GET ' + API_URL + '/users', function (done) {
      request('http://' + API_URL + '/users', function (error, res, body) {
        expect(res.headers['valid']).to.be.equal('true');
        expect(body).to.equal( JSON.stringify(responses.root['/users']) );
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
        expect(body).to.equal(responses.error);
        done();
      });

    });

    it('GET ' + V1_API_URL, function (done) {
      request('http://' + V1_API_URL, function (error, res, body) {
        expect(res.headers['valid']).to.be.equal('true');
        expect(body).to.equal(responses.v1['/']);
        done();
      });
    });

    it('GET ' + V1_API_URL + '/users', function (done) {
      request('http://' + V1_API_URL + '/users', function (error, res, body) {
        expect(res.headers['valid']).to.be.equal('true');
        expect(body).to.equal( JSON.stringify(responses.v1['/users']) );
        done();
      });
    });

    //curve ball..
    it('GET c.b.a.' + V1_API_URL, function (done) {
      request('http://c.b.a.' + V1_API_URL, function (error, res, body) {
        expect(res.headers['valid']).to.be.equal('true');
        expect(body).to.equal(responses.v1['/']);
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
        expect(body).to.equal(responses.error);
        done();
      });

    });

    it('GET ' + V2_API_URL, function (done) {
      request('http://' + V2_API_URL, function (error, res, body) {
        expect(res.headers['valid']).to.be.equal('true');
        expect(body).to.equal(responses.v2['/']);
        done();
      });
    });

    it('GET ' + V2_API_URL + '/users', function (done) {
      request('http://' + V2_API_URL + '/users', function (error, res, body) {
        expect(res.headers['valid']).to.be.equal('true');
        expect(body).to.equal( JSON.stringify(responses.v2['/users']) );
        done();
      });
    });

    //curve ball..
    it('GET c.b.a.' + V2_API_URL, function (done) {
      request('http://c.b.a.' + V2_API_URL, function (error, res, body) {
        expect(res.headers['valid']).to.be.equal('true');
        expect(body).to.equal(responses.v2['/']);
        done();
      });
    });

    after(function(done) {
      appServer.close(function() {
        console.log('\t ♻ server recycled'.cyan);
        done();
      });
    });


  });

});
