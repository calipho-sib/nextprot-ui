'use strict';


 
 
describe('SearchCtrl', function(){
    var scope, $httpBackend; 
 

	var test, onChange;


    //mock Application to allow us to inject our own dependencies
    beforeEach(angular.mock.module('np'));



    //mock the controller for the same reason and include $rootScope and $controller
    beforeEach(angular.mock.inject(function($rootScope, _$location_, $controller, _$httpBackend_){
        $httpBackend = _$httpBackend_;
        $httpBackend.when('GET','partials/search/result.html').respond("");
        //$httpBackend.when('GET', 'proteins/search/insulin?sort=gene').respond([]);
 
        //create an empty scope

    }));

    // tests start here
    it('map path proteins/search/insulin?sort=gene on Search.params ', function(){


		inject(function($route, $location, $rootScope, $controller) {
	        scope = $rootScope.$new();	        
			expect($route.current).toBeUndefined();
	        $location.url('/proteins/search/insulin?sort=gene');
	        $rootScope.$digest();
	        $controller('ResultCtrl', {$scope: scope, $routeParams:$route.current.params});


	    	//console.log("params", scope.Search.params)
	        expect(scope.Search.params.entity).toBe('proteins');
	        expect(scope.Search.params.sort).toBe('gene');
	        expect(scope.Search.params.query).toBe('insulin');
		});
    });

    it('map path publications/search/insulin?sort=gene on Search.params ', function(){
		inject(function($route, $location, $rootScope, $controller) {
	        scope = $rootScope.$new();	        
			expect($route.current).toBeUndefined();
	        $location.url('/publications/search/insulin?sort=gene&more=error');
	        $rootScope.$digest();
	        $controller('ResultCtrl', {$scope: scope, $routeParams:$route.current.params});


	    	//console.log("params", scope.Search.params)
	        expect(scope.Search.params.entity).toBe('publications');
	        expect(scope.Search.params.sort).toBe('gene');
	        expect(scope.Search.params.more).toBe('error');
	        expect(scope.Search.params.query).toBe('insulin');
		});
    });

    it('map path proteins/search/insulin?order=asc on Search.params', function() {
    	inject(function($route, $location, $rootScope, $controller) {
    		scope = $rootScope.$new();
    		expect($route.current).toBeUndefined();
    		$location.url('/proteins/search/insulin?order=asc');
    		$rootScope.$digest();
    		$controller('ResultCtrl', { $scope: scope, $routeParams: $route.current.params });

    		expect(scope.Search.params.order).toBe('asc');
    	});
    });

    it('map path proteins/search/insulin?rows=100 on Search.params', function() {
    	inject(function($route, $location, $rootScope, $controller) {
    		scope = $rootScope.$new();
    		expect($route.current).toBeUndefined();
    		$location.url('/proteins/search/insulin?rows=100');
    		$rootScope.$digest();
    		$controller('ResultCtrl', { $scope: scope, $routeParams: $route.current.params });

    		expect(scope.Search.params.rows).toBe('100');
    	});
    });

    it('fire button GO with publications/search/insulin?sort=gene ', function(){
		inject(function($route, $location, $rootScope, $controller) {
	        scope = $rootScope.$new();	        
			expect($route.current).toBeUndefined();
	        var url=$location.url('/publications/search/insulin?sort=gene&more=error').url();
	        $rootScope.$digest();
	        $controller('SearchCtrl', {$scope: scope, $routeParams:$route.current.params});
	        $controller('ResultCtrl', {$scope: scope, $routeParams:$route.current.params});

	        //
	        // testing fire button GO
			scope.go();
			expect(url).toBe($location.url())

		});
    });    

    it('toggle params (sort,foo,bar) publications/search/insulin?sort=gene ', function(){
		inject(function($route, $location, $rootScope, $controller) {
	        scope = $rootScope.$new();	        
			expect($route.current).toBeUndefined();
	        $location.url('/publications/search/insulin?sort=gene');
	        $rootScope.$digest();
	        $controller('SearchCtrl', {$scope: scope, $routeParams:$route.current.params});
	        $controller('ResultCtrl', {$scope: scope, $routeParams:$route.current.params});

	        expect(scope.Search.params.sort).toBe('gene');

	        //
	        // testing toggle
			scope.toggle({sort:scope.Search.params.sort,foo:'bar'});
			expect('/publications/search/insulin?foo=bar').toBe($location.url())
		});
    });    

    it('toggle sort=gene to sort=ac  publications/search/insulin?sort=gene ', function(){
		inject(function($route, $location, $rootScope, $controller) {
	        scope = $rootScope.$new();	        
			expect($route.current).toBeUndefined();
	        $location.url('/publications/search/insulin?sort=gene');
	        $rootScope.$digest();
	        $controller('SearchCtrl', {$scope: scope, $routeParams:$route.current.params});
	        $controller('ResultCtrl', {$scope: scope, $routeParams:$route.current.params});

	        expect(scope.Search.params.sort).toBe('gene');

	        //
	        // testing toggle
			scope.toggle({sort:'ac'});
			expect('/publications/search/insulin?sort=ac').toBe($location.url())
		});
    });      

    it('change entity from proteins/search/insulin?sort=gene ', function(){
		inject(function($route, $location, $rootScope, $controller) {
	        scope = $rootScope.$new();	        
			expect($route.current).toBeUndefined();
	        $location.url('/proteins/search/insulin?sort=gene');
	        $rootScope.$digest();
	        $controller('SearchCtrl', {$scope: scope, $routeParams:$route.current.params});
	        $controller('ResultCtrl', {$scope: scope, $routeParams:$route.current.params});


	        //
	        // testing entity
			scope.entity({entity:'publications'});
			expect('/publications/search/insulin').toBe($location.url())
		});
    });      


    it('clear search from proteins/search/insulin?sort=gene ', function(){
		inject(function($route, $location, $rootScope, $controller) {
	        scope = $rootScope.$new();	        
			expect($route.current).toBeUndefined();
	        $location.url('/proteins/search/insulin?sort=gene');
	        $rootScope.$digest();
	        $controller('SearchCtrl', {$scope: scope, $routeParams:$route.current.params});
	        $controller('ResultCtrl', {$scope: scope, $routeParams:$route.current.params});


	        //
	        // testing entity
			scope.clean();
			expect('/proteins/search').toBe($location.url())
		});
    });       
});