(function () {
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

        var markers = [];

        var getPlaces = function (initialList) {
            fetch('https://api.foursquare.com/v2/venues/explore?near=Ankara&oauth_token=3EXVT5GGO1OBN4511E0LPNLFLWAOTYRHLXXRFUVXYGYHD22U&v=20180109')
                .then(function (response) {
                    return response.json();
                })
                .then(addPlaces)
                .catch(function (error) {
                    console.log(new Error(error));
                });

            function addPlaces(response) {
                var items = response.response.groups[0].items.slice(1, 20);

                items.forEach(element => {
                    var newPlace = new Place(element.venue.id, element.venue.name, element.venue.location.lat, element.venue.location.lng, element.venue.categories[0].name, element.venue.rating);
                    initialList.push(newPlace);

                    // Create a marker per location, and put into markers array.
                    var marker = new google.maps.Marker({
                        position: element.venue.location,
                        title: element.venue.name,                        
                        id: element.venue.id,
                        map: map                        
                    });

                    markers.push(marker);
                });
            };
        };

        if (!cache || cache.length < 1) {
            this.places = ko.observableArray();
            getPlaces(this.places);
        }
        else {
            // map the places get from local storage
            this.places = ko.observableArray(places.map(function (place) {
                return new Place(place.id, place.name, place.lat, place.long, place.category, place.rating);
            }));
        }
    };

    // check local storage for places
    var cache = ko.utils.parseJson(localStorage.getItem('places'));

    // bind a new instance of our view model to the page
    var viewModel = new ViewModel(cache || []);
    ko.applyBindings(viewModel);
}());

var initMap = function () {
    var latlng = new google.maps.LatLng(40, 33);
    var myOptions =
        {
            zoom: 11,
            center: latlng
        };

    map = new google.maps.Map(document.getElementById("mapDiv"), myOptions);
};