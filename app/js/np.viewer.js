(function (angular, undefined) {
    'use strict';

    angular.module('np.viewer', [])
        .config(viewerConfig)
        .factory('viewerService', viewerService)
        .controller('ViewerCtrl', ViewerCtrl)
        .service('viewerURLResolver', viewerURLResolver)
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
            .when('/view/gh/:user/:repository', ev)

            .when('/view/:gv1', gv)
            .when('/view/:gv1/:gv2', gv)
            .when('/view/:gv1/:gv2/:gv3', gv)

            //ENTRY VIEWS
            .when('/entry/:entry/', ev)
            .when('/entry/:entry/:element', ev)
            .when('/entry/:entry/view/:ev1', ev)
            .when('/entry/:entry/view/:ev1/:ev2', ev)

            .when('/entry/:entry/gh/:user/:repository', ev)
            .when('/term/:termid/', {templateUrl: '/partials/viewer/viewer-term-np1.html'})

    }


    ViewerCtrl.$inject = ['$scope', '$sce', '$routeParams', '$location', 'config', 'exportService', 'viewerService', 'viewerURLResolver'];
    function ViewerCtrl($scope, $sce, $routeParams, $location, config, exportService,  viewerService, viewerURLResolver) {

        $scope.externalURL = null;
        $scope.widgetEntry = null;
        $scope.githubURL = null;
        $scope.communityMode = false;
        $scope.simpleSearchText = "";

        $scope.entryProps ={};
        $scope.entryName = $routeParams.entry;

        var entryViewMode = $scope.entryName != undefined;

        if(entryViewMode){

            viewerService.getCommunityEntryViewers().success(function(data){
                $scope.communityViewers = data;
            });

            viewerService.getEntryProperties($routeParams.entry).$promise.then(function (data) {

                $scope.entryProps.name = data.entry.overview.mainProteinName;
                $scope.entryProps.genesCount = data.entry.overview.geneNames.length;
                angular.extend($scope.entryProps, data.entry.properties);

            })

        }else {

            viewerService.getCommunityGlobalViewers().success(function(data){
                $scope.communityViewers = data;
            });
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
            if (("gh/" + $routeParams.user + "/" + $routeParams.repository) == page)  return 'active';

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
                angular.extend($scope, viewerURLResolver.getScopeParamsForEntryViewers($routeParams.ev1, $routeParams.ev2, $routeParams.entry));
            }else if ($routeParams.gv1) { //Global view
                angular.extend($scope, viewerURLResolver.getScopeParamsForGlobalViewers($routeParams.gv1, $routeParams.gv2, $routeParams.gv3));
            // COMMUNITY VIEWERS etiher with GitHub //////////////////////////////////////
            } else if ($routeParams.repository) {
                angular.extend($scope, viewerURLResolver.getScopeParamsForGitHubCommunity($routeParams.user, $routeParams.repository, $routeParams.entry));
            // GRAILS INTEGRATION
            } else { //deprecated nextprot
                angular.extend($scope, viewerURLResolver.getScopeParamsForNeXtProtGrails($location.$$path));
            }
        });


    }


    viewerService.$inject = ['$resource', '$http', 'config'];
    function viewerService($resource, $http, config) {


        //skips authorization
        var entryViewersResource = $http({url: config.api.API_URL + '/contents/json-config/community-entry-viewers.json', skipAuthorization : true, method: 'GET'});
        var globalViewersResource = $http({url: config.api.API_URL + 'contents/json-config/community-entry-viewers.json', skipAuthorization : true, method: 'GET'});

        var entryProperties = $resource(config.api.API_URL + '/entry/:entryName/overview.json', {entryName: '@entryName'}, {get : {method: "GET"}});

        var ViewerService = function () {

        };

        ViewerService.prototype.getCommunityGlobalViewers = function () {
            return globalViewersResource;
        }

        ViewerService.prototype.getCommunityEntryViewers = function () {
            return entryViewersResource;
        }

        ViewerService.prototype.getEntryProperties = function (entryName) {
            return entryProperties.get({entryName:entryName});
        }

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

        this.getScopeParamsForEntryViewers = function (ev1, ev2, entryName) {

            var url = window.location.origin + "/viewers/" + ev1;
            if(ev2) url += "/" + ev2;
            url += "/app/index.html" ;

            return {
                "communityMode": false,
                "githubURL": "https://github.com/calipho-sib/nextprot-viewers/" + ev1,
                "externalURL":  $sce.trustAsResourceUrl(concatEnvToUrl(url + "?nxentry=" + entryName + "&inputOption=true")) ,
                "widgetURL": $sce.trustAsResourceUrl(concatEnvToUrl(url + "?nxentry=" + entryName))
            }

        }

        this.getScopeParamsForGlobalViewers = function (gv1, gv2, gv3) {

            var url = window.location.origin + "/viewers/" + gv1;
            if (gv2) url += "/" + gv2;
            if (gv3) url += "/" + gv3;
            url += "/app/index.html";

            return {
                "communityMode": false,
                "githubURL": "https://github.com/calipho-sib/nextprot-viewers/" + gv1,
                "externalURL": $sce.trustAsResourceUrl(concatEnvToUrl(url)),
                "widgetURL": $sce.trustAsResourceUrl(concatEnvToUrl(url))
            }

        }


        this.getScopeParamsForGitHubCommunity = function (user, repository, entryName) {

            var url = "https://" + user + ".github.io/" + repository;
            var urlSource = "https://www.github.com/" + user + "/" + repository;
            if(entryName != undefined) url += "?nxentry=" + entryName;

            return {
                "communityMode": true,
                "githubURL": urlSource,
                "externalURL": $sce.trustAsResourceUrl(concatEnvToUrl(url)),
                "widgetURL": $sce.trustAsResourceUrl(concatEnvToUrl(url))
            }
        }

        this.getScopeParamsForNeXtProtGrails = function (path) {
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
                "externalURL": np1Base + path,
                "widgetURL": $sce.trustAsResourceUrl(np1Base + $location.$$path + np1Params)
            }
        }

    }


    })(angular); //global variable