var app = app || {};
(function init(app) {

    $(function () {
        var eventObserver = new EventObserver();
        var baseViewController = new MapViewController(eventObserver);
        new LeafletMapView(baseViewController, eventObserver);

        new MenuController(eventObserver);
        new ApiController(eventObserver);

        app.createMenu();
    });

    app.createMenu = function () {
        $(".slide-menu").slidemenu();       
    };

})(app);