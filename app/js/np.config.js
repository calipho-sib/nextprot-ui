'use strict';


//
//Define the application global configuration

angular.module('np.config', []).factory('config', [
    '$http',
    function ($http) {

        var BASE_URL = 'http://localhost';
        var BASE_AUTH_URL = 'http://localhost:9090';

        // var BASE_URL= 'http://uat-web1.isb-sib.ch';


        var google = {
            rootUrl: 'http://localhost:3000', 
      
            credentials: {
                'clientId': '330067914740-lr5rtkdth97c6qpkluj0rqknfe29ecr8.apps.googleusercontent.com',
                'apiBase': '/api/',
                'rootUrl': 'http://localhost:3000',
                'scopes': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email',
                'requestvisibleactions': 'http://schemas.google.com/AddActivity ' + 'http://schemas.google.com/ReviewActivity',
                'cookiepolicy': 'single_host_origin',
          }
    
        }


        //
        // solr configuration
        var defaultApi = {
            BASE_URL: BASE_URL,
            API_SERVER: BASE_URL + ':port/nextprot-api/:action/:entity',
            API_PORT: ':8080',
            BASE_AUTH_URL: BASE_AUTH_URL,
            AUTH_SERVER : BASE_AUTH_URL + '/nextprot-auth',

            //base:"/",
            base: "/protosearch/",


            ontology: {
                /* Ontology filters */
                "enzymeclassification": "Enzyme classification",
                "evidencecodeontology": "Evidence Code",
                "evocanatomicalsystem": "eVOC Anatomical System",
                "evoccelltype": "eVOC Cell Type",
                "evocdevelopmentstage": "eVOC Development Stage",
                "evocpathology": "eVOC Pathology",
                "gobiologicalprocess": "GO Biological Process",
                "gocellularcomponent": "GO Cellular Component",
                "gomolecularfunction": "GO Molecular Function",
                "mesh": "MeSH",
                "meshanatomy": "MeSH Anatomy",
                "mim": "MIM",
                "nextprotbiosequenceannotation": "neXtProt biosequence annotation",
                "nextprotfamily": "neXtProt family",
                "nextprottissues": "neXtProt human anatomy",
                "nonstandardaminoacid": "Non-standard amino acid",
                "organelle": "Organelle",
                "sequenceontology": "Sequence ontology",
                "stage": "Stage",
                "uniprotcarbohydrate": "UniProt carbohydrate",
                "uniprotcellline": "neXtProt cell line",
                "uniprotdisease": "UniProt disease",
                "uniprotdomain": "UniProt domain",
                "uniprotfamily": "UniProt family",
                "uniprotkeywords": "UniProt keyword",
                "uniprotmetal": "UniProt metal",
                "uniprotpathways": "UniPathway",
                "uniprotposttranslationalmodifications": "UniProt post-translational modification",
                "uniprotsubcellularlocation": "UniProt subcellular location",
                "uniprotsubcellularorientation": "Uniprot subcellular orientation",
                "uniprotsubcellulartopology": "UniProt subcellular topology",
                "uniprottopology": "UniProt topology",

                /* Publication filters */
                "curated": "Cited for annotation",
                "largescale": "Large scale data",
                "computed": "Not cited for annotation",

                /* Entries filters */
                "filterexpressionprofile": "Expression profile",
                "filterproteomics": "Proteomics",
                "filterstructure": "3D structure",
                "filtermutagenesis": "Mutagenesis",
                "filterdisease": "Disease"
            },


            widgets: {
                sort: {
                    //asc:"icon-sort-by-attributes",
                    asc: "icon-arrow-up",
                    desc: "icon-arrow-down",
                    // desc:"icon-sort-by-attributes-alt",
                    "": ""
                },
                proteins: {
                    gold: true,
                    qualityLabel: {
                        'gold': 'Gold only',
                        'gold-and-silver': 'Include silver'
                    }

                },
                publications: {
                    gold: false
                },
                terms: {
                    gold: false
                },
                repositories: {
                    nextprotRep: "neXtProt repository (Tutorial)",
                    privateRep: "Private repository",
                    publicRep: "Public repository (Community)"
                }
            },


            entityMapping: {
                proteins: 'entry.json',
                publications: 'publication.json',
                terms: 'term.json',
                'entry.json': 'proteins',
                'publication.json': 'publications',
                'term.json': 'terms'
            },

            paginate: {
                steps: 4,
                rows: 50
            }

        };
        //
        // global application configuration
        var defaultConfig = {
            api: defaultApi,
            google: google
        }


        return defaultConfig;
    }
]);