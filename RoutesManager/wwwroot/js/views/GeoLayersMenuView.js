
class GeoLayersMenuView {
    constructor(eventBroker) {
        this.$container = $('#layersMenu');
        this.eventBroker = eventBroker;

        this.render()
            .attachHandlers()
            .attachEventSubscribers();
    }

    render() {
        this.$container.append(this.content());

        return this;
    }

    attachHandlers() {
        $('#layersListContainer').on('click', '.layerLink', e => {
            var layerId = $(e.currentTarget).data('layerid');
            this.eventBroker.broadcast(EventType.SELECT_LAYER, new GeoLayerModel(layerId));
        });

        return this;
    }

    attachEventSubscribers() {
        this.eventBroker.subscribe(this.onLayersLoaded.bind(this), EventType.LAYERS_LOADED);
        this.eventBroker.subscribe(this.onLayerSaved.bind(this), EventType.LAYER_SAVED);

        return this;
    }

    onLayerSaved(layerModel) {
        var targetlink = $("#layersListContainer").find(`[data-layerid='${layerModel.Id}']`);
        if (targetlink.length) {
            targetlink.text(layerModel.LayerName);
            return;
        }

        $("#layersListContainer").append(this.appendLayerLink(layerModel));
    }

    onLayersLoaded(layerModelList) {
        layerModelList.forEach(layerModel => {
            $("#layersListContainer").append(this.appendLayerLink(layerModel));
        });
    }

    appendLayerLink(layerModel) {
        return $('<li>').append(
            $('<a>').attr('href', '#')
                .addClass('layerLink')
                .text(layerModel.LayerName)
                .attr('data-layerid', layerModel.Id));
    }

    content() {
        return `<div>
                    <ul id='layersListContainer'></ul>
                </div>`;
    }
}