'use strict';


//
//Define the application global configuration

angular.module('np.config', []).factory('config', [
'$http',
function ($http) {
	
	
 //
 // solr configuration
 var defaultApi = {
   SOLR_SERVER:'http://uat-web1:port/nextprot-api/:action/:entity',
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
   


	widgets:{
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