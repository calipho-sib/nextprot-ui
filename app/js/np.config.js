'use strict';


//
//Define the application global configuration

angular.module('np.config', []).factory('config', [
    '$http','npSettings',
    function ($http, npSettings) {

        // api configuration
        var defaultApi = {

            environment: npSettings.environment,
            API_URL: npSettings.base,
            NP1_URL: npSettings.np1,
            AUTH_CALLBACK_URL: npSettings.callback,

            githubQueriesEdit : "https://github.com/calipho-sib/nextprot-queries/edit/develop/src/main/resources/nextprot-queries/",


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
                "ncithesaurus": "NCI Thesaurus",
                "ncimetathesaurus": "NCI Metathesaurus",
                "aanpbiosequenceannotation": "neXtProt annotation",
                "aanpfamily": "neXtProt family",
                "aanpmodificationeffect": "neXtProt modification effect",
                "aanpproteinproperty":"Protein property",
                "aanptissues": "neXtProt human anatomy",
                "nonstandardaminoacid": "Non-standard amino acid",
                "organelle": "Organelle",
                "sequenceontology": "Sequence ontology",
                "stage": "Bgee developmental stage",
                "upcarbohydrate": "UniProt carbohydrate",
                "upcellline": "neXtProt Cellosaurus",
                "updisease": "UniProt disease",
                "updomain": "neXtProt domain",
                "upfamily": "UniProt family",
                "upkeywords": "UniProt keyword",
                "upmetal": "neXtProt metal",
                "uppathways": "UniPathway",
                "mammalianphenotype":"Mammalian phenotype",
                "upposttranslationalmodifications": "UniProt post-translational modification",
                "upsubcellularlocation": "UniProt subcellular location",
                "upsubcellularorientation": "Uniprot subcellular orientation",
                "upsubcellulartopology": "UniProt subcellular topology",
                "uptopology": "neXtProt topology",

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
                    asc: "fa fa-arrow-up",
                    desc: "fa fa-arrow-down"
                },
                proteins: {
                    sort:{
                        '':{text:"score",image:"fa fa-arrow-down", isAsc:false},
                        'gene':{text:'gene',image:"fa fa-arrow-up", isAsc:true},
                        'protein':{text:'protein',image:"fa fa-arrow-up", isAsc:true},
                        'family':{text:'family',image:"fa fa-arrow-up", isAsc:true},
                        'chromosome':{text:'chr',image:"fa fa-arrow-up", isAsc:true},
                        'ac':{text:'ac',image:"fa fa-arrow-up", isAsc:true},
                        'length':{text:'len',image:"fa fa-arrow-up", isAsc:true}
                    },
                    gold: true,
                    qualityLabel: {
                        'gold': 'Gold only',
                        'gold-and-silver': 'Include silver'
                    }

                },
                publications: {
                    sort:{
                        '':{text:"",image:"fa fa-arrow-down", isAsc:false}
                    },
                    gold: false
                },
                terms: {
                    sort:{
                        '':{text:"score",image:"fa fa-arrow-down", isAsc:false},
                        'name':{text:"name",image:"fa fa-arrow-up", isAsc:true}
                    },
                    gold: false
                },
                repositories: {
                    aNextprotRep: { /* 'a' is used to appear first */
                        title: "training",
                        tooltip: "Queries used for example",
                        icon: "fa fa-certificate"
                    },
                    communityRep: {
                        title: "community",
                        tooltip: "Public repository used to share knowledge in the community",
                        icon: "fa fa-globe"
                    },
                    privateRep: {
                        title: "your private",
                        tooltip: "your private repository",
                        icon: "fa fa-user"
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
            api: defaultApi
        }


        return defaultConfig;
    }
]);
