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

        var baseUrl = config.api.BASE_URL + config.api.API_PORT;

        //TODO Should call the api instead
        var $rdf_help_get_resource = $resource('http://localhost:3000/rdfhelp.json', {
            get: { method: 'query', isArray: true }
        });

        var $api_help_get_resource = $resource(baseUrl + '/nextprot-api/jsondoc.json', {
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

        var $api_adv_query_id = $resource(baseUrl + '/nextprot-api/user/:username/advanced-user-query/:id.json', {username: '@username', id: '@id'}, {
            delete: { method: 'DELETE'},
            update: { method: 'PUT'}
        });


        var AdvancedQueryService = function () {
            this.showHelp = false;
            this.rdfHelp = {};
            this.sparqlBuilder = "";
            this.currentRepository = Search.config.widgets.repositories.aNextprotRep;
            this.repositories = Search.config.widgets.repositories;

            this.currentSparql = "#write your sparql query here";
            this.selectedQuery = {};
            this.queries = {};
            this.navTriplets = [];

        };

        AdvancedQueryService.prototype.refreshCurrentRepository = function (cb) {
            this.getRepository.getRepository(this.currentRepository);
        }

        AdvancedQueryService.prototype.getRepository = function (repositoryName, cb) {

            var selectedResource = null;
            var me = this;

            this.currentRepository = repositoryName;

            if (this.currentRepository == this.repositories.aNextprotRep) {
                selectedResource = $nextprot_query_list;
            } else if (this.currentRepository == this.repositories.communityRep) {
                selectedResource = $public_query_list;
            } else if (this.currentRepository == this.repositories.privateRep) {
                selectedResource = $user_query_list;
            } else throw this.currentRepository + ' repository not found!!!';

            var cbOk = function (data) {
                me.queries = data['advancedUserQueryList'];
                if (cb)cb(me.queries);
            };

            var cbFailure = function (error) {
                console.log(error, error.headers())
            }


            //Needs the username
            if (this.currentRepository == this.repositories.privateRep) {
                return selectedResource.get({username: UserService.userProfile.username}, cbOk, cbFailure);
            } else {
                return selectedResource.get(cbOk, cbFailure);
            }

        };

        AdvancedQueryService.prototype.createAdvancedQuery = function (username, cb, cbe) {
            $user_query_list.create({ username: UserService.userProfile.username }, this.selectedQuery, function (data) {
                if (cb)cb(data);
            }, function (error) {
                if (cbe)cbe(error);
            });
        };

        AdvancedQueryService.prototype.updateAdvancedQuery = function (username, cb) {
            $api_adv_query_id.update({ username: UserService.userProfile.username, id: this.selectedQuery.advancedUserQueryId }, this.selectedQuery, function (data) {
                if (cb)cb(data);
            });

        };

        AdvancedQueryService.prototype.deleteAdvancedQuery = function (username, aq, cb) {
            if (confirm("Are you sure you want to delete the selected query?")) {
                console.log('delete advanced query > ', aq);
                $api_adv_query_id.delete({ username: UserService.userProfile.username, id: aq.advancedUserQueryId}, function (data) {
                    if (cb)cb(data);
                });
            }
        };


        AdvancedQueryService.prototype.setCurrentQuery = function (query) {

            //The binding is done at the level of the primitive, therefore
            angular.extend(this.selectedQuery, query);

        };

        AdvancedQueryService.prototype.isSelectedQueryEmpty = function () {
            return ((typeof this.selectedQuery.username === 'undefined') ||
                (this.selectedQuery.username == null) ||
                (this.selectedQuery.username == ""));
        };

        AdvancedQueryService.prototype.clearSelectedQuery = function () {
            this.selectedQuery = {};
        };

        AdvancedQueryService.prototype.isSelectedQueryEditable = function () {
            return (UserService.userProfile.username == this.selectedQuery.username);
        };

        AdvancedQueryService.prototype.clearCurrentQuery = function () {
            this.currentSparql = "";
        };

        AdvancedQueryService.prototype.isNew = function () {
            return (this.selectedQuery.advancedUserQueryId == null);
        };

        AdvancedQueryService.prototype.insertOrUpdateSelectedQuery = function () {
            var me = this;
            if (this.isNew()) {
                this.createAdvancedQuery(UserService.userProfile.username,
                    function (data) {
                        alert('a flash image should appear' + data);
                        flash('alert-success', ' query saved successfully!')
                        me.selectedQuery = {};
                        me.getRepository(Search.config.widgets.repositories.privateRep);
                        return;
                    },
                    function (error) {
                        if (error.status == 409) {
                            flash('alert-warn', 'object already exists, choose a different name.')
                        }
                    }
                );
            } else {
                this.updateAdvancedQuery(UserService.userProfile.username,
                    function (data) {
                        flash('alert-success', "Updated successful for " + data.title);
                        me.selectedQuery = {};
                        me.getRepository(Search.config.widgets.repositories.privateRep);
                        return;
                    },
                    function (error) {
                        if (error.status == 409) {
                            flash('alert-warn', 'object already exists, choose a different name.')
                        }
                    }
                );
            }
        }


        AdvancedQueryService.prototype.createNewEmptyQuery = function (cb) {
            this.selectedQuery.title = null;
            this.selectedQuery.published = false;
            this.selectedQuery.username = UserService.userProfile.username;
            this.selectedQuery.sparql = "#Write your sparql query here";
            this.selectedQuery.description = null;
        }


        /**
         For the wizard
         **/
        AdvancedQueryService.prototype.buildSparqlString = function () {
            var sp = "?entry ";
            if (this.navTriplets.length > 0) {
                sp += this.navTriplets[0].predicate;
            }

            for (var i = 1; i < this.navTriplets.length; i++) {
                sp += "/" + this.navTriplets[i].predicate;
            }

            this.currentSparql = sp;
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

    }
]);