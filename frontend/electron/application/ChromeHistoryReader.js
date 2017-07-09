const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');
const fs = require('fs');
const ScoringMachine = require('./ScoringMachine');

// Reads the chrome history DB and calls back with the JSON array
module.exports = {
	readDB
}

function readDB(callback) {
	// Chrome history file on Mac
	var historyFile;
	if(os.platform() === 'darwin') {
		historyFile = path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome', 'Default', 'History' );
	} else if(os.platform() === 'win32') {
		historyFile = path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default', 'History');
	} else {
		console.log('Your computer is too good, so it is not supported.');
	}
	console.log('History File:', historyFile);

	// Copy DB to a swap file so we can read it, even if chrome is open!
	var swapHistoryFile = path.join(os.homedir(), 'puppy_swap.db');
	copyFile(historyFile, swapHistoryFile).then( () => {

		var db = new sqlite3.Database(swapHistoryFile);

		// Query DB for history
		db.all("SELECT * FROM urls", (err, rows) => {
			var jsonArr = [];

			if (err) {
				console.log("Error reading DB!");
				fs.unlink(swapHistoryFile);
				console.log(err);
			}

			rows.forEach( (row) => {
				if (checkBlacklisted(row.url)) {
					return;
				}

				if (filterURL(row.url)) {
					return;
				}

				var obj = {
					score: ScoringMachine.getScore(row),
					url: row.url,
					title: row.title
				}

				jsonArr.push(obj);
			});

			callback(jsonArr);
		});

		db.close();
		fs.unlink(swapHistoryFile);
	});
}

function filterURL(url) {

	// Youtube filter
	if (url.includes("youtube.com/") && !url.includes("watch?v=")) {
		return true;
	}

	return false;
}

function checkBlacklisted(url) {
	var blacklistedURLs = [
		"https://www.reddit.com/",
		"https://www.facebook.com/",
		"https://www.messenger.com/",
		"https://www.amazon.com/"
	];

	var blacklistedContains = [
		"google.com/"
	];

	for (var i = 0; i < blacklistedURLs.length; i++)
		if (url == blacklistedURLs[i])
			return true;

	for (var i = 0; i < blacklistedContains.length; i++)
		if (url.includes(blacklistedContains[i]))
			return true;

	return false;
}

// Copies file using Promise
function copyFile(source, target) {
    return new Promise(function(resolve, reject) {
	    var rd = fs.createReadStream(source);
        rd.on('error', rejectCleanup);
        var wr = fs.createWriteStream(target);
        wr.on('error', rejectCleanup);
        function rejectCleanup(err) {
            rd.destroy();
            wr.end();
            reject(err);
        }
        wr.on('finish', resolve);
        rd.pipe(wr);
    });
}
