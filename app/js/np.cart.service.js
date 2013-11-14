'use strict';

var CartService = angular.module('np.cart', []);

CartService.factory('Cart', [
	'$resource', 
	'$http', 
	'config', 
	function($resource, $http, config) {

	var cartElements = [];
	
	var Cart = function() {
		
	};
	
	// Cart.prototype.change = function(selection) {
		// cartElements = [];
		
		// for(var prop in selection) {
		// 	if(selection[prop])
		// 		cartElements.push(prop);
		// }
	// }

	Cart.prototype.change = function(docId) {
		if(_.contains(cartElements, docId)) {
			cartElements = _.without(cartElements, docId);
		} else {
			cartElements.push(docId);
		}
	}

	Cart.prototype.addToCart = function(selection) {
		for(var prop in selection) {
			if(selection[prop] && !_.contains(cartElements, prop))
				cartElements.push(prop);
		}
		
	}

	Cart.prototype.add = function(docId) {
		cartElements.push(docId);
	}
	
	Cart.prototype.emptyCart = function() {
		cartElements = [];
	}
	
	Cart.prototype.saveCart = function() {
		console.log('save cart');
	}
	
	Cart.prototype.cartSize = function() {
		return cartElements.length;
	}

	Cart.prototype.getElements = function() {
		return cartElements;
	}
	
	var cart = new Cart();
	return cart;
}]);
