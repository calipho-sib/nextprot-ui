'use strict'

var UserModule = angular.module('np.user', ['np.user.service']);

UserModule.config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/login', { templateUrl: 'login.html'})
    }
]);


UserModule.controller('UserCtrl', ['$scope', '$http', '$cookieStore', '$window', 'UserService',
    function ($scope, $http, $cookieStore, $window, UserService) {

        $scope.userLoggedIn = false;
        $scope.userProfile = null;

        $scope.submit = function () {
            UserService.getToken($scope.user.username, $scope.user.password, function (data) {
                //alert(data.access_token);
                $window.sessionStorage.token = data.access_token;
                $cookieStore.put('sessionToken', data.access_token);
                console.log(data)
                UserService.getUserProfile(function (data) {
                    console.log(data)
                    $scope.userProfile = data;
                    $scope.userLoggedIn = true;
                });
            });
        };

    }]
);