(function (cApp) {
    'use strict';

    cApp.controller('CrossfilterChiasmController', CrossfilterChiasmController);

    //CrossfilterChiasmController.$inject = ['$scope', 'chiasmService'];
    //function CrossfilterChiasmController($scope, chiasmService) {

    CrossfilterChiasmController.$inject = ['$scope'];
    function CrossfilterChiasmController($scope) {
        var vm = this;

        vm.loading = true;

        $scope.chiasm = chiasmService();

        function chiasmService() {

            // Create a new Chiasm instance.
            var chiasm = new Chiasm();

            // Register plugins that the configuration can access.
            chiasm.plugins.layout = ChiasmLayout;
            chiasm.plugins.links = ChiasmLinks;
            chiasm.plugins.barChart = BarChart;
            chiasm.plugins.csvLoader = ChiasmCSVLoader;
            chiasm.plugins.flightsPreprocessor = FlightsPreprocessor;
            chiasm.plugins.crossfilter = ChiasmCrossfilter;

            // Set the Chaism configuration.
            chiasm.setConfig({
                "layout": {
                    "plugin": "layout",
                    "state": {
                        "containerSelector": "#chiasm-container",
                        "layout": {
                            "orientation": "vertical",
                            "children": [
                                {
                                    "orientation": "horizontal",
                                    "children": [
                                        "hour-chart",
                                        "delay-chart",
                                        "distance-chart"
                                    ]
                                },
                                "date-chart"
                            ]
                        },
                        "sizes": {
                            "distance-chart": {
                                "size": 1.5
                            }
                        }
                    }
                },
                "hour-chart": {
                    "plugin": "barChart",
                    "state": {
                        "title": "Time of Day",
                        "yColumn": "value",
                        "xColumn": "key"
                    }
                },
                "delay-chart": {
                    "plugin": "barChart",
                    "state": {
                        "title": "Arrival Delay (min.)",
                        "yColumn": "value",
                        "xColumn": "key"
                    }
                },
                "distance-chart": {
                    "plugin": "barChart",
                    "state": {
                        "title": "Distance (mi.)",
                        "yColumn": "value",
                        "xColumn": "key"
                    }
                },
                "date-chart": {
                    "plugin": "barChart",
                    "state": {
                        "title": "Date",
                        "yColumn": "value",
                        "xColumn": "key"
                    }
                },
                "flights-dataset": {
                    "plugin": "csvLoader",
                    "state": {
                        // for development
                        "path": "./data/flights-3m"
                        // for production
                        //"path": "http://bl.ocks.org/curran/raw/ca04856ca6afbc563957/flights-3m"
                    }
                },
                "flights-preprocessor": {
                    "plugin": "flightsPreprocessor"
                },
                "flights-crossfilter": {
                    "plugin": "crossfilter",
                    "state": {
                        "groups": {
                            "dates": {
                                "dimension": "date",
                                "aggregation": "day"
                            },
                            "hours": {
                                "dimension": "hour",
                                "aggregation": "floor 1"
                            },
                            "delays": {
                                "dimension": "delay",
                                "aggregation": "floor 10"
                            },
                            "distances": {
                                "dimension": "distance",
                                "aggregation": "floor 50"
                            }
                        }
                    }
                },
                "links": {
                    "plugin": "links",
                    "state": {
                        "bindings": [
                            "flights-dataset.data -> flights-preprocessor.dataIn",
                            "flights-preprocessor.dataOut -> flights-crossfilter.data",

                            "flights-crossfilter.hours -> hour-chart.data",
                            "flights-crossfilter.delays -> delay-chart.data",
                            "flights-crossfilter.distances -> distance-chart.data",
                            "flights-crossfilter.dates -> date-chart.data",

                            "hour-chart.brushIntervalX -> flights-crossfilter.hourFilter",
                            "delay-chart.brushIntervalX -> flights-crossfilter.delayFilter",
                            "distance-chart.brushIntervalX -> flights-crossfilter.distanceFilter",
                            "date-chart.brushIntervalX -> flights-crossfilter.dateFilter"
                        ]
                    }
                }
            });

            return chiasm;
        }
    }
})(angular.module('cApp'));