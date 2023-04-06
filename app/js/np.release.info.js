(function (angular, undefined) {
    'use strict';

    angular.module('np.release.info', ['np.user.query'])
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
            releaseInfoService.getReleaseStats(data.databaseRelease);
            $scope.releaseInfo = releaseInfoService.getReleaseInfo();
        };
    }

    releaseInfoService.$inject = [ '$resource', 'config', 'queryRepository'];
    function releaseInfoService( $resource, config, queryRepository) {

        var releaseInfoResource = $resource(
            config.api.API_URL + '/release-info.json',
            {},
            {get : {method: "GET"}});

        var releaseDataSources = $resource(
            config.api.API_URL + '/release-data-sources.json',
            {},
            {get : {method: "GET"}});

        var releaseInfo = {
            currentRelease: "",
            databaseRelease : "",
            apiRelease: "",
            dataSources: [],
            tagStatistics: [],
            tagQueries: []
        };

        var ReleaseInfoService = function () {
            // Calls the resources and fetch release info
            releaseInfoResource.get().$promise.then(function(data) {
                releaseInfo.apiRelease = data.versions.apiRelease;
            });

            // fetching release data sources
            releaseDataSources.get().$promise.then(function(data) {
                _.each(data.dataSources.datasources, function (ds) {
                    releaseInfo.dataSources.push(ds);
                });
            });

            this.getReleaseStats();
        };

        ReleaseInfoService.prototype.getReleaseInfo = function () {
            return releaseInfo;
        };

        // fetching release stats
        ReleaseInfoService.prototype.getReleaseStats = function getReleaseStats(databaseRelease) {
            let isCurrentRelease = !databaseRelease || databaseRelease.indexOf("current") > 0;
            if(releaseInfo.databaseRelease === databaseRelease) {
                return
            }

            var releaseStatsURL = '/release-stats.json';
            if (!isCurrentRelease) {
                releaseStatsURL = '/release-stats/'+ databaseRelease + '.json'
            }
            var releaseStatsResource = $resource(
                config.api.API_URL + releaseStatsURL,
                {},
                {get : {method: "GET"}});

            releaseStatsResource.get().$promise.then(function (data) {
                releaseInfo.databaseRelease = data.releaseStats.databaseRelease;

                releaseInfo.databaseReleaseList = data.releaseStats.databaseReleaseList.sort().reverse();
                releaseInfo.currentRelease = releaseInfo.databaseReleaseList[0];
                releaseInfo.databaseReleaseList[0] += " (current)";

                releaseInfo.tagStatistics = [];
                _.each(data.releaseStats.tagStatistics, function (ts) {
                    var stat = {
                        description: ts.description,
                        count: ts.count
                    };
                    let querySparql;
                    if (isCurrentRelease && data.releaseStats.tagQueries) {
                        _.each(data.releaseStats.tagQueries, function (qt) {
                            if (qt.tag === ts.tag) {
                                stat.queryId = qt.queryId;
                                querySparql = queryRepository.getQueryByPublicId(qt.queryId).then(function (query) {
                                    stat.querySparql = encodeURIComponent(query.sparql);
                                });
                            }
                        });
                    }
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
