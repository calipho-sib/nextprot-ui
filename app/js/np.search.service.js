(function (angular, undefined) {'use strict';
var SearchService = angular.module('np.search.service', ['np.search.ui']);


// Search API

/**
 * define service that made the search
 */
SearchService.factory('Search', [
    '$resource',
    '$http',
    '$cookies',
    '$cookieStore',
    'config',
    'flash', //TODO flash should not be here, it should be placed on the controller, but before, the search need to be promised
    function ($resource, $http, $cookies, $cookieStore, config, flash) {
        //
        // this is the url root
        var $api = $resource(config.api.API_URL + '/:action/:entity', { action: '@action', entity: '@entity', port: config.api.API_PORT }, {
            search: { method: 'POST'}
        });


        var defaultUrl = {
            filter: '',
            entity: 'entry.json',
            quality: 'gold',
            query: '',
            sparql: null,
            sort: '',
            order: '',
            mode: null // can be simple or advanced
        };

        var defaultAdv = {
            sparqlEngine: 'Jena'
        };

        var searchApi = {
            action: 'search'
        };

        var suggestApi = {
            action: 'autocomplete'
        };


        /**
         * Reformat publication fields in doc
         *
         * @param {Object} doc publications to reformat
         */
        function reformatPublication(doc) {

            splitPubAcsPubMedLast(doc);

            doc.year = new Date(doc.date.replace(/(CET|CEST|EEST|WEEST)/gi, "")).getFullYear();
            doc.authors = doc.pretty_authors.split(' | ');
        }

        /**
         * Format publication sources accessions line in doc object
         *
         * @method formatPubSources
         * @param {Object} doc the doc on which format has to be done
         */
        function splitPubAcsPubMedLast(doc) {

            if (doc.ac != undefined) {

                // pubmed last in "ac":"25174335:PubMed | 10.1016/j.jmb.2014.08.014:DOI"
                doc.acs = doc.ac.split(' | ');

                if (doc.acs.length > 1) {
                    var i = 0;
                    while (i < doc.acs.length) {
                        if (doc.acs[i].match("PubMed")) break;
                        i++;
                    }

                    if (i < doc.acs.length) {
                        var pubmed = doc.acs[i];
                        doc.acs[0] = doc.acs[doc.acs.length - 1];
                        doc.acs[doc.acs.length - 1] = pubmed;
                    }
                }
            } else {
                doc.acs = "";
            }
        }

        /**
         * Sort filters in ascending order of their mapped values
         *
         * @method sortFiltersByKey
         * @param {Object} parameters
         *   + {Array} filters array to sort
         *   + {Object} map a dictionary of key/values
         *   + {String='name'} key name to access value from filters element object ('name' by default)
         * @return {Array} Returns a sorted list of filters
         */
        function sortFiltersByKey(parameters) {

            var filters = parameters.filters;
            var map = parameters.map;
            var key = parameters.key;

            key = typeof key !== 'undefined' ? key : 'name';

            return filters.sort(function(f1, f2) {

                if (! (key in f1) ) console.error("alert-warning", "'"+key+"' was not found in "+JSON.stringify(f1, null, 4));
                else if (! (key in f2) ) console.error("alert-warning", "'"+key+"' was not found in "+JSON.stringify(f2, null, 4));
                else return map[f1[key]].localeCompare(map[f2[key]]);
            });
        }

        var Search = function (data) {
            //
            // init session
            this.session = {summary : false};
            //angular.extend(this.session, $cookies)

            //
            // default config
            this.config = config.api;

            //
            // app search service params
            this.params = {};

            //for activating the spinner
            this.loading = false;

            //
            // result content
            this.result = {};

            this.resultCount = 0;

            angular.extend(this.params, defaultUrl, data || {})

        };

        Search.prototype.displayGold = function () {
            return (this.config.widgets[this.result.display] && this.config.widgets[this.result.display].gold && this.params.mode != "advanced");
        };


        /*Search.prototype.cookies = function (session) {
            angular.extend(this.session, session, $cookies)
            Object.keys(session).forEach(function (k) {
                if (session[k] !== undefined)$cookieStore.put(k, session[k])
            })
            return true;
        }*/

        Search.prototype.clear = function () {
            angular.copy(defaultUrl, this.params)
        };

        Search.prototype.isSearchButtonDisabled = function () {
            if (this.params.mode == 'advanced' && (!this.params.sparql || !this.params.sparql.length))
                return true;
            return ((this.params.query) && (this.params.query.length == 0));
        };


        Search.prototype.paginate = function (params, docs) {
            this.resultCount = docs.found;
            this.result.pagination = {};
            if (!params.rows)
                params.rows = config.api.paginate.defaultRows;

            params.rows = parseInt(params.rows);

            // current page in the bottom
            var currentOffset = parseInt((params.start ? params.start : 0) / params.rows);
            //The page starts at 1 and the offset starts at 0
            this.result.pagination.current = (currentOffset + 1);

            //total number of pages
            var totalPage = Math.floor(this.resultCount / params.rows) + 1;

            this.result.pagination.numPages = parseInt(this.calcPages(this.resultCount, params.rows ? parseInt(params.rows) : 50));
            //console.log('pages: ', this.result.num, params.rows ? params.rows : 50, this.result.pagination.numPages, this.calcPages(this.result.num, params.rows ? params.rows : 50));

            // back button
            if (params.start > 0 && (this.result.pagination.current) > 0) {
                this.result.pagination.prev = {
                    offset: currentOffset - 1,
                    rows: params.rows,
                    start: ((currentOffset - 1) * params.rows),
                    visible : (currentOffset != 0)

                };
            }

            // next button
            if (docs.results.length == params.rows) {
                this.result.pagination.next = {
                    offset: currentOffset + 1,
                    rows: params.rows,
                    start: ((currentOffset + 1) * params.rows),
                    visible : (currentOffset != (totalPage - 1))
                };
            }

            this.result.offset = docs.start;
            this.result.pages = [];


            var minPage = this.result.pagination.current - (config.api.paginate.steps / 2);
            var maxPage = this.result.pagination.current + (config.api.paginate.steps / 2);


            if (minPage < 1){
                maxPage  += (Math.abs(minPage) + 1);
                minPage = 1;
            }

            if (maxPage > totalPage){
                minPage -= Math.abs(totalPage - maxPage);
                maxPage = totalPage;
            }

            //Final checks when the num results don't feel the paging
            if(minPage < 1) {
                minPage = 1;
            }

            if(maxPage > totalPage) {
                maxPage = totalPage;
            }


            for (var page = minPage; page <= maxPage; page++) {
                this.result.pages.push({
                    offset: page,
                    current: (this.result.pagination.current) === page
                })
            }

        };


        Search.prototype.calcPages = function (numDocs, pageSize) {
            return ( numDocs + pageSize - 1) / pageSize;
        };


        //
        //
        // suggest is a quick search
        Search.prototype.suggest = function (query, cb) {
            var params = {};
            angular.extend(params, defaultUrl, suggestApi, {query: query, entity: this.params.entity, quality: this.params.quality});

            $api.search(params, params.query, function (result) {
                var items = [];
                for (var i = 0; i < result.autocomplete.length; i = i + 2) {
                    items.push(result.autocomplete[i].name)
                }
                if (cb)cb(items)
            })
        };


        //
        //
        // solr search in all documents
        Search.prototype.docs = function (params, cb) {

            var me = this;
            me.result.error = "";
            me.result.docs = [];
            me.loading = true;

            delete this.params.listId;
            delete this.params.queryId;
            delete this.params.list;
            delete this.params.accs;

            angular.extend(this.params, searchApi, defaultUrl, params);
            this.params.entity = config.api.entityMapping[params.entity];

            // adv search
            if (this.params.sparql) {
                angular.extend(this.params, defaultAdv);
            }

            // make a copy to avoid post issue
            var post = angular.copy(this.params);
            delete post.action;
            delete post.entity;

            // display search status status
            me.result.message = "Loading content...";

            $api.search({action: this.params.action, entity: this.params.entity}, post).$promise.then(function (docs) {
                me.result.rows = docs.rows;
                me.result.params = params;
                me.result.display = config.api.entityMapping[me.params.entity];
                me.result.core = docs.index;
                me.result.time = docs.elapsedTime;
                me.result.score = docs.maxScore;
                me.result.docs = docs.results;
                me.result.ontology = config.api.ontology;
                me.result.filters = sortFiltersByKey({filters: docs.filters, map: me.result.ontology});

                me.result.message = (docs.found == 0) ? "No search results were found." : null;

                //
                // prepare spellcheck stucture
                me.result.spellcheck = docs.spellcheck;

                //
                // prepare pagination
                me.paginate(params, docs);

                if (me.result.display === "publications")
                    me.result.docs.forEach(reformatPublication);

                me.loading = false;

                if (cb)cb(me.result)
            }, function (error) {
                flash("alert-warning", error.data.message); //TODO remove this!!!

                //See if there is a cleaner way of doing this
                me.loading = false;
                me.result.message = null;
                me.result.pages = [];
                me.result.filters = null;
                me.resultCount = 0;
                //if (error.status)
                //me.result.error = "Ooops, request failed: " + error;
            })
        };

        Search.prototype.getIds = function (params, cb) {

            // make a copy to avoid post issue
            var post = angular.copy(params);
            delete post.action;
            delete post.entity;

            // adv search
            if (params.mode == 'advanced')
                angular.extend(post, defaultAdv);

            $api.search({ action: 'search-ids', entity: params.entity, quality: params.quality, filter: params.filters }, post).$promise.then(function (docs) {
                if (cb)cb(docs);
            });
        };


        var search = new Search();
        return search;
    }]);
})(angular);
