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

        $scope.export = exportService;

        //Can be an entry, a list a query or the car
        $scope.setExportObjectType = function (exportType){
            exportService.exportObjectType = exportType;
        }

        $scope.getExportObjectType = function (){
            return exportService.exportObjectType;
        }

        exportService.getTemplates(function (formatViews) {
            //angular.copy($scope.exportFormats, formatTemplates);
            $scope.formatViews = formatViews;
            $scope.setSelectedFormat("xml");

        });

        $scope.setListToExport = function (list) {
            $scope.listToExport = angular.copy(list);
        }


        $scope.getListExportUrl = function (list) {
            return config.api.API_URL + "/export/list/" + list.id;
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

            var exportURL = config.api.API_URL;

            if($scope.export.exportObjectType === "entry"){
                exportURL +=  "/entry/" + $scope.export.exportObjectName;
            }else if($scope.export.exportObjectType === "list"){
                exportURL += "/lits/" + $scope.export.exportObjectName;
            }

            if($scope.selectedView !== allEntryTemplateValue){
                exportURL += "/" + $scope.selectedView;
            }

            exportURL += "." + $scope.selectedFormat;
            return exportURL;
        };

    }


    exportService.$inject = ['$resource', 'config'];
    function exportService($resource, config) {

        var exportTemplatesUrl = config.api.API_URL + '/export/templates.json';

        var $export_templates_resource = $resource(exportTemplatesUrl, {
            get: {method: 'GET', isArray: false}
        });


        var ExportService = function () {
            this.exportObjectType = "entry";
            this.exportObjectName = "NX_P35568";
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
