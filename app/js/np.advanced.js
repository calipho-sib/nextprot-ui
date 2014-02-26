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
    '$http',
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    '$route',
    'Search',
    'ProteinListService',
    'Tools',
    function ($resource, $http, $scope, $rootScope, $location, $routeParams, $route, Search, ProteinListService, Tools) {
        $scope.currentStory;
        $scope.setCurrentStory = function(story) {
            $scope.currentStory = story;
        };

        $http.get('queries/queries.json').success(function(data) {
            $scope.stories = data;
        });

        $scope.stories = [

            {title: 'has transmembrane regions and ...', author: 'The NextProt team', sparql:
                'SELECT ?entry WHERE { \n '+
                '  ?entry  :isoform/:hasTransmembrane ?statement \n'+
                    '} GROUP BY ?entry HAVING(count(?statement)>=2) \n',
                description: ' you can replace the tansmembrane by any... like homospa'

            },
            {title: 'Story 01', sparql: 'Description pending.'},
            {title: 'Story 02', sparql: 'Description pending.'},
            {title: 'Story 03', sparql: 'Description pending.'},
            {title: 'Story 04', sparql: 'Description pending.'},
            {title: 'Story 05', sparql: 'Description pending.'}
        ];
    }


]);

