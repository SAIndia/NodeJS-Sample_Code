var express = require('express');
var bodyParser = require('body-parser');

var jwt = require('../jwt');
var settings = require('../settings');
var router = express.Router();

// gets the demo user from settings
function getUser(username) {
  var user = null;
  settings.demoUsers.forEach(function (u) {
    if (username === u.username) {
      user = u;
    }
  });
  return user;
}

// check if username and password matches ones in the setting (just for demo)
function authenticate(username, password) {
  var authenticated = true;
  var user = getUser(username);
  if (user !== null) {
    return user.password === password;
  }
}

// -- view routes

router.get('/', [bodyParser.urlencoded({ extended: true })], function(req, res, next) {
  // check jwt is valid
  jwt.verifyJwtCookie(req).then(function (payload) {
    // update session user with payload from jwt if necessary
    if (!req.session.user || req.session.user.username !== payload.username) {
      req.session.user = {
        username: payload.username,
        email: payload.email
      };
    }
    // jwt is valid, user is logged in, show services page
    res.render('fread/services', {
      user: req.session.user,
      fred: settings.fred,
      // csrfToken: req.csrfToken()
    });

  }).otherwise(function (err) {
    console.log('Unauthorized', err);
    // invalid jwt, user is not logged in, show login page
    res.render('fread/loginfread', { 
      // csrfToken: req.csrfToken() 
    });
  });
});

router.get('/logout', function(req, res, next) {
  req.session.destroy(function (err) {
    if (err) {
      console.error(err);
    }
    jwt.clear(res);
    res.redirect('/fread/');
  });
});

// -- api routes

router.post('/api/authenticate', [bodyParser.urlencoded({ extended: true })],
   function(req, res, next) {

  console.log('Hit authenticate API - /api/authenticate');
  if (authenticate(req.body.username, req.body.password) === true) {
    // user is authenticated
    var user = getUser(req.body.username);
    // save user in session
    req.session.user = {
      username: user.username,
      email: user.email
    };
    // Create JWT token
    try {
      jwt.create(req, res);
      res.sendStatus(204);
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    // unauthorized
    res.sendStatus(401);
  }
});

// This tests the jwt authentication from nodes in NodeRED
router.post('/api/node/test', [bodyParser.urlencoded({ extended: true })],
   function(req, res, next) {

  console.log('Hit Nodes authenticate API - /api/node/authenticate');
  jwt.verifyJwtHeader(req).then(function (payload) {
    console.log('Successfully authenticated');
    res.status(200).send("Test Passed. Node is authenticated.");
  }).otherwise(function (err) {
    res.status(err.code || 500).send(err.message || err.name);
  });

});

module.exports = router;
