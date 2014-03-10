'use strict'

var UserModule = angular.module('np.user', ['np.user.service']);

UserModule.config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/login', { templateUrl: 'login.html'})
    }
]);


UserModule.controller('UserCtrl', ['$scope', '$http', '$window', 'UserService', function ($scope, $http, $window, UserService) {
    $scope.data = {client_id: 'nextprotui', username: 'mario', password: '123', grant_type: 'password'};
    $scope.message = '';
//    $scope.submit = function () {
//        $http
//            .post('http://10.2.2.96:8080/nextprot-api/oauth/token', $scope.data)
//            .success(function (data, status, headers, config) {
//                console.log(data);
//                $window.sessionStorage.token = data.access_token;
//                $scope.message = 'Welcome';
//            })
//            .error(function (data, status, headers, config) {
//                console.log(data);
//                // Erase the token if the user fails to log in
//                delete $window.sessionStorage.token;
//
//                // Handle login errors here
//                $scope.message = 'Error: Invalid user or password';
//            });
//    };

    $scope.submit = function () {

      console.log("LOLOLOLOOL");


      UserService.getToken(function (data){console.log(data)});
    };
}]
);
