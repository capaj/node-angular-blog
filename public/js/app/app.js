
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

app.factory('Post', function ($resource) {
    var Post = $resource('/posts/', {}, {
        queryWithTag: { method: "POST", isArray:true }
    });
    Post.prototype.getMomentStamp = function () {   // for displaying when post was created
        return moment(this.createdAt).calendar();
    };
    return Post;
});


app.controller('main', function($scope) {
  $scope.isAdmin = true;
  $scope.blogName = "Capaj's cage";

});

app.controller('edit', function($scope, author, Post, $location, $resource ) {
    var query = $location.search();
    if (query._id) {
        $scope.post = Post.get({_id:query._id});
        $scope.saveChanges = function () {
            Post.save({_id: query._id} , $scope.post);
//
//            $scope.post.$save(function () {
//                console.log("post changes saved: " + $scope.post);
//            });
        };
    } else {
        $scope.tagsD = {
            suggestions : ["there", "were", "some", "suggested", "terms", "super", "secret", "stuff"],
//            restrictTo : ["restrict", "to", "these"],
            whenAddingTag : function (tag) {
                console.log(tag);
            }
        };
        var Tag = $resource('/tags');
        $scope.tags = Tag.query();
        console.log($scope.tags);
        $scope.post = new Post({createdAt: moment()});

        $scope.create = function () {
            $scope.post.tags = $scope.tagsD.data.getTags();
            $scope.post.$save(function () {
                console.log("new post created: " + $scope.post);
            });
        }
    }

});

app.service('author', function(){
    this.name = "capaj";
});