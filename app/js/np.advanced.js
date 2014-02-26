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
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    '$route',
    'Search',
    'ProteinListService',
    'Tools',
    function ($resource, $scope, $rootScope, $location, $routeParams, $route, Search, ProteinListService, Tools) {
        $scope.currentStory;
        $scope.setCurrentStory = function(story) {
            $scope.currentStory = story;
        };
        $scope.stories = [

            {title: 'SPARQL Union', description: 'SELECT * WHERE { {?union_sparql_union :isoform/:function/:evidence/rdf:type :IEA} UNION {?union_sparql_union :isoform/:function/:evidence/rdf:type :ISS}}'},
            {title: 'Story 01', description: 'Description pending.'},
            {title: 'Story 02', description: 'Description pending.'},
            {title: 'Story 03', description: 'Description pending.'},
            {title: 'Story 04', description: 'Description pending.'},
            {title: 'Story 05', description: 'Description pending.'}
        ];
    }


]);

