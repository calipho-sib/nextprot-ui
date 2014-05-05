'use strict';
var SearchService=angular.module('np.search.service',['np.search.ui']);


// Search API

/**
 * define service that made the search
 */
SearchService.factory('Search',[
  '$resource',
  '$http',
  '$cookies',
  '$cookieStore',
  'Tools',
  'config',
  function($resource, $http, $cookies, $cookieStore, Tools, config){
	//
	// this is the url root
	var $api = $resource(config.api.API_SERVER, { action:'@action',entity:'@entity', port:config.api.API_PORT },{
		search: { method:'POST'}
	});


		
	var defaultUrl={
			filter:'',
			entity:'entry.json',
			quality:'gold',
			query:'',
			sort:'',
			order:'',
            mode:'simple' // can be simple or advanced
	};	
	
	var defaultAdv={
			sparqlEngine:'Jena'
	};	
	
	var searchApi={
		action:'search'
	}

	var suggestApi={
		action:'autocomplete'
	}


	
	var Search=function(data){
		//
		// init session
		this.session={}
		angular.extend(this.session, $cookies)

		//
		// default config
		this.config=config.api;
		
		//
		// app search service params
		this.params={};

        //for activating the spinner
        this.loading=false;

        //
		// result content
		this.result={};
		
		angular.extend(this.params, defaultUrl, data||{})
		
	};

	Search.prototype.displayGold=function (){
		return (this.config.widgets[this.result.display] && this.config.widgets[this.result.display].gold && this.params.mode!="advanced");
	}


	Search.prototype.cookies=function (session){
		angular.extend(this.session,session, $cookies)
		Object.keys(session).forEach(function(k){
			if(session[k]!==undefined)$cookieStore.put(k,session[k])
		})
		return true;
	}

	Search.prototype.clear=function(){
		angular.copy( defaultUrl,this.params)
	}

      Search.prototype.isSearchButtonDisabled = function () {
          if(this.params.mode == 'advanced')
            return this.params.sparql&&this.params.sparql.length == 0;
          else return this.params.sparql&&this.params.query.length == 0;
      }


      Search.prototype.paginate=function(params, docs){
			this.result.num=docs.found;
			this.result.pagination={};

			// current page in the bottom
			this.result.pagination.current = parseInt((params.start ? params.start : 0) / config.api.paginate.rows);

			// current page in input (user)
			this.result.pagination.manual = this.result.pagination.current + 1;

			this.result.pagination.numPages = parseInt(this.calcPages(this.result.num, params.rows ? parseInt(params.rows) : 50));
			//console.log('pages: ', this.result.num, params.rows ? params.rows : 50, this.result.pagination.numPages, this.calcPages(this.result.num, params.rows ? params.rows : 50));




			// back button
			if (params.start > 0 && (this.result.pagination.current) > 0){
				var offset=this.result.pagination.current;
				this.result.pagination.prev = {
					offset: offset - 1, 
					rows:(offset - 1) * config.api.paginate.rows
				};
			}
			// next button 
			if (docs.results.length === config.api.paginate.rows){
				this.result.pagination.next = {
					offset:this.result.pagination.current + 1, 
					rows:(this.result.pagination.current + 1) * config.api.paginate.rows
				};
			}

			// more button
			if (  (docs.found/config.api.paginate.rows) > config.api.paginate.steps){
				this.result.pagination.more = {
					offset: this.result.pagination.numPages, //parseInt(this.result.num/config.solr.paginate.rows), 
					rows: parseInt(this.result.num/config.api.paginate.rows) * config.api.paginate.rows
				};
			}

			
			this.result.offset = docs.start;
			this.result.pages = [];
			for (var page = 0; page < (this.result.num / config.api.paginate.rows); page++){
				if (page > config.api.paginate.steps){
					break;		
				}
				this.result.pages.push({
					offset: page + 1,
					rows: page * config.api.paginate.rows,
					current: (this.result.pagination.current) === page
				})
			}		

	}
	

	Search.prototype.calcPages = function(numDocs, pageSize) {
		return ( numDocs + pageSize - 1) / pageSize;
	}


	//
	//
	// suggest is a quick search
	Search.prototype.suggest=function(query,cb){
		var params={};
		angular.extend(params, defaultUrl,suggestApi, {query:query, entity:this.params.entity})		

		$api.search(params, params.query, function(result){				
	    	var items=[];			    	
			for (var i=0; i<result.autocomplete.length; i=i+2) {
				items.push(result.autocomplete[i].name)
			}
			if(cb)cb(items)
		})			
	}
		

	
	//
	//
	// solr search in all documents 
	Search.prototype.docs=function(params,cb){

		var me=this;me.result.error="";
		me.result.docs = [];
        me.loading = true;

		delete this.params.list;
		delete this.params.accs;

		angular.extend(this.params,  searchApi, defaultUrl, params)				
		this.params.entity=config.api.entityMapping[params.entity];

		// adv search
		if(this.params.sparql)angular.extend(this.params,  defaultAdv)

		// make a copy to avoid post issue 
		var post=angular.copy(this.params);
		delete post.action
		delete post.entity

		// display search status status 
		me.result.message="Loading content...";

		$api.search({action:this.params.action, entity:this.params.entity}, post).$promise.then(function(docs) {
			me.result.rows=docs.rows;
			me.result.params=params;
			me.result.display=config.api.entityMapping[me.params.entity];
			me.result.core=docs.index;
			me.result.time=docs.elapsedTime;
			me.result.score=docs.maxScore;
			me.result.docs = docs.results;
			me.result.ontology=config.api.ontology;
			me.result.filters=docs.filters

			me.result.message=(docs.rows.length>0)?"":"No search results were found.";

			//
			// prepare spellcheck stucture
			me.result.spellcheck=docs.spellcheck;

			//
			// prepare pagination
			me.paginate(params, docs)


			//
			// special cases: ac on publications
			if(me.result.display==="publications"){
				me.result.docs.forEach(function(doc){
					doc.acs=doc.ac.split(' | ');
					doc.year=new Date(doc.date.replace(/(CET|CEST|EEST|WEEST)/gi,"")).getFullYear()
					doc.authors=doc.authors.split(' | ');
				})
			}

            me.loading = false;

			if(cb)cb(me.result)
		},function(error){
            me.loading = false;
			//if (error.status)
			me.result.error="Ooops, request failed: "+error;
		})	
	}

	Search.prototype.getIds = function(params, cb) {

		// make a copy to avoid post issue 
		var post = angular.copy(params);
		delete post.action
		delete post.entity

		$api.search({ action:'search-ids', entity:params.entity, quality: params.quality }, post).$promise.then(function(docs) {
			if(cb)cb(docs);
		});
	};


	var search=new Search();
	return search;
}]);