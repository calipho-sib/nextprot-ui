(function (angular, undefined) {'use strict';

// create the module and define one service
angular.module('np.user.protein.lists.service', [])
	.factory('userProteinList',userProteinList)
	.factory('UploadListService',UploadListService); 


//
// implement the service
userProteinList.$inject=['$resource', 'config'];
function userProteinList($resource, config) {

	var Proteins = function() {

		this.$dao=$resource(config.api.API_URL +'/user/:username/protein-list/:id/:action',
			{username: '@username', id: '@id', action: '@action'}, {
			get: { method: 'GET', isArray: false },
				list: { method: 'GET', isArray: false },
				create: { method: 'POST' },
			update: { method: 'PUT'},
			fix: { method: 'PUT' }
		});
	};
   
	Proteins.prototype.getByUsername = function(user, cb) {
		var me=this;
		user.$promise.then(function(){
			return me.$dao.get({username: user.profile.username}, function(data) {
				service.lists = data;
				if(cb)cb(data);
	 		});
		})
		return this;
	};
   
   Proteins.prototype.create = function(user, list, cb) {
 		var self=this;
		console.log("create list",user)
 		user.$promise.then(function(){
	 		return self.$dao.create({ username: user.username }, list, function(data) {
				if(cb)cb(data);
			});
 		})
 		return this;
   };
   
	Proteins.prototype.update = function(user, list, cb) {
   	 	var self=this;
   		user.$promise.then(function(){
			return self.$dao.update({ username: user.profile.username, id: list.id }, list, function(data) {});
 		})
 		return this;
	};

	Proteins.prototype.delete = function(user, listId, cb) {
   	  var self=this;
 		  user.$promise.then(function(){
		return self.$dao.delete({username: user.profile.username, id: listId}, function(data) {
		});
 		  })
 		  return this;
	}


   
   Proteins.prototype.getByIds = function(user, list, cb) {
   	  var self=this;
   	  user.$promise.then(function(){
   		var params = { username: user.profile.username, id: list, action: 'ids'};
   		return self.$dao.get(params, function(result) {
   			if(cb) cb(result);
   		});
 		  })
 		  return this;
   }


   	Proteins.prototype.combine = function(user, list, l1, l2, op, cb) {
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

   	Proteins.prototype.addElements = function(user, listName, accs, cb) {
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
   
	Proteins.prototype.removeElements = function(user, listName, accs, cb) {
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
	var service =  new Proteins();
	return service;
}


//
// implement the service
UploadListService.$inject=['config','$http','$rootScope'];
function UploadListService(config, $http, $rootScope) {
   	var baseUrl = config.api.BASE_URL+config.api.API_PORT;
	var _files = [];
	   
	$http.defaults.useXDomain = true;
	delete $http.defaults.headers.common["X-Requested-With"]
   
	 var UploadList = function() {}
	 UploadList.prototype.send = function(listId, file, cb) {
	 	var data = new FormData(),
	 	xhr = new XMLHttpRequest();

	     // When the request starts.
	     xhr.onloadstart = function () {
	         console.log('Factory: upload started: ', file.name);
	         $rootScope.$emit('upload:loadstart', xhr);
	     };

	     // When the request has failed.
	     xhr.onerror = function (e) {
	         $rootScope.$emit('upload:error', e);
	         if(cb) cb({error: e});
	     };

	     // Send to server, where we can then access it with $_FILES['file].
	     data.append('file', file, file.name);
	     xhr.open('POST', baseUrl+'/nextprot-api-web/protein-list/upload?id='+listId);
	     xhr.send(data);
	     if(cb) cb({});
	}
	return new UploadList();
}
             

})(angular);
