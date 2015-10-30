(function (angular, undefined) {
    'use strict';

    angular.module('np.release.info', [])
        .controller('ReleaseInfoCtrl', ReleaseInfoCtrl)
        .factory('releaseInfoService', releaseInfoService)
    ;

    ReleaseInfoCtrl.$inject = ['$scope','releaseInfoService'];
    function ReleaseInfoCtrl($scope, releaseInfoService) {

        releaseInfoService.getReleaseInfo().$promise.then(function(data){
            $scope.releaseInfo = data;
        });

    }

    releaseInfoService.$inject = ['$resource', 'config'];
    function releaseInfoService($resource, config) {

        var releaseInfoResource = $resource(
            config.api.API_URL + '/release-info.json',
            {},
            {get : {method: "GET"}});

        var ReleaseInfoService = function () {

        };

        ReleaseInfoService.prototype.getReleaseInfo = function () {
            return releaseInfoResource.get();
        };

        return new ReleaseInfoService();
    }

})(angular); //global variable
