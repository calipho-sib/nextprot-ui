'use strict';

var CartService = angular.module('np.cart', ['np.user.protein.lists.service']);

CartService.factory('Cart', [
    'config',
    'flash',
    function (config, flash) {

        var elements;


        var Cart = function () {
            elements = sessionStorage.cart ? this.getCartFromStorage().elements : [];
        };


        // entry changes status ( selected => unselected ; unselected => selected; )
        Cart.prototype.change = function (docId) {
            var found = _.indexOf(elements, docId);

            // it was found so remove
            if (found != -1) {
                elements = _.without(elements, docId);
                flash("alert-info", docId + " successfully cleared from clipboard")
            } else {	// not found so add
                elements.push(docId);
                flash("alert-info", docId + " successfully added to clipboard")
            }

            this.saveCartToStorage();

            return found;
        };


        Cart.prototype.isInCart = function (docId) {
            return (_.indexOf(elements, docId) != -1);
        };

        Cart.prototype.getCartFromStorage = function () {
            return angular.fromJson(sessionStorage.cart);
        };

        Cart.prototype.saveCartToStorage = function () {
            sessionStorage.cart = angular.toJson({elements: elements});
        };

        Cart.prototype.setCart = function (docIds) {
            elements = _.union(elements, docIds);
            this.saveCartToStorage();
        };

        Cart.prototype.removeFromCart = function (docIds) {
            elements = _.difference(elements, docIds);
            this.saveCartToStorage();
        };

        Cart.prototype.getCartSize = function () {
            return elements.length;
        };

        Cart.prototype.emptyCart = function () {
            elements = [];
            this.saveCartToStorage();
        };

        Cart.prototype.getElements = function () {
            return elements;
        };

        Cart.prototype.inCart = function (id) {
            return elements.indexOf(id) != -1;
        };

        Cart.prototype.remove = function (id) {
            if (elements.length == 1)
                elements = [];
            else elements = elements.splice(id, 1);
        };

        var cart = new Cart();
        return cart;
    }]);

