class UserTagModel {
    constructor(tagName, tagValue) {
        this.TagName = tagName;
        this.TagValue = tagValue;
    }

    toString() {
        return JSON.stringify(this);
    }
}