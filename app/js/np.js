'use strict';

//Declare application level module which depends on additional filters and services (most of them are custom)
var App = angular.module('np', [
  'ngResource',  
  'ngRoute',
  '$strap.directives',
  'np.config',
  'np.search',
  'np.cart',
  'np.proteinlists'
]);



//Configure application $route, $location and $http services.
App.config([
	'$routeProvider',
	'$locationProvider',
	'$httpProvider',
	
	function ($routeProvider, $locationProvider, $httpProvider) {

		 //
		 // install display notification of ajax call
		 //$httpProvider.responseInterceptors.push('npHttpInterceptor');
		 var spinnerFunction = function (data, headers) {
			angular.element('.ajax-end').hide();
			angular.element('.ajax-start').show();
		    return data;
		 };
		 //$httpProvider.defaults.transformRequest.push(spinnerFunction);
		
		 
		 // List of routes of the application
		 $routeProvider
		   .when('/', {title:'welcome to nextprot',  templateUrl : 'partials/welcome.html'})

		   // Pages
		   .when('/about', {title:'about',templateUrl : 'partials/about.html'})
		
		   // 404
		   .when('/404', {title:'404',templateUrl : 'partials/errors/404.html'});
		   // Catch all
		   //.otherwise({redirectTo : '/404'});
		
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


//
// define loading service
angular.module('np.loading',[]).factory('npHttpInterceptor', function ($q, $window) {
  return function (promise) {
    return promise.then(function (response) {
	  angular.element('.ajax-end').show();
      angular.element('.ajax-start').hide();
      return response;
    }, 
    function (response) {
  	  angular.element('.ajax-end').show();
      angular.element('.ajax-start').hide();
      return $q.reject(response);
    });
  };
});

//Bootstrap (= launch) application
angular.element(document).ready(function () {
	//angular.bootstrap(document, ['np']);
});
