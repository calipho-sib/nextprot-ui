'use strict';

var User = angular.module('np.user.service', []);


User.factory('User', [
    '$resource',
    '$http',
    'config',
    '$window',
    '$rootScope',
    '$location',
    '$cookieStore',
    '$q',
    function ($resource, $http, config, $window, $rootScope, $location, $cookieStore, $q) {


        var baseAuthUrl = config.api.AUTH_SERVER;

        //
        // default user data for anonymous
        var defaultProfile={
            authorities : [],
            username : 'Guest',
            userLoggedIn : false,
            userId : null
        }


        //
        // define data object access here
        var dao={
            $token:$resource(baseAuthUrl + '/oauth/token', {client_id: config.nextprot.credentials.clientId, client_secret: config.nextprot.credentials.clientSecret, grant_type: 'password', username: '@username', password: '@password'}, {
                get: { method: 'POST' }
            }),
            $googleToken:$resource(baseAuthUrl + '/google/token?client_id=:client_id', { client_id: config.nextprot.credentials.clientId }, {
                get: { method: 'POST' }
            }),
            $logout:$resource(baseAuthUrl + '/user/logout.json?token=:token', {token: '@token'}, {
                get: { method: 'POST' }
            }),
            $profile:$resource(baseAuthUrl + '/user/profile.json?token=:token', {token: '@token'}, {
                get: { method: 'POST' }
            })
        }


        //
        // create user domain
        var User = function () {

            //
            // init the dao
            this.dao=dao;

            //
            // init user profile
            this.profile={}            
            angular.extend(this.profile,defaultProfile);

            //
            // get token from cookie or null if doesn't exist
            $window.sessionStorage.token = $cookieStore.get('sessionToken');

            //
            // wrap promise to this object
            this.$promise=$q.when(this)            
        };


        //    
        // make the always User a promise of the dao usage
        User.prototype.chain=function(promise){
          this.$promise=this.$promise.then(function(){
             return promise
            },function(){
             return promise
            })
          return this
        }

        User.prototype.copy = function(data) {
            angular.extend(this.profile,defaultProfile, data);
            return this;
        };        

        User.prototype.clear = function(data) {
            delete $window.sessionStorage.token;
            $cookieStore.remove('sessionToken');
            angular.extend(this.profile,defaultProfile);
            return this;
        };        


        //
        // kariboo login (request data)
        User.prototype.login = function (username, password, cb) {
            var self=this;
            return this.chain(this.dao.$token.get({username: username, password: password}, function(data) {
                    $cookieStore.put('sessionToken', data.access_token);
                    $window.sessionStorage.token = data.access_token;
                    return self;
                }).$promise
            );            

        }

        User.prototype.googleSignin = function(authResult, cb) {
           var self=this;
           return this.chain(this.dao.$googleToken.get({
                    access_token : authResult.access_token,
                    refresh_token: authResult.refresh_token,
                    code: authResult.code,
                    id_token: authResult.id_token,
                    expires_at: authResult.expires_at,
                    expires_in: authResult.expires_in
                }, function(response) {
                    $window.sessionStorage.token = response.access_token;
                    if(cb)cb(response);
                }).$promise
            );

        }

        User.prototype.getProfile = function (cb) {
            var self=this;
            return this.chain(this.dao.$profile.get({token: $window.sessionStorage.token}, function (data) {
                    if(data.username){
                        return self.copy(data)
                    }

                    //
                    // the passing token is wrong
                    return self.clear()
                }).$promise
            );
        };

        User.prototype.logout = function (cb) {
            var self=this;
            self.clear()
            return this.chain(this.dao.$logout.get({token: $window.sessionStorage.token}, function (data) {
                if (cb)cb(data);
            }).$promise);
        }

        User.prototype.isAnonymous = function () {
            return !this.profile.userId;
        }

        var service = new User();
        return service;

    }
]);
