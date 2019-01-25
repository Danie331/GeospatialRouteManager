
class GeoLayerModel {
    constructor(id, name, geojson) {
        this.Id = id;
        this.LayerName = name;
        this.Geojson = geojson;
    }

    toString() {
        return JSON.stringify(this);
    }
}