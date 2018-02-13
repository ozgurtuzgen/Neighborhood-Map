var loadApp = function () {
    'use strict';

    var Place = function (id, name, lat, long, category, rating, selected) {
        var self = this;
        self.id = ko.observable(id);
        self.name = ko.observable(name);
        self.lat = ko.observable(lat);
        self.long = ko.observable(long);
        self.category = ko.observable(category);
        self.rating = ko.observable(rating);
        self.isSelected = ko.computed(function () {
            return selected() === self;
        });
    };

    var ViewModel = function (cache) {

        var self = this;
        self.places = ko.observableArray();
        self.markers = [];
        self.selectedItem = ko.observable();
        self.filterInput = ko.observable();

        self.filteredPlaces = ko.pureComputed(function () {
            if (!self.filterInput()) {
                self.markers.forEach(function (item) {
                    item.setVisible(true);
                });

                return self.places();
            } else {

                self.markers.forEach(function (item) {
                    if (item.title.toLowerCase().indexOf(self.filterInput().toLowerCase()) > -1) {
                        item.setVisible(true);
                    }
                    else {
                        item.setVisible(false);
                    }
                });

                return ko.utils.arrayFilter(self.places(), function (p) {
                    return p.name().toLowerCase().indexOf(self.filterInput().toLowerCase()) > -1;
                });
            }
        }, self);

        self.filterPlaces = function (filterText) {
            self.filterInput(filterText);
        };

        self.filterInput.subscribe(self.filterPlaces);

        self.selectPlace = function (placeItem) {
            self.selectedItem(placeItem);
            self.selectMarker(placeItem);
        };

        self.selectMarker = function (markerItem) {
            self.markers.forEach(function (item) {
                if (item.id === markerItem.id()) {
                    item.setAnimation(google.maps.Animation.BOUNCE);
                }
                else
                {
                    item.setAnimation(null);
                }
            });
        };

        self.gridOptions = {
            displaySelectionCheckbox: false,
            data: self.places,
            showFilter: false,
            showColumnMenu: false,
            multiSelect: false,
            selectedItems: self.selectedItems,
            footerVisible: false,
            enableColumnResize: false
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
                var newPlace = new Place(element.venue.id, element.venue.name, element.venue.location.lat, element.venue.location.lng, element.venue.categories[0].name, element.venue.rating, self.selectedItem);
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
                            
                            // select the place
                            self.selectPlace(place);     

                            //open the info window
                            placeInfoWindow.marker = marker;
                            var innerHTML = '<div>';
                            if (place.name()) {
                                innerHTML += '<strong>Place:</strong>';
                                innerHTML += place.name();
                                innerHTML += '<br>';
                            }
                            if (place.category()) {
                                innerHTML += '<strong>Category:</strong>';
                                innerHTML += place.category();
                                innerHTML += '<br>';
                            }
                            if (place.rating()) {
                                innerHTML += '<strong>Rating:</strong>';
                                innerHTML += place.rating();
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

    var myWrapper = $("#wrapper");
    $("#menu-toggle").click(function (e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        myWrapper.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function (e) {
            // code to execute after transition ends
            google.maps.event.trigger(map, 'resize');
        });
    });
};

var initMap = function () {
    var latlng = new google.maps.LatLng(40, 33);
    var myOptions =
        {
            zoom: 11,
            center: latlng
        };

    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    loadApp();
};
