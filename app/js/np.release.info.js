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
        $scope.releaseInfo = releaseInfoService.getReleaseInfo();

        $scope.toggleDatabaseRelease = function (data) {
            $scope.releaseInfo = releaseInfoService.getReleaseInfo(data.databaseRelease);
        };

        /*
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
        });*/
    }

    releaseInfoService.$inject = [ '$resource', 'config'];
    function releaseInfoService( $resource, config) {

        var releaseInfoResource = $resource(
            config.api.API_URL + '/release-info.json',
            {},
            {get : {method: "GET"}});


        var releaseDataSources = $resource(
            config.api.API_URL + '/release-data-sources.json',
            {},
            {get : {method: "GET"}});

        var releaseInfo = {
            databaseRelease : "",
            apiRelease: "",
            dataSources: [],
            tagStatistics: []

        };

        var ReleaseInfoService = function () {
            // Calls the resources and fetch release info
            releaseInfoResource.get().$promise.then(function(data) {
                releaseInfo.apiRelease = data.versions.apiRelease;
            });

            // fetching release data sources
            releaseDataSources.get().$promise.then(function(data) {
//                console.log("releaseDataSources", releaseDataSources.dataSources.datasources);
                _.each(data.dataSources.datasources, function (ds) {
                    releaseInfo.dataSources.push(ds);
                });
            });

            getReleaseStats();
        };

        ReleaseInfoService.prototype.getReleaseInfo = function (databaseRelease) {
            getReleaseStats(databaseRelease);
            return releaseInfo;
        };

        // fetching release stats
        function getReleaseStats(databaseRelease) {
            var releaseStatsURL = '/release-stats.json';
            if (databaseRelease) {
                releaseStatsURL = '/release-stats/'+ databaseRelease.replace(/ \(current\)/, "") + '.json'
            }
            var releaseStatsResource = $resource(
                config.api.API_URL + releaseStatsURL,
                {},
                {get : {method: "GET"}});

            releaseStatsResource.get().$promise.then(function (data) {
                releaseInfo.databaseRelease = data.releaseStats.databaseRelease;

                releaseInfo.databaseReleaseList = data.releaseStats.databaseReleaseList.sort().reverse();
                releaseInfo.databaseReleaseList[0] += " (current)";

                releaseInfo.tagStatistics = [];
                _.each(data.releaseStats.tagStatistics, function (ts) {
                    var stat = {
                        description: ts.description,
                        count: ts.count
                    };
                    var dbSpecies = _.find(releaseInfo.tagStatistics, function (obj) {
                        return obj.category == ts.categroy
                    });
                    if (dbSpecies) {
                        dbSpecies.data.push(stat);
                    } else {
                        releaseInfo.tagStatistics.push({
                            category: ts.categroy,
                            data: [stat]
                        });
                    }
                });
            });
        }

        return new ReleaseInfoService();
    }

})(angular); //global variable
