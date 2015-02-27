(function (angular, undefined) {
    'use strict';

    angular.module('np.viewer', [])
        .config(viewerConfig)
        .controller('ViewerCtrl', ViewerCtrl)
    ;

    viewerConfig.$inject=['$routeProvider'];
    function viewerConfig($routeProvider) {
        $routeProvider
            .when('/viewer/:viewd', {title: 'welcome to nextprot', templateUrl: '/partials/viewer.html'})
            .when('/entry/:entry/:element', { templateUrl: '/partials/widget/viewer.html'})
    }


    ViewerCtrl.$inject = ['$resource', '$scope', '$sce', '$routeParams', 'config'];
    function ViewerCtrl($resource, $scope, $sce, $routeParams, config) {
        $scope.widgetEntry = null;


        $scope.widgetURL = $sce.trustAsResourceUrl("http://www.nextprot.org/db/entry/" + $routeParams.entry + "/" + $routeParams.element);
        // update entity documentation on path change
        $scope.$on('$routeChangeSuccess', function(event, next, current) {
          $scope.widgetEntry = $routeParams.entry;
        });

    }




})(angular); //global variable
