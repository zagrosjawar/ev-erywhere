//Show charging stations function
function showStations() {
    var stationsPanel = document.getElementById("stationsPanel");
    var stationsFrame = document.getElementById("stationsFrame");
    if (stationsPanel.style.display === "none" || !stationsPanel.style.display) {
        stationsFrame.src = "ladestasjon_oversikt.html";
        stationsPanel.style.display = "block";
    } else {
        stationsPanel.style.display = "none";
        stationsFrame.src = ''; // Clear the source to potentially free resources
    }
}
// user location
document.getElementById('currentLocationButton').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Optionally, use reverse geocoding to get a readable address
            const geocoder = new google.maps.Geocoder();
            const latlng = {lat, lng};
            geocoder.geocode({ 'location': latlng }, function(results, status) {
                if (status === 'OK' && results[0]) {
                    document.getElementById('from').value = results[0].formatted_address;
                } else {
                    alert('Geocoder failed due to: ' + status);
                }
            });
        }, function() {
            alert('Error getting location');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

//Add stops function
function addStop() {
    const stopsContainer = document.getElementById('stopsContainer');
    // creating a new input element
    const newStopInput = document.createElement('input');
    newStopInput.type = 'text';
    newStopInput.placeholder = 'Legg til stopp';
    newStopInput.className = 'stops-input'; // Ensure this class has styles defined if needed

    // Attach Google Places Autocomplete to the new input
    new google.maps.places.Autocomplete(newStopInput);

    // add a remove button next to each stop input
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Fjern';
    removeButton.className = 'remove-stop-button'; // Assign class for styling
    removeButton.type = 'button';
    removeButton.onclick = function() {
        stopsContainer.removeChild(newStopInput);
        stopsContainer.removeChild(removeButton);
    };

    stopsContainer.appendChild(newStopInput);
    stopsContainer.appendChild(removeButton);
}

//Map
// EV Charging Stations
// Markers for EV charging stations
let map;
let service;
let infowindow;
let directionsService;
let directionsRenderer;
let userLocationMarker = null;



function initMap() {
    const bergen = new google.maps.LatLng(60.3913, 5.3221);  // Example: Bergen, Norway

    map = new google.maps.Map(document.getElementById("map"), {
        center: bergen,
        zoom: 15
    });

    // track user location
    

    infowindow = new google.maps.InfoWindow();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    trackUserLocation(); // Start tracking user/car location


    // Setting up the places service for EV charging stations
    const request = {
        location: bergen,
        radius: '500000',  // Search within a 5000 meter radius
        keyword: ['electric vehicle charging station']
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);

    // Initialize autocomplete for address input fields
    const autocompleteFrom = new google.maps.places.Autocomplete(document.getElementById('from'));
    const autocompleteTo = new google.maps.places.Autocomplete(document.getElementById('to'));
}

function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (let i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    }
}

function createMarker(place) {
    if (!place.geometry || !place.geometry.location) return;

    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', () => {
        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
            'Place ID: ' + place.place_id + '<br>' +
            place.formatted_address + '</div>');
        infowindow.open(map, marker);
    });
}





// Handling routing
// Handling routing
function findRoute() {
    const start = document.getElementById('from').value;
    const end = document.getElementById('to').value;
    let waypoints = Array.from(document.querySelectorAll('.stops-input')).map(input => ({
        location: input.value,
        stopover: true
    }));

    const request = {
        origin: start,
        destination: end,
        waypoints: waypoints,
        travelMode: 'DRIVING'
    };

    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            displayRouteSummary(result);  // Extract and display the summary
            document.getElementById('navigationPanel').style.display = 'block'; // Show the panel
            document.getElementById('routeForm').style.display = 'none'; // Optionally hide the route form
            searchChargingStationsAlongRoute(result.routes[0]); // Search for charging stations along the route
        } else {
            console.error('Directions request failed due to ' + status);
        }
    });
}


function displayRouteSummary(result) {
    let totalDistance = 0;
    let totalTime = 0;
    const route = result.routes[0];

    // Sum up all distances and durations from each leg of the route
    route.legs.forEach(leg => {
        totalDistance += leg.distance.value; // Distance in meters
        totalTime += leg.duration.value; // Time in seconds
    });

    // Convert distance to kilometers and time to minutes
    totalDistance = (totalDistance / 1000).toFixed(1) + ' km'; // Convert to km
    totalTime = Math.round(totalTime / 60) + ' min'; // Convert to minutes

    // Update the HTML content
    document.getElementById('routeDistance').textContent = totalDistance;
    document.getElementById('routeTime').textContent = totalTime;
}


// Search for EV charging stations along the calculated route
function searchChargingStationsAlongRoute(route) {
    const path = route.overview_path;  // Array of coordinates along the route
    const midpoint = path[Math.floor(path.length / 2)]; // Use the midpoint for simplicity
    const request = {
        location: midpoint,
        radius: '5000', // Search within 5 km of the midpoint
        type: ['electric_vehicle_charging_station'] // Look for EV charging stations
    };

    service.nearbySearch(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
            updateChargingStationInfo(results[0], midpoint);
        }
    });
}

// Update the UI with the nearest charging station's information
function updateChargingStationInfo(station, nearPoint) {
    const stationName = station.name;
    const stationLocation = station.geometry.location;
    calculateDistanceToStation(stationLocation, nearPoint, function(distance, duration) {
        document.getElementById('nextChargeStation').textContent = stationName;
        document.getElementById('nextChargeTime').textContent = `${duration.text} / ${distance.text}`;
    });
}

// Calculate distance and duration from a given route point to the charging station
function calculateDistanceToStation(stationLocation, nearPoint, callback) {
    const directionsService = new google.maps.DirectionsService();
    const request = {
        origin: nearPoint,
        destination: stationLocation,
        travelMode: 'DRIVING'
    };

    directionsService.route(request, function(response, status) {
        if (status === 'OK') {
            const leg = response.routes[0].legs[0];
            callback(leg.distance, leg.duration);
        } else {
            console.error('Failed to calculate distance to station:', status);
        }
    });
}




// Function to track the user's location and update the marker on the map
function trackUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function(position) {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            if (!userLocationMarker) {
                // If the marker doesn't exist, create it.
                userLocationMarker = new google.maps.Marker({
                    position: pos,
                    map: map,
                    title: 'Your Location',
                    icon: {
                        path: "../assets/car-icon-large.svg",
                        scale: 10,
                        fillColor: '#4285F4',
                        fillOpacity: 1,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 2
                    }
                });
            } else {
                // If the marker exists, just update its position.
                userLocationMarker.setPosition(pos);
            }

            map.setCenter(pos); // Center the map on the user's location
        }, function(error) {
            console.error('Error fetching geolocation: ', error);
        }, {
            enableHighAccuracy: true, // Provides a hint that the application needs the best possible results
            maximumAge: 30000, // Accept a cached position whose age is no greater than the specified time in milliseconds
            timeout: 27000 // The maximum length of time (in milliseconds) the device is allowed to take in order to return a position
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}