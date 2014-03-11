'use strict';

var UserService = angular.module('np.user.service', []);


UserService.factory('UserService', [
   '$resource',
   '$http',
   'config',
   'Tools',
   function($resource, $http, config, Tools) {

       var baseAuthUrl = "http://10.2.2.96:8081";
       var baseUrl = config.solr.BASE_URL+config.solr.SOLR_PORT;

       var $token = $resource(baseAuthUrl+'/nextprot-auth/oauth/token', {client_id: 'nextprotui', grant_type: 'password', username : '@username', password : '@password'}, {
           get: { method: 'POST' }
       });


       var $userProfile = $resource(baseUrl+'/nextprot-api/user/:user_id.json', {user_id: '@user_id'}, {
           get: { method: 'GET' }
       });

       var UserService = function() {};

       UserService.prototype.getToken = function(username, password, cb) {
           $token.get({username:username, password:password}, function(data) {
               if(cb)cb(data);
           });
       };

       UserService.prototype.getUserProfile = function(cb) {
           $userProfile.get({user_id:1}, function(data) {
               if(cb)cb(data);
           });
       };

       var service =  new UserService();
	   return service;
	   
   }
]);