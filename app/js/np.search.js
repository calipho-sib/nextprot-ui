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
	 $scope.params=function(params){
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
		$location.path('/'+params.entity+'/search'+((Search.params.query)?'/'+Search.params.query:''));
	 }
	 
	 $scope.clean=function(){
		 $location.search('start',null)
		 $location.search('filter',null)
		 $location.search('quality',null)
		 $location.search('sort',null)
		 $location.path('/'+Search.config.entityMapping[Search.params.entity]+'/search');
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
		 $location.search('filter',null)
		 $location.path('/'+Search.config.entityMapping[Search.params.entity]+'/search/'+Search.params.query.trim());
		 
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
	function($scope,$route,$routeParams,$filter, Search, Cart, ProteinListService) {
		//
		// scope from template
		$scope.Search=Search;		
		$scope.Cart = Cart;
		$scope.selectedResults = {};
		$scope.allSelected = false;
		$scope.showCart = true;
		$scope.modal = {};
		

		// init
		if(_.has($routeParams, "list")) {
			console.log('open list: ', $routeParams.list);
			ProteinListService.getList('mario', $routeParams.list, function(list) {

				var params = { username: 'mario', action: 'results' };

				angular.extend(params, $routeParams);

				console.log('params: ', params);

				ProteinListService.getListResults(params, function(docs) {
					Search.setResults(docs);
				});

			});

			
		} else {
				// update solr search
			Search.docs($routeParams, function(results){
				$scope.selectedResults = [];

				_.map(results.docs, function(doc) { 
					if(Cart.inCart(doc.id)) {
						var key = doc.id;
						$scope.selectedResults[key] = true;
					} 
				});
			});
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
		
		$scope.saveCart = function() {
			Cart.saveCart();
		}
		
		$scope.emptyCart = function() {
			$scope.unselectAll();
			Cart.emptyCart();
		}
		
		$scope.selectDoc = function(docId) {
			Cart.change(docId);
		}

		// $scope.$watch('selectedResults', function() { 
		// 	console.log('selected: ', $scope.selectedResults);
		// 	// Cart.change($scope.selectedResults);
		// 	Cart.change(doc.id);
		// }, true);
		
		
		$scope.selectAll = function() {
			Cart.emptyCart();

			console.log('params: ', $routeParams);

			var params = $routeParams;

			if(_.has(params, 'list')) {
				console.log('LIST!');

				ProteinListService.getListIds('mario', params.list, function(result) {
					console.log('result: ', result);
					setInCart(result.ids);

				});

			} else {
				console.log('NOT LIST!');
				Search.getIds({ entity: 'entry', query: params.query }, function(docs) {
					setInCart(docs.ids);
				});
			}

		}
		
		function setInCart(ids) {
			_.map(ids, function(id) { 
				$scope.selectedResults[id] = true;  
				Cart.add(id);
			});	
		}

		$scope.unselectAll = function() {
			Cart.emptyCart();
			$scope.selectedResults = {};
		}
	
		
		$scope.launchModal = function(elem, action) {
			$scope.selected = {};
			angular.extend($scope.modal, { type: action});
		}
		
		$scope.saveModal = function(dismiss) {
			var proteinList = { 
				name: $scope.selected.name, 
				description: $scope.selected.description, 
				accessions: _.keys(Cart.getElements()), 
				ownerId: 1
			};

			ProteinListService.createList('mario', proteinList, function(data) { });
		}
	}
]);

SearchModule.filter('split', function() {
    return function(input, split) {
        return input.split(split);
    }
});



