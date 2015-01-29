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
    'np.export',
    'ui.codemirror',
    'auth0', 'angular-storage', 'angular-jwt'
]).config(configApplication)
  .factory('errorInterceptor',errorInterceptor)
  .run(runApplication);


//Environment that should be set from outside
var nxEnvironment = "dev";

// main application settings
App.constant('npSettings', {
    environment:nxEnvironment,
    base:'http://' + nxEnvironment +'-api.nextprot.org',
    callback:'http://' + nxEnvironment + '-search.nextprot.org',
    auth0_cliendId:'7vS32LzPoIR1Y0JKahOvUCgGbn94AcFW',
    githubToken:'2e36ce76cfb03358f0a38630007840e7cb432a24'
})


//
// init application components
runApplication.$inject=['$log','gitHubContent','npSettings']
function runApplication($log,gitHubContent,npSettings) {
    gitHubContent.initialize({
            baseUrl:"https://api.nextprot.org",
            helpPath:'/rdf/help/type/all.json',
            helpTitle:'Main truc',
            root:'',                                                            // specify a URI prefix
            githubRepo:'calipho-sib/nextprot-docs',
            githubToken:npSettings.githubToken
    });
};

//
// config application $route, $location and $http services.
configApplication.$inject=['$routeProvider','$locationProvider','$httpProvider','authProvider','npSettings', 'jwtInterceptorProvider'];
function configApplication( $routeProvider,  $locationProvider, $httpProvider, authProvider, npSettings, jwtInterceptorProvider) {
    authProvider.init({
        clientID: npSettings.auth0_cliendId,
        callbackURL: npSettings.callback, 
        domain: 'nextprot.auth0.com',
        icon: 'img/np.png'
    })


    jwtInterceptorProvider.tokenGetter = ['store', function(store) {
        // Return the saved token
        return store.get('token');
    }];
    $httpProvider.interceptors.push('jwtInterceptor');

    //$httpProvider.interceptors.push('authInterceptor');
    //$httpProvider.interceptors.push('errorInterceptor');
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
};

//
// define default behavior for all http request
errorInterceptor.$inject=['$q', '$rootScope', '$location', 'flash']
function errorInterceptor($q, $rootScope, $location, flash) {
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
                    flash('alert-danger', "The API is not accessible");
                    return;
                } else if (status == 401) {
                    flash('alert-danger', "You are not authorized to access the resource. Please login or review your privileges.");
                    return;
                }else if (status == 404) {
                    flash('alert-danger', "URL not found");
                    return;
                } 
                else {
                    console.log(response)
                    if(response.message){
                        flash('alert-warning', response.message);
                    }else if (response.data.message) {
                        flash('alert-warning', response.data.message);
                    } else 
                        flash('alert-danger', 'Some error occured' + " " + status + " " + response);
                }
                return $q.reject(response);
            }
        };
};

})(angular);


