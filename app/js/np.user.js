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
    $scope.submit = function () {
      UserService.getToken($scope.user.username, $scope.user.password, function (data){console.log(data)});
    };
}]
);
