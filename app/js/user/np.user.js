(function (angular, undefined) {'use strict';

angular.module('np.user', [
  'np.user.query',
  'np.config'
]).config(userConfig)
  .factory('user', user)
  .controller('UserCtrl',UserCtrl);

userConfig.$inject=['$routeProvider'];
function userConfig($routeProvider) {
  $routeProvider
    .when('/user', { templateUrl: 'partials/user/user-profile.html'})
    .when('/user/queries', { templateUrl: 'partials/user/user-queries.html'})
    .when('/user/applications', { templateUrl: 'partials/user/user-applications.html'})
}

//
// implement user factory
user.$inject=['$resource','$http','config','$timeout','$rootScope','$location','$cookieStore','auth','$q'];
function user($resource, $http, config, $timeout, $rootScope, $location, $cookieStore, auth,$q) {
    //

    // default user data for anonymous
    var defaultProfile={
        authorities : [],
        username : 'Guest',
        profile:{}
    }


    //See also the refresh token https://github.com/auth0/auth0-angular/blob/master/docs/refresh-token.md
    $rootScope.$on('$locationChangeStart', function() {
        if($cookieStore.get('profile') != null){
            user.copy($cookieStore.get('profile'));
        }else {
            $cookieStore.remove('profile');
            $cookieStore.remove('token');
        }
    });

    /*
    $rootScope.$on('auth0.loginSuccess', function (event,auth) {
        user.$promise=auth.profile
        auth.getProfile().then(function(profile){
         user.copy(profile)
         })
    });*/

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

        var me = this;


    };

    //
    //
    User.prototype.isAnonymous = function () {
        return this.profile.username === 'Guest';
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


    User.prototype.login = function (cb) {
        var self=this;

        auth.signin({popup: true, icon:'img/np.png', authParams: {
                scope: 'openid email name picture'
            }},
            function(profile, token) {
            // Success callback
            $cookieStore.put('profile', profile);
            $cookieStore.put('token', token);
            $location.path('/');

            self.copy(auth.profile);
            self.username=auth.email;
            cb()

        }, function(error) {
            cb(error)
        });

        /*auth.signin({
            popup: true,
            icon:'img/np.png',
            scope: 'openid email name picture' // This is if you want the full JWT
        }).then(function() {
            // Success callback
            self.copy(auth.profile)
            self.username=auth.email;
            cb()
        }, function(error) {
            cb(error)
        });*/
    }

    User.prototype.logout = function (cb) {
        this.clear()
        auth.signout();
        $cookieStore.remove('profile');
        $cookieStore.remove('token');
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


//
// implement user controller
UserCtrl.$inject=['$scope','user','flash','config'];
function UserCtrl($scope, user, flash, config) {
    $scope.user = user;
};

})(angular);
