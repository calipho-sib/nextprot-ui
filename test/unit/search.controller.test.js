'use strict';


 
 
describe('SearchCtrl', function(){
    var scope, $httpBackend; 
 
    //mock Application to allow us to inject our own dependencies
    beforeEach(angular.mock.module('np'));

    //mock the controller for the same reason and include $rootScope and $controller
    beforeEach(angular.mock.inject(function($rootScope, $controller, _$httpBackend_){
        $httpBackend = _$httpBackend_;
        $httpBackend.when('GET', 'proteins/search/insulin?sort=gene').respond([]);
 
        //create an empty scope
        scope = $rootScope.$new();
        //declare the controller and inject our empty scope
        $controller('SearchCtrl', {$scope: scope});
    }));

    // tests start here
    it('proteins/search/insulin?sort=gene should be mapped on Search.params ', function(){
    	//console.log(scope.Search.params)
        expect(scope.Search);
        expect(scope.Search.params.entity).toBe('proteins');
    });
});