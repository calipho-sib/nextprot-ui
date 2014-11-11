'use strict';


//
//Define the application global configuration

angular.module('np.config', []).factory('config', [
    '$http',
    function ($http) {

        var BASE_URL = 'http://crick';
        var BASE_AUTH_URL = 'http://crick:9090';

        var nextprot = {
            credentials: {
                'clientId': '0b4a32ae-a519-4a88-ab29-578f58f5c2ba',
                'clientSecret': 'm07a2frbbcl26dvhpr2o7cqsi2'
            }
        }


        //
        // solr configuration
        var defaultApi = {
            BASE_URL: BASE_URL,
            API_SERVER: BASE_URL + ':port/nextprot-api-web/:action/:entity',
            API_PORT: ':8080',
            BASE_AUTH_URL: BASE_AUTH_URL,
            AUTH_SERVER: BASE_AUTH_URL + '/nextprot-auth',

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
                "aanpbiosequenceannotation": "neXtProt biosequence annotation",
                "aanpfamily": "neXtProt family",
                "aanptissues": "neXtProt human anatomy",
                "ncithesaurus": "NCI Thesaurus",
                "nonstandardaminoacid": "Non-standard amino acid",
                "organelle": "Organelle",
                "sequenceontology": "Sequence ontology",
                "stage": "Stage",
                "upcarbohydrate": "UniProt carbohydrate",
                "upcellline": "neXtProt cell line",
                "updisease": "UniProt disease",
                "updomain": "UniProt domain",
                "upfamily": "UniProt family",
                "upkeywords": "UniProt keyword",
                "upmetal": "UniProt metal",
                "uppathways": "UniPathway",
                "upposttranslationalmodifications": "UniProt post-translational modification",
                "upsubcellularlocation": "UniProt subcellular location",
                "upsubcellularorientation": "Uniprot subcellular orientation",
                "upsubcellulartopology": "UniProt subcellular topology",
                "uptopology": "UniProt topology",

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
                    asc: "icon-arrow-up",
                    desc: "icon-arrow-down",
                },
                proteins: {
                    sort:{
                        '':{text:"score",image:"icon-arrow-down", isAsc:false},
                        'gene':{text:'gene',image:"icon-arrow-up", isAsc:true},
                        'protein':{text:'protein',image:"icon-arrow-up", isAsc:true},
                        'family':{text:'family',image:"icon-arrow-up", isAsc:true},
                        'chromosome':{text:'chr',image:"icon-arrow-up", isAsc:true},
                        'ac':{text:'ac',image:"icon-arrow-up", isAsc:true},
                        'length':{text:'len',image:"icon-arrow-up", isAsc:true}
                    },
                    gold: true,
                    qualityLabel: {
                        'gold': 'Gold only',
                        'gold-and-silver': 'Include silver'
                    }

                },
                publications: {
                    sort:{
                        '':{text:"",image:"icon-arrow-down", isAsc:false}
                    },
                    gold: false
                },
                terms: {
                    sort:{
                        '':{text:"score",image:"icon-arrow-down", isAsc:false},
                        'name':{text:"name",image:"icon-arrow-up", isAsc:true}
                    },
                    gold: false
                },
                repositories: {
                    aNextprotRep: { /* 'a' is used to appear first */
                        title: "training",
                        tooltip: "Queries used for example",
                        icon: "icon-certificate"
                    },
                    communityRep: {
                        title: "community",
                        tooltip: "Public repository used to share knowledge in the community",
                        icon: "icon-globe"
                    },
                    privateRep: {
                        title: "your private",
                        tooltip: "your private repository",
                        icon: "icon-user"
                    }
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
                steps: 8,
                defaultRows: 50
            }

        };
        //
        // global application configuration
        var defaultConfig = {
            api: defaultApi,
            nextprot: nextprot
        }


        return defaultConfig;
    }
]);
