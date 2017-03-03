// Set base directory path to blobal variable tobe used to reuire other files/modules
global.__base = __dirname + '/';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');

var cons = require('consolidate');
var nunjucks = require('nunjucks');

/**
 * Include application routes here
 */
var routes = require('./routes/index');
var demo = require('./routes/demo');
var building = require('./routes/building');
var equipment = require('./routes/equipment');
var controller = require('./routes/controller');
var alarm = require('./routes/alarm');
var nodeRedApi = require('./routes/node-red-api');
var dashboard = require('./routes/dashboard');
var user = require('./routes/user');
var nodeRED = require('./routes/node-red');
var fread = require('./routes/fread');



var app = express();

// Connecting database with "bluebird" promise library
mongoose.Promise = require('bluebird');
//mongoose.connect('mongodb://192.168.0.124:27017/ba-saas');
mongoose.connect('mongodb://192.168.0.235:27017/ba-saas');

var db = mongoose.connection;
//db.on('error', console.error.bind(console, 'connection error:'));
db.on('error', function () {
    console.log('database connection failed');
});
db.once('open', function () {
    console.log('database connected');
});

// set basedir for views
app.locals.basedir = path.join(__dirname, 'views');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

var LocalStrategy = require('passport-local').Strategy;
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

/**
 * Custom express middleware to store authenticated user to res object, which can then be used in any view file.
 */
app.use(function (req, res, next) {
    if (req.user) {
        res.locals.user = req.user;
    }
    next();
});

app.use('/', routes);
app.use('/demo', demo);
app.use('/building', building);
app.use('/equipment', equipment);
app.use('/controller', controller);
app.use('/node-red-api', nodeRedApi);
app.use('/alarm', alarm);
app.use('/dashboard', dashboard);
app.use('/user', user);
app.use('/node-red', nodeRED);
app.use('/fread', fread);


app.use(session({
    store: new session.MemoryStore(),
    name: 'saas.sid',
    secret: 'sessionCookieSecret',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));


// passport config
var Account = require(__base + 'models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;