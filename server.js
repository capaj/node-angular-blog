
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    pjson = require('./package.json'),
    Post = require('./models/post.js'),
    blogConfig = require('./models/blogConfig.js'),
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
db.once('open', function callback () {



//    fluffy.save(function (err, fluffy) {
//        if (err) // TODO handle the error
//        {fluffy.speak();}
//        console.log("fluffy saved");
//    });

    Post.find(function (err, posts) {
        //posts[0].remove();
        console.log(posts)
    });
    blogConfig.findOne(function (err, blogConfig) {
        //posts[0].remove();
        if (blogConfig) {
            console.log(blogConfig);
            loadedBlogConfig = blogConfig;
        } else {
            console.log("No config found-you better setup your admin account now");

        }
    });

    console.log("DB connection opend");
});

//
//var post1 = new Post({author:"Filip", title: 'Filip je the best', text:"no to určitě" });
//var post2 = new Post({author: "Jirka", title: 'Jirka je the best', text:"bez pochyb"});
//post1.save();
//post2.save();

//app.get('*', postsModel, [post1, post2]);
var authenticateUser = function (req, res) {
    if (req.body.facebookToken !== loadedBlogConfig.lastToken) {
        res.send(401);
        return false;
    }
    return true;
};

app.delete('/posts', function(req, res) {
    if (authenticateUser(req, res)) {
        if (Object.keys(req.query).length != 0) {
            Post.remove(req.query, function(err, product){
                if (err) return res.send(500);
                console.log("Removed this");
                console.dir(product);
                res.send(200);
            });
        } else {
            res.send(400);
        }
    }

});

app.post('/posts', function(req, res){
    if (authenticateUser(req, res)) {
        var id = req.body._id;
        if (id) {
            delete req.body._id;
            Post.update({ _id: id }, req.body, {}, function (err, numberAffected, raw) {
    //        Post.findByIdAndUpdate(id, { $set: req.body, $inc: {__v:1} }, {}, function (err, numberAffected, raw){

                if (err) return res.send(500);
                console.log('The number of updated documents was %d', numberAffected);
                console.log('The raw response from Mongo was ', raw);
                res.send(200);
            });
        } else {

            var newPost = new Post(req.body);
            newPost.save(function (err, product) {
                if (err) {
                    console.error("Following product failed to save:")
                    res.send(500);

                }else{
                    console.log("Following product was succesfully saved:");
                    res.send(200);

                }
                console.dir(product);
            });
        }
    }
});

app.get('/posts', function (req, res) {
    var skip, limit;
    if (req.query.skip && req.query.limit) {
        skip = req.query.skip;
        limit = req.query.limit;
        delete req.query.skip;
        delete req.query.limit;
    }
    else {
        skip = 0;
        limit = 3;
    }
    Post.find(req.query).limit(limit).skip(skip).exec(function (err, posts) {

        if (posts !== null) {
            if (posts.length == 1) {
                res.json(posts[0]);

            } else {
                res.json(posts);

            }
        } else {
            res.send(400);
        }

        res.end();
    });
});

app.get('/posts/count', function (req, res) {
    Post.count(function (err, count) {
        if (err){
            res.send(400);
        }
        res.json(count);
        console.log('there are %d posts', count);
    });
});


app.get('/author', function (req, res) {
    if (!loadedBlogConfig) {
        res.send(400);
    } else {
        res.send(loadedBlogConfig.adminFBAcc);
    }
});

app.post('/author', function (req, res) {
    if (req.body.token) {
        var initConfig = new blogConfig({lastToken: req.body});
        initConfig.getFBAccFromToken(initConfig.lastToken).then(function (FBacc) {
            initConfig.save();
            loadedBlogConfig = initConfig;
            res.send(loadedBlogConfig.adminFBAcc);
        }, function (err) {
            res.send(500);
        });
    }
});

app.get('*', function (req, res) {
    res.sendfile('public/index.html')
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
