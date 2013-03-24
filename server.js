
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    postsApi = require('./apis/posts-api.js'),
    tagsApi = require('./apis/tags-api.js'),
    author = require('./author.js'),
    pjson = require('./package.json'),
    Post = require('./models/post.js'),
    Tag = require('./models/tag.js'),
    mongoose = require('mongoose'),
    Q = require('q'),
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
//    var tag1 = new Tag({ name: 'testTag1' });
//    var tag2 = new Tag({ name: 'testTag2' });
//    var deferred1 = Q.defer();
//    var deferred2 = Q.defer();
//    tag1.save(deferred1.makeNodeResolver());
//    tag2.save(deferred2.makeNodeResolver());
//    Q.allResolved([deferred1, deferred2]).then(function (obj) {
//        console.log("ids are " + tag1._id + ' and' + tag2._id);
//        var post1 = new Post({title: 'With tag je the best 22222', text:"testting tags 2222222222222222", tags: ['514f0a738cb944c00f000001'] });
//        post1.save();
//    });
//    Post.find({tags: {$in: tagsIds}}).exec(function (err, posts) {
//        if (err) {
//            console.error(err);
//            res.send(500);
//            return;
//        }
//        console.log(posts);
//    });

//
//    Post.find(function (err, posts) {
//        //posts[0].remove();
//        console.log(posts)
//    });

    console.log("DB connection opend");
});
//
//var post2 = new Post({author: "Jirka", title: 'Jirka je the best', text:"bez pochyb"});
//post2.save();

author.authorRoutes(app);
postsApi(app);
tagsApi.register(app);

app.get('*', function (req, res) {
    res.sendfile('public/index.html')
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
