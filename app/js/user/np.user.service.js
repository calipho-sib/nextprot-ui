(function (angular, undefined) {'use strict';

angular.module('np.user.service', [])
    .factory('user', user);

//
// implement user service
user.$inject=['$resource','$http','config','$window','$rootScope','$location','$cookieStore','auth','$q'];
function user($resource, $http, config, $window, $rootScope, $location, $cookieStore, auth, $q) {
    //
    // default user data for anonymous
    var defaultProfile={
        authorities : [],
        username : 'Guest',
        profile:{}
    }

    $rootScope.$on('auth:REDIRECT_ENDED',function(){
        user.copy(auth.profile)
    })

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
        // wrap promise to this object
        this.$promise=$q.when(this)

        //this.application={};
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
        this.profile.username=this.username=data.email;
        return this;
    };

    User.prototype.clear = function() {
        angular.copy(defaultProfile, this.profile);
        return this;
    };


    //
    // kariboo login (request data)
    User.prototype.login = function (cbUrl, cb) {
        var self=this;
        auth.signin({
            callbackURL: cbUrl,
            popup: true,
            icon:'img/np.png'
        }).then(function() {
            // Success callback
            self.copy(auth.profile)
            self.username=auth.email;
            cb()
        }, function(error) {
            cb(error)
        });
    }

    User.prototype.logout = function (cb) {
        this.clear()
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
                //return self.clear()
            }).$promise
        );
    };


    var user = new User();
    return user;

}



})(angular);
