
// Use ordinality to indicate the order of execution for event subscribers
// If multiple subscribers require the same ordinality for a given event type, create a new event type instead
const Ordinality = {
    Highest: 1 // subscriber will be executed first [for this event type]
};

const EventType = {
    // layer/drawing events
    BEFORE_SAVE_LAYER: 'BEFORE_SAVE_LAYER',
    SAVE_LAYER: 'SAVE_LAYER',
    LAYER_SAVED: 'LAYER_SAVED',
    CLICK_LAYER: 'CLICK_LAYER',
    SELECT_LAYER: 'SELECT_LAYER',
    BEFORE_DELETE_LAYER: 'BEFORE_DELETE_LAYER',
    DELETE_LAYER: 'DELETE_LAYER',
    LAYER_DELETED: 'LAYER_DELETED',

    // map events
    MAP_LOADED: 'MAP_LOADED',
    PLOT_LOCATION: 'PLOT_LOCATION',

    // menu events
    LAYERS_LOADED: 'LAYERS_LOADED',
    AFTER_LAYERS_SHOWN: 'AFTER_LAYERS_SHOWN',
    TOGGLE_PUBLIC_LAYERS: 'TOGGLE_PUBLIC_LAYERS',
    TOGGLE_PRIVATE_LAYERS: 'TOGGLE_PRIVATE_LAYERS',
    TOGGLE_MENU: 'TOGGLE_MENU',
    LOAD_USER_TAGS: 'LOAD_USER_TAGS', 
    TAGS_LOADED: 'TAGS_LOADED',
    SAVE_TAGS: 'SAVE_TAGS', 
    TAGS_SAVED: 'TAGS_SAVED',

    // settings
    BEFORE_SAVE_SETTINGS: 'BEFORE_SAVE_SETTINGS',
    SAVE_SETTINGS: 'SAVE_SETTINGS',
    SETTINGS_SAVED: 'SETTINGS_SAVED',
    LOAD_SETTINGS: 'LOAD_SETTINGS',

    // search events
    FIND_LOCATION: 'FIND_LOCATION',
    SEARCH_SUBURBS: 'SEARCH_SUBURBS',
    SUBURBS_RETRIEVED: 'SUBURBS_RETRIEVED',
    SEARCH_ADDRESSES: 'SEARCH_ADDRESSES',
    ADDRESSES_RETRIEVED: 'ADDRESSES_RETRIEVED',
    SEARCH_SECTIONAL_TITLES: 'SEARCH_SECTIONAL_TITLES',
    SECTIONAL_TITLES_RETRIEVED: 'SECTIONAL_TITLES_RETRIEVED',
    FIND_3_WORDS: 'FIND_3_WORDS',
    W3W_RETRIEVED: 'W3W_RETRIEVED'
}

class EventBroker {
    constructor() {
        this.subscribers = {
            BEFORE_SAVE_LAYER: [],
            SAVE_LAYER: [],
            LAYER_SAVED: [],
            CLICK_LAYER: [],
            SELECT_LAYER: [],
            BEFORE_DELETE_LAYER: [],
            DELETE_LAYER: [],
            LAYER_DELETED: [],

            MAP_LOADED: [],            
            PLOT_LOCATION: [],

            LAYERS_LOADED: [],
            AFTER_LAYERS_SHOWN: [],
            TOGGLE_PUBLIC_LAYERS: [],
            TOGGLE_PRIVATE_LAYERS: [],
            TOGGLE_MENU: [],
            LOAD_USER_TAGS: [],
            TAGS_LOADED: [],
            SAVE_TAGS: [],
            TAGS_SAVED: [],

            BEFORE_SAVE_SETTINGS: [],
            SAVE_SETTINGS: [],
            SETTINGS_SAVED: [],
            LOAD_SETTINGS: [],

            FIND_LOCATION: [],
            SEARCH_SUBURBS: [],
            SUBURBS_RETRIEVED: [],
            SEARCH_ADDRESSES: [],
            ADDRESSES_RETRIEVED: [],
            SEARCH_SECTIONAL_TITLES: [],
            SECTIONAL_TITLES_RETRIEVED: [],
            FIND_3_WORDS: [],
            W3W_RETRIEVED: []
        };
    }

    subscribe(fn, eventType, ordinality) {
        var eventSubscribers = this.subscribers[eventType];
        if (ordinality && ordinality === Ordinality.Highest) {
            eventSubscribers.unshift(fn);
        } else
            eventSubscribers.push(fn);
    }

    unsubscribe(fn, eventType) {
        var eventSubscribers = this.subscribers[eventType];
        for (var i = 0; i < eventSubscribers.length; i++) {
            if (eventSubscribers[i].name === fn.name)
                eventSubscribers.splice(i, 1);
        }
    }

    broadcast(eventType, args) {
        console.log(`${eventType} event broadcast by EventBroker`);
        var eventSubscribers = this.subscribers[eventType];
        for (var i = 0; i < eventSubscribers.length; i++) {
            eventSubscribers[i](args);
        }
    }
}