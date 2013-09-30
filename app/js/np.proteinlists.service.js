'use strict';

var ProteinListService = angular.module('np.proteinlist.service', []);


ProteinListService.factory('ProteinListService', [
   '$resource',
   '$http',
   'config',
   'Tools',
   function($resource, $http, config, Tools) {
	   
//	   $http.defaults.useXDomain = true;
//	   delete $http.defaults.headers.common["X-Requested-With"]
	   
	   var lists;
	   var selectedList;
	   
	   var $api_list = $resource('http://localhost:8080/nextprot-api/user/:username/protein-list.json', {username: '@username'}, {
		   get: { method: 'GET', isArray: false },
	   	  create: { method: 'POST' }
	   	
	   });
	   
	   var ProteinListService = function() {};
	   
	   ProteinListService.prototype.getByUsername = function(username, cb) {
		   $api_list.get({username: username}, function(data) {
			  service.lists = data;
			  if(cb)cb(data);
		   });
	   };
	   
	   ProteinListService.prototype.createList = function(attrs, cb) {
		   $api_list.create({ username: 'mario'}, { name: attrs.list.name, description: attrs.list.description, accessions: attrs.list.accessions },
				   function(data) {
			   			if(cb)cb(data);
		   			});
	   };
	   
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