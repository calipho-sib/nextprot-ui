'use strict';
var SearchService=angular.module('np.search.service',['np.search.ui']);


// Search API

/**
 * define service that made the search
 */
SearchService.factory('Search',[
  '$resource',
  '$http',
  'config',
  function($resource, $http, config){
	//
	// this is the url root
	var $api=$resource(config.solr.SOLR_SERVER,
        	{action:':action',entity:':entity',port:config.solr.SOLR_PORT},{
        		search:{method:'GET'}
        	});
		
	var defaultUrl={
			filter:'',
			entity:'entry.json',
			quality:'gold',
			query:''
	};	
	

	var searchApi={
		action:'search'
	}

	var suggestApi={
		action:'autocomplete'
	}


	
	var Search=function(data){
		//
		// init solr params with default Core

		//
		// default config
		this.config=config.solr;
		this.config.solr=config.solr.core[defaultUrl.entity];
		
		//
		// app search service params
		this.params={};
		
		//
		// result content
		this.result={};
		
		angular.extend(this.params, defaultUrl, data||{})
		
	};

	Search.prototype.clear=function(){
		angular.copy( defaultUrl,this.params)
	}
	

	


	//
	//
	// suggest is a quick search
	Search.prototype.suggest=function(query,cb){
		var params={};
		angular.extend(params, defaultUrl,suggestApi, {query:query})		
		$api.search(params,function(result){				
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
		angular.extend(this.params,  searchApi, defaultUrl, params)		
		this.params.entity=config.solr.entityMapping[params.entity];

		$api.search(this.params).$promise.then(function(docs){
			//console.log("docs",docs)
			me.result.params=params;
			me.result.display=config.solr.entityMapping[me.params.entity];
			me.result.core=docs.index;
			me.result.time=docs.elapsedTime;
			me.result.score=docs.maxScore;
			me.result.docs = docs.results;
			me.result.ontology=config.solr.ontology;
			me.result.filters=docs.filters
			me.config.solr=config.solr.core[me.result.display];

			//
			// prepare spellcheck stucture
			me.result.spellcheck=docs.spellcheck;

			//
			// prepare pagination
			me.result.num=docs.found;
			me.result.pagination={};
			me.result.pagination.current=parseInt((params.start?params.start:0)/config.solr.paginate.rows);

			// back button
			if (params.start>0 && (me.result.pagination.current)>0){
				var offset=me.result.pagination.current;
				me.result.pagination.prev={
					offset:offset-1, 
					rows:(offset-1)*config.solr.paginate.rows
				};
			}
			// next button 
			if (  docs.results.length===config.solr.paginate.rows){
				me.result.pagination.next={
					offset:me.result.pagination.current+1, 
					rows:(me.result.pagination.current+1)*config.solr.paginate.rows
				};

			}

			// more button
			if (  (docs.found/config.solr.paginate.rows)>config.solr.paginate.steps){
				me.result.pagination.more={
					offset:parseInt(me.result.num/config.solr.paginate.rows), 
					rows:parseInt(me.result.num/config.solr.paginate.rows)*config.solr.paginate.rows
				};
			}

			
			me.result.offset=docs.start;
			me.result.pages=[];
			for (var page=0;page<(me.result.num/config.solr.paginate.rows);page++){
				if (page>config.solr.paginate.steps){
					break;		
				}
				me.result.pages.push({
					offset:page+1,
					rows:page*config.solr.paginate.rows, 
					current:(me.result.pagination.current)===page
				})
			}

			//
			// prepare facet structure
//			if(docs.facet_counts&&docs.facet_counts.facet_fields.filters){
//				var filters=docs.facet_counts.facet_fields.filters;
//				for(var i=0;i<filters.length;i+=2){
//					me.result.filters.push({name:filters[i],count:filters[i+1]});
//				}				
//			}

			if(cb)cb(me.result)
		},function(error){
			//if (error.status)
			me.result.error="Ooops, request failed: "+error;
		})	
	}

	Search.prototype.searchById = function(ids, cb) {
		var me=this;
		me.result.docs = [];
//		angular.extend(this.params,  defaultUrl, params)
		
		//
		// setup query  
		//var searchParams=angular.extend({},defaultSolr, defaultSolrHl);			
		var searchParams=angular.extend({}, mySolr);			
		var solr=config.solr.core[this.params.entity];
		searchParams.core=solr.name;
		
		//
		// additional criterion hyper boosted to make sure we get this record as the first and only row returned
		
		var myQ;
		/*
		if(ids.length > 1) {
			var myQ = "id:("; // user JOIN!
			
			myQ += ids.join(" ");
			myQ += ")";
			*/
			
		if(ids.length > 1)
			myQ = "id:(" + ids.join(" ") + ")";
		else myQ = "id:"+ids[0];
			
//			for(var i =0; i< ids.length; i++)
//				myQ = myQ.concat(ids[i]+" ");
//			myQ = myQ.concat(")");
		//} else myQ = "id:"+ids[0];
			
		
		console.log('myQ: ', myQ);
		searchParams.bq = searchParams.q = myQ; //+ "^1000";
//		searchParams.bq=searchParams.q="id:" + id + "^1000";
		
		searchParams.fl=solr.hi.join(',')
		searchParams["hl.fl"]=solr.hi.join(',');
		//
		// select return fields (more details)
		//searchParams.fl=solr.hi.join(',')
		//searchParams["hl.fl"]=solr.hi.join(',');		
		

		$api.search(searchParams,function(docs){
//			me.result.docs[index].details = docs.response.docs[0];			
			me.result.docs = docs.response.docs;
			console.log('results: ', docs.response.docs);
			if(cb)cb(docs,searchParams)
		})		
		
	}
	

	
	var search=new Search();
	return search;
}]);