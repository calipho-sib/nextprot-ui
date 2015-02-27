(function (angular, undefined) {
    'use strict';

    angular.module('np.viewer', [])
        .config(viewerConfig)
        .controller('ViewerCtrl', ViewerCtrl)
    ;

    viewerConfig.$inject=['$routeProvider'];
    function viewerConfig($routeProvider) {
        $routeProvider
            .when('/entry/:entry/gist/:gistusr/:gistid', { templateUrl: '/partials/widget/viewer.html'})
            .when('/entry/:entry/:element', { templateUrl: '/partials/widget/viewer.html'})
            .when('/entry/:entry/', { templateUrl: '/partials/widget/viewer.html'})

    }


    ViewerCtrl.$inject = ['$resource', '$scope', '$sce', '$routeParams', 'config'];
    function ViewerCtrl($resource, $scope, $sce, $routeParams, config) {
        $scope.widgetEntry = null;

        $scope.activePage = function(page) {
          if($routeParams.element){
            if(page === $routeParams.element) return 'active';
          }else if($routeParams.gistusr && $routeParams.gistusr){
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
            if($routeParams.element){
              $scope.widgetURL = $sce.trustAsResourceUrl("http://www.nextprot.org/db/entry/" + $routeParams.entry + "/" + $routeParams.element);
            }else{
              $scope.widgetURL = $sce.trustAsResourceUrl("http://www.nextprot.org/db/entry/" + $routeParams.entry);
            }
          }
        });

    }




})(angular); //global variable
