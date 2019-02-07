
class GeoLayerModel {
    constructor(id, name, level, geojson) {
        this.Id = id;
        this.LayerName = name;
        this.Level = level;
        this.Geojson = geojson;
    }

    toString() {
        return JSON.stringify(this);
    }
}