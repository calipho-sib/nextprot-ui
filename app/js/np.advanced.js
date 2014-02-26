'use strict'

var AdvancedSearchModule = angular.module('np.advanced', []);

AdvancedSearchModule.config([
    '$routeProvider',
    '$locationProvider',
    '$httpProvider',
    function ($routeProvider, $locationProvider, $httpProvider) {
        $routeProvider
            .when('/advanced', { templateUrl: 'partials/advanced/advanced.html'})
    }
]);


AdvancedSearchModule.controller('AdvancedCtrl', [
    '$resource',
    '$http',
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    '$route',
    'Search',
    'ProteinListService',
    'Tools',
    function ($resource, $http, $scope, $rootScope, $location, $routeParams, $route, Search, ProteinListService, Tools) {
        $scope.currentStory;
        $scope.result;

        $scope.setCurrentStory = function(story) {
            $scope.currentStory = story;
        };

        $http.get('queries/queries.json').success(function(data) {
            $scope.stories = data;
        });

    $scope.doAdvanceSearch = function () {

        var api = "http://cactusprime:3030/np/query?query=";
        var query = encodeURIComponent($scope.currentStory.sparql);
        var format =  "&output=json";
        var url = api + query + format;

        $http.get(url).success(function(data) {
            $scope.result = data;
        });
        }
    }
]);

