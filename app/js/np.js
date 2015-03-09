(function (angular, undefined) {
    'use strict';

//Declare application level module which depends on additional filters and services (most of them are custom)
    var App = angular.module('np', [
        'ngSanitize',
        'ngResource',
        'ngRoute',
        'ngAnimate',
        'ngCookies',
        'ipCookie',
        'npHelp',
        '$strap.directives',
        'np.flash',
        'np.config',
        'np.user',
        'np.cart',
        'np.user.protein.lists',
        'np.search',
        'np.viewer',
        'np.export',
        'ui.codemirror',
        'auth0', 'angular-storage', 'angular-jwt',
        'ngTextTruncate'
    ]).config(configApplication)
        .factory('errorInterceptor', errorInterceptor)
        .run(runApplication);

    ///// TODO: fixing; we are breaking the DRY principle and it is really bad (see duplication in nextprot-snorql/app/js/app.config.js) !!!!
    //Environment that should be set from outside //TODO should replace this using GRUNT
    var nxEnvironment = "NX_ENV"; //env can be replaced, by dev, alpha or pro
    var apiBase = "http://localhost:8080/nextprot-api-web"; //default
    //var apiBase = "http://dev-api.nextprot.org"; //default
    var np1Base = "http://uat-web1";


    if (nxEnvironment.indexOf("NX_") == -1) // means an environment has been set, sed command has done some magic tricks
    {
        apiBase = 'http://' + nxEnvironment.toLowerCase() + '-api.nextprot.org';
        if (nxEnvironment.toLowerCase() === "pro") {
            apiBase = 'https://api.nextprot.org'; // Don't forget https!
            np1Base = 'http://www.nextprot.org';
        }
    }
    // main application settings
    App.constant('npSettings', {
        environment: nxEnvironment,
        base: apiBase,   //API URL
        np1: np1Base,    //NP1 URL
        callback: window.location.origin,
        auth0_cliendId: '7vS32LzPoIR1Y0JKahOvUCgGbn94AcFW'
    })


    // init application components
    runApplication.$inject = ['$log', 'gitHubContent', 'npSettings']
    function runApplication($log, gitHubContent, npSettings) {
        gitHubContent.initialize({
            baseUrl: "https://api.nextprot.org",
            helpPath: '/rdf/help/type/all.json',
            helpTitle: 'Generalities',
            root: '',                                                            // specify a URI prefix
            githubRepo: '/',
            githubApi:apiBase,
            githubEditPage : "https://github.com/calipho-sib/nextprot-docs/edit/master/"
        });
    };


    // config application $route, $location and $http services.
    configApplication.$inject = ['$routeProvider', '$locationProvider', '$httpProvider', 'authProvider', 'npSettings', 'jwtInterceptorProvider'];
    function configApplication($routeProvider, $locationProvider, $httpProvider, authProvider, npSettings, jwtInterceptorProvider) {
        authProvider.init({
            clientID: npSettings.auth0_cliendId,
            callbackURL: npSettings.callback,
            domain: 'nextprot.auth0.com',
            icon: 'img/np.png'
        })


        jwtInterceptorProvider.tokenGetter = ['ipCookie', function (ipCookie) {
            // Return the saved token
            return ipCookie('nxtoken');
        }];
        $httpProvider.interceptors.push('jwtInterceptor');

        $httpProvider.interceptors.push('errorInterceptor');
        $httpProvider.defaults.headers.common.Accept = 'application/json'


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


// define default behavior for all http request
    errorInterceptor.$inject = ['$q', '$rootScope', '$location', 'flash']
    function errorInterceptor($q, $rootScope, $location, flash) {
        return {
            request: function (config) {
                return config || $q.when(config);
            },
            requestError: function (request) {
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
                }/*else if (status == 400) { //Should be handled by the controller}*/
                else if ((status == 401) || (status == 403)) {
                    flash('alert-danger', "You are not authorized to access the url. Please login or review your privileges. If you think this is a problem, please contact the support.");
                    $location.url("");
                    return;
                }/*else if (status == 404) {
                 flash('alert-danger', "URL not found");
                 return;
                 } */
                else if (status >= 500) {
                    console.log(response)
                    if (response.message) {
                        flash('alert-warning', response.message);
                    } else if (response.data.message) {
                        flash('alert-danger', response.data.message);
                    } else
                        flash('alert-danger', 'Some error occured' + " " + status + " " + response);
                }
                return $q.reject(response);
            }
        };
    };

})(angular);


