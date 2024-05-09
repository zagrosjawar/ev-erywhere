//Map

let map;
function initMap() {
    console.log("Initializing map...");
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 60.3913, lng: 5.3221 }, // Bergen, Norway
        zoom: 12
    });
}

//Show charging stations
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




