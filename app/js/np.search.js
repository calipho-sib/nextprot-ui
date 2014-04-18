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
    'UserService',
    'AdvancedQueryService',
    'flash',
    function ($resource, $scope, $rootScope, $location, $routeParams, $route, $timeout, Search, config, UserService, AdvancedQueryService, flash) {


        // scope from template
        $scope.Search = Search;
        $scope.config = config;
        $scope.user = UserService;

        $scope.editorOptions = {
            lineWrapping : false,
            lineNumbers: true,
            readOnly: false,
            mode: 'sparql'
        };

        $scope.AdvancedQueryService = AdvancedQueryService;

        $scope.cookies = function (session) {
            Search.cookies(session)
            $timeout(function () {
                // must be called 2times??
                Search.cookies(session)
            }, 0)
        }

        $scope.setAdvancedUserQuery = function (sparql) {
            $scope.advancedUserQuery = sparql;
        }

        $scope.logout = function () {
            UserService.logout(function () {
                    gapi.auth.signOut();
                    flash('alert-info', "Successfully logged out ");
            });
        }

        //
        // interact with the search bar
        $scope.params = function (params, form) {
            console.log(form);
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

        $scope.clean = function () {
            $location.search('list', null)
            $location.search('rows', null)
            $location.search('start', null)
            $location.search('order', null)
            $location.search('cart', null)
            $location.search('query', null)
            $location.search('filter', null)
            $location.search('quality', null)
            $location.search('sort', null)
            $location.path('/' + Search.config.entityMapping[Search.params.entity] + '/search');
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

        $scope.isAdvancedMode = function () {
            return Search.params.mode == 'advanced';
        }

        $scope.go = function () {
            var url = $location.url();
            $location.search('filter', null);
            $location.search('list', null);
            $location.search('cart', null);
            $location.search('rows', null);
            $location.search('start', null);

            //Advanced mode
            if ($scope.isAdvancedMode()) {
                $location.path('/proteins/search').
                    search('sparqlTitle', 'whatever title').
                    search('sparqlEngine', 'Jena').
                    search('sparql', AdvancedQueryService.currentSparql);
            } else {
                //We are in simple mode
                $location.path('/' + Search.config.entityMapping[Search.params.entity] + '/search').search('query', Search.params.query.trim());
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

        // can be advanced or simple mode
        $scope.toogleSearchMode = function () {

            if(Search.params.mode == 'advanced')
                Search.params.mode = 'simple';
            else Search.params.mode = 'advanced';

            //$location.search('mode', (mode == 'advanced') ? 'advanced' : null);

            if(UserService.userProfile.userLoggedIn){
                $scope.expertMode = !$scope.expertMode;
                if($scope.expertMode){
                    flash('alert-info', 'Switched to expert search.')
                }else flash('alert-info', 'Switched to simple search.')

            }else {
                var message = "You must be logged in to use the expert mode.";
                flash('alert-warn', message);
            }
        }

        $scope.$on('bs.autocomplete.update', function (event, arg) {
            $scope.go();
            $scope.$apply()
        });
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
    'Cart',
    'ProteinListService',
    'UserService',
    'flash',
    function ($scope, $route, $routeParams, $filter, $location, $timeout, Search, Cart, ProteinListService, UserService, flash) {
        $scope.Search = Search;
        $scope.Cart = Cart;
        $scope.selectedResults = {};
        $scope.showCart = true;



        var params = _.clone($routeParams);

        if ($routeParams.sparql) {
            console.log('routes' + $routeParams.sparql);
        }

        if ($routeParams.cart) {
            $scope.showCart = false;
            delete params.cart;
            params.accs = Cart.getElements();
        }

        //Set the current owner id, if there is a list
        if ($routeParams.list) {
            //TODO will not work if the page is full refreshed because of the userprofile not being
//            while(!UserService.isUserProfileLoaded()){
//                $timeout(true == true, 100);
//            }

            params.listOwner = UserService.userProfile.username;

//            UserService.$promise.then(function(user){
                search(params)
//            })

        }


        //
        // run the default search here
        if (!$routeParams.list) {
            search(params)
        }


        function search(params, cb) {
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
                console.log("---------------------",results.docs)
                if (cb) cb(results);
            });
        }


        $scope.change = function (docId) {
            var found = Cart.change(docId);

            if ($routeParams.list) {
                var list = {};
                list['accs'] = [docId];
                if (found == -1) ProteinListService.addElements(UserService.userProfile.username, $routeParams.list, [docId]);
                else ProteinListService.removeElements(UserService.userProfile.username, $routeParams.list, [docId]);
            }
        }


        $scope.emptyCart = function () {
            Cart.emptyCart();
            if (!$routeParams.list) $scope.selectedResults = [];
        }


        $scope.selectAll = function () {
            if ($routeParams.list) {
                ProteinListService.getListIds(UserService.userProfile.username, $routeParams.list, function (result) {
                    Cart.setCart(result.ids);
                    setAsSelected(result.ids);
                });
            } else if ($routeParams.cart) {
                // removed for now
            } else {
                Search.getIds(
                    {
                        entity: 'entry.json',
                        query: Search.params.query,
                        quality: Search.params.quality
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
                ProteinListService.getListIds(UserService.userProfile.username, $routeParams.list, function (result) {
                    Cart.removeFromCart(result.ids);
                    setAsSelected(result.id);
                });
            } else if ($routeParams.cart) {
                // removed for now
            } else {
                Search.getIds(
                    {
                        entity: 'entry.json',
                        query: Search.params.query,
                        quality: Search.params.quality
                    }, function (docs) {
                        Cart.removeFromCart(docs.ids);
                        $scope.selectedResults = [];
                    });
            }
        }


        function buildQuery(accessions) {
            return "id:" + (accessions.length > 1 ? "(" + accessions.join(" ") + ")" : accessions[0]);
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

            ProteinListService.createList(UserService.userProfile.username, proteinList, function (data) {
                if (data.error) flash('alert-warning', data.error);
                else {
                    flash('alert-info', "List " + proteinList.name + " created.");
                }
            });
        }
    }
]);