'use strict';


var SearchUI=angular.module('np.search.ui', []);

SearchUI.directive('version', ['config', function(config) {
    return function(scope, elm, attrs) {
      elm.text(config.version);
    };
  }]);



SearchUI.directive('toggle', [function () {
	  return function (scope, elm, attrs) {
		elm.click(function(){
			angular.element(attrs.toggle).toggleClass("hide")			
		})
	  };
	}]);

SearchUI.directive('btAutocomplete', ['Search',function (Search) {
	  var items=[];

	  
	  return function (scope, elm, attrs) {
		  function extractor(query) {
			    var result = /([^ ]+)$/.exec(query);
			    if(result && result[1])
			        return result[1].trim();
			    return '';
		  }		  
		  elm.typeahead({
			 	minLength: 3,
			    source: function (query, process) {
					Search.solrSuggest(query, function(docs, solrParams){
//						var facets=docs.facet_counts.facet_fields.text;
//						items=[];for (var i=0; i<facets.length; i=i+2) {
//							items.push(facets[i])
//						}
//						return process(items)
					});
				},
				matcher:function (item) {
					return true;
				},
				updater:function(item){
					Search.params.query=this.$element.val().replace(/[^ ]*$/,'')+item+' '
					return Search.params.query;
			    },
			    highlighter: function (item) {
			        var query = extractor(this.query).replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
			        return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
			          return '<strong>' + match + '</strong>'
			        })
			   }			    
							    	
		 });  
	  };
	}]);

SearchUI.directive('jqAutocomplete', ['Search',function (Search) {
	  var results=[];
	  return function (scope, elm, attrs) {		  
		  elm.autocomplete({
		  	select: function( event, ui ) { 
		  		var words=Search.params.query.split(/[\s,]+/);
		  		words[words.length-1]=ui.item.value;
		  		Search.params.query=ui.item.value=words.join(' ');
		  	}, 
		  	minLength: 2,
		    source: function(request, response) {
		  		Search.solrSuggest(request.term, function(docs, solrParams){
		  			var facets=docs.facet_counts.facet_fields.text;
		  			results=[];
		  			for (var i=0; i<facets.length; i=i+2) {
		  				results.push({"label":facets[i], "count":facets[i+1], "value":facets[i]});
		  			}
		  			//console.log('solr',results,solrParams.q,solrParams )
		  			return response(results)
		  		});
		    }
		  })		  
	  };
	}]);


SearchUI.directive('slideOnClick', ['$parse','$timeout', function($parse, $timeout) {
	  return function(scope, element, attr) {
	      $timeout(function(){
	        var e=angular.element(attr['slideOnClick']);
	        if(e.length){
	          element.toggle(function(){
	            e.slideDown();
	          },
	          function(){
	            e.slideUp();
	          })
	        }
	      },100);
	  }
	}]);

SearchUI.directive('npAffix', ['$parse','$timeout', function($parse, $timeout) {
	  return function(scope, element, attr) {
	      $timeout(function(){
	        element.affix({offset: attr['npAffix']});
	      },0);
	  }
	}]);

