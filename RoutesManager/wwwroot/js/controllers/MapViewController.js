
class MapViewController {
    constructor(eventBroker) {       
        this.$container1 = $("#map");
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
        this.$container1.on('click', '.saveGeoLayerButton', {}, this.saveGeoLayerClickHandler.bind(this));
    }

    attachEventListeners() {
        this.eventBroker.subscribe(this.onGeoLayerSaving.bind(this), EventType.BEFORE_SAVE_LAYER);
        this.eventBroker.subscribe(this.onGeoLayerSaved.bind(this), EventType.LAYER_SAVED);
        this.eventBroker.subscribe(this.onLayerClick.bind(this), EventType.CLICK_LAYER);
        this.eventBroker.subscribe(this.onSettingsLoaded.bind(this), EventType.SETTINGS_LOADED);
    }

    saveGeoLayerClickHandler() {
        var layerNameInput = $('.layerNameInput');
        if (layerNameInput.val() === '') {
            layerNameInput.focus();
            return;
        }

        this.eventBroker.broadcast(EventType.BEFORE_SAVE_LAYER, { LayerName: layerNameInput.val() });
    }

    onGeoLayerSaving() {
        $(".saveGeoLayerButton").val('Saving...').attr("disabled", "disabled");
    }

    onGeoLayerSaved() {
        $(".saveGeoLayerButton").val('Save').removeAttr("disabled");
    }

    onLayerClick(layerModel) {
        $('.layerNameInput').focus().val(layerModel.LayerName ? layerModel.LayerName : '');
    }

    getGeoLayerPopupContent(geoLayer) {
        return `<div>
                    <span>
                        <label>Layer name: </label>
                        <input class='layerNameInput' type='text' size=20 value='${geoLayer.LayerName ? geoLayer.LayerName : ''}' />
                        <p />
                        <input class='saveGeoLayerButton' type='button' value='Save' />
                    </span>
                </div>`;
    }
}