﻿
class MapViewController {
    constructor(eventBroker) {       
        this.$container = $("#map");
        this.eventBroker = eventBroker;
        this.mapProvider = null;
        this.userTagsCache = null;

        this.init();
    }

    init() {
        this.attachHandlers();
        this.attachEventListeners();
        
        var defaultMapProvider = localStorage.getItem('default-map');
        switch (defaultMapProvider) {
            case 'google':
                this.mapProvider = new GoogleMapView(this, this.eventBroker);
                break;
            case 'leaflet':
                this.mapProvider = new LeafletMapView(this, this.eventBroker);
                break;
            default:
                this.mapProvider = new GoogleMapView(this, this.eventBroker);
                break;
        }
    }

    attachHandlers() {
        this.$container.on('click', '.saveGeoLayerButton', {}, this.saveGeoLayerClickHandler.bind(this));
        this.$container.on('click', '.deleteGeoLayerButton', {}, this.deleteGeoLayerClickHandler.bind(this));
    }

    attachEventListeners() {
        this.eventBroker.subscribe(this.onGeoLayerSaving.bind(this), EventType.BEFORE_SAVE_LAYER);
        this.eventBroker.subscribe(this.onGeoLayerSaved.bind(this), EventType.LAYER_SAVED);
        this.eventBroker.subscribe(this.onLayerClick.bind(this), EventType.CLICK_LAYER);
        this.eventBroker.subscribe(this.onLayersShown.bind(this), EventType.AFTER_LAYERS_SHOWN);
        this.eventBroker.subscribe(this.onW3wRetrieved.bind(this), EventType.W3W_RETRIEVED);
        this.eventBroker.subscribe(this.onTagsLoaded.bind(this), EventType.TAGS_LOADED);
        this.eventBroker.subscribe(this.onTagsSaved.bind(this), EventType.TAGS_SAVED);
    }

    saveGeoLayerClickHandler() {
        var layerNameInput = $('.layerNameInput');
        if (layerNameInput.val() === '') {
            layerNameInput.focus();
            return;
        }

        var layerLevel = $(".layerLevelSelect").val();
        var userTagValue = $(".userTagSelector").children("option:selected").val();
        var publicTag = new PublicTagModel(`Level ${layerLevel}`, layerLevel);
        var userTag = new UserTagModel('user-tag', userTagValue);
        var layerModel = new GeoLayerModel(0, layerNameInput.val(), '', publicTag, userTag);
        this.eventBroker.broadcast(EventType.BEFORE_SAVE_LAYER, layerModel);
    }

    onTagsSaved(userTagsCollection) {
        this.userTagsCache = userTagsCollection;
    }

    onTagsLoaded(userTagsCollection) {
        this.userTagsCache = userTagsCollection;
    }

    deleteGeoLayerClickHandler() {
        Swal.fire({
            title: 'Delete Layer?',
            text: "",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.value) {
                $.blockUI({ message: "<h2 class='loading-text'>Deleting Layer...</h2>" });
                this.eventBroker.broadcast(EventType.BEFORE_DELETE_LAYER, {});
            }
        });      
    }

    onGeoLayerSaving() {
        $.blockUI({ message: "<h2 class='loading-text'>Saving...</h2>" });
        $(".saveGeoLayerButton").val('Saving...').attr("disabled", "disabled");
    }

    onGeoLayerSaved() {
        $(".saveGeoLayerButton").val('Save').removeAttr("disabled");
        $.unblockUI();
    }

    onLayerClick(layerModel) {
        $('.layerNameInput').focus().val(layerModel.LayerName ? layerModel.LayerName : '');
    }

    renderLayerLevelSetting(geoLayer) {
        var userId = localStorage.getItem('user-id');
        var userIsOwner = !geoLayer.UserId || (userId == geoLayer.UserId);

        var levelSetting = `<select class='layerLevelSelect' ${!userIsOwner ? "disabled" : ""}>`;
        [{ Id: '1', Name: '1' }, { Id: '2', Name: '2' }, { Id: '3', Name: '3' }].forEach(level => {
            var selected = level.Id == (geoLayer.PublicTag ? geoLayer.PublicTag.TagValue : '') ? 'selected' : '';
            var option = `<option value='${level.Id}' ${selected}>${level.Name}</option>`;
            levelSetting += option;
        });
        return levelSetting + '</select>';
    }

    getGeoLayerPopupContent(geoLayer) {
        var userId = localStorage.getItem('user-id');
        var userIsOwner = !geoLayer.UserId || (userId == geoLayer.UserId); // user can edit if they own the area (userId undefined if new)
        return `<div>
                    <span>
                        <div class='info-window-item-row'>
                            <label>Layer name: </label>
                            <input class='layerNameInput' type='text' value='${geoLayer.LayerName ? geoLayer.LayerName : ''}' ${!userIsOwner ? "disabled" : ""} />
                        </div>
                        <div class='info-window-item-row'>
                            <label>Priority level: </label>
                            ${this.renderLayerLevelSetting(geoLayer)}
                        </div>
                        <div class='info-window-item-row'>                                                      
                            ${this.renderUserTagOptions(geoLayer)}
                        </div>
                        <p />
                        ${userIsOwner ?
                "<input class='saveGeoLayerButton' type='button' value='Save' /> \
                                             <input class='deleteGeoLayerButton' type='button' value='Delete Layer' />"
                : ""}
                    </span>
                </div>`;
    }

    getGeolocationPopupContent(geoLocation) {
        return `<div class='info-window-geolocation'>
                    <span>
                        <div class='info-window-item-row'>
                            <label>Address: </label>
                            <input class='layerNameInput' type='text' value='${geoLocation.FormattedAddress ? geoLocation.FormattedAddress : "n/a"}' readonly />
                        </div>
                        <div class='info-window-item-row'>
                            <label>Lat/Lng: </label>
                            <input type='text' value='${geoLocation.Lat}, ${geoLocation.Lng}' readonly />
                        </div>
                        <div class='info-window-item-row'>
                            <label>What3Words: </label>
                            <input id='w3wInput-${geoLocation.uniqueIdentifier()}' type='text' value='${!geoLocation.What3Words ? "Loading..." : geoLocation.What3Words}' readonly />
                        </div>
                        <p />
                    </span>
                </div>`;
    }

    onW3wRetrieved(geoLocation) {
        var targetElement = $(`#w3wInput-${geoLocation.uniqueIdentifier()}`);
        if (targetElement.length) {
            targetElement.val(geoLocation.What3Words);
        }
    }

    onLayersShown() {
        this.eventBroker.unsubscribe(this.onLayersShown.bind(this), EventType.AFTER_LAYERS_SHOWN);
        // As per the default selected menu item
        this.eventBroker.broadcast(EventType.TOGGLE_MENU, { Menu: "layersMenu" });
        $.unblockUI();
    }

    renderUserTagOptions(geoLayer) {
        var userId = localStorage.getItem('user-id');
        var userIsOwner = !geoLayer.UserId || (userId == geoLayer.UserId);
        if (!userIsOwner)
            return "";
        var userTag = this.getUserTagValueFromLayer(geoLayer);

        var html = $(`<select class='userTagSelector' ${!userIsOwner ? "disabled" : ""} />`);
        html.append($("<option></option>").attr("value", "").text(""));
        this.userTagsCache.forEach(ut => {
            var selected = ut.TagValue === userTag ? 'selected' : '';
            html.append($(`<option ${selected}></option>`).attr("value", ut.TagValue).text(ut.TagValue)); 
        });
        return `<label>Tag: </label> ${html.prop('outerHTML')}`;
    }

    getUserTagValueFromLayer(layer) {
        if (layer.UserTag && this.userTagsCache) {
            var existingTag = this.userTagsCache.find(x => x.TagValue == layer.UserTag.TagValue);
            return existingTag ? existingTag.TagValue : "";
        }
        return "";
    }
}