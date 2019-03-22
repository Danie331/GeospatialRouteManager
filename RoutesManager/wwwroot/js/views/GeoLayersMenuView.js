
class GeoLayersMenuView {
    constructor(eventBroker) {
        this.$container = $('#layersMenu');
        this.eventBroker = eventBroker;
        this.layersCache = null;

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

        $("#layerLevelSelector").on('click', '.showAllLayersCheckbox, .showLevel1Checkbox, .showLevel2Checkbox, .showLevel3Checkbox', e => {
            if (!$(e.currentTarget).hasClass('showAllLayersCheckbox')) {
                $('.showAllLayersCheckbox').prop('checked', false);
            }

            var selectedLevels = this.getSelectedLevels();
            this.eventBroker.broadcast(EventType.TOGGLE_LAYERS, selectedLevels);
        });

        return this;
    }

    attachEventSubscribers() {
        this.eventBroker.subscribe(this.onLayersLoaded.bind(this), EventType.LAYERS_LOADED);
        this.eventBroker.subscribe(this.onLayerSaved.bind(this), EventType.LAYER_SAVED);
        this.eventBroker.subscribe(this.toggleSelectableLayers.bind(this), EventType.TOGGLE_LAYERS);
        this.eventBroker.subscribe(this.onLayerDeleted.bind(this), EventType.LAYER_DELETED);

        return this;
    }

    getSelectedLevels() {
        var all = $('.showAllLayersCheckbox').is(':checked') ? [1, 2, 3] : [];
        var layer1 = $('.showLevel1Checkbox').is(':checked') ? [1] : [];
        var layer2 = $('.showLevel2Checkbox').is(':checked') ? [2] : [];
        var layer3 = $('.showLevel3Checkbox').is(':checked') ? [3] : [];

        return _.union([...all, ...layer1, ...layer2, ...layer3]);
    }

    onLayerSaved(layerModel) {
        var targetlink = $("#layersListContainer").find(`[data-layerid='${layerModel.Id}']`);
        if (targetlink.length) {
            targetlink.text(layerModel.LayerName);
            return;
        }
 
        //$("#layersListContainer").append(this.appendLayerLink(layerModel));
    }

    onLayerDeleted(model) {
        var targetlink = $("#layersListContainer").find(`[data-layerid='${model.Id}']`);
        if (targetlink.length) {
            targetlink.remove();
        }
    }

    onLayersLoaded(layerModelList) {
        this.layersCache = layerModelList;
        this.updateLayersSelection(this.layersCache);
    }

    toggleSelectableLayers(levelsToShow) {
        var filteredLayers = _.filter(this.layersCache, layer => {
            return _.includes(levelsToShow, layer.Level);
        });
        this.updateLayersSelection(filteredLayers);
    }

    updateLayersSelection(layers) {
        var container = $("#layersListContainer");
        container.empty();
        layers.forEach(layerModel => {
            container.append(this.appendLayerLink(layerModel));
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
                    <div id='layerLevelSelector' class='menu-margins'>
                        <fieldset>
                            <legend>Layer Levels</legend>
                            Show all <input type="checkbox" class="showAllLayersCheckbox align-middle" checked> |
                            Level 1 <input type="checkbox" class="showLevel1Checkbox align-middle"> | 
                            Level 2 <input type="checkbox" class="showLevel2Checkbox align-middle"> | 
                            Level 3 <input type="checkbox" class="showLevel3Checkbox align-middle"> 
                        </fieldset>
                    </div>
                    <p />
                    <div class='menu-margins menu-content-vh'>
                        <ul id='layersListContainer'></ul>
                    </div>
                </div>`;
    }
}