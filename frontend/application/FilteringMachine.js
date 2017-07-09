const URL = require('url');

// This defines the maximum amount of results we allow of a single domain
const MAX_RESULTS = 1;

module.exports = {
    filter
};

function filter(data) {
    return (
        filterBlacklistedDomains (
            filterDuplicateDomains (
                data
            )
        )
    );
}

function filterDuplicateDomains(data) {
    var filteredData = [];
    var domains = [];

    for (var i = 0; i < data.length; i++) {
        var domain = URL.parse(data[i].url).hostname;
        var matchingDomains = domainMatches(domain);

        if (matchingDomains < MAX_RESULTS) {
            filteredData.push(data[i]);
            domains.push(domain);
        }
    }
    return filteredData;

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
}

function filterBlacklistedDomains(data) {
    var filteredData = [];

    var fullyBlacklisted = [
        "facebook.com",
        "reddit.com",
        "twitter.com",
        "youtube.com",
        "gmail.com",
        "google+.com",
        "linkedin.com",
        "askfm.com",
        "twitch.tv",
        "instagram.com",
        "myspace.com",
        "netflix.com",
        "ashleymadison.com",
        "christianmingle.com",
        "yahoo.com",
        "aol.com",
        "msn.com",
        "hotmail.com",
        "timewarner.com",
        "verizonwireless.com",
        "att.com",
        "sprint.com",
        "t-mobile.com",
        "virginmobile.com",
        "metropcs.com",
        "bankofamerica.com",
        "chase.com",
        "wellsfargo.com",
        "westernunion.com",
        "ebay.com",
        "amazon.com",
        "craigslist.com",
        "discord.gg",
        "discordapp.com",
        "tumblr.com ",
        "costco.com",
        "walmart.com",
        "samsclub.com",
        "target.com",
        "messenger.com",
        "github.com",
        "coinbase.com",
        "hbonow.com",
        "://localhost",
        "file://",
        "dropbox.com",
        "selly.gg"
    ];

    var partiallyBlacklisted = [

    ];

    for (var i = 0; i < data.length; i++) {
        var flagged = false;
        for (var j = 0; j < fullyBlacklisted.length; j++) {
            if (data[i].url.includes(fullyBlacklisted[j])) {
                flagged = true;
                break;
            }
        }
        if (!flagged) {
            filteredData.push(data[i]);
        }
    }

    return filteredData;
}
