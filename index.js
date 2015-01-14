var http = require('http');
var config = require('./gopdxConfig.js');
var moment = require('moment');
var usage = require('./usage.js');
var chalk = require('chalk');
var inquirer = require('inquirer');
var _ = require('lodash');
var fs = require('fs');
var key = require('./key.js');

var inputs = process.argv;

function processInputs() {
    var numbersRegEx = new RegExp('[0-9]');
    if (!inputs[2]) {
        usage();
    }
    ;
    if (numbersRegEx.test(inputs[2])) {
        getArrivals(inputs[2], displayArrivals);
    }
    ;

    if (inputs[2] == '-l') {
        var address = inputs[3];
        address = address.toLowerCase();
        if (address.indexOf("oregon") == -1) {
            address += ' , oregon';
        }
        getNearbyStops(address, (inputs[4] || null), function (stops) {
            displayNearbyStops(stops)
        });
    }
    ;

    if (inputs[2] == '-f') {
        getArrivalsFromFavorites();
    }
    ;

}

function getArrivals(stop, callback) {

    var arrivals = '';
    http.get(config.apiServer + "/arrivals/" + stop + "?key=" + key(), function (res) {
        res.on('data', function (chunk) {
            arrivals += chunk.toString();
        });
        res.on('end', function () {

            arrivals = JSON.parse(arrivals);
            callback(stop, arrivals);

        })

        res.on('error', function (e) {
            console.error(e);
        });

    });
}

function getArrivalsFromFavorites() {
    var favorites = {};
    try {
        favorites = JSON.parse(fs.readFileSync("favorites.json", {encoding: 'utf8'}));
    }
    catch (err) {
        console.log("You don't appear to have a favorites file.\n" +
            "To create one: gopdx -l '123 NW 4th Ave.'");
        process.exit();
    }
    if (favorites.favoriteStops.length == 0) {
        console.log("Your favorites file has no stops.\n" +
            "To create one: gopdx -l '123 NW 4th Ave.'");
        process.exit();
    }
    favorites.favoriteStops.forEach(function (stop) {
        getArrivals(stop, displayArrivals);
    })
}

function displayArrivals(stop, arrivalData) {
    var arrivalsFound = 0;
    console.log(chalk.cyan('Stop number: ' + chalk.bold(stop)) + " " + chalk.green(arrivalData.resultSet.location[0].desc));
    if (arrivalData.resultSet.arrival) {
        arrivalData.resultSet.arrival.forEach(function (arrival) {
            if (arrival.departed == false) {
                arrivalsFound++;
                if (arrival.status == "scheduled") {
                    arrivalTime = moment(arrival.scheduled);
                    console.log(chalk.bold(arrival.shortSign) +
                    " " + arrivalTime.fromNow() + chalk.yellow(" [scheduled]"));
                }
                else {
                    arrivalTime = moment(arrival.estimated);
                    console.log(chalk.bold(arrival.shortSign) + " " + arrivalTime.fromNow() + chalk.green(" [actual]"));
                }
            }

        })
        if (arrivalsFound == 0) {
            console.log("Sorry, no arrivals currently found for that stop.");
        }
    }
    else {
        console.log("Sorry, no arrivals currently found for that stop.");
    }
}

function getNearbyStops(address, distance, callback) {
    var nearByStops = '';
    var distanceQueryString = '';
    if (distance) {
        var distanceQueryString = '?distance=' + distance;
    }
    getCoordinates(address, function (locationData) {

        lat = locationData[0].latLng.lat;
        lng = locationData[0].latLng.lng;
        http.get(config.apiServer + "/stops?lat=" + lat + "&lng=" + lng + "&key=" + key(), function (res) {
            var stops = '';
            res.on('data', function (chunk) {
                stops += chunk.toString();
            });
            res.on('end', function () {

                stops = JSON.parse(stops);
                displayNearbyStops(stops);

            });

            res.on('error', function (e) {
                console.error(e);
            });

        });
    })

}

function getCoordinates(address, callback) {

    http.get(config.apiServer + "/coordinates/" + encodeURI(address) + "?key=" + key(), function (res) {
        var mqData = '';

        res.on('data', function (chunk) {
            mqData += chunk.toString();
        });
        res.on('end', function () {
            mqData = JSON.parse(mqData);
            var oregonLocations = parseOregonLocations(mqData);
            if (oregonLocations.length == 0) console.log("No Oregon address found!");
            if (oregonLocations.length > 1) console.log("More than one location found!");
            callback(oregonLocations);
        });
        res.on('error', function (e) {
            console.log(e);
        });
    });
}

function displayNearbyStops(stops) {
    if (stops.resultSet.location) {
        var stopsArray = {favoriteStops: []};

        stops.resultSet.location.forEach(

            function (stop) {
                var lines = [];
                stop.route.forEach(function (route) {
                    lines.push("     " + route.desc + " " + route.dir[0].desc);
                });
                //console.log(stop);
                stopsArray.favoriteStops.push({name: stop.desc + " ID: " + stop.locid + "\n    Lines:\n" + lines.join('\n'), value: stop.locid});
            }
        )

        inquirer.prompt(
            {type: 'checkbox',
                name: 'favoriteStops',
                message: 'Please select any stops to save to your favorites:',
                choices: stopsArray.favoriteStops}, function (answer) {
                saveStopsToFavorites(answer);
            });
    }

    else {
        console.log("We couldn't find any stops for that area");
    }
}

function saveStopsToFavorites(selectedStops) {
    var favorites = {favoriteStops: []};
    try {
        favorites = JSON.parse(fs.readFileSync("favorites.json", {encoding: 'utf8'}));
    }
    catch (err) {
        //console.log(err);
    }

    favorites.favoriteStops = _.union(favorites.favoriteStops, selectedStops.favoriteStops);

    try {
        fs.writeFileSync("favorites.json", JSON.stringify(favorites), {encoding: 'utf8'});
        console.log("Stops saved to your favorites file. \n" +
            "To check arrivals from favorites use gopdx -f");
    }
    catch (err) {
        console.log("We couldn't write to your favorites file!\nMake sure NodeJS has write permissions for the gopdx" +
            "directory");
        console.log(err);
    }
}

function locationPicker(locations) {
    console.log("Your search returned more than one location. Please refine your search address.");

    return;
};

function parseOregonLocations(locationData) {
    var oregonLocations = [];
    locationData.forEach(function (item) {
        if (item.adminArea3 === 'OR') {
            oregonLocations.push(item);
        }
    });
    return oregonLocations;
}

processInputs();

