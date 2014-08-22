'use strict'

var UserModule = angular.module('np.user', ['np.user.service', 'np.config']);

UserModule.config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/login', { templateUrl: 'login.html'})
            .when('/logout', { templateUrl: 'logout.html'})
            .when('/profile', { templateUrl: 'partials/user/profile.html'})
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

//        $scope.username = "dani";
  //      $scope.password = "123";

        $scope.isSignedIn = false;
        $scope.immediateFailed = false;

        var baseAuthUrl = config.api.AUTH_SERVER;

        $scope.user = User;



        $scope.login = function (username, password) {
            User.login(username, password).$promise.then(function(){
                $rootScope.locateToReferrer()                
                User.getProfile()
            })

            User.$promise.catch(function(error){
                console.log("login ko",error)
                flash('alert-error', 'Username or password is wrong' );
            })

        };

        $scope.signup = function () {
            $window.open(baseAuthUrl + '/user/registration', 'registration', 'width=400,height=300');
        };


        // $scope.renderSignIn = function() {
            // gapi.signin.render('myGsignin', {
            //     'callback': $scope.signIn,
            //     'clientid': config.google.credentials.clientId,
            //     'requestvisibleactions': config.google.credentials.requestvisibleactions,
            //     'scope': config.google.credentials.scopes,
            //     // Remove the comment below if you have configured
            //     // appackagename in services.js
            //     //'apppackagename': Conf.apppackagename,
            //     'theme': 'dark',
            //     'cookiepolicy': config.google.credentials.cookiepolicy,
            //     'accesstype': 'offline'
            // });
          // }

          $scope.clickSignIn = function() {

            console.log('CLICK!');

            gapi.auth.signIn({
          		'clientid' : config.google.credentials.clientId,
          		'cookiepolicy' : 'single_host_origin',
          		'callback' : $scope.signIn,
          		'scope' : config.google.credentials.scopes,
          		'requestvisibleactions' : config.google.credentials.requestvisibleactions
          		// Additional parameters
        		});
        }

        // $scope.start = function() {
        //     $scope.renderSignIn();
        // }

        $scope.signIn = function(authResult) {
            // $timeout(function() {
            $rootScope.locateToReferrer()
            $scope.$apply(function() {
                $scope.processAuth(authResult);
            });
        }

        $scope.processAuth = function(authResult) {

          console.log('AUTH: ', authResult);

          $scope.immediateFailed = true;
            if ($scope.isSignedIn) {
                return 0;
            }
            if (authResult['access_token']) {
                $scope.immediateFailed = false;
                // Successfully authorized, create session

                User.googleSignin(authResult, function(response) {
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
            User.getProfile();
        }


        $scope.clickSignOut = function() {

             //TODO OLI
    	    gapi.auth.signOut();
         }



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
