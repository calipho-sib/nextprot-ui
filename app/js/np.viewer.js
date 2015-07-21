(function (angular, undefined) {
    'use strict';

    angular.module('np.viewer', [])
        .config(viewerConfig)
        .controller('ViewerCtrl', ViewerCtrl)
    ;

    viewerConfig.$inject = ['$routeProvider'];
    function viewerConfig($routeProvider) {

        var gv = {templateUrl: '/partials/viewer/viewer-gist.html'};

        $routeProvider
            .when('/db/term/:db', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})
            .when('/db/entry/:db', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})
            .when('/db/entry/:element/:db', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})
            .when('/db/publication/:db', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})

            .when('/entry/:entry/nextprot-viewers/:nxview', gv)// related to nextprot-viewers repository: https://github.com/calipho-sib/nextprot-viewers
            .when('/entry/:entry/viewer/:gistusr/:gistid', gv) // related to gists
            .when('/entry/:entry/:repo/:user/:branch/:f1', gv)
            .when('/entry/:entry/:repo/:user/:branch/:f1/:f2', gv)
            .when('/entry/:entry/:repo/:user/:branch/:f1/:f2/:f3', gv)
            .when('/entry/:entry/:repo/:user/:branch/:f1/:f2/:f3/:f4', gv)
            .when('/entry/:entry/:element', {templateUrl: '/partials/viewer/viewer-np1.html'})
            .when('/entry/:entry/', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})
            .when('/term/:termid/', {templateUrl: '/partials/viewer/viewer-term-np1.html'})

    }


    ViewerCtrl.$inject = ['$resource', '$scope', '$sce', '$routeParams', '$location', 'config'];
    function ViewerCtrl($resource, $scope, $sce, $routeParams, $location, config) {
        $scope.widgetEntry = null;
        $scope.githubURL = null;

        $scope.activePage = function (page) {
            if ($routeParams.element) {
                if (page === $routeParams.element) return 'active';
            } else if ($routeParams.gistusr && $routeParams.gistid) {
                if (page === ($routeParams.gistusr + "/" + $routeParams.gistid)) return 'active';
            }
            else return '';
        }

        // update entity documentation on path change
        $scope.$on('$routeChangeSuccess', function (event, next, current) {
            $scope.widgetEntry = $routeParams.entry;

            if ($routeParams.db) {
                $location.path($location.$$path.replace("db/", ""));
            }


            if ($routeParams.nxview) { // github repository

                var url = "https://cdn.rawgit.com/calipho-sib/nextprot-viewers/master/" + $routeParams.nxview + "/app/" + $routeParams.nxview + ".html" ;
                $scope.githubURL = url.replace("cdn.rawgit.com", "github.com").replace("/master/", "/blob/master/");
                url += "?nxentry=" + $routeParams.entry;
                $scope.widgetURL = $sce.trustAsResourceUrl(url);


            } else if ($routeParams.repo) { // github repository
                var url = "https://cdn.rawgit.com/" + $routeParams.repo + "/" + $routeParams.user + "/" + $routeParams.branch + "/" + $routeParams.f1;
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
                $scope.githubURL = url.replace("cdn.rawgit.com", "github.com").replace("/" + $routeParams.branch + "/", "/blob/" + $routeParams.branch + "/");
                url += "?nxentry=" + $routeParams.entry;
                $scope.widgetURL = $sce.trustAsResourceUrl(url);
            } else if ($routeParams.gistusr && $routeParams.gistid) {
                $scope.widgetURL = $sce.trustAsResourceUrl("http://cdn.rawgit.com/" + $routeParams.gistusr + "/" + $routeParams.gistid + "/raw/index.html?nxentry=" + $routeParams.entry);
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


})(angular); //global variable
