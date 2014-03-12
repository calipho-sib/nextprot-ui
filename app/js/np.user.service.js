'use strict';

var UserService = angular.module('np.user.service', []);


UserService.factory('UserService', [
    '$resource',
    '$http',
    'config',
    '$window',
    'Tools',
    function ($resource, $http, config, $window, Tools) {

        var baseAuthUrl = "http://localhost:9090";
        var baseUrl = config.solr.BASE_URL + config.solr.SOLR_PORT;


        var $token = $resource(baseAuthUrl + '/nextprot-auth/oauth/token', {client_id: 'nextprotui', grant_type: 'password', username: '@username', password: '@password'}, {
            get: { method: 'POST' }
        });


        var $userProfile = $resource(baseUrl + '/nextprot-api/user/:username.json', {username: '@username'}, {
            get: { method: 'GET' }
        });


        var UserService = function () {

            if ($window.sessionStorage.username) {
                this.getUserProfile($window.sessionStorage.username);
            } else {
                this.userProfile = {
                    username: "Guest",
                    role: 'ANONYMOUS',
                    userLoggedIn: false
                }
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
                if (cb)cb(null, data);
            });
        }

        UserService.prototype.getUserProfile = function (username, cb) {
            var me = this;
            $userProfile.get({username: username}, function (data) {
                me.userProfile.role = 'USER';
                me.userProfile.username = data.username;
                me.userProfile.userLoggedIn = true;
                $window.sessionStorage.username = data.username;

                if (cb)cb(data);
            });
        };

        UserService.prototype.logout = function (cb) {
            console.log('cleaning token and username');
            delete $window.sessionStorage.token;
            delete $window.sessionStorage.username;
            this.userProfile = {
                username: "Guest",
                role: 'ANONYMOUS',
                userLoggedIn: false
            }
        }

        var service = new UserService();
        return service;


    }
]);