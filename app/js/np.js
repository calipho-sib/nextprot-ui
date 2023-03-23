(function (angular, undefined) {
    'use strict';

    //Declare application level module which depends on additional filters and services (most of them are custom)
    var App = angular.module('np', [
        'ngSanitize',
        'ngResource',
        'ngRoute',
        // 'ngAnimate',
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
        'np.content',
        'np.homepage',
        'np.export',
        'np.version',
        'np.news',
        'np.release.info',
        'ui.codemirror',
        'auth0.lock',
        'angular-storage',
        'angular-jwt',
        'np.chromosomes'
    ]).config(configApplication)
        .factory('errorInterceptor', errorInterceptor)
        .factory('metaService', metaService)
        .factory('nxBaseUrl', nxBaseUrl)
        .controller('npCtrl', npCtrl)
        .run(runApplication);

    ///// TODO: fixing; we are breaking the DRY principle and it is really bad (see duplication in nextprot-snorql/app/js/app.config.js) !!!!
    //Environment that should be set from outside //TODO should replace this using GRUNT

    // default environment when environment is not set by some external deployment script
    var nxEnvironment = "NX_ENV"; //env can be replaced, by dev, alpha or pro by nxs script on deploy
    // WARNING !!! DO NOT USE NX_ENV ANYWHERE ELSE IN THE PROJECT. A script replace its value by the current environment value just before deployment !
    var apiBase = "https://dev-api.nextprot.org"; //default for UI developers on MACs
    var np1Base = 'https://uat-web1'; //default for UI developers on MACs
    //    var apiBase = "http://localhost:8080/nextprot-api-web";  //default for UI + NP1 + NP2 on localhost
    //var np1Base = 'http://localhost:8090';                   //default for UI + NP1 + NP2 on localhost


    if (nxEnvironment.indexOf("NX_") == -1) { // means an environment has been set, sed command has done some magic tricks
        if (nxEnvironment.toLowerCase() === "pro") {
            apiBase = 'https://api.nextprot.org'; // Don't forget https!
            np1Base = 'https://old.nextprot.org';
        }
        else if (nxEnvironment.toLowerCase() === "dev") {
            apiBase = 'https://dev-api.nextprot.org'; // Don't forget https!
            np1Base = 'https://uat-web1';
        }
        else if (nxEnvironment.toLowerCase() === "localhost") {
            apiBase = "http://localhost:8080/nextprot-api-web";
            np1Base = 'https://uat-web1';
        }
        else if (nxEnvironment.toLowerCase() === "alpha" || nxEnvironment.toLowerCase() === "build") {
            apiBase = 'https://' + nxEnvironment.toLowerCase() + '-api.nextprot.org';
            np1Base = 'http://uat-web1';
        } else if (nxEnvironment.toLowerCase() === "cn") {
            apiBase = 'http://api.nextprot.cn';
        }

        else { // By default use the dev env, No need to change for local testing
            apiBase = 'https://dev-api.nextprot.org'; // Don't forget https!
            np1Base = 'https://uat-web1';
        }   
    }

    // Download URL
    var downloadURL;
    if(nxEnvironment != 'pro') {
        downloadURL = "https://"+nxEnvironment+"-download.nextprot.org";
    } else {
        downloadURL = "https://download.nextprot.org";
    }

    // main application settings
    App.constant('npSettings', {
        environment: nxEnvironment,
        base: apiBase, //API URL
        np1: np1Base, //NP1 URL,
        download: downloadURL,
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
            githubApi: apiBase,
            githubEditPage: "https://github.com/calipho-sib/nextprot-docs/edit/master/",
            githubToken: null
        });
    };


    // config application $route, $location and $http services.
    configApplication.$inject = ['$routeProvider', '$locationProvider', '$httpProvider', 'lockProvider', 'npSettings', 'jwtInterceptorProvider', '$resourceProvider'];

    function configApplication($routeProvider, $locationProvider, $httpProvider, lockProvider, npSettings, jwtInterceptorProvider, $resourceProvider) {
        $routeProvider
            // Home page
            .when('/', {
                title: 'welcome to neXtProt',
                templateUrl: '/partials/welcome.html'
            })

            // 404 error page
            .when('/404', {
                title: '404',
                templateUrl: '/partials/errors/404.html'
            })

            // Content page
            .when('/release-contents', {
                title: 'neXtProt release contents',
                templateUrl: '/partials/release_contents.html'
            })
            // Statistics page
            .when('/release-statistics', {
                title: 'neXtProt release statistics',
                templateUrl: '/partials/release_statistics.html'
            })
            // Pages (in nextprot-docs/pages): about, copyright...
            .when('/:article', {
                title: 'page',
                templateUrl: '/partials/doc/page-alone.html'
            })
            // RDF generalities
            .when('/help/doc/:article', {
                title: 'help for RDF',
                templateUrl: '/partials/doc/doc.html'
            })
            // RDF entities
            .when('/help/entity/:entity', {
                title: 'help for RDF',
                templateUrl: '/partials/doc/help.html'
            });
        // List of routes of the application

        lockProvider.init({
            clientID: npSettings.auth0_cliendId,
            domain: 'nextprot.auth0.com',
            options: {
                autoclose: true,
                auth: {
                    responseType: 'token id_token',
                    //                    audience: 'https://nextprot.auth0.com/userinfo',
                    audience: 'https://nextprot.auth0.com/api/v2/',
                    redirect: false,
                    scope: 'openid email name picture'
                },
                theme: {
                    logo: 'img/np-x.png',
                    primaryColor: '#C50063'
                },
                languageDictionary: {
                    title: "Log in",
                    error : {
                        login: {
                            "lock.fallback": "Login unsuccessful. We are working on fixing this issue. Sorry for the inconvenience."
                        }
                    }
                }
            }
        })
        //        authProvider.init({
        //            clientID: npSettings.auth0_cliendId,
        //            callbackURL: npSettings.callback,
        //            domain: 'nextprot.auth0.com',
        //            icon: 'img/np.png'
        //        })

        jwtInterceptorProvider.tokenGetter = ['ipCookie', function (ipCookie) {
            // Return the saved token
            return ipCookie('nxtoken');
        }];
        $httpProvider.interceptors.push('jwtInterceptor');

        $httpProvider.interceptors.push('errorInterceptor');

        $httpProvider.defaults.headers.common.Accept = 'application/json'

        // Without serve side support html5 must be disabled.
        $locationProvider.html5Mode(true);
        $resourceProvider.defaults.stripTrailingSlashes = false;
    };


    // define default behavior for all http request
    errorInterceptor.$inject = ['$q', '$rootScope', '$log', '$location', 'flash', '$injector']
    function errorInterceptor($q, $rootScope, $log, $location, flash, $injector) {
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
                    $log.error({
                        status: response.status,
                        message: "connection problem",
                        href: window.location.href
                    });
                    //flash('alert-info', "network issue: If the error persists please report to support@nextprot.org");
                    return;
                } /*else if (status == 400) { //Should be handled by the controller}*/
                else if ((status == 401) || (status == 403)) {
                    $log.info({
                        status: response.status,
                        message: "not authorized",
                        href: window.location.href
                    });
                    //                    flash('alert-danger', "You are not authorized to access the url. Please login or review your privileges. If you think this is a problem, please report to support@nextprot.org.");
                    flash('alert-danger', "You session has expired. Please login again.");
                    console.log("gonna user logout");
                    $injector.get('user').logout();
                    return;
                }
                /*else if (status == 404) {
                                 flash('alert-danger', "URL not found");
                                 return;
                                 } */
                else if (status >= 500) {
                    if (response.message) {
                        flash('alert-warning', response.message);
                        $log.error({
                            status: response.status,
                            message: response.message,
                            href: window.location.href
                        });
                    } else if (response.data.message) {
                        flash('alert-danger', response.data.message);
                        $log.error({
                            status: response.status,
                            message: response.data.message,
                            href: window.location.href
                        });
                    } else
                        $log.error({
                            status: response.status,
                            message: "Some unexpected error occured",
                            href: window.location.href
                        });
                    flash('alert-danger', 'Some error occured' + " " + status + " " + response.message + " please report to support@nextprot.org");
                }
                return $q.reject(response);
            }
        };
    };

    npCtrl.$inject = ['$scope', '$location', '$routeParams', 'metaService', '$window', '$modal', 'flash', '$http'];

    function npCtrl($scope, $location, $routeParams, metaService, $window, $modal, flash, $http) {
        var that = this;

        /**
         * detect IE
         * returns version of IE or false, if browser is not Internet Explorer
         */
        function detectIE() {
            var ua = $window.navigator.userAgent;

            // Test values; Uncomment to check result …

            // IE 10
            //             ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

            // IE 11
            // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

            // Edge 12 (Spartan)
            //             ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

            // Edge 13
            //             ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

            var msie = ua.indexOf('MSIE ');
            if (msie > 0) {
                // IE 10 or older => return version number
                return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            }

            var trident = ua.indexOf('Trident/');
            if (trident > 0) {
                // IE 11 => return version number
                var rv = ua.indexOf('rv:');
                return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            }

            var edge = ua.indexOf('Edge/');
            if (edge > 0) {
                // Edge (IE 12+) => return version number
                return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
            }

            // other browser
            return false;
        }

        $scope.browserCompatibility = function (elem, action) {
            // Get IE or Edge browser version
            var version = detectIE();

            console.log("BROWSER VERSION IS : ", version);

            var ieCompatible = [false, "12", "13"];

            if (version !== false && parseInt(version) < 12) {

                var scope = $scope.$new();
                scope.version = version;
                scope.userAgent = $window.navigator.userAgent;

                //                $scope.selected = {};
                //                angular.extend($scope.modal, {
                //                    type: action
                //                });

                var ieModal = $modal({
                    scope: scope,
                    template: 'partials/errors/browser-compatibility-modal.html',
                    show: true
                });
            }
        };

        $scope.$on('$locationChangeSuccess', function (event, next, current) {
            //            var location = "/about/human-proteome";
            var location = $location.path();
            that.h1 = "";

            if(location === "/"){
                that.title = "neXtProt platform";
                that.h1 = "Developed by the SIB Swiss Institute of Bioinformatics neXtProt is a comprehensive human-centric discovery platform, offering its users a seamless integration of and navigation through protein-related data.";
                that.description = "neXtProt platform";
            }
            else{

                metaService.getMetaTags(location).$promise.then(function (data) {
                    that.title = data.title;
                    if(data.h1 && location.includes("COFACTOR")) {
                        that.h1 = data.h1.split('-')[0] + "I-TASSER/COFACTOR" 
                    } else if(data.h1 && location.includes("Protein-3D-structure")){
                        that.h1 = data.h1.split('-')[0] + "3D structure"
                    } else if(data.h1 && location.includes("SAAVpedia")) {
                        that.h1 = data.h1.split('-')[0] + "SAAVpedia"
                    } else if(data.h1 && location.includes("VEP")){
                        that.h1 = data.h1.split('-')[0] + "VEP"
                    } else if(data.h1 && location.includes("protein-digestion")){
                        that.h1 = "Protein digestion"
                    } else {
                        that.h1 = data.h1
                    }
                    that.description = data.metaDescription;
                });
            }

        });

    }

    metaService.$inject = ['$resource', 'config'];

    function metaService($resource, config) {

        console.log(config.api.API_URL);

        var metaUrl = config.api.API_URL + '/seo/tags';

        //        var metaResource = $resource(metaUrl, {}, {get : {method: "GET", isArray:false}});  

        var MetaService = function () { };

        MetaService.prototype.getMetaTags = function (path) {
            var url = metaUrl + path;
            var metaResource = $resource(url, {}, {
                get: {
                    method: "GET",
                    isArray: false
                }
            });
            return metaResource.get();
        };

        return new MetaService();
    }

    nxBaseUrl.$inject = ['$resource', 'config'];

    function nxBaseUrl($resource, config) {

        var nxBaseUrl = function () { };

        nxBaseUrl.prototype.getDomain = function (input) {
            if (config.api.environment === "pro") {
                switch (input) {
                    case "api": return config.api.API_URL;
                    case "search": return "https://search.nextprot.org";
                    case "snorql": return "http://snorql.nextprot.org";
                    case "sparql": return "https://sparql.nextprot.org";
                }
            }
            //Because dev is HTTPS
            else if (config.api.environment === "dev" || (config.api.environment.indexOf("NX_") > -1)) {
                switch (input) {
                    case "api": return config.api.API_URL;
                    case "search": return "https://dev-search.nextprot.org";
                    case "snorql": return "http://dev-snorql.nextprot.org";
                    case "sparql": return "https://dev-api.nextprot.org/sparql";
                }
            }
            else if (input === "sparql") {
                return "http://" + config.api.environment + "-api.nextprot.org/sparql";
            }
            else return "http://" + config.api.environment + "-" + input + ".nextprot.org";
        }

        return new nxBaseUrl();
    }

})(angular);