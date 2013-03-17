
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    postsApi = require('./posts-api.js'),
    author = require('./author.js'),
    pjson = require('./package.json'),
    Post = require('./models/post.js'),
    mongoose = require('mongoose'),
    path = require('path');
var request = require("request");

var loadedBlogConfig;
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

    Post.find(function (err, posts) {
        //posts[0].remove();
        console.log(posts)
    });

    console.log("DB connection opend");
});
//
//var post1 = new Post({author:"Filip", title: 'Filip je the best', text:"no to určitě" });
//var post2 = new Post({author: "Jirka", title: 'Jirka je the best', text:"bez pochyb"});
//post1.save();
//post2.save();

author.authorRoutes(app);
postsApi(app);

app.get('*', function (req, res) {
    res.sendfile('public/index.html')
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
