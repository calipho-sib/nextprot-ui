'use strict';


//
//Define the application global configuration

angular.module('np.config', []).factory('config', [
'$http',
function ($http) {
	
 var BASE_URL= 'http://localhost';
 // var BASE_URL= 'http://uat-web1.isb-sib.ch';
	
 //
 // solr configuration
 var defaultApi = {
   BASE_URL:BASE_URL,
   SOLR_SERVER:BASE_URL+':port/nextprot-api/:action/:entity',
   SOLR_PORT:':8282',

   //base:"/",
   base:"/protosearch/",
   
   
   ontology:{
	   /* Ontology filters */
	   "enzymeclassification":"Enzyme classification",
	   "evidencecodeontology":"Evidence Code",
	   "evocanatomicalsystem":"eVOC Anatomical System",
	   "evoccelltype":"eVOC Cell Type",
	   "evocdevelopmentstage":"eVOC Development Stage",
	   "evocpathology":"eVOC Pathology",
	   "gobiologicalprocess":"GO Biological Process",
	   "gocellularcomponent":"GO Cellular Component",
	   "gomolecularfunction":"GO Molecular Function",
	   "mesh":"MeSH",
	   "meshanatomy":"MeSH Anatomy",
	   "mim":"MIM",
	   "nextprotbiosequenceannotation":"neXtProt biosequence annotation",
	   "nextprotfamily":"neXtProt family",
	   "nextprottissues":"CALOHA",
	   "nonstandardaminoacid":"Non-standard amino acid",
	   "organelle":"Organelle",
	   "sequenceontology":"Sequence ontology",
	   "stage":"Stage",
	   "uniprotcarbohydrate":"UniProt carbohydrate",
	   "uniprotcellline":"Cellosaurus",
	   "uniprotdisease":"UniProt disease",
	   "uniprotdomain":"UniProt domain",
	   "uniprotfamily":"UniProt family",
	   "uniprotkeywords":"UniProt keywords",
	   "uniprotmetal":"UniProt metal",
	   "uniprotpathways":"UniPathways",
	   "uniprotposttranslationalmodifications":"UniProt posttranslational modifications",
	   "uniprotsubcellularlocation":"UniProt region structure",
	   "uniprotsubcellularorientation":"Uniprot subcellular location",
	   "uniprotsubcellulartopology":"UniProt subcellular topology",
	   "uniprottopology":"UniProt topology",
	   
	   /* Publication filters */
	   "curated":"Cited for annotation",
	   "largescale":"Large scale data",
	   "computed":"Not cited for annotation",
		   
	   /* Entries filters */
	   "filterexpressionprofile":"Expression profile",
	   "filterproteomics":"Proteomics",
	   "filterstructure":"3D structure",
	   "filtermutagenesis":"Mutagenesis",
	   "filterdisease":"Disease"
   },
   


	widgets:{
		sort:{
			asc:"icon-sort-by-attributes",
			desc:"icon-sort-by-attributes-alt",
			"":""
		},
		proteins:{
			gold:true,
			qualityLabel:{
			  'gold':'Gold only',
			  'gold-and-silver':'Include silver'
			}

		},
		publications:{
			gold:false
		},
		terms:{
			gold:false
		}
	},


   entityMapping:{
		proteins:'entry.json',
		publications:'publication.json',
		terms:'term.json',
		'entry.json':'proteins',
		'publication.json':'publications',
		'term.json':'terms'
   },

   paginate:{
   		steps:4,
   		rows:50
   }

 };
 //
 // global application configuration
 var defaultConfig = {
	solr:defaultApi
 }
 

 return defaultConfig;
}
]);