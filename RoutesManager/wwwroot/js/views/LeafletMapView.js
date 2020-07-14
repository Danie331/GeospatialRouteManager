
class LeafletMapView {
    constructor(viewController, eventBroker) {
        this.viewController = viewController;
        this.eventBroker = eventBroker;
        this.map = null;
        this.activeLayer = null;
        this.drawnItems = null;
        this.layersCache = null;

        this.init();
    }

    init() {
        this.createMap()
            .attachEventListeners();
    }

    createMap() {
        try {
            const coords = { latitude: -33.945282, longitude: 18.597752 };

            this.map = L.map('map', {
                center: [coords.latitude, coords.longitude],
                zoom: 10,
                dragging: true
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);

            this.enableDrawing();

            this.eventBroker.broadcast(EventType.MAP_LOADED, {});
        }
        catch (e) {
            console.log(e);
        }

        return this;
    }

    attachEventListeners() {
        this.eventBroker.subscribe(this.onSaveLayer.bind(this), EventType.BEFORE_SAVE_LAYER);
        this.eventBroker.subscribe(this.onDeleteLayer.bind(this), EventType.BEFORE_DELETE_LAYER);
        this.eventBroker.subscribe(this.onLayerDeleted.bind(this), EventType.LAYER_DELETED);
        this.eventBroker.subscribe(this.onLayerSaved.bind(this), EventType.LAYER_SAVED);
        this.eventBroker.subscribe(this.onLayersLoaded.bind(this), EventType.LAYERS_LOADED);
        this.eventBroker.subscribe(this.onSelectLayer.bind(this), EventType.SELECT_LAYER);
        this.eventBroker.subscribe(this.togglePublicLayers.bind(this), EventType.TOGGLE_PUBLIC_LAYERS);
        this.eventBroker.subscribe(this.togglePrivateLayers.bind(this), EventType.TOGGLE_PRIVATE_LAYERS);
        this.eventBroker.subscribe(this.handleSwitchMenus.bind(this), EventType.TOGGLE_MENU, Ordinality.Highest);

        return this;
    }

    enableDrawing() {
        this.map.options.drawControl = true;
        this.drawnItems = new L.FeatureGroup();
        this.map.addLayer(this.drawnItems);
        var drawControl = new L.Control.Draw({
            position: 'topright',
            draw: {
                polygon: {
                    shapeOptions: {
                        color: 'red',
                        weight: 1
                    }
                },
                rectangle: false,
                circle: false,
                polyline: false,
                marker: false,
                circlemarker: false
            }
        });
        this.map.addControl(drawControl);
        var context = this;
        this.map.on(L.Draw.Event.CREATED, function (e) {
            var layer = e.layer, feature = layer.feature = layer.feature || {};
            feature.type = feature.type || "Feature"; 
            feature.properties = feature.properties || {};
            feature.properties.Id = 0;

            var userId = localStorage.getItem('user-id');
            var layerModel = new GeoLayerModel(0, '', '', null, null, userId);
            context.layersCache.push(layerModel);
            context.drawnItems.addLayer(e.layer);
            e.layer.on('click', () => {
                context.handleLayerClick(e.layer);
            }).fireEvent('click');
        });

        return this;
    }

    onSaveLayer(layerData) {
        var geojson = this.activeLayer.toGeoJSON();
        var id = geojson.properties.Id || 0;
        this.eventBroker.broadcast(EventType.SAVE_LAYER, new GeoLayerModel(id, layerData.LayerName, geojson, layerData.PublicTag, layerData.UserTag));
    }

    onDeleteLayer() {
        var geojson = this.activeLayer.toGeoJSON();
        var id = geojson.properties.Id || 0;
        this.eventBroker.broadcast(EventType.DELETE_LAYER, new GeoLayerModel(id, '', '', null, null));
    }

    onLayerDeleted(layerModel) {
        this.unselectActiveLayer();
        var context = this;
        this.map.eachLayer(function (layer) {
            if (typeof layer.toGeoJSON === 'undefined')
                return;
            var geojson = layer.toGeoJSON();
            if (_.has(geojson, 'properties') && geojson.properties.Id == layerModel.Id) {
                context.map.removeLayer(layer);
            }
        });

        _.remove(this.layersCache, layer => layer.Id === layerModel.Id);

        $.unblockUI();
    }

    onLayerSaved(geoLayerModel) {
        var targetLayer = this.layersCache.find(x => x.Id == geoLayerModel.Id);
        if (!targetLayer) {
            targetLayer = this.layersCache.find(x => x.Id == 0); // new layer
        }

        this.activeLayer.feature.properties.Id = geoLayerModel.Id;
        this.activeLayer.setStyle({ color: JSON.parse(geoLayerModel.Geojson).properties.LayerColour, weight: 1, fillOpacity: 0.7 });

        targetLayer.Id = geoLayerModel.Id;
        targetLayer.LayerName = geoLayerModel.LayerName;
        targetLayer.PublicTag = geoLayerModel.PublicTag;
        targetLayer.UserTag = geoLayerModel.UserTag;
        targetLayer.Geojson = geoLayerModel.Geojson;
        targetLayer.UserId = geoLayerModel.UserId;
    }

    togglePublicLayers(selectedLevels) {
        this.unselectActiveLayer();
        var context = this;
        this.map.eachLayer(function (layer) {
            if (typeof layer.toGeoJSON === 'undefined')
                return;
            var geojson = layer.toGeoJSON();
            if (_.has(geojson, 'properties')) {
                context.map.removeLayer(layer);
            }
        });

        var filteredLayers = _.filter(this.layersCache, layer => {
            return _.includes(selectedLevels, layer.PublicTag.TagValue);
        });

        filteredLayers.forEach(layerModel => {
            L.geoJson(JSON.parse(layerModel.Geojson), {
                onEachFeature: function (feature, layer) {
                    var colour = feature.properties.LayerColour;
                    layer.setStyle({ color: colour, weight: 1, fillOpacity: 0.7 });
                    layer.on('click', () => context.handleLayerClick(layer));
                    context.drawnItems.addLayer(layer);
                }
            });
        });
        this.eventBroker.broadcast(EventType.AFTER_LAYERS_SHOWN, {});
    }

    togglePrivateLayers(tags) {
        this.unselectActiveLayer();
        var context = this;
        this.map.eachLayer(function (layer) {
            if (typeof layer.toGeoJSON === 'undefined')
                return;
            var geojson = layer.toGeoJSON();
            if (_.has(geojson, 'properties')) {
                context.map.removeLayer(layer);
            }
        });
        var userId = localStorage.getItem('user-id');
        var filteredLayers = _.filter(this.layersCache, layer => {
            var userIsOwner = !layer.UserId || (userId == layer.UserId);
            var canIncludeLayer = true;
            if (tags && tags.length) {
                canIncludeLayer = layer.UserTag && _.some(tags, e => e.TagValue !== '' && e.TagValue == layer.UserTag.TagValue);
            }
            return userIsOwner && canIncludeLayer;
        });

        filteredLayers.forEach(layerModel => {
            L.geoJson(JSON.parse(layerModel.Geojson), {
                onEachFeature: function (feature, layer) {
                    var colour = feature.properties.LayerColour;
                    layer.setStyle({ color: colour, weight: 1, fillOpacity: 0.7 });
                    layer.on('click', () => context.handleLayerClick(layer));
                    context.drawnItems.addLayer(layer);
                }
            });
        });
        this.eventBroker.broadcast(EventType.AFTER_LAYERS_SHOWN, {});
    }

    unselectActiveLayer() {
        if (this.activeLayer) {
            this.activeLayer.editing.disable();
            var geojson = this.activeLayer.toGeoJSON();
            if (geojson.properties.Id == 0) {
                this.map.removeLayer(this.activeLayer);
                _.remove(this.layersCache, x => x.Id == 0);
            }
            this.activeLayer = null;
        }
    }

    handleLayerClick(layer) {
        this.unselectActiveLayer();
        this.activeLayer = layer;
        var geojson = this.activeLayer.toGeoJSON();
        var layerModel = this.layersCache.find(x => x.Id == geojson.properties.Id);

        var userId = localStorage.getItem('user-id');
        var userIsOwner = (!layerModel || !layerModel.UserId) || (userId == layerModel.UserId);
        if (userIsOwner) {
            this.activeLayer.editing.enable();
        }
        if (!layerModel) {
            layerModel = this.layersCache.find(x => x.Id == 0);
        }
        this.activeLayer.bindPopup(this.viewController.getGeoLayerPopupContent(layerModel)).openPopup();
        this.eventBroker.broadcast(EventType.CLICK_LAYER, layerModel);
    }

    onLayersLoaded(layerModelList) {
        this.layersCache = layerModelList;
        var parent = this;
        this.layersCache.forEach(layerModel => {
            L.geoJson(JSON.parse(layerModel.Geojson), {
                onEachFeature: function (feature, layer) {
                    var colour = feature.properties.LayerColour;
                    layer.setStyle({ color: colour, weight: 1, fillOpacity: 0.7 });
                    layer.on('click', () => parent.handleLayerClick(layer));
                    parent.drawnItems.addLayer(layer);
                }
            });
        });
        this.eventBroker.broadcast(EventType.AFTER_LAYERS_SHOWN, {});
    }

    onSelectLayer(layerModel) {
        var context = this.map;
        context.eachLayer(function (layer) {
            if (typeof layer.toGeoJSON === 'undefined')
                return;
            var geojson = layer.toGeoJSON();
            if (_.has(geojson, 'properties')) {
                if (geojson.properties.Id == layerModel.Id) {
                    layer.fireEvent('click');
                    var popupXY = layer.getPopup().getLatLng();
                    context.panTo(popupXY);
                }
            }
        });
    }

    handleSwitchMenus() {
        this.unselectActiveLayer();
    }
}