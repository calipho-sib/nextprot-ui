'use strict';

var UserService = angular.module('np.user.service', []);


UserService.factory('UserService', [
   '$resource',
   '$http',
   'config',
   'Tools',
   function($resource, $http, config, Tools) {

//       var baseUrl = config.solr.BASE_URL+config.solr.SOLR_PORT;

       var baseUrl = "http://10.2.2.96:8080";

       var $token = $resource(baseUrl+'/nextprot-api/oauth/token', {client_id: '@client_id', client_secret: '@client_secret', grant_type: 'client_credentials'}, {
           get: { method: 'POST' }
       });

       var UserService = function() {};

       UserService.prototype.getToken = function(cb) {
           $token.get({client_id: 'coolapp', client_secret:'123'}, function(data) {
               if(cb)cb(data);
           });
       };

       var service =  new UserService();
	   return service;
	   
   }
]);