
class GoogleMapView {
    constructor(viewController, eventBroker) {
        this.viewController = viewController;
        this.eventBroker = eventBroker;
        this.map = null;
        this.selectedLayer = null;
        this.layerCache = null;
        this.infowindow = null;
        this.addFeatureEventHandlerInstance = null;
        this.locationCache = null;
        this.markerCache = [];

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
        this.eventBroker.subscribe(this.togglePublicLayers.bind(this), EventType.TOGGLE_PUBLIC_LAYERS);
        this.eventBroker.subscribe(this.togglePrivateLayers.bind(this), EventType.TOGGLE_PRIVATE_LAYERS);
        this.eventBroker.subscribe(this.plotLocationMarker.bind(this), EventType.PLOT_LOCATION);
        this.eventBroker.subscribe(this.handleSwitchMenus.bind(this), EventType.TOGGLE_MENU, Ordinality.Highest);
        this.eventBroker.subscribe(this.onPlacesLoaded.bind(this), EventType.PLACES_LOADED);
        this.eventBroker.subscribe(this.handleFindLocationById.bind(this), EventType.FIND_LOCATION_BY_PLACE_ID);

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
                this.map.data.addListener('mouseover', function (event) {
                    var id = event.feature.getProperty("Id");
                    if (context.selectedLayer && context.selectedLayer.getProperty("Id") == id) {
                        return;
                    }
                    var targetLayer = context.layerCache.find(x => x.Id == id);
                    if (!targetLayer) {
                        return; // NB.: return in this instance due to indeterminate order of firing of google events.
                    }
                    var content = context.viewController.getGeoLayerHoverContent(targetLayer);
                    event.feature.infowindow = event.feature.infowindow || new google.maps.InfoWindow();
                    event.feature.infowindow.setContent(content);
                    event.feature.infowindow.setPosition(event.latLng);
                    event.feature.infowindow.open(this.map);
                });
                this.map.data.addListener('mouseout', function (event) {
                    if (event.feature.infowindow) {
                        event.feature.infowindow.close();
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

            var userId = localStorage.getItem('user-id');
            var layerModel = new GeoLayerModel(0, '', geoJson, null, null, userId);
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

    togglePublicLayers(selectedLevels) {
        this.unselectActiveLayer();

        this.map.data.forEach(feature => {
            this.map.data.remove(feature);
        });

        // Remove the event handler listening for new features/layers.
        this.addFeatureEventHandlerInstance.remove();
        this.addFeatureEventHandlerInstance = null;

        var filteredLayers = _.filter(this.layerCache, layer => {
            return _.includes(selectedLevels, layer.PublicTag.TagValue);
        });
        filteredLayers.forEach(layerModel => {
            var layerGeojson = JSON.parse(layerModel.Geojson);
            this.map.data.addGeoJson(layerGeojson, { idPropertyName: "Id" });
        });
        this.eventBroker.broadcast(EventType.AFTER_LAYERS_SHOWN, {});
    }

    togglePrivateLayers(tags) {
        this.unselectActiveLayer();

        this.map.data.forEach(feature => {
            this.map.data.remove(feature);
        });

        // Remove the event handler listening for new features/layers.
        if (this.addFeatureEventHandlerInstance) {
            this.addFeatureEventHandlerInstance.remove();
        }
        this.addFeatureEventHandlerInstance = null;
        var userId = localStorage.getItem('user-id');
        var filteredLayers = _.filter(this.layerCache, layer => {
            var userIsOwner = !layer.UserId || (userId == layer.UserId);
            var canIncludeLayer = true;
            if (tags && tags.length) {
                canIncludeLayer = layer.UserTag && _.some(tags, e => e.TagValue !== '' && e.TagValue == layer.UserTag.TagValue);
            }
            return userIsOwner && canIncludeLayer;
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
        if (this.infowindow) {
            this.infowindow.close();
        }
        if (this.selectedLayer) {
            this.map.data.overrideStyle(this.selectedLayer, { editable: false });
            if (this.selectedLayer.getProperty("Id") == 0) {
                this.map.data.remove(this.selectedLayer);
                _.remove(this.layerCache, x => x.Id == 0);
            }
            this.selectedLayer = null;
        }
    }

    handleLayerClick(feature) {       
        this.unselectActiveLayer();
        this.selectedLayer = feature;
        if (this.selectedLayer.infowindow) {
            this.selectedLayer.infowindow.close();
        }
        var id = this.selectedLayer.getProperty("Id");
        var targetLayer = this.layerCache.find(x => x.Id == id);
        if (!targetLayer) {
            return; // NB.: return in this instance due to indeterminate order of firing of google events.
        }

        var userId = localStorage.getItem('user-id');
        var userIsOwner = !targetLayer.UserId || (userId == targetLayer.UserId);

        this.map.data.overrideStyle(this.selectedLayer, { editable: userIsOwner });
        var layerModel = new GeoLayerModel(targetLayer.Id, targetLayer.LayerName, '', targetLayer.PublicTag, targetLayer.UserTag, targetLayer.UserId);

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
            var model = new GeoLayerModel(id, layerModel.LayerName, targetLayer.Geojson, layerModel.PublicTag, layerModel.UserTag);
            this.eventBroker.broadcast(EventType.SAVE_LAYER, model);
        });
    }

    onDeleteLayer() {
        var id = this.selectedLayer.getProperty("Id");
        var model = new GeoLayerModel(id, '', '', null, null);
        this.eventBroker.broadcast(EventType.DELETE_LAYER, model);
    }

    onLayerDeleted(model) {
        if (this.infowindow) {
            this.infowindow.close();
        }
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
        targetLayer.PublicTag = model.PublicTag;
        targetLayer.UserTag = model.UserTag;
        targetLayer.Geojson = model.Geojson;
        targetLayer.UserId = model.UserId;
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
        marker.LocationObject = geoLocationModel;
        this.markerCache.push(marker);

        var content = this.viewController.getGeolocationPopupContent(geoLocationModel);
        var context = this;
        marker.addListener('click', function () {
            context.eventBroker.broadcast(EventType.MARKER_CLICK, this.LocationObject);
            context.infowindow.close();
            context.infowindow.setContent(context.viewController.getGeolocationPopupContent());
            context.infowindow.open(context.map, marker);
        });

        this.map.panTo(marker.getPosition());
        this.infowindow.setContent(content);
        this.infowindow.open(this.map, marker);

        if (!geoLocationModel.What3Words) {
            this.eventBroker.broadcast(EventType.FIND_3_WORDS, geoLocationModel);
        } 
    }

    handleSwitchMenus() {
        this.unselectActiveLayer();
    }

    plotLocationMarker2(geoLocationModel) {
        var locationPos = new google.maps.LatLng(geoLocationModel.Lat, geoLocationModel.Lng);
        var marker = new google.maps.Marker({
            position: locationPos,
            map: this.map
        });
        marker.LocationObject = geoLocationModel;
        this.markerCache.push(marker);

        var context = this;
        marker.addListener('click', function () {
            context.eventBroker.broadcast(EventType.MARKER_CLICK, this.LocationObject);
            context.infowindow.close();
            context.infowindow.setContent(context.viewController.getGeolocationPopupContent());
            context.infowindow.open(context.map, marker);

            if (!this.LocationObject.What3Words) {
                context.eventBroker.broadcast(EventType.FIND_3_WORDS, this.LocationObject);
            } 
        });
    }

    onPlacesLoaded(places) {
        this.locationCache = places;
        this.locationCache.forEach(locationModel => {
            this.plotLocationMarker2(locationModel);
        });
    }

    handleFindLocationById(location) {
        var providerJSON = JSON.parse(location.ProviderPayload);
        var placeFound = false;
        this.locationCache.forEach(loc => {
            var json = null;
            try {
                json = JSON.parse(loc.ProviderPayload);
            }
            catch (e) { }
            if (json) {
                if (json.place_id === providerJSON.place_id) {
                    placeFound = true;
                    this.markerCache.forEach(m => {
                        if (m.LocationObject == loc) {
                            new google.maps.event.trigger(m, 'click');
                        }
                    });
                }
            }
        });

        if (!placeFound) {
            this.eventBroker.broadcast(EventType.PLOT_LOCATION, location);
        }
    }
}