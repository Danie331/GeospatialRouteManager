﻿var app = app || {};
(function init(app) {

    $(function () {
        var eventBroker = new EventBroker();

        new ApiController(eventBroker);

        new MenuViewController(eventBroker);

        new MapViewController(eventBroker);

        app.createMenu();
    });

    app.createMenu = function () {
        $(".slide-menu").slidemenu();
    };

})(app);