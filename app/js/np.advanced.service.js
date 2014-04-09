'use strict'

var AdvancedSearchService = angular.module('np.advanced.search.service', []);

AdvancedSearchService.factory('AdvancedSearchService', [
    '$resource',
    'config',
    function ($resource, config) {

        var api = "http://cactusprime:3030/np/query?query=:sparql";
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
    function ($resource, config, UserService, Search) {

        var baseUrl = config.api.BASE_URL + config.api.API_PORT;

        var $nextprot_query_list = $resource(baseUrl + '/nextprot-api/user/advanced-nextprot-query.json', {
            get: { method: 'GET', isArray: false }
        });

        var $public_query_list = $resource(baseUrl + '/nextprot-api/user/advanced-public-query.json', {
            get: { method: 'GET', isArray: false }
        });

        var $user_query_list = $resource(baseUrl + '/nextprot-api/user/:username/advanced-user-query.json', {username: '@username'}, {
            get: { method: 'GET', isArray: false },
            create: { method: 'POST' }
        });

        var $api_adv_query_id = $resource(baseUrl + '/nextprot-api/user/:username/advanced-user-query/:id.json', {username: '@username', id: '@id'}, {
            delete: { method: 'DELETE'},
            update: { method: 'PUT'}
        });


        var AdvancedQueryService = function () {
            this.showHelp = true;
            this.currentRepository = Search.config.widgets.repositories.nextprotRep;
            this.repositories = Search.config.widgets.repositories;

            this.currentQuery = {};
            this.queries = {};

        };

        AdvancedQueryService.prototype.getRepository = function (username, repositoryName, cb) {

            var selectedResource = null;
            var me = this;

            this.currentRepository = repositoryName;

            if (this.currentRepository == this.repositories.nextprotRep) {
                selectedResource = $nextprot_query_list;
            } else if (this.currentRepository == this.repositories.publicRep) {
                selectedResource = $public_query_list;
            } else if (this.currentRepository == this.repositories.privateRep) {
                selectedResource = $user_query_list;
            } else throw this.currentRepository+ ' repository not found!!!';

            var cbOk = function (data) {
                me.queries = data['advancedUserQueryList'];
                if (cb)cb(data);
            };

            var cbFailure = function (error) {
                console.log(error, error.headers())
            }


            //Needs the username
            if (this.currentRepository == this.repositories.privateRep) {
                return selectedResource.get({username: username}, cbOk, cbFailure);
            } else {
                return selectedResource.get(cbOk, cbFailure);
            }

        };

        AdvancedQueryService.prototype.createAdvancedQuery = function (username, aq, cb, cbe) {
            $user_query_list.create({ username: username }, aq, function (data) {
                if (cb)cb(data);
            }, function (error) {
                if (cbe)cbe(error);
            });
        };

        AdvancedQueryService.prototype.updateAdvancedQuery = function (username, aq, cb) {
            if (aq == null) {
                alert("Select a query to update");
            } else {

                console.log('update advanced query > ', aq);
                $api_adv_query_id.update({ username: username, id: aq.advancedUserQueryId }, aq, function (data) {
                    if (cb)cb(data);
                });
            }

        };

        AdvancedQueryService.prototype.deleteAdvancedQuery = function (username, aq, cb) {
            if (confirm("Are you sure you want to delete the selected query?")) {
                console.log('delete advanced query > ', aq);
                $api_adv_query_id.delete({ username: username, id: aq.advancedUserQueryId}, function (data) {
                    if (cb)cb(data);
                });
            }
        };

        var service = new AdvancedQueryService();
        return service;

    }
]);