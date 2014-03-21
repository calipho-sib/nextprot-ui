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


UserModule.controller('UserCtrl', ['$scope', '$route', '$rootScope', '$routeParams', '$location', '$http', '$window','$timeout', 'config', 'UserService',
    function ($scope, $rootScope, $route, $routeParams, $location, $http, $window, $timeout, config, UserService) {

        $scope.username = "dani";
        $scope.password = "123";

        var baseAuthUrl = config.api.AUTH_SERVER;

        console.log('route params', $routeParams);
        $scope.user = UserService;

        $scope.login = function (username, password) {
            UserService.login(username, password, function (err, data) {
                if (err) {
                    alert(error + data);
                    console.log('error' + err + data);
                }
                UserService.getUserProfile();
                $location.path('/advanced');
                $route.reload();

            });

        };

        $scope.signup = function () {
            $window.open(baseAuthUrl + '/user/registration', 'registration', 'width=400,height=300');
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