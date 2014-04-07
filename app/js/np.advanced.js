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
        $scope.reps = Search.config.widgets.repositories;
        $scope.repository = $scope.reps.nextprotRep;
        $scope.showHelp = false;
        $scope.currentQuery = AdvancedQueryService.currentQuery;

        AdvancedQueryService.getNextprotQueryList(
            function (data) {
                $scope.queries = data.advancedUserQueryList;
                $scope.repository = Search.config.widgets.repositories.nextprotRep;
            });

        $scope.setCurrentQuery = function (query) {
            //The binding is done at the level of the primitive, therefore
            angular.extend($scope.currentQuery, query);
            //change the query for the current username and the id null if it does not belong to the user
            if($scope.currentQuery.username != UserService.userProfile.username){
                $scope.currentQuery.username = UserService.userProfile.username
                $scope.currentQuery.advancedUserQueryId = null;
            }

            console.log('the query is ' + AdvancedQueryService.currentQuery);
        };

        $scope.toogleShowHelp = function () {
            $scope.showHelp =  !$scope.showHelp;
        };

        $scope.showPrivateRepository = function () {

            AdvancedQueryService.getQueryList(UserService.userProfile.username, $scope.showPublic,
                function (data) {
                    $scope.queries = data.advancedUserQueryList;
                    $scope.repository = Search.config.widgets.repositories.privateRep;
                });
        };

        $scope.showPublicRepository = function () {
            AdvancedQueryService.getPublicQueryList(
                function (data) {
                    $scope.queries = data.advancedUserQueryList;
                    $scope.repository = Search.config.widgets.repositories.publicRep;
                });
        };

        $scope.showNextprotRepository = function () {
            AdvancedQueryService.getNextprotQueryList(
                function (data) {
                    $scope.queries = data.advancedUserQueryList;
                    $scope.repository = Search.config.widgets.repositories.nextprotRep;
                });
        };

        $scope.doAdvanceSearch = function () {
            if ($scope.currentQuery.sparql == null) {
                alert("Sparql can't be empty")
            } else {
                var start = new Date().getTime();
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


        $scope.createOrReplaceUserQuery = function () {
            if($scope.currentQuery.advancedUserQueryId == null){
                alert('creating a new');
                AdvancedQueryService.createAdvancedQuery(UserService.userProfile.username, $scope.currentQuery,
                    function (data) {
                        angular.extend($scope.currentQuery, data);
                        flash('alert-success', $scope.currentQuery.title + ' query saved successfully!')
                        $route.reload();
                    },
                    function (error) {
                        if(error.status == 409) {
                            flash('alert-warn', $scope.currentQuery.title + ' already exists, choose a different name.')
                        }
                    }
                );
            }else {
                alert('updating...');
                AdvancedQueryService.updateAdvancedQuery(UserService.userProfile.username, $scope.currentQuery,
                    function (data) {
                        angular.extend($scope.currentQuery, data);
                        flash('alert-success', "Updated successful for " + $scope.currentQuery.title);
                        return;
                    },
                    function (error) {
                        if(error.status == 409) {
                            flash('alert-warn', $scope.currentQuery.title + ' already exists, choose a different name.')
                        }
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
            if ($scope.currentQuery) {
                if ($scope.currentQuery.published == 'N') {
                    return "Publish"
                } else return "Unpublish";
            }
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

