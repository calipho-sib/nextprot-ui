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
user.$inject=['$resource','$http','config','$timeout','$rootScope','$location','$cookieStore','lock','$q', 'ipCookie', '$window', 'store'];
function user($resource, $http, config, $timeout, $rootScope, $location, $cookieStore, lock, $q, ipCookie, $window, store) {


    // default user data for anonymous
    var defaultProfile={
        authorities : [],
        username : 'Guest',
        profile:{}
    };


    //See also the refresh token https://github.com/auth0/auth0-angular/blob/master/docs/refresh-token.md
    $rootScope.$on('$locationChangeStart', function() {

        createAuth0Client({
            domain: "nextprot.auth0.com",
            client_id: "7vS32LzPoIR1Y0JKahOvUCgGbn94AcFW",
            audience: "https://nextprot.auth0.com/api/v2/"
        }).then(function(auth0) {

            auth0.isAuthenticated()
                .then(function(isAuthenticated) {
                    if (isAuthenticated) {
                        return;
                    }

                    const query = $window.location.search;
                    const shouldParseResult = query.includes("code=") && query.includes("state=");
                    if (shouldParseResult) {
                        try {
                            auth0.handleRedirectCallback()
                                .then(function(result) {
                                    console.log(result)
                                    if (result.appState && result.appState.targetUrl) {
                                        showContentFromUrl(result.appState.targetUrl);
                                    }

                                    auth0.getUser()
                                        .then(function(userData) {
                                            auth0.getTokenSilently()
                                                .then(function(token) {
                                                    userData.token = token
                                                    user.copy(userData)
                                                })
                                        })
                                })
                        } catch (err) {
                            console.log("Error parsing redirect:", err);
                        }
                    }
                })

        });

    });


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
        this.profile.token = data.token;
        return this;
    };

    User.prototype.clear = function() {
        angular.copy(defaultProfile, this.profile);
        return this;
    };

    User.prototype.isAuthenticated = function() {
      // Check whether the current time is past the
      // access token's expiry time
        
//      console.log("ipcookie of nxprofile",ipCookie('nxprofile'));
//        
//      console.log(ipCookie('nxexpiresin'))
//      console.log(new Date().getTime())
//          
          if (this.profile.email) return true;
          else return false;
    }


    User.prototype.login = function (cb) {
        try {

            const options = {
                redirect_uri: $window.location.origin
            };

            // Initialize auth0 client
            var auth0 = null;
            createAuth0Client({
                domain: "nextprot.auth0.com",
                client_id: "7vS32LzPoIR1Y0JKahOvUCgGbn94AcFW",
                audience: "https://nextprot.auth0.com/api/v2/"
            }).then(function(auth0response){
                console.log(auth0response)
                auth0 = auth0response;
                console.log(auth0)

                auth0.loginWithRedirect(options);
            });

        } catch (err) {
            console.log("Log in failed", err);
        }
    };

    User.prototype.logout = function (cb) {
        this.clear();
        var baseUrl = new $window.URL($location.absUrl()).origin;
        createAuth0Client({
            domain: "nextprot.auth0.com",
            client_id: "7vS32LzPoIR1Y0JKahOvUCgGbn94AcFW",
            audience: "https://nextprot.auth0.com/api/v2/"
        }).then(function(auth0){
            auth0.logout({
                returnTo: baseUrl
            });
        });
    };


    User.prototype.me = function (cb) {
        var self=this;

        return this.chain(this.dao.$profile.get( function (data) {
            console.log(data)
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
