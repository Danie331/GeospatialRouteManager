
class AddressSearchModel {
    constructor(searchText, suburbId) {
        this.SearchText = searchText;
        this.SuburbId = suburbId;
    }

    toString() {
        return JSON.stringify(this);
    }
}