(function (angular, undefined) {'use strict';

//Declare application level module which depends on additional filters and services (most of them are custom)
var App = angular.module('np', [
    'ngSanitize',
    'ngResource',
    'ngRoute',
    'ngAnimate',
    'ngCookies',
    'npHelp',
    '$strap.directives',
    'np.flash',
    'np.config',
    'np.user',
    'np.cart',
    'np.user.protein.lists',
    'np.search',
    'np.advanced',
    'np.export',
    'ui.codemirror',
    'auth',
    'authInterceptor'
]);

App.run(function ($log,gitHubContent) {
    $log.info("init githubdoc");
    // init app
    gitHubContent.initialize({
            // baseUrl:"http://uat-web2:8080",
            helpPath:'rdfhelp.json',
            helpTitle:'Main truc',
            root:'', // specify the root of RDF entity routes
            githubRepo:'calipho-sib/nextprot-docs',
            githubToken:'2e36ce76cfb03358f0a38630007840e7cb432a24'
    });
});

//Configure application $route, $location and $http services.
App.config([
    '$routeProvider',
    '$locationProvider',
    '$httpProvider',
    'authProvider',
    function ($routeProvider, $locationProvider, $httpProvider, authProvider) {
        authProvider.init({
            clientID: '7vS32LzPoIR1Y0JKahOvUCgGbn94AcFW',
            callbackURL: location.href,
            domain: 'nextprot.auth0.com',
//            dict: {
//                signin: {
//                    title: 'Link with another account'
//                }
//            } 
            icon:           'http://www.nextprot.org/db/images/blueflat/np.png'


        })

        $httpProvider.interceptors.push('authInterceptor');
        $httpProvider.defaults.headers.common.Accept= 'application/json'


        // List of routes of the application
        $routeProvider
            .when('/', {title: 'welcome to nextprot', templateUrl: '/partials/welcome.html'})
            .when('/doc', {title: 'welcome to nextprot', templateUrl: '/partials/doc/doc.html'})
            .when('/doc/entity/:entity', {title: 'welcome to nextprot', templateUrl: '/partials/doc/help.html'})
            .when('/pages/:article', {title: 'page', templateUrl: '/partials/doc/page.html'})
            .when('/404', {title: '404', templateUrl: '/partials/errors/404.html'})
        // Catch all
        //.otherwise({redirectTo : '/404'});

        // Without serve side support html5 must be disabled.
        $locationProvider.html5Mode(true);
        //$locationProvider.hashPrefix = '!';
    }
]);

App.factory('errorInterceptor', ['$q', '$rootScope', '$location', 'flash',
    function ($q, $rootScope, $location, flash) {
        return {
            request: function (config) {
                return config || $q.when(config);
            },
            requestError: function(request){
                return $q.reject(request);
            },
            response: function (response) {
                return response || $q.when(response);
            },
            responseError: function (response) {
                var status = response.status;
                if (status == 0) {
                    flash('alert-error', "The API is not accessible");
                    return;
                } else if (status == 401) {
                    flash('alert-error', "You are not authorized to access the resource. Please login or review your privileges.");
                    return;
                }else if (status == 404) {
                    flash('alert-error', "URL not found");
                    return;
                } 
                else {
                    if(response.message){
                        flash('alert-warn', response.message);
                    }else if (response.data.message) {
                        flash('alert-warn', response.data.message);
                    } else 
                        flash('alert-error', 'Some error occured' + " " + status + " " + response);
                }
                return $q.reject(response);
            }
        };
}]);

})(angular);


