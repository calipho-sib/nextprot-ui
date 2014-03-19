'use strict';

var UserService = angular.module('np.user.service', []);


UserService.factory('UserService', [
    '$resource',
    '$http',
    'config',
    '$window',
    '$rootScope',
    '$location',
    function ($resource, $http, config, $window, $rootScope, $location) {

        var history = [];


        var baseAuthUrl = "http://localhost:9090";
        var baseUrl = config.solr.BASE_URL + config.solr.SOLR_PORT;

        $rootScope.$on('$routeChangeSuccess', function () {
            history.push($location.$$path);
        });

        var $token = $resource(baseAuthUrl + '/nextprot-auth/oauth/token', {client_id: 'nextprotui', grant_type: 'password', username: '@username', password: '@password'}, {
            get: { method: 'POST' }
        });


        var $userProfile = $resource(baseAuthUrl + '/nextprot-auth/user/profile.json?token=:token', {token: '@token'}, {
            get: { method: 'POST' }
        });

        var UserService = function () {

            this.userProfile = {};
            this.setGuestUser();

            if ($window.sessionStorage.token) {
                this.getUserProfile();
            }
        };

        UserService.prototype.isAnonymous = function () {
            return this.role === 'ANONYMOUS';
        }

        UserService.prototype.login = function (username, password, cb) {
            $token.get({username: username, password: password}, function (data) {
                //$cookieStore.put('sessionToken', data.access_token);
                $window.sessionStorage.token = data.access_token;
                console.log('got token' + $window.sessionStorage.token);
                var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
                $location.path(prevUrl);

                if (cb)cb(null, data);
            });
        }

        UserService.prototype.getUserProfile = function (cb) {
            console.log('getting user profile')
            var me = this;
            $userProfile.get({token: $window.sessionStorage.token}, function (data) {
                me.userProfile.role = 'USER';
                me.userProfile.username = data.username;
                me.userProfile.userLoggedIn = true;
                console.log("me", me);
                if (cb)cb(data);
            });
        };

        UserService.prototype.logout = function (cb) {
            delete $window.sessionStorage.token;
            this.setGuestUser();

        }

        UserService.prototype.setGuestUser = function () {
            this.userProfile.role = 'ANONYMOUS';
            this.userProfile.username = 'Guest';
            this.userProfile.userLoggedIn = false;
        }



        var service = new UserService();
        return service;

    }
]);