'use strict';

 
describe('np.config', function(){
 
    beforeEach(angular.mock.module('np.config'));


    // tests start here
    it('test solr port ', angular.mock.inject(function(config) {
    	expect(config.api.API_PORT).toBe(":8985");
    }));
    it('test config structure ', angular.mock.inject(function(config) {
    	expect(config.api.core.publications).toBeDefined();;
    	expect(config.api.core.proteins).toBeDefined();;
    	expect(config.api.core.terms).toBeDefined();;
    	expect(config.api.ontology).toBeDefined();;
    }));
});