var app = app || {};

(function init() {
    $(function () {
        app.loadMap();
        app.createMenu();
    });

    app.createMenu = function () {
        $(".slide-menu").slidemenu();       
    };

    app.loadMap = function () {
        try {
            if (navigator && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    const coords = pos.coords;
                    //app.map = new google.maps.Map(document.getElementById('map'), {
                    //    center: { lat: coords.latitude, lng: coords.longitude },
                    //    zoom: 12,
                    //    mapTypeControlOptions: {
                    //        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    //        position: google.maps.ControlPosition.TOP_CENTER
                    //    }
                    //});

                    var button = $("<input type='button' id='confirm' value='Confirm pick-up?' style='cursor: pointer;text-align: center;align-items: center;justify-content: center; margin: 0 auto;' /><br />");
                    var currentLocation = $("<span />").text("Lat:" + coords.latitude + " - Lng:" + coords.longitude);
                    var addressConfirmation = $("<span id='result' />");
                    var confirmPickupLocation = $("<div style='width: 400px;margin-left: auto;margin-right: auto;' />")
                        .append(button).append(addressConfirmation).append("<br />").append(currentLocation);
                    $(window).click('#confirm', () => {
                        var geocodeService = L.esri.Geocoding.geocodeService();
                        geocodeService.reverse().latlng([coords.latitude, coords.longitude])
                            .run(function (error, result, response) {
                                if (result) {
                                    $("#result").text("Pick-up location set to:" + result.address.ShortLabel);
                                } else {
                                    $("#result").text("Unable to geo-code lat/lng");
                                }
                            });
                    });

                    app.map = L.map('map', {
                        center: [coords.latitude, coords.longitude],
                        zoom: 19,
                        dragging: true
                    });
                    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGFuaWUzMzAiLCJhIjoiY2pxeTlqc242MDE5cTQzcnpubHlyeTJucyJ9.Omq9E98-rSVM2EWccOdFtg', {
                        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                        maxZoom: 30,
                        id: 'mapbox.streets',
                        accessToken: 'pk.eyJ1IjoiZGFuaWUzMzAiLCJhIjoiY2pxeTlqc242MDE5cTQzcnpubHlyeTJucyJ9.Omq9E98-rSVM2EWccOdFtg'
                    }).addTo(app.map);
                    var pulsingIcon = L.icon.pulse({ iconSize: [20, 20], color: 'red' });
                    L.marker([coords.latitude, coords.longitude], { icon: pulsingIcon }).addTo(app.map);
                    L.popup({
                        minWidth: 250
                    })
                        .setLatLng([coords.latitude, coords.longitude])
                        .setContent(confirmPickupLocation.html())
                        .openOn(app.map);
                });
            } else {
                console.log("Error loading geolocation: navigator object is not available");
            }
        } catch (e) {
            console.log(`{Error in app.loadMap: ${e}}`);
        }
    };
})(app);