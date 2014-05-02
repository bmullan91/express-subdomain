module.exports = {
  /**
    * A simple factory for creating an express app's 
    *
    * @param config {Object} app configuration, see example below
    *
    *  {
    *    mw: [fn, fn],
    *    root: [
    *      {
    *        path: '/',
    *        method: 'get',
    *        response: 'hello world'
    *      }
    *    ]
    *  }
    */
  create: function(config) {
    config = config || {};

    var express = require('express');
    var app = express();

    //check if thers is any passed middleware
    if(config.mw) {
      config.mw.forEach(function (mw) {
        app.use(mw);
      });
    }

    config.root.forEach(function (handler) {
      app[handler.method](handler.path, function (req, res) {
        res.send(handler.response || '');
      });
    });

    return app;
  } 
};
