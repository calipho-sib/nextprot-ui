(function (angular, undefined) {
    'use strict';

    angular.module('np.release.info', [])
        .controller('ReleaseInfoCtrl', ReleaseInfoCtrl)
        .factory('releaseInfoService', releaseInfoService)
    ;

    ReleaseInfoCtrl.$inject = ['$scope','releaseInfoService', 'RELEASE_INFOS'];
    function ReleaseInfoCtrl($scope, releaseInfoService, RELEASE_INFOS) {
        
        $scope.currentYear = new Date().getFullYear();

        function formatReleaseInfos(releaseInfos) {
            var content = "v" + releaseInfos.version;

            if (!isNaN(releaseInfos.build) && releaseInfos.isProduction !== 'true') {

                content += " (build " + releaseInfos.build;
                content += "#" + releaseInfos.githash;
                content += " [branch " + releaseInfos.branch + "]";
                content += ")";
            }
            return content;
        }
        $scope.releaseInfosFormatted = formatReleaseInfos(RELEASE_INFOS);

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

            // Replace the publication stats fetched above by the correct ones computed by the new service /publications/stats.json
            releaseInfoService.getPublicationStats().$promise.then(function(data) {
                var newStats = [
                    {
                        description: "Cited publications",
                        count: data.numberOfCitedPublications
                    },
                    {
                        description: "Computationally mapped publications",
                        count: data.numberOfComputationallyMappedPublications
                    },
                    {
                        description: "Large scale publications",
                        count: data.numberOfLargeScalePublications
                    },
                    {
                        description: "Manually curated publications",
                        count: data.numberOfCuratedPublications
                    }
                ];

                var arrayLength = index.tagStatistics.length;
                for (var i = 0; i < arrayLength; i++) {
                    if (index.tagStatistics[i].category === "Publications") {
                        index.tagStatistics[i].data = newStats;
                        break;
                    }
                }
            });
        });
    }

    releaseInfoService.$inject = ['$resource', 'config'];
    function releaseInfoService($resource, config) {

        var releaseInfoResource = $resource(
            config.api.API_URL + '/release-info.json',
            {},
            {get : {method: "GET"}});

        var publicationStatsResource = $resource(
            config.api.API_URL + '/publications/stats.json',
            {},
            {get : {method: "GET"}});

        var ReleaseInfoService = function () {

        };

        ReleaseInfoService.prototype.getReleaseInfo = function () {
            return releaseInfoResource.get();
        };

        ReleaseInfoService.prototype.getPublicationStats = function () {
            return publicationStatsResource.get();
        };

        return new ReleaseInfoService();
    }

})(angular); //global variable
