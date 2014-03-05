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
        $scope.currentStory;
        $scope.prefix = "PREFIX : <http://nextprot.org/rdf#> . \n" ;

        $scope.suffix = "limit 10";

            $scope.setCurrentStory = function(story) {
            $scope.currentStory = story;
        };


        AdvancedQueryService.getQueryList(
            'dani',
            'public',
            function (data) {
                $scope.queries = data;
            });


        $scope.doAdvanceSearch = function () {

        AdvancedSearchService.getEntriesBySparqlQuery(
            $scope.currentStory.sparql,
            function(data) {
                if(data.error) flash('alert-warning', data.error);
                $scope.results = data;
            });

        }


        $scope.createAdvancedQuery = function () {


            var aq = {
                "advancedUserQueryId": 1,
                "title": "yeah I will be on the db",
                "description": "I can be sent from here",
                "sparql": "select * ....",
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

