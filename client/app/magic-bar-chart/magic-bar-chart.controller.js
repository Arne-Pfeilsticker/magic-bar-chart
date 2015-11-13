(function () {
    'use strict';

    angular.module('cApp').controller('MagicBarChartController', MagicBarChartController);

    //MagicBarChartController.$inject = ['$scope', 'chiasmService'];
    //function MagicBarChartController($scope, chiasmService) {

    MagicBarChartController.$inject = ['$scope'];
    function MagicBarChartController($scope) {

        $scope.chiasm = chiasmService();

        $scope.params = {
            numBins: 30,
            orientation: "vertical",
            barColor: "#005555"
        };

        $scope.datasets = ('iris adult auto-mpg').split(' ').map(function (dataset) {
            return {name: dataset};
        });

        $scope.params.selectedDataset = "iris";

        $scope.columns = [];
        $scope.params.selectedColumn = "";

        $scope.$watch("params", function (params) {
            $scope.chiasm.setConfig(generateConfig(params));
        }, true);

        $scope.numericColumnSelected = function () {
            return $scope.params.selectedColumn.type === "number";
        };

        $scope.chiasm.getComponent("loader").then(function (loader) {
            loader.when("dataset", function (dataset) {
                $scope.columns = dataset.metadata.columns;
                //console.log($scope.columns)
                $scope.params.selectedColumn = $scope.columns[2];
                $scope.$digest();
            });
        });

        function chiasmService() {

            var chiasm = new Chiasm();

            // Register plugins that the configuration can access.
            chiasm.plugins.layout = ChiasmLayout;
            chiasm.plugins.links = ChiasmLinks;
            chiasm.plugins.dsvDataset = ChiasmDsvDataset;
            chiasm.plugins.barChart = BarChart;
            chiasm.plugins.dataReduction = ChiasmDataReduction;

            return chiasm;

            // This is an example Chaism plugin that uses D3 to make a bar chart.
            // Draws from this Bar Chart example http://bl.ocks.org/mbostock/3885304
            function BarChart() {

                var my = ChiasmComponent({

                    margin: {
                        left: 150,
                        top: 30,
                        right: 30,
                        bottom: 60
                    },

                    sizeColumn: Model.None,
                    sizeLabel: Model.None,

                    idColumn: Model.None,
                    idLabel: Model.None,

                    orientation: "vertical",

                    // These properties adjust spacing between bars.
                    // The names correspond to the arguments passed to
                    // d3.scale.ordinal.rangeRoundBands(interval[, padding[, outerPadding]])
                    // https://github.com/mbostock/d3/wiki/Ordinal-Scales#ordinal_rangeRoundBands
                    barPadding: 0.1,
                    barOuterPadding: 0.1,

                    fill: "black",
                    stroke: "none",
                    strokeWidth: "1px",

                    // Desired number of pixels between tick marks.
                    xAxisTickDensity: 50,

                    // Translation down from the X axis line (pixels).
                    xAxisLabelOffset: 50,

                    // Desired number of pixels between tick marks.
                    yAxisTickDensity: 30,

                    // Translation left from the X axis line (pixels).
                    yAxisLabelOffset: 45

                });

                // This scale is for the length of the bars.
                var sizeScale = d3.scale.linear();

                my.el = document.createElement("div");
                var svg = d3.select(my.el).append("svg");
                var g = svg.append("g");

                var xAxis = d3.svg.axis().orient("bottom");
                var xAxisG = g.append("g").attr("class", "x axis");
                var xAxisLabel = xAxisG.append("text")
                    .style("text-anchor", "middle")
                    .attr("class", "label");

                var yAxis = d3.svg.axis().orient("left");
                var yAxisG = g.append("g").attr("class", "y axis");
                var yAxisLabel = yAxisG.append("text")
                    .style("text-anchor", "middle")
                    .attr("class", "label");

                // TODO think about adding this stuff as configurable
                // .tickFormat(d3.format("s"))
                // .outerTickSize(0);

                my.when("xAxisLabelText", function (xAxisLabelText) {
                    xAxisLabel.text(xAxisLabelText);
                });
                my.when(["width", "xAxisLabelOffset"], function (width, offset) {
                    xAxisLabel.attr("x", width / 2).attr("y", offset);
                });

                my.when(["height", "yAxisLabelOffset"], function (height, offset) {
                    yAxisLabel.attr("transform", [
                        "translate(-" + offset + "," + (height / 2) + ") ",
                        "rotate(-90)"
                    ].join(""));
                });
                my.when("yAxisLabelText", function (yAxisLabelText) {
                    yAxisLabel.text(yAxisLabelText);
                });

                // Respond to changes in size and margin.
                // Inspired by D3 margin convention from http://bl.ocks.org/mbostock/3019563
                my.when("box", function (box) {
                    svg.attr("width", box.width)
                        .attr("height", box.height);
                });
                my.when(["box", "margin"], function (box, margin) {
                    my.width = box.width - margin.left - margin.right;
                    my.height = box.height - margin.top - margin.bottom;
                    g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                });

                my.when("height", function (height) {
                    xAxisG.attr("transform", "translate(0," + height + ")");
                });

                my.when(["idColumn", "dataset"],
                    function (idColumn, dataset) {

                        // This metadata is only present for aggregated numeric columns.
                        var meta = dataset.metadata[idColumn];
                        var idScale;

                        if (meta) {

                            // Handle the case of an aggregated numeric column.
                            idScale = d3.scale.linear();
                            idScale.domain(meta.domain);
                            idScale.rangeBand = function () {
                                return Math.abs(idScale(meta.step) - idScale(0));
                            };
                            idScale.rangeBands = function (extent) {
                                idScale.range(extent);
                            };
                            idScale.step = meta.step;
                        } else {

                            // Handle the case of a string (categorical) column.
                            idScale = d3.scale.ordinal();
                            idScale.domain(dataset.data.map(function (d) {
                                return d[idColumn];
                            }));
                            idScale.step = "";
                        }
                        my.idScale = idScale;
                    });

                my.when("dataset", function (dataset) {
                    my.data = dataset.data;
                    my.metadata = dataset.metadata;
                });

                my.when(["data", "sizeColumn", "idScale", "idColumn", "width", "height", "orientation", "idLabel", "sizeLabel", "barPadding", "barOuterPadding"],
                    function (data, sizeColumn, idScale, idColumn, width, height, orientation, idLabel, sizeLabel, barPadding, barOuterPadding) {

                        if (sizeColumn !== Model.None) {

                            // TODO separate out this logic.
                            sizeScale.domain([0, d3.max(data, function (d) {
                                return d[sizeColumn];
                            })]);

                            if (orientation === "vertical") {

                                sizeScale.range([height, 0]);
                                idScale.rangeBands([0, width], barPadding, barOuterPadding);

                                my.barsX = function (d) {
                                    return idScale(d[idColumn]);
                                };
                                my.barsY = function (d) {
                                    return sizeScale(d[sizeColumn]);
                                };
                                my.barsWidth = idScale.rangeBand();
                                my.barsHeight = function (d) {
                                    return height - my.barsY(d);
                                };

                                my.xScale = idScale;
                                if (idLabel !== Model.None) {
                                    my.xAxisLabelText = idLabel;
                                }

                                my.yScale = sizeScale;
                                if (sizeLabel !== Model.None) {
                                    my.yAxisLabelText = sizeLabel;
                                }

                            } else if (orientation === "horizontal") {

                                sizeScale.range([0, width]);
                                idScale.rangeBands([height, 0], barPadding, barOuterPadding);

                                my.barsX = 0;
                                my.barsY = function (d) {

                                    // Using idScale.step here is kind of an ugly hack to get the
                                    // right behavior for both linear and ordinal id scales.
                                    return idScale(d[idColumn] + idScale.step);
                                };
                                my.barsWidth = function (d) {
                                    return sizeScale(d[sizeColumn]);
                                };
                                my.barsHeight = idScale.rangeBand();

// TODO flip vertically for histogram mode.
//        my.barsX = 0;
//        my.barsWidth = function(d) { return sizeScale(d[sizeColumn]); };
//        my.barsHeight = Math.abs(idScale.rangeBand());
//        my.barsY = function(d) {
//          return idScale(d[idColumn]) - my.barsHeight;
//        };

                                my.xScale = sizeScale;
                                if (sizeLabel !== Model.None) {
                                    my.xAxisLabelText = sizeLabel;
                                }

                                my.yScale = idScale;
                                if (idLabel !== Model.None) {
                                    my.yAxisLabelText = idLabel;
                                }

                            }
                        }
                    });

                my.when(["data", "barsX", "barsWidth", "barsY", "barsHeight"],
                    function (data, barsX, barsWidth, barsY, barsHeight) {

                        my.bars = g.selectAll("rect").data(data);
                        my.bars.enter().append("rect")

                            // This makes it so that there are no anti-aliased spaces between the bars.
                            .style("shape-rendering", "crispEdges");

                        my.bars.exit().remove();
                        //my.bars
                        //    .attr("x",      barsX)
                        //    .attr("width",  barsWidth)
                        //    .attr("y",      barsY)
                        //    .attr("height", barsHeight);
                        my.bars.attr("x", barsX);
                        my.bars.attr("width", barsWidth);
                        my.bars.attr("y", barsY);
                        my.bars.attr("height", barsHeight);


                        // Withouth this line, the bars added in the enter() phase
                        // will flash as black for a fraction of a second.
                        updateBarStyles();

                    });

                function updateBarStyles() {
                    my.bars
                        .attr("fill", my.fill)
                        .attr("stroke", my.stroke)
                        .attr("stroke-width", my.strokeWidth);
                }

                my.when(["bars", "fill", "stroke", "strokeWidth"], updateBarStyles)

                my.when(["xScale", "width", "xAxisTickDensity"],
                    function (xScale, width, density) {
                        xAxis.scale(xScale).ticks(width / density);
                        xAxisG.call(xAxis);
                    });

                my.when(["yScale", "height", "yAxisTickDensity"],
                    function (yScale, height, density) {
                        yAxis.scale(yScale).ticks(height / density);
                        yAxisG.call(yAxis);
                    });

                return my;
            }
        }


        function generateConfig(params) {
            return {
                "layout": {
                    "plugin": "layout",
                    "state": {
                        "containerSelector": "#chiasm-container",
                        "layout": "visualization"
                    }
                },
                "visualization": {
                    "plugin": "barChart",
                    "state": {
                        "sizeColumn": "count",
                        "sizeLabel": "Count",
                        "idColumn": params.selectedColumn.name,
                        "idLabel": params.selectedColumn.label,
                        "orientation": params.orientation,
                        "fill": params.barColor
                    }
                },
                "loader": {
                    "plugin": "dsvDataset",
                    "state": {
                        "path": 'data/' + params.selectedDataset
                    }
                },
                "reduction": {
                    "plugin": "dataReduction",
                    "state": {
                        "aggregate": {
                            "dimensions": [{
                                "column": params.selectedColumn.name,
                                "histogram": params.selectedColumn.type !== "string",
                                "numBins": parseFloat(params.numBins)
                            }],
                            "measures": [{
                                "outColumn": "count",
                                "operator": "count"
                            }]
                        }
                    }
                },
                "links": {
                    "plugin": "links",
                    "state": {
                        "bindings": [
                            "loader.dataset -> reduction.datasetIn",
                            "reduction.datasetOut -> visualization.dataset"
                        ]
                    }
                }
            };
        }
    }
})();