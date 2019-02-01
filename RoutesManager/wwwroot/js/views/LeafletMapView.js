
class LeafletMapView {
    constructor(viewController, eventBroker) {
        this.viewController = viewController;
        this.eventBroker = eventBroker;
        this.map = null;
        this.activeLayer = null;
        this.drawnItems = null;

        this.init();
    }

    init() {
        this.createMap()
            .attachEventListeners();
    }

    createMap() {
        try {
            if (navigator && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    const coords = pos.coords;

                    this.map = L.map('map', {
                        center: [coords.latitude, coords.longitude],
                        zoom: 13,
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
                });
            }
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
        var parent = this;
        this.map.on(L.Draw.Event.CREATED, function (e) {
            parent.drawnItems.addLayer(e.layer);
            e.layer.on('click', () => {
                parent.handleLayerClick(e.layer);
            }).fireEvent('click');
        });

        return this;
    }

    onSaveLayer(layerNameContainer) {
        var layerModel = new GeoLayerModel(this.activeLayer.myLayerId, layerNameContainer.LayerName, this.activeLayer.toGeoJSON());
        this.eventBroker.broadcast(EventType.SAVE_LAYER, layerModel);
    }

    onLayerSaved(geoLayerModel) {
        this.activeLayer.myLayerId = geoLayerModel.Id;
        this.activeLayer.myLayerName = geoLayerModel.LayerName;
    }

    handleLayerClick(layer) {
        if (this.activeLayer) {
            this.activeLayer.editing.disable();
        }
        this.activeLayer = layer;
        this.activeLayer.editing.enable();
        var layerModel = new GeoLayerModel(layer.myLayerId, layer.myLayerName, /*layer.toGeoJSON()*/'');
        this.activeLayer.bindPopup(this.viewController.getGeoLayerPopupContent(layerModel)).openPopup();
        this.eventBroker.broadcast(EventType.CLICK_LAYER, layerModel);
    }

    onLayersLoaded(layerModelList) {
        var parent = this;
        layerModelList.forEach(layerModel => {
            L.geoJson(JSON.parse(layerModel.Geojson), {
                onEachFeature: function (feature, layer) {
                    layer.setStyle({ color: 'red', weight: 1 });
                     layer.myLayerId = layerModel.Id;
                     layer.myLayerName = layerModel.LayerName;

                     layer.on('click', () => parent.handleLayerClick(layer));
                    parent.drawnItems.addLayer(layer);
                }
            });            
        });        
    }

    onSelectLayer(layerModel) {
        var context = this.map;
        context.eachLayer(function (layer) {
            if (layer.myLayerId == layerModel.Id) {
                layer.fireEvent('click');
                var popupXY = layer.getPopup().getLatLng();
                context.panTo(popupXY);
            }
        });
    }
}