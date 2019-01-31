
class MenuViewController {
    constructor(eventBroker) {
        this.eventBroker = eventBroker;
        this.settings = new SettingsMenuView(eventBroker);

        this.init();
    }

    init() {
        this.eventBroker.broadcast(EventType.LOAD_SETTINGS, { /* user related info */ });
    }
}