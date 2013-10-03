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
	
	Cart.prototype.change = function(selection) {
		cartElements = [];
		
		for(var prop in selection) {
			if(selection[prop])
				cartElements.push(prop);
		}
	}
	
	Cart.prototype.addToCart = function(selection) {
		console.log('add to cart: ', selection);
		
		for(var prop in selection) {
			if(selection[prop] && !_.contains(cartElements, prop))
				cartElements.push(prop);
		}
		
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
	
	var cart = new Cart();
	return cart;
}]);
