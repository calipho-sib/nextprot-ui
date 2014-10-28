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
    'np.user',
    'np.cart',
    'np.proteinlists',
    'np.search',
    'np.advanced',
    'np.export',
    'ui.codemirror',
    'auth',
    'authInterceptor'
]);


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

        //$httpProvider.interceptors.push(authInterceptor);


        var interceptor = ['$rootScope', '$q', 'flash',
            function (scope, $q, flash) {

                function success(response) {
                    // console.log("the response: ", response)
                    return response;
                }

                function error(response) {
                    var status = response.status;
                    // console.log("the error: ", response)

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
                        } else flash('alert-error', 'Some error occured' + " " + status + " " + response);
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
        $httpProvider.defaults.headers.common.Accept= 'application/json'


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
        // LZW-compress a string
        Tools.prototype.lzw_encode=function(s) {
            var dict = {};
            var data = (s + "").split("");
            var out = [];
            var currChar;
            var phrase = data[0];
            var code = 256;
            for (var i=1; i<data.length; i++) {
                currChar=data[i];
                if (dict[phrase + currChar] != null) {
                    phrase += currChar;
                }
                else {
                    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                    dict[phrase + currChar] = code;
                    code++;
                    phrase=currChar;
                }
            }
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            for (var i=0; i<out.length; i++) {
                out[i] = String.fromCharCode(out[i]);
            }
            return out.join("");
        }
        
        // Decompress an LZW-encoded string
        Tools.prototype.lzw_decode=function(s) {
            var dict = {};
            var data = (s + "").split("");
            var currChar = data[0];
            var oldPhrase = currChar;
            var out = [currChar];
            var code = 256;
            var phrase;
            for (var i=1; i<data.length; i++) {
                var currCode = data[i].charCodeAt(0);
                if (currCode < 256) {
                    phrase = data[i];
                }
                else {
                   phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
                }
                out.push(phrase);
                currChar = phrase.charAt(0);
                dict[code] = oldPhrase + currChar;
                code++;
                oldPhrase = phrase;
            }
            return out.join("");
        }   

        return new Tools();
    }
]);


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
