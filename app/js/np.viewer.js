(function (angular, undefined) {
    'use strict';

    angular.module('np.viewer', [])
        .config(viewerConfig)
        .factory('entryProperties', entryProperties)
        .controller('ViewerCtrl', ViewerCtrl)
    ;

    viewerConfig.$inject = ['$routeProvider'];
    function viewerConfig($routeProvider) {

        var ev = {templateUrl: '/partials/viewer/entry-viewer.html', resolve: { 'entryProperties':function(entryProperties){  return entryProperties.promise();   } }};
        var gv = {templateUrl: '/partials/viewer/global-viewer.html'};

        $routeProvider
            .when('/db/term/:db', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})
            .when('/db/entry/:db', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})
            .when('/db/entry/:element/:db', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})
            .when('/db/publication/:db', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})


            //GLOBAL VIEWS https://github.com/calipho-sib/nextprot-viewers
            .when('/view', gv)
            .when('/view/:gv1', gv)
            .when('/view/:gv1/:gv2', gv)
            .when('/view/:gv1/:gv2/:gv3', gv)

            //ENTRY VIEWS
            .when('/entry/:entry/', ev)
            .when('/entry/:entry/:element', ev)
            .when('/entry/:entry/view/:ev1', ev)
            .when('/entry/:entry/view/:ev1/:ev2', ev)
            .when('/entry/:entry/view/:ev1/:ev2/:ev3', ev)

            .when('/entry/:entry/viewer/:gistusr/:gistid', ev) // related to gists
            .when('/entry/:entry/:repo/:user/:branch/:f1', ev)
            .when('/entry/:entry/:repo/:user/:branch/:f1/:f2', ev)
            .when('/entry/:entry/:repo/:user/:branch/:f1/:f2/:f3', ev)
            .when('/entry/:entry/:repo/:user/:branch/:f1/:f2/:f3/:f4', ev)
            .when('/term/:termid/', {templateUrl: '/partials/viewer/viewer-term-np1.html'})

    }


    ViewerCtrl.$inject = ['$scope', '$sce', '$routeParams', '$location', 'config', 'entryProperties'];
    function ViewerCtrl($scope, $sce, $routeParams, $location, config, entryProperties) {
        $scope.widgetEntry = null;
        $scope.githubURL = null;
        $scope.simpleSearchText = "";
        $scope.entryProps = entryProperties.currentEntry();

        $scope.makeSimpleSearch = function () {
            $location.search("query", $scope.simpleSearchText);
            $location.path("proteins/search");
        }

        $scope.activePage = function (page) {
            if ($routeParams.ev1 == page)  return 'active';
            if ($routeParams.element == page)  return 'active'

            else return '';
        }

        // update entity documentation on path change
        $scope.$on('$routeChangeSuccess', function (event, next, current) {
            $scope.widgetEntry = $routeParams.entry;

            if ($routeParams.db) {
                $location.path($location.$$path.replace("db/", ""));
            }

            if ($routeParams.ev1) { //Entry view


                var url = window.location.protocol + "//rawgit.com/calipho-sib/nextprot-viewers/master/" + $routeParams.ev1;
                if($routeParams.ev2) url += "/" + $routeParams.ev2;
                if($routeParams.ev3) url += "/" + $routeParams.ev3;
                url += "/app/index.html" ;
                $scope.githubURL = url.replace("rawgit.com", "github.com").replace("/master/", "/blob/master/");
                url += "?nxentry=" + $routeParams.entry;

                $scope.widgetURL = $sce.trustAsResourceUrl(url);

            }else if ($routeParams.gv1) { //Global view

                var url = "https://rawgit.com/calipho-sib/nextprot-viewers/master/" + $routeParams.gv1;
                if($routeParams.gv2) url += "/" + $routeParams.gv2;
                if($routeParams.gv3) url += "/" + $routeParams.gv3;
                url += "/app/index.html" ;
                $scope.githubURL = url.replace("rawgit.com", "github.com").replace("/master/", "/blob/master/");
                url += "?nxentry=" + $routeParams.entry;

                $scope.widgetURL = $sce.trustAsResourceUrl(url);

            } else if ($routeParams.repo) { // github repository
                var url = "https://rawgit.com/" + $routeParams.repo + "/" + $routeParams.user + "/" + $routeParams.branch + "/" + $routeParams.f1;
                //append if they exist
                if($routeParams.f2){
                    url += "/" + $routeParams.f2;
                    if($routeParams.f3){
                        url += "/" + $routeParams.f3;
                        if($routeParams.f4){
                            url += "/" + $routeParams.f4;
                        }
                    }
                }
                $scope.githubURL = url.replace("rawgit.com", "github.com").replace("/" + $routeParams.branch + "/", "/blob/" + $routeParams.branch + "/");
                url += "?nxentry=" + $routeParams.entry;
                $scope.widgetURL = $sce.trustAsResourceUrl(url);
            } else if ($routeParams.gistusr && $routeParams.gistid) {
                $scope.widgetURL = $sce.trustAsResourceUrl("http://rawgit.com/" + $routeParams.gistusr + "/" + $routeParams.gistid + "/raw/index.html?nxentry=" + $routeParams.entry);
            } else { //nextprot

                /*
                 np1Base: origin of NP1 http service, read from conf or set to localhost for dev/debug
                 */
                //var np1Base = "http://localhost:8080/db/entry/";
                var np1Base = config.api.NP1_URL + "/db";

                /*
                 * np2css: the css hiding header, footer and navigation items of NP1 page
                 */
                var np2css = "/db/css/np2css.css"; // NP1 integrated css (same as local)
                //var np2css = "http://localhost:3000/partials/viewer/np1np2.css"; // UI local css

                /*
                 * np2ori: the origin of the main frame (UI page) used as a base for relative links in iframe
                 */
                var np2ori = window.location.origin;

                /*
                 * np1Params: params to pass to NP1
                 */
                var np1Params = "?np2css=" + np2css + "&np2ori=" + np2ori;

                $scope.widgetURL = $sce.trustAsResourceUrl(np1Base + $location.$$path + np1Params);
            }
        });


    }


    entryProperties.$inject=['$http','config','$route'];
    function entryProperties($http, config,  $route) {

        var currenEntryProperties = {};
        var promise = function () {
            $http.get(config.api.API_URL + '/entry/' + $route.current.params.entry + '/overview.json').success( function (data) {
                currenEntryProperties.name=data.entry.overview.mainProteinName;
                currenEntryProperties.genesCount=data.entry.overview.geneNames.length;
                angular.extend(currenEntryProperties, data.entry.properties);
            });
        }


        return {
            promise: promise,
            currentEntry: function () {
                return currenEntryProperties;
            }
        };

    }




})(angular); //global variable
