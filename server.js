/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    postsApi = require('./apis/posts-api.js'),
    tagsApi = require('./apis/tags-api.js'),
    author = require('./apis/author-api.js'),
    pjson = require('./package.json'),
    Tag = require('./models/tag.js'),
    mongoose = require('mongoose'),
    Q = require('q'),
    path = require('path');

//var request = require("request"); // unused for now
//var loadedBlogConfig;

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 80);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride())
    app.use(express.static(path.join(__dirname, 'public')));
    var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        next();
    };
    app.use(allowCrossDomain);
    app.use(function (req, res, next) {
        next();
    });
    app.use(app.router);
//  app.use(require('less-middleware')({ src: __dirname + '/public' }));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


mongoose.connect(pjson.mongooseConn);


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
app.set('db', db);
db.once('open', function callback() {
    console.log("DB connection opened");
});
//


author.authorRoutes(app);
postsApi(app);
tagsApi.register(app);

app.get('*', function (req, res) {
    res.sendfile('public/index.html')
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
