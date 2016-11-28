(function (angular, undefined) {
    'use strict';

    angular.module('np.homepage', ['highcharts-ng'])
        .controller('hpCtrl', HomePageCtrl)
        //        .directive('hcPieChart', hcPieChart)
        .factory('peService', peService);

    HomePageCtrl.$inject = ['$scope', 'peService'];

    function HomePageCtrl($scope, peService) {

        var nxColors = [],
            base = "#C50063",
            i;

        for (i = 3; i < 10; i += 1) {
            // Start out with a darkened base color (negative brighten), and end
            // up with a much brighter color
            nxColors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
        }
        var colors = Highcharts.map(nxColors, function (color) {
            return {
                radialGradient: {
                    cx: 0.5,
                    cy: 0.3,
                    r: 0.7
                },
                stops: [
                            [0, color],
                            [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
                        ]
            };
        });

        $scope.chartConfig = {
            options: {
                chart: {
                    type: 'pie'
//                    width:250,
//                    marginRight: 100,
//                    marginLeft:50
                },
                tooltip: { enabled: false },
                colors: colors,
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            style: {
                                width: '100px',
                                fontWeight:'300',
                                fontSize: '9px'
                            },
                            distance:10,
                            padding:5,
                            softConnector:false,
                            enabled: true,
                            color: '#000000',
                            maxStaggerLines:1,                    
                            connectorColor: '#000000',
                            useHTML:true,
                            format: '{point.name}'

                        },
                    }
                },
                series: [{
                    data: []
                }]
                
            },
            series: [{
                    data: [],
                    startAngle: -50
                }],
            
            title: {
                text: null
            }
        };
        //        var chart = $scope.chartConfig.getHighcharts();
        //        chart.exportChart(someExportOptions);
        
        var pePos = {
            "evidence_at_protein_level":{
                x:10,
                y:300
            },
            "evidence_at_transcript_level":{
                x:0,
                y:0
            },
            "inferred_from_homology":{
                x:0,
                y:0
            },
            "uncertain":{
                x:0,
                y:0
            },
            "predicted":{
                x:0,
                y:0
            }
        }
//        var hcInstance = chartConfig.getHighCharts();
        
        peService.getPEInfo().success(function (result) {
            // Sample data for pie chart
            var seriesData = [];
            var peStats = result.results.bindings;
            peStats.sort(function(a,b){
                return a.cnt.value > b.cnt.value
            })
            peStats.forEach(function (data, index) {
                var id = data.pe.value.split("#")[1].toLowerCase();
                var value = parseInt(data.cnt.value);
                seriesData.push({
                    "name": "<div class='peLabels' id='" + id +"'>" + data.pe.value.split("#")[1].replace(/_/g, " ") + " ("+value+")</div>",
                    "y": value
//                    dataLabels: { style: { fontSize: 20 }}
                });
            });

            //            console.log("PE EXISTENCE : ");
            //            console.log(seriesData.toString());
            //            var str = JSON.stringify(seriesData, null, 4);
            //            console.log(str);
//            $scope.chartConfig.series[0].data = seriesData;
            $scope.chartConfig.series[0].data = seriesData;
//            console.log("hcInstance");
//            console.log(hcInstance);

            //            $scope.pieData = seriesData;
            //
            //                        $scope.pieData = [
            //                            {
            //                                "name": "Evidence at protein level",
            //                                "y": 16518
            //                            },
            //                            {
            //                                "name": "Uncertain",
            //                                "y": 588
            //                            },
            //                            {
            //                                "name": "Inferred from homology",
            //                                "y": 565
            //                            },
            //                            {
            //                                "name": "Evidence at transcript level",
            //                                "y": 2290
            //                            },
            //                            {
            //                                "name": "Predicted",
            //                                "y": 94
            //                            }
            //                        ];
            //
            //                        $scope.pieData = [
            //                            {
            //                            name: "Microsoft Internet Explorer",
            //                            y: 56.33
            //                                    }, {
            //                            name: "Chrome",
            //                            y: 24.03,
            //                            sliced: true,
            //                            selected: true
            //                                    }, {
            //                            name: "Firefox",
            //                            y: 10.38
            //                                    }, {
            //                            name: "Safari",
            //                            y: 4.77
            //                                    }, {
            //                            name: "Opera",
            //                            y: 0.91
            //                                    }, {
            //                            name: "Proprietary or Undetectable",
            //                            y: 0.2
            //                                }];
        });
    }
    //
    //    function hcPieChart() {
    //        return {
    //            restrict: 'E',
    //            template: '<div></div>',
    //            scope: {
    //                title: '@',
    //                data: '='
    //            },
    //            link: function (scope, element) {
    //                var colors = [],
    //                    base = "#C50063",
    //                    i;
    //
    //                for (i = 3; i < 10; i += 1) {
    //                    // Start out with a darkened base color (negative brighten), and end
    //                    // up with a much brighter color
    //                    colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
    //                }
    //
    //                Highcharts.getOptions().colors = Highcharts.map(colors, function (color) {
    //                    return {
    //                        radialGradient: {
    //                            cx: 0.5,
    //                            cy: 0.3,
    //                            r: 0.7
    //                        },
    //                        stops: [
    //                            [0, color],
    //                            [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
    //                        ]
    //                    };
    //                });
    //
    //                Highcharts.chart(element[0], {
    //                    credits: {
    //                        enabled: false
    //                    },
    //                    chart: {
    //                        type: 'pie'
    //                    },
    //                    title: {
    //                        text: scope.title
    //                    },
    //                    plotOptions: {
    //                        pie: {
    //                            allowPointSelect: true,
    //                            cursor: 'pointer',
    //                            dataLabels: {
    //                                enabled: true,
    //                                format: '<b>{point.name}</b>: {point.percentage:.1f} %'
    //                            }
    //                        }
    //                    },
    //                    series: [{
    //                        data: scope.data
    //                            }]
    //                });
    //            }
    //        };
    //    }

    peService.$inject = ['$resource', '$http', 'config', 'nxBaseUrl'];

    function peService($resource, $http, config, nxBaseUrl) {
        //var domain = nxBaseUrl.getDomain("api");
        var url = config.api.API_URL + "/sparql?output=json&query=PREFIX%20%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%23%3E%20PREFIX%20annotation%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fannotation%2F%3E%20PREFIX%20context%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fcontext%2F%3E%20PREFIX%20cv%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fterminology%2F%3E%20PREFIX%20db%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fdb%2F%3E%20PREFIX%20dc%3A%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%3E%20PREFIX%20dcterms%3A%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F%3E%20PREFIX%20entry%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fentry%2F%3E%20PREFIX%20evidence%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fevidence%2F%3E%20PREFIX%20foaf%3A%3Chttp%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F%3E%20PREFIX%20gene%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fgene%2F%3E%20PREFIX%20identifier%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fidentifier%2F%3E%20PREFIX%20isoform%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fisoform%2F%3E%20PREFIX%20mo%3A%3Chttp%3A%2F%2Fpurl.org%2Fontology%2Fmo%2F%3E%20PREFIX%20ov%3A%3Chttp%3A%2F%2Fopen.vocab.org%2Fterms%2F%3E%20PREFIX%20owl%3A%3Chttp%3A%2F%2Fwww.w3.org%2F2002%2F07%2Fowl%23%3E%20PREFIX%20publication%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fpublication%2F%3E%20PREFIX%20rdf%3A%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20PREFIX%20rdfs%3A%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%20PREFIX%20sim%3A%3Chttp%3A%2F%2Fpurl.org%2Fontology%2Fsimilarity%2F%3E%20PREFIX%20source%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fsource%2F%3E%20PREFIX%20term%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fterminology%2F%3E%20PREFIX%20xref%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fxref%2F%3E%20PREFIX%20xsd%3A%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%3E%20SELECT%20%3Fpe%20count(%3Fentry)%20as%20%3Fcnt%20WHERE%20%7B%3Fentry%20%3Aexistence%20%3Fpe%7D%20group%20by%20%3Fpe&clientInfo=calipho%20group%20at%20SIB&applicationName=demo%20app%20for%20using%20SPARQL%20with%20protein%20existence";

        //        var peResource = $resource(
        //            url,
        //            {},
        //            {get : {method: "GET"}});

        var peResource = $http({
            url: url,
            skipAuthorization: true,
            method: 'GET'
        });

        var PeService = function () {};

        PeService.prototype.getPEInfo = function () {
            return peResource;
        };

        return new PeService();
    }

})(angular); //global variable