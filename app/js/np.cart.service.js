'use strict';

var CartService = angular.module('np.cart', []);

CartService.factory('Cart', ['$resource', '$http', 'config', function($resource, $http, config) {

	// var cartElements = [];
	// var cartSize = 0;

	//var selectedElements = [];
	var selectedElements = {};
	var selectedQueryParams;
	// var cartSize = 0;

	
	var Cart = function() { };
	
	// Cart.prototype.change = function(selection) {
		// cartElements = [];
		
		// for(var prop in selection) {
		// 	if(selection[prop])
		// 		cartElements.push(prop);
		// }
	// }

	Cart.prototype.change = function(docId) {
		if(_.has(selectedElements, docId)) {
			// selectedElements = _.without(selectedElements, docId);						
			selectedElements = _.omit(selectedElements, docId);
		} else {
			selectedElements[docId] = true;
			console.log('added: ', selectedElements);
			//selectedElements.push(docId);
		}
		// cartSize = _.keys(selectedElements).length;
		// console.log('cartSize: ', cartSize);
		//cartSize = selectedElements.length;
	}


	Cart.prototype.add = function(docId) {
		if(! _.has(selectedElements, docId))
			selectedElements[docId] = true;		

		// cartSize = selectedElements.length;
	}

	Cart.prototype.emptyCart = function() {
		selectedElements = {};
	}
	
	Cart.prototype.saveCart = function() {
		console.log('save cart');
	}
	
	Cart.prototype.getCartSize = function() {
		// return cartSize;
		return _.keys(selectedElements).length;
	}

	Cart.prototype.setCartSize = function(size) {
		cartSize = size;
	}

	Cart.prototype.getElements = function() {
		return selectedElements;
	}

	Cart.prototype.inCart = function(docId) {
		return _.has(selectedElements, docId);
	}
	
	Cart.prototype.setSelectedQueryParams = function(params) {
		this.selectedQueryParams = params;
	}

	var cart = new Cart();
	return cart;
}]);
