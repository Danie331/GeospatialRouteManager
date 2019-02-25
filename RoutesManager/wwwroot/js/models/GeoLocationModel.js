
class GeoLocationModel {
    constructor(id, formattedAddress, lat, lng, w3w, providerPayload) {
        this.Id = id;
        this.FormattedAddress = formattedAddress;
        this.Lat = lat;
        this.Lng = lng;
        this.What3Words = w3w;
        this.ProviderPayload = providerPayload;
    }

    toString() {
        return JSON.stringify(this);
    }
}