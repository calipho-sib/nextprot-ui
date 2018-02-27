(function (angular, undefined) {
    'use strict';

    angular.module('np.viewer', [])
        .config(viewerConfig)
        .factory('viewerService', viewerService)
        .controller('ViewerCtrl', ViewerCtrl)
        .service('viewerURLResolver', viewerURLResolver)
        .directive('nextprotElement', nextprotElement)


    nextprotElement.$inject = ['npSettings', '$location'];
    function nextprotElement(npSettings, $location) {

        function setNextProtCustomElementName (scope, nxConfig) {

            var path = $location.$$path;

            if(path.match(/^\/entry\/[^\/]+\/(function)?$/) != null){
                scope.customElement = "function-view"
            }
            else if(path.match(/^\/entry\/[^\/]+\/medical$/) != null){
                scope.customElement = "medical-view"
            }
            else if(path.match(/^\/entry\/[^\/]+\/expression$/) != null){
                scope.customElement =  "expression-view"
            }
            else if(path.match(/^\/entry\/[^\/]+\/interactions$/) != null){
                scope.customElement = "interactions-view"
            }
            else if(path.match(/^\/entry\/[^\/]+\/localization$/) != null){
                scope.customElement = "localization-view"
            }
            else if(path.match(/^\/entry\/[^\/]+\/sequence$/) != null){
                scope.customElement = "sequence-view"
            }
            else if(path.match(/^\/entry\/[^\/]+\/structures$/) != null){
                scope.customElement = "structures-view"
            }
            else if(path.match(/^\/blast\/.+/)  != null){
                nxConfig.begin = scope.seqStart;
                nxConfig.end = scope.seqEnd;
                nxConfig.sequence = scope.sequence;

                scope.customElement = "blast-view"
            }
            else if(path.match(/^\/entry\/[^\/]+\/proteomics$/) != null){
                scope.customElement = "proteomics-view"
            }
            else if(path.match(/^\/entry\/[^\/]+\/identifiers$/) != null){
                scope.customElement = "identifiers-view"
            }
            else if(path.match(/^\/entry\/[^\/]+\/publications$/) != null){
                nxConfig.pubType = "curated";
                scope.customElement = "publications-view"
            }
            else if(path.match(/^\/entry\/[^\/]+\/computed_references$/) != null){
                nxConfig.pubType = "additional";
                scope.customElement = "publications-view"
            }
            else if(path.match(/^\/entry\/[^\/]+\/patents$/) != null){
                nxConfig.pubType = "patent";
                scope.customElement = "publications-view"
            }
            else if(path.match(/^\/entry\/[^\/]+\/submissions$/) != null){
                nxConfig.pubType = "submission";
                scope.customElement = "publications-view"
            }
            else if(path.match(/^\/entry\/[^\/]+\/web$/) != null){
                nxConfig.pubType = "web_resource";
                scope.customElement = "publications-view"
            }
            else {
                console.error("could not find a match against "+path);
            }
        }

        function link(scope, element, attrs) {

            function renderElement(entry) {

                var nxConfig = {env : npSettings.environment};
                nxConfig.entry = entry;
                nxConfig.isoform = scope.isoformName;
                nxConfig.goldOnly = scope.goldOnly;

                setNextProtCustomElementName(scope, nxConfig);

                // <publications-view nx-config='{"entry": "NX_Q8WXG9", "env": "build", "pubType": "curated"}'></publications-view>
                // "curated", "additional", "submissions", "patents", "online-resources"

                element.html('<'+scope.customElement+' nx-config='+JSON.stringify(nxConfig) + '></'+scope.customElement +'>');

                console.log(JSON.stringify(nxConfig));
            }
            scope.$watch(attrs.nextprotElement, function(value) {

                renderElement(value);
            });
        }

        return {
            link: link
        };

    }

    viewerConfig.$inject = ['$routeProvider'];
    function viewerConfig($routeProvider) {

        var nxelementsv = {templateUrl: '/partials/viewer/nextprot-elements-viewer.html'};

        var ev = {templateUrl: '/partials/viewer/entry-viewer.html'};
        var tv = {templateUrl: '/partials/viewer/term-viewer.html'};
        var pv = {templateUrl: '/partials/viewer/publi-viewer.html'};
        var gv = {templateUrl: '/partials/viewer/global-viewer.html'};
        var bv = {templateUrl: '/partials/viewer/blast-viewer.html'};

        $routeProvider

            //GLOBAL VIEWS https://github.com/calipho-sib/nextprot-viewers
            .when('/portals/:pn1', {templateUrl: '/partials/viewer/portal-viewer.html'})
//            .when('/help/:help', {templateUrl: '/partials/doc/main-doc.html'})

            .when('/tools/:t1', {templateUrl: '/partials/viewer/global-viewer.html'})
        
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

            .when('/term/:termid/',tv)
            .when('/term/:termid/:element',tv)
            .when('/publication/:pubid',pv)
            .when('/publication/:pubid/:element',pv)


            //NP2 ENTRY views 
            .when('/entry/:entry/:ev1', ev)
            .when('/entry/:entry/:ev1/:ev2', ev)

            // NP2
            .when('/entry/:entry/gh/:user/:repository', ev)

    }


    ViewerCtrl.$inject = ['$rootScope', '$scope', '$sce', '$routeParams', '$location', 'config', 'exportService', 'viewerService', 'viewerURLResolver', ];
    function ViewerCtrl($rootScope, $scope, $sce, $routeParams, $location, config, exportService,  viewerService, viewerURLResolver) {

        $scope.goldOnly = $routeParams.gold || false;
        $scope.goldFilter = $scope.goldOnly ? "?gold":"";
        $scope.isoformName = $routeParams.isoform;

        $scope.partialName = "partials/doc/page.html";
        $scope.testt = $routeParams.article;

        $scope.externalURL = null;
        $scope.widgetEntry = null;
        $scope.widgetTerm = null;
        $scope.widgetPubli = null;
        $scope.githubURL = null;
        $scope.communityMode = false;
        $scope.simpleSearchText = "";
        $scope.title = "";

        $scope.entryProps ={};
        $scope.entryName = $routeParams.entry;
        $scope.termName = $routeParams.termid;
        $scope.publiName = $routeParams.pubid;

        //params for blast search
        $scope.isoformName = $routeParams.isoform;
        $scope.sequence = $routeParams.sequence;
        $scope.seqStart = $routeParams.seqStart;
        $scope.seqEnd = $routeParams.seqEnd;

        var entryViewMode = $scope.entryName != undefined;

        if(entryViewMode){
            viewerService.getCommunityEntryViewers().success(function(data){
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
        }else {

            viewerService.getCommunityGlobalViewers().success(function(data){
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
        }

        $scope.toggleGoldOnly = function () {

            /* if ($scope.customElement === "expression-view") {
                //TODO nextprot elements should be loosely coupled with angular. Why does this need to be here? TBD with Fred, Mat and Dan.
                var tabView = document.getElementById("ontologyContent").hasAttribute("hidden");
                // bind this property in the root scope because a new isolated $scope is recreated each time
                // ViewerCtrl is instanciated when a $location is reset
                $rootScope.tabularView = tabView;
            } */
            var isoformQuery = $location.search().isoform;
            if ((!$scope.customElement && $scope.goldOnly !== false) || ($scope.customElement && !$scope.goldOnly)) {
                $location.search({"gold": null, "isoform": isoformQuery});
            }
            else {
                $location.search({"gold": true, "isoform": isoformQuery});
            }
        }

        $scope.hasPublication = function (count, link) {
            return parseInt(count) === 0 ? "#" : link
        }

        $scope.activePage = function (page) {

            //console.log(page);
            //console.log($routeParams);

          if($location.url() === '/entry/' + $routeParams.entry + "/") {
               if(page === 'function') {
                   return 'active';
               }
           }

          if($location.url() === '/term/' + $routeParams.termid + "/") {
               if(page === 'proteins') {
                   return 'active';
               }
           }


          if($location.url() === '/publication/' + $routeParams.pubid) {
               if(page === 'proteins') {
                   return 'active';
               }
           }


            var urlPage = '/entry/' + $routeParams.entry + "/" + page;
            if($location.path() === urlPage) {
                return 'active';
            }


            if ($routeParams.element == page)  return 'active'
            if ($routeParams.ev1 == page)  return 'active';
            if ("portals/" + $routeParams.pn1 === page) return 'active';
            if ("tools/" + $routeParams.t1 === page) return 'active';
            if (("gh/" + $routeParams.user + "/" + $routeParams.repository) == page)  return 'active';

            else return '';
        }

        // update entity documentation on path change
        $scope.$on('$routeChangeSuccess', function (event, next, current) {

            var path = $location.$$path;
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
        });


    }


    viewerService.$inject = ['$resource', '$http', 'config'];
    function viewerService($resource, $http, config) {


        //skips authorization
        var entryViewersResource = $http({url: config.api.API_URL + '/contents/json-config/community-entry-viewers.json', skipAuthorization : true, method: 'GET'});
        var globalViewersResource = $http({url: config.api.API_URL + '/contents/json-config/community-global-viewers.json', skipAuthorization : true, method: 'GET'});

        var entryProperties = $resource(config.api.API_URL + '/entry/:entryName/overview.json', {entryName: '@entryName'}, {get : {method: "GET"}});
        var entryPublicationCounts = $resource(config.api.API_URL + '/entry-publications/entry/:entryName/count.json', {entryName: '@entryName'}, {get : {method: "GET"}});

        var entryStats = $resource(config.api.API_URL + '/entry/:entryName/stats.json', {entryName: '@entryName'}, {get : {method: "GET"}});

        var ViewerService = function () {

        };

        ViewerService.prototype.getCommunityGlobalViewers = function () {
            return globalViewersResource;
        };

        ViewerService.prototype.getCommunityEntryViewers = function () {
            return entryViewersResource;
        };

        ViewerService.prototype.getEntryProperties = function (entryName) {
            return entryProperties.get({entryName:entryName});
        };

        ViewerService.prototype.getEntryPublicationCounts = function (entryName) {
            return entryPublicationCounts.get({entryName:entryName});
        };

        ViewerService.prototype.getEntryStats = function (entryName) {
            return entryStats.get({entryName:entryName});
        };

        return new ViewerService();
    }


    viewerURLResolver.$inject = ['$sce', '$location', 'config', 'npSettings'];
    function viewerURLResolver($sce, $location, config, npSettings) {


        //Setting correct api for viewer
        var env = npSettings.environment;
        if(env.indexOf("NX_") !== -1){ // Choose the environemnt for the viewers
            env = 'dev';
            //env = 'localhost';
        }

        function concatEnvToUrl (url) {
            var envUrl = "";
            if(env !== 'pro'){
                if(url.indexOf('?') !== -1){
                    envUrl = ("&env=" + env);
                }else {
                    envUrl = ("?env=" + env);
                }
            }
            return url + envUrl;
        }

        this.getScopeParamsForEntryViewers = function (ev1, ev2, entryName, goldOnly) {

            var url = window.location.origin + "/viewers/" + ev1;
            if(ev2) url += "/" + ev2;
            url += "/app/index.html" ;
            
            var isGoldFilterAvailable = ev1 === "phenotypes";
            
            var goldOnlyString = (goldOnly === true) && isGoldFilterAvailable ? ("&goldOnly=" + goldOnly) : "";
            

            return {
                "communityMode": false,
                "githubURL": "https://github.com/calipho-sib/nextprot-viewers/blob/master/ " + ev1 + "/app/index.html",
                "externalURL":  $sce.trustAsResourceUrl(concatEnvToUrl(url + "?nxentry=" + entryName + "&inputOption=true&qualitySelector=true" + goldOnlyString)) ,
                "widgetURL": $sce.trustAsResourceUrl(concatEnvToUrl(url + "?nxentry=" + entryName + goldOnlyString)),
                "goldOnlyButton": isGoldFilterAvailable
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
            if(entryName != undefined) url += "?nxentry=" + entryName;

            return {
                "communityMode": true,
                "githubURL": urlSource,
                "externalURL": $sce.trustAsResourceUrl(concatEnvToUrl(url)),
                "widgetURL": $sce.trustAsResourceUrl(concatEnvToUrl(url))
            }
        }

        this.getScopeParamsForNeXtProtGrails = function (path, element) {

//            Redirect for term documentation page
            if (element === "documentation"){
                path = path.replace("documentation","document");
            }
            
            /* np1Base: origin of NP1 http service, read from conf or set to localhost for dev/debug */
            var np1Base=config.api.NP1_URL + "/db";
            /* np2css: the css hiding header, footer and navigation items of NP1 page */
            var np2css = "/db/css/np2css.css"; // NP1 integrated css (same as local)
//            var np2css = "http://localhost:3000/partials/viewer/np1np2.css"; // UI local css
            /* np2ori: the origin of the main frame (UI page) used as a base for relative links in iframe*/
            var np2ori = window.location.origin;
            /* np1Params: params to pass to NP1 */
            var np1Params = "?np2css=" + np2css + "&np2ori=" + np2ori;

            var queryStrings = $location.search();
            var query = "";
            
            if (path.split("/").slice(-1)[0] === "fasta" && queryStrings.hasOwnProperty("isoform")){
                query = "&isoform=" + queryStrings["isoform"];
            }
            else if (queryStrings.hasOwnProperty("isoform")){
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