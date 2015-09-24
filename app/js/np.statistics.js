/**
 * Created by vrechdel on 18/09/15.
 */

(function (angular, undefined) {
    'use strict';

    angular.module('np.statistics', [])
        .controller('StatisticsCtrl', StatisticsCtrl)
        .factory('statisticsService', statisticsService)
    ;

    StatisticsCtrl.$inject = ['$scope','statisticsService'];
    function StatisticsCtrl($scope, statisticsService) {

        statisticsService.getContents().$promise.then(function(data){
            $scope.statistics = data;
        });

    }

    statisticsService.$inject = ['$resource', 'config'];
    function statisticsService($resource, config) {

        var statisticsResource = $resource(
            config.api.API_URL + '/release-statistics.json',
            {},
            {get : {method: "GET", isArray:true}});

        var StatisticsService = function () {

        };

        StatisticsService.prototype.getContents = function () {
            return statisticsResource.get();
        };

        return new StatisticsService();
    }

})(angular); //global variable
