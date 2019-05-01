
class GeoLayerModel {
    constructor(id, name, geojson, publicTag, userTag, userId) {
        this.Id = id;
        this.LayerName = name;
        this.Geojson = geojson;
        this.PublicTag = publicTag;
        this.UserTag = userTag;
        this.UserId = userId;
    }

    toString() {
        return JSON.stringify(this);
    }
}