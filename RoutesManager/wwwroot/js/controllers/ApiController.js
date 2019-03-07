class ApiController {
    constructor(eventObserver) {
        this.apiBaseUrl = 'http://localhost:8000/api';//'https://apiroutemanager2.azurewebsites.net/api'; 
        this.eventObserver = eventObserver;

        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.eventObserver.subscribe(this.saveGeoLayer.bind(this), EventType.SAVE_LAYER);
        this.eventObserver.subscribe(this.getMyAreas.bind(this), EventType.MAP_LOADED);
        this.eventObserver.subscribe(this.loadSettings.bind(this), EventType.LOAD_SETTINGS);
        this.eventObserver.subscribe(this.saveSettings.bind(this), EventType.SAVE_SETTINGS);
        this.eventObserver.subscribe(this.findLocation.bind(this), EventType.FIND_LOCATION);
        this.eventObserver.subscribe(this.suburbsSearch.bind(this), EventType.SEARCH_SUBURBS);
        this.eventObserver.subscribe(this.addressesSearch.bind(this), EventType.SEARCH_ADDRESSES);
        this.eventObserver.subscribe(this.sectionalTitleSearch.bind(this), EventType.SEARCH_SECTIONAL_TITLES);
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
                    areaLayerList.push(new GeoLayerModel(areaLayer.Id, areaLayer.LayerName, areaLayer.Level, areaLayer.Geojson));
                });
                this.eventObserver.broadcast(EventType.LAYERS_LOADED, areaLayerList);
            })
            .catch(err => this.handleApiError(err));
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
                this.eventObserver.broadcast(EventType.LAYER_SAVED, new GeoLayerModel(res.Id, res.LayerName, res.Level, res.Geojson));
            })
            .catch(err => this.handleApiError(err));
    }

    loadSettings(/* user Id */) {
        var endpoint = `${this.apiBaseUrl}/user/mysettings`;
        fetch(endpoint)
            .then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then(settings => {
                this.eventObserver.broadcast(EventType.SETTINGS_LOADED, new UserSettingsModel(settings.DefaultMapProvider));
            })
            .catch(err => this.handleApiError(err));
    }

    saveSettings(settings) {
        var endpoint = `${this.apiBaseUrl}/user/updatesettings`;
        fetch(endpoint, this.createJsonPayload('POST', settings))
            .then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
            })
            .then(() => {
                this.eventObserver.broadcast(EventType.SETTINGS_SAVED, {});
            })
            .catch(err => this.handleApiError(err));
    }

    findLocation(geoLocationModel) {
        var endpoint = `${this.apiBaseUrl}/geospatial/findlocation`;
        fetch(endpoint, this.createJsonPayload('POST', geoLocationModel))
            .then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then(res => {
                this.eventObserver.broadcast(EventType.PLOT_LOCATION, new GeoLocationModel(res.LocationId, res.FormattedAddress, res.Lat, res.Lng, res.What3Words, null));
            })
            .catch(err => this.handleApiError(err));
    }

    suburbsSearch(addressModel) {
        var endpoint = `${this.apiBaseUrl}/geospatial/findmatchingsuburbs?searchText=${addressModel.SearchText}`;
        fetch(endpoint)
            .then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then(res => {
                this.eventObserver.broadcast(EventType.SUBURBS_RETRIEVED, res);
            })
            .catch(err => this.handleApiError(err));
    }

    addressesSearch(addressModel) {
        var endpoint = `${this.apiBaseUrl}/geospatial/findmatchingaddresses?searchText=${addressModel.SearchText}&suburbId=${addressModel.SuburbId}`;
        fetch(endpoint)
            .then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then(res => {
                this.eventObserver.broadcast(EventType.ADDRESSES_RETRIEVED, res);
            })
            .catch(err => this.handleApiError(err));
    }

    sectionalTitleSearch(addressModel) {
        var endpoint = `${this.apiBaseUrl}/geospatial/findmatchingsectionaltitles?searchText=${addressModel.SearchText}&suburbId=${addressModel.SuburbId}`;
        fetch(endpoint)
            .then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then(res => {
                this.eventObserver.broadcast(EventType.SECTIONAL_TITLES_RETRIEVED, res);
            })
            .catch(err => this.handleApiError(err));
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