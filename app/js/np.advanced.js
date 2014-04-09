'use strict'

var AdvancedSearchModule = angular.module('np.advanced', ['np.advanced.search.service', 'np.advanced.query.service', 'np.advanced.ui']);

// TODO Is the AdvanceSearchModule needed? Can't the advanced controller be in the Search module (no urls are defined...)
// TODO bug when call from outside mode=advanced (the UI does not update)
//
//AdvancedSearchModule.config([
//    '$routeProvider',
//    '$locationProvider',
//    '$httpProvider',
//    function ($routeProvider, $locationProvider, $httpProvider) {
//        $routeProvider
//            .when('/home', {templateUrl: 'partials/welcome.html'})
//    }
//]);

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


        //TODO wait for mario fix Looking for the event when the username is changed
//        $scope.$watch(
//            'User.isAnonymous()',
//            function(newValue, oldValue) {
//
//                $scope.queries = null;
//                if($scope.User.isAnonymous()){
//                    AdvancedQueryService.getRepository($scope.User.userProfile.username, $scope.reps.nextprotRep, function(repository, queries){
//                        $scope.repository = repository;
//                        $scope.queries=queries;
//                    });
//                }else {
//                    AdvancedQueryService.getRepository($scope.User.userProfile.username, $scope.reps.publicRep, callbackQueryMapping);
//                    $scope.repository = $scope.reps.privateRep;
//                }
//
//                console.log('user changed to' + newValue + " from " + oldValue + " " + UserService.userProfile.userLoggedIn);
//            }
//        );


        AdvancedQueryService.getRepository(UserService.userProfile.username, Search.config.widgets.repositories.nextprotRep);

        $scope.setCurrentQuery = function (query) {

            var currentQuery = AdvancedQueryService.currentQuery;

            //The binding is done at the level of the primitive, therefore
            angular.extend(currentQuery, query);
            //change the query for the current username and the id null if it does not belong to the user
            if(currentQuery.username != UserService.userProfile.username){
                currentQuery.username = UserService.userProfile.username
                currentQuery.advancedUserQueryId = null;
            }

        };

        $scope.toogleShowHelp = function () {
            $scope.showHelp =  !$scope.showHelp;
        };

        $scope.showRepository = function (repositoryName) {
            AdvancedQueryService.getRepository(UserService.userProfile.username, repositoryName, null);
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

        $scope.deleteAdvancedQuery = function (query) {
            AdvancedQueryService.deleteAdvancedQuery(UserService.userProfile.username, query,
                function () {
                    flash('alert-success', query.title + " query deleted successfully for ");
                    $route.reload();
                }
            );
        }

    }
]);

