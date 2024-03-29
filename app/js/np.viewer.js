(function (angular, undefined) {
    'use strict';

    angular.module('np.viewer', [])
        .config(viewerConfig)
        .factory('viewerService', viewerService)
        .controller('ViewerCtrl', ViewerCtrl)
        .service('viewerURLResolver', viewerURLResolver)
        .directive('nextprotElement', nextprotElement)
        .directive('publicationElement', publicationElement)

    nextprotElement.$inject = ['npSettings', '$location', 'viewerService'];
    function nextprotElement(npSettings, $location, viewerService) {

        var entry = "";
        var elementReady = false;

        function setNextProtCustomElementName(scope, nxConfig) {

            var path = $location.$$path;
            scope.link = viewerService.getEntryElementUrl();
            if (path.match(/^\/entry\/[^\/]+\/(function)?$/) != null) {
                scope.customElement = "function-view";
            }
            else if (path.match(/^\/entry\/[^\/]+\/function-predictions$/) != null) {
                scope.customElement = "function-predictions-view";
            }
            else if (path.match(/^\/entry\/[^\/]+\/medical$/) != null) {
                scope.customElement = "medical-view";
            }
            else if (path.match(/^\/entry\/[^\/]+\/expression$/) != null) {
                scope.customElement = "expression-view";
            }
            else if (path.match(/^\/entry\/[^\/]+\/interactions$/) != null) {
                scope.customElement = "interactions-view";
            }
            else if (path.match(/^\/entry\/[^\/]+\/localization$/) != null) {
                scope.customElement = "localization-view";
            }
            else if (path.match(/^\/entry\/[^\/]+\/sequence$/) != null) {
                scope.customElement = "sequence-view";
            }
            else if (path.match(/^\/entry\/[^\/]+\/structures$/) != null) {
                scope.customElement = "structures-view";
            }
            else if (path.match(/^\/blast\/.+/) != null) {
                nxConfig.begin = scope.seqStart;
                nxConfig.end = scope.seqEnd;
                nxConfig.sequence = scope.sequence;

                scope.customElement = "blast-view"
            }
            else if (path.match(/^\/entry\/[^\/]+\/proteomics$/) != null) {
                scope.customElement = "proteomics-view";
            }
            else if (path.match(/^\/entry\/[^\/]+\/identifiers$/) != null) {
                scope.customElement = "identifiers-view";
            }
            else if (path.match(/^\/entry\/[^\/]+\/publications$/) != null) {
                nxConfig.pubType = "curated";
                scope.customElement = "publications-view";
            }
            else if (path.match(/^\/entry\/[^\/]+\/computed_references$/) != null) {
                nxConfig.pubType = "additional";
                scope.customElement = "publications-view";
            }
            else if (path.match(/^\/entry\/[^\/]+\/patents$/) != null) {
                nxConfig.pubType = "patent";
                scope.customElement = "publications-view";
            }
            else if (path.match(/^\/entry\/[^\/]+\/submissions$/) != null) {
                nxConfig.pubType = "submission";
                scope.customElement = "publications-view";
            }
            else if (path.match(/^\/entry\/[^\/]+\/web$/) != null) {
                nxConfig.pubType = "web_resource";
                scope.customElement = "publications-view";
            }
            else if (path.match(/^\/entry\/[^\/]+\/exons/) != null) {
                scope.customElement = "exon-view"
            }
            else if (path.match(/^\/term\/[^\/]+\/?\/relationship-graph\/?/) != null) {
                scope.customElement = "ancestor-graph-view"
                nxConfig.termAccession = scope.termName
            }
            else if (path.match(/^\/term\/[^\/]+\/?\/tree-browser\/?/) != null) {
                scope.customElement = "tree-browser-view"
                nxConfig.termAccession = scope.termName
            }
            else if (path.match(/^\/term\/[^\/]+\/?/) != null) {
                scope.link = '../../../elements/nextprot-elements/term-view.html';
                scope.customElement = "term-view"
                nxConfig.termAccession = scope.termName
            }
            else if (path.match(/^\/tools\/protein-digestion(\/(NX_)*.*)?/) != null) {
                scope.customElement = "digestion-overview";
                // Probably should do a bit of isoform validation
                if(path.search("NX") != -1) {
                    nxConfig.isoform = path.substr(path.lastIndexOf('/') + 1);
                }
            }
            else {
                console.error("could not find a match against " + path);
            }
        }

        function link(scope, element, attrs) {

            function renderElement(entry) {

                var nxConfig = { env: npSettings.environment };
                nxConfig.entry = entry;
                nxConfig.isoform = scope.isoformName;
                nxConfig.goldOnly = scope.goldOnly;

                var nxEntryData = scope.entryData;
                setNextProtCustomElementName(scope, nxConfig);
                var link = document.createElement('link');
                link.href = scope.link;
                link.rel = 'import'; 
                document.head.appendChild(link);
                element.html('<' + scope.customElement + ' nx-config=' + JSON.stringify(nxConfig) + '></' + scope.customElement + '>');
            }
            scope.$watch(attrs.nextprotElement, function (value) {
                elementReady = true;
                entry = value;
                renderElement(entry);
            });

            /*scope.$watch(function() { return viewerService.getEntryData()}, function() {

                if(Object.getOwnPropertyNames(scope.entryData).length == 0) {
                    renderElement(entry);
                }

                scope.entryData = viewerService.getEntryData();
                if(scope.entryData.entry && scope.entryData.overview && scope.entryData.keywords){
                    if(scope.currentURL.includes("/medical") || scope.currentURL.includes("/interactions")
                        || scope.currentURL.includes("/localization") || scope.currentURL.includes("/sequence")
                        || scope.currentURL.includes("/proteomics") || scope.currentURL.includes("/structure")) {
                        if(scope.entryData.isoforms) {
                            renderElement(entry);
                        }
                    } else {
                        renderElement(entry);
                    }
                } else if(scope.currentURL.includes("/blast") || scope.currentURL.includes("/tools")) {
                    renderElement(entry);
                }
            });*/
        }

        return {
            link: link
        };
    }

    publicationElement.$inject = ['npSettings', 'viewerService','$location'];
    function publicationElement(npSettings, viewerService,$location) {

        function link(scope, element, attrs) {

            scope.link = viewerService.getEntryElementUrl();
            function renderElement(publiName) {

                var nxConfig = {
                    env: npSettings.environment,
                    publicationId: publiName
                };
                var link = document.createElement('link');
                link.href = scope.link;
                link.rel = 'import';
                link.addEventListener('load', function(e) {
                  console.log('dynamic link loaded', e.target.href);
                }); 
                document.head.appendChild(link);
                var selectedEntry=$location.$$hash;
                element.html('<publication-with-linked-entries-view ' + ' nx-config=' + JSON.stringify(nxConfig) + ' selected-entry=' + JSON.stringify(selectedEntry) +  ' ></publication-with-linked-entries-view>');
            }
            scope.$watch(attrs.publicationElement, function (value) {

                renderElement(value);
            });
        }

        return {
            link: link
        };
    }

    viewerConfig.$inject = ['$routeProvider'];
    function viewerConfig($routeProvider) {

        var nxelementsv = { templateUrl: '/partials/viewer/nextprot-elements-viewer.html' };

        var ev = { templateUrl: '/partials/viewer/entry-viewer.html' };
        var tve = { templateUrl: '/partials/viewer/term-viewer-element.html' };
        var gve = { templateUrl: '/partials/viewer/global-viewer-element.html' };
        var pv = { templateUrl: '/partials/viewer/publi-viewer.html' };
        var gv = { templateUrl: '/partials/viewer/global-viewer.html' };
        var bv = { templateUrl: '/partials/viewer/blast-viewer.html' };

        $routeProvider

            //GLOBAL VIEWS https://github.com/calipho-sib/nextprot-viewers
            .when('/portals/:pn1', { templateUrl: '/partials/viewer/portal-viewer.html' })
            //            .when('/help/:help', {templateUrl: '/partials/doc/main-doc.html'})

            .when('/tools/protein-digestion', gve)
            .when('/tools/protein-digestion/:isoform', gve)
            .when('/tools/:t1', { templateUrl: '/partials/viewer/global-viewer.html' })

            .when('/view', gv)
            .when('/view/gh/:user/:repository', gv)

            //Global Viewer ? To separate.
            .when('/view/:gv1', gv)
            .when('/view/:gv1/:gv2', gv)
            .when('/view/:gv1/:gv2/:gv3', gv)

            .when('/blast/:isoform/:seqStart/:seqEnd', bv)
            .when('/blast/:isoform', bv)
            .when('/blast/sequence/:sequence', bv)

            //NP1 ENTRY views 
            .when('/entry/:entry/', nxelementsv)
            .when('/entry/:entry/function', nxelementsv)
            .when('/entry/:entry/function-predictions', nxelementsv)
            .when('/entry/:entry/medical', nxelementsv)
            .when('/entry/:entry/expression', nxelementsv)
            .when('/entry/:entry/interactions', nxelementsv)
            .when('/entry/:entry/localization', nxelementsv)
            .when('/entry/:entry/sequence', nxelementsv)
            .when('/entry/:entry/proteomics', nxelementsv)
            .when('/entry/:entry/structures', nxelementsv)
            .when('/entry/:entry/identifiers', nxelementsv)
            .when('/entry/:entry/publications', nxelementsv)
            .when('/entry/:entry/computed_references', nxelementsv)
            .when('/entry/:entry/patents', nxelementsv)
            .when('/entry/:entry/submissions', nxelementsv)
            .when('/entry/:entry/web', nxelementsv)
            .when('/entry/:entry/exons', nxelementsv)

            .when('/term/:termid/', tve)
            .when('/term/:termid/:element', tve)
            .when('/publication/:pubid', pv)

            //NP2 ENTRY views 
            .when('/entry/:entry/:ev1', ev)
            .when('/entry/:entry/:ev1/:ev2', ev)

            // NP2
            .when('/entry/:entry/gh/:user/:repository', ev)

    }


    ViewerCtrl.$inject = ['$rootScope', '$scope', '$sce', '$routeParams', '$location',  'config', 'exportService', 'viewerService', 'viewerURLResolver', 'npSettings'];
    function ViewerCtrl($rootScope, $scope, $sce, $routeParams, $location,  config, exportService, viewerService, viewerURLResolver, npSettings) {

        $scope.goldOnly = $routeParams.gold || false;
        $scope.goldFilter = $scope.goldOnly ? "?gold" : "";
        $scope.isoformName = $routeParams.isoform;

        $scope.partialName = "partials/doc/page.html";
        $scope.testt = $routeParams.article;

        $scope.currentURL = "";
        $scope.externalURL = null;
        $scope.widgetEntry = null;
        $scope.widgetTerm = null;
        $scope.widgetPubli = null;
        $scope.githubURL = null;
        $scope.communityMode = false;
        $scope.simpleSearchText = "";
        $scope.title = "";

        $scope.entryProps = {};
        $scope.entryName = $routeParams.entry;
        $scope.termName = $routeParams.termid;
        $scope.publiName = $routeParams.pubid;

        //params for blast search
        $scope.isoformName = $routeParams.isoform;
        $scope.sequence = $routeParams.sequence;
        $scope.seqStart = $routeParams.seqStart;
        $scope.seqEnd = $routeParams.seqEnd;

        $scope.entryData = {};

        if ($scope.termName) {
            viewerService.isHierarchic($scope.termName).$promise
                .then(function (data) {
                    $scope.hierarchicTerminology = data["is-hierarchical-terminology"];
                }, function (reason) {
                    console.error("no term data to display", reason);
                    $scope.hierarchicTerminology = false;
                });
        }

        var entryViewMode = $scope.entryName !== undefined;

        if (entryViewMode) {
            viewerService.getCommunityEntryViewers().success(function (data) {
                $scope.communityViewers = data;
            });

            viewerService.getEntryProperties($routeParams.entry).$promise.then(function (data) {

                $scope.entryProps.name = data.entry.overview.mainProteinName;
                $scope.entryProps.geneName = data.entry.overview.mainGeneName;
                $scope.entryProps.genesCount = (data.entry.overview.geneNames) ? data.entry.overview.geneNames.length : 0;

                angular.extend($scope.entryProps, data.entry.properties);
            });

            viewerService.getEntryPublicationCounts($routeParams.entry).$promise.then(function (publicationCounts) {

                $scope.entryProps.publicationCounts = publicationCounts;
            });

            viewerService.getEntryStats($routeParams.entry).$promise.then(function (entryStats) {

                $scope.entryProps.isoformCount = entryStats.isoforms;
            });

            viewerService.getEntryFunctionAnnotations($routeParams.entry).$promise.then(function (functionAnnotations) {
                var hasAnnotations = false;
                if(functionAnnotations.entry.annotationsByCategory["function-info"]) {
                    hasAnnotations = functionAnnotations.entry.annotationsByCategory["function-info"].length > 0;
                }
                $scope.entryProps.hasFunctionAnnotations = hasAnnotations;
            })
        } else {

            viewerService.getCommunityGlobalViewers().success(function (data) {
                $scope.communityViewers = data;
            });
        }

        $scope.setExportEntry = function (identifier) {
            exportService.setExportEntry(identifier);
        };

        $scope.makeSimpleSearch = function (text) {
            $location.search("isoform", null);
            $location.search("gold", null);
            $location.search("query", text);
            $location.path("proteins/search");
        };

        $scope.toggleGoldOnly = function () {

            var isoformQuery = $location.search().isoform;
            if ((!$scope.customElement && $scope.goldOnly !== false) || ($scope.customElement && !$scope.goldOnly)) {
                $location.search({ "gold": null, "isoform": isoformQuery });
            }
            else {
                $location.search({ "gold": true, "isoform": isoformQuery });
            }
        };

        $scope.hasPublication = function (count, link) {
            return parseInt(count) === 0 ? "#" : link
        };

        $scope.activePage = function (page) {

            
            if ($location.url() === '/entry/' + $routeParams.entry + "/") {
                if (page === 'function') {
                    return 'active';
                }
            }

            if ($location.url() === '/term/' + $routeParams.termid + "/") {
                if (page === 'proteins') {
                    return 'active';
                }
            }


            if ($location.url() === '/publication/' + $routeParams.pubid) {
                if (page === 'proteins') {
                    return 'active';
                }
            }


            var urlPage = '/entry/' + $routeParams.entry + "/" + page;
            if ($location.path() === urlPage) {
                return 'active';
            }

            if ($routeParams.element == page) return 'active';
            if ($routeParams.ev1 == page) return 'active';
            if ("portals/" + $routeParams.pn1 === page) return 'active';
            if ("tools/" + $routeParams.t1 === page) return 'active';
            if($location.url() === "/" + page) return 'active';
            if (("gh/" + $routeParams.user + "/" + $routeParams.repository) == page) return 'active';

            else return '';
        }

        // update entity documentation on path change
        $scope.$on('$routeChangeSuccess', function (event, next, current) {

            var path = $location.$$path;
            $scope.currentURL = path;
            var matches = path.match(/\/entry\/([^/]+)\/gene_identifiers/);
            if (matches !== null) {

                $location.path("/entry/" + matches[1] + "/identifiers")
            }
            else {
                $scope.widgetEntry = $routeParams.entry;
                $scope.widgetTerm = $routeParams.termid;
                $scope.widgetPubli = $routeParams.pubid;

                var np2Views = ["phenotypes", "peptides"];

                if (np2Views.indexOf($routeParams.ev1) > -1) { //Entry view
                    angular.extend($scope, viewerURLResolver.getScopeParamsForEntryViewers($routeParams.ev1, $routeParams.ev2, $routeParams.entry, $routeParams.gold));

                } else if ($routeParams.gv1) { //Global view
                    angular.extend($scope, viewerURLResolver.getScopeParamsForGlobalViewers($routeParams.gv1, $routeParams.gv2, $routeParams.gv3));

                } else if ($routeParams.pn1) { //Portal view
                    angular.extend($scope, viewerURLResolver.getScopeParamsForPortalViewers($routeParams.pn1));

                } else if ($routeParams.t1) { //Tools view
                    angular.extend($scope, viewerURLResolver.getScopeParamsForGlobalViewers($routeParams.t1, "", ""));
                } else if ($routeParams.repository) {
                    angular.extend($scope, viewerURLResolver.getScopeParamsForGitHubCommunity($routeParams.user, $routeParams.repository, $routeParams.entry));

                    // GRAILS INTEGRATION
                } else { //deprecated nextprot
                    angular.extend($scope, viewerURLResolver.getScopeParamsForNeXtProtGrails($location.$$path, $routeParams.element));
                }
            }

            // Loads isoform data if requried
            /*if(path.includes('/medical') || path.includes('/localization') || path.includes('/sequence')
                || path.includes('/structure') || path.includes('/proteomics') || path.includes('/interactions')) {
                viewerService.fetchIsoformData($routeParams.entry);
            }*/
        });

        //$scope.$on($routeParams.entry, viewerService.fetchCommonEntryData($routeParams.entry));

        /*$scope.$watch(function() { return viewerService.getEntryData()}, function() {
           let entryData = viewerService.getEntryData();
            if(entryData.overview) {
                let overviewData = entryData.overview;
                $scope.entryProps.name = overviewData.overview.mainProteinName;
                $scope.entryProps.geneName = overviewData.overview.mainGeneName;
                $scope.entryProps.genesCount = (overviewData.overview.geneNames) ? overviewData.overview.geneNames.length : 0;
            }
        });*/


        $scope.$watch(function() { return viewerService.getEntryMetaData()}, function() {
            let stats = viewerService.getEntryMetaData().stats;
            let count = viewerService.getEntryMetaData().count;
            let functionInfo = viewerService.getEntryMetaData().functionInfo;
            if(stats){
                $scope.entryProps.isoformCount = stats.isoforms;
            }

            if(count) {
                $scope.entryProps.publicationCounts = count;
            }

            if(functionInfo) {
                let hasAnnotations = functionInfo.entry.annotationsByCategory["function-info"].length > 0;
                $scope.entryProps.hasFunctionAnnotations = hasAnnotations;
            }

        });

    }

    viewerService.$inject = ['$resource', '$http', '$routeParams', 'config', '$location'];
    function viewerService($resource, $http, $routeParams, config, $location) {


        //skips authorization
        var entryViewersResource = $http({ url: config.api.API_URL + '/contents/json-config/community-entry-viewers.json', skipAuthorization: true, method: 'GET' });
        var globalViewersResource = $http({ url: config.api.API_URL + '/contents/json-config/community-global-viewers.json', skipAuthorization: true, method: 'GET' });

        var entryProperties = $resource(config.api.API_URL + '/entry/:entryName/overview.json', { entryName: '@entryName' }, { get: { method: "GET" } });
        var entryPublicationCounts = $resource(config.api.API_URL + '/entry-publications/entry/:entryName/count.json', { entryName: '@entryName' }, { get: { method: "GET" } });

        var entryStats = $resource(config.api.API_URL + '/entry/:entryName/stats.json', { entryName: '@entryName' }, { get: { method: "GET" } });

        var isHierarchicalOntology = $resource(config.api.API_URL + '/term/:termName/is-hierarchical-terminology.json', { termName: '@termName' }, { get: { method: "GET" } });

        var entryFunctionAnnotations = $resource(config.api.API_URL + '/entry/:entryName/function-info.json', { entryName: '@entryName' }, { get: { method: "GET" } });

        var commonEntryDataConfig = [
            {
                name: 'overview',
                path: '/overview',
            },
            {
                name: 'keywords',
                path: '/uniprot-keyword'
            }
        ];

        var IsoformDataConfig = [
            {
                name: 'isoforms',
                path: '/isoform',
            }
        ];

        var entryMetaDataConfig = [
            {
                name: 'stats',
                path: '/stats',
                urlPrefix: '/entry/'
            },
            {
                name: 'count',
                path: '/count',
                urlPrefix: '/entry-publications/entry/'
            },
            {
                name: 'functionInfo',
                path: '/function-info',
                urlPrefix: '/entry/'
            }
        ]

        var commonEntryData = {};

        var entryMetaData = {};

        var ViewerService = function () {
            //this.fetchCommonEntryData($routeParams.entry);
        };

        ViewerService.prototype.fetchCommonEntryData = function (entry) {
            if(commonEntryData && commonEntryData.entry === entry) {
                return commonEntryData;
            }

            if(commonEntryData.entry && commonEntryData.entry !== entry) {
                commonEntryData = {};
            }
            commonEntryDataConfig.forEach(function(dataConfig) {
                let dataResource = $resource(config.api.API_URL + '/entry/:entryName' + dataConfig.path,
                    { entryName: '@entryName' },
                    { get: { method: "GET" } });

                dataResource.get({entryName: entry}).$promise
                    .then(function(data) {
                        let entryName;
                        if(data.entry) {
                            entryName = data.entry.uniqueName;
                        }
                        let name = dataConfig.name;

                        let existingData = commonEntryData
                        commonEntryData = {
                            entry: entryName
                        }
                        if(existingData.overview){
                            commonEntryData.overview = existingData.overview;
                        }

                        if(existingData.keywords){
                            commonEntryData.keywords = existingData.keywords;
                        }

                        if(existingData.isoforms){
                            commonEntryData.isoforms = existingData.isoforms;
                        }
                        commonEntryData[name] = data.entry;
                    });
            });

            entryMetaDataConfig.forEach(function(dataConfig) {
                let dataResource = $resource(config.api.API_URL + dataConfig.urlPrefix +  ':entryName' + dataConfig.path,
                    { entryName: '@entryName' },
                    { get: { method: "GET" } });
                dataResource.get({entryName: entry}).$promise
                    .then(function(data){
                        let name = dataConfig.name;
                        let existingData = entryMetaData;
                        entryMetaData = {};
                        if(existingData.stats) {
                            entryMetaData.stats = existingData.stats;
                        }

                        if(existingData.count) {
                            entryMetaData.count = existingData.count;
                        }
                        entryMetaData[name] = data;
                    })
            });
        };

        ViewerService.prototype.fetchIsoformData = function (entry) {
            if(commonEntryData && commonEntryData.entry === entry && commonEntryData.isoforms) {
                return;
            }

            // A possible entry/path change, so isform data to be fetched.
            IsoformDataConfig.forEach(function(dataConfig) {
                let dataResource = $resource(config.api.API_URL + '/entry/:entryName' + dataConfig.path,
                    { entryName: '@entryName' },
                    { get: { method: "GET" } });

                dataResource.get({entryName: entry}).$promise
                    .then(function(data) {
                        let entryName;
                        if(data.entry) {
                            entryName = data.entry.uniqueName;
                        }
                        let name = dataConfig.name;

                        let existingData = commonEntryData
                        commonEntryData = {
                            entry: entryName
                        }
                        if(existingData.overview){
                            commonEntryData.overview = existingData.overview;
                        }

                        if(existingData.keywords){
                            commonEntryData.keywords = existingData.keywords;
                        }

                        if(existingData.isoforms){
                            commonEntryData.isoforms = existingData.isoforms;
                        }

                        if(existingData.isoformMappings){
                            commonEntryData.isoformMappings = existingData.isoformMappings;
                        }
                        commonEntryData[name] = data.entry;
                    });
            });
        }

        ViewerService.prototype.getEntryData = function () {
            return commonEntryData;
        }

        ViewerService.prototype.getEntryMetaData = function () {
            return entryMetaData;
        }

        ViewerService.prototype.getCommunityGlobalViewers = function () {
            return globalViewersResource;
        };

        ViewerService.prototype.getCommunityEntryViewers = function () {
            return entryViewersResource;
        };

        ViewerService.prototype.getEntryProperties = function (entryName) {
            return entryProperties.get({ entryName: entryName });
        };

        ViewerService.prototype.getEntryPublicationCounts = function (entryName) {
            return entryPublicationCounts.get({ entryName: entryName });
        };

        ViewerService.prototype.getEntryStats = function (entryName) {
            return entryStats.get({ entryName: entryName });
        };

        ViewerService.prototype.isHierarchic = function (termName) {
            return isHierarchicalOntology.get({ termName: termName });
        };

        ViewerService.prototype.getEntryFunctionAnnotations = function (entryName) {
            return entryFunctionAnnotations.get({ entryName: entryName });
        }

        ViewerService.prototype.getEntryElementUrl = function() {
            var path = $location.$$path;            
            var url;
            if (path.match(/^\/entry\/[^\/]+\/function-predictions$/) != null) {
                url = '/elements/nextprot-elements/function-predictions-view.html';
            }
            else if (path.match(/^\/entry\/[^\/]+\/(function)?$/) != null) {
                url = '/elements/nextprot-elements/function-view.html';
            }
            else if (path.match(/^\/entry\/[^\/]+\/medical$/) != null) {
                url = '/elements/nextprot-elements/medical-view.html';
            }
            else if (path.match(/^\/entry\/[^\/]+\/expression$/) != null) {
                url = '../elements/nextprot-elements/expression-view.html';
            }
            else if (path.match(/^\/entry\/[^\/]+\/interactions$/) != null) {
                url = '../elements/nextprot-elements/interactions-view.html';
            }
            else if (path.match(/^\/entry\/[^\/]+\/localization$/) != null) {
                url = '../elements/nextprot-elements/localization-view.html';
            }
            else if (path.match(/^\/entry\/[^\/]+\/sequence$/) != null) {
                url = '../elements/nextprot-elements/sequence-view.html';
            }
            else if (path.match(/^\/entry\/[^\/]+\/structures$/) != null) {
                url = '../elements/nextprot-elements/structures-view.html';
            }
            else if (path.match(/^\/blast\/.+/) != null) {
                url = '../elements/nextprot-elements/blast-view.html';
            }
            else if (path.match(/^\/entry\/[^\/]+\/proteomics$/) != null) {
                url = '../elements/nextprot-elements/proteomics-view.html';
            }
            else if (path.match(/^\/entry\/[^\/]+\/identifiers$/) != null) {
                url = '../elements/nextprot-elements/identifiers-view.html';
            }
            else if (path.match(/^\/entry\/[^\/]+\/publications$/) != null) {
                url = '../elements/nextprot-elements/publications-view.html';
            }
            else if (path.match(/publication\/[^\/]+/) != null) {
                url = '../elements/nextprot-elements/publication-with-linked-entries-view.html';
            }
            else if (path.match(/^\/entry\/[^\/]+\/computed_references$/) != null) {
                url = '../elements/nextprot-elements/publications-view.html';                
            }
            else if (path.match(/^\/entry\/[^\/]+\/patents$/) != null) {
                url = '../elements/nextprot-elements/publications-view.html';
            }
            else if (path.match(/^\/entry\/[^\/]+\/submissions$/) != null) {
                url = '../elements/nextprot-elements/publications-view.html';
            }
            else if (path.match(/^\/entry\/[^\/]+\/web$/) != null) {
                url = '../elements/nextprot-elements/publications-view.html';
            }
            else if (path.match(/^\/entry\/[^\/]+\/exons/) != null) {
                url = '../elements/nextprot-elements/exon-view.html';
            }
            else if (path.match(/^\/term\/[^\/]+\/?\/relationship-graph\/?/) != null) {
                url = '../elements/nextprot-elements/ancestor-graph-view.html';
            }
            else if (path.match(/^\/term\/[^\/]+\/?\/tree-browser\/?/) != null) {
                url = '../elements/nextprot-elements/tree-browser-view.html';
            }
            else if (path.match(/^\/term\/[^\/]+\/?/) != null) {
                url = '../elements/nextprot-elements/term-view.html';
            }
            else if (path.match(/^\/tools\/protein-digestion(\/(NX_)*.*)?/) != null) {
                url = '../elements/nextprot-elements/digestion-overview.html';
            }
            else {
                return null;
            }

            return url;
        };

        return new ViewerService();
    }


    viewerURLResolver.$inject = ['$sce', '$location', 'config', 'npSettings'];
    function viewerURLResolver($sce, $location, config, npSettings) {


        //Setting correct api for viewer
        var env = npSettings.environment;
        if (env.indexOf("NX_") !== -1) { // Choose the environemnt for the viewers
            env = 'dev';
            //env = 'localhost';
        }

        function concatEnvToUrl(url) {
            var envUrl = "";
            if (env !== 'pro') {
                if (url.indexOf('?') !== -1) {
                    envUrl = ("&env=" + env);
                } else {
                    envUrl = ("?env=" + env);
                }
            }
            return url + envUrl;
        }

        this.getScopeParamsForEntryViewers = function (ev1, ev2, entryName, goldOnly) {

            var url = window.location.origin + "/viewers/" + ev1;
            if (ev2) url += "/" + ev2;
            url += "/app/index.html";

            var isGoldFilterAvailable = ev1 === "phenotypes";

            var goldOnlyString = (goldOnly === true) && isGoldFilterAvailable ? ("&goldOnly=" + goldOnly) : "";

            return {
                "communityMode": false,
                "githubURL": "https://github.com/calipho-sib/nextprot-viewers/blob/master/ " + ev1 + "/app/index.html",
                "externalURL": $sce.trustAsResourceUrl(concatEnvToUrl(url + "?nxentry=" + entryName + "&inputOption=true&qualitySelector=true" + goldOnlyString)),
                "widgetURL": $sce.trustAsResourceUrl(concatEnvToUrl(url + "?nxentry=" + entryName + goldOnlyString)),
                "goldOnlyButton": isGoldFilterAvailable,
                "iframeHeight" : url.includes("VEP") ? "1500px" : "100%"
            }

        }

        this.getScopeParamsForGlobalViewers = function (gv1, gv2, gv3) {

            var url = window.location.origin + "/viewers/" + gv1;
            if (gv2) url += "/" + gv2;
            if (gv3) url += "/" + gv3;
            url += "/app/index.html";
            var urlWithTitle = url + "?title=true";

            return {
                "communityMode": false,
                "githubURL": "https://github.com/calipho-sib/nextprot-viewers/" + gv1,
                "externalURL": $sce.trustAsResourceUrl(concatEnvToUrl(urlWithTitle)),
                "widgetURL": $sce.trustAsResourceUrl(concatEnvToUrl(url)),
                "title": gv1
            }

        }
        this.getScopeParamsForPortalViewers = function (pn1) {

            var url = window.location.origin + "/viewers/portals/" + pn1;
            //            if (gv2) url += "/" + gv2;
            //            if (gv3) url += "/" + gv3;
            url += "/app/index.html";
            var urlWithTitle = url + "?title=true";

            return {
                "communityMode": false,
                "githubURL": "https://github.com/calipho-sib/nextprot-viewers/portals/" + pn1,
                "externalURL": $sce.trustAsResourceUrl(concatEnvToUrl(urlWithTitle)),
                "widgetURL": $sce.trustAsResourceUrl(concatEnvToUrl(url)),
                "title": pn1 + " portal"
            }

        }


        this.getScopeParamsForGitHubCommunity = function (user, repository, entryName) {

            var url = window.location.protocol + "//" + user + ".github.io/" + repository + "/";
            var urlSource = "https://www.github.com/" + user + "/" + repository + "/";
            if (entryName != undefined) url += "?nxentry=" + entryName;

            var bannerText = "<p>neXtprot is happy to host third-party tools developed by the community. In case of problem, please contact the developers of the tool.</p>";
            //if(url.includes("VEP"))
            //    bannerText = bannerText + "<p>Developed by a community of developers on <a href=\'https:\/\/github.com\/calipho-sib\/feature-viewer\'>GitHub</a>. Please use GitHub to report issues or requests.</p>";

            return {
                "communityMode": true,
                "githubURL": urlSource,
                // "externalURL": $sce.trustAsResourceUrl(concatEnvToUrl(url)),
                // "widgetURL": $sce.trustAsResourceUrl(concatEnvToUrl(url))
                // issue with query string in url for community viewers, remove env tag : 
                "externalURL": $sce.trustAsResourceUrl(url),
                "widgetURL": $sce.trustAsResourceUrl(url),
                "bannerText" : bannerText
            }
        }

        this.getScopeParamsForNeXtProtGrails = function (path, element) {

            //            Redirect for term documentation page
            if (element === "documentation") {
                path = path.replace("documentation", "document");
            }

            /* np1Base: origin of NP1 http service, read from conf or set to localhost for dev/debug */
            var np1Base = config.api.NP1_URL + "/db";
            /* np2css: the css hiding header, footer and navigation items of NP1 page */
            var np2css = "/db/css/np2css.css"; // NP1 integrated css (same as local)
            //            var np2css = "http://localhost:3000/partials/viewer/np1np2.css"; // UI local css
            /* np2ori: the origin of the main frame (UI page) used as a base for relative links in iframe*/
            var np2ori = window.location.origin;
            /* np1Params: params to pass to NP1 */
            var np1Params = "?np2css=" + np2css + "&np2ori=" + np2ori;

            var queryStrings = $location.search();
            var query = "";

            if (path.split("/").slice(-1)[0] === "fasta" && queryStrings.hasOwnProperty("isoform")) {
                query = "&isoform=" + queryStrings["isoform"];
            }
            else if (queryStrings.hasOwnProperty("isoform")) {
                query = "&isoforms=" + queryStrings["isoform"];
            }

            var result = {
                "communityMode": false,
                "githubURL": null,
                "externalURL": np1Base + path + np1Params + query,
                "widgetURL": $sce.trustAsResourceUrl(np1Base + path + np1Params + query)
            }
            return result;

        }

    }


})(angular); //global variable