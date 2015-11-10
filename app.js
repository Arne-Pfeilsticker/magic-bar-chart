// Create a new Chiasm instance.
var chiasm = new Chiasm();

// Register plugins that the configuration can access.
chiasm.plugins.layout = ChiasmLayout;
chiasm.plugins.links = ChiasmLinks;
chiasm.plugins.dsvDataset = ChiasmDsvDataset;
chiasm.plugins.barChart = BarChart;
chiasm.plugins.dataReduction = ChiasmDataReduction;

angular
    .module("magicBarChart", [])
    .controller("magicBarChartCtrl", function ($scope){

        $scope.params = {
            numBins: 30,
            orientation: "vertical",
            barColor: "#005555"
        };

        $scope.datasets = ["iris", "adult", "auto-mpg"];
        $scope.params.selectedDataset = "iris";

        $scope.columns = [];
        $scope.params.selectedColumn = "";

        $scope.$watch("params", function (params){
            chiasm.setConfig(generateConfig(params));
        }, true);

        $scope.numericColumnSelected = function (){
            return $scope.params.selectedColumn.type === "number";
        };

        chiasm.getComponent("loader").then(function (loader){
            loader.when("dataset", function (dataset){
                $scope.columns = dataset.metadata.columns;
                $scope.params.selectedColumn = $scope.columns[2];
                $scope.$digest();
            });
        });
    });

function generateConfig(params){
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
                "path": params.selectedDataset
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
