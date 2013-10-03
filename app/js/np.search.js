'use strict';

//
//Define the search module (np.search)  for controllers, services and models
var SearchModule=angular.module('np.search', ['np.search.ui','np.search.service']);
var CartModule = angular.module('np.cart', ['np.cart.service']);
var ListModule = angular.module('np.lists', ['np.proteinlist.service']);

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
   'Search', 
   function($resource, $scope, $rootScope, $location,$routeParams, $route, Search){
	 //
	 // scope from template
	 $scope.Search=Search;
	 

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
		$location.search('filter',null)
		$location.search('quality',null)
		$location.search('sort',null)
		$location.path('/'+params.entity+'/search'+((Search.params.query)?'/'+Search.params.query:''));
	 }
	 
	 $scope.clean=function(){
		 $location.search('filter',null)
		 $location.search('quality',null)
		 $location.search('sort',null)
		 $location.path('/'+Search.params.entity+'/search');
	 }

	 $scope.toggle=function(params){
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
 		 Search.solrDetails(index, $routeParams, function(docs, solrParams){
		 });
		 
	 } 
	 
	 $scope.go=function(){
		 var url=$location.url();
		 $location.search('filter',null)
		 $location.path('/'+Search.params.entity+'/search/'+Search.params.query.trim());
		 
		 //
		 // url has not changed => FIRE event
		 if ($location.url()===url){
			 $scope.reload();
		 }
	 }
	 
	 $scope.reload=function(){
		// restart search with last params
		Search.solrDocs($routeParams, function(docs, solrParams){
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
		Search.solrDocs($routeParams, function(docs, solrParams){
		});

		
		$scope.getTemplateByEntity=function(){
			 switch (Search.params.entity) {
		        case "publications":
		            return 'partials/search/result-publications.html';
		        case "terms":
		            return 'partials/search/result-terms.html';
		        default:
		            return 'partials/search/result-proteins.html';
		    }			
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
			Cart.change($scope.selectedResults);
		}, true);
		
		
		$scope.selectAll = function() {
			$scope.unselectAll();
			
			for(var i=0; i<Search.result.docs.length; i++) {
				$scope.selectedResults[Search.result.docs[i].id] = true;
			}
		}
		
		$scope.unselectAll = function() {
			$scope.selectedResults = {};
		}
	
		
		$scope.launchModal = function(elem, action) {
			$scope.selected = {};
			angular.extend($scope.modal, { type: action});
		}
		
		$scope.saveModal = function(dismiss) {
//			var attrs = { name: $scope.selected.name, description: $scope.selected.description, accessions: _.keys($scope.selectedResults)};
//			
//			angular.extend(attrs, { username: 'mario'});
			var newList = { name: $scope.selected.name, description: $scope.selected.description, accessions: _.keys($scope.selectedResults)};
			
			var attrs = { username: 'mario', list: newList};
//			
			ProteinListService.createList(attrs, function(data) { });
		}
	}
]);

SearchModule.filter('split', function() {
    return function(input, split) {
        return input.split(split);
    }
});



