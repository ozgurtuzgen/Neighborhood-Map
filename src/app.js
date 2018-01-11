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

    var ViewModel = function (initialData) {

        var getPlaces = function (initialList) {
            fetch('https://api.foursquare.com/v2/venues/explore?near=Ankara&oauth_token=3EXVT5GGO1OBN4511E0LPNLFLWAOTYRHLXXRFUVXYGYHD22U&v=20180109')
                .then(function (response) {
                    return response.json();
                })
                .then(addPlaces)
                .catch(function (error) {
                    console.log(error);
                });

            function addPlaces(response) {
                // var items = response.response.groups[0].items;


                // var hede = [{ id: '1', name: 'c', lat: 32, lng: 32, category: 'a', rating: 8 }, { id: '2', name: 'd', lat: 32, lng: 32, category: 'a', rating: 8 }];

                // initialList = ko.observableArray(hede.map(function (place) {
                //     return new Place(place.id, place.name, place.lat, place.long, place.category, place.rating);
                // }));

                let pl = new Place('4','sdda',32,32,'a',9);

                initialList.push(pl);

                console.log(initialList);

                // this.places = ko.observableArray(items.map(function (item) {
                //     return new Place(item.id, item.name, item.lat, item.long, item.category, item.rating);
                // }));                    


                // let tempPlaces = [];

                // items.forEach(element => {
                //     var newPlace = new Place(element.venue.id, element.venue.name, element.venue.location.lat, element.venue.location.lng, element.venue.categories[0].name, element.venue.rating);
                //     tempPlaces.push(newPlace);
                // });

                // this.places = tempPlaces;

            };
        };



        // if (places && places.length < 1) {

        var hede = [{ id: '1', name: 'a', lat: 32, lng: 32, category: 'a', rating: 8 }, { id: '2', name: 'b', lat: 32, lng: 32, category: 'a', rating: 8 }];

        this.places = ko.observableArray(hede.map(function (place) {
            return new Place(place.id, place.name, place.lat, place.long, place.category, place.rating);
        }));

        // this.places = ko.observableArray();
        // var i = 1;

        getPlaces(this.places);
        // }

        // // map the places get from local storage
        // this.places = ko.observableArray(places.map(function (place) {
        //     return new Place(place.id, place.name, place.lat, place.long, place.category, place.rating);
        // }));



    };

    // check local storage for places
    var initialData = ko.utils.parseJson(localStorage.getItem('places'));

    // bind a new instance of our view model to the page
    var viewModel = new ViewModel(initialData || []);
    ko.applyBindings(viewModel);
}());