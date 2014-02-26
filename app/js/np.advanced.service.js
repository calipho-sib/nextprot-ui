'use strict'

var AdvancedSearchService = angular.module('np.advanced.service', []);

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