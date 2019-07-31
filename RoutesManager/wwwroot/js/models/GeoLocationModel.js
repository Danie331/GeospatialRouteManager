
class GeoLocationModel {
    constructor(id, formattedAddress, lat, lng, w3w, providerPayload, friendlyName, userTag) {
        this.LocationId = id;
        this.FormattedAddress = formattedAddress;
        this.Lat = lat;
        this.Lng = lng;
        this.What3Words = w3w;
        this.ProviderPayload = providerPayload;
        this.FriendlyName = friendlyName;
        this.UserTag = userTag;
    }

    toString() {
        return JSON.stringify(this);
    }

    uniqueIdentifier() {
        return (((this.Lat + 90) * 180 + this.Lng) + '').replace('.', '');
    }
}