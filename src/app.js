var loadApp = function () {
    'use strict';

    var Place = function (id, name, lat, long, category, rating) {
        this.id = ko.observable(id);
        this.name = ko.observable(name);
        this.lat = ko.observable(lat);
        this.long = ko.observable(long);
        this.category = ko.observable(category);
        this.rating = ko.observable(rating);
    };

    var ViewModel = function (cache) {

        var self = this;
        self.places = ko.observableArray();
        self.markers = [];
        self.filterPlaces = function() {
            // alert("filter triggered");
            self.places.splice(2,10);
        };

        var getPlaces = function () {
            fetch('https://api.foursquare.com/v2/venues/explore?near=Ankara&oauth_token=3EXVT5GGO1OBN4511E0LPNLFLWAOTYRHLXXRFUVXYGYHD22U&v=20180109')
                .then(function (response) {
                    return response.json();
                })
                .then(function (response) {
                    localStorage.setItem('placesResponse', JSON.stringify(response));
                    addPlaces(response);
                })
                .catch(function (error) {
                    console.log(new Error(error));
                });
        };

        var addPlaces = function (response) {
            var items = response.response.groups[0].items.slice(1, 20);
            items.forEach(element => {
                var newPlace = new Place(element.venue.id, element.venue.name, element.venue.location.lat, element.venue.location.lng, element.venue.categories[0].name, element.venue.rating);
                self.places().push(newPlace);

                // Create a marker per location, and put into markers array.
                var marker = new google.maps.Marker({
                    position: element.venue.location,
                    title: element.venue.name,
                    id: element.venue.id,
                    map: map
                });

                // Create a single infowindow to be used with the place details information
                // so that only one is open at once.
                var placeInfoWindow = new google.maps.InfoWindow();
                // If a marker is clicked, do a place details search on it in the next function.
                marker.addListener('click', function () {

                    self.places().forEach((place) => {
                        if (place.id() == marker.id) {
                            console.log('found');
                            placeInfoWindow.marker = marker;
                            var innerHTML = '<div>';
                            if (place.name()) {
                                innerHTML += '<strong>' + place.name() + '</strong>';
                            }
                            if (place.category()) {
                                innerHTML += '<strong>' + place.category() + '</strong>';
                            }

                            innerHTML += '</div>';
                            placeInfoWindow.setContent(innerHTML);
                            placeInfoWindow.open(map, marker);
                            // Make sure the marker property is cleared if the infowindow is closed.
                            placeInfoWindow.addListener('closeclick', function () {
                                placeInfoWindow.marker = null;
                            });
                        }
                    });

                });

                self.markers.push(marker);
            });
        };

        if (!cache || cache.length < 1) {
            getPlaces(self.places());
        }
        else {
            addPlaces(cache);
        }
    };

    // check local storage for places
    var cache = ko.utils.parseJson(localStorage.getItem('placesResponse'));

    // bind a new instance of our view model to the page
    var viewModel = new ViewModel(cache || []);
    ko.applyBindings(viewModel);
};

var initMap = function () {
    var latlng = new google.maps.LatLng(40, 33);
    var myOptions =
        {
            zoom: 11,
            center: latlng
        };

    map = new google.maps.Map(document.getElementById("mapDiv"), myOptions);

    loadApp();
};
