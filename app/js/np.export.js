(function (angular, undefined) {
    'use strict';

    angular.module('np.export', [])
        .factory('exportService', exportService)
        .controller('ExportCtrl', ExportCtrl);


    ExportCtrl.$inject = ['$resource', '$scope', 'config', 'exportService'];
    function ExportCtrl($resource, $scope, config, exportService) {

        var allEntryTemplateValue = null;
        $scope.listToExport = {};

        $scope.formats = ["xml","txt"];
        $scope.selectedFormat = "xml";


        $scope.views = null;
        $scope.selectedView = null;

        exportService.getTemplates(function (formatViews) {
            //angular.copy($scope.exportFormats, formatTemplates);
            $scope.formatViews = formatViews;
            $scope.setSelectedFormat("xml");

        });

        $scope.setListToExport = function (list) {
            $scope.listToExport = angular.copy(list);
        }

        $scope.setSelectedFormat = function (format) {
            $scope.selectedFormat = format;
            $scope.views = $scope.formatViews[format];
            $scope.selectedView = $scope.views[0];
            allEntryTemplateValue = $scope.views[0];
        }

        $scope.setSelectedView = function (view) {
            $scope.selectedView = view.replace(new RegExp('^-+', ''), '');
        }

        $scope.getFileExportURL = function () {
            var exportListURL = config.api.API_URL + "/export";
            exportListURL += "/list/" + $scope.listToExport.id;
            if($scope.selectedView !== allEntryTemplateValue){
                exportListURL += "/" + $scope.selectedView;
            }

            exportListURL += "." + $scope.selectedFormat;
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
