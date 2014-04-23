'use strict'

var AdvancedSearchModule = angular.module('np.advanced', ['np.advanced.search.service', 'np.advanced.query.service', 'np.advanced.ui']);

// TODO Is the AdvanceSearchModule needed? Can't the advanced controller be in the Search module (no urls are defined...)
// TODO bug when call from outside mode=advanced (the UI does not update)
//
AdvancedSearchModule.config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/rdf-help', {templateUrl: 'partials/advanced/rdf-help.html'})
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

        $scope.Advanced = AdvancedQueryService;
        $scope.User = UserService;

        $scope.$watch(
            'User.isAnonymous()',
            function (newValue, oldValue) {
                //TODO watch function is firing twice!!!
                if ($scope.User.isAnonymous()) {
                    AdvancedQueryService.getRepository(UserService.userProfile.username, Search.config.widgets.repositories.aNextprotRep);
                } else {
                    AdvancedQueryService.getRepository(UserService.userProfile.username, Search.config.widgets.repositories.privateRep, function (data) {
                            //TODO should take the training set if the user does not have any queries.
                        }
                    )
                    ;
                }

            }
        );

        AdvancedQueryService.getRepository(UserService.userProfile.username, Search.config.widgets.repositories.aNextprotRep);

        $scope.showRepository = function (repositoryName) {
            AdvancedQueryService.getRepository(UserService.userProfile.username, repositoryName, null);
        };

        $scope.doAdvanceSearch = function () {
            if ($scope.selectedQuery.sparql == null) {
                alert("Sparql can't be empty")
            } else {
                var start = new Date().getTime();
                $scope.buttonDisabled = true;
                AdvancedSearchService.getEntriesBySparqlQuery(
                    $scope.selectedQuery.sparql,
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
            if (AdvancedQueryService.isNew()) {
                AdvancedQueryService.createAdvancedQuery(UserService.userProfile.username,
                    function (data) {
                        flash('alert-success', data.title + ' query saved successfully!')
                        $route.reload();
                    },
                    function (error) {
                        if (error.status == 409) {
                            flash('alert-warn', 'object already exists, choose a different name.')
                        }
                    }
                );
            } else {
                AdvancedQueryService.updateAdvancedQuery(UserService.userProfile.username,
                    function (data) {
                        flash('alert-success', "Updated successful for " + data.title);
                        $route.reload();
                        return;
                    },
                    function (error) {
                        if (error.status == 409) {
                            flash('alert-warn', 'object already exists, choose a different name.')
                        }
                    }
                );
            }
        }

        $scope.updateAdvancedQuery = function () {
            AdvancedQueryService.updateAdvancedQuery(UserService.userProfile.username, $scope.selectedQuery,
                function () {
                    flash('alert-success', "Updated successful for " + $scope.selectedQuery.title);
                    return;
                }
            );
        }


        $scope.getPublishText = function () {
            if ($scope.selectedQuery) {
                if ($scope.selectedQuery.published == 'N') {
                    return "Publish"
                } else return "Unpublish";
            }
        }

        $scope.changePublishState = function () {

            if ($scope.selectedQuery.published == 'N') {
                $scope.selectedQuery.published = 'Y';
            } else {
                $scope.selectedQuery.published = 'N';
            }

            AdvancedQueryService.updateAdvancedQuery(UserService.userProfile.username, $scope.selectedQuery,
                function () {
                    flash('alert-success', "Query successfully published to the community " + $scope.selectedQuery.title);
                    return;
                }
            );
        }

        $scope.deleteAdvancedQuery = function (query) {
            AdvancedQueryService.deleteAdvancedQuery(UserService.userProfile.username, query,
                function () {
                    flash('alert-success', query.title + " query deleted successfully for ");
                    $route.reload();
                }
            );
        }

        $scope.appendSparqlToCurrentQuery = function (query) {
            /*
                 if (AdvancedQueryService.currentSparql.length > 0) {
                AdvancedQueryService.currentSparql += "\n";
            }
            AdvancedQueryService.currentSparql += "#pasted from " + query.title + "\n" + query.sparql;*/
            AdvancedQueryService.currentSparql = query.sparql;

        }

        $scope.hasPrivilegesToEdit = function (query) {
            return (UserService.userProfile.username == query.username);
        }
    }
])
;

