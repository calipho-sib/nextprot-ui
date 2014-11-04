'use strict';

//
//Define the search module (np.search)  for controllers, services and models
var SearchModule = angular.module('np.search', [
    'np.search.ui',
    'np.search.service',
    'np.cart',
    'np.proteinlist.service'
]);

//
//define all routes for user Search
SearchModule.config([
    '$routeProvider',
    '$locationProvider',
    '$httpProvider',

    function ($routeProvider, $locationProvider, $httpProvider) {
        // List of routes of the application
        $routeProvider
            .when('/search', {templateUrl: 'partials/search/result.html'})
            .when('/search/:query', {templateUrl: 'partials/search/result.html'})
            .when('/:entity/search', {templateUrl: 'partials/search/result.html'})
            .when('/:entity/search/:query', {templateUrl: 'partials/search/result.html'});
    }
]);

SearchModule.controller('SearchCtrl', [
    '$resource',
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    '$route',
    '$timeout',
    'Search',
    'config',
    // 'AdvancedQueryService',
    'User',
    'flash',
    'auth' ,
    function ($resource, $scope, $rootScope, $location, $routeParams, $route, $timeout, Search, config, User, flash, auth) {

        // scope from template
        $scope.Search = Search;
        $scope.config = config;
        $scope.user = User;
        $scope.auth = auth;

        $scope.editorOptions = {
            lineWrapping : false,
            lineNumbers: false,
            readOnly: false,
            mode: 'sparql'
        };

        //
        // load profile on init
        User.me();

        // $scope.AdvancedQueryService = AdvancedQueryService;

        $scope.cookies = function (session) {
            Search.cookies(session)
            $timeout(function () {
                // must be called 2times??
                Search.cookies(session)
            }, 0)
        }

        $scope.login = function() {
            User.login(function(err){
                console.log(User,err);
                if(err){
                    return flash('alert-error', "Ooops ");
                }
                flash('alert-info', "Welcome " + User.username);
            })
        }

        $scope.logout = function () {
            $scope.reset();
            auth.signout();
        }



        $scope.setAdvancedUserQuery = function (sparql) {
            $scope.advancedUserQuery = sparql;
        }


        //
        // interact with the search bar
        $scope.manualPaginate = function (form) {

            var currentValue = parseInt(Search.result.pagination.current);
            var numPages = parseInt( Search.result.pagination.numPages);
            if(currentValue > numPages){
                Search.result.pagination.current=numPages;
            }

            $scope.params({start:(Search.result.pagination.current - 1)*Search.result.rows}, form);

        }

        //
        // interact with the search bar
        $scope.params = function (params, form) {
            if (form && !form.$valid)
                return;
            angular.forEach(params, function (v, k) {
                $location.search(k, v);
            });
        }

        $scope.quality = function (name) {
            Search.params.quality = name;
            $location.search('quality', (name !== 'gold') ? 'gold-and-silver' : null);
        }


        $scope.entity = function (params) {
            $location.search('start', null)
            $location.search('filter', null)
            $location.search('quality', null)
            $location.search('sort', null)
            $location.search('order', null)
            $location.path('/' + params.entity + '/search' + ((Search.params.query) ? '/' + Search.params.query : ''));
        }

        $scope.toggleAdv = function (mode) {
            $location.search('query', null)
            $location.search('sparql', null)
            $scope.toggle(mode)
            if(mode.mode){
                $location.path('/proteins/search')
            }
            // if (mode==='advanced'){
            //     return $location.path('/proteins/search').search('mode', mode).search('query',null);
            // }

            // $location.search('mode', null).search('sparql',null)
        }

        $scope.clean = function () {
            $location.search('engine', null)
            $location.search('title', null)
            $location.search('sparql', null)
            $location.search('list', null)
            $location.search('rows', null)
            $location.search('start', null)
            $location.search('cart', null)
            $location.search('query', null)
            $location.search('filter', null)
            $location.search('quality', null)
            $location.search('sort', null)
            $location.search('order', null)
            $location.path('/' + Search.config.entityMapping[Search.params.entity] + '/search');
        }

        $scope.reset=function(){
            $location.search({})
        }

        $scope.toggle = function (params) {
            $location.search('start', null)
            angular.forEach(params, function (v, k) {
                var t = ($location.search()[k] && $location.search()[k] === v) ? null : v;
                $location.search(k, t)
            });
        }



        $scope.active = function (value, key) {
            if (key) {
                return ($location.search()[key] === value) ? ' active  ' : '';
            }
            return ($location.path().indexOf(value) > -1) ? ' active  ' : '';
        }

        $scope.didyoumean = function (index) {
            Search.params.query = Search.result.spellcheck.collations[index].collationQuery;
            $scope.go();
        }

        $scope.moredetails = function (index) {

        }

        $scope.displaySort=function(){
            //
            // map default visual aspect of sort
            var entity=Search.config.entityMapping[Search.params.entity],
                defaultSort=Search.config.widgets[entity].sort[Search.params.sort]

            //
            // sort order can be overrided by user action
            if(Search.config.widgets.sort[Search.params.order]){
                defaultSort.image=Search.config.widgets.sort[Search.params.order]
                defaultSort.isAsc=(Search.params.order=='asc')
            }
            return defaultSort
        }

        $scope.isAdvancedMode = function () {
            return Search.params.mode == 'advanced';
        }

        $scope.isSearchBarVisible=function(){
            return ($location.path()==='/'||$location.path().indexOf('/search')!==-1)
        }

        $scope.go = function () {
            var url = $location.url();
            $location.search('filter', null);
            $location.search('list', null);
            $location.search('cart', null);
            $location.search('rows', null);
            $location.search('start', null);


            $location.path('/' + Search.config.entityMapping[Search.params.entity] + '/search')

            //Advanced mode
            if (Search.params.sparql && Search.params.sparql.length) {

                $location.search('sparql', Search.params.sparql.trim()).
                          search('mode','advanced').
                          search('rows', (Search.params.rows) ? Search.params.rows : 50).
                          search('query',null);

            }

            //We are in simple mode
            if(Search.params.query && Search.params.query.length){
                $location.search('query', Search.params.query.trim()).search('sparql',null);
            }

            //
            // url has not changed => FIRE event
            if ($location.url() === url) {
                $scope.reload();
            }
        }

        $scope.reload = function () {
            // restart search with last params
            Search.docs($routeParams, function (docs) {
            });
        }


        $scope.$on('bs.autocomplete.update', function (event, arg) {
            $scope.go();
            $scope.$apply()
        });



        //
        // use global scope to save the old location as referrer
        $rootScope.$watch( function () {
           return $location.url();
        }, function( newPath, oldPath ) {
           if( newPath !== oldPath ) {
                $scope.referrer = oldPath;
           } else {
                $scope.referrer = undefined;
           }
        });

        $rootScope.locateToReferrer=function() {
            console.log($location.url(),$scope.referrer)
            $location.url(($scope.referrer)?$scope.referrer:'/');
        }
    }
]);

/**
 * control actions with the page
 */
SearchModule.controller('ResultCtrl', [
    '$scope',
    '$route',
    '$routeParams',
    '$filter',
    '$timeout',
    '$location',
    'Search',
    'User',
    'Cart',
    'ProteinList',
    'flash',
    function ($scope, $route, $routeParams, $filter, $location, $timeout, Search, User, Cart, ProteinList, flash) {
        $scope.Search = Search;
        $scope.Cart = Cart;
        $scope.selectedResults = {};
        $scope.showCart = true;

        //
        // save to cart modal
        $scope.modal = { options: { edit: { title: 'Edit' }, create: { title: 'Create'} }, type:'create' };

        var self=this;

        this.search=function(params, cb) {
            Search.docs(params, function (results) {
                params.start = (!$routeParams.start) ? 0 : $routeParams.start;

                if ($routeParams.list) {
                    $scope.showCart = false;
                    _.each(results.docs, function (doc) {
                        $scope.selectedResults[doc.id] = true;
                    });
                } else {
                    _.each(results.docs, function (doc) {
                        if (Cart.inCart(doc.id))
                            $scope.selectedResults[doc.id] = true;
                    });
                }

                $scope.start = Search.result.offset >= Search.result.num ? 0 : Search.result.offset;
                $scope.rows = Search.result.rows;
                if (cb) cb(results);
            });
        }


        var params = _.clone($routeParams);


        if ($routeParams.cart) {
            $scope.showCart = false;
            delete params.cart;
            params.accs = Cart.getElements();
        }

        //
        //Set the current owner id, if there is a list
        if ($routeParams.list) {
            User.$promise.then(function(){
                params.listOwner = User.profile.username;
                self.search(params)
            })
        }


        //
        // run the default search here
        if (!$routeParams.list) {
            self.search(params)
        }





        $scope.change = function (docId) {
            var found = Cart.change(docId);

            if ($routeParams.list) {
                var list = {};
                list['accs'] = [docId];
                if (found == -1) ProteinList.addElements(User, $routeParams.list, [docId]);
                else ProteinList.removeElements(User, $routeParams.list, [docId]);
            }
        }


        $scope.emptyCart = function () {
            Cart.emptyCart();
            if (!$routeParams.list) $scope.selectedResults = [];
        }


        $scope.selectAll = function () {
            if ($routeParams.list) {
                ProteinList.getByIds(User, $routeParams.list, function (result) {
                    Cart.setCart(result.ids);
                    setAsSelected(result.ids);
                });
            } else if ($routeParams.cart) {
                // removed for now
            } else {
                Search.getIds(
                    {
                        entity: 'entry.json',
                        quality: Search.params.quality,
                        mode: Search.params.mode,
                        query: Search.params.query,
                        sparql: Search.params.sparql
                    }, function (docs) {
                        Cart.setCart(docs.ids);
                        setAsSelected(docs.ids);
                    });
            }
        }

        function setAsSelected(ids) {
            $scope.selectedResults = [];
            _.each(ids, function (id) {
                $scope.selectedResults[id] = true;
            });
        }

        $scope.unselectAll = function () {
            if ($routeParams.list) {
                ProteinList.getByIds(User, $routeParams.list, function (result) {
                    Cart.removeFromCart(result.ids);
                    setAsSelected(result.id);
                });
            } else if ($routeParams.cart) {
                // removed for now
            } else {
                Search.getIds(
                    {
                        entity: 'entry.json',
                        quality: Search.params.quality,
                        mode: Search.params.mode,
                        query: Search.params.query,
                        sparql: Search.params.sparql
                    }, function (docs) {
                        Cart.removeFromCart(docs.ids);
                        $scope.selectedResults = [];
                    });
            }
        }




        $scope.getResultTemplateByEntity = function () {
            switch (Search.params.entity) {
                case "publication.json":
                    return 'partials/search/result-publications.html';
                case "term.json":
                    return 'partials/search/result-terms.html';
                default:
                    return 'partials/search/result-proteins.html';
            }
        }

        $scope.getSortTemplateByEntity = function () {
            switch (Search.params.entity) {
                case "publication.json":
                    return 'partials/search/sort-publications.html';
                case "term.json":
                    return 'partials/search/sort-terms.html';
                default:
                    return 'partials/search/sort-proteins.html';
            }
        }

        //TODO deprecated
        function buildQuery(accessions) {
            return "id:" + (accessions.length > 1 ? "(" + accessions.join(" ") + ")" : accessions[0]);
        }

        // TODO deprecated
        $scope.getPublicationUrl = function (ac) {
            return "http://google.com/search?q=" + ac
        }


        $scope.affix = function (selector) {
            $(selector).affix()
        }

        $scope.launchModal = function (elem, action) {
            $scope.selected = {};
            angular.extend($scope.modal, { type: action});
        }


        $scope.saveModal = function (dismiss) {
            var proteinList = {
                name: $scope.selected.name,
                description: $scope.selected.description,
                accessions: Cart.getElements(),
                ownerId: 1
            };

            ProteinList.create(User, proteinList, function (data) {
                if (data.error) flash('alert-warning', data.error);
                else {
                    flash('alert-info', "List " + proteinList.name + " created.");
                }
            });
        }
    }
]);
