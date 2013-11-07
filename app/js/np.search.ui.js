'use strict';


var SearchUI=angular.module('np.search.ui', []);


SearchUI.filter('has', function() {
	return function(input, filter) {
		if (!input || !filter||!input.length ||!filter.length)
			return 'no';
		return (input.indexOf(filter)>-1)?'yes':'no';
	}
});

SearchUI.filter('limit', function() {
	return function(input, max) {
		if(!input)return;
		if(!max)max=200;
		return (input.substring(0,max)+' ...');
	}
});

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


//
// autocomplete with customized bootstrap typeahead
// https://github.com/twbs/bootstrap/blob/v2.3.2/js/bootstrap-typeahead.js
SearchUI.directive('bsAutocomplete', ['Search','$timeout',function (Search, $timeout) {
	  var items=[];


	  
	  return function (scope, element, attrs) {
	  	  var lstQuery=""
		  element.typeahead({
			 	minLength: 2,
			    source: function (query, process) {
					Search.suggest(query, function(items){
						return process(items)
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

        		  // this.query: insulin rec
        		  // items: receptor, recurrent, receptors, recruitment, receptormediated
        		  // query: insulin\ rec
        		  // result:  insulin <b>rec</b><gray>eptormediated</gray>
        		  var words =this.query.split(' ');
        		  var complete=item.split(words[words.length-1]);
			      var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
        		  var replaced=this.query.replace(new RegExp("(.*)("+words[words.length-1]+")([^ ]*)",'ig'),function(m, p1, p2,p3){
        		  	var hi=(complete.length)?complete[complete.length-1]:'';
        		  	return "<span class='gray'>"+p1+"</span><span class='gray'>"+p2+"</span><strong class='gray2'>"+hi+p3+"</strong>"
        		  })

			      //var s=item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
			      //  return '<strong>' + match + '</strong>'
			      //})
        		  //console.log(r1, "(.*)("+words[words.length-1]+")([^ ]*)")

			      return replaced;
		        } 			    	    
							    	
		 });  
	      // Bootstrap override
	      var typeahead = element.data('typeahead');
	      // Fixes #2043: allows minLength of zero to enable show all for typeahead
	      typeahead.lookup = function(ev) {
	        var items, words;
	        this.query = this.$element.val() || '';
	        words= this.query.split(' ');

	        if (this.query.length < this.options.minLength) {
	          return this.shown ? this.hide() : this;
	        }
	        items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source;
	        return items ? this.process(items) : this;
	      };


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

