//Show charging stations function
// function showStations() {
//    var stationsPanel = document.getElementById("stationsPanel");
//    var stationsFrame = document.getElementById("stationsFrame");
//    if (stationsPanel.style.display === "none" || !stationsPanel.style.display) {
//        stationsFrame.src = "ladestasjon_oversikt.html";
//        stationsPanel.style.display = "block";
//    } else {
//        stationsPanel.style.display = "none";
//        stationsFrame.src = '';
// Clear the source to potentially free resources
//    }
// }

function showStations() {
  window.location.href = "../html/ladestasjon_oversikt.html";
}

// user location
document.getElementById("currentLocationButton").addEventListener("click", function () {
    if (navigator.geolocation) {
        // Change from getCurrentPosition to watchPosition
        navigator.geolocation.watchPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const latlng = {lat, lng};

            updateLocationMarker(latlng);  // Update the location marker on the map

            // Optionally, update the 'from' input field with the current address
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'location': latlng }, function(results, status) {
                if (status === 'OK' && results[0]) {
                    document.getElementById('from').value = results[0].formatted_address;
                }
            });
        }, function() {
            alert('Error getting location');
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: Infinity
        });

    } else {
    alert("Geolocation is not supported by this browser.");
    }

});

let userLocationMarker = null;

function updateLocationMarker(latlng) {
    if (!userLocationMarker) {
        userLocationMarker = new google.maps.Marker({
            map: map,
            position: latlng,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 2,
                strokeOpacity: 1
            },
            zIndex: 4 // Make sure the marker is above most other elements
        });

        // Create the pulsating effect
        window.setInterval(() => {
            const icon = userLocationMarker.getIcon();
            icon.scale = icon.scale === 8 ? 10 : 8; // Toggle between scale 8 and 10
            userLocationMarker.setIcon(icon);
        }, 700);
    } else {
        userLocationMarker.setPosition(latlng); // Update position if marker already exists
    }
}


//Add stops function
function addStop() {
  const stopsContainer = document.getElementById("stopsContainer");
  // creating a new input element
  const newStopInput = document.createElement("input");
  newStopInput.type = "text";
  newStopInput.placeholder = "Legg til stopp";
  newStopInput.className = "stops-input"; // Ensure this class has styles defined if needed

  // Attach Google Places Autocomplete to the new input
  new google.maps.places.Autocomplete(newStopInput);

  // add a remove button next to each stop input
  const removeButton = document.createElement("button");
  removeButton.textContent = "Fjern";
  removeButton.className = "remove-stop-button"; // Assign class for styling
  removeButton.type = "button";
  removeButton.onclick = function () {
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

function initMap() {
  const bergen = new google.maps.LatLng(60.3913, 5.3221); // Example: Bergen, Norway

  map = new google.maps.Map(document.getElementById("map"), {
    center: bergen,
    zoom: 15,
  });

  infowindow = new google.maps.InfoWindow();
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  // Setting up the places service for EV charging stations
  const request = {
    location: bergen,
    radius: "500000", // Search within a 5000 meter radius
    keyword: ["electric vehicle charging station"],
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);

  // Initialize autocomplete for address input fields
  const autocompleteFrom = new google.maps.places.Autocomplete(
    document.getElementById("from")
  );
  const autocompleteTo = new google.maps.places.Autocomplete(
    document.getElementById("to")
  );
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
    position: place.geometry.location,
  });

  google.maps.event.addListener(marker, "click", () => {
    infowindow.setContent(
      "<div><strong>" +
        place.name +
        "</strong><br>" +
        "Place ID: " +
        place.place_id +
        "<br>" +
        place.formatted_address +
        "</div>"
    );
    infowindow.open(map, marker);
  });
}

// Handling routing
// Handling routing
function findRoute() {
  const start = document.getElementById("from").value;
  const end = document.getElementById("to").value;
  let waypoints = Array.from(document.querySelectorAll(".stops-input")).map(
    (input) => ({
      location: input.value,
      stopover: true,
    })
  );

  const request = {
    origin: start,
    destination: end,
    waypoints: waypoints,
    travelMode: "DRIVING",
  };

  directionsService.route(request, function (result, status) {
    if (status === "OK") {
      directionsRenderer.setDirections(result);
      displayRouteSummary(result); // Extract and display the summary
      document.getElementById("navigationPanel").style.display = "block"; // Show the panel
      document.getElementById("routeForm").style.display = "none"; // Optionally hide the route form
      searchChargingStationsAlongRoute(result.routes[0]); // Search for charging stations along the route
    } else {
      console.error("Directions request failed due to " + status);
    }
  });
}

function displayRouteSummary(result) {
  let totalDistance = 0;
  let totalTime = 0;
  const route = result.routes[0];

  // Sum up all distances and durations from each leg of the route
  route.legs.forEach((leg) => {
    totalDistance += leg.distance.value; // Distance in meters
    totalTime += leg.duration.value; // Time in seconds
  });

  // Convert distance to kilometers and time to minutes
  totalDistance = (totalDistance / 1000).toFixed(1) + " km"; // Convert to km
  totalTime = Math.round(totalTime / 60) + " min"; // Convert to minutes

  // Update the HTML content
  document.getElementById("routeDistance").textContent = totalDistance;
  document.getElementById("routeTime").textContent = totalTime;
}

// Search for EV charging stations along the calculated route
function searchChargingStationsAlongRoute(route) {
  const path = route.overview_path; // Array of coordinates along the route
  const midpoint = path[Math.floor(path.length / 2)]; // Use the midpoint for simplicity
  const request = {
    location: midpoint,
    radius: "5000", // Search within 5 km of the midpoint
    type: ["electric_vehicle_charging_station"], // Look for EV charging stations
  };

  service.nearbySearch(request, function (results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
      updateChargingStationInfo(results[0], midpoint);
    }
  });
}

// Update the UI with the nearest charging station's information
function updateChargingStationInfo(station, nearPoint) {
  const stationName = station.name;
  const stationLocation = station.geometry.location;
  calculateDistanceToStation(
    stationLocation,
    nearPoint,
    function (distance, duration) {
      document.getElementById("nextChargeStation").textContent = stationName;
      document.getElementById(
        "nextChargeTime"
      ).textContent = `${duration.text} / ${distance.text}`;
    }
  );
}

// Calculate distance and duration from a given route point to the charging station
function calculateDistanceToStation(stationLocation, nearPoint, callback) {
  const directionsService = new google.maps.DirectionsService();
  const request = {
    origin: nearPoint,
    destination: stationLocation,
    travelMode: "DRIVING",
  };

  directionsService.route(request, function (response, status) {
    if (status === "OK") {
      const leg = response.routes[0].legs[0];
      callback(leg.distance, leg.duration);
    } else {
      console.error("Failed to calculate distance to station:", status);
    }
  });
}


// Live navigation and information pane
function startNavigation() {
    // Show the navigation pane
    document.getElementById('navigationPane').style.display = 'block';
    // Begin routing
    calculateRoute();
}

function calculateRoute() {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const waypoints = Array.from(document.querySelectorAll('.stops-input')).map(input => ({
        location: input.value,
        stopover: true
    }));

    const request = {
        origin: from,
        destination: to,
        waypoints: waypoints,
        travelMode: 'DRIVING',
        provideRouteAlternatives: true
    };

    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            updateNavigationPane(result.routes[0]);  // Populate the navigation pane
        } else {
            console.error('Directions request failed due to: ' + status);
        }
    });
}

function updateNavigationPane(route) {
    const leg = route.legs[route.legs.length - 1]; // Use the last leg for end details
    document.getElementById('estimatedArrival').textContent = leg.duration.text;
    document.getElementById('finalDestination').textContent = leg.end_address;

    // Simplify navigation instructions
    let instructions = '';
    route.legs.forEach(leg => {
        leg.steps.forEach(step => {
            instructions += `<p>${step.instructions} - ${step.distance.text}</p>`;
        });
    });
    document.getElementById('liveDirections').innerHTML = instructions;

    // Placeholder: Update with actual charging station details
    document.getElementById('stationName').textContent = 'Station X';
    document.getElementById('stationTimeDistance').textContent = '15 mins / 10 km';
    document.getElementById('stationStatsLink').setAttribute('href', 'statistikk.html');
}

function endNavigation() {
    document.getElementById('navigationPane').style.display = 'none'; // Hide the pane
    window.location.href = 'feedback.html'; // Redirect to feedback page
}

// swap up and down
function setupSwipeablePane() {
    const pane = document.getElementById('navigationPane');
    let startY = 0;
    let endY = 0;
    let isSwiping = false;

    pane.addEventListener('touchstart', function(e) {
        startY = e.touches[0].clientY;
        isSwiping = true;
    });

    pane.addEventListener('touchmove', function(e) {
        if (isSwiping) {
            endY = e.touches[0].clientY;
            let changeY = startY - endY;
            if (changeY > 0) {
                pane.style.transform = `translateY(${changeY}px)`;
            } else if (pane.classList.contains('active')) {
                pane.style.transform = `translateY(${Math.min(0, -changeY)}px)`;
            }
        }
    });

    pane.addEventListener('touchend', function(e) {
        isSwiping = false;
        let changeY = startY - endY;
        // Determine swipe significance
        if (Math.abs(changeY) > 50) { // Threshold for swipe action
            if (changeY > 0) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
            pane.style.transform = ''; // Reset transform to leverage CSS for positioning
        } else {
            pane.style.transform = ''; // Reset transform on small or invalid swipes
        }
    });
}

document.addEventListener('DOMContentLoaded', setupSwipeablePane);

function startNavigation() {
    const pane = document.getElementById('navigationPane');
    pane.classList.add('active'); // Show pane
    calculateRoute();
}

function endNavigation() {
    const pane = document.getElementById('navigationPane');
    pane.classList.remove('active'); // Hide pane
    window.location.href = 'vurderreise.html'; // Redirect to feedback page
}

function toggleNavigationPane() {
    const pane = document.getElementById('navigationPane');
    // Check if the pane is active (fully visible)
    if (pane.classList.contains('active')) {
        // Move pane to only show the top 10% (adjust as needed)
        pane.style.transform = 'translateY(calc(100% - 91px))'; // Adjust 50px to the height of the header/tab
        pane.classList.remove('active');
    } else {
        // Move pane to fully visible
        pane.style.transform = 'translateY(0%)';
        pane.classList.add('active');
    }
}


function setupSwipeablePane() {
    const pane = document.getElementById('navigationPane');
    let startY = 0;
    let endY = 0;
    let isSwiping = false;

    pane.addEventListener('touchstart', function(e) {
        startY = e.touches[0].clientY;
        isSwiping = true;
    });

    pane.addEventListener('touchmove', function(e) {
        if (isSwiping) {
            endY = e.touches[0].clientY;
            let changeY = startY - endY;
            if (changeY > 0 && pane.classList.contains('active')) {
                pane.style.transform = `translateY(${changeY}px)`;
            } else {
                pane.style.transform = `translateY(${Math.max(changeY, -100)}%)`;
            }
        }
    });

    pane.addEventListener('touchend', function(e) {
        isSwiping = false;
        let changeY = startY - endY;
        if (Math.abs(changeY) > 50) { // Threshold for swipe action
            toggleNavigationPane(); // Use the toggle function to set final state
        } else {
            pane.style.transform = ''; // Reset transform on small or invalid swipes
        }
    });
}
