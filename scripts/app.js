// app.js will handle the map initialization and other JavaScript functions

let map; // The map object
let directionsService; // Service for calculating directions
let directionsRenderer; // Renderer for displaying directions
let userLocationMarker; // Marker for the user's location


// Initializes the map and sets up direction services
function initMap() {
    const norway = { lat: 60.4720, lng: 8.4689 }; // Center the map over Norway
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: norway,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true});
    directionsRenderer.setMap(map);

    loadChargingStations(); // Load charging stations onto the map
    trackUserLocation(); // Start tracking user/car location

}

// Loads and places markers for charging stations on the map
function loadChargingStations() { 
    const stations = [// Example coordinates for stations 
        { lat: 59.911491, lng: 10.757933 }, // Oslo
        { lat: 60.391262, lng: 5.322054 },  // Bergen
        { lat: 58.969975, lng: 5.733107 },  // Stavanger
        { lat: 63.430515, lng: 10.395053 }, // Trondheim
        { lat: 69.6489, lng: 18.95508 },    // Tromsø
        { lat: 60.472024, lng: 8.468946 },  // Random location in central Norway
        { lat: 59.284072, lng: 11.109403 }, // Near the Swedish border
        { lat: 67.280356, lng: 14.404916 }, // Bodø
        { lat: 62.472228, lng: 6.149482 },  // Ålesund
        { lat: 59.746273, lng: 10.204456 }, // Drammen
        { lat: 58.14671, lng: 7.9956 },     // Kristiansand
        { lat: 60.794533, lng: 11.06858 },  // Hamar
        { lat: 60.472024, lng: 8.468946 },  // Geilo
        { lat: 61.115271, lng: 10.466231 }, // Lillehammer
        { lat: 68.438498, lng: 17.427261 }, // Narvik
        { lat: 60.128161, lng: 10.214199 }, // Hønefoss
        { lat: 59.284072, lng: 11.109876 }, // Sarpsborg
        { lat: 62.737235, lng: 7.160731 },  // Molde
        { lat: 69.966667, lng: 23.27165 },  // Alta
        { lat: 60.880049, lng: 6.838319 },  // Voss
        { lat: 61.183675, lng: 6.848042 },  // Sogndal
        { lat: 68.233987, lng: 14.566311 }, // Svolvær
        { lat: 61.797945, lng: 12.63964 },  // Røros
        { lat: 70.663017, lng: 23.682105 }, // Hammerfest
        { lat: 59.913325, lng: 10.739111 }, // Asker
        { lat: 69.232412, lng: 17.985624 }, // Finnsnes
        { lat: 70.982162, lng: 25.970207 }, // Honningsvåg
        { lat: 59.41378, lng: 5.268 },      // Haugesund
        { lat: 61.892635, lng: 6.720618 },  // Førde
        { lat: 62.122035, lng: 6.074756 },  // Ørsta
        { lat: 67.667107, lng: 12.693484 }, // Mo i Rana
        { lat: 58.460755, lng: 8.766982 },  // Arendal
        { lat: 70.199159, lng: 28.243948 }, // Kirkenes
        { lat: 59.74673, lng: 10.20441 },   // Sandvika
        { lat: 58.969045, lng: 5.73332 },   // Sandnes
        { lat: 62.47247, lng: 6.154303 },   // Ålesund Center
        { lat: 61.13525, lng: 10.466104 },  // Lillehammer Center
        { lat: 63.79207, lng: 13.193401 },  // Steinkjer
        { lat: 67.280355, lng: 15.387964 }, // Bodø North
        { lat: 60.859773, lng: 6.720618 }  // Eidfjord
        ];

    // Create a marker for each station
    const iconUrl = {
        url: "charging-station.png",
        size: new google.maps.Size(32, 32), // This sets the icon size
        scaledSize: new google.maps.Size(32, 32) // This can be used to scale the icon if the original size is larger    }; // Custom icon for charging stations
    };
    stations.forEach(station => {
        new google.maps.Marker({
            position: new google.maps.LatLng(station.lat, station.lng),
            map: map,
            title: "EV Charging Station",
            icon: iconUrl // Custom icon for charging stations
        });
    });
}

//Add Routing Functionality
document.getElementById("routeForm").addEventListener("submit", function (event) { 
    event.preventDefault();
    calculateAndDisplayRoute();
});

function calculateAndDisplayRoute() {
    const start = document.getElementById('start').value;
    const via = document.getElementById('via').value;
    const end = document.getElementById('end').value;

    const waypoints = [];
    if (via) {
        waypoints.push({
            location: via,
            stopover: true
        });
    }

    directionsService.route({
        origin: start,
        destination: end,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
    }, (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
            const startPos = response.routes[0].legs[0].start_location;
            // Update or create the marker at the start location with the car icon
            updateOrCreateMarker("Start Location",startPos, "car.svg", 35);
            
            map.setCenter(startPos);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}


// Tracks the user's location and updates the map accordingly
function trackUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
            const newPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            // Move the existing marker or create it if it doesn't exist with the car icon
            updateOrCreateMarker("Current Location", newPos, "your-location.svg", 35);
            map.setCenter(newPos);
        }, function() {
            handleLocationError(true, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, map.getCenter());
    }
}


// Update or create a marker on the map
function updateOrCreateMarker(label, pos, iconFile, iconSize) {
    
        userLocationMarker = new google.maps.Marker({
            position: pos,
            map: map,
            title: label,
            icon: {
                url: iconFile,
                size: new google.maps.Size(iconSize, iconSize),
                scaledSize: new google.maps.Size(iconSize, iconSize)
            }
        });
}

// Error handling function
function handleLocationError(browserHasGeolocation, pos) {
    alert(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    map.setCenter(pos);
}


// end of app.js