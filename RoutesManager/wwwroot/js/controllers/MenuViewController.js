
class MenuViewController {
    constructor(eventBroker) {
        this.eventBroker = eventBroker;
        this.settingsMenu = new SettingsMenuView(eventBroker);
        this.geoLayersMenu = new GeoLayersMenuView(eventBroker);
        this.locationFinderMenu = new LocationFinderMenuView(eventBroker);

        this.init();
    }

    init() {
        $.blockUI({ message: "<h2 class='loading-text'>Loading...</h2>" });
        this.eventBroker.broadcast(EventType.LOAD_SETTINGS, { /* user related info */ });
    }
}