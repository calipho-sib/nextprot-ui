(function (angular, undefined) {
    'use strict';


    angular.module('np.user.query.service', [])
        .factory('queryRepository', queryRepository)
        .controller('QueryRepositoryCtrl', QueryRepositoryCtrl)
        .run(initQueryModule);


    //
    // init module
    initQueryModule.$inject = ['$resource', 'config', 'user', '$q', '$cacheFactory'];
    function initQueryModule($resource, config, user, $q, $cacheFactory) {
        //
        // data access
        var $dao = {
            queries: $resource(config.api.API_URL + '/user/:username/query/:id',
                {username: '@username', id: '@id'}, {
                    get: {method: 'GET', isArray: true},
                    list: {method: 'GET', isArray: true},
                    create: {method: 'POST'},
                    update: {method: 'PUT'}
                })
        }

        //
        // repository of queries (TODO more cache access)
        var queryList = $cacheFactory('queries')


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
            this.$promise = $q.when(this)

            // save this instance
            queryList.put(this.userQueryId, this)
        };


        //
        // create a new query for this user
        Query.prototype.createOne = function (init) {
            return new Query(init);
        }

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
        }
        //
        // check is this query is owned by the current user
        Query.prototype.isOwner = Query.prototype.isEditable = function (who) {
            return (this.owner.toLowerCase() == (who || user.profile.username).toLowerCase());
        }

        //
        // CRUD operations
        //

        //
        // list queries for this user
        Query.prototype.list = function () {

            var me = this, params = {username: user.profile.username};
            me.$promise = $dao.queries.list(params).$promise
            me.$promise.then(function (data) {
                me.queries = data.map(function (q) {
                    return me.createOne(q)
                })

                // TODO instance of query should be Query class
                // TODO QueryRepository should maintain local store?
                // me.getRepository(Search.config.widgets.repositories.privateRep);
                //me.queries = data;
            })
            return this;
        };

        //
        // save or create the current instance
        Query.prototype.save = function () {
            var me = this, params = {username: this.owner, id: this.userQueryId};

            // on update
            if (this.userQueryId) {
                params.id = this.userQueryId;
                me.$promise = $dao.queries.update(params, this.payload()).$promise
            } else {
                me.$promise = $dao.queries.create(params, this.payload()).$promise
            }

            // save this instance
            queryList.put(this.userQueryId, this)

            // TODO me.$promise.then
            // me.getRepository(Search.config.widgets.repositories.privateRep);
            return me;
        };

        //
        // delete the current instance
        Query.prototype.delete = function () {
            var me = this, params = {username: this.owner, id: this.userQueryId};
            me.$promise = $dao.queries.delete(params).$promise

            // TODO me.$promise.then
            // me.getRepository(Search.config.widgets.repositories.privateRep);
            return me;
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
        }

        var icons = {
            'public': 'icon-globe',
            'private': 'icon-user',
            'tutorial': 'icon-certificate'
        }

        var QueryRepository = function () {
            //  this.selectedQuery = {};
            this.category = 'tutorial';

            this.queries = {};
            this.$dao = {
                queries: $resource(config.api.API_URL + '/queries/:category.json',
                    {category: '@category'}, {
                        list: {method: 'GET', isArray: true}
                    })
            }

            //
            // wrap promise to this object
            this.$promise = $q.when(this)

        };


        QueryRepository.prototype.getDescription = function (name) {
            return description[this.category];
        }

        QueryRepository.prototype.getIcon = function (name) {
            return icons[this.category];
        }

        QueryRepository.prototype.list = function (category) {
            var me = this;
            this.category = category || 'tutorial';
            this.$promise = this.$dao.queries.list({category: this.category}).$promise;
            this.$promise.then(function (data) {
                me.queries = data.map(function (q) {
                    return user.query.createOne(q)
                })
            })
            return this
        }

        return new QueryRepository();
    }

//
//
    QueryRepositoryCtrl.$inject = ['$scope', '$timeout', 'config', 'user', 'queryRepository', 'Search', 'flash']
    function QueryRepositoryCtrl($scope, $timeout, config, user, queryRepository, Search, flash) {

        // publish data
        $scope.repository = {
            show: false,
            queries: [],
            selectedQuery: false
        };
        $scope.queryRepository = queryRepository;

        // publish function
        $scope.toggleRepository = function () {
            $scope.repository.show = !$scope.repository.show;

            //
            // needs to load queries
            if ($scope.repository.show && !$scope.repository.queries.length) {
                $scope.loadQueries('tutorial');
            }
        }

        $scope.loadQueries = function (category) {
            queryRepository.list(category).$promise.then(function () {
                $scope.repository.queries = queryRepository.queries
            })
        }

        $scope.loadMyQueries = function () {
            user.query.list().$promise.then(function (q) {
                $scope.repository.queries = user.query.queries
            })
        }

        $scope.setCurrentQuery = function (query) {
            $scope.repository.selectedQuery = query;
        }

        $scope.applyCurrentQueryForSearch = function (query) {
            Search.params.sparql = '#' + query.title + "\n" + query.sparql;
            //close after that
            $scope.repository.show = false;
        }

        $scope.createNewEmptyQuery = function () {
            $scope.repository.selectedQuery = user.query.createOne();
        }

        $scope.saveSelectedQuery = function () {
            $scope.repository.selectedQuery.save().$promise.then(function () {
                $scope.repository.selectedQuery = false;
            });
        }

        $scope.deleteUserQuery = function (query) {
            if (confirm("Are you sure you want to delete the selected query?")) {
                query.delete().$promise.then(function () {
                    flash('alert-info', query.title + 'query successfully deleted');
                    $scope.loadMyQueries(); // not sure about this
                });
            }
        }

        $scope.clearSelectedQuery = function () {
            $scope.repository.selectedQuery = false;
        }

    }


})(angular); //global variable
