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
  'config',
  function($resource, $http, $cookies, $cookieStore, config){
	//
	// this is the url root
	var $api=$resource(config.solr.SOLR_SERVER,
        	{ action:'@action',entity:'@entity', port:config.solr.SOLR_PORT },{
        		search:{method:'POST'}
        	});
		
	var defaultUrl={
			filter:'',
			entity:'entry.json',
			quality:'gold',
			query:'',
			sort:''
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
		this.config=config.solr;
		
		//
		// app search service params
		this.params={};
		
		//
		// result content
		this.result={};
		
		angular.extend(this.params, defaultUrl, data||{})
		
	};

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
	

	Search.prototype.paginate=function(params, docs){
			this.result.num=docs.found;
			this.result.pagination={};
			this.result.pagination.current=parseInt((params.start?params.start:0)/config.solr.paginate.rows);
			this.result.pagination.manual=this.result.pagination.current+1;

			// back button
			if (params.start>0 && (this.result.pagination.current)>0){
				var offset=this.result.pagination.current;
				this.result.pagination.prev={
					offset:offset-1, 
					rows:(offset-1)*config.solr.paginate.rows
				};
			}
			// next button 
			if (  docs.results.length===config.solr.paginate.rows){
				this.result.pagination.next={
					offset:this.result.pagination.current+1, 
					rows:(this.result.pagination.current+1)*config.solr.paginate.rows
				};

			}

			// more button
			if (  (docs.found/config.solr.paginate.rows)>config.solr.paginate.steps){
				this.result.pagination.more={
					offset:parseInt(this.result.num/config.solr.paginate.rows), 
					rows:parseInt(this.result.num/config.solr.paginate.rows)*config.solr.paginate.rows
				};
			}

			
			this.result.offset=docs.start;
			this.result.pages=[];
			for (var page=0;page<(this.result.num/config.solr.paginate.rows);page++){
				if (page>config.solr.paginate.steps){
					break;		
				}
				this.result.pages.push({
					offset:page+1,
					rows:page*config.solr.paginate.rows, 
					current:(this.result.pagination.current)===page
				})
			}		
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
		angular.extend(this.params,  searchApi, defaultUrl, params)		
		this.params.entity=config.solr.entityMapping[params.entity];


		//$api.search(this.params).$promise.then(function(docs){
		$api.search(this.params, params.query).$promise.then(function(docs) {
			me.result.rows=docs.rows;
			me.result.params=params;
			me.result.display=config.solr.entityMapping[me.params.entity];
			me.result.core=docs.index;
			me.result.time=docs.elapsedTime;
			me.result.score=docs.maxScore;
			me.result.docs = docs.results;
			me.result.ontology=config.solr.ontology;
			me.result.filters=docs.filters

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