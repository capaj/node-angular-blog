var blogConfig = require('./../models/blogConfig.js');
var loadedBlogConfig;

module.exports = {
    authenticate: function (req, res) {
        return true;
        // TODO remove above line when authentication will be possible
        if (req.body.facebookToken !== loadedBlogConfig.lastToken) {
            res.send(401);
            return false;
        }
        return true;
    },

    authorRoutes: function (app) {
        var db = app.get('db');
        db.once('open', function callback() {
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

//        app.post('/registerAuthor',function (req, res) {
//            if (loadedBlogConfig) {
//                res.send(400);  // blog author already setup
//            } else {
//
//            }
//        });

        app.get('/author', function (req, res) {
            if (!loadedBlogConfig) {
                res.json(null);
            } else {
                res.json(loadedBlogConfig.adminFBAcc);
            }
        });

        app.post('/author', function (req, res) {   // should be called only once for a blog
            if (loadedBlogConfig) {
                res.send(400);  // blog author already setup
            } else {
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
            }

        });

        app.post('/registerToken', function (req, res) {
            if (loadedBlogConfig) {
                if (req.body.token) {
                    loadedBlogConfig.getFBAccFromToken(req.body.token).then(function (FBacc) {
                        if (req.body.id = FBacc.id) {
                            res.send(200);
                            loadedBlogConfig.lastToken = req.body.token;
                        }
                    });    
                }
            } else {
                res.send(400);  //
            }

        });
    }
};