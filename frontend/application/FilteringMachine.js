const URL = require('url');

// This defines the maximum amount of results we allow of a single domain
const MAX_RESULTS = 3;

module.exports = {
    filter
};

var domains = [];

function filter(data) {
    var filteredData = [];

    for (var i = 0; i < data.length; i++) {
        var domain = URL.parse(data[i].url).hostname;
        var matchingDomains = domainMatches(domain);

        if (matchingDomains < MAX_RESULTS) {
            filteredData.push(data[i]);
            domains.push(domain);
        }
    }
    return filteredData;
}

// Given a domain, it returns how many times that domain has occurred
function domainMatches(domain) {
    var matches = 0;
    for (var i = 0; i < domains.length; i++) {
        if (domains[i] == domain) {
            matches++;
        }
    }
    return matches;
}
