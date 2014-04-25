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
    function ($resource, config, UserService, Search) {

        var baseUrl = config.api.BASE_URL + config.api.API_PORT;

        //TODO Should call the api instead
        var $rdf_help_get_resource = $resource('http://crick:3000/rdfhelp.json', {
            get: { method: 'query', isArray: true }
        });

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
            this.rdfHelp = {};
            this.sparqlBuilder = "";
            this.lastAddedTriplet = null;

            this.currentRepository = Search.config.widgets.repositories.aNextprotRep;
            this.repositories = Search.config.widgets.repositories;

            this.currentSparql = "#write your sparql query here";
            this.selectedQuery = {};
            this.queries = {};

        };

        AdvancedQueryService.prototype.getRepository = function (username, repositoryName, cb) {

            var selectedResource = null;
            var me = this;

            this.currentRepository = repositoryName;

            if (this.currentRepository == this.repositories.aNextprotRep) {
                selectedResource = $nextprot_query_list;
            } else if (this.currentRepository == this.repositories.communityRep) {
                selectedResource = $public_query_list;
            } else if (this.currentRepository == this.repositories.privateRep) {
                selectedResource = $user_query_list;
            } else throw this.currentRepository+ ' repository not found!!!';

            var cbOk = function (data) {
                me.queries = data['advancedUserQueryList'];
                if (cb)cb(me.queries);
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

        AdvancedQueryService.prototype.createAdvancedQuery = function (username, cb, cbe) {
            $user_query_list.create({ username: username }, this.selectedQuery, function (data) {
                if (cb)cb(data);
            }, function (error) {
                if (cbe)cbe(error);
            });
        };

        AdvancedQueryService.prototype.updateAdvancedQuery = function (username, cb) {
            $api_adv_query_id.update({ username: username, id: this.selectedQuery.advancedUserQueryId }, this.selectedQuery, function (data) {
                if (cb)cb(data);
            });

        };

        AdvancedQueryService.prototype.deleteAdvancedQuery = function (username, aq, cb) {
            if (confirm("Are you sure you want to delete the selected query?")) {
                console.log('delete advanced query > ', aq);
                $api_adv_query_id.delete({ username: username, id: aq.advancedUserQueryId}, function (data) {
                    if (cb)cb(data);
                });
            }
        };


        AdvancedQueryService.prototype.setCurrentQuery = function (query) {

            //The binding is done at the level of the primitive, therefore
            angular.extend(this.selectedQuery, query);
            //change the query for the current username and the id null if it does not belong to the user
            if(this.selectedQuery.username != UserService.userProfile.username){
                this.selectedQuery.username = UserService.userProfile.username
                this.selectedQuery.advancedUserQueryId = null;
            }

        };

        AdvancedQueryService.prototype.clearSelectedQuery = function () {
            this.currentSparql = "";
        };

        AdvancedQueryService.prototype.clearCurrentQuery = function () {
            this.currentSparql = "";
        };

        AdvancedQueryService.prototype.isNew = function () {
            return (this.selectedQuery.advancedUserQueryId == null);
        };

        AdvancedQueryService.prototype.isNew = function () {
            return (this.selectedQuery.advancedUserQueryId == null);
        };

        AdvancedQueryService.prototype.addTripletToRDFQueryBuilder = function (triplet, cb) {


            //If it is the first time check that it starts from the entry
            if (this.lastAddedTriplet == null) {
                if (triplet.subjectType != ':Entry') {
                    alert('To build the query you need to start by the entry');
                    if (cb)cb(':Entry');
                    return;
                }
                this.sparqlBuilder = '?entry ';
            } else { // If it is already in the tree check that the selected entity comes from the relation
                if (this.lastAddedTriplet.objectType != triplet.subjectType) {
                    alert('You have chosen the relation ' + this.lastAddedTriplet.predicate + ' for a ' + this.lastAddedTriplet.objectType);
                    if (cb)cb(this.lastAddedTriplet.objectType);
                    return;
                }
                //Everything is fine
                this.sparqlBuilder += '/';
            }


            this.sparqlBuilder += triplet.predicate;
            this.lastAddedTriplet = triplet;
            if (cb)cb(triplet.objectType);


        };

        var service = new AdvancedQueryService();

        $rdf_help_get_resource.query(null, function (data) {
            service.rdfHelp =  data;
        });

        return service;

    }
]);