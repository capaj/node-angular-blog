
'use strict';

var app = angular.module('node-blog', ['ngSanitize','ngResource', 'ui', 'ui.bootstrap'])
    .config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {

        $locationProvider.html5Mode(true);

//        delete $httpProvider.defaults.headers.common['X-Requested-With'];   // needed for functional CORS
//        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'; // needed for functional CORS


            $routeProvider.when('/', {
                templateUrl   : '/templates/home.html',
                controller : 'home'
            });
            $routeProvider.when('/static/:staticUrl', {
                templateUrl   : '/templates/static/static.html',
                controller : 'static',
                reloadOnSearch: false
            });
            $routeProvider.when('/posts/edit', {
                templateUrl   : '/templates/edit.html',
                controller : 'edit',
                reloadOnSearch: false
            });

        $routeProvider.otherwise({redirectTo:'/404'});
    }]).run(
    function($rootScope, facebook, $http, $q, $location){
        $rootScope.safeApply = function(fn) {   //this can get rid of digest phase errors
            var phase = this.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

        var authorInfoPromise = $http.get('/author',  {
            cache: true,
            timeout: 30000
        }).success(
            function (data) {
                if (data.id) {
                    $rootScope.author = data;
                } else {    //author not yet registered, so

                }
            }
        );

        facebook.promise.then(function (token) {
            console.log("token: " + token);
        });

        $q.all([authorInfoPromise, facebook.promise]).then(function () {
            if ($rootScope.author.id === facebook.me.id) {
                $http.get('/author/' + facebook.token,  {
                    cache: false,
                    timeout: 30000
                }).success(function (data) {
                    $rootScope.author = data;
                });
            }
        });


    }
);


app.controller('home', function($scope, $resource, $location, $http) {
    //$scope.posts = $resource;
    var Posts = $resource('/posts/');
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
    $http.get('/posts/count',  {
        cache: true,
        timeout: 30000
    }).success(
        function (count) {
            pagination.pageCount = Math.floor(count/pagination.limit)+1;

        }
    );

    $scope.posts = Posts.query({limit:pagination.limit, skip:pagination.skip });

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

app.controller('main', function($scope) {
  $scope.isAdmin = true;
  $scope.blogName = "Capaj's cage";

});

app.controller('edit', function($scope, author, $resource, $location ) {
    var Posts = $resource('/posts/');
    var query = $location.search();
    if (query._id) {
        $scope.post = Posts.get({_id:query._id});
        $scope.saveChanges = function () {
            Posts.save({_id: query._id} , $scope.post);
//
//            $scope.post.$save(function () {
//                console.log("post changes saved: " + $scope.post);
//            });
        };
    } else {
        $scope.post = new Posts({author: author.name});
        $scope.author = author;
        $scope.create = function () {
            $scope.post.$save(function () {
                console.log("new post created: " + $scope.post);
            });
        }
    }

});

app.service('author', function(){
    this.name = "capaj";
});