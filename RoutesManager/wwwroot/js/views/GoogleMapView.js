
class GoogleMapView {
    constructor(viewController, eventObserver) {
        this.viewController = viewController;
        this.eventObserver = eventObserver;
        this.map = null;
        this.currentFeatureLayer = null;
        this.drawnItems = null;
        this.featureLayerModels = [];
        this.infowindow = null;

        this.init();
    }

    init() {
        this
            .attachEventListeners()
            .createMapScript()
            .createMapCallback();
    }

    attachEventListeners() {
        this.eventObserver.subscribe(this.onShowLayers.bind(this), EventType.SHOW_ALL_LAYERS);
        this.eventObserver.subscribe(this.onSaveLayer.bind(this), EventType.BEFORE_SAVE_LAYER);
        this.eventObserver.subscribe(this.onLayerSaved.bind(this), EventType.LAYER_SAVED);
        this.eventObserver.subscribe(this.afterLayersLoaded.bind(this), EventType.AFTER_SHOW_ALL_LAYERS);

        return this;
    }

    createMapScript() {
        var script = document.createElement('script');
        script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDQ3eXd26fw0zaOG95D4u5vgki7asjfY4I&callback=initGoogleMap&libraries=drawing";
        document.body.appendChild(script);

        return this;
    }

    createMapCallback() {
        window["initGoogleMap"] = () => {
            try {
                if (navigator && navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(pos => {
                        this.map = new google.maps.Map(document.getElementById("map"),
                            { mapTypeId: 'roadmap', center: { lat: pos.coords.latitude, lng: pos.coords.longitude }, zoom: 13 });

                        this.enableDrawing();
                        
                        var context = this;
                        this.map.data.addListener('click', event => {
                            context.handleLayerClick(event.feature);
                            context.handleDeleteVertex(event);
                        });

                        this.infowindow = new google.maps.InfoWindow();
                        this.eventObserver.broadcast(EventType.MAP_LOADED, {});
                    });
                }
            } catch (e) {
                console.log(e);
            }
        };

        return this;
    }

    enableDrawing() {
        var drawingManager = new google.maps.drawing.DrawingManager({
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT,
                drawingModes: ['polygon']
            }
        });
        drawingManager.setMap(this.map);
        var context = this;
        google.maps.event.addListener(drawingManager, 'polygoncomplete', function (layer) {
            var wkt = new Wkt.Wkt();
            var wktPoly = wkt.fromObject(layer);
            var geoJson = JSON.stringify({
                type: "Feature",
                properties: { Id: 0 },
                geometry: wktPoly.toJson()
            });
            var layerModel = new GeoLayerModel(0, '', geoJson);
            context.featureLayerModels.push(layerModel);
            var layerGeojson = JSON.parse(layerModel.Geojson);
            context.map.data.addGeoJson(layerGeojson, { idPropertyName: "Id" });
            drawingManager.setDrawingMode(null);
            layer.setMap(null);
        });
    }

    onShowLayers(layerModelList) {
        layerModelList.forEach(layerModel => {
            this.featureLayerModels.push(layerModel);
            var layerGeojson = JSON.parse(layerModel.Geojson);
            this.map.data.addGeoJson(layerGeojson, { idPropertyName: "Id" });
        });
        this.eventObserver.broadcast(EventType.AFTER_SHOW_ALL_LAYERS, {});
    }

    afterLayersLoaded() {
        var context = this;
        this.map.data.addListener('addfeature', e => { context.handleLayerClick(e.feature); });
    }

    handleLayerClick(feature) {
        if (this.currentFeatureLayer) {
            this.map.data.overrideStyle(this.currentFeatureLayer, { editable: false });
            if (this.currentFeatureLayer.getProperty("Id") == 0) {
                this.map.data.remove(this.currentFeatureLayer);
            }
        }
        this.currentFeatureLayer = feature;
        this.map.data.overrideStyle(this.currentFeatureLayer, { editable: true });
        var id = this.currentFeatureLayer.getProperty("Id");
        var targetFeatureLayerModel = this.featureLayerModels.find(x => x.Id == id);
        var layerModel = new GeoLayerModel(targetFeatureLayerModel.Id, targetFeatureLayerModel.LayerName, '');

        var content = this.viewController.getGeoLayerPopupContent(layerModel);
        var polyCoords = feature.getGeometry().getAt(0).getArray();
        var position = this.calcCentroid(polyCoords);
        this.infowindow.setContent(content);
        this.infowindow.setPosition(position);
        this.infowindow.open(this.map);

        this.eventObserver.broadcast(EventType.CLICK_LAYER, { LayerName: layerModel.LayerName });
    }

    onSaveLayer(nameContainer) {
        this.currentFeatureLayer.toGeoJson(p => {
            var json = JSON.stringify(p);
            var id = this.currentFeatureLayer.getProperty("Id");
            var targetFeatureLayerModel = this.featureLayerModels.find(x => x.Id == id);
            targetFeatureLayerModel.Geojson = json;
            var model = new GeoLayerModel(id, nameContainer.LayerName, targetFeatureLayerModel.Geojson);
            this.eventObserver.broadcast(EventType.SAVE_LAYER, model);
        });
    }

    onLayerSaved(model) {
        var targetFeatureLayerModel = this.featureLayerModels.find(x => x.Id == model.Id);
        if (!targetFeatureLayerModel) {
            targetFeatureLayerModel = this.featureLayerModels.find(x => x.Id == 0); // new layer
        }
        this.currentFeatureLayer.setProperty("Id", model.Id);
        targetFeatureLayerModel.Id = model.Id;
        targetFeatureLayerModel.LayerName = model.LayerName;
    }

    calcCentroid(polyPoints) {
        var bounds = new google.maps.LatLngBounds();
        polyPoints.forEach(p => {
            bounds.extend(p);
        });

        return bounds.getCenter();
    }

    handleDeleteVertex(ev) {        
            var newPolyPoints = [];
            ev.feature.getGeometry().forEachLatLng(function (latlng) {
                if (latlng.lat() == ev.latLng.lat() && latlng.lng() == ev.latLng.lng()) {
                } else {
                    newPolyPoints.push(latlng);
                }
            });

            var newLinearRing = new google.maps.Data.LinearRing(newPolyPoints);
            var newPoly = new google.maps.Data.Polygon([newLinearRing]);
            ev.feature.setGeometry(newPoly);
    }
}