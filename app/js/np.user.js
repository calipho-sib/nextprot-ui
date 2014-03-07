'use strict'

var UserModule = angular.module('np.user', []);

UserModule.config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/login', { templateUrl: 'login.html'})
    }
]);


UserModule.controller('UserCtrl', function ($scope, $http, $window) {
    $scope.data = {client_id: 'nextprotui', username: 'mario', password: '123', grant_type: 'password'};
    $scope.message = '';
    $scope.submit = function () {
        $http
            .post('http://10.2.2.96:8081/noauth/oauth/token', $scope.data)
            .success(function (data, status, headers, config) {
                console.log(data);
                $window.sessionStorage.token = data.access_token;
                $scope.message = 'Welcome';
            })
            .error(function (data, status, headers, config) {
                console.log(data);
                // Erase the token if the user fails to log in
                delete $window.sessionStorage.token;

                // Handle login errors here
                $scope.message = 'Error: Invalid user or password';
            });
    };
});