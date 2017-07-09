const Main = require('./application/Main.js');

module.exports = {
    searchHistory
};

function searchHistory(callback) {
    Main.main(function(result) {
        callback(result);
    });
}
