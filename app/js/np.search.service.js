'use strict';
var SearchService=angular.module('np.search.service',[]);

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
	var $solr=$resource(config.solr.SOLR_SERVER,
        	{action:':action',core:':core',port:config.solr.SOLR_PORT,'json.wrf': 'JSON_CALLBACK'},{
        		search:{method:'JSONP'}
        	});
		
	var defaultUrl={
			filter:'',
			entity:'proteins',
			quality:'gold',
			query:'',
			boost:false
	};	
	

	var defaultSolr = {
	      lowercaseOperators: true,
	      defType: "edismax",
	      mm: "100%",
	      debugQuery: false,
	      fl: '',
	      q: '*:*',
	      qf: "",
	      ps:3,
	      stopwords: true,
	      wt: "json",
	      rows:20,
	      indent: true,
	      action:'select'
	}		
	
	var mySolr = {
		lowercaseOperators: true,
		mm: "100%",
		debugQuery: false,
		fl: '',
		q: 'id:(_AC_)',
		qf: "",
		ps:3,
		stopwords: true,
		wt: "json",
		rows:20,
		indent: true,
		action:'select'
	}	
	
	var defaultSolrFacet = {
	      pf:"",
	      facet:"true",
	      "facet.field": "filters",
	      "facet.limit": 10,
	      "facet.mincount":1,
	      "facet.sort":"count",
	      "facet.method":"enum",
	      "facet.prefix": ""			
	}
	var defaultSolrOneRow = {
		      facet:false,
		      rows:1,
	}
	var defaultSolrHl = {
	      "hl": true,
	      "hl.useFastVectorHighlighter":true,
	      "hl.phraseLimit":1000,
	      "hl.fl": '',
	      "hl.simple.pre": "<em>",
	      "hl.simple.post":"</em>",
	      "hl.snippets": 100,
	      "hl.fragsize":200, 
	      "hl.mergeContiguous": false			
	}
	
	var defaultSolrSuggest ={
			q:"",
			spellcheck:true,
			"spellcheck.collate":true,
			"spellcheck.build":true,
			wt:"json",
			action:'spell'
	}
	
	var defaultDeadYouMean={
			/**/
			"df":"text",
			"spellcheck.dictionary":"default",
			"spellcheck":"on",
			"spellcheck.extendedResults":true,       
			"spellcheck.count":10,
			
			/* max suggestion to return for terms that exist - terms where doc freq>0 */
			"spellcheck.alternativeTermCount":5,
			
			/* This parameter is especially useful in conjunction with "spellcheck.alternativeTermCount" 
			 * to generate "Did You mean?"-style suggestions for low hit-count queries.*/
			"spellcheck.maxResultsForSuggest":5,       
			"spellcheck.collate":true,
			"spellcheck.collateExtendedResults":true,
			
			/* Doing so will cause the spellchecker to check the collation possibilities against the index*/
			"spellcheck.maxCollationTries":5, 
			"spellcheck.maxCollations":10,
			
			/* Use a text only query string without any solr addon (+,-, field:*, ... )*/
			"spellcheck.q":"",
			"spellcheck.collateParam.mm":defaultSolr.mm
	}
	

	
	var Search=function(data){
		//
		// init solr params with default Core
		var solr=config.solr.core[defaultUrl.entity];

		//
		// default config
		this.config=solr;
		
		//
		// app search service params
		this.params={};
		
		//
		// result content
		this.result={};
		
		angular.extend(this.params, defaultUrl, data||{})
		this.boostBias()
		
	};

	Search.prototype.clear=function(){
		angular.copy( defaultUrl,this.params)
	}
	

	Search.prototype.updateBoost=function(params, cb){		
		var solr=config.solr.core[params.entity];
		if (solr===undefined && cb){
			return cb("Entity "+params.entity+" doesn't exist");
		}
		this.qf=solr.qf.join('\n');
		this.pf=solr.pf.join('\n');
	}
	
	Search.prototype.boostBias=function(){
		var solr=config.solr.core[this.params.entity];
		this.qf=solr.qf.join('\n');
		this.pf=solr.pf.join('\n');
	}

	Search.prototype.boostReset=function(){
		var solr=config.solr.core[this.params.entity];
		this.qf=solr.fn.join('\n');
		this.pf=solr.fn.join('\n');		
	}
	
	Search.prototype.parseSpellcheck=function(spellcheck){
	    var result = {};result.collations=[];result.suggestions=[];
	    if (spellcheck && spellcheck.suggestions) {
	      var suggestions = spellcheck.suggestions;

	      for (var word in suggestions) {
	    	
	    	//
	    	// parsing collation
	    	if (Array.isArray(suggestions[word]) && suggestions[word][0]==="collationQuery"){
	    		result.collations.push({collationQuery:suggestions[word][1], hits:suggestions[word][3]});
	    		continue;
	    	}
	    	//
	    	// parsing suggestion
	    	if (!Array.isArray(suggestions[word]) && (typeof suggestions[word] == "object")){
	    		result.suggestions.push(suggestions[word].suggestion);
	    	}
	    	
	      }
	    }
	    result.collations=_.sortBy(result.collations, function(c){ return -c.hits; });
	    return result;
	}
	//
	//
	// solr search in all documents 
	Search.prototype.solrSuggest=function(query,cb){

		//
		// setup query  
		var solrParams=angular.extend({},defaultSolrSuggest);
		var solr=config.solr.core[this.params.entity];
		solrParams.core=solr.name;				
		solrParams.q=query;		
		//console.log(query,solrParams)
		$solr.search(solrParams,function(docs){
			//console.log(solrParams, docs.spellcheck.suggestions.collation, docs)
				
			if(cb)cb(docs,solrParams)
		})			
	}
		
	//
	//
	// solr search details for one document 
	Search.prototype.solrDetails=function(index,params,cb){
		var me=this;
		var id=me.result.docs[index].id;
		angular.extend(this.params,  defaultUrl, params)
		
		//
		// setup query  
		var solrParams=angular.extend({},defaultSolr, defaultSolrHl);			
		var solr=config.solr.core[this.params.entity];
		solrParams.core=solr.name;
		
		//
		// additional criterion hyper boosted to make sure we get this record as the first and only row returned
		solrParams.bq=solrParams.q="id:" + id + "^1000";
		
		
		//
		// select return fields (more details)
		solrParams.fl=solr.hi.join(',')
		solrParams["hl.fl"]=solr.hi.join(',');		
		

		$solr.search(solrParams,function(docs){
			me.result.docs[index].details = docs.response.docs[0];			

			if(cb)cb(me.result,solrParams)
		})		

	}
	
	//
	//
	// solr search in all documents 
	Search.prototype.solrDocs=function(params,cb, extendedSolr){
		var me=this;me.result.error="";
		me.result.docs = [];
		
		//
		// check if boost must be updated
		if (this.params.entity!==params.entity){
			this.updateBoost(params, function(err){
				me.result.error=err;
				return cb(me.result);
			})		
			if (me.result.error)return;
		}
		
		if (params){
			angular.extend(this.params,  defaultUrl, params)
		}
				
		//
		// setup solr with defaultSolr and defaultDeadYouMean config
		var solrParams=angular.extend({}, defaultSolr /*, defaultSolrHl */, defaultDeadYouMean);
		var solr=config.solr.core[this.params.entity];
		this.config=solr;
		
		//
		// select the index core (force to gold if needed) 
		solrParams.core=solr.name;
		if(me.params.quality==='gold' && solr.widgets.gold) solrParams.core+='gold';
		
		//
		// select the sort setting
		solrParams.sort=(me.params.sort)?solr.sort[me.params.sort]:solr.sort.default;

		var query=this.params.query.split(/[\s,]+/).join(' +');
		solrParams.q='+'+query;
		solrParams["spellcheck.q"]=this.params.query;
		
		if (this.params.filter)solrParams.q+=" AND filters:"+this.params.filter

		
		solrParams.qf=this.qf.toLowerCase().replace(/[\r\n]/g,' ') + " text";
		solrParams.pf=this.pf.toLowerCase().replace(/[\r\n]/g,' ')+ " text^20";
		
		//
		// facets on filters
		if (solr.filters){
			angular.extend(solrParams, defaultSolrFacet);
		}
		//
		// select return fields (less details)
		//solrParams.fl=solr.fl.join(',')
		solrParams.fl=solr.fl.join(',');
		if (solrParams.hl)
			solrParams["hl.fl"]=solr.hi.join(',');

		$solr.search(solrParams,function(docs){
			me.result.params=solrParams;
			me.result.display=me.params.entity;
			me.result.core=solr.name;
			me.result.time=docs.responseHeader.QTime;
			me.result.score=docs.response.maxScore;
			me.result.docs = docs.response.docs;
			me.result.ontology=config.solr.ontology;
			me.result.highlighting=docs.highlighting;
			me.result.filters=[];

			//
			// prepare pagination
			me.result.num=docs.response.numFound;
			if (me.result.num/docs.responseHeader.params.rows>4)
				me.result.more='...';
			
			me.result.offset=docs.response.start;
			me.result.pages=[];
			for (var page=0;page<(me.result.num/docs.responseHeader.params.rows);page++){
				if (page>4){
					break;		
				}
				me.result.pages.push(docs.response.start+page+1)
			}
			//
			// prepare facet structure
			if(docs.facet_counts&&docs.facet_counts.facet_fields.filters){
				var filters=docs.facet_counts.facet_fields.filters;
				for(var i=0;i<filters.length;i+=2){
					me.result.filters.push({name:filters[i],count:filters[i+1]});
				}				
			}

			//
			// prepare spellcheck stucture
			me.result.spellcheck=me.parseSpellcheck(docs.spellcheck);
			console.log('docs: ', docs);			
			if(cb)cb(me.result,solrParams)
		})	
	}

	Search.prototype.searchById = function(ids, cb) {
		var me=this;
		me.result.docs = [];
//		angular.extend(this.params,  defaultUrl, params)
		
		//
		// setup query  
		//var solrParams=angular.extend({},defaultSolr, defaultSolrHl);			
		var solrParams=angular.extend({}, mySolr);			
		var solr=config.solr.core[this.params.entity];
		solrParams.core=solr.name;
		
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
		solrParams.bq = solrParams.q = myQ; //+ "^1000";
//		solrParams.bq=solrParams.q="id:" + id + "^1000";
		
		solrParams.fl=solr.hi.join(',')
		solrParams["hl.fl"]=solr.hi.join(',');
		//
		// select return fields (more details)
		//solrParams.fl=solr.hi.join(',')
		//solrParams["hl.fl"]=solr.hi.join(',');		
		

		$solr.search(solrParams,function(docs){
//			me.result.docs[index].details = docs.response.docs[0];			
			me.result.docs = docs.response.docs;
			console.log('results: ', docs.response.docs);
			if(cb)cb(docs,solrParams)
		})		
		
	}
	

	
	var search=new Search();
	return search;
}]);