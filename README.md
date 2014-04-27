#express-subdomain

Is simply express middleware. In the examples below I am using [Express v4.x](http://expressjs.com/).

##Install

With npm, saving it as a dependency.

    npm i express-subdomain --save

``` js
var subdomain = require('express-subdomain');
```

Express boilerplate code:

``` js
var express = require('express');
var app = express();

// example.com
app.get('/', function(req, res) {
    res.send('Homepage');
});
```
    
##Simple usage

Let's say you want to provide a RESTful API via the url `http://api.example.com`

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


##Multi-level Subdomains

``` js
app.use(subdomain('v1.api', router)); //using the same router
```

`http://v1.api.example.com/` --> "Welcome to our API!"

`http://v1.api.example.com/users` --> "[{"name":"Brian"}]"

###Wildcards

Say we wanted to ensure that the user has an API key before getting access to it... and this is across __all__ versions.

_Note_:
In the example below, the passed function to subdomain can be just a pure piece of middleware.

``` js
var checkUser = subdomain('*.*.api', function(req, res, next) {
    if(!req.session.user.valid) {
        return res.send('Permission denied.');
    }
    next();
});

app.use(checkUser);
```
    
This can be used in tandem with the examples above. 

_Note_:
The order in which the calls the app.use() is very important. Read more about it [here](http://expressjs.com/4x/api.html#app.use).

``` js
app.use(checkUser);
app.use(subdomain('v1.api', router));
```

##Divide and Conquer
    
The subdomains can also be chained, for example the we can achieve the same result as above but with more fine grained control.

``` js
var router = express.Router(); //main api router
var v1Routes = express.Router(); 
var v2Routes = express.Router();

//basic routing..
router.get('/', function(req, res) {
    res.send('Welcome to the API!');
});
v1Routes.get('/', function(req, res) {
    res.send('API - version 1');
});
v2Routes.get('/', function(req, res) {
    res.send('API - version 2');
});

//the api middleware flow
router.use(checkUser);
router.use.(subdomain('v1', v1Routes));
router.use.(subdomain('v2', v2Routes));

//attach the api
app.use(subdomain('api', router));
app.listen(3000);
```
    
####Invalid user

`http://api.example.com/` --> Permission denied.

####Valid user
    
`http://api.example.com/` --> Welcome to the API!

`http://v1.api.example.com/` --> API - version 1

`http://v2.api.example.com/` --> API - version 2

#Testing locally

To test the above examples you will need to modify your /etc/hosts file:

    127.0.0.1       example.com
    127.0.0.1       api.example.com
    127.0.0.1       v1.api.example.com
    127.0.0.1       v2.api.example.com

You can then visit any of the above urls on the port passed to `app.list(3000)`.


##TODO

 - Tests
