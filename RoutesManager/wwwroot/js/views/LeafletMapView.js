﻿
class LeafletMapView {
    constructor(viewController, eventObserver) {
        this.viewController = viewController;
        this.eventObserver = eventObserver;
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

                    this.eventObserver.broadcast(EventType.MAP_LOADED, {});
                });
            }
        }
        catch (e) {
            console.log(e);
        }

        return this;
    }

    attachEventListeners() {
        this.eventObserver.subscribe(this.onSaveLayer.bind(this), EventType.BEFORE_SAVE_LAYER);
        this.eventObserver.subscribe(this.onLayerSaved.bind(this), EventType.LAYER_SAVED);
        this.eventObserver.subscribe(this.showLayers.bind(this), EventType.SHOW_ALL_LAYERS);

        return this;
    }

    enableDrawing() {
        this.map.options.drawControl = true;
        this.drawnItems = new L.FeatureGroup();
        this.map.addLayer(this.drawnItems);
        var drawControl = new L.Control.Draw({
            position: 'topright',
            draw: {
                polygon: true,
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
        this.eventObserver.broadcast(EventType.SAVE_LAYER, layerModel);
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
        this.eventObserver.broadcast(EventType.CLICK_LAYER, layerModel);
    }

    showLayers(layerModelList) {
        var parent = this;
        layerModelList.forEach(layerModel => {
            L.geoJson(JSON.parse(layerModel.Geojson), {
                 onEachFeature: function (feature, layer) {
                     layer.myLayerId = layerModel.Id;
                     layer.myLayerName = layerModel.LayerName;

                     layer.on('click', () => parent.handleLayerClick(layer));
                    parent.drawnItems.addLayer(layer);
                }
            });            
        });        
    }
}