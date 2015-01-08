(function (angular, undefined) {
    'use strict';

    angular.module('np.export', [])
        .factory('exportService', exportService)
        .controller('ExportCtrl', ExportCtrl);


    ExportCtrl.$inject = ['$resource', '$scope', 'config', 'exportService'];
    function ExportCtrl($resource, $scope, config, exportService) {

        var allEntryTemplateValue = "All entries";
        $scope.listToExport = {};
        $scope.exportFormats = [];
        $scope.selectedFormat = {"name": "Select your format", "extension": null};
        $scope.selectedTemplate = allEntryTemplateValue;

        exportService.getTemplates(function (formatTemplates) {
            angular.extend($scope.exportFormats, formatTemplates.formats);
            $scope.selectedFormat = $scope.exportFormats[0];
        });

        $scope.setListToExport = function (list) {
            $scope.listToExport = angular.copy(list);
        }

        $scope.setSelectedFormat = function (format) {
            $scope.selectedFormat = {}
            $scope.selectedTemplate = allEntryTemplateValue;
            $scope.selectedFormat  = angular.copy(format);
        }

        $scope.setSelectedTemplate = function (template) {
            $scope.selectedTemplate = template.replace(new RegExp('^-+', ''), '');
        }

        $scope.getFileExportURL = function () {
            var exportListURL = config.api.API_URL + "/export";
            exportListURL += "/list/" + $scope.listToExport.id;
            if($scope.selectedTemplate !== allEntryTemplateValue){
                exportListURL += "/" + $scope.selectedTemplate;
            }

            exportListURL += "." + $scope.selectedFormat.extension;
            return exportListURL;
        };


    }


    exportService.$inject = ['$resource', 'config'];
    function exportService($resource, config) {

        var exportTemplatesUrl = config.api.API_URL + '/export/templates.json';

        var $export_templates_resource = $resource(exportTemplatesUrl, {
            get: {method: 'GET', isArray: false}
        });


        var ExportService = function () {
        };

        ExportService.prototype.getTemplates = function (cb) {
            return $export_templates_resource.get(null, function (data) {
                if (cb)cb(data)
            });
        };

        var service = new ExportService();
        return service;

    }


})(angular); //global variable
