'use strict'

var UserModule = angular.module('np.user', ['np.user.service', 'np.config']);

UserModule.config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/login', { templateUrl: 'login.html'})
            .when('/logout', { templateUrl: 'logout.html'})

    }
]);


UserModule.controller('UserCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$http', '$window','$timeout', 'UserService', 'config',
        function ($scope, $rootScope, $routeParams, $location, $http, $window, $timeout, UserService, config) {

//        $scope.username = "dani";
  //      $scope.password = "123";

        $scope.isSignedIn = false;
        $scope.immediateFailed = false;

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
               // $location.path('/advanced');
                //$route.reload();

            });

        };

        $scope.signup = function () {
            $window.open(baseAuthUrl + '/user/registration', 'registration', 'width=400,height=300');
        };


        $scope.renderSignIn = function() {
            gapi.signin.render('myGsignin', {
                'callback': $scope.signIn,
                'clientid': config.google.credentials.clientId,
                'requestvisibleactions': config.google.credentials.requestvisibleactions,
                'scope': config.google.credentials.scopes,
                // Remove the comment below if you have configured
                // appackagename in services.js
                //'apppackagename': Conf.apppackagename,
                'theme': 'dark',
                'cookiepolicy': config.google.credentials.cookiepolicy,
                'accesstype': 'offline'
            });
        }

        $scope.start = function() {
            $scope.renderSignIn();
        }

        $scope.signIn = function(authResult) {
            $scope.$apply(function() {
                $scope.processAuth(authResult);
            });
        }

        $scope.processAuth = function(authResult) {
            $scope.immediateFailed = true;
            if ($scope.isSignedIn) {
                return 0;
            }
            if (authResult['access_token']) {
                $scope.immediateFailed = false;
                // Successfully authorized, create session

                UserService.googleSignin(authResult, function(response) {
                    console.log('RESPONSE: ', response);
                    $scope.signedIn();
                });
            } else if (authResult['error']) {
                if (authResult['error'] == 'immediate_failed') {
                    $scope.immediateFailed = true;
                } else {
                    console.log('Error:' + authResult['error']);
                }
            }
        }

        $scope.signedIn = function() {
            console.log("SIGNED IN!");
            $scope.isSignedIn = true;

            UserService.getUserProfile();
        }

        $scope.start();




            // init google plus singin
//        $timeout(function(){
//
//            console.log('COOL!');
//            var po = document.createElement('script');
//            po.type = 'text/javascript'; po.async = true;
//            po.src = 'https://apis.google.com/js/client:plusone.js';
//            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
//        },0)

    }]
);