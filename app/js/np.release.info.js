(function (angular, undefined) {
    'use strict';

    angular.module('np.release.info', [])
        .controller('ReleaseInfoCtrl', ReleaseInfoCtrl)
        .factory('releaseInfoService', releaseInfoService)
    ;

    ReleaseInfoCtrl.$inject = ['$scope','releaseInfoService'];
    function ReleaseInfoCtrl($scope, releaseInfoService) {
        releaseInfoService.getReleaseInfo().$promise.then(function(data){

            var index = {
                databaseRelease: [],
                apiRelease: [],
                datasources: [],
                tagStatistics:[]
            };
            index.databaseRelease = data.release.databaseRelease;
            index.apiRelease = data.release.apiRelease;

            _.each(data.release.datasources, function(ds) {
                index.datasources.push(ds);
            });

            _.each(data.release.tagStatistics, function(ts) {
                var stat = {
                    description: ts.description,
                    count: ts.count
                };

                var dbSpecies  = _.find(index.tagStatistics, function(obj) { return obj.category == ts.categroy});
                if (dbSpecies) {
                    dbSpecies.data.push(stat);
                } else {
                    index.tagStatistics.push({
                        category: ts.categroy,
                        data: [stat]
                    });
                }

            });

            $scope.releaseInfo = index;
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
