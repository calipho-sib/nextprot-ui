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
			fl:["pub_id","pub_ac","pub_date","pub_title","pub_abstract","pub_type",
	            "pub_journal","pub_source","pub_authors","pub_has_evidence",
	            "pub_is_largescale","pub_is_computed","filters"
	        ],
			//
			// single term boost bias
	        qf:["pub_ac^16","pub_date^16","pub_title^16","pub_abstract^16","pub_type^16",
		            "pub_journal^8","pub_source^8","pub_authors^8","pub_has_evidence^8",
		            "pub_is_largescale^4","pub_is_computed^4"
		    ],
			//
			// phrase boost bias
	        pf:["pub_ac^160","pub_date^160","pub_title^160","pub_abstract^160","pub_type^160",
		            "pub_journal^80","pub_source^80","pub_authors^80","pub_has_evidence^80",
		            "pub_is_largescale^40","pub_is_computed^40"
		    ],
			//
			// neutral boost bias
	        fn:["pub_ac^1","pub_date^1","pub_title^1","pub_abstract^1","pub_type^1",
		            "pub_journal^1","pub_source^1","pub_authors^1","pub_has_evidence^1",
		            "pub_is_largescale^1","pub_is_computed^1"
		    ],
		    hi:["pub_date","pub_title","pub_type", "pub_journal","pub_source","pub_authors"
		    ],
		    sort:{
		    	default:'pub_date desc,pub_volume desc, pub_first_page desc, pub_title asc'
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
			    "cv_names",  "clone_name", "ensembl", "microarray_probe", "interactions", "family_names", "alternative_acs", 
			    "aa_length", "function_desc", "chr_loc", "isoform_num", "ptm_num", "var_num", "disease_bool", "proteomic_bool", "structure_bool", "mutagenesis_num", "expression_num",
			    "filters"],
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
	     	hi_full:["id", "recommended_ac", "recommended_name", "uniprot_name", "alternative_names",  "alternative_acs", 
	    		"recommended_gene_names", "alternative_gene_names",
	    		"family_names", "cv_names", "cv_synonyms", "cv_ancestors", "xrefs", 
	    		"publications", "clone_name", "ensembl", "gene_band","microarray_probe", "peptide", "antibody",
	    		"interactions", "annotations"
	    	],	    	
		    sort:{
		    	gene:'recommended_gene_names_s asc',
		    	protein:'recommended_name_s asc',
		    	family:'family_names_s asc',
		    	ac:'id asc',
		    	aa:'aa_length asc',
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
   SOLR_SERVER: 'http://localhost:port/solr/:core/:action',
   SOLR_PORT:':8985',
   
   
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
   // to sort by year => pub_date%YEAR = mod(ms(pub_date),ms(YEAR)) =mod(ms(pub_date),3.16e+10)
   core:{
	   		'proteinsgold':proteinsgold,
			'proteins':proteins,
			'publications':pub,
			'terms':cvs
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