var Post = require('./models/post.js');
module.exports = function (app) {
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
        if (req.query.skip) {
            skip = req.query.skip;
            delete req.query.skip;
        } else {
            skip = 0;
        }
        if(req.query.limit){
            limit = req.query.limit;
            delete req.query.limit;
        } else {
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
//            console.log('there are %d posts', count);
        });
    });
};