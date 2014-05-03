var request = require('request');
var expect = require('chai').expect;
var subdomain = require('../');

describe('Validation checks', function () {
  
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
