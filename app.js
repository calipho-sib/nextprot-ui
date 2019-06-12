'use strict';

var express = require('express');
var http = require('http');
var path = require('path');
var app = exports.app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/build');
app.set('view engine', 'ejs');
//app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.bodyParser());
//app.use(express.methodOverride());

var cookieParser = require('cookie-parser')
var errorHandler = require('errorhandler')

app.use(cookieParser());

//app.use(express.cookieParser('my-super-secret-123'));
//app.use(express.compress());
app.use(express.static(path.join(__dirname, '/build')));
// Render *.html files using ejs
app.engine('html', require('ejs').__express);

app.use(errorHandler());

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
  var exec = require('child_process').exec;
  exec('node_modules/brunch/bin/brunch watch', function callback(error, stdout, stderr) {
    if (error) {
      console.log('An error occurred while attempting to start brunch.\n' +
        'Make sure that it is not running in another window.\n');
      throw error;
    }
  });
};

//TEMPORARY FOR NEW DESIGN IMPLEMENTATION
app.get('/viewers/*', function (req, res) {
  console.log("redirecting viewers");
  var urlViewers = 'https://dev-search.nextprot.org';
  var redirectURL = urlViewers + req.url;
  res.redirect(redirectURL);
});

app.all('/*/*/*.html', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'content-Type,x-requested-with');
  res.redirect(req.url);
});

app.all('/*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'content-Type,x-requested-with');
  next();
});


app.get('/db/results/showResults/*', function (req, res) {
  var np1Host = 'http://localhost:8090';
  var redirectURL = np1Host + req.url;
  console.log("pattern 1: redirecting " + req.url + " to " + redirectURL);
  res.redirect(redirectURL);
});



app.get('/db/entry/:entry/sequence', function (req, res) {
  var entry = req.params.entry;
  var redirectURL = '/entry/' + entry + '/view/sequence';
  console.log("pattern 2: redirecting " + req.url + " to " + redirectURL);
  res.redirect(redirectURL);
});
app.get('/db/entry/:entry/proteomics', function (req, res) {
  var entry = req.params.entry;
  var redirectURL = '/entry/' + entry + '/view/proteomics';
  console.log("pattern 3: redirecting " + req.url + " to " + redirectURL);
  res.redirect(redirectURL);
});
app.get('/db/entry/:entry/structures', function (req, res) {
  var entry = req.params.entry;
  var redirectURL = '/entry/' + entry + '/view/structures';
  console.log("pattern 4: redirecting " + req.url + " to " + redirectURL);
  res.redirect(redirectURL);
});

app.get('/db/*', function (req, res) {
  var redirectURL = req.url.replace("/db", "");
  console.log("pattern 5: redirecting " + req.url + " to " + redirectURL);
  res.redirect(redirectURL);
});

app.get('/', function (req, res) {
  res.render('index.html');
});


//
// this use is called after all assets requests
app.use(function (req, res) {
  res.render('index.html');
});

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});

