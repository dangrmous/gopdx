#GoPDX 0.1.21

##GoPDX is a Portland, Oregon Tri-Met bus and light rail arrival tracker

###Usage:

gopdx [stop number] to display upcoming arrivals for stop

gopdx -l (or -locate) "123 Fake St., Portland, Oregon" to find nearby stops
 by address and add them to your favorites file.
 Please note that gopdx uses the MapQuest geocoding API which works best
 with regular numerical street addresses, so "NW 5th and Couch" is
 better written as "500 NW Couch"

gopdx -n (or -name, -k, -keyword) "kenton max" to search for stops using keywords
separated by spaces and add them to your favorites file

gopdx -f (or -favorites) to display arrivals for stops from your favorites file

gopdx -c (or -continuous) to run continuously, updating arrivals for favorite stops every 60 seconds

####Version 0.1.21 Release notes:
* Moved from MapQuest geocoding to OpenCage
* Updated to more current version of Hapi
* The server is now public code at gopdx-server-public on Github

####Version 0.1.20 Release notes:
* Updated server to fix outage and prevent future outages

####A note about the favorites file:
The favorites.json file can be edited directly or deleted entirely (if you'd like to start over).
It is located where Node installs the gopdx app, typically in /usr/local/lib/node_modules/gopdx/ but
this may vary.

The favorites are stored as JSON data with a single favoriteStops array, like so: `{"favoriteStops":[7646,2439,7821]}`
You may add as many stops as you'd like, but too many can make viewing the arrivals difficult.

Alternately, you can specify any location and file name for your favorites file by editing the gopdxConfig.js file.
gopdxConfig.js is also location in the same folder as the gopdx program. Add the full path including filename to the
favoritesPath property in the file. Delete any other favorites.json files on your system to reduce confusion.


#####_Created by Geoffrey D. Unger_



