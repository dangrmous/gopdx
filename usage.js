var usage = function () {
    console.log('Usage: node gopdx [stop number]\n' +
        '-h or -help to display help\n' +
        '-l "123 Fake St., Portland, Oregon" to find nearby stops ' +
        'and add them to your favorites file\n' +
        '-f to display arrivals for stops from your favorites file');
}

module.exports = usage;