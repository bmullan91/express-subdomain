var subdomain = require('../');
var express = require('express');
var app = express();
var router = express.Router(); //api router

//store the expected resposes
var response = {
  '/': 'Welcome to our API!',
  '/users': [{ name: "Brian" }]
};

router.get('/', function(req, res) {
    res.send(response['/']);
});

router.get('/users', function(req, res) {
    res.json(response['/users']);
});

app.use(subdomain('api', router));

app.get('/', function(req, res) {
  res.end('Main index!')
});

module.exports = {
  start: function(port, cb) {
    app.listen(port, 'api.example.com', cb);
  },
  response: response 
};