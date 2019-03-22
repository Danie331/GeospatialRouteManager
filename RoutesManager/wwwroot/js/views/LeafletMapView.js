
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
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGFuaWUzMzAiLCJhIjoiY2pxeTlqc242MDE5cTQzcnpubHlyeTJucyJ9.Omq9E98-rSVM2EWccOdFtg', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 30,
                id: 'mapbox.streets',
                accessToken: 'pk.eyJ1IjoiZGFuaWUzMzAiLCJhIjoiY2pxeTlqc242MDE5cTQzcnpubHlyeTJucyJ9.Omq9E98-rSVM2EWccOdFtg'
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
        this.eventBroker.subscribe(this.onLayerSaved.bind(this), EventType.LAYER_SAVED);
        this.eventBroker.subscribe(this.onLayersLoaded.bind(this), EventType.LAYERS_LOADED);
        this.eventBroker.subscribe(this.onSelectLayer.bind(this), EventType.SELECT_LAYER);
        this.eventBroker.subscribe(this.toggleLayers.bind(this), EventType.TOGGLE_LAYERS);

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

            var layerModel = new GeoLayerModel(0, '', 0, '');
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
        this.eventBroker.broadcast(EventType.SAVE_LAYER, new GeoLayerModel(id, layerData.LayerName, layerData.Level, geojson));
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
        targetLayer.Level = geoLayerModel.Level;
        targetLayer.Geojson = geoLayerModel.Geojson;
    }

    toggleLayers(selectedLevels) {
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
            return _.includes(selectedLevels, layer.Level);
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
            }
        }
    }

    handleLayerClick(layer) {
        this.unselectActiveLayer();

        this.activeLayer = layer;
        this.activeLayer.editing.enable();
        var geojson = this.activeLayer.toGeoJSON();
        var layerModel = this.layersCache.find(x => x.Id == geojson.properties.Id);
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
}