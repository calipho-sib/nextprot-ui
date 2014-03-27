'use strict';

//Declare application level module which depends on additional filters and services (most of them are custom)
var App = angular.module('np', [
    'ngSanitize',
    'ngResource',
    'ngRoute',
    'ngAnimate',
    'ngCookies',
    '$strap.directives',
    'np.flash',
    'np.config',
    'np.search',
    'np.cart',
    'np.user',
    'np.proteinlists',
    'np.advanced',
    'ui.ace'
]);


//Configure application $route, $location and $http services.
App.config([
    '$routeProvider',
    '$locationProvider',
    '$httpProvider',

    function ($routeProvider, $locationProvider, $httpProvider) {


        var interceptor = ['$rootScope', '$q', 'flash',
            function (scope, $q, flash) {

                function success(response) {
                    return response;
                }

                function error(response) {
                    var status = response.status;
                    console.log("the response: ", response)

                    if (status == 0) {
                        flash('alert-error', "The API is not accessible");
                        return;
                    } else if (status == 401) {
                        flash('alert-error', "PROUT");
                        return;
                    } else if (status == 404) {
                        flash('alert-error', "URL not found");
                        return;
                    } else {
                        flash('alert-error', 'Some error occured' + " " + status + " " + response.data);
                    }
                    // otherwise
                    return $q.reject(response);

                }

                return function (promise) {
                    return promise.then(success, error);
                }

            }];
        $httpProvider.responseInterceptors.push(interceptor);

        //$httpProvider.defaults.useXDomain = true;
        //$httpProvider.defaults.withCredentials = true;



        // List of routes of the application
        $routeProvider
            .when('/', {title: 'welcome to nextprot', templateUrl: 'partials/welcome.html'})

            // Pages
            .when('/about', {title: 'about', templateUrl: 'partials/about.html'})

            // 404
            .when('/404', {title: '404', templateUrl: 'partials/errors/404.html'})
        // Catch all
        //.otherwise({redirectTo : '/404'});

        // Without serve side support html5 must be disabled.
        $locationProvider.html5Mode(true);
        //$locationProvider.hashPrefix = '!';
    }
]);

App.factory('Tools', [
    function () {
        var Tools = function () {
        };

        Tools.prototype.convertToSlug = function (name) {
            return name
                .toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-')
                ;
        }

        return new Tools();
    }
]);

// Authentication interceptors
App.factory('authInterceptor', function ($rootScope, $q, $window, $location, flash) {
    return {
        request: function (config) {
            if(config.url.indexOf('nextprot-api/user') != -1){
                config.headers = config.headers || {};
                if ($window.sessionStorage.token) {
                    console.log('adding token ' + $window.sessionStorage.token)
                    config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
                } else {
                    var message = "You must be logged in to access " + config.url;
                    flash('alert-warn', message);
                    $location.path('login');
                }
            }
            return config;
        }
    };
});
App.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
});



App.directive('npBase', ['config', function (config) {
    return function (scope, elm, attrs) {
        if (attrs['npBase'])
            return elm.attr(attrs['npBase'], config.api.base)
        elm.attr('href', config.api.base);
    };
}]);

//Bootstrap (= launch) application ==> ng-app='np'
angular.element(document).ready(function () {
});
