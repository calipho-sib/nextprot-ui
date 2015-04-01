(function (angular, undefined) {'use strict';


//
//Define the search module for controllers, services and models
angular.module('np.search', [
    'np.search.ui',
    'np.search.service',
    'np.cart',
    'np.user.protein.lists'
]).config(searchConfig)
  .controller('SearchCtrl',SearchCtrl)
  .controller('ResultCtrl',ResultCtrl);

//
//define routes for simple Search
searchConfig.$inject=['$routeProvider','$locationProvider','$httpProvider']
function searchConfig($routeProvider, $locationProvider, $httpProvider) {
    // List of routes of the application
    $routeProvider
        .when('/search', {templateUrl: 'partials/search/result.html'})
        .when('/search/:query', {templateUrl: 'partials/search/result.html'})
        .when('/:entity/search', {templateUrl: 'partials/search/result.html'})
        .when('/:entity/search/:query', {templateUrl: 'partials/search/result.html'});
};

//
// implement main application controller
SearchCtrl.$inject=['$resource','$scope','$rootScope','$location', '$filter', '$routeParams','$route','$window','$timeout','Search','Cart','config','user','flash', 'userProteinList', 'queryRepository', 'exportService'];
function SearchCtrl($resource, $scope, $rootScope, $location, $filter, $routeParams, $route, $window, $timeout, Search, Cart, config, user, flash, userProteinList, queryRepository, exportService) {

    // scope from template
    $scope.Search = Search;
    $scope.config = config;
    $scope.user = user;
    $scope.export = exportService;

    $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        autofocus:true,
        readOnly: false,
        mode: 'sparql'
    };


    //
    // update entity documentation on path change
    $scope.$on('$routeChangeSuccess', function(event, next, current) {

        exportService.reset();

        if ($routeParams.queryId) {
            queryRepository.getQueryByPublicId($routeParams.queryId).then(function (query) {
                Search.params.sparql = "#" + query.title + "\n";
                Search.params.sparql += query.sparql;
                exportService.userQuery = query;
            });
        } else if ($routeParams.listId) {
            userProteinList.getListByPublicId($routeParams.listId).then(function (list) {
                exportService.userList = list;

                var button = angular.element('#main-clipboard-button');

                // button is clicked is delayed (waiting for end of $digest progress)
                $timeout(function() {

                    button.click();
                })
            });

        } else if ($routeParams.query){
            exportService.searchQuery = $routeParams.query;
            $scope.currentSearch = $routeParams.query;
        }

        if($location.path()==='/'){
            $window.document.title = "neXtProt Search";
            $scope.reset();
            Search.clear();
        }

        gaTrackPageView();
    });

    function gaTrackPageView() {

        var output = $location.path()+"?";
        angular.forEach($routeParams, function(value,key){
            output += key + "=" + value + "&";
        });
        output=output.substr(0,output.length-1);

        console.log("*** gaTrackPageView:", output);

        $window._gaq.push(['_trackPageview', output]);
    }

    //
    // load profile on init
    user.me();

    // $scope.AdvancedQueryService = AdvancedQueryService;

    $scope.navClass = function (page) {
        var currentRoute = $location.path().substring(1) || 'home';
        return page === currentRoute ? 'active' : '';
    };

    /*$scope.cookies = function (session) {
        Search.cookies(session)
        $timeout(function () {
            // must be called 2times??
            Search.cookies(session)
        }, 0)
    }*/

    $scope.login = function() {
        var currentUrl = $location.url();
        $location.url("/"); //need to go to context path since the callback is handled only in context path

        user.login(function(err){
          if(err){
            flash('alert-error', "Ooops an error occured with your login");
          }else {
            flash('alert-info', "Welcome " + user.profile.name);
            $location.url(currentUrl);
          }
        });

    }

    $scope.logout = function () {
        $scope.reset();
        user.logout();
        $location.url("/");
        flash('alert-info', "You have successfully logged out!");
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
        if(mode != $location.search("mode")){

            $location.search('query', null)
            $location.search('sparql', null)
            $scope.toggle(mode)
            if(mode.mode){
                $location.path('/proteins/search')
            }

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
        $location.search('queryId', null)
        $location.search('filter', null)
        $location.search('quality', null)
        $location.search('sort', null)
        $location.search('order', null)
        $location.path('/' + Search.config.entityMapping[Search.params.entity] + '/search');

        Search.params.sparql = ""; //This is needed only when the user is in this page proteins/search?mode=advanced and he has typed something and has clean (otherwise it is driven by the url)
    }

    $scope.reset=function(){
        $location.search({})
    }

    $scope.toggle = function (params) {

        Cart.emptyCart();

        $location.search('start', null)
        angular.forEach(params, function (v, k) {
            var t = ($location.search()[k] && $location.search()[k] === v) ? null : v;
            $location.search(k, t)
        });
    }



    $scope.goToUser = function (resourceType) {

        Cart.emptyCart();

        if(!user.isAnonymous()){
            if(resourceType == "lists"){
                $location.url("/user/protein/lists");
            }else  if(resourceType == "queries"){
                $location.url("/user/queries");
            }

            }else {
            flash("alert-warning", "Please login to access your " + resourceType + ".")
        }
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
        $location.search('listId', null);
        $location.search('list', null);
        $location.search('cart', null);
        $location.search('rows', null);
        $location.search('start', null);
        $location.search('queryId', null);

        // 1) Each time a new search is run, the basket (entries selected) should be emptied
        // 2) Each time a list content is displayed, the basket (entries selected) should be emptied
        Cart.emptyCart();

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
        //console.log($location.url(),$scope.referrer)
        $location.url(($scope.referrer)?$scope.referrer:'/');
    }
};


//
// implement search result controller
ResultCtrl.$inject=['$scope','$modal', '$route','$routeParams','$filter','$timeout','$location','Search','user','Cart','userProteinList','flash', 'exportService', 'queryRepository'];
function ResultCtrl($scope, $modal, $route, $routeParams, $filter, $location, $timeout, Search, user, Cart, userProteinList, flash, exportService, queryRepository) {
    $scope.Search = Search;
    $scope.Cart = Cart;
    $scope.selectedResults = [];
    $scope.showCart = true;

    //
    // save to cart modal
    $scope.modal = { options: { edit: { title: 'Edit' }, create: { title: 'Create'} }, type:'create' };

    var self=this;

    this.search = function (params, cb) {
        if ($routeParams.queryId) {
            queryRepository.repository.show = false;
        }

        Search.docs(params, function (results) {

                params.start = (!$routeParams.start) ? 0 : $routeParams.start;
                if ($routeParams.listId) {
                    $scope.showCart = true;
                    /*_.each(results.docs, function (doc) {
                        $scope.selectedResults[doc.id] = true;
                    });*/
                } else {
                    _.each(results.docs, function (doc) {
                        if (Cart.inCart(doc.id))
                            $scope.selectedResults[doc.id] = true;
                    });
                }

                $scope.start = Search.result.offset >= Search.resultCount ? 0 : Search.result.offset;
                $scope.rows = Search.result.rows;
                if (cb) cb(results);
            });
    }


    var params = _.clone($routeParams);


    if ($routeParams.cart) {
        //$scope.showCart = false;
        delete params.cart;
        params.accs = Cart.getElements();
    }

    //
    //Set the current owner id, if there is a list
    if ($routeParams.listId) {
        user.$promise.then(function(){
            params.listOwner = user.profile.username;
            self.search(params)
        })
    }


    //
    // run the default search here
    if (!$routeParams.listId) {
        self.search(params)
    }


    $scope.change = function (docId) {
        var found = Cart.change(docId);

        if ($routeParams.cart) {
            $route.reload();
        }

            /*
            if ($routeParams.listId) {
                var list = {};
                list['accs'] = [docId];
                if (found == -1) userProteinList.addElements(user, $routeParams.listId, [docId]);
                else userProteinList.removeElements(user, $routeParams.listId, [docId]);
            }*/
    }



    $scope.isInCart = function (docId) {
        return Cart.isInCart(docId);
    }


    $scope.emptyCart = function () {
        Cart.emptyCart();
        if (!$routeParams.listId) $scope.selectedResults = [];
    }


    $scope.addAllToBasket = function () {

        if ($routeParams.listId) {

            userProteinList.getListByPublicId($routeParams.listId).then(
                function (result) {

                    Cart.setCart(result.accessionNumbers);
                    setAsSelected(result.accessionNumbers);
                },
                function(error){
                    flash(error);
                }
            );
        } else {
            Search.getIds(
                {
                    entity: 'entry.json',
                    quality: Search.params.quality,
                    mode: Search.params.mode,
                    query: Search.params.query,
                    sparql: Search.params.sparql,
                    filter: Search.params.filter
                }, function (docs) {
                    Cart.setCart(docs.ids);
                    setAsSelected(docs.ids);
                    flash("alert-info", docs.ids.length + " entries added to clipboard");
                });
        }
    }

    function setAsSelected(ids) {
        $scope.selectedResults = [];
        _.each(ids, function (id) {
            $scope.selectedResults[id] = true;
        });
    }

    $scope.setExportParameters = function (identifier) {
        if (identifier) { //export an entry
            exportService.setExportEntry(identifier);
        } else {
            exportService.setExportParameters($routeParams);
        }
    }

    $scope.removeAllFromBasket = function () {

        var cartSize = Cart.getCartSize();

        if ($routeParams.listId) {

            userProteinList.getListByPublicId($routeParams.listId).then(
                function (result) {

                    Cart.removeFromCart(result.accessionNumbers);
                    $scope.selectedResults = [];
                },
                function (error) {
                    flash(error);
                });
        } else if ($routeParams.cart) {
            Cart.emptyCart();
            $route.reload();
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
                    flash("alert-info", cartSize + " entries removed from clipboard");
                });
        }
    }

    $scope.toggleAllToBasket = function () {

        if (Cart.getCartSize() < Search.resultCount) {
            $scope.addAllToBasket();
        }else {
            $scope.removeAllFromBasket();
        }
    };

    $scope.inverseBasketSelection = function () {

        alert("not yet implemented");
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

    $scope.affix = function (selector) {
        $(selector).affix()
    }



    $scope.launchModalList = function (elem, action) {
        if(!user.isAnonymous()){

            $scope.selected = {};
            angular.extend($scope.modal, { type: action});

            var proteinListModal = $modal({scope: $scope.$new(), template: 'partials/user/user-protein-lists-modal.html', show: true});
            //proteinListModal.$promise.then(proteinListModal.show);
        } else {
            flash('alert-warning', 'Please login to save a list');
        }
    }


    $scope.saveModal = function () {

        var proteinList = {
            name: $scope.selected.name,
            description: $scope.selected.description,
            accessions: Cart.getElements(),
            ownerId: 1
        };

        userProteinList.create(user, proteinList).$promise.then(
            function () {
                flash('alert-success', "List " + proteinList.name + " successfully created.");
            }, function(error)  {
                flash('alert-warning', error.data.message);
            }
        );
    }
};

})(angular);
