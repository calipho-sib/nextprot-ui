(function (angular, undefined) {
    'use strict';


    angular.module('np.user.query', ['np.tracker'])
        .factory('queryRepository', queryRepository)
        .controller('QueryRepositoryCtrl', QueryRepositoryCtrl)
        .run(initQueryModule);


    //
    // init module
    initQueryModule.$inject = ['$resource', 'config', 'user', '$q', '$cacheFactory'];
    function initQueryModule($resource, config, user, $q, $cacheFactory) {
        //
        // data access
        var $dao = function(headers) {
            return {
                queries: $resource(config.api.API_URL + '/user/me/queries/:id', {id: '@id'}, {
                        get: {method: 'GET', headers : headers},
                        list: {method: 'GET', headers : headers, isArray: true },
                        create: {method: 'POST', headers : headers},
                        update: {method: 'PUT', headers : headers}
                })
            }
        }

        //
        // repository of queries (TODO more cache access)
        var queryList = $cacheFactory('queries'), queries=[];


        //
        // model for user sparql queries
        var Query = function (data) {

            // init this instance
            this.userQueryId = data && data.userQueryId || undefined;
            this.title = data && data.title || '';
            this.published = data && Boolean(data.published) || false;
            this.owner = data && data.owner || user.profile.username;
            this.sparql = data && data.sparql || "#Write your sparql query here";
            this.description = data && data.description || '';
            this.tags = data && data.tags;

            //
            // wrap promise to this object
            this.$promise = $q.when(this);

            // save this instance
            queryList.put(this.userQueryId, this)
        };


        //
        // create a new query for this user
        Query.prototype.createOne = function (init) {
            return new Query(init);
        };

        //
        // return current queries of this user
        Query.prototype.queries = function () {
            return queries;
        };

        Query.prototype.payload = function () {
            return {
                userQueryId: this.userQueryId,
                title: this.title,
                published: this.published,
                owner: this.owner,
                sparql: this.sparql,
                description: this.description,
                tags: this.tags
            }
        };
        //
        // check is this query is owned by the current user
        Query.prototype.isOwner = Query.prototype.isEditable = function (who) {
            return (this.owner.toLowerCase() == (who || user.profile.username).toLowerCase());
        };

        //
        // CRUD operations
        //

        //
        // list queries for this user
        Query.prototype.list = function (token) {

            var me = this, params = {};
            var header = {
                Authorization : 'Bearer ' + token
            }
            me.$promise = $dao(header).queries.list(params).$promise
            me.$promise.then(function (data) {
                queries = data.map(function (q) {
                    return me.createOne(q)
                })
            });
            return this;
        };

        //
        // save or create the current instance
        Query.prototype.save = function (token) {
            var params = {id: this.userQueryId};
            var header = {
                Authorization : 'Bearer ' + token
            }

            // save this instance
            queryList.put(this.userQueryId, this)

            // on update
            if (this.userQueryId) {
                params.id = this.userQueryId;
                return $dao(header).queries.update(params, this.payload())
            } else {
                return $dao(header).queries.create(params, this.payload())
            }

        };

        //
        // delete the current instance
        Query.prototype.delete = function (token) {
            var me = this, params = {id: this.userQueryId};
            var header = {
                Authorization : 'Bearer ' + token
            }
            me.$promise = $dao(header).queries.delete(params).$promise
            me.$promise.then(function(){
              queries.every(function(query,i){
                  if(query.userQueryId===me.userQueryId){
                      return queries.splice(i,1);
                  }
                  return true;
              })
            });

            return me;
        };


        // gets the query instance
        Query.prototype.get = function (queryId, token) {
            var self = this;
            var header = {
                Authorization : 'Bearer ' + token
            }
            self.$promise=self.$dao(header).get({id: queryId}).$promise;
            return self;
       };

        user.query = new Query();


        return Query;

    }

//
//
    queryRepository.$inject = ['$resource', 'config', 'user', '$q'];
    function queryRepository($resource, config, user, $q) {

        var description = {
            'public': 'This is the public repository',
            'private': 'This is the private repository',
            'nextprot': 'This is the nextprot repository'
        };

        var icons = {
            'public': 'fa-globe',
            'private': 'fa-user',
            'tutorial': 'fa-certificate'
        };

        var QueryRepository = function () {
            //  this.selectedQuery = {};
            this.category = 'tutorial';
            this.repository = {
                show: true,
                queries: [],
                queriesTags: [],
                filterTag: null,
                selectedQuery: false
            };

            this.queries = {};

            this.userQueryResource = function(token) {
                let headers = {
                    Authorization : 'Bearer ' + token
                }

                return $resource(config.api.API_URL + '/user/me/queries/:id', {},
                    {
                        get: {method: 'GET', headers: headers },
                        list: {method: 'GET', headers: headers, isArray: true },
                        create: {method: 'POST', headers: headers },
                        update: {method: 'PUT', headers: headers },
                        delete: {method: 'DELETE', headers: headers }
                    });
            }




            this.$dao = { //should be removed!!!
                queries: $resource(config.api.API_URL + '/user/me/queries.json',
                    {}, {
                        get: {method: 'GET'},
                        list: {method: 'GET', isArray: true}
                    })
            };


            this.$daoQueries = $resource(config.api.API_URL + '/queries/:id',
                    {}, {
                        get: {method: 'GET'},
                        list: {method: 'GET', isArray: true}
                    });

            //
            // wrap promise to this object
            this.$promise = $q.when(this)

        };


        QueryRepository.prototype.getDescription = function (name) {
            return description[this.category];
        };

        QueryRepository.prototype.getIcon = function (name) {
            return icons[this.category];
        };


        QueryRepository.prototype.getTutorialQueries = function (name) {
            return this.$daoQueries.list().$promise;
        };

        QueryRepository.prototype.list = function (category) {
            var me = this;
            this.category = category || 'tutorial';
            this.$promise = this.$dao.queries.list({category: this.category}).$promise;
            this.$promise.then(function (data) {
                me.queries = data.map(function (q) {
                    return user.query.createOne(q)
                });
                return me.queries
            });
            return this
        };


        // new method definitions (by Daniel)
        QueryRepository.prototype.getQueryByPublicId = function (queryId) {
            return this.$daoQueries.get({id: queryId}).$promise;
        };

        QueryRepository.prototype.deleteUserQuery = function (query) {
            return this.userQueryResource(user.profile.token).delete({id: query.userQueryId}).$promise;
        };

        QueryRepository.prototype.saveOrCreate = function (query) {
            delete query.$promise;
                if (query.userQueryId) {
                    return this.userQueryResource(user.profile.token).update({id: query.userQueryId}, query).$promise;
                } else {
                    return this.userQueryResource(user.profile.token).create({}, query).$promise;
                }

            return this.userQueryResource(user.profile.token).delete({id: query.userQueryId}).$promise;
        };

        return new QueryRepository();
    }

//
//
    QueryRepositoryCtrl.$inject = ['Tracker', '$scope', '$location', '$timeout', '$log', '$window', 'config', 'user', 'queryRepository', 'Search', 'flash']
    function QueryRepositoryCtrl(Tracker, $scope, $location, $timeout, $log, $window, config, user, queryRepository, Search, flash) {

        // publish data
        $scope.repository = queryRepository.repository;
        $scope.queryRepository = queryRepository;
        $scope.queryRepository.token = user.profile.token;
        $scope.loading = false;

        $scope.disabled = function () {
            return user.isAnonymous();
        };

        $scope.runQuery = function (query) {
            $location.search("sparql", query.sparql);
        };

        $scope.setFilterTag = function (tag) {
            $scope.repository.filterTag = tag;
        };

        // publish function
        $scope.showRepository = function () {
            $scope.repository.selectedQuery = null;
            $scope.repository.show = true;
        };

        // publish function
        $scope.toggleRepository = function () {
            $scope.repository.show = !$scope.repository.show;
            $scope.repository.selectedQuery = null;
        };

        // publish function
        $scope.showNewQuery = function () {
            $scope.showRepository();
            $scope.showNewQueryPanel((Search.params.sparql) ? {sparql: Search.params.sparql} : null);
        };

        // publish function
        $scope.toggleNewQuery = function () {
            $scope.toggleRepository();
            $scope.showNewQueryPanel((Search.params.sparql) ? {sparql: Search.params.sparql} : null);
        };

        $scope.openW3CSPARQL = function () {
            $window.open("https://www.w3.org/TR/sparql11-query/", "_blank")
        }

        $scope.didyoumean = function (index) {

            Search.params.query = Search.result.spellcheck.collations[index].query;

            $scope.go();
        };

        $scope.loadTutorialQueries = function () {

            queryRepository.getTutorialQueries().then(function (queries) {
                $scope.repository.queries = queries;
                $scope.setTags();
            })
        };

        $scope.loadMyQueries = function () {

            if (user.isAnonymous()) {
                flash("alert-warning", "Please login to access your queries.")
            }
            else {
                $scope.loading = true;

                user.$promise.then(function () {
                    user.query.list(user.profile.token).$promise.then(function (queries) {
                        $scope.repository.queries = queries;
                        $scope.setTags();
                        $scope.loading = false;
                    }, function (reason) {
                        alert('Failed: ' + reason);
                        $scope.loading = false;
                    });
                })
            }
        };

        $scope.setModalQuery = function (query) {
            $scope.selected = {};
            angular.extend($scope.selected, query);
        };

        $scope.setTags = function () {
            var queries = $scope.repository.queries;
            var tags = [];
            queries.forEach(function (query) {
                query.tags.forEach(function (tag) {
                        if (tags.indexOf(tag.trim()) == -1) {
                            tags.push(tag)
                        }
                    }
                )
            });
            angular.copy(tags,$scope.repository.queriesTags);
        };


        $scope.setCurrentQuery = function (query) {
            $scope.repository.selectedQuery = query;
        };

        $scope.applyCurrentQueryForSearch = function (query) {
            $location.search('sparql', '#' + query.title + "\n" + query.sparql);
            //close after that
            $scope.repository.show = false;
            $scope.repository.selectedQuery = false;
        };

        $scope.showNewQueryPanel = function (data) {
            if(user.isAnonymous()){
                flash("alert-warning", "Please login to create new queries");
            }else {
                $scope.repository.selectedQuery = user.query.createOne(data);
           }
        };

        $scope.saveSelectedQuery = function (query) {

            var q = query || $scope.repository.selectedQuery;
            if(!q.title || (q.title.length == 0)){//TODO check this at the level of the API and database
                flash('alert-warning', 'Please give your query a title');
           }else {

                queryRepository.saveOrCreate(q).then(function () {
                    flash('alert-info', q.title + ' saved successfully');
                    $scope.loadTutorialQueries(); //TODO should remove the entry from the list without having to call the api again
                    $scope.repository.selectedQuery = false;
                    $('.modal-backdrop').remove();//remove the modal backdrop if everything is fine
                }, function(error){
                    flash('alert-warning', error.data.message);
                });

            }
        };

        $scope.deleteUserQuery = function (query) {
            if (confirm("Are you sure you want to delete the selected query?")) {
                queryRepository.deleteUserQuery(query).then(function () {
                    $scope.loadTutorialQueries(); //TODO should remove the entry from the list without having to call the api again
                    flash('alert-info', query.title + 'query successfully deleted');
                });
            }
        };


        $scope.doSparqlSearch = function (query) {

            $location.path("/proteins/search");

            $location.search("query", null);
            $location.search("mode", "advanced");
            $location.search("NXQ_ID", query.userQueryId);

        };

        $scope.clearSelectedQuery = function () {
            $scope.repository.selectedQuery = false;
        };

        $scope.gaTrackContactUsEvent = function(subject) {
            Tracker.trackContactUsEvent(subject);
        };
    }


})(angular); //global variable
