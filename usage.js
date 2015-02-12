var chalk = require("chalk");
var newVersionCheck = require("./newVersionCheck");

var usage = function () {

    console.log(chalk.yellow(chalk.bold("Welcome to gopdx, the Tri-Met transit tracker")));
    newVersionCheck(displayNewVersionMessage);
    console.log(chalk.bold('Usage:\n') + 'gopdx [stop number]\n\n' +
        'gopdx -l (or -locate) "123 Fake St., Portland, Oregon" to find nearby stops\n ' +
        'by address and add them to your favorites file\n\n' +
        'gopdx -n (or -name, -k, -keyword) "kenton max" to search for stops using\n stop names or keywords ' +
        'separated by spaces and add them to your favorites file\n\n' +
        'gopdx -f (or -favorites) to display arrivals for stops from your favorites file\n\n' +
        'gopdx -c (or -continuous) to run continuously, updating arrivals for \nfavorite stops every 60 seconds\n'+
        'For more information please see https://www.npmjs.com/package/gopdx');
}

var displayNewVersionMessage = function(newVerAvailable){
    if(newVerAvailable){
        console.log(chalk.blue(chalk.bold(("A new version is available! npm update -g gopdx to install."))));
    }
}

module.exports = usage;