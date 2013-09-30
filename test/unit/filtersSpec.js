'use strict';

/* jasmine specs for filters go here */

describe('config', function() {
  beforeEach(module('np.config'));


  describe('interpolate', function() {
    beforeEach(module(function($config) {
    	dump($config)
    }));


    it('should replace VERSION', inject(function(interpolateFilter) {
    }));
  });
});
