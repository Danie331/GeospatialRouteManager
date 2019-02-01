
class MenuViewController {
    constructor(eventBroker) {
        this.eventBroker = eventBroker;
        this.settingsMenuItem = new SettingsMenuView(eventBroker);
        this.geoLayersMenuItem = new GeoLayersMenuView(eventBroker);

        this.init();
    }

    init() {
        $.blockUI({ message: "<h2 class='loading-text'>Loading...</h2>" });
        this.eventBroker.broadcast(EventType.LOAD_SETTINGS, { /* user related info */ });
    }
}