
const EventType = {
    // layer/drawing events
    BEFORE_SAVE_LAYER: 'BEFORE_SAVE_LAYER',
    SAVE_LAYER: 'SAVE_LAYER',
    LAYER_SAVED: 'LAYER_SAVED',
    CLICK_LAYER: 'CLICK_LAYER',
    SELECT_LAYER: 'SELECT_LAYER', 

    // map events
    MAP_LOADED: 'MAP_LOADED',

    // menu events
    LAYERS_LOADED: 'LAYERS_LOADED',
    AFTER_LAYERS_SHOWN: 'AFTER_LAYERS_SHOWN', 
    TOGGLE_LAYERS: 'TOGGLE_LAYERS',

    // settings
    BEFORE_SAVE_SETTINGS: 'BEFORE_SAVE_SETTINGS',
    SAVE_SETTINGS: 'SAVE_SETTINGS',
    SETTINGS_SAVED: 'SETTINGS_SAVED',
    LOAD_SETTINGS: 'LOAD_SETTINGS',
    SETTINGS_LOADED: 'SETTINGS_LOADED' 
}

class EventBroker {
    constructor() {
        this.subscribers = {
            BEFORE_SAVE_LAYER: [],
            SAVE_LAYER: [],
            LAYER_SAVED: [],
            CLICK_LAYER: [],
            SELECT_LAYER: [],

            MAP_LOADED: [],

            LAYERS_LOADED: [],
            AFTER_LAYERS_SHOWN: [],
            TOGGLE_LAYERS: [],

            BEFORE_SAVE_SETTINGS: [],
            SAVE_SETTINGS: [],
            SETTINGS_SAVED: [],
            LOAD_SETTINGS: [],
            SETTINGS_LOADED: []
        };
    }

    subscribe(fn, eventType) {
        this.subscribers[eventType].push(fn);
    }

    broadcast(eventType, args) {
        console.log(`${eventType} event broadcast by EventBroker`);
        var eventSubscribers = this.subscribers[eventType];
        for (var i = 0; i < eventSubscribers.length; i++) {
            eventSubscribers[i](args);
        }
    }
}