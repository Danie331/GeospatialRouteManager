
class UserSettingsModel {
    constructor(mapProvider) {
        this.DefaultMapProvider = mapProvider;
    }

    toString() {
        return JSON.stringify(this);
    }
}