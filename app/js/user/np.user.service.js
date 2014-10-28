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
    'auth',
    '$q',
    function ($resource, $http, config, $window, $rootScope, $location, $cookieStore, auth, $q) {
        //
        // default user data for anonymous
        var defaultProfile={
            authorities : [],
            username : 'Guest',
            profile:{}
        }



        //
        // create user domain
        var User = function () {

            //
            // init the dao
            this.dao={
               $profile:$resource(config.api.baseUrl + '/user/me', {
                    get: { method: 'GET' }
                })
            }

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
        //
        User.prototype.isAnonymous = function () {
            return !this.profile.userId;
        }

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

        User.prototype.clear = function() {
            delete $window.sessionStorage.token;
            $cookieStore.remove('sessionToken');
            angular.extend(this.profile,defaultProfile);
            return this;
        };        


        //
        // kariboo login (request data)
        User.prototype.login = function (cb) {
            var self=this;        
            auth.signin({
                popup: true,
                icon:           'http://www.nextprot.org/db/images/blueflat/np.png'
            })
            .then(function() {
                sefl.copy(auth.profile)
                cb()
                // Success callback
            }, function(error) {
                cb(error)
            });
        }

        User.prototype.logout = function (cb) {
            var self=this;
            auth.signout();
        }


        User.prototype.me = function (cb) {
            var self=this;
            return this.chain(this.dao.$profile.get( function (data) {
                    if(data.username){
                        return self.copy(data)
                    }

                    //
                    // the passing token is wrong
                    return self.clear()
                }).$promise
            );
        };




        var service = new User();
        return service;

    }
]);
