[![Build Status](https://travis-ci.org/bmullan91/express-subdomain.svg?branch=master)](https://travis-ci.org/bmullan91/express-subdomain) [![Coverage Status](https://coveralls.io/repos/bmullan91/express-subdomain/badge.png?branch=master)](https://coveralls.io/r/bmullan91/express-subdomain?branch=master)

# express-subdomain

Is simply express middleware. In the examples below I am using [Express v4.x](http://expressjs.com/).

## Install

With npm, saving it as a dependency.

    npm i express-subdomain --save

## Simple usage

Let's say you want to provide a RESTful API via the url `http://api.example.com`

#### Express boilerplate code:

``` js
var subdomain = require('express-subdomain');
var express = require('express');
var app = express();

// *** Code examples below go here! ***

// example.com
app.get('/', function(req, res) {
    res.send('Homepage');
});

```

#### API Router

``` js
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
```

Now register the subdomain middleware:
``` js
app.use(subdomain('api', router));
app.listen(3000);
```
The API is alive:

`http://api.example.com/` --> "Welcome to our API!"

`http://api.example.com/users` --> "[{"name":"Brian"}]"


## Multi-level Subdomains

``` js
app.use(subdomain('v1.api', router)); //using the same router
```

`http://v1.api.example.com/` --> "Welcome to our API!"

`http://v1.api.example.com/users` --> "[{"name":"Brian"}]"

### Wildcards

Say you wanted to ensure that the user has an API key before getting access to it... and this is across __all__ versions.

_Note_:
In the example below, the passed function to subdomain can be just a pure piece of middleware.

``` js
var checkUser = subdomain('*.api', function(req, res, next) {
    if(!req.session.user.valid) {
        return res.send('Permission denied.');
    }
    next();
});

app.use(checkUser);
```

This can be used in tandem with the examples above.

_Note_:
The order in which the calls to app.use() is very important. Read more about it [here](http://expressjs.com/4x/api.html#app.use).

``` js
app.use(checkUser);
app.use(subdomain('v1.api', router));
```

## Divide and Conquer

The subdomains can also be chained, for example to achieve the same behaviour as above:

``` js
var router = express.Router(); //main api router
var v1Routes = express.Router();
var v2Routes = express.Router();

v1Routes.get('/', function(req, res) {
    res.send('API - version 1');
});
v2Routes.get('/', function(req, res) {
    res.send('API - version 2');
});

var checkUser = function(req, res, next) {
    if(!req.session.user.valid) {
        return res.send('Permission denied.');
    }
    next();
};

//the api middleware flow
router.use(checkUser);
router.use(subdomain('*.v1', v1Routes));
router.use(subdomain('*.v2', v2Routes));

//basic routing..
router.get('/', function(req, res) {
    res.send('Welcome to the API!');
});

//attach the api
app.use(subdomain('api', router));
app.listen(3000);
```

#### Invalid user

`http://api.example.com/` --> Permission denied.

#### Valid user

`http://api.example.com/` --> Welcome to the API!

`http://v1.api.example.com/` --> API - version 1

`http://abc.v1.api.example.com/` --> API - version 1

`http://v2.api.example.com/` --> API - version 2

`http://abc.v2.api.example.com/` --> API - version 2

## Developing Locally

If you plan to use this middleware while developing locally, you'll have to
ensure that your subdomain is listed in your hosts file.

On Linux or OSX, add your subdomain to `/etc/hosts`:
```
127.0.0.1       myapp.dev
127.0.0.1       subdomain.myapp.dev
```

You may not have write permissions on your hosts file, in which case you can
grant them:
```
$ sudo chmod a+rw /etc/hosts
```

_Note_:
Express parses the request URL for a top level domain, so developing locally
without one won't be possible because Express will treat the subdomain as the
domain, and the actual domain as a TLD.

#### Windows

On Windows 7 and 8, the hosts file path is `%systemroot%\system32\drivers\etc`.

## Gotchas

Multilevel TLD's, such as `.co.uk` you have to pass `api.example` as the _subdomain_:

```js
app.use(subdomain('api.example', router));
```
See https://github.com/bmullan91/express-subdomain/issues/17 for more info.

## Need in-depth examples?

Have a look at the [tests](https://github.com/bmullan91/express-subdomain/tree/master/test)!
