'use strict';


var AdvancedUI=angular.module('np.advanced.ui', []);


AdvancedUI.filter('sparqlEncode', function() {
    return function(input) {
        if (!input ||!input.length )
            return '';
        return (encodeURIComponent(input));
    }

});

