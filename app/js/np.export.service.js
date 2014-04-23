'use strict';

var ExportService = angular.module('np.export.service', []);


ExportService.factory('ExportService', [
   '$resource',
   function($resource) {
	   
	   var $export_templates_resource = $resource('http://localhost:8080/nextprot-api/export/templates.json', {
		   get: { method: 'GET', isArray: false }
	   });


	   var ExportService = function() {};

       ExportService.prototype.getTemplates = function(cb) {
           return $export_templates_resource.get(null, function(data){if(cb)cb(data)});
	   };
	   
	   var service =  new ExportService();
	   return service;
	   
   }
]);