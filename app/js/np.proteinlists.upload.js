'use strict'

var UploadListService = angular.module('np.proteinlist.upload', []);

UploadListService.factory('UploadListService', [
   'config',
   '$http',
   '$rootScope',
   function(config, $http, $rootScope) {
   		var baseUrl = config.solr.BASE_URL+config.solr.SOLR_PORT;
	   var _files = [];
	   
	   $http.defaults.useXDomain = true;
	   delete $http.defaults.headers.common["X-Requested-With"]
	   
	   var UploadListService = function() {}
	   
	   UploadListService.prototype.send = function(listId, file, cb) {
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
	       xhr.open('POST', baseUrl+'/nextprot-api/protein-list/upload?id='+listId);
	       xhr.send(data);
	       if(cb) cb({});
	   }
	   
	   return new UploadListService();
   }
                                                
]);
