var Post = require('../models/post.js');
var Tag = require('../models/tag.js');
var findTagsByNames = require('../apis/tags-api.js').findTagsByNames;

var authentication = require('../apis/author-api.js').authenticate;

module.exports = function (app) {
    app.delete('/posts', function(req, res) {
        if (authentication(req, res)) {
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
        if (req.body.hasOwnProperty('text')) {
            if (authentication(req, res)) {
                if (req.body.hasOwnProperty('_id')) {   //editing post
                    var id = req.body._id;
                    delete req.body._id;
                    Post.update({ _id: id }, req.body, {}, function (err, numberAffected, raw) {
                        //        Post.findByIdAndUpdate(id, { $set: req.body, $inc: {__v:1} }, {}, function (err, numberAffected, raw){

                        if (err) return res.send(500);
                        console.log('The number of updated documents was %d', numberAffected);
                        console.log('The raw response from Mongo was ', raw);
                        res.send(200);
                    });
                } else {    //creating new post

                    var newPost = new Post(req.body);
                    newPost.save(function (err, savedPost) {
                        if (err) {
                            console.error("Following product failed to save:")
                            res.send(500);

                        }else{
                            console.log("Following post was succesfully saved:" + savedPost);
                            res.json(savedPost);

                        }
                    });
                }
            }
        } else {
            if (req.body.hasOwnProperty('tags')) {  //we just want to filter by some tags
                var tags = req.body.tags;
                findTagsByNames(tags, function () {
                    Post.find({tags: {$in: tags}}).populate('tags').exec(function (err, posts) {
                        if (err) {
                            console.error(err);
                            res.send(500);
                            return;
                        }
//                    console.log(posts);
                        res.json(posts);
                    });
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
        var sortOption;   //default
        if (req.query.sort) {
            sortOption = req.query.sort;
        } else {
            sortOption = -1;
        }
        Post.find(req.query).sort({ createdAt: sortOption }).limit(limit).skip(skip).populate('tags').exec(function (err, posts) {

            if (posts.hasOwnProperty('length')) {
                if (req.query.hasOwnProperty('_id')) {
                    res.json(posts[0]); //we need to return single item

                } else {
                    res.json(posts);    // we are returning an array of items

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

    app.post('/posts/count', function (req, res) {
        var tags = req.body;
        findTagsByNames(tags, function () {
            var index = tags.length;
            var tagsIds = [];
            while (index--) {
                tagsIds.push(tags[index]._id);
            }
            Post.count({tags: {$in: tagsIds}}, function (err, count) {
                if (err) {
                    console.error(err);
                    res.send(500);
                    return;
                }
//                console.log(count);
                res.json(count);
            });

        });
//
    });
};