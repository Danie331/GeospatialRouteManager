class ApiController {
    constructor(eventObserver) {
        this.apiBaseUrl = app.API_BASE_URL;
        this.eventObserver = eventObserver;

        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.eventObserver.subscribe(this.saveGeoLayer.bind(this), EventType.SAVE_LAYER);
        this.eventObserver.subscribe(this.deleteGeoLayer.bind(this), EventType.DELETE_LAYER);
        this.eventObserver.subscribe(this.getAreas.bind(this), EventType.MAP_LOADED);
        this.eventObserver.subscribe(this.saveSettings.bind(this), EventType.SAVE_SETTINGS);
        this.eventObserver.subscribe(this.findLocation.bind(this), EventType.FIND_LOCATION);
        this.eventObserver.subscribe(this.findWhat3Words.bind(this), EventType.FIND_3_WORDS);
        this.eventObserver.subscribe(this.suburbsSearch.bind(this), EventType.SEARCH_SUBURBS);
        this.eventObserver.subscribe(this.addressesSearch.bind(this), EventType.SEARCH_ADDRESSES);
        this.eventObserver.subscribe(this.sectionalTitleSearch.bind(this), EventType.SEARCH_SECTIONAL_TITLES);
        this.eventObserver.subscribe(this.getUserTags.bind(this), EventType.LOAD_USER_TAGS);
        this.eventObserver.subscribe(this.saveUserTags.bind(this), EventType.SAVE_TAGS);
    }

    /////////////////////////////////////////////   API   //////////////////////////////////////////////////

    getAreas() {
        var endpoint = `${this.apiBaseUrl}/geospatial/allareas`;
        //var userRole = localStorage.getItem('user-role');
        //if (userRole == 'admin-view') {
        //    endpoint = `${this.apiBaseUrl}/geospatial/allareas`;
        //}       
        fetch(endpoint, this.createRequestObject('GET', null))
            .then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then(areas => {
                var areaLayerList = [];
                areas.forEach(areaLayer => {
                    areaLayerList.push(new GeoLayerModel(areaLayer.Id, areaLayer.LayerName, areaLayer.Geojson, areaLayer.PublicTag, areaLayer.UserTag, areaLayer.UserId));
                });
                this.eventObserver.broadcast(EventType.LAYERS_LOADED, areaLayerList);
            })
            .catch(err => this.handleApiError(err));
    }
    
    saveGeoLayer(layerModel) {
        var endpoint = `${this.apiBaseUrl}/geospatial/savelayer`;
        fetch(endpoint, this.createRequestObject('POST', layerModel))
            .then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then(res => {
                this.eventObserver.broadcast(EventType.LAYER_SAVED, new GeoLayerModel(res.Id, res.LayerName, res.Geojson, res.PublicTag, res.UserTag, res.UserId));
            })
            .catch(err => this.handleApiError(err));
    }

    deleteGeoLayer(layerModel) {
        var endpoint = `${this.apiBaseUrl}/geospatial/deletelayer`;
        fetch(endpoint, this.createRequestObject('POST', layerModel))
            .then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
            })
            .then(() => {
                this.eventObserver.broadcast(EventType.LAYER_DELETED, new GeoLayerModel(layerModel.Id, '', '', null, null));
            })
            .catch(err => this.handleApiError(err));
    }

    saveSettings(settings) {
        var endpoint = `${this.apiBaseUrl}/user/updatesettings`;
        fetch(endpoint, this.createRequestObject('POST', settings))
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
        fetch(endpoint, this.createRequestObject('POST', geoLocationModel))
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

    findWhat3Words(geoLocationModel) {
        var endpoint = `${this.apiBaseUrl}/geospatial/findw3w`;
        fetch(endpoint, this.createRequestObject('POST', geoLocationModel))
            .then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then(res => {
                geoLocationModel.What3Words = res.What3Words;
                this.eventObserver.broadcast(EventType.W3W_RETRIEVED, geoLocationModel);
            })
            .catch(err => this.handleApiError(err));
    }

    suburbsSearch(addressModel) {
        var endpoint = `${this.apiBaseUrl}/geospatial/findmatchingsuburbs?searchText=${addressModel.SearchText}`;
        fetch(endpoint, this.createRequestObject('GET', null))
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
        fetch(endpoint, this.createRequestObject('GET', null))
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
        fetch(endpoint, this.createRequestObject('GET', null))
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

    getUserTags() {
        var endpoint = `${this.apiBaseUrl}/user/tags`;
        fetch(endpoint, this.createRequestObject('GET', null))
            .then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then(tagsCollection => {
                this.eventObserver.broadcast(EventType.TAGS_LOADED, tagsCollection); // List of UserTagModel.js
            })
            .catch(err => this.handleApiError(err));
    }

    saveUserTags(userTagsCollection) {
        var endpoint = `${this.apiBaseUrl}/user/savetags`;
        fetch(endpoint, this.createRequestObject('POST', userTagsCollection))
            .then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then(userTagsCollection => {
                this.eventObserver.broadcast(EventType.TAGS_SAVED, userTagsCollection);
            })
            .catch(err => this.handleApiError(err));
    }

    createRequestObject(method, model) {
        var body = null;
        if (model != null) {
            if (Array.isArray(model)) {
                body = JSON.stringify(model);
            } else {
                body = model.toString();
            }
        }
        var headers = new Headers();
        headers.append("Content-Type", 'application/json');
        headers.append("Authorization", `Bearer ${localStorage.getItem('access-token')}`);
        var payload = {
            method: method,
            body: body,
            headers: headers
        };

        return payload;
    }

    handleApiError(error) {
        console.log(error.message);
        if (error.message === "Unauthorized") {
            window.location = 'unauthorized.html';
        }
    }
}