app.controller('edit', function($scope, author, Post, $location, $resource ) {
    var query = $location.search();
    $scope.tagsInputInit = {
        suggestions : [],   // this will be filled with tags form server
//            restrictTo : ["restrict", "to", "these"],
        whenAddingTag : function (tag) {
            var serverArrIndex = $scope.tagsInputInit.data.suggestions.indexOf(tag);
            if (serverArrIndex === -1) {
                var newTag = new Tag({name: tag});
                newTag.$save(function (createdTag) {
                    tagsOnServer.push(createdTag);
                });
            }
        }
    };

    var Tag = $resource('/tags');
    var tagsOnServer = Tag.query(function (tags) {
        console.log(tags);
        var index = tags.length;
        while(index--) {
            $scope.tagsInputInit.data.suggestions.push(tags[index].name);
        }
    });

    function prepareTagsIdsInPost() {   // tags need to be sent to server as string IDs, but they come to us as objects, so we have to extract just _id field before sending it back
        $scope.post.tags = [];
        var tagStrings = $scope.tagsInputInit.data.getTags();
        var index = tagStrings.length;
        while (index--) {
            var oneTag = tagStrings[index];
            var filtered = tagsOnServer.filter(function (elem) {
                return elem.name === oneTag;
            });
            if (filtered.length === 1) {
                $scope.post.tags.push(filtered[0]._id);
            } else {
                console.warn("there is a tag which does not exist on server, tag probably was not created on the server and is ignored");
            }
        }
    }

    if (query._id) {
        $scope.post = Post.get({_id:query._id}, function (post) {
            var index = post.tags.length;
            while(index--) {
                $scope.tagsInputInit.data.addTag(post.tags[index].name);
            }
        });
        $scope.saveChanges = function () {
            prepareTagsIdsInPost();
            Post.save({_id: query._id} , $scope.post);
//
//            $scope.post.$save(function () {
//                console.log("post changes saved: " + $scope.post);
//            });
        };
    } else {

        $scope.post = new Post({createdAt: moment()});

        $scope.create = function () {
            prepareTagsIdsInPost();
            $scope.post.$save(function () {
                console.log("new post created: " + $scope.post);
            });
        }
    }

});