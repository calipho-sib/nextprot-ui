'use strict'

var UploadListService = angular.module('np.proteinlist.upload', []);

UploadListService.factory('UploadListService', [
   'config',
   '$http',
   '$rootScope',
   function(config, $http, $rootScope) {
	   var _files = [];
	   
	   $http.defaults.useXDomain = true;
	   delete $http.defaults.headers.common["X-Requested-With"]
	   
	   var UploadListService = function() {}
	   
	   UploadListService.prototype.send = function(listName, file) {
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
	       };
	
	       // Send to server, where we can then access it with $_FILES['file].
	       data.append('file', file, file.name);
	       xhr.open('POST', 'http://localhost:8080/nextprot-api/protein-list/upload?name='+listName);
	       xhr.send(data);
	   }
	   
	   return new UploadListService();
   }
                                                
]);
