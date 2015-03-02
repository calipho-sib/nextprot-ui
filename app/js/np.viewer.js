(function (angular, undefined) {
    'use strict';

    angular.module('np.viewer', [])
        .config(viewerConfig)
        .controller('ViewerCtrl', ViewerCtrl)
    ;

    viewerConfig.$inject=['$routeProvider'];
    function viewerConfig($routeProvider) {
        $routeProvider
            .when('/entry/:entry/viewer/:gistusr/:gistid', { templateUrl: '/partials/viewer/viewer-gist.html'})
            .when('/entry/:entry/:element', { templateUrl: '/partials/viewer/viewer-np1.html'})
            .when('/entry/:entry/', { templateUrl: '/partials/viewer/viewer-np1.html'})

    }


    ViewerCtrl.$inject = ['$resource', '$scope', '$sce', '$routeParams', 'config'];
    function ViewerCtrl($resource, $scope, $sce, $routeParams, config) {
        $scope.widgetEntry = null;

        $scope.activePage = function(page) {
          if($routeParams.element){
            if(page === $routeParams.element) return 'active';
          }else if($routeParams.gistusr && $routeParams.gistid){
            if(page === ($routeParams.gistusr + "/" + $routeParams.gistid)) return 'active';
          }
          else return '';
        }

        // update entity documentation on path change
        $scope.$on('$routeChangeSuccess', function(event, next, current) {
          $scope.widgetEntry = $routeParams.entry;
          if($routeParams.gistusr && $routeParams.gistid){
            $scope.widgetURL = $sce.trustAsResourceUrl("http://bl.ocks.org/" + $routeParams.gistusr + "/raw/" + $routeParams.gistid + "/?nxentry=" +  $routeParams.entry);
          }else { //nextprot
            var urlBase = "http://uat-web1.isb-sib.ch/db/entry/";
            if($routeParams.element){
              $scope.widgetURL = $sce.trustAsResourceUrl(urlBase + $routeParams.entry + "/" + $routeParams.element + "?np2=yes");
            }else{
              $scope.widgetURL = $sce.trustAsResourceUrl(urlBase + $routeParams.entry + "?np2=yes");
            }
          }
        });


        $scope.getGistUrl = function (){
          return "http://gist.github.com/" + $routeParams.gistusr + "/" + $routeParams.gistid;
        }

    }




})(angular); //global variable
