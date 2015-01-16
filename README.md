#GoPDX 0.1.1

##GoPDX is a Portland, Oregon Tri-Met bus and light rail arrival tracker

###Usage:

gopdx [stop number]: display arrivals for a given stop

gopdx -l "123 Fake St., Portland": find nearby stops and add them to your favorites file

gopdx -f: display arrivals for all stops in your favorites file

####A note about the favorites file:
The favorites.json file can be edited directly or deleted entirely (if you'd like to start over).
It is located at /tmp/favorites.json.
The favorites are stored as JSON data with a single favoriteStops array, like so: {"favoriteStops":[7646,2439,7821]}
You may add as many stops as you'd like, but too many can make viewing the arrivals difficult.

####_Created by Geoffrey D. Unger_



