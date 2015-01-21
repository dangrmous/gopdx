#GoPDX 0.1.3

##GoPDX is a Portland, Oregon Tri-Met bus and light rail arrival tracker

###Usage:

gopdx [stop number] to display upcoming arrivals for stop

gopdx -l "123 Fake St., Portland, Oregon" to find nearby stops
 by address and add them to your favorites file. Please note
 that gopdx uses the MapQuest geocoding API which works best
 with regular numerical street addresses, so "NW 5th and Couch" is
 better written as "500 NW Couch"

gopdx -n "kenton max" to search for stops using keywords
separated by spaces and add them to your favorites file

gopdx -f to display arrivals for stops from your favorites file

####A note about the favorites file:
The favorites.json file can be edited directly or deleted entirely (if you'd like to start over).
It is located where Node installs the gopdx app.

The favorites are stored as JSON data with a single favoriteStops array, like so: {"favoriteStops":[7646,2439,7821]}
You may add as many stops as you'd like, but too many can make viewing the arrivals difficult.

Alternately, you can specify any location and file name for your favorites file by editing the gopdxConfig.js file.
gopdxConfig.js is also location in the same folder as the gopdx program. Add the full path including filename to the
favoritesPath property in the file. Delete any other favorites.json files on your system to reduce confusion.

####Version 0.1.3 Release notes:
* Bug fix: where not all arrivals were shown if vehicle had not departed for trip
* New feature: ability so search for stops by keyword using -n
* New feature: change location of the favorites.json file in gopdxConfig.js


#####_Created by Geoffrey D. Unger_



