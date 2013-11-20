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
	   
	   var $api_list = $resource('http://localhost:8080/nextprot-api/user/:username/protein-list.json', {username: '@username'}, {
		   get: { method: 'GET', isArray: false },
	   	  create: { method: 'POST' },
	   	  update: { method: 'PUT'}
	   });

	   var $pi_list = $resource('http://localhost:8080/nextprot-api/user/:username/protein-list/:id.json', {username: '@username', id: '@id'}, {
		   delete: { method: 'DELETE'},
		   update: { method: 'PUT'}
	   });

	   
	   var ProteinListService = function() {};
	   
	   ProteinListService.prototype.getByUsername = function(username, cb) {
		   $api_list.get({username: username}, function(data) {
			  service.lists = data;
			  if(cb)cb(data);
		   });
	   };
	   
	   ProteinListService.prototype.createList = function(username, list, cb) {
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

	   ProteinListService.prototype.setSelectedList = function(list) {
		   selectedList = list;
	   }
	   
	   ProteinListService.prototype.getSelectedList = function(list) {
		   return selectedList;
	   }
	   
	   var service =  new ProteinListService();
	   return service;
	   
   }
]);