(function (angular, undefined) {
    'use strict';

    angular.module('np.homepage', [])
        .controller('hpCtrl', HomePageCtrl)
        //        .directive('hcPieChart', hcPieChart)
        .factory('peService', peService);

    HomePageCtrl.$inject = ['$scope', 'peService'];

    function HomePageCtrl($scope, peService) {

//        var nxColors = [],
//            base = "#C50063",
//            i;
//
//        for (i = 3; i < 10; i += 1) {
//            // Start out with a darkened base color (negative brighten), and end
//            // up with a much brighter color
//            nxColors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
//        }
//        console.log("nxColors");
//        console.log(nxColors);
//        var colors = Highcharts.map(nxColors, function (color) {
//            return {
//                radialGradient: {
//                    cx: 0.5,
//                    cy: 0.3,
//                    r: 0.7
//                },
//                stops: [
//                            [0, color],
//                            [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
//                        ]
//            };
//        });
//
//        var chartConfig = {
//            chart: {
//                type: 'pie'
//            },
//            tooltip: {
//                enabled: false
//            },
//            colors: colors,
//            series: [{
//                data: [],
//                startAngle: -50
//                }],
//            title: {
//                text: null
//            },
//            credits: {
//                enabled: false
//            }
//        };
        
        var pieColors = ["rgb(197,0,99)", "rgb(233,36,135)", "rgb(255,72,171)", "rgb(255,109,208)", "rgb(255,145,244)", "rgb(255,182,255)", "rgb(255,218,255)"];

        
        var container = "#release-chart";

        
        var width = 1000,
            height = 480,
            svg_full = d3.select(container)
            .attr(
                "style",
                "padding-bottom: " + Math.ceil(height * 100 / width) + "%"
            )
            .append("svg")
            .attr("viewBox", "0 0 " + width + " " + height);
        var defs = svg_full.append("defs");
        var id = "dropshadow";
        var deviation = 3;
        var offset = 4;
        var slope = 0.4;

        //var svg = d3.select("#yoursvg");
        var defs = svg_full.select("defs");
        
        pieColors.forEach(function(c,i){
            var radialGradient = defs
                .append("radialGradient")
                .attr("gradientUnits","userSpaceOnUse")
                .attr("id", "radial-gradient-"+i)
                .attr("cx", "0%")	//not really needed, since 50% is the default
				.attr("cy", "0%")	//not really needed, since 50% is the default
				.attr("r", "50%")	//not really needed, since 50% is the default;

//            var darker = d3.rgb(c).darker(2).toString();
            radialGradient.append("stop")
                .attr("offset", "30%")
                .attr("stop-opacity", "1")
                .attr("stop-color", c);
            
            var darker = d3.rgb(c).darker(2).toString();
//            console.log(darker);
            radialGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-opacity", "1")
                .attr("stop-color", darker);
        })
        
        //FILTER FOR RADIAL GRADIENT : 
        
//        var radialGradient = defs
//            .append("radialGradient")
//            .attr("id", "radial-gradient");
//
//        radialGradient.append("stop")
//            .attr("offset", "0%")
//                .attr("stop-opacity", "1")
//            .attr("stop-color", "red");
//
//        radialGradient.append("stop")
//            .attr("offset", "100%")
//                .attr("stop-opacity", "1")
//            .attr("stop-color", "#fff");

        
        
        // FILTER FOR SHADOW :

        // create filter and assign provided id
        var filter = defs.append("filter")
            .attr("height", "125%") // adjust this if shadow is clipped
            .attr("id", id);

        // ambient shadow into ambientBlur
        //   may be able to offset and reuse this for cast, unless modified
        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", deviation)
            .attr("result", "ambientBlur");

        // cast shadow into castBlur
        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", deviation)
            .attr("result", "castBlur");

        // offsetting cast shadow into offsetBlur
        filter.append("feOffset")
            .attr("in", "castBlur")
            .attr("dx", offset - 1)
            .attr("dy", offset)
            .attr("result", "offsetBlur");

        // combining ambient and cast shadows
        filter.append("feComposite")
            .attr("in", "ambientBlur")
            .attr("in2", "offsetBlur")
            .attr("result", "compositeShadow");

        // applying alpha and transferring shadow
        filter.append("feComponentTransfer")
            .append("feFuncA")
            .attr("type", "linear")
            .attr("slope", slope);

        // merging and outputting results
        var feMerge = filter.append("feMerge");
        feMerge.append('feMergeNode');
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
        
        var svg = svg_full
            .append("g")

        svg.append("g")
            .attr("class", "slices");
        svg.append("g")
            .attr("class", "labels");
        svg.append("g")
            .attr("class", "lines");
        
        
//        var title = svg.append("text")
//            .attr("text-anchor", "middle")
//            .attr("class","pe_title")
//            .attr('font-size', '38px');
//        title.append("tspan").attr("x", 0).attr("y", -50).attr("dy", "1em").text("Protein");
//        title.append("tspan").attr("x", 0).attr("y", -50).attr("dy", "2.1em").text("existence");
        

        var radius = Math.min(width, height) / 2;


        var pie = d3.layout.pie()
            .padAngle(.03)
            .sort(null)
            .value(function (d) {
                return d.value;
            });

        
        var arc = d3.svg.arc()
            .outerRadius(radius * 0.8)
            .innerRadius(radius * 0.4)
            .startAngle(function (d) {
                return d.startAngle - Math.PI / 2;
            })
            .endAngle(function (d) {
                return d.endAngle - Math.PI / 2;
            });

        var arcPath = d3.svg.arc()
            .outerRadius(radius * 0.8)
            .innerRadius(radius * 0.8)
            .startAngle(function (d) {
                return d.startAngle - Math.PI / 2;
            })
            .endAngle(function (d) {
                return d.endAngle - Math.PI / 2;
            });

        
        var outerArc = d3.svg.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 1)
            .startAngle(function (d) {
                return d.startAngle - Math.PI / 2;
            })
            .endAngle(function (d) {
                return d.endAngle - Math.PI / 2;
            });

        svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var key = function (d) {
            return d.data.label;
        };

//        var data_existence = [{
//            "desc": "Evidence at protein level (17045)",
//            "name": "evidence_at_protein_level",
//            "y": 17045
//        }, {
//            "desc": "Evidence at transcript level (1912)",
//            "name": "evidence_at_transcript_level",
//            "y": 1912
//        }, {
//            "desc": "Inferred from homology (555)",
//            "name": "inferred_from_homology",
//            "y": 555
//        }, {
//            "desc": "Uncertain (571)",
//            "name": "uncertain",
//            "y": 571
//        }, {
//            "desc": "Predicted (96)",
//            "name": "predicted",
//            "y": 96
//        }]
        
        var initialData = [{
            "desc": "Evidence at protein level (17045)",
            "name": "evidence_at_protein_level",
            "y": 105
        }, {
            "desc": "Evidence at transcript level (1912)",
            "name": "evidence_at_transcript_level",
            "y": 104
        }, {
            "desc": "Inferred from homology (555)",
            "name": "inferred_from_homology",
            "y": 103
        }, {
            "desc": "Uncertain (571)",
            "name": "uncertain",
            "y": 102
        }, {
            "desc": "Predicted (96)",
            "name": "predicted",
            "y": 101
        }]

        var color = d3.scale.ordinal()
//            .domain(["Lorem ipsum", "dolor sit", "amet", "consectetur", "adipisicing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt"])
            .domain(initialData.map(function(d){return d.desc}))
//            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
//            .range(["#c50063", "#C4234D", "#C44738", "#C46B23", "#C48F0E", "#d0743c", "#ff8c00"]);
//            .range(["#A30052", "#C50063", "#F5007A", "#FF3399", "#FF5CAD", "#d0743c", "#ff8c00"]);
//            .range(["#9C0050", "#C50063", "#D32980", "#984ABB", "#8428AC", "#d0743c", "#ff8c00"]);
            .range(["#C50063", "#D32980", "#DB5096","#984ABB", "#8428AC", "#d0743c", "#ff8c00"]);


        function transformData(dataRelease) {
            return dataRelease.map(function (d) {
                return {
                    label: d.desc,
                    value: d.y
                }
            });
        }
        

        change(transformData(initialData));

        function change(data) {

            /* ------- PIE SLICES -------*/
            var slice = svg.select(".slices").selectAll("path.slice")
                .data(pie(data), key);

            slice.enter()
                .insert("path")
                .style("fill", function (d) {
                    return color(d.data.label);
                })
//                .style("stroke","white")
//                .style("stroke-width","1")
//                .style("stroke-linejoin","round")
                .attr("class", "slice")
                .style("fill", function(d,i){return "url(#radial-gradient-"+i+")"})
                .attr("filter", "url(#dropshadow)");

            slice
                .transition().duration(3000)
                .attrTween("d", function (d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function (t) {
                        return arc(interpolate(t));
                    };
                })

            slice.exit()
                .remove();

            /* ------- TEXT LABELS -------*/

            var text = svg.select(".labels").selectAll("text")
                .data(pie(data), key);

            text.enter()
                .append("text")
                .attr("dy", ".35em")
                .style("letter-spacing","0.5px")
                .text(function (d) {
                    return d.data.label;
                })
                .call(wrap);

            function wrap(text) {
                text.each(function () {
                    var text = d3.select(this),
                        words = text.text().split(/\s+/).reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 0.6, // ems
                        y = text.attr("y"),
                        dy = parseFloat(text.attr("dy")),
                        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                    while (word = words.pop()) {
                        line.push(word);
                        tspan.text(line.join(" "));
                        if (tspan.text().length > 17) {
                            //                  if (tspan.node().getComputedTextLength() > 150) {
                            line.pop();
                            tspan.text(line.join(" "));
                            line = [word];
                            lineHeight = lineNumber > 0 ? 0.4 : 0.6;
                            var position = ++lineNumber * dy + lineHeight;
                            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", position + "em").text(word);
                        }
                    }
                });
            }

            function midAngle(d) {
                var midA = (d.startAngle + 3 * Math.PI / 2) + ((d.endAngle + 3 * Math.PI / 2) - (d.startAngle + 3 * Math.PI / 2)) / 2;
                return midA > 2 * Math.PI ? midA - 2 * Math.PI : midA;
            }

            text.transition().duration(3000)
                .attrTween("transform", function (d,i) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function (t) {
                        
                        var d2 = interpolate(t);
                        var pos = outerArc.centroid(d2);
                        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
//                        console.log("index ??");
//                        console.log(i);
                        pos[1] = i === 4 ? pos[1] - 10 : pos[1];
                        pos[1] = i === 3 ? pos[1] + 5 : pos[1];
                        return "translate(" + pos + ")";
                    };
                })
                .styleTween("text-anchor", function (d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function (t) {
                        var d2 = interpolate(t);
                        return midAngle(d2) < Math.PI ? "start" : "end";
                    };
                });

            text.exit()
                .remove();

            /* ------- SLICE TO TEXT POLYLINES -------*/

            var polyline = svg.select(".lines").selectAll("polyline")
                .data(pie(data), key);

            polyline.enter()
                .append("polyline");

            polyline.transition().duration(3000)
                .attrTween("points", function (d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function (t) {
                        var d2 = interpolate(t);
                        var pos = outerArc.centroid(d2);
                        var pos2 = arc.centroid(d2);
                        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                        return [arcPath.centroid(d2), outerArc.centroid(d2), pos];
                    };
                });

            polyline.exit()
                .remove();
        };

        peService.getPEInfo().success(function (result) {
            // Sample data for pie chart
            var seriesData = [];
            var peStats = result.results.bindings;
            peStats.sort(function (a, b) {
                return a.cnt.value > b.cnt.value
            })
            peStats.forEach(function (data, index) {
                var id = data.pe.value.split("#")[1].toLowerCase();
                var value = parseInt(data.cnt.value);
//                seriesData.push({
//                    "name": "<div class='peLabels' id='" + id + "'>" + data.pe.value.split("#")[1].replace(/_/g, " ") + " (" + value + ")</div>",
//                    "y": value
//                });
                seriesData.push({
                    "desc":data.pe.value.split("#")[1].replace(/_/g, " ") + " (" + value + ")",
                    "name":id,
                    "y":value
                })
            });
            //            change(initialData);
            //            setTimeout(function(){change(initialData)},3000);
//            console.log("seriesData");
//            console.log(JSON.stringify(seriesData));
            //            chartConfig.series[0].data = seriesData;
            //            setTimeout(function(){var chart = Highcharts.chart("hp-chart",chartConfig)},1000)
            //            createChart("#release-chart");

            setTimeout(function () {
                change(transformData(seriesData))
            }, 1000);


        });
    }

    peService.$inject = ['$resource', '$http', 'config', 'nxBaseUrl'];

    function peService($resource, $http, config, nxBaseUrl) {
        //var domain = nxBaseUrl.getDomain("api");
        var url = config.api.API_URL + "/sparql?output=json&query=PREFIX%20%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%23%3E%20PREFIX%20annotation%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fannotation%2F%3E%20PREFIX%20context%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fcontext%2F%3E%20PREFIX%20cv%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fterminology%2F%3E%20PREFIX%20db%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fdb%2F%3E%20PREFIX%20dc%3A%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%3E%20PREFIX%20dcterms%3A%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F%3E%20PREFIX%20entry%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fentry%2F%3E%20PREFIX%20evidence%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fevidence%2F%3E%20PREFIX%20foaf%3A%3Chttp%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F%3E%20PREFIX%20gene%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fgene%2F%3E%20PREFIX%20identifier%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fidentifier%2F%3E%20PREFIX%20isoform%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fisoform%2F%3E%20PREFIX%20mo%3A%3Chttp%3A%2F%2Fpurl.org%2Fontology%2Fmo%2F%3E%20PREFIX%20ov%3A%3Chttp%3A%2F%2Fopen.vocab.org%2Fterms%2F%3E%20PREFIX%20owl%3A%3Chttp%3A%2F%2Fwww.w3.org%2F2002%2F07%2Fowl%23%3E%20PREFIX%20publication%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fpublication%2F%3E%20PREFIX%20rdf%3A%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20PREFIX%20rdfs%3A%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%20PREFIX%20sim%3A%3Chttp%3A%2F%2Fpurl.org%2Fontology%2Fsimilarity%2F%3E%20PREFIX%20source%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fsource%2F%3E%20PREFIX%20term%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fterminology%2F%3E%20PREFIX%20xref%3A%3Chttp%3A%2F%2Fnextprot.org%2Frdf%2Fxref%2F%3E%20PREFIX%20xsd%3A%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%3E%20SELECT%20%3Fpe%20count(%3Fentry)%20as%20%3Fcnt%20WHERE%20%7B%3Fentry%20%3Aexistence%20%3Fpe%7D%20group%20by%20%3Fpe&clientInfo=calipho%20group%20at%20SIB&applicationName=demo%20app%20for%20using%20SPARQL%20with%20protein%20existence";

        var peResource = $http({
            url: url,
            skipAuthorization: true,
            method: 'GET',
            headers: {
             "Accept": "application/sparql-results+json"
            }
        });

        var PeService = function () {};

        PeService.prototype.getPEInfo = function () {
            return peResource;
        };

        return new PeService();
    }

})(angular); //global variable