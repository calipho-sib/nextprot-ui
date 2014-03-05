'use strict'

var AdvancedSearchModule = angular.module('np.advanced', ['np.advanced.search.service', 'np.advanced.query.service']);

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
    'AdvancedSearchService',
    'AdvancedQueryService',
    'Tools',
    'flash',
    function ($resource, $http, $scope, $rootScope, $location, $routeParams, $route, Search, AdvancedSearchService, AdvancedQueryService, Tools, flash) {
        $scope.currentQuery;
        $scope.prefix = "PREFIX : <http://nextprot.org/rdf#> . \n" ;

        $scope.suffix = "limit 10";

            $scope.setCurrentQuery = function(story) {
            $scope.currentQuery = story;
        };


        AdvancedQueryService.getQueryList(
            'dani',
            'public',
            function (data) {
                $scope.queries = data;
            });


        $scope.doAdvanceSearch = function () {

        AdvancedSearchService.getEntriesBySparqlQuery(
            $scope.currentQuery.sparql,
            function(data) {
                if(data.error) flash('alert-warning', data.error);
                $scope.results = data;
            });

        }


        $scope.createAdvancedQuery = function () {


            var aq = {
                "advancedUserQueryId": 1,
                "title": $scope.currentQuery.title,
                "description": $scope.currentQuery.description,
                "sparql": $scope.currentQuery.sparql,
                "published": "N",
                "submitted": "N",
                "username": "dani"
            };

            AdvancedQueryService.createAdvancedQuery(
                'dani',
                aq,
                function(data) {
                    alert(data);
                });

        }


    }
]);

