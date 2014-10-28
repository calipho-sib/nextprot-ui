'use strict';

var UserApplication = angular.module('np.user.application.service', []);


UserApplication.factory('UserApplication', [
   '$resource',
   '$http',
   'config',
   function($resource, $http, config) {

	   var baseUrl = config.api.BASE_URL+config.api.API_PORT;

	   var UserApplication = function() {
	   		this.$dao=$resource(baseUrl+'/nextprot-api-web/user/:username/user-application/:id',
				{username: '@username', id: '@id'}, {
				get: { method: 'GET', isArray: false },
				create: { method: 'POST' },
				update: { method: 'PUT'}
	   		});
	   };

       UserApplication.prototype.get = function(user, cb) {
	   		var self=this;
	   		user.$promise.then(function(){
			   return self.$dao.get({username: user.profile.username}, function(data) {
				  service.lists = data;
				  if(cb)cb(data);
			   });
	   		})
	   		return this;
	   };

       UserApplication.prototype.create = function(user, application, cb) {
   		var self=this;
   		user.$promise.then(function(){
		   return self.$dao.create({ username: user.profile.username }, list, function(data) {
				if(cb)cb(data);
			});
   		})
   		return this;
	   };

       UserApplication.prototype.update = function(user, list, cb) {
	   	  var self=this;
	   	  user.$promise.then(function(){
			return self.$dao.update({ username: user.profile.username, id: list.id }, list, function(data) {
			});
   		  })
   		  return this;
		};

       UserApplication.prototype.delete = function(user, listId, cb) {
	   	  var self=this;
   		  user.$promise.then(function(){
			return self.$dao.delete({username: user.profile.username, id: listId}, function(data) {
			});
   		  })
   		  return this;
		}

   }
]);
