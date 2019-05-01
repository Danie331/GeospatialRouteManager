var app = app || {};
(function init(app) {

    $(function () {
        var eventBroker = new EventBroker();

        new ApiController(eventBroker);

        new MenuViewController(eventBroker);

        new MapViewController(eventBroker);

        app.createMenu(eventBroker);
    });

    app.createMenu = (eventBroker) => {
        $("#myLayersText").text(`My Layers (${localStorage.getItem('user-friendly-name')})`);
        $(".slide-menu").slidemenu({ EventBroker: eventBroker });
    }

})(app);