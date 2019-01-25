
class MapViewController {
    constructor(eventObserver) {       
        this.$container = $("#map");
        this.eventObserver = eventObserver;

        this.attachHandlers();
        this.attachEventListeners();
    }

    attachHandlers() {
        this.$container.on('click', '.saveGeoLayerButton', {}, this.saveGeoLayerClickHandler.bind(this));
    }

    attachEventListeners() {
        this.eventObserver.subscribe(this.onGeoLayerSaving.bind(this), EventType.BEFORE_SAVE_LAYER);
        this.eventObserver.subscribe(this.onGeoLayerSaved.bind(this), EventType.LAYER_SAVED);
        this.eventObserver.subscribe(this.onLayerClick.bind(this), EventType.CLICK_LAYER);
    }

    saveGeoLayerClickHandler() {
        var layerNameInput = $('.layerNameInput');
        if (layerNameInput.val() === '') {
            layerNameInput.focus();
            return;
        }

        this.eventObserver.broadcast(EventType.BEFORE_SAVE_LAYER, { LayerName: layerNameInput.val() });
    }

    onGeoLayerSaving() {
        $(".saveGeoLayerButton").val('Saving...').attr("disabled", "disabled");
    }

    onGeoLayerSaved() {
        $(".saveGeoLayerButton").val('Save').removeAttr("disabled");
    }

    onLayerClick(layerModel) {
        $('.layerNameInput').val(layerModel.LayerName ? layerModel.LayerName : '');
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