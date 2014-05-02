var express = require('express');
var subdomain = require('../../');

var router = express.Router(); //api router
var v1Router = express.Router();
var v2Router = express.Router();

var responses = {
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
};

/////////////////////////////////
//        Routes
/////////////////////////////////

v1Router.get('/', function(req, res) {
  res.send(responses.v1['/']);
});

v1Router.get('/users', function(req, res) {
  res.send(responses.v1['/users']);
});

v2Router.get('/', function(req, res) {
  res.send(responses.v2['/']);
});

v2Router.get('/users', function(req, res) {
  res.send(responses.v2['/users']);
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
  res.send(responses.root['/']);
});

router.get('/users', function(req, res) {
  res.send(responses.root['/users']);
});

//////////////////////////////////
// Expose The subdomain mw
// & its responses to test against
//////////////////////////////////

module.exports = {
  mw: subdomain('api', router),
  responses: responses 
};