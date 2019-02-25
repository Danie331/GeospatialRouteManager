
class LocationFinderMenuView {
    constructor(eventBroker) {
        this.$container = $('#locationFinderMenu');
        this.eventBroker = eventBroker;
        this.settings = null;

        this.attachHandlers()
            .attachEventSubscribers();
    }

    render() {
        this.$container.append(this.content());

        return this;
    }

    attachHandlers() {
        $("#locationFinderMenu").on('keyup', '#w3wSearchField', e => {
            if (e.keyCode == 13) {
                var words = $('#w3wSearchField').val();
                if (words) {
                    this.handleSearchW3W(words);
                }
            } 
        });

        return this;
    }

    attachEventSubscribers() {
        this.eventBroker.subscribe(this.initSettings.bind(this), EventType.SETTINGS_LOADED);
        this.eventBroker.subscribe(this.onMapLoaded.bind(this), EventType.MAP_LOADED)
        
        return this;
    }

    initSettings(settings) {
        this.settings = settings;
    }

    onMapLoaded() {
        if (this.settings.DefaultMapProvider === 'google') {
            this.render();
            var autocomplete = new google.maps.places.Autocomplete(document.getElementById('searchTextField'),
                { strictBounds: true, componentRestrictions: { country: 'za' } });
            autocomplete.setFields(['address_components', 'geometry', 'formatted_address', 'place_id']);
            autocomplete.addListener('place_changed', () => this.handleGoogleLocationSelect(autocomplete));
        } else {
            this.$container.empty().append("<div class='menu-margins'>Please switch to Google Maps view to use this function</div>");
        }
    }

    handleGoogleLocationSelect(autocomplete) {
        // BEFORE CALLING GETPLACE(), TRY TO PULL ADDRESS FROM DB
        // var geoLocationModel = new GeoLocationModel(0, "23 Mcleod St, Stuart`s Hill, Cape Town, 7130, South Africa", -34.07411, 18.849649999999997, "", "{'address_components':[{'long_name':'23','short_name':'23','types':['street_number']},{'long_name':'Mcleod Street','short_name':'Mcleod St','types':['route']},{'long_name':'Stuart`s Hill','short_name':'Stuart`s Hill','types':['sublocality_level_2','sublocality','political']},{'long_name':'Cape Town','short_name':'Cape Town','types':['locality','political']},{'long_name':'Cape Town','short_name':'Cape Town','types':['administrative_area_level_2','political']},{'long_name':'Western Cape','short_name':'WC','types':['administrative_area_level_1','political']},{'long_name':'South Africa','short_name':'ZA','types':['country','political']},{'long_name':'7130','short_name':'7130','types':['postal_code']}],'formatted_address':'23 Mcleod St, Stuart`s Hill, Cape Town, 7130, South Africa','geometry':{'location':{'lat':-34.07411,'lng':18.849649999999997},'viewport':{'south':-34.0755363802915,'west':18.848422769708463,'north':-34.0728384197085,'east':18.85112073029154}},'place_id':'ChIJmQWUUXe1zR0R_oIhG7CV7DM','html_attributions':[]}");
        var googlePlace = autocomplete.getPlace();
        var googlePayload = JSON.stringify(googlePlace);
        var geoLocationModel = new GeoLocationModel(0, googlePlace.formatted_address,
            googlePlace.geometry.location.lat(),
            googlePlace.geometry.location.lng(),
            null,
            googlePayload);

        $.blockUI({ message: "<h2 class='loading-text'>Finding Location...</h2>" });        
        this.eventBroker.broadcast(EventType.FIND_LOCATION, geoLocationModel);
    }

    handleSearchW3W(words) {
        $.blockUI({ message: "<h2 class='loading-text'>Finding Location...</h2>" });
        this.eventBroker.broadcast(EventType.FIND_LOCATION, new GeoLocationModel(0, null, 0, 0, words, null));
    }

    content() {
        return `<div class='menu-margins'>
                    <img src='../../img/google_logo.jpg' class='menu-search-logo' />
                    <input id='searchTextField' type='search' class='search-box' />
                    <p />
                    <img src='../../img/w3w_logo.png' class='menu-search-logo' />
                    <input id='w3wSearchField' type='search' class='search-box' placeholder='Enter.three.words ...' />
                </div>`;
    }
}