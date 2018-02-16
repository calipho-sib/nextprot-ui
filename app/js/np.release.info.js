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

        $scope.releaseInfo = {
            databaseRelease: "",
            apiRelease: "",
            datasources: [],
            tagStatistics: []
        };

        // fetching release info versions
        releaseInfoService.getReleaseInfo().$promise.then(function(releaseInfo) {

            $scope.releaseInfo.databaseRelease = releaseInfo.versions.databaseRelease;
            $scope.releaseInfo.apiRelease = releaseInfo.versions.apiRelease;
        });

        // fetching release data sources
        releaseInfoService.getReleaseDataSources().$promise.then(function(releaseDataSources) {
            console.log("releaseDataSources", releaseDataSources.dataSources.datasources);

            _.each(releaseDataSources.dataSources.datasources, function (ds) {
                $scope.releaseInfo.datasources.push(ds);
            });
        });

        // fetching release stats
        releaseInfoService.getReleaseStats().$promise.then(function(data) {

            _.each(data.releaseStats.tagStatistics, function (ts) {
                var stat = {
                    description: ts.description,
                    count: ts.count
                };

                var dbSpecies = _.find($scope.releaseInfo.tagStatistics, function (obj) {
                    return obj.category == ts.categroy
                });
                if (dbSpecies) {
                    dbSpecies.data.push(stat);
                } else {
                    $scope.releaseInfo.tagStatistics.push({
                        category: ts.categroy,
                        data: [stat]
                    });
                }

            });
        });


        // Replace the publication stats fetched above by the correct ones computed by the new service /publications/stats.json
        releaseInfoService.getPublicationStats().$promise.then(function (data) {
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

            var arrayLength = $scope.releaseInfo.tagStatistics.length;
            for (var i = 0; i < arrayLength; i++) {
                if ($scope.releaseInfo.tagStatistics[i].category === "Publications") {
                    $scope.releaseInfo.tagStatistics[i].data = newStats;
                    break;
                }
            }
        });
    }

    releaseInfoService.$inject = ['$resource', 'config'];
    function releaseInfoService($resource, config) {

        var releaseInfoResource = $resource(
            config.api.API_URL + '/release-info.json',
            {},
            {get : {method: "GET"}});

        var releaseStatsResource = $resource(
            config.api.API_URL + '/release-stats.json',
            {},
            {get : {method: "GET"}});

        var releaseDataSources = $resource(
            config.api.API_URL + '/release-data-sources.json',
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

        ReleaseInfoService.prototype.getReleaseStats = function () {
            return releaseStatsResource.get();
        };

        ReleaseInfoService.prototype.getReleaseDataSources = function () {
            return releaseDataSources.get();
        };

        ReleaseInfoService.prototype.getPublicationStats = function () {
            return publicationStatsResource.get();
        };

        return new ReleaseInfoService();
    }

})(angular); //global variable
