'use strict'

var AdvancedSearchService = angular.module('np.advanced.search.service', []);

AdvancedSearchService.factory('AdvancedSearchService', [
    '$resource',
    'config',
    function ($resource, config) {

        var api = "http://kant:3030/np/query?query=:sparql";
        var format = "&output=json";
        var url = api + format;

        var $sparql_query = $resource(url, {username: '@sparql'}, {
            get: { method: 'GET' }
        });

        var AdvancedSearchService = function () {
        };

        AdvancedSearchService.prototype.getEntriesBySparqlQuery = function (sparql, cb) {
            return $sparql_query.get({sparql: sparql}, function (data) {
                if (cb)cb(data.results.bindings);
            });
        };

        var service = new AdvancedSearchService();
        return service;

    }
]);


var AdvancedQueryService = angular.module('np.advanced.query.service', []);

AdvancedQueryService.factory('AdvancedQueryService', [
    '$resource',
    'config',
    'UserService',
    'Search',
    'flash',
    function ($resource, config, UserService, Search, flash) {





        /**
         For the wizard
        AdvancedQueryService.prototype.buildSparqlString = function () {
            var sp = "?entry ";
            if (this.navTriplets.length > 0) {
                sp += this.navTriplets[0].predicate;
            }

            for (var i = 1; i < this.navTriplets.length; i++) {
                sp += "/" + this.navTriplets[i].predicate;
            }

            Search.params.sparql = sp;
        }

        AdvancedQueryService.prototype.addTriplet = function (triplet, cb) {

            this.navTriplets.push(triplet);
            this.buildSparqlString();
            if (cb)cb(triplet.objectType);

        };

        AdvancedQueryService.prototype.removeLastTriplet = function (cb) {
            this.navTriplets.pop();
            this.buildSparqlString();

            var section = this.navTriplets.length > 0 ? this.navTriplets[this.navTriplets.length - 1].objectType : ':Entry';

            if (cb)cb(section);
        };


        var service = new AdvancedQueryService();

        $rdf_help_get_resource.query(null, function (data) {
            service.rdfHelp = data;
        });

        $api_help_get_resource.get(null, function (data) {
            service.jsondoc = data;
        });

        return service;
         **/


    }
]);