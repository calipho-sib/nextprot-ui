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
        $scope.stories = [

            {title: 'Story 00', description: 'Description pending.'},
            {title: 'Story 01', description: 'Description pending.'},
            {title: 'Story 02', description: 'Description pending.'},
            {title: 'Story 03', description: 'Description pending.'},
            {title: 'Story 04', description: 'Description pending.'},
            {title: 'Story 05', description: 'Description pending.'}
        ];
    }

]);

