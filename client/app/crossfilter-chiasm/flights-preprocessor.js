// This does custom data preprocessing for the flight data.
// Modified from Crossfilter example code: https://github.com/square/crossfilter/blob/gh-pages/index.html#L231
function FlightsPreprocessor() {
    var my = new ChiasmComponent();

    my.when("dataIn", function (dataIn){
        my.dataOut = dataIn.map(function (d){
            d.date = parseDate(d.date);
            d.hour = d.date.getHours() + d.date.getMinutes() / 60;
            d.delay = Math.max(-60, Math.min(149, d.delay));
            d.distance = Math.min(1999, d.distance);
            return d;
        });
    });

    function parseDate(d) {
        return new Date(2001,
            d.substring(0, 2) - 1,
            d.substring(2, 4),
            d.substring(4, 6),
            d.substring(6, 8));
    }

    return my;
}
