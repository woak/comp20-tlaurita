// notuber.js
// Author: Teddy Laurita

const METERS_TO_MILES = 1609

var http = new XMLHttpRequest();
// Added personal heroku app url
var url = "https://vast-coast-45749.herokuapp.com/submit";
var userInfoContent = '<div id="userInfo">' + '<p>Username: ' + username + '</p></div>';

var username = "nmwMbHID";
var othersMarkers = [];
var userIcon = "userMarker.png";
var passengerIcon = "passengerMarker.png";
var vehicleIcon = "black_car.png";

var initMap = function() {
    var defaultLoc = new google.maps.LatLng(42.423844, -71.109231);
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: defaultLoc
    });
    userInfoWindow = new google.maps.InfoWindow({map: map});

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            userCoords = new google.maps.LatLng(position.coords.latitude,
                                                position.coords.longitude);
            userMarker = new google.maps.Marker({
                position: userCoords,
                map: map,
                icon: userIcon
            });
            userInfoWindow.setPosition(userCoords);
            userInfoWindow.setContent("<p>You are here!" +
                                      "<br/>Your Username: " +
                                      username +
                                      "</p>");
            userMarker.addListener('click', function() {
                userInfoWindow.open(map, userMarker);
            });
            map.setCenter(userCoords);
        });
    }
    else {
        alert("Your browser doesn't support geolocation!");
    }
}


// event handler for http state change
http.onreadystatechange = function() {
    if (http.readyState == 4 && http.status == 200) {
        displayOthers(JSON.parse(http.responseText));
    }
}

// apply function that creates all the markers
var placeMarkers = function(userObject, iconString) {
    var otherLocation = new google.maps.LatLng(userObject.lat,
                                              userObject.lng);
    var distanceBetween = google.maps.geometry.spherical.computeDistanceBetween(
                                                        userCoords,
                                                        otherLocation);
    var otherObj = {
        "milesFromUser":distanceBetween,
        "location": otherLocation,
        "marker": new google.maps.Marker({
                    position: otherLocation,
                    map: map,
                    icon: iconString
        }),
        "infoWindow": new google.maps.InfoWindow({
            content: "<p>Username: " +
                     userObject.username +
                     "</br>" +
                     "Distance from you (miles): " +
                     (distanceBetween / METERS_TO_MILES).toFixed(2) +
                     "</p>"
        })
    };
    otherObj.marker.addListener('click', function() {
        otherObj.infoWindow.open(map, otherObj.marker);
    });
    othersMarkers.push(otherObj);

    return userObject;
}

// map function that works over JSON returned by POST request
var mapOthers = function(list, apply, icon) {
    for (var i = 0; i < list.length; i++) {
        list[i] = apply(list[i], icon);
    }
}

// determines whether to show vehicles or passengers
var displayOthers = function(responseText) {
    if (responseText["vehicles"] != undefined) {
        mapOthers(responseText.vehicles, placeMarkers, vehicleIcon);
    }
    else {
        mapOthers(responseText.passengers, placeMarkers, passengerIcon);
    }
}

// retrieve JSON information about other notuber users
var retrieveOthers = function() {
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    userParams = "username=" + username +
                     "&lat=" + userCoords.lat() +
                     "&lng=" + userCoords.lng();
    http.send(userParams);
}

window.onload = function() {
    retrieveOthers();
}
