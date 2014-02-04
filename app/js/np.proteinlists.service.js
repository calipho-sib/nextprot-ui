'use strict';

var ProteinListService = angular.module('np.proteinlist.service', []);


ProteinListService.factory('ProteinListService', [
   '$resource',
   '$http',
   'config',
   'Tools',
   function($resource, $http, config, Tools) {
	   
	   //$http.defaults.useXDomain = true;
		//delete $http.defaults.headers.common["X-Requested-With"]
	   
	   var lists;
	   var selectedList;
	   var baseUrl = config.solr.BASE_URL+config.solr.SOLR_PORT;

	   console.log('base url: ', baseUrl);

	   var $api_list = $resource(baseUrl+'/nextprot-api/user/:username/protein-list.json', {username: '@username'}, {
		   get: { method: 'GET', isArray: false },
	   	  create: { method: 'POST' },
	   	  update: { method: 'PUT'}
	   });

	   var $pi_list = $resource(baseUrl+'/nextprot-api/user/:username/protein-list/:id.json', {username: '@username', id: '@id'}, {
		   delete: { method: 'DELETE'},
		   update: { method: 'PUT'}
	   });

	   var $p = $resource(baseUrl+'/nextprot-api/user/:username/protein-list/:list.json', {username: '@username', name: '@name'}, {
	   		get: { method: 'GET' }
	   });

	   var $elements_api = $resource(baseUrl+'/nextprot-api/user/:username/protein-list/:list/:action.json', {username: '@username', list: '@name'}, {
	   		fix: { method: 'PUT' },
	   });


		var $list_results = $resource(baseUrl+'/nextprot-api/user/:username/protein-list/:list/:action.json', { 
			username: '@username', list: '@list', action: '@action'
		}, {
			get: { method: 'GET'}
		});


	   var ProteinListService = function() {};
	   
	   ProteinListService.prototype.getByUsername = function(username, cb) {
		   $api_list.get({username: username}, function(data) {
			  service.lists = data;
			  if(cb)cb(data);
		   });
	   };
	   
	   ProteinListService.prototype.createList = function(username, list, cb) {
	   		console.log('create list > ', list);
		   $api_list.create({ username: username }, list, function(data) {
				if(cb)cb(data);
			});
	   };
	   
		ProteinListService.prototype.updateList = function(username, list, cb) {
			$pi_list.update({ username: username, id: list.id }, list, function(data) {
				console.log('edit: ', data);
			});
		};

		ProteinListService.prototype.deleteList = function(username, listId, cb) {
			$pi_list.delete({username: username, id: listId}, function(data) {
				console.log('deleted: ', data);
			});
		}

		ProteinListService.prototype.getList = function(username, listName, cb) {
			$p.get({ username: username, name: listName }, function(list) {
				if(cb)cb(list);
			});
		}

	   ProteinListService.prototype.setSelectedList = function(list) {
		   selectedList = list;
	   }
	   
	   ProteinListService.prototype.getListIds = function(username, list, cb) {
	   		var params = { username: username, list: list, action: 'ids'};
	   		$list_results.get(params, function(result) {
	   			if(cb) cb(result);
	   		});
	   }

	   ProteinListService.prototype.getSelectedList = function(list) {
		   return selectedList;
	   }

		ProteinListService.prototype.getListResults = function(params, cb) {
			$list_results.get(params, function(results) {
				if(cb)cb(results);
			});
	   	}

	   	ProteinListService.prototype.combine = function(username, list, l1, l2, op, cb) {
	   		$list_results.get({ 
	   			action: 'combine',
	   			username: username, 
	   			name: list.name, 
	   			description: list.description,
	   			first: l1,
	   			second: l2, 
	   			op: op 
	   		}, function(data) {
	   			if(cb) cb(data);
	   		});
	   	}

	   	ProteinListService.prototype.addElements = function(username, listName, accs, cb) {
	   		$elements_api.fix( {
	   			action: 'add',
	   			username: username,
	   			list: listName,
	   		}, JSON.stringify(accs), function(data) {
	   			if(cb) cb(data);
	   		});
	   	}
	   
		ProteinListService.prototype.removeElements = function(username, listName, accs, cb) {
	   		$elements_api.fix( {
	   			action: 'remove',
	   			username: username,
	   			list: listName
	   		}, JSON.stringify(accs), function(data) {
	   			if(cb) cb(data);
	   		});
	   	}
	   var service =  new ProteinListService();
	   return service;
	   
   }
]);