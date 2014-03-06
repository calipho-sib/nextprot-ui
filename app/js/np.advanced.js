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
    'flash',
    'Search',
    'AdvancedSearchService',
    'AdvancedQueryService',
    'Tools',
    'flash',
    function ($resource, $http, $scope, $rootScope, $location, $routeParams, $route, $flash, Search, AdvancedSearchService, AdvancedQueryService, Tools, flash) {
        $scope.currentQuery;


        AdvancedQueryService.getQueryList('dani', 'public',
            function (data) {
                $scope.queries = data.advancedUserQueryList;
            });

        $scope.setCurrentQuery = function (story) {
            $scope.currentQuery = story;
        };



        $scope.doAdvanceSearch = function () {
            if($scope.currentQuery == null) {
                alert("Choose a query!")
            }else {
                AdvancedSearchService.getEntriesBySparqlQuery(
                    $scope.currentQuery.sparql,
                    function (data) {
                        $scope.results = data;
                    });
            }

        }


        $scope.createAdvancedQuery = function () {
            AdvancedQueryService.createAdvancedQuery('dani', $scope.currentQuery,
                function () {
                    $route.reload();
                }
            );
        }

        $scope.updateAdvancedQuery = function () {
            AdvancedQueryService.updateAdvancedQuery('dani', $scope.currentQuery,
                function () {
                    flash('alert-success', "Updated successful for " + $scope.currentQuery.title); return;
                }
            );
        }

        $scope.deleteAdvancedQuery = function () {
            AdvancedQueryService.deleteAdvancedQuery('dani', $scope.currentQuery,
                function () {
                    flash('alert-warning', "Delete successful for " + $scope.currentQuery.title);
                    $route.reload();
                }
            );
        }

    }
]);

