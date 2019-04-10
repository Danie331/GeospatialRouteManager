
class SettingsMenuView {
    constructor(eventBroker) {
        this.googleIdentifier = 'google';
        this.leafletIdentifier = 'leaflet';

        this.$container = $('#settingsMenu');
        this.eventBroker = eventBroker;

        this.render()
            .attachHandlers()
            .attachEventSubscribers();
    }

    render() {
        this.$container.append(this.content());
        var defaultMapProvider = localStorage.getItem('default-map');
        $("#mapProviderToggle").val(defaultMapProvider);

        return this;
    }

    attachEventSubscribers() {
        this.eventBroker.subscribe(this.onSaveSettings.bind(this), EventType.BEFORE_SAVE_SETTINGS);
        this.eventBroker.subscribe(this.onSettingsSaved.bind(this), EventType.SETTINGS_SAVED);

        return this;
    }

    attachHandlers() {
        $("#saveSettingsButton").click(() => this.eventBroker.broadcast(EventType.BEFORE_SAVE_SETTINGS, {}));

        return this;
    }

    onSaveSettings() {
        $("#saveSettingsButton").val('Saving...').attr("disabled", "disabled");
        var selectedMapProvider = $("#mapProviderToggle").val();
        var settingsDto = new UserSettingsModel(selectedMapProvider);
        this.eventBroker.broadcast(EventType.SAVE_SETTINGS, settingsDto);
    }

    onSettingsSaved() {
        $("#saveSettingsButton").val('Save Changes').removeAttr("disabled");
    }

    content() {
        return `<div class='menu-margins'>
                    <span>
                        <label>Default map provider: </label>
                        <select id='mapProviderToggle'>
                            <option value='leaflet'>Leaflet</option>
                            <option value='google'>Google Maps</option>
                        </select>
                    </span>
                    <p />
                    <span>
                        <input id='saveSettingsButton' type='button' value='Save Changes' />
                    </span>
                </div>`;
    }
}