'use strict'

var UserModule = angular.module('np.user', ['np.user.service', 'np.config']);

UserModule.config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/user-applications', { templateUrl: 'partials/user/user-applications.html'})
            .when('/user-profile', { templateUrl: 'partials/user/user-profile.html'})
    }
]);


UserModule.controller('UserCtrl', [
    '$scope', 
    '$rootScope', 
    '$routeParams', 
    '$location', 
    '$http', 
    '$window',
    '$timeout', 
    'User', 
    'flash', 
    'config',
    function ($scope, $rootScope, $routeParams, $location, $http, $window, $timeout, User, flash, config) {
        $scope.user = User;
    }]
);
