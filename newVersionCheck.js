var semver = require("semver");
var http = require("http");
var configs = require("./gopdxConfig.js");

var localVersion = configs.version;

var newVersionCheck = function(callback){
    http.get(configs.apiServer + "/appVersion", function (res) {
        var ver = '';
        res.on('data', function (chunk) {
            ver += chunk.toString();
        });
        res.on('end', function () {
            ver = JSON.parse(ver);
            callback(semver.gtr(ver.appVersion, localVersion));
        });
        res.on('error', function (e) {
            console.error("We were unable to reach the gopdx server for some reason. Please file a bug!");
        });

    })
}

module.exports = newVersionCheck;