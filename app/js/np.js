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
        'np.version',
        'ui.codemirror',
        'auth0', 'angular-storage', 'angular-jwt', 'logglyLogger'
    ]).config(configApplication)
        .factory('errorInterceptor', errorInterceptor)
        .run(runApplication);

    ///// TODO: fixing; we are breaking the DRY principle and it is really bad (see duplication in nextprot-snorql/app/js/app.config.js) !!!!
    //Environment that should be set from outside //TODO should replace this using GRUNT
    var nxEnvironment = "NX_ENV"; //env can be replaced, by dev, alpha or pro
    //var apiBase = "http://localhost:8080/nextprot-api-web"; //default
    var apiBase = "http://dev-api.nextprot.org"; //default

    var np1Base = "https://www.nextprot.org/";
    //var np1Base = 'http://uat-web1/';


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
    runApplication.$inject = ['config', 'gitHubContent', 'npSettings']
    function runApplication(config, gitHubContent, npSettings) {
        gitHubContent.initialize({
            helpPath: config.api.API_URL + '/assets/rdfhelp.json',
            helpTitle: 'Generalities',
            root: 'help', // specify a URI prefix
            githubRepo: '/',
            githubApi:apiBase,
            githubEditPage : "https://github.com/calipho-sib/nextprot-docs/edit/master/",
            githubToken : null
        });
    };


    // config application $route, $location and $http services.
    configApplication.$inject = ['$routeProvider', '$locationProvider', '$httpProvider', 'authProvider', 'npSettings', 'jwtInterceptorProvider', 'LogglyLoggerProvider'];
    function configApplication($routeProvider, $locationProvider, $httpProvider, authProvider, npSettings, jwtInterceptorProvider, LogglyLoggerProvider) {
        authProvider.init({
            clientID: npSettings.auth0_cliendId,
            callbackURL: npSettings.callback,
            domain: 'nextprot.auth0.com',
            icon: 'img/np.png'
        })


        LogglyLoggerProvider.inputToken('8d9a8721-1beb-4e25-a37d-f0ff528cf611');

        jwtInterceptorProvider.tokenGetter = ['ipCookie', function (ipCookie) {
            // Return the saved token
            return ipCookie('nxtoken');
        }];
        $httpProvider.interceptors.push('jwtInterceptor');

        $httpProvider.interceptors.push('errorInterceptor');
        $httpProvider.defaults.headers.common.Accept = 'application/json'


        // List of routes of the application
        $routeProvider
            // Home page
            .when('/', {title: 'welcome to nextprot', templateUrl: '/partials/welcome.html'})
            // Pages (in nextprot-docs/pages): about, copyright...
            .when('/:article', {title: 'page', templateUrl: '/partials/doc/page.html'})
            //// Help pages
            // Simple pages
            .when('/help/:article', {title: 'help for nextprot', templateUrl: '/partials/doc/page.html'})
            // RDF generalities
            .when('/help/doc/:article', {title: 'help for RDF', templateUrl: '/partials/doc/doc.html'})
            // RDF entities
            .when('/help/entity/:entity', {title: 'help for RDF', templateUrl: '/partials/doc/help.html'})
            // 404 error page
            .when('/404', {title: '404', templateUrl: '/partials/errors/404.html'})
            // Catch all
            //.otherwise({redirectTo : '/404'});

        // Without serve side support html5 must be disabled.
        $locationProvider.html5Mode(true);
        //$locationProvider.hashPrefix = '!';
    };


// define default behavior for all http request
    errorInterceptor.$inject = ['$q', '$rootScope', '$log', '$location', 'flash']
    function errorInterceptor($q, $rootScope, $log, $location, flash) {
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
                    //CAREFUL DO NOT LOG EVERYTHING INTO LOGGYL BECAUSE 1) THERE ARE SENSITIVE INFORMATION token / bearer !  2) We have a limit of 200MB / day
                    $log.error({status : response.status, message : "connection problem", href : window.location.href});
                    //flash('alert-info', "network issue: If the error persists please report to support@nextprot.org");
                    return;
                }/*else if (status == 400) { //Should be handled by the controller}*/
                else if ((status == 401) || (status == 403)) {
                    $log.info({status : response.status, message : "not authorized", href : window.location.href});
                    flash('alert-danger', "You are not authorized to access the url. Please login or review your privileges. If you think this is a problem, please report to support@nextprot.org.");
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
                        $log.error({status : response.status, message : response.message, href : window.location.href});
                    } else if (response.data.message) {
                        flash('alert-danger', response.data.message);
                        $log.error({status : response.status, message : response.data.message, href : window.location.href});
                    } else
                        $log.error({status : response.status, message : "wtf??", href : window.location.href});
                        flash('alert-danger', 'Some error occured' + " " + status + " " + response.message + " please report to support@nextprot.org");
                }
                return $q.reject(response);
            }
        };
    };

})(angular);


