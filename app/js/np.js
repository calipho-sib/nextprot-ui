'use strict';

//Declare application level module which depends on additional filters and services (most of them are custom)
var App = angular.module('np', [
  'ngSanitize',
  'ngResource',  
  'ngRoute',
  'ngAnimate',
  'ngCookies',
  '$strap.directives',
  'np.config',
  'np.search',
  'np.cart',
  'np.proteinlists',
  'np.advanced'
]);



//Configure application $route, $location and $http services.
App.config([
	'$routeProvider',
	'$locationProvider',
	'$httpProvider',
	
	function ($routeProvider, $locationProvider, $httpProvider) {

		
		 
		 // List of routes of the application
		 $routeProvider
		   .when('/', {title:'welcome to nextprot',  templateUrl : 'partials/welcome.html'})

		   // Pages
		   .when('/about', {title:'about',templateUrl : 'partials/about.html'})
		
		   // 404
		   .when('/404', {title:'404',templateUrl : 'partials/errors/404.html'})
		   // Catch all
		   .otherwise({redirectTo : '/404'});
		
		 // Without serve side support html5 must be disabled.
		 $locationProvider.html5Mode(true);
		 //$locationProvider.hashPrefix = '!';	 
	}
]);

App.factory('Tools', [
                      function() {
                    	  var Tools = function() {};
                    	  
                    	  Tools.prototype.convertToSlug = function(name) {
                  		    return name
            		        .toLowerCase()
            		        .replace(/[^\w ]+/g,'')
            		        .replace(/ +/g,'-')
            		        ;
                    	  }
                    	  
                    	  return new Tools();
                      }
]);

App.directive('npBase', ['config', function(config) {
    return function(scope, elm, attrs) {
      if (attrs['npBase'])
      	return elm.attr(attrs['npBase'], config.solr.base)
      elm.attr('href',config.solr.base);
    };
  }]);

//Bootstrap (= launch) application ==> ng-app='np'
angular.element(document).ready(function () {
});
