
class LocationFinderMenuView {
    constructor(eventBroker) {
        this.$container = $('#locationFinderMenu');
        this.eventBroker = eventBroker;
        this.suburbsAutocompleteCallback = null;
        this.addressAutoCompleteCallback = null;
        this.sectionalTitleAutoCompleteCallback = null;

        this.attachHandlers()
            .attachEventSubscribers();
    }

    render() {
        this.$container.append(this.content());
        var context = this;
        var selectedSuburbId = 0;
        $("#localSuburbSearchTextField").autocomplete({
            minLength: 3,
            delay: 500,
            source: function (request, responseCallback) {
                var addressSearchModel = new AddressSearchModel(request.term, 0);
                context.eventBroker.broadcast(EventType.SEARCH_SUBURBS, addressSearchModel);
                context.suburbsAutocompleteCallback = responseCallback;
            },
            select: function (event, ui) {
                event.preventDefault();
                $(this).val(ui.item.label);
                selectedSuburbId = ui.item.value;
                $("#localAddressSearchTextField").val("").prop("disabled", false);
                $("#localSectionalTitleSearchTextField").val("").prop("disabled", false);
            },
            change: function (event, ui) {
                if (ui.item == null) {
                    $("#localAddressSearchTextField").val("").prop("disabled", true);
                    $("#localSectionalTitleSearchTextField").val("").prop("disabled", true);
                }
            }
        });

        $("#localAddressSearchTextField").autocomplete({
            minLength: 3,
            delay: 500,
            source: function (request, responseCallback) {
                var addressSearchModel = new AddressSearchModel(request.term, selectedSuburbId);
                context.eventBroker.broadcast(EventType.SEARCH_ADDRESSES, addressSearchModel);
                context.addressAutoCompleteCallback = responseCallback;
            },
            select: function (event, ui) {
                $.blockUI({ message: "<h2 class='loading-text'>Finding Location...</h2>" });     
                event.preventDefault();
                $(this).val(ui.item.label);
                var geoLocationModel = new GeoLocationModel(ui.item.value, '', 0, 0, null, null, null);
                context.eventBroker.broadcast(EventType.FIND_LOCATION, geoLocationModel);
            }
        });

        $("#localSectionalTitleSearchTextField").autocomplete({
            minLength: 3,
            delay: 500,
            source: function (request, responseCallback) {
                var addressSearchModel = new AddressSearchModel(request.term, selectedSuburbId);
                context.eventBroker.broadcast(EventType.SEARCH_SECTIONAL_TITLES, addressSearchModel);
                context.sectionalTitleAutoCompleteCallback = responseCallback;
            },
            select: function (event, ui) {
                $.blockUI({ message: "<h2 class='loading-text'>Finding Location...</h2>" });     
                event.preventDefault();
                $(this).val(ui.item.label);
                var geoLocationModel = new GeoLocationModel(ui.item.value, '', 0, 0, null, null, null);
                context.eventBroker.broadcast(EventType.FIND_LOCATION, geoLocationModel);
            }
        });

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
        this.eventBroker.subscribe(this.onMapLoaded.bind(this), EventType.MAP_LOADED);
        this.eventBroker.subscribe(this.onSuburbsRetrieved.bind(this), EventType.SUBURBS_RETRIEVED);
        this.eventBroker.subscribe(this.onAddressesRetrieved.bind(this), EventType.ADDRESSES_RETRIEVED);
        this.eventBroker.subscribe(this.onSectionalTitlesRetrieved.bind(this), EventType.SECTIONAL_TITLES_RETRIEVED);
        
        return this;
    }

    onMapLoaded() {
        var defaultMapProvider = localStorage.getItem('default-map');
        if (defaultMapProvider === 'google') {
            this.render();
            var autocomplete = new google.maps.places.Autocomplete(document.getElementById('googleSearchTextField'),
                { strictBounds: true, componentRestrictions: { country: 'za' } });
            autocomplete.setFields(['address_components', 'geometry', 'formatted_address', 'place_id']);
            autocomplete.addListener('place_changed', () => this.handleGoogleLocationSelect(autocomplete));
        } else {
            this.$container.empty().append("<div class='menu-margins'>Please switch to Google Maps view to use this function</div>");
        }
    }

    handleGoogleLocationSelect(autocomplete) {
        //var geoLocationModel = new GeoLocationModel(0, "23 Mcleod St, Stuart`s Hill, Cape Town, 7130, South Africa", -34.07411, 18.849649999999997, "", "{'address_components':[{'long_name':'23','short_name':'23','types':['street_number']},{'long_name':'Mcleod Street','short_name':'Mcleod St','types':['route']},{'long_name':'Stuart`s Hill','short_name':'Stuart`s Hill','types':['sublocality_level_2','sublocality','political']},{'long_name':'Cape Town','short_name':'Cape Town','types':['locality','political']},{'long_name':'Cape Town','short_name':'Cape Town','types':['administrative_area_level_2','political']},{'long_name':'Western Cape','short_name':'WC','types':['administrative_area_level_1','political']},{'long_name':'South Africa','short_name':'ZA','types':['country','political']},{'long_name':'7130','short_name':'7130','types':['postal_code']}],'formatted_address':'23 Mcleod St, Stuart`s Hill, Cape Town, 7130, South Africa','geometry':{'location':{'lat':-34.07411,'lng':18.849649999999997},'viewport':{'south':-34.0755363802915,'west':18.848422769708463,'north':-34.0728384197085,'east':18.85112073029154}},'place_id':'ChIJmQWUUXe1zR0R_oIhG7CV7DM','html_attributions':[]}", null, null);
        var googlePlace = autocomplete.getPlace();
        var googlePayload = JSON.stringify(googlePlace);
        var geoLocationModel = new GeoLocationModel(0, googlePlace.formatted_address,
            googlePlace.geometry.location.lat(),
            googlePlace.geometry.location.lng(),
            null,
            googlePayload,
         null);

        //$.blockUI({ message: "<h2 class='loading-text'>Finding Location...</h2>" });        
        //this.eventBroker.broadcast(EventType.FIND_LOCATION, geoLocationModel);
        this.eventBroker.broadcast(EventType.FIND_LOCATION_BY_PLACE_ID, geoLocationModel);
    }

    handleSearchW3W(words) {
        $.blockUI({ message: "<h2 class='loading-text'>Finding Location...</h2>" });
        this.eventBroker.broadcast(EventType.FIND_LOCATION, new GeoLocationModel(0, null, 0, 0, words, null, null));
    }

    onSuburbsRetrieved(suburbsList) {
        this.suburbsAutocompleteCallback(suburbsList);
    }

    onAddressesRetrieved(addressesList) {
        this.addressAutoCompleteCallback(addressesList);
    }

    onSectionalTitlesRetrieved(sectionalTitleList) {
        this.sectionalTitleAutoCompleteCallback(sectionalTitleList);
    }

    content() {
        return `<div class='menu-margins'>                                        
                    <p />
                    <img src='../../img/google_logo.jpg' class='menu-search-logo' />
                    <input id='googleSearchTextField' type='search' class='search-box' />
                    <p />                    
                </div>`;
    }
}