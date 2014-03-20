'use strict'

var UserModule = angular.module('np.user', ['np.user.service']);

UserModule.config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/login', { templateUrl: 'login.html'})
            .when('/logout', { templateUrl: 'logout.html'})

    }
]);


UserModule.controller('UserCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$http', '$window','$timeout', 'UserService',
    function ($scope, $rootScope, $routeParams, $location, $http, $window, $timeout, UserService) {

        console.log('route params', $routeParams);
        $scope.user = UserService;

        $scope.login = function (username, password) {
            UserService.login(username, password, function (err, data) {
                //alert(data.access_token);
                if (err) {
                    alert(error + data);
                }
                UserService.getUserProfile();
                $location.path("/");
            });

        };

        $scope.signup = function () {
            $window.open('http://localhost:9090/nextprot-auth/user/registration');
        };


        // init google plus singin
        $timeout(function(){
            var po = document.createElement('script');
            po.type = 'text/javascript'; po.async = true;
            po.src = 'https://apis.google.com/js/client:plusone.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
        },0)


    }]
);