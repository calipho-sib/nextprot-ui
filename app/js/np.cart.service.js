'use strict';

var CartService = angular.module('np.cart', []);

CartService.factory('Cart', ['$resource', '$http', 'config', function($resource, $http, config) {

	// var cartElements = [];
	// var cartSize = 0;

	//var selectedElements = [];
	var selectedElements;
	var selectedQueryParams;

	
	var Cart = function() { 
		selectedElements = sessionStorage.cart ? this.getLocal() : {};
	};
	
	Cart.prototype.change = function(docId) {
		if(_.has(selectedElements, docId)) 
			selectedElements = _.omit(selectedElements, docId);
		else selectedElements[docId] = true;

		this.saveLocal(selectedElements);
	}


	Cart.prototype.saveLocal = function(selectedElements) {
		sessionStorage.cart = angular.toJson(selectedElements);
	}

	Cart.prototype.getLocal = function() {
		return angular.fromJson(sessionStorage.cart);
	}


	Cart.prototype.add = function(docId) {
		if(! _.has(selectedElements, docId))
			selectedElements[docId] = true;		
	}

	Cart.prototype.emptyCart = function() {
		selectedElements = {};
	}
	
	Cart.prototype.saveCart = function() {
		console.log('save cart');
	}
	
	Cart.prototype.getCartSize = function() {
		return this.getAccessions().length;
	}

	Cart.prototype.setCartSize = function(size) {
		cartSize = size;
	}

	Cart.prototype.getElements = function() {
		return selectedElements;
	}

	Cart.prototype.getAccessions = function() {
		return _.keys(selectedElements);
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
