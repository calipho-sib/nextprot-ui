'use strict'

var UserModule = angular.module('np.user', ['np.user.service']);

UserModule.config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/login', { templateUrl: 'login.html'})
    }
]);


UserModule.controller('UserCtrl', ['$scope', '$location', '$http', 'UserService',
    function ($scope, $location, $http, UserService) {

        $scope.user = UserService;

        $scope.login = function (username,password) {
            UserService.login(username, password, function (err,data) {
                //alert(data.access_token);
                if(err){
                    alert(error + data);
                }
                UserService.getUserProfile();
                $location.path("/");
            });

        };

    }]
);