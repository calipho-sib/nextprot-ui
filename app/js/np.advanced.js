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
            .when('/sparql-wizard', {templateUrl: 'partials/advanced/sparql-wizard.html'})
            .when('/api-info', {templateUrl: 'partials/advanced/api-info.html'})
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
    'config',
    'Search',
    'AdvancedSearchService',
    'AdvancedQueryService',
    'Tools',
    'flash',
    'UserService',
    function ($window, $resource, $http, $scope, $rootScope, $location, $routeParams, $route, $flash, config, Search, AdvancedSearchService, AdvancedQueryService, Tools, flash, UserService) {

        $scope.Advanced = AdvancedQueryService;
        $scope.User = UserService;
        $scope.rdfBuilder = AdvancedQueryService.sparqlBuilder;
        $scope.selectedSection = ':Entry';
        $scope.jsondoc = AdvancedQueryService.jsondoc;

//        $scope.$watch(
//            'User.isAnonymous()',
//            function (newValue, oldValue) {
//                //TODO watch function is firing twice!!!
//                if ($scope.User.isAnonymous()) {
//                    AdvancedQueryService.getRepository(UserService.userProfile.username, Search.config.widgets.repositories.aNextprotRep);
//                } else {
//                    AdvancedQueryService.getRepository(UserService.userProfile.username, Search.config.widgets.repositories.privateRep, function (data) {
//                            //TODO should take the training set if the user does not have any queries.
//                        }
//                    )
//                    ;
//                }
//
//            }
//        );

//        AdvancedQueryService.getRepository(UserService.userProfile.username, Search.config.widgets.repositories.aNextprotRep);

        $scope.showRepository = function (repositoryName) {
            AdvancedQueryService.getRepository(repositoryName, null);
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

        $scope.setCurrentQuery = function (query) {
            Search.params.sparql = '#' + query.title + "\n" + query.sparql;
            //close the help after that
            AdvancedQueryService.showHelp = false;
        }

        $scope.hasPrivilegesToEdit = function (query) {
            return (UserService.userProfile.username == query.username);
        }

        $scope.navigateToTriplet = function (triplet) {
            AdvancedQueryService.addTriplet(triplet, function (nextSection){
                Search.params.mode = 'advanced'; //TODO should not be done here...
                $scope.selectedSection = nextSection;
            })
        }

        $scope.navigateBack = function () {
            AdvancedQueryService.removeLastTriplet(function (nextSection){
                $scope.selectedSection = nextSection;
            })
        }

        $scope.showBackButton = function () {
            return $scope.selectedSection != ':Entry';
        }

        $scope.showSection = function (section) {
            return section == $scope.selectedSection;
        }

        $scope.showHelpRepository = function (boolean) {
            if(!UserService.isAnonymous()){
                AdvancedQueryService.getRepository(Search.config.widgets.repositories.aNextprotRep);
                AdvancedQueryService.showHelp = true;
            }else{
                flash('alert-warning', "You must be logged to access advanced queries ");
            }
                
        }

        $scope.showHelp = function (section) {
            return section == $scope.selectedSection;
        }

        $scope.getAPIURL = function (method, entry, format) {
            var baseUrl = config.api.BASE_URL + config.api.API_PORT + "/nextprot-api";
            var url = baseUrl+ method.path;
            url = url.replace('{entry}', entry);
            url += "." + format;
            return url;
        }

        $scope.getURLExtension = function (produce) {
            switch(produce){
                case 'application/xml' : return 'xml';
                case 'application/json' : return 'json';
                case 'text/turtle' : return 'ttl';
            }
        }

        $scope.setSelectedFormat = function (format) {
            $scope.selectedFormat = $scope.getURLExtension(format);
        }

        $scope.getHumanReadableFromPath = function (path) {
            if(path == '/entry/{entry}') return 'Entry';

            var simplePath = path.replace('/entry/{entry}', '');
            var name = simplePath.split('/').pop();
            //var name = as[as.length - 1];
            return 'Entry ' + name;
        }

        $scope.openPopup = function (jspname, typeName) {
            var baseUrl = config.api.BASE_URL + config.api.API_PORT;
            $window.open(baseUrl + '/nextprot-api/rdf/help/' + jspname + ' /' + typeName, jspname, 'width=800,height=600');
        }

    }
])
;
