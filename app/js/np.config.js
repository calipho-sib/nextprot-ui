'use strict';


//
//Define the application global configuration

angular.module('np.config', []).factory('config', [
'$http',
function ($http) {
	
	//
	// solr config for publication
	var pub={
			name:"nppublications1",
			//
			// display fields
			fl:["id","ac","date","title","abstract","type",
	            "journal","source","authors","has_evidence",
	            "is_largescale","is_computed","filters"
	        ],
			//
			// single term boost bias
	        qf:["ac^16","date^16","title^16","abstract^16","type^16",
		            "journal^8","source^8","authors^8","has_evidence^8",
		            "is_largescale^4","is_computed^4"
		    ],
			//
			// phrase boost bias
	        pf:["ac^160","date^160","title^160","abstract^160","type^160",
		            "journal^80","source^80","authors^80","has_evidence^80",
		            "is_largescale^40","is_computed^40"
		    ],
			//
			// neutral boost bias
	        fn:["ac^1","date^1","title^1","abstract^1","type^1",
		            "journal^1","source^1","authors^1","has_evidence^1",
		            "is_largescale^1","is_computed^1"
		    ],
		    hi:["date","title","type", "journal","source","authors"
		    ],
		    sort:{
		    	default:'date desc,volume desc, first_page desc, title_s asc'
		    },
			filters:"filters",
	    	widgets:{
		    	gold:false	    		
	    	}
	}
	
	//
	// solr config for proteins
	var proteins={
			name:"npentries1",
			fl:["id","recommended_ac","recommended_name","uniprot_name","recommended_gene_names","gene_band","score",
			    "aa_length", "function_desc", "chr_loc", "isoform_num", "ptm_num", "var_num", "mutagenesis_num", "expression_num",
			    "filters", "protein_existence"],
			//
			// single term boost bias
			qf:["recommended_name^32","uniprot_name^16","alternative_names^16",
			     "recommended_ac^8","alternative_acs^8","recommended_gene_names^32","alternative_gene_names^8", 
			     "family_names^4","cv_names^4","cv_synonyms^4","cv_ancestors^2", "peptide^2", "antibody^2"
			],
			//
			// phrase boost bias
			pf:["recommended_name^320","uniprot_name^160","alternative_names^160",
			     "recommended_ac^80","alternative_acs^80","recommended_gene_names^320","alternative_gene_names^80", 
			     "family_names^40","cv_names^40","cv_synonyms^40","cv_ancestors^20", "peptide^20", "antibody^20"
			],

			//
			// neutral boost bias
			fn:["recommended_name^1","uniprot_name^1","alternative_names^1",
			    "recommended_ac^1","alternative_acs^1","recommended_gene_names^1","alternative_gene_names^1", 
			    "family_names^1","cv_name^1","cv_synonyms^1","cv_ancestors^1"
	     	],
	     	hi:["id","recommended_ac","recommended_name","uniprot_name","recommended_gene_names","gene_band","score",
			    "cv_names",  "clone_name", "ensembl", "microarray_probe", "interactions", "family_names", "alternative_acs", "filters",
			    "cv_ancestors", "peptide", "antibody", "cv_synonyms", "annotations", "publications", "xrefs"
	    	],
   	
		    sort:{
		    	gene:'recommended_gene_names_s asc',
		    	protein:'recommended_name_s asc',
		    	family:'family_names_s asc',
		    	ac:'id asc',
		    	length:'aa_length asc',
		    	default:'score desc'
		    },
			filters:"filters",
	    	widgets:{
		    	gold:true,	    		
	    	    qualityLabel:{
	    		  'gold':'Gold only',
	    		  'gold-and-silver':'Include silver'
	    		}
		    }
	
	}
	
	//
	// solr config for proteins
	var proteinsgold=angular.extend({},proteins,{name:'npentries1gold'})
	
	//
	// solr config for cvs
	var cvs={
			name:"npcvs1",
			fl:["ac","name","synonyms","description","filters","properties"],
			//
			// single term boost bias
			qf:["name^32","synonyms^32","description^16"],
			//
			// phrase boost bias
			pf:["name^320","synonyms^320","description^160"],

			//
			// neutral boost bias
			fn:["name^1","description^1"],
	     	hi:["ac", "name", "description", "filters","properties"],
		    sort:{
		    	default:''		    	
		    },
			filters:"filters",
	    	widgets:{
		    	gold:false	    		
	    	}
			
	}	

	
 //
 // solr configuration
 var defaultSolr = {
   SOLR_SERVER:'http://localhost:port/nextprot-api/:action/:entity',
   SOLR_PORT:':8080',

   
   
   ontology:{
	   /* Ontology filters */
	   "enzymeclassification":"Enzyme classification",
	   "evidencecodeontology":"Evidence Code",
	   "evocanatomicalsystem":"eVOC Anatomical System",
	   "evoccelltype":"eVOC Cell Type",
	   "evocdevelopmentstage":"eVOC Development Stage",
	   "evocpathology":"eVOC Pathology",
	   "gobiologicalprocess":"Go Biological Process",
	   "gocellularcomponent":"Go Cellular Component",
	   "gomolecularfunction":"Go Molecular Function",
	   "mesh":"MeSH",
	   "meshanatomy":"MeSH Anatomy",
	   "mim":"MIM",
	   "nextprotbiosequenceannotation":"neXtProt biosequence annotation",
	   "nextprotfamily":"NextProt family",
	   "nextprottissues":"NextProt tissues",
	   "nonstandardaminoacid":"Non-standard amino acid",
	   "organelle":"Organelle",
	   "sequenceontology":"Sequence ontology",
	   "stage":"Stage",
	   "uniprotcarbohydrate":"Uniprot carbohydrate",
	   "uniprotcellline":"Uniprot cell line",
	   "uniprotdisease":"Uniprot disease",
	   "uniprotdomain":"Uniprot domain",
	   "uniprotfamily":"Uniprot family",
	   "uniprotkeywords":"Uniprot keywords",
	   "uniprotmetal":"Uniprot metal",
	   "uniprotpathways":"Uniprot pathways",
	   "uniprotposttranslationalmodifications":"Uniprot posttranslational modifications",
	   "uniprotsubcellularlocation":"Uniprot region structure",
	   "uniprotsubcellularorientation":"Uniprot subcellular location",
	   "uniprotsubcellulartopology":"Uniprot subcellular topology",
	   "uniprottopology":"Uniprot topology",
	   
	   /* Publication filters */
	   "curated":"Cited for annotation",
	   "largescale":"Large scale data",
	   "computed":"Computed data",
		   
	   /* Entries filters */
	   "filterexpressionprofile":"Expression profile",
	   "filterproteomics":"Proteomics",
	   "filterstructure":"3D Structure",
	   "filtermutagenesis":"Mutagenesis",
	   "filterdisease":"Disease"
   },
   

   
   //
   // to sort by year => date%YEAR = mod(ms(date),ms(YEAR)) =mod(ms(date),3.16e+10)
   core:{
	   		'proteinsgold':proteinsgold,
			'proteins':proteins,
			'publications':pub,
			'terms':cvs
   },

   entityMapping:{
		proteins:'entry.json',
		publications:'publications.json',
		terms:'terms.json',
		'entry.json':'proteins',
		'publications.json':'publications',
		'terms.json':'terms'
   },

   paginate:{
   		steps:4,
   		rows:50
   }

 };
 //
 // global application configuration
 var defaultConfig = {
	solr:defaultSolr
 }
 

 return defaultConfig;
}
]);