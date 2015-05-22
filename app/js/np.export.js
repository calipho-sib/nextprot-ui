(function (angular, undefined) {
    'use strict';

    angular.module('np.export', ['np.tracker'])
        .factory('exportService', exportService)
        .controller('ExportCtrl', ExportCtrl);


    ExportCtrl.$inject = ['Tracker', '$resource', '$scope', '$routeParams', 'config', 'exportService', 'Search'];
    function ExportCtrl(Tracker, $resource, $scope, $routeParams, config, exportService, Search) {

        var allEntryTemplateValue = null;
        $scope.selectedFormat;
        $scope.views;
        $scope.selectedView;

        $scope.export = exportService;

        $scope.currentSearch = null;
        $scope.currentQuery = null;
        $scope.currentList = null;

        $scope.setSelectedFormat = function (format) {
            $scope.selectedFormat = format;
            $scope.views = exportService.templates[format];
            $scope.selectedView = $scope.views[0];
            allEntryTemplateValue = $scope.views[2]; //TODO make this a bit more clever "full-entry"?
            $scope.isSubPartHidden = (format == 'fasta' || format == 'peff') ? true : false;
        };

        $scope.getFormats = function () {
            return Object.keys(exportService.templates);
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

                var exportURL = config.api.API_URL + "/export/entries"
                if ($scope.selectedView !== allEntryTemplateValue) {
                    exportURL += "/" + $scope.selectedView;
                }
                exportURL += "." + $scope.selectedFormat;
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
                if ($scope.selectedView !== allEntryTemplateValue) {
                    exportURL += "/" + $scope.selectedView;
                }
                exportURL += "." + $scope.selectedFormat;
                return exportURL;
            }
            ;
        };


        //initialize with xml
        $scope.setSelectedFormat("xml");


    }


    exportService.$inject = ['$resource', 'config'];
    function exportService($resource, config) {


        var ExportService = function () {

            this.userQuery = null;
            this.userList = null;
            this.searchQuery = null;

            this.exportObjectType;
            this.exportTitle;
            this.exportObjectIdentifier;


            //TODO this is a bit ugly, it should request the api (be careful with multiple calls though)

            var exportViews = [
                "accession",
                "overview",
                "full-entry",
                "annotation",
                "publication",
                "xref",
                "keyword",
                "identifier",
                "chromosomal-location",
                "genomic-mapping",
                "interaction",
                "isoform",
                "antibody",
                "peptide",
                "srm-peptide-mapping",
                "-positional-annotation",
                "--region",
                "---compositionally-biased-region",
                "---repeat",
                "---short-sequence-motif",
                "---miscellaneous-region",
                "---domain",
                "---zinc-finger-region",
                "---nucleotide-phosphate-binding-region",
                "---dna-binding-region",
                "---interacting-region",
                "---calcium-binding-region",
                "---coiled-coil-region",
                "--non-consecutive-residue",
                "--variant",
                "--mutagenesis",
                "--sequence-conflict",
                "--ptm",
                "---ptm-info",
                "---lipidation-site",
                "---glycosylation-site",
                "---disulfide-bond",
                "---modified-residue",
                "---selenocysteine",
                "---cross-link",
                "--non-terminal-residue",
                "--variant-info",
                "--secondary-structure",
                "---beta-strand",
                "---helix",
                "---turn",
                "--domain-info",
                "--processing-product",
                "---peroxisome-transit-peptide",
                "---mature-protein",
                "---cleavage-site",
                "---signal-peptide",
                "---maturation-peptide",
                "---initiator-methionine",
                "---mitochondrial-transit-peptide",
                "--site",
                "---miscellaneous-site",
                "---binding-site",
                "---metal-binding-site",
                "---active-site",
                "--topology",
                "---topological-domain",
                "---intramembrane-region",
                "---transmembrane-region",
                "--mapping",
                "---pdb-mapping",
                "-general-annotation",
                "--enzyme-classification",
                "--miscellaneous",
                "--caution",
                "--sequence-caution",
                "--interaction",
                "---binary-interaction",
                "---small-molecule-interaction",
                "---cofactor",
                "---enzyme-regulation",
                "---interaction-info",
                "--keyword",
                "---uniprot-keyword",
                "--medical",
                "---disease",
                "---allergen",
                "---pharmaceutical",
                "--induction",
                "--function",
                "---catalytic-activity",
                "---function-info",
                "---go-molecular-function",
                "---pathway",
                "---go-biological-process",
                "--cellular-component",
                "---go-cellular-component",
                "---subcellular-location",
                "---subcellular-location-note",
                "--expression",
                "---expression-info",
                "---developmental-stage-info",
                "---expression-profile",
                "-name",
                "--family-name"
            ];

            this.templates = {
                "xml": exportViews,
                "json": exportViews,
                "fasta": [],
                "peff": []
            };
        };

        ExportService.prototype.setExportEntry = function (entry) {
            this.exportObjectType = null;
            this.exportObjectIdentifier = entry;
            this.exportTitle = "Download entry '" + entry + "'";
        }

        ExportService.prototype.reset = function () {
            this.userQuery = null;
            this.userList = null;
            this.searchQuery = null;
        }


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

        }


        var service = new ExportService();
        return service;

    }


})(angular); //global variable
