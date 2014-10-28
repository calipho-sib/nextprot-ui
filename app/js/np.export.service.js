'use strict';

var ExportService = angular.module('np.export.service', []);


ExportService.factory('ExportService', [
   '$resource',
    'config',
   function($resource, config) {

       var baseUrl = config.api.BASE_URL + config.api.API_PORT;
       var exportTemplatesUrl = baseUrl + '/nextprot-api-web/export/templates.json';

       var $export_templates_resource = $resource(exportTemplatesUrl, {
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