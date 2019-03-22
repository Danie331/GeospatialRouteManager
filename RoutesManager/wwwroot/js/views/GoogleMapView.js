
class GoogleMapView {
    constructor(viewController, eventBroker) {
        this.viewController = viewController;
        this.eventBroker = eventBroker;
        this.map = null;
        this.selectedLayer = null;
        this.layerCache = null;
        this.infowindow = null;
        this.addFeatureEventHandlerInstance = null;

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
        this.eventBroker.subscribe(this.onDeleteLayer.bind(this), EventType.BEFORE_DELETE_LAYER);
        this.eventBroker.subscribe(this.onLayerDeleted.bind(this), EventType.LAYER_DELETED);
        this.eventBroker.subscribe(this.onLayerSaved.bind(this), EventType.LAYER_SAVED);
        this.eventBroker.subscribe(this.afterLayersLoaded.bind(this), EventType.AFTER_LAYERS_SHOWN);
        this.eventBroker.subscribe(this.onSelectLayer.bind(this), EventType.SELECT_LAYER);
        this.eventBroker.subscribe(this.toggleLayers.bind(this), EventType.TOGGLE_LAYERS);
        this.eventBroker.subscribe(this.plotLocationMarker.bind(this), EventType.PLOT_LOCATION);
        this.eventBroker.subscribe(this.plotLocationMarker.bind(this), EventType.W3W_RETRIEVED);

        return this;
    }

    createMapScript() {
        var script = document.createElement('script');
        script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDQ3eXd26fw0zaOG95D4u5vgki7asjfY4I&callback=initGoogleMap&libraries=drawing,places";
        document.body.appendChild(script);

        return this;
    }

    createMapCallback() {
        window["initGoogleMap"] = () => {
            try {
                const coords = { latitude: -33.945282, longitude: 18.597752 };
                this.map = new google.maps.Map(document.getElementById("map"),
                    { mapTypeId: 'roadmap', center: { lat: coords.latitude, lng: coords.longitude }, zoom: 10 });

                this.enableDrawing();

                var context = this;
                this.map.data.addListener('click', event => {
                    context.handleLayerClick(event.feature);
                    context.handleDeleteVertex(event);
                });
                this.map.data.setStyle(feature => {
                    var colour = feature.getProperty("LayerColour");
                    return {
                        fillColor: colour,
                        fillOpacity: 0.7,
                        strokeWeight: 1
                    }
                });

                this.infowindow = new google.maps.InfoWindow();
                this.eventBroker.broadcast(EventType.MAP_LOADED, {});

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
            var layerModel = new GeoLayerModel(0, '', 0, geoJson);
            context.layerCache.push(layerModel);
            var layerGeojson = JSON.parse(layerModel.Geojson);
            context.map.data.addGeoJson(layerGeojson, { idPropertyName: "Id" });
            drawingManager.setDrawingMode(null);
            layer.setMap(null);
        });
    }

    onLayersLoaded(layerModelList) {
        this.layerCache = layerModelList;
        this.layerCache.forEach(layerModel => {
            var layerGeojson = JSON.parse(layerModel.Geojson);
            this.map.data.addGeoJson(layerGeojson, { idPropertyName: "Id" });
        });
        this.eventBroker.broadcast(EventType.AFTER_LAYERS_SHOWN, {});
    }

    toggleLayers(selectedLevels) {
        this.unselectActiveLayer();

        this.map.data.forEach(feature => {
            this.map.data.remove(feature);
        });

        // Remove the event handler listening for new features/layers.
        this.addFeatureEventHandlerInstance.remove();
        this.addFeatureEventHandlerInstance = null;

        var filteredLayers = _.filter(this.layerCache, layer => {
            return _.includes(selectedLevels, layer.Level);
        });
        filteredLayers.forEach(layerModel => {
            var layerGeojson = JSON.parse(layerModel.Geojson);
            this.map.data.addGeoJson(layerGeojson, { idPropertyName: "Id" });
        });
        this.eventBroker.broadcast(EventType.AFTER_LAYERS_SHOWN, {});
    }

    afterLayersLoaded() {
        var context = this;
        this.addFeatureEventHandlerInstance = this.map.data.addListener('addfeature', e => { context.handleLayerClick(e.feature); });
    }

    unselectActiveLayer() {
        this.infowindow.close();
        if (this.selectedLayer) {
            this.map.data.overrideStyle(this.selectedLayer, { editable: false });
            if (this.selectedLayer.getProperty("Id") == 0) {
                this.map.data.remove(this.selectedLayer);
            }
        }
    }

    handleLayerClick(feature) {
        this.unselectActiveLayer();
        this.selectedLayer = feature;
        this.map.data.overrideStyle(this.selectedLayer, { editable: true });
        var id = this.selectedLayer.getProperty("Id");
        var targetLayer = this.layerCache.find(x => x.Id == id);
        var layerModel = new GeoLayerModel(targetLayer.Id, targetLayer.LayerName, targetLayer.Level, '');

        var content = this.viewController.getGeoLayerPopupContent(layerModel);
        var polyCoords = feature.getGeometry().getAt(0).getArray();
        var position = this.calcCentroid(polyCoords);
        this.infowindow.setContent(content);
        this.infowindow.setPosition(position);
        this.infowindow.open(this.map);

        this.eventBroker.broadcast(EventType.CLICK_LAYER, { LayerName: layerModel.LayerName });
    }

    onSaveLayer(layerModel) {
        this.selectedLayer.toGeoJson(p => {
            var json = JSON.stringify(p);
            var id = this.selectedLayer.getProperty("Id");
            var targetLayer = this.layerCache.find(x => x.Id == id);
            targetLayer.Geojson = json;
            var model = new GeoLayerModel(id, layerModel.LayerName, layerModel.Level, targetLayer.Geojson);
            this.eventBroker.broadcast(EventType.SAVE_LAYER, model);
        });
    }

    onDeleteLayer() {
        var id = this.selectedLayer.getProperty("Id");
        var model = new GeoLayerModel(id, '', 0, '');
        this.eventBroker.broadcast(EventType.DELETE_LAYER, model);
    }

    onLayerDeleted(model) {
        this.unselectActiveLayer();
        this.map.data.remove(this.selectedLayer);
        _.remove(this.layerCache, layer => layer.Id === model.Id);

        $.unblockUI();
    }

    onLayerSaved(model) {
        var targetLayer = this.layerCache.find(x => x.Id == model.Id);
        if (!targetLayer) {
            targetLayer = this.layerCache.find(x => x.Id == 0); // new layer
        }
        var layerGeoJson = JSON.parse(model.Geojson);
        this.selectedLayer.setProperty("Id", model.Id);
        var colour = layerGeoJson.properties.LayerColour;
        this.map.data.overrideStyle(this.selectedLayer, { fillColor: colour, fillOpacity: 0.7, strokeWeight: 1 });

        targetLayer.Id = model.Id;
        targetLayer.LayerName = model.LayerName;
        targetLayer.Level = model.Level;
        targetLayer.Geojson = model.Geojson;
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

    plotLocationMarker(geoLocationModel) {
        $.unblockUI();      
   
        var locationPos = new google.maps.LatLng(geoLocationModel.Lat, geoLocationModel.Lng);
        var marker = new google.maps.Marker({
            position: locationPos,
            map: this.map
        });

        var content = this.viewController.getGeolocationPopupContent(geoLocationModel);
        var context = this;
        marker.addListener('click', function () {
            context.infowindow.close();
            context.infowindow.setContent(content);
            context.infowindow.open(context.map, marker);
        });

        this.map.panTo(marker.getPosition());
        this.infowindow.setContent(content);
        this.infowindow.open(this.map, marker);
    }
}