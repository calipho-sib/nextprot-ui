(function (angular, undefined) {
    'use strict';

    angular.module('np.export', ['np.tracker'])
        .factory('exportService', exportService)
        .controller('ExportCtrl', ExportCtrl);

    ExportCtrl.$inject = ['Tracker', '$scope', '$routeParams', 'config', 'exportService'];
    function ExportCtrl(Tracker, $scope, $routeParams, config, exportService) {

        var multiEntryFormats = null;
        var singleEntryFormats = null;

        $scope.selectedFormat = null;
        $scope.views = null;
        $scope.selectedView = null;

        $scope.export = exportService;

        $scope.currentSearch = null;
        $scope.currentQuery = null;
        $scope.currentList = null;

        (function initEntryFormats() {

            multiEntryFormats = Object.keys(exportService.templates);
            singleEntryFormats = multiEntryFormats.slice(0);

            // removing 'txt' export for single entry: useless to export one accession number line
            if (!$scope.export.exportObjectType) {

                var index = singleEntryFormats.indexOf('txt');
                if (index > -1) {
                    singleEntryFormats.splice(index, 1);
                }
                index = singleEntryFormats.indexOf('xls');
                if (index > -1) {
                    singleEntryFormats.splice(index, 1);
                }
            }
        })();

        $scope.getFormats = function () {

            return (!$scope.export.exportObjectType) ? singleEntryFormats : multiEntryFormats;
        };

        $scope.setSelectedFormat = function (format) {
            $scope.selectedFormat = format;
            $scope.views = exportService.templates[format];
            $scope.selectedView = $scope.views[0];
            $scope.isSubPartHidden = (exportService.templates[format].length == 0);
        };

        $scope.setSelectedView = function (view) {
            $scope.selectedView = view.replace(new RegExp('^-+', ''), '');
        };

        $scope.gaTrackDownloadEvent = function (closeModal) {

            Tracker.trackDownloadEvent($scope.export.exportObjectType, $scope.selectedFormat, $scope.selectedView);

            if (closeModal) $scope.dismiss();
        };




        $scope.getFileExportURL = function () {

            //multiple entries
            if ($scope.export.exportObjectType) {

                var exportURL = config.api.API_URL + "/export/entries";
                exportURL += _addSuffixURLSubPart($scope.selectedView, $scope.selectedFormat);

                exportURL += "?" + $scope.export.exportObjectType + "=" + window.encodeURIComponent($scope.export.exportObjectIdentifier);

                //TODO
                if ($routeParams.filter)
                    exportURL += "&filter=" + $routeParams.filter;

                if ($routeParams.quality)
                    exportURL += "&quality=" + $routeParams.quality;

                if ($routeParams.sort)
                    exportURL += "&sort=" + $routeParams.sort;

                if ($routeParams.order)
                    exportURL += "&order=" + $routeParams.order;

                return exportURL;

            } else { // export one entry

                var exportURL = config.api.API_URL + "/entry";

                exportURL += "/" + $scope.export.exportObjectIdentifier;
                exportURL += _addSuffixURLSubPart($scope.selectedView, $scope.selectedFormat);
                return exportURL;
            }
        };

        //initialize with xml
        $scope.setSelectedFormat("xml");
    }


    exportService.$inject = ['config', '$http', 'flash', '$log'];
    function exportService(config, $http, flash, $log) {

        var ExportService = function () {

            var self = this;
            this.userQuery = null;
            this.userList = null;

            this.exportObjectType = null;
            this.exportObjectIdentifier = null;

            $http.get(config.api.API_URL+'/export/templates.json')
                .success(function (result) {

                    self.templates = {
                        "xml": result['xml'],
                        "json": result['xml'],
                        "txt": [],
                        "fasta": [],
                        "xls": ["entries","isoforms"]
                        //"peff": []
                    };
                })
                .error(function (data, status) {
                    var message = status+": cannot access views from '"+config.api.API_URL+"/export/templates.json'";
                    $log.error(message);
                    flash("alert-info", message);
                });
        };

        ExportService.prototype.setExportEntry = function (entry) {
            this.exportObjectType = null;
            this.exportObjectIdentifier = entry;
            this.exportTitle = "Download entry '" + entry + "'";
        };

        ExportService.prototype.reset = function () {
            this.userQuery = null;
            this.userList = null;
            this.searchQuery = null;
        };

        ExportService.prototype.setExportParameters = function (params) {

            if (params.queryId) { // neXtProt Query example NXQ_000001
                this.exportObjectType = "queryId";
                this.exportObjectIdentifier = this.userQuery.publicId;
                this.exportTitle = "Download entries for query: '" + this.userQuery.publicId + "'";
            } else if (params.listId) { //a simple list
                this.exportObjectType = "listId";
                this.exportObjectIdentifier = this.userList.publicId;
                this.exportTitle = "Download entries for list '" + this.userList.publicId + "'";
            } else if (params.query) {  //result from a query
                this.exportObjectType = "query";
                this.exportObjectIdentifier = params.query;
                this.exportTitle = "Download entries for simple query";
            }else if (params.sparql) {  //result from a query
                this.exportObjectType = "sparql";
                this.exportObjectIdentifier = params.sparql;
                this.exportTitle = "Download entries for sparql query";
            }

        };

        return new ExportService();
    }



    // PRIVATE METHODS /////////////////////////////////////////
    function _addSuffixURLSubPart (subpart, format){
        var suffix = "";
        if (subpart && (subpart !== 'full-entry')) {
            suffix += "/" + subpart;
        }
        suffix += "." + format;
        return suffix;
    }


})(angular); //global variable
