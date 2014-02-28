'use strict'

var AdvancedSearchService = angular.module('np.advanced.search.service', []);

AdvancedSearchService.factory('AdvancedSearchService', [
    '$resource',
    'config',
    function($resource, config) {

        var api = "http://cactusprime:3030/np/query?query=:sparql";
        var format =  "&output=json";
        var url = api + format;

        var $sparql_query = $resource(url, {username: '@sparql'}, {
            get: { method: 'GET' }
        });

        var AdvancedSearchService = function() {};

        AdvancedSearchService.prototype.getEntriesBySparqlQuery = function(sparql, cb) {
            $sparql_query.get({sparql: sparql}, function(data) {
                if(cb)cb(data.results.bindings);
            });
        };

        var service =  new AdvancedSearchService();
        return service;

    }
]);



var AdvancedQueryService = angular.module('np.advanced.query.service', []);

AdvancedQueryService.factory('AdvancedQueryService', [
    '$http',
    'config',
    function($http, config) {

        var AdvancedQueryService = function() {};

        AdvancedQueryService.prototype.getQueryList = function(sparql, listType, cb) {
            $http.get('http://localhost:8080/nextprot-api/user/dani/advanced-query.json').success(function(data) {
                  if(cb)cb(data.advancedQueryList);
          });

        };

        var service =  new AdvancedQueryService();
        return service;

    }
]);