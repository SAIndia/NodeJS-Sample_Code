var jwt = require('jsonwebtoken');
var when = require('when');

var settings = require(__base + 'settings');
var AppError = require(__base + 'error').AppError;

var jwtCookieId = settings.jwt.cookieName || 'saas.jwt';
var jwtSecret = settings.jwt.secret;
var jwtAlgorithm = settings.jwt.algorithm;
var jwtExpiry = settings.jwt.expiry || 2592000;
var jwtCookieDomain = settings.jwt.cookieDomain || 'localhost';
var jwtIsSecure = settings.jwt.cookieSecure || false;

function getCookieDomain(domain) {
  // cookieDomain should be null if it's not set or we're testing locally
  return (domain === "" ||
            typeof domain === 'undefined' ||
            domain === "localhost" ||
            domain === ".localhost") ? null : domain;
}

function isPayloadValid(payload) {
  return (typeof payload !== 'undefined' && 
          typeof payload.email !== 'undefined' && 
          typeof payload.username !== 'undefined');
}

function create(req, res, secret, algorithm, expiry, cookieId, domain, isSecure) {
  if (!req.session.user) {
    throw new AppError("missing user");
  }
  var payload = {
    username: req.session.user.username,
    email: req.session.user.email,
    firstname: req.session.user.username, // we won't use firstname and lastname for this demo
    lastname: "",
  };
  var token = jwt.sign(payload, secret, {
    expiresIn: expiry,
    algorithm: algorithm, 
  });
  // save the jwt token in cookies
  res.cookie(cookieId, token, {
    domain: getCookieDomain(domain),
    maxAge: (expiry*1000), //convert to ms
    httpOnly: true,
    secure: isSecure
  });
  
  console.log('DD:'+getCookieDomain(domain))
}

module.exports = {

  // verify jwt stored in cookies
  verifyJwtCookie: function (req) {
    return when.promise(function (resolve, reject) {
        
      if (!req.cookies || !req.cookies[jwtCookieId]) {
          console.log('inside cookie not found');
          
        return reject(new AppError('jwt cookie not found', 'unauthorized')); // jwt cookie not found
      }
      
      jwt.verify(req.cookies[jwtCookieId], jwtSecret, {
          algorithm: [jwtAlgorithm],
        },
        function (err, payload) { //callback
          if (err) {
            return reject(err); // bad token
          }
          if (isPayloadValid(payload) === false) {
            return reject("Invalid payload in JWT");
          }
          resolve(payload);
      });
    });
  },

  // verify jwt stored in the request headers
  verifyJwtHeader: function (req) {
    return when.promise(function (resolve, reject) {
      var token = req.headers['authorization'];
      if (typeof token === 'undefined') {
        return reject(new AppError('jwt not found in request headers', 'unauthorized'));
      }
      // token should look like:  "Bearer <token_hash>" see: https://jwt.io
      if (token.split(' ')[0] !== 'Bearer') {
        return reject(new AppError('invalid jwt authorization header format', 'unauthorized'));
      } else {
        token = token.split(' ')[1];
      }
      jwt.verify(token, jwtSecret, {
          algorithm: [jwtAlgorithm],
        },
        function (err, payload) { //callback
          if (err) {
            return reject(new AppError(err.name, 'unauthorized')); // bad token
          }
          resolve(payload);
        }
      );
    });
  },

  create: function (req, res) {
    return create(req, res, jwtSecret, jwtAlgorithm, jwtExpiry, jwtCookieId, jwtCookieDomain, jwtIsSecure);
  },

  clear: function (res) {
    res.clearCookie(jwtCookieId, {
        domain: getCookieDomain(jwtCookieDomain),
        httpOnly: true,
    });
  }
}


