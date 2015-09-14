(function (angular, undefined) {
    'use strict';

    angular.module('np.viewer', [])
        .config(viewerConfig)
        .factory('viewerService', viewerService)
        .controller('ViewerCtrl', ViewerCtrl)
    ;

    viewerConfig.$inject = ['$routeProvider'];
    function viewerConfig($routeProvider) {

        var ev = {templateUrl: '/partials/viewer/entry-viewer.html'};
        var gv = {templateUrl: '/partials/viewer/global-viewer.html'};

        $routeProvider
            .when('/db/term/:db', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})
            .when('/db/entry/:db', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})
            .when('/db/entry/:element/:db', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})
            .when('/db/publication/:db', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})


            //GLOBAL VIEWS https://github.com/calipho-sib/nextprot-viewers
            .when('/view', gv)
            .when('/view/gist/:gistusr/:gistid', gv) // related to gists

            .when('/view/:gv1', gv)
            .when('/view/:gv1/:gv2', gv)
            .when('/view/:gv1/:gv2/:gv3', gv)

            //ENTRY VIEWS
            .when('/entry/:entry/', ev)
            .when('/entry/:entry/:element', ev)
            .when('/entry/:entry/view/:ev1', ev)
            .when('/entry/:entry/view/:ev1/:ev2', ev)
            .when('/entry/:entry/view/:ev1/:ev2/:ev3', ev)

            .when('/entry/:entry/gist/:gistusr/:gistid', ev) // related to gists
            .when('/entry/:entry/:repo/:user/:branch/:f1', ev)
            .when('/entry/:entry/:repo/:user/:branch/:f1/:f2', ev)
            .when('/entry/:entry/:repo/:user/:branch/:f1/:f2/:f3', ev)
            .when('/entry/:entry/:repo/:user/:branch/:f1/:f2/:f3/:f4', ev)
            .when('/term/:termid/', {templateUrl: '/partials/viewer/viewer-term-np1.html'})

    }


    ViewerCtrl.$inject = ['$scope', '$sce', '$routeParams', '$location', 'config', 'exportService', 'viewerService'];
    function ViewerCtrl($scope, $sce, $routeParams, $location, config, exportService,  viewerService) {

        $scope.externalURL = null;
        $scope.widgetEntry = null;
        $scope.githubURL = null;
        $scope.communityMode = false;
        $scope.simpleSearchText = "";

        $scope.entryProps ={};
        $scope.entryName = $routeParams.entry;

        var entryViewMode = $scope.entryName != undefined;

        if(entryViewMode){
            $scope.communityViewers = viewerService.getCommunityEntryViewers();
            viewerService.getEntryProperties($routeParams.entry).$promise.then(function (data) {

                $scope.entryProps.name = data.entry.overview.mainProteinName;
                $scope.entryProps.genesCount = data.entry.overview.geneNames.length;
                angular.extend($scope.entryProps, data.entry.properties);

            })

        }else {
            $scope.communityViewers = viewerService.getCommunityGlobalViewers();
        }

        $scope.setExportEntry = function (identifier) {
            exportService.setExportEntry(identifier);
        };

        $scope.makeSimpleSearch = function () {
            $location.search("query", $scope.simpleSearchText);
            $location.path("proteins/search");
        }

        $scope.activePage = function (page) {

           if(angular.equals({'entry': $routeParams.entry},  $routeParams)){ // Page function
               if(page === 'function') {
                   return 'active';
               }
           }

            if ($routeParams.element == page)  return 'active'
            if ("view/" + $routeParams.ev1 == page)  return 'active';
            if (("gist/" + $routeParams.gistusr + "/" + $routeParams.gistid) == page)  return 'active';

            else return '';
        }

        // update entity documentation on path change
        $scope.$on('$routeChangeSuccess', function (event, next, current) {
            $scope.widgetEntry = $routeParams.entry;

            //redirect for compatibility with old neXtProt
            if ($routeParams.db) {
                $location.path($location.$$path.replace("db/", ""));
            }

            if ($routeParams.ev1) { //Entry view
                angular.extend($scope, getScopeParamsForEntryViewers());
            }else if ($routeParams.gv1) { //Global view
                angular.extend($scope, getScopeParamsForGlobalViewers());

            // COMMUNITY VIEWERS etiher with GitHub or Gist //////////////////////////////////////
            } else if ($routeParams.repo) {
                angular.extend($scope, getScopeParamsForGitHub()); //GitHub
            } else if ($routeParams.gistusr && $routeParams.gistid) { //Gist
                angular.extend($scope, getScopeParamsForGist());

            // GRAILS INTEGRATION
            } else { //deprecated nextprot
                angular.extend($scope, getScopeParamsForNeXtProtGrails());
            }
        });


        var getScopeParamsForEntryViewers = function () {

            var url = window.location.protocol + "//rawgit.com/calipho-sib/nextprot-viewers/master/" + $routeParams.ev1;
            if($routeParams.ev2) url += "/" + $routeParams.ev2;
            if($routeParams.ev3) url += "/" + $routeParams.ev3;
            url += "/app/index.html" ;

            return {
                "communityMode": false,
                "githubURL": url.replace("rawgit.com", "github.com").replace("/master/", "/blob/master/"),
                "externalUrl":  $sce.trustAsResourceUrl(url + "?nxentry=" + $routeParams.entry + "&inputOption=true") ,
                "widgetURL": $sce.trustAsResourceUrl(url + "?nxentry=" + $routeParams.entry + "&inputOption=true")
            }

        }

        var getScopeParamsForGlobalViewers = function () {

            var url = window.location.protocol + "//rawgit.com/calipho-sib/nextprot-viewers/master/" + $routeParams.gv1;
            if ($routeParams.gv2) url += "/" + $routeParams.gv2;
            if ($routeParams.gv3) url += "/" + $routeParams.gv3;
            url += "/app/index.html";

            return {
                "communityMode": false,
                "githubURL": url.replace("rawgit.com", "github.com").replace("/master/", "/blob/master/"),
                "externalUrl": $sce.trustAsResourceUrl(url),
                "widgetURL": $sce.trustAsResourceUrl(url)
            }

        }


        var getScopeParamsForGitHub = function () {

            var url = window.location.protocol + "//rawgit.com/" + $routeParams.repo + "/" + $routeParams.user + "/" + $routeParams.branch + "/" + $routeParams.f1;
            //append if they exist
            if ($routeParams.f2) {
                url += "/" + $routeParams.f2;
                if ($routeParams.f3) {
                    url += "/" + $routeParams.f3;
                    if ($routeParams.f4) {
                        url += "/" + $routeParams.f4;
                    }
                }
            }

            return {
                "communityMode": true,
                "githubURL": url.replace("rawgit.com", "github.com").replace("/" + $routeParams.branch + "/", "/blob/" + $routeParams.branch + "/"),
                "externalURL": $sce.trustAsResourceUrl(url),
                "widgetURL": $sce.trustAsResourceUrl(url + "?nxentry=" + $routeParams.entry)
            }
        }

        var getScopeParamsForGist = function () {
            var _url = window.location.protocol + "//bl.ocks.org/" + $routeParams.gistusr + "/raw/" + $routeParams.gistid + "?nxentry=" + $routeParams.entry;
            return {
                "communityMode": true,
                "githubURL": window.location.protocol + "//bl.ocks.org/" + $routeParams.gistusr + "/" + $routeParams.gistid,
                "externalURL": $sce.trustAsResourceUrl(_url),
                "widgetURL": $sce.trustAsResourceUrl(_url)
            }
        }


        var getScopeParamsForNeXtProtGrails = function () {
            /* np1Base: origin of NP1 http service, read from conf or set to localhost for dev/debug */
            //var np1Base = "http://localhost:8080/db/entry/";
            var np1Base = config.api.NP1_URL + "/db";
            /* np2css: the css hiding header, footer and navigation items of NP1 page */
            var np2css = "/db/css/np2css.css"; // NP1 integrated css (same as local)
            //var np2css = "http://localhost:3000/partials/viewer/np1np2.css"; // UI local css
            /* np2ori: the origin of the main frame (UI page) used as a base for relative links in iframe*/
            var np2ori = window.location.origin;
            /* np1Params: params to pass to NP1 */
            var np1Params = "?np2css=" + np2css + "&np2ori=" + np2ori;

            return {
                "communityMode": false,
                "githubURL": null,
                "externalURL": np1Base + $location.$$path,
                "widgetURL": $sce.trustAsResourceUrl(np1Base + $location.$$path + np1Params)
            }
        }

    }


    viewerService.$inject = ['$resource', 'config'];
    function viewerService($resource, config) {

        var entryViewersResource = $resource(config.api.API_URL + '/assets/viewers/community-entry-viewers.json', {}, { list : {method : "GET", isArray : true}});

        var globalViewersResource = $resource(config.api.API_URL + '/assets/viewers/community-global-viewers.json', {}, { list : {method : "GET", isArray : true}});

        var entryProperties = $resource(config.api.API_URL + '/entry/:entryName/overview.json', {entryName: '@entryName'}, {get : {method: "GET"}});


        var ViewerService = function () {

        };

        ViewerService.prototype.getCommunityGlobalViewers = function () {
            return globalViewersResource.list();
        }

        ViewerService.prototype.getCommunityEntryViewers = function () {
            return entryViewersResource.list();
        }

        ViewerService.prototype.getEntryProperties = function (entryName) {
            return entryProperties.get({entryName:entryName});
        }

        return new ViewerService();
    }




})(angular); //global variable
