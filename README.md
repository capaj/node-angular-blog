node-angular-blog
=================
DISCLAIMER: it is unfinished and not a very good example of how to write a blog. If you want a blog, you shouldn't use angular. Use backend rendering or isomorphic rendering(react.js) so that your SEO is possible.
DISCLAIMER END

simple blog based on MEAN stack - nodejs, expressjs, mongoose and angularjs on client side

This could not be done without Angular UI libraries.

Implemented:
pagination, post editing, list of post by a certain tag

planned features:
admin authorization via Facebook

In order to see some data when you first run it, you can use this script to fill DB with some fake data:
    var Post = require('./models/post.js');

    db.once('open', function callback() {
        console.log("DB connection opened");
        var tag1 = new Tag({ name: 'testTag1' });
        var tag2 = new Tag({ name: 'testTag2' });
        var deferred1 = Q.defer();
        var deferred2 = Q.defer();
        tag1.save(deferred1.makeNodeResolver());
        tag2.save(deferred2.makeNodeResolver());
        Q.allResolved([deferred1, deferred2]).then(function (obj) {
            console.log("ids are " + tag1._id + ' and' + tag2._id);
            var post1 = new Post({title: 'TestPost1', text:"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", tags: [tag1._id] });
            post1.save();

            var post2 = new Post({author: "Admin", title: 'Lorem...', text:"Lorem ipsum dolor sit amet, consectetur ...."});
            post2.save();
        });
        Post.find({tags: {$in: tagsIds}}).exec(function (err, posts) {
            if (err) {
                console.error(err);
                res.send(500);
                return;
            }
            console.log(posts);
        });

        // find and remove example
        Post.find(function (err, posts) {
            posts[0].remove();
            console.log(posts)
        });
    });




Copyright 2013 Jiří Špác General MIT License if not specified else in file header.
