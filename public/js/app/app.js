'use strict';

var app = angular.module('node-blog', ['ngSanitize','ngResource', 'ui', 'ui.bootstrap'])
    .config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {

        $locationProvider.html5Mode(true);

            $routeProvider.when('/', {
                templateUrl   : '/templates/home.html',
                controller : 'home'
            });
            $routeProvider.when('/static/:staticUrl', {
                templateUrl   : '/templates/static/static.html',
                controller : 'static',
                reloadOnSearch: false
            });
            $routeProvider.when('/editpost/', {
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
                if (data === null) {

                } else {    //author not yet registered, so
                    $rootScope.author = data;

                }
            }
        ).error(function (resp) {

        });

        facebook.promise.then(function (token) {
            console.log("token: " + token);
        });

        $q.all([authorInfoPromise, facebook.promise]).then(function () {
            if ($rootScope.author.id === facebook.me.id) {
                $http.post('/author', facebook.token,  {
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


app.service('author', function(){
    this.name = "capaj";
});