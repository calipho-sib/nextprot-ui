'use strict'

var AdvancedSearchModule = angular.module('np.advanced', ['np.advanced.search.service', 'np.advanced.query.service', 'np.advanced.ui']);

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
    '$window',
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
    'UserService',
    function ($window, $resource, $http, $scope, $rootScope, $location, $routeParams, $route, $flash, Search, AdvancedSearchService, AdvancedQueryService, Tools, flash, UserService) {
        $scope.currentQuery;
        $scope.buttonDisabled = false;

        AdvancedQueryService.getQueryList(UserService.userProfile.username, 'public',
            function (data) {
                $scope.queries = data.advancedUserQueryList;
            });

        $scope.setCurrentQuery = function (query) {
            $scope.currentQuery = query;
        };


        $scope.doAdvanceSearch = function () {
            if($scope.currentQuery == null) {
                alert("Choose a query!")
            }else {

                var start = new Date().getTime();;
                $scope.buttonDisabled = true;
                AdvancedSearchService.getEntriesBySparqlQuery(
                    $scope.currentQuery.sparql,
                    function (data) {
                        var end = new Date().getTime();
                        $scope.results = data;
                        $scope.buttonDisabled = false;
                        flash('alert-success', "Query executed successfully in " + (end - start) + " ms"); return;
                    });
            }
        }


        $scope.createAdvancedQuery = function () {
            AdvancedQueryService.createAdvancedQuery(UserService.userProfile.username, $scope.currentQuery,
                function () {
                    $route.reload();
                }
            );
        }

        $scope.updateAdvancedQuery = function () {
            AdvancedQueryService.updateAdvancedQuery(UserService.userProfile.username, $scope.currentQuery,
                function () {
                    flash('alert-success', "Updated successful for " + $scope.currentQuery.title); return;
                }
            );
        }

        $scope.deleteAdvancedQuery = function () {
            AdvancedQueryService.deleteAdvancedQuery(UserService.userProfile.username, $scope.currentQuery,
                function () {
                    flash('alert-success', "User query deleted successfully for " + $scope.currentQuery.title);
                    $route.reload();
                }
            );
        }

    }
]);

