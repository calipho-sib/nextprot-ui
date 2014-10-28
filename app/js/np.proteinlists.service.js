'use strict';

var ProteinList = angular.module('np.proteinlist.service', []);


ProteinList.factory('ProteinList', [
   '$resource',
   '$http',
   'config',
   'Tools',
   function($resource, $http, config, Tools) {
	   
	   //$http.defaults.useXDomain = true;
		//delete $http.defaults.headers.common["X-Requested-With"]
	   
	   var lists;
	   var baseUrl = config.api.BASE_URL+config.api.API_PORT;





	   var ProteinList = function() {
	   		this.$dao=$resource(baseUrl+'/nextprot-api-web/user/:username/protein-list/:id/:action', 
				{username: '@username', id: '@id', action: '@action'}, {
				get: { method: 'GET', isArray: false },
				create: { method: 'POST' },
				update: { method: 'PUT'},
				fix: { method: 'PUT' }
	   		});

	   };
	   
	   ProteinList.prototype.getByUsername = function(user, cb) {
	   		var self=this;
	   		user.$promise.then(function(){
			   return self.$dao.get({username: user.profile.username}, function(data) {
				  service.lists = data;
				  if(cb)cb(data);
			   });
	   		})
	   		return this;
	   };
	   
	   ProteinList.prototype.create = function(user, list, cb) {
   		var self=this;
   		user.$promise.then(function(){
		   return self.$dao.create({ username: user.profile.username }, list, function(data) {
				if(cb)cb(data);
			});
   		})
   		return this;
	   };
	   
		ProteinList.prototype.update = function(user, list, cb) {
	   	  var self=this;
	   	  user.$promise.then(function(){
			return self.$dao.update({ username: user.profile.username, id: list.id }, list, function(data) {
			});
   		  })
   		  return this;
		};

		ProteinList.prototype.delete = function(user, listId, cb) {
	   	  var self=this;
   		  user.$promise.then(function(){
			return self.$dao.delete({username: user.profile.username, id: listId}, function(data) {
			});
   		  })
   		  return this;
		}


	   
	   ProteinList.prototype.getByIds = function(user, list, cb) {
	   	  var self=this;
	   	  user.$promise.then(function(){
	   		var params = { username: user.profile.username, id: list, action: 'ids'};
	   		return self.$dao.get(params, function(result) {
	   			if(cb) cb(result);
	   		});
   		  })
   		  return this;
	   }


	   	ProteinList.prototype.combine = function(user, list, l1, l2, op, cb) {
	   	  var self=this;
	   	  user.$promise.then(function(){
	   		return self.$dao.get({ 
	   			action: 'combine',
	   			username: user.profile.username, 
	   			name: list.name, 
	   			description: list.description,
	   			first: l1,
	   			second: l2, 
	   			op: op 
	   		}, function(data) {
	   			if(cb) cb(data);
	   		});
   		  })
   		  return this;
	   	}

	   	ProteinList.prototype.addElements = function(user, listName, accs, cb) {
	   	  var self=this;
	   	  user.$promise.then(function(){
	   		return self.$dao.fix( {
	   			action: 'add',
	   			username: user.profile.username,
	   			list: listName,
	   		}, JSON.stringify(accs), function(data) {
	   			if(cb) cb(data);
	   		});
   		  })
   		  return this;
	   	}
	   
		ProteinList.prototype.removeElements = function(user, listName, accs, cb) {
	   	  var self=this;
	   	  return user.$promise.then(function(){
	   		return self.$dao.fix( {
	   			action: 'remove',
	   			username: user.profile.username,
	   			list: listName
	   		}, JSON.stringify(accs), function(data) {
	   			if(cb) cb(data);
	   		});
   		  })
   		  return this;
	   	}
	   var service =  new ProteinList();
	   return service;
	   
   }
]);