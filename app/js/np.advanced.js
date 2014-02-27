'use strict'

var AdvancedSearchModule = angular.module('np.advanced', ['np.advanced.service']);

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
    'Tools',
    'flash',
    function ($resource, $http, $scope, $rootScope, $location, $routeParams, $route, Search, AdvancedSearchService, Tools, flash) {
        $scope.currentStory;
        $scope.prefix =
            "PREFIX : <http://nextprot.org/rdf#> . \n" +
            "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n" +
            "PREFIX term:<http://nextprot.org/rdf/terminology/> \n" +
            "PREFIX term:<http://nextprot.org/rdf/terminology/> \n" +
            "PREFIX term:<http://nextprot.org/rdf/terminology/> \n" +
            "PREFIX term:<http://nextprot.org/rdf/terminology/> \n" +
            "PREFIX term:<http://nextprot.org/rdf/terminology/> \n" +
            "PREFIX term:<http://nextprot.org/rdf/terminology/> \n" +
            "PREFIX term:<http://nextprot.org/rdf/terminology/> \n" +
            "PREFIX term:<http://nextprot.org/rdf/terminology/> \n" +
            "PREFIX term:<http://nextprot.org/rdf/terminology/> \n" +
            "PREFIX term:<http://nextprot.org/rdf/terminology/> \n" ;

        $scope.suffix = "limit 10";

            $scope.setCurrentStory = function(story) {
            $scope.currentStory = story;
        };

        $http.get('queries/queries.json').success(function(data) {
            $scope.stories = data;
        });


    $scope.doAdvanceSearch = function () {

        AdvancedSearchService.getEntriesBySparqlQuery(
            $scope.currentStory.sparql,
            function(data) {
                if(data.error) flash('alert-warning', data.error);
                $scope.results = data;
            });

        }

    }
]);

