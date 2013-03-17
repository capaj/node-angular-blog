var blogConfig = require('./models/blogConfig.js');
var loadedBlogConfig;

module.exports = {
    authenticate: function (req, res) {
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
    }
};