var chalk = require("chalk");

var usage = function () {
    console.log(chalk.yellow(chalk.bold("Welcome to gopdx, the Tri-Met transit tracker")));
    console.log('Usage: node gopdx [stop number]\n' +
        '-l "123 Fake St., Portland, Oregon" to find nearby stops ' +
        'and add them to your favorites file\n' +
        '-f to display arrivals for stops from your favorites file\n\n' +
        'For more information please see the README.md and package.json files');
}

module.exports = usage;