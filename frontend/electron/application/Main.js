const ChromeHistoryReader = require('./ChromeHistoryReader');
const ScoringMachine = require('./ScoringMachine');
const FilteringMachine = require('./FilteringMachine');

module.exports = {
    main
};

function main(callback) {
    // Get Chrome history
    ChromeHistoryReader.readDB((chromeHistory) => {

        // Score the history based on relevance
        var sortedHistory = ScoringMachine.sortObjects(chromeHistory);

        // Shrink the array to 1000 elements max
        sortedHistory = shrinkArray(sortedHistory, 1000);

        // Filter the history to get more accurate data
        var filteredHistory = FilteringMachine.filter(sortedHistory);

        // Print
        var pretty = prettyJSON(shrinkArray(filteredHistory, 15));
        console.log(pretty);

        // Callback to notify that we're finished
        callback(pretty);
    });
}

function prettyJSON(obj) {
    return JSON.stringify(obj, null, "\t");
}

function shrinkArray(data, amountToReturn) {
    if (data.length <= amountToReturn) {
        return data;
    }

    var temp = [];
    for (var i = 0; i < amountToReturn; i++) {
        temp.push(data[i]);
    }
    return temp;
}
