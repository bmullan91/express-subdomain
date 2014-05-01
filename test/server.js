module.exports = {
  /*
    Very simple factory for creating an express app

    config = {
      root: 'root response body',
      subdomains: [
        {
          path: 'api',
          router: fn 
        },
        {
          ...
        }
      ],
      mw: [fn, fn]
    }
  */
  create: function(config) {
    config = config || {};

    var subdomain = require('../');
    var express = require('express');
    var app = express();

    //check if thers is any passed middleware
    if(config.mw) {
      config.mw.forEach(function (mw) {
        app.use(mw);
      });
    }

    if(config.subdomains) {
      config.subdomains.forEach(function (sub) {
        app.use(subdomain(sub.path, sub.router));
      });
    }

    //default respose
    app.get('/', function(req, res) {
      res.end(config.root);
    });

    return app;
  } 
};
