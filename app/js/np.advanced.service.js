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
    '$resource',
    'config',
    function($resource, config) {

        var baseUrl = config.solr.BASE_URL+config.solr.SOLR_PORT;

        var $api_adv_query = $resource(baseUrl+'/nextprot-api/user/:username/advanced-user-query2.json', {username: '@username'}, {
            get: { method: 'GET', isArray: false },
            create: { method: 'POST' }
        });

        var $api_adv_query_id = $resource(baseUrl+'/nextprot-api/user/:username/advanced-user-query/:id.json', {username: '@username', id: '@id'}, {
            delete: { method: 'DELETE'},
            update: { method: 'PUT'}
        });


        var AdvancedQueryService = function() {};

        AdvancedQueryService.prototype.getQueryList = function(username, listType, cb) {
            return $api_adv_query.get({username : username}, function(data) {
                  if(cb)cb(data);
          }, function(error){
                    console.log(error, error.headers())
          });
        };

        AdvancedQueryService.prototype.createAdvancedQuery = function(username, aq, cb) {
            console.log('create advanced query > ', aq);
            $api_adv_query.create({ username: username, id : aq.advancedUserQueryId }, aq, function(data) {
                if(cb)cb(data);
            });
        };

        AdvancedQueryService.prototype.updateAdvancedQuery = function(username, aq, cb) {
            console.log('update advanced query > ', aq);
            $api_adv_query_id.update({ username: username, id : aq.advancedUserQueryId }, aq, function(data) {
                if(cb)cb(data);
            });
        };

        AdvancedQueryService.prototype.deleteAdvancedQuery = function(username, aq, cb) {
            if(confirm("Are you sure you want to delete the selected query?")){
                console.log('delete advanced query > ', aq);
                $api_adv_query_id.delete({ username: username, id : aq.advancedUserQueryId}, function(data) {
                    if(cb)cb(data);
                });
            }
        };

        var service =  new AdvancedQueryService();
        return service;

    }
]);