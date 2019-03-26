
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
        this.$container.on('click', '.deleteGeoLayerButton', {}, this.deleteGeoLayerClickHandler.bind(this));
    }

    attachEventListeners() {
        this.eventBroker.subscribe(this.onGeoLayerSaving.bind(this), EventType.BEFORE_SAVE_LAYER);
        this.eventBroker.subscribe(this.onGeoLayerSaved.bind(this), EventType.LAYER_SAVED);
        this.eventBroker.subscribe(this.onLayerClick.bind(this), EventType.CLICK_LAYER);
        this.eventBroker.subscribe(this.onSettingsLoaded.bind(this), EventType.SETTINGS_LOADED);
        this.eventBroker.subscribe(this.onMapLoaded.bind(this), EventType.AFTER_LAYERS_SHOWN);
        this.eventBroker.subscribe(this.onW3wRetrieved.bind(this), EventType.W3W_RETRIEVED);
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

    deleteGeoLayerClickHandler() {
        Swal.fire({
            title: 'Delete Layer?',
            text: "",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.value) {
                $.blockUI({ message: "<h2 class='loading-text'>Deleting Layer...</h2>" });
                this.eventBroker.broadcast(EventType.BEFORE_DELETE_LAYER, {});
            }
        });      
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
                        <input class='deleteGeoLayerButton' type='button' value='Delete Layer' />
                    </span>
                </div>`;
    }

    getGeolocationPopupContent(geoLocation) {
        return `<div class='info-window-geolocation'>
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
                            <input id='w3wInput-${geoLocation.uniqueIdentifier()}' type='text' value='${!geoLocation.What3Words ? "Loading..." : geoLocation.What3Words}' readonly />
                        </div>
                        <p />
                    </span>
                </div>`;
    }

    onW3wRetrieved(geoLocation) {
        var targetElement = $(`#w3wInput-${geoLocation.uniqueIdentifier()}`);
        if (targetElement.length) {
            targetElement.val(geoLocation.What3Words);
        }
    }

    onMapLoaded() {
        $.unblockUI();
    }
}