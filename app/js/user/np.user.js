(function (angular, undefined) {'use strict';

angular.module('np.user', [
  'np.user.query',
  'np.config'
]).config(userConfig)
  .factory('user', user)
  .controller('UserCtrl',UserCtrl);

    userConfig.$inject = ['$routeProvider'];
    function userConfig($routeProvider) {
        $routeProvider
            .when('/user', {templateUrl: 'partials/user/user-profile.html'})
            .when('/user/queries', {templateUrl: 'partials/user/user-queries.html'})
            .when('/user/queries/create', {templateUrl: 'partials/user/user-queries-create.html'})
            .when('/user/applications', {templateUrl: 'partials/user/user-applications.html'})
    }

//
// implement user factory
user.$inject=['$resource','$http','config','$timeout','$rootScope','$location','$cookieStore','auth','$q', 'ipCookie', '$window', 'store'];
function user($resource, $http, config, $timeout, $rootScope, $location, $cookieStore, auth, $q, ipCookie, $window, store) {
    //

    // default user data for anonymous
    var defaultProfile={
        authorities : [],
        username : 'Guest',
        profile:{}
    };


    //See also the refresh token https://github.com/auth0/auth0-angular/blob/master/docs/refresh-token.md
    $rootScope.$on('$locationChangeStart', function() {
        if(ipCookie('nxprofile') != null){
            user.copy(ipCookie('nxprofile'));
        } else {
            if ($window.location.hostname === "localhost") {
                ipCookie.remove('nxprofile', { path: '/' });
                ipCookie.remove('nxtoken', { path: '/' });
            } else {
                ipCookie.remove('nxprofile', { path: '/', domain: ".nextprot.org" });
                ipCookie.remove('nxtoken', { path: '/', domain: ".nextprot.org" });
            }
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

        //'this' is the 'User' instance
        // init the dao
        this.dao={
           $profile:$resource(config.api.baseUrl + '/user/me', {
                get: { method: 'GET' }
            })
        };

        //
        // init user profile
        this.profile={};
        angular.extend(this.profile,defaultProfile);
        /*
         The $q.when() method creates a promise that is immediately resolved with the given value

         http://stackoverflow.com/questions/16770821/how-does-angular-q-when-work

         Calling $q.when takes a promise or any other type, if it is not a promise then it will wrap it in a
         promise and call resolve. If you pass a value to it then it is never going to be rejected.

         From the docs:
         Wraps an object that might be a value or a (3rd party) then-able promise into a $q promise.
         This is useful when you are dealing with an object that might or might not be a promise,
         or if the promise comes from a source that can't be trusted.
         */
        this.$promise=$q.when(this);
    };

    //
    //
    User.prototype.isAnonymous = function () {
        return this.profile.username === 'Guest';
    };

    //
    // make the always User a promise of the dao usage
    User.prototype.chain=function(promise){
      this.$promise=this.$promise.then(function(){
         return promise
        },function(){
         return promise
        });
      return this
    };

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
                var expirationInDays = 730; // 730 days = 2 years
                if ($window.location.hostname === "localhost") {
                    ipCookie('nxprofile', profile, { path: '/', expires: expirationInDays });
                    ipCookie('nxtoken', token, { path: '/', expires: expirationInDays });
                } else {
                    ipCookie('nxprofile', profile, { path: '/', domain: '.nextprot.org', expires: expirationInDays });
                    ipCookie('nxtoken', token, { path: '/', domain: '.nextprot.org', expires: expirationInDays });
                }
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
    };

    User.prototype.logout = function (cb) {
        this.clear();
        auth.signout();

        if ($window.location.hostname === "localhost") {
            ipCookie.remove('nxprofile', { path: '/' });
            ipCookie.remove('nxtoken', { path: '/' });
        } else {
            ipCookie.remove('nxprofile', { path: '/', domain: ".nextprot.org" });
            ipCookie.remove('nxtoken', { path: '/', domain: ".nextprot.org" });
        }

        //legacy remove if it exists (should be removed from June 2015)
        store.remove('profile');
        store.remove('token');

    };


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
UserCtrl.$inject=['$scope','user','flash','config','ipCookie'];
function UserCtrl($scope, user, flash, config, ipCookie) {
    $scope.user = user;
}

})(angular);
