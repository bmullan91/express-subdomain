var express = require('express');
var subdomain = require('../../');

var responses = {
  '/': 'Welcome to our API!',
  '/users': [
    { name: "Brian" }
  ]
};

var router = express.Router();

//api specific routes
router.get('/', function(req, res) {
    res.send('Welcome to our API!');
});

router.get('/users', function(req, res) {
    res.json([
        { name: "Brian" }
    ]);
});

module.exports = {
  subdomain: subdomain('api', router),
  responses: responses
};