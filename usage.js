var chalk = require("chalk");
var newVersionCheck = require("./newVersionCheck");

var usage = function () {

    console.log(chalk.yellow(chalk.bold("Welcome to gopdx, the Tri-Met transit tracker")));
    newVersionCheck(displayNewVersionMessage);
    console.log(chalk.bold('Usage:\n') + 'gopdx [stop number]\n' +
        'gopdx -l "123 Fake St., Portland, Oregon" to find nearby stops\n ' +
        'and add them to your favorites file\n' +
        'gopdx -f to display arrivals for stops from your favorites file\n\n' +
        'For more information please see the README.md and \npackage.json files at https://github.com/dangrmous/gopdx');
}

var displayNewVersionMessage = function(newVerAvailable){
    if(newVerAvailable){
        console.log(chalk.blue(chalk.bold(("A new version is available! npm update -g gopdx to install."))));
    }
}

module.exports = usage;