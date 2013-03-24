app.controller('home', function($scope, Post, $location, $http) {
    $scope.params = $location.search();
    $scope.browsedTags = [];
    for(var prop in $scope.params){
        if (prop.indexOf('tag') !== -1) {
            $scope.browsedTags.push($scope.params[prop]);
        }
    }
    var pagination = $scope.pagination = {

        setPageSize: function (size) {
            $location.search('limit', size);
        },
        goToPage: function (page) {
            page--;
            $location.search('skip', page * pagination.limit);
        },
        pageSizeOptions: [5,10,20],
        limit: $location.search().limit || 5,
        skip: $location.search().skip || 0
    };
    pagination.currentPage = Math.floor(pagination.skip/pagination.limit)+1;

    var httpOpt = {
        cache: true,
        timeout: 30000
    };

    var calculatePagination = function (count) {
        pagination.pageCount = Math.floor(count/pagination.limit);
        if (count % pagination.limit !== 0) {
            pagination++;
        }
    };
    if ($scope.browsedTags.length === 0) {
        $http.get('/posts/count/', httpOpt ).success(calculatePagination);
    } else {
        $http.post('/posts/count/', $scope.browsedTags, httpOpt).success(calculatePagination);
    }

    var queryParams = {limit:pagination.limit, skip:pagination.skip };
    if ($scope.browsedTags.length === 0) {
        $scope.posts = Post.query(queryParams);

    } else {
        $scope.posts = Post.queryWithTag(queryParams, {tags: $scope.browsedTags});

    }

    $scope.deletePost = function (post) {
        var index = $scope.posts.indexOf(post);
        post.$delete({_id: post._id}, function () {
            $scope.posts.splice(index, 1);
            console.log("a post deleted");
        }, function () {
            console.error("err occured while deleting");
        });
    };

    $scope.editPost = function (post) {
        $location.path('/posts/edit');
        $location.search('_id', post._id)

    };


});