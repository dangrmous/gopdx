#! /usr/bin/env node

var http = require('http');
var config = require('./gopdxConfig.js');
var moment = require('moment');
var usage = require('./usage.js');
var chalk = require('chalk');
var inquirer = require('inquirer');
var _ = require('lodash');
var fs = require('fs');
var key = require('./key.js');
var Q = require('q');

var inputs = process.argv;

var separatorChar = (process.platform == "win32" ? "\\" : "/" );


if(fs.existsSync("favorites.json")){ //legacy file location for 0.1.2 and before
    var favoritesPath=("favorites.json")
}
else if (config.favoritesPath == "") {
    favoritesPath = __dirname + separatorChar + "favorites.json";
}
else {
    favoritesPath = config.favoritesPath;
}


function processInputs() {

    var numbersRegEx = new RegExp('[0-9]');
    if (!inputs[2]) {
        usage();
    }
    ;
    if (numbersRegEx.test(inputs[2])) {
        var deferred = Q.defer();
        getArrivals(inputs[2], deferred);
        deferred.promise.then(function(data){
           displayArrivals(data[0], data[1]);
        });
    }
    ;

    if ((inputs[2] == '-l') || (inputs[2] == '-locate')) {
        console.log("We're very sorry, -l mode is temporarily disabled due to a MapQuest API issue.\nPlease use -keyword" +
            " (-n, -k) search instead.");
        process.exit();
        var address = inputs[3];
        if((typeof address) != "string"){
            console.log("Please enter a street address in quotes after -l to search by address");
            process.exit();
        }
        address = address.toLowerCase();
        if (address.indexOf("oregon") == -1) {
            address += ' , oregon';
        }
        getNearbyStops(address, (inputs[4] || null), function (stops) {
            displayNearbyStops(stops)
        });
    }
    ;

    if ((inputs[2] == '-f') || (inputs[2] == '-favorites')) {
        getArrivalsFromFavorites();
    }
    ;
    if ((inputs[2] == '-n') || (inputs[2] == '-name') || (inputs[2] == '-keyword') || (inputs[2] == '-k')){
        var name = inputs[3];
        if((typeof name) != "string"){
            console.log("Please enter search terms in quotes separated by spaces to search by keywords");
            process.exit();
        }
        name = name.toLowerCase();
        getStopsByName(name);
    }
    if ((inputs[2] == '-c') || (inputs[2] == '-continuous')){
        displayArrivalsContinuously();
    }

}

function getArrivals(stop, deferred) {

    var arrivals = '';
    var waiting = true;
    http.get(config.apiServer + "/arrivals/" + stop + "?key=" + key(), function (res) {
        res.on('data', function (chunk) {
            arrivals += chunk.toString();
        });
        res.on('end', function () {
            arrivals = JSON.parse(arrivals);
            deferred.resolve([stop, arrivals]);
        });
        res.on('error', function (e) {
            console.error(e);
        });

    });
}

function getArrivalsFromFavorites() {
    var favorites = {};
    var deferredArray = [];
    var promiseArray = [];
    try {
        favorites = JSON.parse(fs.readFileSync(favoritesPath, {encoding: 'utf8'}));
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
    favorites.favoriteStops.forEach(function (stop, index) {
        deferredArray[index] = Q.defer();
        promiseArray[index] = deferredArray[index].promise;
        getArrivals(stop, deferredArray[index]);
    });
    Q.all(promiseArray).then(function(){
        promiseArray.forEach(function(item){
            displayArrivals(item[0], item[1]);
        });
    });
}

function displayArrivals(stop, arrivalData) {
    var arrivalsFound = 0;
    console.log(chalk.cyan('Stop number: ' + chalk.bold(stop)) + " " + chalk.green(arrivalData.resultSet.location[0].desc));
    if (arrivalData.resultSet.arrival) {
        arrivalData.resultSet.arrival.forEach(function (arrival) {
            ;
            if (arrival.status == "scheduled") {
                arrivalsFound++;
                arrivalTime = moment(arrival.scheduled);
                if (arrivalTime > moment()) {
                    console.log(chalk.bold(arrival.shortSign) +
                        " " + arrivalTime.fromNow() + " at " + arrivalTime.format('h:mm a') + chalk.yellow(" [scheduled]"));
                }
            }
            else {

                arrivalTime = moment(arrival.estimated);
                if (arrivalTime > moment()) {
                    arrivalsFound++;
                    console.log(chalk.bold(arrival.shortSign) + " " + arrivalTime.fromNow() + " at " + arrivalTime.format('h:mm a') + chalk.green(" [actual]"));
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
                if(stop.route){
                stop.route.forEach(function (route) {
                    lines.push("     " + route.desc + " " + route.dir[0].desc);
                });
                }
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
        favorites = JSON.parse(fs.readFileSync(favoritesPath, {encoding: 'utf8'}));
    }
    catch (err) {
        //console.log(err);
    }

    favorites.favoriteStops = _.union(favorites.favoriteStops, selectedStops.favoriteStops);

    try {
        fs.writeFileSync(favoritesPath, JSON.stringify(favorites), {encoding: 'utf8'});
        console.log("Stops saved to your favorites file. \n" +
            "To check arrivals from favorites use gopdx -f");
    }
    catch (err) {
        console.log("We couldn't write to your favorites file!\nMake sure NodeJS has write permissions for the directory "
            + favoritesPath + " or set your own directory path (including file name) in the gopdxConfig.js file, " +
            "like /tmp/favorites.json or similar");
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

function getStopsByName(name){
    var stops = '';
    var choiceArray = [];
    http.get((config.apiServer + "/namesearch?key=" + key() + "&searchterms=" + encodeURI(name)), function(res){
        res.on('data', function(chunk){
            stops += chunk.toString();
        });
        res.on('end',function(){
            stops = JSON.parse(stops);
            if(stops.error){
                console.log(stops.error);
                process.exit();
            }
            stops.forEach(function(stop){
                choiceArray.push({
                    name:stop.stop_name + " - ID: "+ stop.stop_id +" - Direction: " + stop.direction,
                    value:stop.stop_code});
            });
            inquirer.prompt(
                {type: 'checkbox',
                    name: 'favoriteStops',
                    message: 'Please select any stops to save to your favorites:',
                    choices: choiceArray}, function (answer) {
                    saveStopsToFavorites(answer);
                });

        });
        res.on('error',function(err){
            console.log(err);
        });
    })
}

function displayArrivalsContinuously(){
    process.stdin.resume();
    process.on('SIGWINCH', function() {
        console.log("WAT");
        process.exit('Got SIGWINCH!');
        process.stdout.write('\033[2J');
        process.stdout.write('\033[0;0H');
    });
    process.stdout.write('\033[2J');
    process.stdout.write('\033[0;0H');
    getArrivalsFromFavorites();
setInterval(
    function(){
        getArrivalsFromFavorites();
        process.stdout.write('\033[0;0H');
    }, 10000)

}

processInputs();

