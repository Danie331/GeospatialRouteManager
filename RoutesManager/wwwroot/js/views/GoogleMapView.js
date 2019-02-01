
class GoogleMapView {
    constructor(viewController, eventBroker) {
        this.viewController = viewController;
        this.eventBroker = eventBroker;
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
        this.eventBroker.subscribe(this.onLayersLoaded.bind(this), EventType.LAYERS_LOADED);
        this.eventBroker.subscribe(this.onSaveLayer.bind(this), EventType.BEFORE_SAVE_LAYER);
        this.eventBroker.subscribe(this.onLayerSaved.bind(this), EventType.LAYER_SAVED);
        this.eventBroker.subscribe(this.afterLayersLoaded.bind(this), EventType.AFTER_LAYERS_SHOWN);
        this.eventBroker.subscribe(this.onSelectLayer.bind(this), EventType.SELECT_LAYER);

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
                        this.map.data.setStyle({
                            fillColor: 'red',
                            strokeWeight: 1
                        });

                        this.infowindow = new google.maps.InfoWindow();
                        this.eventBroker.broadcast(EventType.MAP_LOADED, {});
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
            },
            polygonOptions: {
                fillColor: 'red',
                //fillOpacity: 1,
                strokeWeight: 1
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

    onLayersLoaded(layerModelList) {
        layerModelList.forEach(layerModel => {
            this.featureLayerModels.push(layerModel);
            var layerGeojson = JSON.parse(layerModel.Geojson);
            this.map.data.addGeoJson(layerGeojson, { idPropertyName: "Id" });
        });
        this.eventBroker.broadcast(EventType.AFTER_LAYERS_SHOWN, {});
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

        this.eventBroker.broadcast(EventType.CLICK_LAYER, { LayerName: layerModel.LayerName });
    }

    onSaveLayer(nameContainer) {
        this.currentFeatureLayer.toGeoJson(p => {
            var json = JSON.stringify(p);
            var id = this.currentFeatureLayer.getProperty("Id");
            var targetFeatureLayerModel = this.featureLayerModels.find(x => x.Id == id);
            targetFeatureLayerModel.Geojson = json;
            var model = new GeoLayerModel(id, nameContainer.LayerName, targetFeatureLayerModel.Geojson);
            this.eventBroker.broadcast(EventType.SAVE_LAYER, model);
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
        if (!ev.latLng) return;
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

    onSelectLayer(layerModel) {
        var context = this.map;
        context.data.forEach(feature => {
            var id = feature.getProperty("Id");
            if (id == layerModel.Id) {
                google.maps.event.trigger(context.data, 'click', { feature: feature });
                var polyCoords = feature.getGeometry().getAt(0).getArray();
                var position = this.calcCentroid(polyCoords);
                context.panTo(position);
            }
        });
    }
}