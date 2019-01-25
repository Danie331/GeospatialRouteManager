class ApiController {
    constructor(eventObserver) {
        this.apiBaseUrl = 'http://localhost:8000/api'; // enable CORS on server (and client?)
        this.eventObserver = eventObserver;

        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.eventObserver.subscribe(this.saveGeoLayer.bind(this), EventType.SAVE_LAYER);
        this.eventObserver.subscribe(this.getMyAreas.bind(this), EventType.MAP_LOADED);
    }

    /////////////////////////////////////////////   API   //////////////////////////////////////////////////

    getMyAreas() {
        var endpoint = `${this.apiBaseUrl}/geospatial/myareas`;
        fetch(endpoint)
            .then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then(areas => {
                var areaLayerList = [];
                areas.forEach(areaLayer => {
                    areaLayerList.push(new GeoLayerModel(areaLayer.Id, areaLayer.LayerName, areaLayer.Geojson));
                });
                this.eventObserver.broadcast(EventType.SHOW_ALL_LAYERS, areaLayerList);
            });
    }
    
    saveGeoLayer(layerModel) {
        var endpoint = `${this.apiBaseUrl}/geospatial/savelayer`;
        fetch(endpoint, this.createJsonPayload('POST', layerModel))
            .then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then(res => {
                this.eventObserver.broadcast(EventType.LAYER_SAVED, new GeoLayerModel(res.Id, res.LayerName, res.Geojson));
            })
            .catch(err => handleApiError(err));
    }

    createJsonPayload(method, model) {
        var body = model.toString();
        var payload = {
            method: method,
            body: body,
            headers: { 'Content-Type': 'application/json' }
        };

        return payload;
    }

    handleApiError(error) {
        console.log(error);
    }
}