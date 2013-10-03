'use strict';

 
describe('np.config', function(){
 
    beforeEach(angular.mock.module('np.config'));


    // tests start here
    it('test solr port ', angular.mock.inject(function(config) {
    	expect(config.solr.SOLR_PORT).toBe(":8985");
    }));
    it('test config structure ', angular.mock.inject(function(config) {
    	expect(config.solr.core.publications).toBeDefined();;
    	expect(config.solr.core.proteins).toBeDefined();;
    	expect(config.solr.core.terms).toBeDefined();;
    	expect(config.solr.ontology).toBeDefined();;
    }));
});