'use strict';

//
//Define the search module (np.search)  for controllers, services and models
var SearchModule=angular.module('np.search', [
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

SearchModule.controller('SearchCtrl',[
   '$resource',
   '$scope',
   '$rootScope',
   '$location',
   '$routeParams',
   '$route',
   '$timeout',
   'Search', 
   'config', 
	function($resource, $scope, $rootScope, $location,$routeParams, $route, $timeout, Search, config) {
	 //
	 // scope from template
	 $scope.Search=Search;
	 $scope.config=config;
	 
	 $scope.cookies=function(session){
	 	Search.cookies(session)
	 	$timeout(function(){
	 		// must be called 2times??
	 		Search.cookies(session)
	 	}, 0)
	 }

	 //
	 // interact with the search bar
	 $scope.params=function(params, form){
	 	console.log(form);
	 	if (form&&!form.$valid)
	 		return;
	    angular.forEach(params, function(v, k) {
	      $location.search(k, v);
	    });
	 }

	 $scope.quality=function(name){
		Search.params.quality=name;
		$location.search('quality', (name!=='gold')?'gold-and-silver':null);
	 }
	 
	 
	 $scope.entity=function(params){
		 $location.search('start',null)
		$location.search('filter',null)
		$location.search('quality',null)
		$location.search('sort',null)
		$location.search('order',null)
		$location.path('/'+params.entity+'/search'+((Search.params.query)?'/'+Search.params.query:''));
	 }
	 
	 $scope.clean=function(){
	 	 $location.search('list', null)
		 $location.search('rows',null)
		 $location.search('start',null)
		 $location.search('order',null)
		 $location.search('cart',null)
		 $location.search('query',null)
		 $location.search('filter',null)
		 $location.search('quality',null)
		 $location.search('sort',null)
		 $location.path('/'+Search.config.entityMapping[Search.params.entity]+'/search');
		 console.log(Search.params)
	 }

	 $scope.toggle=function(params){
		$location.search('start',null)
	    angular.forEach(params, function(v, k) {
	    	var t=($location.search()[k] && $location.search()[k]===v)? null:v;
	    	$location.search(k,t)
	    });
	 }
 
	 $scope.active=function(value, key){
		 if(key){
			 return ($location.search()[key]===value)?' active  ':'';
		 }
		 
		 return ($location.path().indexOf(value)>-1)?' active  ':'';
		 
	 }
	 
	 $scope.didyoumean=function(index){
		 Search.params.query=Search.result.spellcheck.collations[index].collationQuery;
		 $scope.go();
	 }

	 $scope.moredetails=function(index) {

	 } 	 
	 
	 $scope.go=function(){
		 var url=$location.url();
		 $location.search('filter',null);
		 $location.search('list',null);
		 $location.search('cart',null);
		 $location.search('rows', null);
		 $location.search('start', null);
		 $location.path('/'+Search.config.entityMapping[Search.params.entity]+'/search').search('query',Search.params.query.trim());
		
		 //
		 // url has not changed => FIRE event
		 if ($location.url()===url){
			 $scope.reload();
		 }
	 }
	 
	 $scope.reload=function(){
		// restart search with last params
		Search.docs($routeParams, function(docs){
		});
	 }
	
	$scope.$on('bs.autocomplete.update',function(event, arg){
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
	'Search',
	'Cart',
	'ProteinListService',
	'flash',
	function($scope,$route,$routeParams,$filter, Search, Cart, ProteinListService, flash) {
		$scope.Search=Search;		
		$scope.Cart = Cart;
		$scope.selectedResults = {};
		$scope.showCart = true;


		var params = _.clone($routeParams);

			if($routeParams.cart) {
				$scope.showCart = false;
				delete params.cart;
				params.accs = Cart.getElements();
			}

		search(params, function(results) {

			if($routeParams.list) {
				$scope.showCart = false;						
				_.each(results.docs, function(doc) { $scope.selectedResults[doc.id] = true; });
			} else {
				_.each(results.docs, function(doc) { 
					if(Cart.inCart(doc.id))
						$scope.selectedResults[doc.id] = true; 
				});
			}
			
		});

		function search(params, cb) {
			Search.docs(params, function(results) {
				if(cb) cb(results);
			});
		}


		$scope.change = function(docId) {
			var found = Cart.change(docId);

			if($routeParams.list) {
				var list = {};
				list['accs'] = [docId];
				if(found == -1) ProteinListService.addElements('mario', $routeParams.list, [docId]);
				else ProteinListService.removeElements('mario', $routeParams.list, [docId]);
			}
		}


		$scope.emptyCart = function() {
			Cart.emptyCart();
			if(! $routeParams.list) $scope.selectedResults = [];
		}


		$scope.selectAll = function() {

			if($routeParams.list) {
				ProteinListService.getListIds('mario', $routeParams.list, function(result) {
					Cart.setCart(result.ids);
					setAsSelected(result.ids);
				});
			} else if($routeParams.cart) {
				// removed for now
			} else {
				Search.getIds(
				{ 
					entity: 'entry.json', 
					query: Search.params.query, 
					quality: Search.params.quality 
				}, function(docs) {
					Cart.setCart(docs.ids);
					setAsSelected(docs.ids);
				});		
			}
		}

		function setAsSelected(ids) {
			$scope.selectedResults = [];
			_.each(ids, function(id) { 
				$scope.selectedResults[id] = true; 
			});		
		}

		$scope.unselectAll = function() {
			console.log('unselect all!');	

			if($routeParams.list) {
				ProteinListService.getListIds('mario', $routeParams.list, function(result) {
					Cart.removeFromCart(result.ids);
					setAsSelected(result.id);
				});
			} else if($routeParams.cart) {
				// removed for now
			} else {
				Search.getIds(
				{ 
					entity: 'entry.json', 
					query: Search.params.query, 
					quality: Search.params.quality 
				}, function(docs) {
					Cart.removeFromCart(docs.ids);
					$scope.selectedResults = [];
				});			
			}
		}


		function buildQuery(accessions) {
			return "id:" + (accessions.length > 1 ? "(" + accessions.join(" ") + ")" : accessions[0]);
		}

		$scope.getResultTemplateByEntity=function(){
			 switch (Search.params.entity) {
		        case "publication.json":
		            return 'partials/search/result-publications.html';
		        case "term.json":
		            return 'partials/search/result-terms.html';
		        default:
		            return 'partials/search/result-proteins.html';
		    }			
		}

		$scope.getSortTemplateByEntity=function(){
			switch (Search.params.entity) {
		    	case "publication.json":
		            return 'partials/search/sort-publications.html';
		        case "term.json":
		            return 'partials/search/sort-terms.html';
		        default:
		            return 'partials/search/sort-proteins.html';
		    }						
		}


		$scope.getPublicationUrl=function(ac){
			return "http://google.com/search?q="+ac
		}


		$scope.affix=function(selector){
			$(selector).affix()
		}

		$scope.launchModal = function(elem, action) {
			$scope.selected = {};
			angular.extend($scope.modal, { type: action});
		}

		$scope.saveModal = function(dismiss) {
			var proteinList = { 
				name: $scope.selected.name, 
				description: $scope.selected.description, 
				accessions: Cart.getElements(), 
				ownerId: 1
			};

			ProteinListService.createList('mario', proteinList, function(data) { 
				if(data.error) flash('alert-warning', data.error);
				else flash('alert-info', "List "+proteinList.name+" created.");
			});
		}
	}
]);