
class MapViewController {
    constructor(eventBroker) {       
        this.$container = $("#map");
        this.eventBroker = eventBroker;
        this.mapProvider = null;

        this.init();
    }

    init() {
        this.attachHandlers();
        this.attachEventListeners();
    }

    onSettingsLoaded(userSettings) {
        switch (userSettings.DefaultMapProvider) {
            case 'google':
                this.mapProvider = new GoogleMapView(this, this.eventBroker);
                break;
            case 'leaflet':
                this.mapProvider = new LeafletMapView(this, this.eventBroker);
                break;
        }
    }

    attachHandlers() {
        this.$container.on('click', '.saveGeoLayerButton', {}, this.saveGeoLayerClickHandler.bind(this));
        this.$container.on('click', '.saveGeoLocationButton', {}, this.saveGeoLocationClickHandler.bind(this));
    }

    attachEventListeners() {
        this.eventBroker.subscribe(this.onGeoLayerSaving.bind(this), EventType.BEFORE_SAVE_LAYER);
        this.eventBroker.subscribe(this.onGeoLayerSaved.bind(this), EventType.LAYER_SAVED);
        this.eventBroker.subscribe(this.onLayerClick.bind(this), EventType.CLICK_LAYER);
        this.eventBroker.subscribe(this.onSettingsLoaded.bind(this), EventType.SETTINGS_LOADED);
        this.eventBroker.subscribe(this.onMapLoaded.bind(this), EventType.AFTER_LAYERS_SHOWN);
    }

    saveGeoLayerClickHandler() {
        var layerNameInput = $('.layerNameInput');
        if (layerNameInput.val() === '') {
            layerNameInput.focus();
            return;
        }
        var layerLevel = $(".layerLevelSelect").val();

        var layerModel = new GeoLayerModel(0, layerNameInput.val(), layerLevel, '');
        this.eventBroker.broadcast(EventType.BEFORE_SAVE_LAYER, layerModel);
    }

    saveGeoLocationClickHandler() {
        swal("Feature coming soon!");
    }

    onGeoLayerSaving() {
        $.blockUI({ message: "<h2 class='loading-text'>Saving...</h2>" });
        $(".saveGeoLayerButton").val('Saving...').attr("disabled", "disabled");
    }

    onGeoLayerSaved() {
        $(".saveGeoLayerButton").val('Save').removeAttr("disabled");
        $.unblockUI();
    }

    onLayerClick(layerModel) {
        $('.layerNameInput').focus().val(layerModel.LayerName ? layerModel.LayerName : '');
    }

    renderLayerLevelSetting(geoLayer) {
        var levelSetting = "<select class='layerLevelSelect'>";
        [{ Id: 1, Name: '1' }, { Id: 2, Name: '2' }, { Id: 3, Name: '3' }].forEach(level => {
            var selected = level.Id == geoLayer.Level ? 'selected' : '';
            var option = `<option value='${level.Id}' ${selected}>${level.Name}</option>`;
            levelSetting += option;
        });
        return levelSetting + '</select>';
    }

    getGeoLayerPopupContent(geoLayer) {
        return `<div>
                    <span>
                        <div class='info-window-item-row'>
                            <label>Layer name: </label>
                            <input class='layerNameInput' type='text' value='${geoLayer.LayerName ? geoLayer.LayerName : ''}' />
                        </div>
                        <div class='info-window-item-row'>
                            <label>Priority level: </label>
                            ${this.renderLayerLevelSetting(geoLayer)}
                        </div>
                        <p />
                        <input class='saveGeoLayerButton' type='button' value='Save' />
                    </span>
                </div>`;
    }

    getGeolocationPopupContent(geoLocation) {
        if (!geoLocation.What3Words) {
            this.eventBroker.broadcast(EventType.FIND_3_WORDS, geoLocation);
        } 
        return `<div>
                    <span>
                        <div class='info-window-item-row'>
                            <label>Address: </label>
                            <input class='layerNameInput' type='text' value='${geoLocation.FormattedAddress ? geoLocation.FormattedAddress : "n/a"}' readonly />
                        </div>
                        <div class='info-window-item-row'>
                            <label>Lat/Lng: </label>
                            <input type='text' value='${geoLocation.Lat}, ${geoLocation.Lng}' readonly />
                        </div>
                        <div class='info-window-item-row'>
                            <label>What3Words: </label>
                            <input class='w3wInput' type='text' value='${!geoLocation.What3Words ? "Loading..." : geoLocation.What3Words}' readonly />
                        </div>
                        <p />
                    </span>
                </div>`;
    }

    onMapLoaded() {
        $.unblockUI();
    }
}