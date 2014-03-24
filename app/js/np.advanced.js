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
        var reps = Search.config.widgets.repositories;
        $scope.repository = reps.nextprotRep;

        AdvancedQueryService.getNextprotQueryList(
            function (data) {
                $scope.queries = data.advancedUserQueryList;
                $scope.currentQuery = null;
                $scope.repository = Search.config.widgets.repositories.nextprotRep;
            });

        $scope.setCurrentQuery = function (query) {
            $scope.currentQuery = query;
        };

        $scope.hasPrivilegeToEdit = function () {
            if ($scope.currentQuery)
                return ($scope.currentQuery.username == UserService.userProfile.username)
            return false;
        };

        $scope.isQuerySelected = function () {
            return ($scope.currentQuery != null);
        };


        $scope.showPrivateRepository = function () {

            AdvancedQueryService.getQueryList(UserService.userProfile.username, $scope.showPublic,
                function (data) {
                    $scope.queries = data.advancedUserQueryList;
                    $scope.currentQuery = null;
                    $scope.repository = Search.config.widgets.repositories.privateRep;
                });
        };

        $scope.showPublicRepository = function () {
            AdvancedQueryService.getPublicQueryList(
                function (data) {
                    $scope.queries = data.advancedUserQueryList;
                    $scope.currentQuery = null
                    $scope.repository = Search.config.widgets.repositories.publicRep;

                });
        };

        $scope.showNextprotRepository = function () {
            AdvancedQueryService.getNextprotQueryList(
                function (data) {
                    $scope.queries = data.advancedUserQueryList;
                    $scope.currentQuery = null;
                    $scope.repository = Search.config.widgets.repositories.nextprotRep;
                });
        };

        $scope.doAdvanceSearch = function () {
            if ($scope.currentQuery == null) {
                alert("Choose a query!")
            } else {

                var start = new Date().getTime();
                ;
                $scope.buttonDisabled = true;
                AdvancedSearchService.getEntriesBySparqlQuery(
                    $scope.currentQuery.sparql,
                    function (data) {
                        var end = new Date().getTime();
                        $scope.results = data;
                        $scope.buttonDisabled = false;
                        flash('alert-success', "Query executed successfully in " + (end - start) + " ms");
                        return;
                    });
            }
        }


        $scope.createAdvancedQuery = function () {
            var name = $window.prompt("Query title");
            if (name != null && name != "") {
                $scope.currentQuery.title = name;
                AdvancedQueryService.createAdvancedQuery(UserService.userProfile.username, $scope.currentQuery,
                    function () {
                        $route.reload();
                    }
                );
            }
        }

        $scope.updateAdvancedQuery = function () {
            AdvancedQueryService.updateAdvancedQuery(UserService.userProfile.username, $scope.currentQuery,
                function () {
                    flash('alert-success', "Updated successful for " + $scope.currentQuery.title);
                    return;
                }
            );
        }

        $scope.getPublishText = function () {
            if ($scope.currentQuery.published == 'N') {
                return "Publish"
            } else return "Unpublish";

        }

        $scope.changePublishState = function () {

            if ($scope.currentQuery.published == 'N') {
                $scope.currentQuery.published = 'Y';
            } else {
                $scope.currentQuery.published = 'N';
            }

            AdvancedQueryService.updateAdvancedQuery(UserService.userProfile.username, $scope.currentQuery,
                function () {
                    flash('alert-success', "Query successfully published to the community " + $scope.currentQuery.title);
                    return;
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

