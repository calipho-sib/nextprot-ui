'use strict'

var ExportModule = angular.module('np.export', [
	'np.export.service'
]);

ExportModule.controller('ExportCtrl', [
    '$resource',
    '$scope',
    'config',
    'ExportService',
    function($resource, $scope, config, ExportService) {

        var baseUrl = config.api.BASE_URL + config.api.API_PORT;

        $scope.listToExport = {};
        $scope.exportFormats = [];
        $scope.selectedFormat = {"name" : "Select your format", "extension" : null};
        $scope.selectedTemplate = {"name" : "Select your template", "extension" : null};

        ExportService.getTemplates(function(formatTemplates){
            angular.extend($scope.exportFormats, formatTemplates.formats);
        });

        $scope.setListToExport = function (list){
            angular.extend($scope.listToExport, list);
            console.log($scope.listToExport);
        }

        $scope.setSelectedFormat = function (format){
            $scope.selectedFormat = {}
            $scope.selectedTemplate = {"name" : "Select your template", "extension" : null};
            angular.extend($scope.selectedFormat, format);
        }

        $scope.setSelectedTemplate = function (template){
            $scope.selectedTemplate = {}
            angular.extend($scope.selectedTemplate, template);
        }

        $scope.getFileExportURL = function () {
            var exportListURL = baseUrl + "/nextprot-api/export";
            exportListURL += "/template/" + $scope.selectedTemplate.name;
            exportListURL += "/list/" + $scope.listToExport.id + "." + $scope.selectedFormat.extension;
            return exportListURL;
        }
    }
]);

