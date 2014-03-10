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

       var $token = $resource(baseUrl+'/nextprot-api/oauth/token', {client_id: 'nextprotui', grant_type: 'password', username : '@username', password : '@password'}, {
           get: { method: 'POST' }
       });

       var UserService = function() {};

       UserService.prototype.getToken = function(username, password, cb) {
           $token.get({username:username, password:password}, function(data) {
               if(cb)cb(data);
           });
       };

       var service =  new UserService();
	   return service;
	   
   }
]);