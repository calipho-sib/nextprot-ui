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
function($resource, $scope, $rootScope, $location,$routeParams, $route, $timeout, Search, config){
	 //
	 // scope from template
	 $scope.Search=Search;
	 $scope.config=config;
	 
	 $scope.cookies=function(session){
	 	Search.cookies(session)
	 	$timeout(function(){
	 		// must be called 2times??
	 		Search.cookies(session)
	 	},0)
	 	
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

	 $scope.moredetails=function(index){

		 
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
		$scope.showCart = true;
		$scope.modal = {};
		
		// update solr search
		Search.docs($routeParams, function(docs){
		});

		
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

		$scope.getRowsTemplate = function () {
			return 'partials/search/rows.html';
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

		$scope.getOrderTemplate = function() {
			return 'partials/search/order.html'
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
		
		$scope.$watch('selectedResults', function() { 
			
			// Cart.change($scope.selectedResults);
		}, true);
		
		
		$scope.selectAll = function() {
			Cart.emptyCart();

			console.log('docs: ', Search.result.num);

			// for(var i=0; i<Search.result.docs.length; i++) {
			// 	Cart.add(Search.result.docs[i].id);
			// }
		}
		
		$scope.unselectAll = function() {
			//$scope.selectedResults = {};
			Cart.emptyCart();
		}
	
		
		$scope.launchModal = function(elem, action) {
			$scope.selected = {};
			angular.extend($scope.modal, { type: action});
		}
		
		$scope.saveModal = function(dismiss) {
			// var proteinList = { name: $scope.selected.name, description: $scope.selected.description, accessions: _.keys($scope.selectedResults), ownerId: 1};
			var proteinList = { name: $scope.selected.name, description: $scope.selected.description, accessions: Cart.getElements(), ownerId: 1};
			
			ProteinListService.createList('mario', proteinList, function(data) { });
		}
	}
]);

SearchModule.filter('split', function() {
    return function(input, split) {
        return input.split(split);
    }
});



