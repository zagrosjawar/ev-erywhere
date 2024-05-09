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

//Add stops function
function addStop() {
    const stopsContainer = document.getElementById('stopsContainer');
    // creating a new input element
    const newStopInput = document.createElement('input');
    newStopInput.type = 'text';
    newStopInput.placeholder = 'Legg til stopp';
    newStopInput.className = 'stops-input'; // Ensure this class has styles defined if needed

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

function initMap() {
    const bergen = new google.maps.LatLng(60.3913, 5.3221); // Example: Bergen, Norway

    infowindow = new google.maps.InfoWindow();
    map = new google.maps.Map(document.getElementById("map"), {
        center: bergen,
        zoom: 15
    });

    const request = {
        location: bergen,
        radius: '5000', // Search within a 5000 meter radius
        keyword: ['electric vehicle charging station']
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
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





//Find route
function findRoute() {
    console.log("Finding route...");
    // Implement route finding logic using Google Maps API
}


//Start Navigation
function startNavigation() {
    console.log("Starting navigation...");
    // Implement navigation logic
}




